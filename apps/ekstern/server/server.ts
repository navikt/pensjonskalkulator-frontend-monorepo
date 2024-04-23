import path from 'path'

import { getToken, requestOboToken, validateToken } from '@navikt/oasis'
import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'

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

const OBO_ISSUER = (() => {
  if (AUTH_PROVIDER === 'idporten') {
    return process.env.IDPORTEN_OBO_ISSUER
  } else if (AUTH_PROVIDER === 'azure') {
    return process.env.AZURE_OBO_ISSUER
  }
})() as string

const PORT = 8080
const PENSJONSKALKULATOR_BACKEND =
  process.env.PENSJONSKALKULATOR_BACKEND ?? 'http://localhost:8081/api'

const app = express()
const __dirname = process.cwd()

// Server hele assets mappen uten autentisering
app.use('/pensjon/kalkulator/assets', (req, res, next) => {
  console.log('Serving assets')
  const assetFolder = path.join(__dirname, 'assets')
  return express.static(assetFolder)(req, res, next)
})

// Dunno, nais.js. Vet ikke hva den gjør
app.use('/pensjon/kalkulator/src', (req, res, next) => {
  console.log('Serving src')
  const srcFolder = path.join(__dirname, 'src')
  return express.static(srcFolder)(req, res, next)
})

// Proxy til backend med token exchange
app.use('/pensjon/kalkulator/api', async (req, res, next) => {
  const token = getToken(req)
  if (!token) {
    console.log('No token')
    return res.sendStatus(403)
  }
  const validationResult = await validateToken(token)
  if (!validationResult.ok) {
    console.log('Token validation failed')
    console.log(validationResult.error)
    return res.sendStatus(401)
  }

  console.log('AUTH_PROVIDER', AUTH_PROVIDER)
  console.log('OBO_ISSUER', OBO_ISSUER)
  const obo = await requestOboToken(token, OBO_ISSUER)
  if (!obo.ok) {
    console.log('OBO request failed')
    console.log(obo.error)
    return res.sendStatus(401)
  }

  console.log('Everything is fine, proxying to backend')

  return createProxyMiddleware({
    target: PENSJONSKALKULATOR_BACKEND,
    headers: {
      Authorization: `Bearer ${obo.token}`,
    },
    logger: console,
  })(req, res, next)
})

// Kubernetes probes
app.get('/internal/health/liveness', (req, res) => {
  res.sendStatus(200)
})

app.get('/internal/health/ready', (req, res) => {
  res.sendStatus(200)
})

// For alle andre endepunkt svar med *.html (siden vi bruker react-router)
app.use('*', async (req, res, next) => {
  if (AUTH_PROVIDER === 'idporten') {
    return express.static(__dirname + '/index.html')(req, res, next)
  } else if (AUTH_PROVIDER === 'azure') {
    return express.static(__dirname + '/veileder.html')(req, res, next)
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
