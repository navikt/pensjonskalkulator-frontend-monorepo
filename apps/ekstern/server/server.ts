import path from 'path'

import { ecsFormat } from '@elastic/ecs-winston-format'
import { getToken, requestOboToken, validateToken } from '@navikt/oasis'
import express from 'express'
import promBundle from 'express-prom-bundle'
import { createProxyMiddleware } from 'http-proxy-middleware'
import winston from 'winston'

const metricsMiddleware = promBundle({ includeMethod: true })

const logger = winston.createLogger({
  format: ecsFormat({
    convertReqRes: true,
  }),
  transports: [new winston.transports.Console()],
})

const AUTH_PROVIDER = (() => {
  const idporten: boolean = !!process.env.IDPORTEN_ISSUER
  const azure: boolean = !!process.env.AZURE_OPENID_CONFIG_ISSUER
  if (idporten && azure) {
    throw new Error(
      'Both IDPORTEN_ISSUER and AZURE_OPENID_CONFIG_ISSUER are set. Only one of these can be set.'
    )
  }

  if (!idporten && !azure) {
    throw new Error('No auth provider is set')
  }

  if (idporten) {
    return 'idporten'
  }

  if (azure) {
    return 'azure'
  }
})() as 'idporten' | 'azure'

// TokenX is needed for token exchange from idporten to Nav token
if (AUTH_PROVIDER === 'idporten' && !process.env.TOKEN_X_ISSUER) {
  throw Error('Missing TOKEN_X_ISSUER')
}

const OBO_AUDIENCE = (() => {
  if (AUTH_PROVIDER === 'idporten') {
    return process.env.TOKEN_X_OBO_AUDIENCE
  } else if (AUTH_PROVIDER === 'azure') {
    return process.env.ENTRA_ID_OBO_SCOPE
  }
})() as string

const PORT = 8080
const PENSJONSKALKULATOR_BACKEND =
  process.env.PENSJONSKALKULATOR_BACKEND ?? 'http://localhost:8081'

const app = express()
const __dirname = process.cwd()

app.use(metricsMiddleware)
app.use((req, _res, next) => {
  if (!req.headers['x_correlation-id']) {
    req.headers['x_correlation-id'] = crypto.randomUUID()
  }
  next()
})

app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    const logMetadata = {
      url: req.url,
      method: req.method,
      duration,
      statusCode: res.statusCode,
      'x_correlation-id': req.headers['x_correlation-id'],
    }

    const logMessage = `${req.method} ${req.path} ${res.statusCode}`
    if (res.statusCode >= 400) {
      logger.error(logMessage, logMetadata)
    } else {
      logger.info(logMessage, logMetadata)
    }
  })
  next()
})
// Server hele assets mappen uten autentisering
app.use('/pensjon/kalkulator/assets', (req, res, next) => {
  const assetFolder = path.join(__dirname, 'assets')
  return express.static(assetFolder)(req, res, next)
})

// Dunno, nais.js. Vet ikke hva den gjør
app.use('/pensjon/kalkulator/src', (req, res, next) => {
  const srcFolder = path.join(__dirname, 'src')
  return express.static(srcFolder)(req, res, next)
})

// Proxy til backend med token exchange
app.use('/pensjon/kalkulator/api', async (req, res, next) => {
  const token = getToken(req)
  if (!token) {
    logger.info('No token found in request', {
      'x_correlation-id': req.headers['x_correlation-id'],
    })
    return res.sendStatus(403)
  }
  const validationResult = await validateToken(token)
  if (!validationResult.ok) {
    logger.error('Failed to validate token', {
      error: validationResult.error.message,
      errorType: validationResult.errorType,
      'x_correlation-id': req.headers['x_correlation-id'],
    })
    return res.sendStatus(401)
  }

  const obo = await requestOboToken(token, OBO_AUDIENCE)
  if (!obo.ok) {
    logger.error('Failed to get OBO token', {
      error: obo.error.message,
      'x_correlation-id': req.headers['x_correlation-id'],
    })
    return res.sendStatus(401)
  }

  return createProxyMiddleware({
    target: `${PENSJONSKALKULATOR_BACKEND}/api`,
    headers: {
      Authorization: `Bearer ${obo.token}`,
    },
    logger: logger,
  })(req, res, next)
})

app.use(
  '/pensjon/kalkulator/v3/api-docs',
  createProxyMiddleware({
    target: `${PENSJONSKALKULATOR_BACKEND}/v3/api-docs`,
    logger: logger,
  })
)

// Kubernetes probes
app.get('/internal/health/liveness', (_req, res) => {
  return res.sendStatus(200)
})

app.get('/internal/health/ready', (_req, res) => {
  return res.sendStatus(200)
})

// For alle andre endepunkt svar med /veileder/veileder.html (siden vi bruker react-router)
app.get('/pensjon/kalkulator/veileder?*', (_req, res) => {
  if (AUTH_PROVIDER === 'azure') {
    return res.sendFile(__dirname + '/index-veileder.html')
  } else {
    return res.redirect('/pensjon/kalkulator')
  }
})

app.get('*', (_req, res) => {
  if (AUTH_PROVIDER === 'idporten') {
    return res.sendFile(__dirname + '/index.html')
  } else if (AUTH_PROVIDER === 'azure') {
    return res.redirect('/pensjon/kalkulator/veileder')
  }
})

app.listen(PORT, () => {
  logger.info(
    `Server is running on http://localhost:${PORT} using ${AUTH_PROVIDER} as auth provider`
  )
})
