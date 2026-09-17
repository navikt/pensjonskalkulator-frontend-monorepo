export const TILGANGSNEKT_MESSAGE_PREFIX = 'Tilgang nektet pga'

export interface TilgangsnektResponse {
	message: string
	error?: string
}

export const isTilgangsnektResponse = (
	data?: unknown
): data is TilgangsnektResponse => {
	if (typeof data !== 'object' || data === null) {
		return false
	}

	const { message, error } = data as Record<string, unknown>

	return (
		typeof message === 'string' &&
		message.includes(TILGANGSNEKT_MESSAGE_PREFIX) &&
		(typeof error === 'string' || error === undefined)
	)
}
