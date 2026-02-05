import express, { NextFunction, Request, Response } from 'express'
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

const logger = winston.createLogger({
	format: isDevelopment ? winston.format.simple() : undefined,
	transports: [new winston.transports.Console()],
})

const unleash = initialize({
	disableAutoStart: !(unleashToken && unleashUrl && unleashEnv),
	url: `${unleashUrl}/api`,
	appName: 'pensjonskalkulator-frontend-intern',
	environment: unleashEnv,
	customHeaders: {
		Authorization: unleashToken ?? '',
	},
})

unleash.on('synchronized', () => {
	logger.info('Unleash synchronized')
})

const env = isDevelopment
	? { detaljertKalkulatorUrl: process.env.DETALJERT_KALKULATOR_URL ?? '' }
	: ensureEnv({
			detaljertKalkulatorUrl: 'DETALJERT_KALKULATOR_URL',
		})

// Saksbehandler app only uses Azure/Entra ID authentication
// In development, we can skip this check if ACCESS_TOKEN is set
if (!isDevelopment && !process.env.AZURE_OPENID_CONFIG_ISSUER) {
	throw new Error(
		'AZURE_OPENID_CONFIG_ISSUER must be set for saksbehandler authentication'
	)
}

const OBO_AUDIENCE = process.env.ENTRA_ID_OBO_SCOPE as string

const PORT = 8080
const PENSJONSKALKULATOR_BACKEND =
	process.env.PENSJONSKALKULATOR_BACKEND ?? 'http://localhost:8081'

const app = express()
const __dirname = process.cwd()

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
			const backendUrl = `${PENSJONSKALKULATOR_BACKEND}/api/status`
			logger.info(`Fetching status from backend: ${backendUrl}`)

			const res_status = await fetch(backendUrl, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'x_correlation-id': req.headers['x_correlation-id'] as string,
				},
			})

			const status_data = await res_status.json()
			logger.info(`Backend response: ${JSON.stringify(status_data)}`)
			res.send(status_data)
		} catch (error) {
			console.error('Error fetching status:', error)
			res.status(500).send({ error: 'Internal Server Error' })
		}
	}
)

// Feature toggle endpoint, trenger ikke autentisering
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

app.use(
	'/pensjon/kalkulator/redirect/detaljert-kalkulator',
	express.urlencoded({ extended: true }),
	async (req: Request, res: Response) => {
		const { fnr } = req.body
		const url = new URL(env.detaljertKalkulatorUrl)
		const loggedOnName = await getUsernameFromAzureToken(req)

		url.searchParams.append('_brukerId', fnr)
		url.searchParams.append('_loggedOnName', loggedOnName)
		res.redirect(url.toString())
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

// Serve src folder
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
		logger.info('DEVELOPMENT: Using ACCESS_TOKEN from environment')
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
		logger.info('DEVELOPMENT: Using ACCESS_TOKEN from environment')
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

app.get('/*splat', (_req: Request, res: Response) => {
	// In dev, server runs from dist/server/, index.html is in dist/
	// In prod (NAIS), both are in the same folder
	const indexPath = isDevelopment
		? path.join(__dirname, '..', 'index.html')
		: path.join(__dirname, 'index.html')
	return res.sendFile(indexPath)
})

app.listen(PORT, (error) => {
	if (error) {
		logger.error('Failed to start server', error)
		throw error
	}
	logger.info(
		`Server is running on http://localhost:${PORT} using Azure/Entra ID as auth provider (saksbehandler)`
	)
})
