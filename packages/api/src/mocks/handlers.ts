import { HttpResponse, delay, http } from 'msw'

import loependeVedtakResponse from './data/loepende-vedtak.json'
import personResponse from './data/person.json'

const DEFAULT_DELAY = 30

export interface HandlerOptions {
	baseUrl: string
	delayMs?: number
}

export const getHandlers = ({
	baseUrl,
	delayMs = DEFAULT_DELAY,
}: HandlerOptions) => [
	http.get(`${baseUrl}/v6/person`, async ({ request }) => {
		await delay(delayMs)

		const fnr = request.headers.get('fnr')
		if (fnr === '40100000000') {
			return HttpResponse.json({}, { status: 401 })
		} else if (fnr === '40300000001') {
			return HttpResponse.json(
				{ reason: 'INVALID_REPRESENTASJON' },
				{ status: 403 }
			)
		} else if (fnr === '40300000002') {
			return HttpResponse.json(
				{ reason: 'INSUFFICIENT_LEVEL_OF_ASSURANCE' },
				{ status: 403 }
			)
		} else if (fnr === '40400000000') {
			return HttpResponse.json({}, { status: 404 })
		}

		return HttpResponse.json(personResponse)
	}),

	http.get(`${baseUrl}/v4/vedtak/loepende-vedtak`, async () => {
		await delay(delayMs)
		return HttpResponse.json(loependeVedtakResponse)
	}),
]

export { loependeVedtakResponse, personResponse }
