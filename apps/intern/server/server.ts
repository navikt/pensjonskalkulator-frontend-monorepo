import express, { Request, Response } from 'express'
import path from 'path'

const PORT = 8080
const app = express()
const __dirname = process.cwd()

// Kubernetes probes
app.get('/internal/health/liveness', (_req: Request, res: Response) => {
	res.sendStatus(200)
})

app.get('/internal/health/readiness', (_req: Request, res: Response) => {
	res.sendStatus(200)
})

// Serve built assets (from dist copied to /app)
const distFolder = __dirname
app.use('/assets', express.static(path.join(distFolder, 'assets')))

// Fallback: serve index.html for SPA routes
app.get(/.*/, (_req: Request, res: Response) => {
	res.sendFile(path.join(distFolder, 'index.html'))
})

app.listen(PORT, (error?: unknown) => {
	if (error) {
		console.error('Failed to start intern server', error)
		process.exit(1)
	}

	console.log(`Intern server running on http://localhost:${PORT}`)
})
