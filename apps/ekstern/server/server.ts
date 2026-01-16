import { isBefore, isSameDay } from 'date-fns'
import express, { NextFunction, Request, Response } from 'express'
import promBundle from 'express-prom-bundle'
import { createProxyMiddleware } from 'http-proxy-middleware'
import path from 'path'
import { initialize } from 'unleash-client'
import winston from 'winston'

import {
  getToken,
  parseAzureUserToken,
  requestOboToken,
  validateToken,
} from '@navikt/oasis'

import { ensureEnv } from './ensureEnv.js'

const isDevelopment = process.env.NODE_ENV?.startsWith('development')
const unleashUrl = process.env.UNLEASH_SERVER_API_URL
const unleashToken = process.env.UNLEASH_SERVER_API_TOKEN
const unleashEnv = process.env.UNLEASH_SERVER_API_ENV

const metricsMiddleware = promBundle({ includeMethod: true })

const logger = winston.createLogger({
  format: isDevelopment ? winston.format.simple() : undefined,
  transports: [new winston.transports.Console()],
})

const env = ensureEnv({
  detaljertKalkulatorUrl: 'DETALJERT_KALKULATOR_URL',
})

// const isFoedtFoer1963 = (foedselsdato: string): boolean => {
//   const LAST_DAY_1962 = new Date(1962, 11, 31)
//   return (
//     isBefore(new Date(foedselsdato), LAST_DAY_1962) ||
//     isSameDay(new Date(foedselsdato), LAST_DAY_1962)
//   )
// }

const unleash = initialize({
  disableAutoStart: !(unleashToken && unleashUrl && unleashEnv),
  url: `${unleashUrl}/api`,
  appName: 'pensjonskalkulator-frontend',
  environment: unleashEnv,
  customHeaders: {
    Authorization: unleashToken ?? '',
  },
})

unleash.on('synchronized', () => {
  logger.info('Unleash synchronized')
})

const AUTH_PROVIDER = (() => {
  const idporten: boolean = !!process.env.TOKEN_X_ISSUER
  const azure: boolean = !!process.env.AZURE_OPENID_CONFIG_ISSUER
  if (idporten && azure) {
    throw new Error(
      'Both TOKEN_X_ISSUER (idporten) and AZURE_OPENID_CONFIG_ISSUER are set. Only one of these can be set.'
    )
  }

  if (idporten) {
    return 'idporten'
  }

  if (azure) {
    return 'azure'
  }

  throw new Error('No auth provider is set')
})()

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

const addCorrelationId = (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers['x_correlation-id']) {
    req.headers['x_correlation-id'] = crypto.randomUUID()
  }
  next()
}

app.use(addCorrelationId)

// Kubernetes probes
app.get('/internal/health/liveness', (_req: Request, res: Response) => {
  res.sendStatus(200)
})

app.get('/internal/health/readiness', (_req: Request, res: Response) => {
  res.sendStatus(200)
})

// Status probes from backend, trenger ikke autentisering
app.get(
  '/pensjon/kalkulator/api/status',
  async (req: Request, res: Response) => {
    try {
      const res_status = await fetch(
        `${PENSJONSKALKULATOR_BACKEND}/api/status`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x_correlation-id': req.headers['x_correlation-id'] as string,
          },
        }
      )

      const status_data = await res_status.json()
      res.send(status_data)
    } catch (error) {
      console.error('Error fetching status:', error)
      res.status(500).send({ error: 'Internal Server Error' })
    }
  }
)

// Unntak for feature toggle, trenger ikke autentisering
app.get(
  '/pensjon/kalkulator/api/feature/:toggle',
  async (req: Request<{ toggle: string }>, res: Response) => {
    const toggle = req.params.toggle

    res.send({
      enabled: unleash.isEnabled(toggle),
    })
  }
)

app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    const logMetadata = {
      url: req.originalUrl,
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

app.use((req, res, next) => {
  if (unleash.isEnabled('g-regulering')) {
    return res.redirect(307, 'https://stengt-for-g-regulering.nav.no')
  } else {
    return next()
  }
})

app.use(
  '/pensjon/kalkulator/redirect/detaljert-kalkulator',
  express.urlencoded({ extended: true }),
  async (req: Request, res: Response) => {
    if (AUTH_PROVIDER === 'idporten') {
      res.redirect(`${env.detaljertKalkulatorUrl}`)
      return
    } else if (AUTH_PROVIDER === 'azure') {
      const { fnr } = req.body
      const url = new URL(env.detaljertKalkulatorUrl)
      const loggedOnName = await getUsernameFromAzureToken(req)

      url.searchParams.append('_brukerId', fnr)
      url.searchParams.append('_loggedOnName', loggedOnName)
      res.redirect(url.toString())
      return
    }
  }
)

// Server hele assets mappen uten autentisering
app.use(
  '/pensjon/kalkulator/assets',
  (req: Request, res: Response, next: NextFunction) => {
    const assetFolder = path.join(__dirname, 'assets')
    return express.static(assetFolder)(req, res, next)
  }
)

// Dunno, nais.js. Vet ikke hva den gjør
app.use(
  '/pensjon/kalkulator/src',
  (req: Request, res: Response, next: NextFunction) => {
    const srcFolder = path.join(__dirname, 'src')
    return express.static(srcFolder)(req, res, next)
  }
)

const getUsernameFromAzureToken = async (req: Request) => {
  let token = getToken(req)

  if (isDevelopment && process.env.ACCESS_TOKEN) {
    logger.error('DEVELOPMENT: Using ACCESS_TOKEN from environment')
    token = process.env.ACCESS_TOKEN
  }

  if (!token) {
    logger.info('No token found in request', {
      'x_correlation-id': req.headers['x_correlation-id'],
    })
    throw new Error('403')
  }
  const parse = parseAzureUserToken(token)

  if (!parse.ok) {
    logger.error('Failed to parse Azure token', {
      'x_correlation-id': req.headers['x_correlation-id'],
    })
    throw new Error('403')
  }

  return parse.name
}

const getOboToken = async (req: Request) => {
  if (isDevelopment && process.env.ACCESS_TOKEN) {
    logger.error('DEVELOPMENT: Using ACCESS_TOKEN from environment')
    return process.env.ACCESS_TOKEN
  }

  const token = getToken(req)
  if (!token) {
    logger.info('No token found in request', {
      'x_correlation-id': req.headers['x_correlation-id'],
    })
    throw new Error('403')
  }

  const validationResult = await validateToken(token)
  if (!validationResult.ok) {
    logger.error('Failed to validate token', {
      error: validationResult.error.message,
      errorType: validationResult.errorType,
      'x_correlation-id': req.headers['x_correlation-id'],
    })
    throw new Error('401')
  }

  const obo = await requestOboToken(token, OBO_AUDIENCE)
  if (!obo.ok) {
    logger.error('Failed to get OBO token', {
      error: obo.error.message,
      'x_correlation-id': req.headers['x_correlation-id'],
    })
    throw new Error('401')
  }
  return obo.token
}

// Proxy til backend med token exchange
app.use(
  '/pensjon/kalkulator/api',
  async (req: Request, res: Response, next: NextFunction) => {
    let oboToken: string
    try {
      oboToken = await getOboToken(req)
    } catch {
      // Send 401 dersom man ikke kan hente obo token
      res.sendStatus(401)
      return
    }

    createProxyMiddleware({
      target: `${PENSJONSKALKULATOR_BACKEND}/api`,
      changeOrigin: true,
      headers: {
        Authorization: `Bearer ${oboToken}`,
      },
      logger: logger,
    })(req, res, next)
  }
)

app.use(
  '/pensjon/kalkulator/v3/api-docs',
  createProxyMiddleware({
    target: `${PENSJONSKALKULATOR_BACKEND}/v3/api-docs`,
    changeOrigin: true,
    logger: logger,
  })
)

// For alle andre endepunkt svar med /veileder/veileder.html (siden vi bruker react-router)
app.get(
  '/pensjon/kalkulator/veileder{/*splat}',
  (_req: Request, res: Response) => {
    if (AUTH_PROVIDER === 'azure') {
      return res.sendFile(__dirname + '/veileder/index.html')
    } else {
      return res.redirect('/pensjon/kalkulator')
    }
  }
)

app.get('/*splat', async (_req: Request, res: Response) => {
  if (AUTH_PROVIDER === 'idporten') {
    res.sendFile(__dirname + '/index.html')
    return
  } else if (AUTH_PROVIDER === 'azure') {
    res.redirect('/pensjon/kalkulator/veileder')
    return
  }
})

app.listen(PORT, (error) => {
  if (error) {
    logger.error('Failed to start server', error)
    throw error
  }
  logger.info(
    `Server is running on http://localhost:${PORT} using ${AUTH_PROVIDER} as auth provider`
  )
})
