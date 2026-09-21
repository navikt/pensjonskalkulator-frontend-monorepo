export const TILGANGSNEKT_TYPE = 'TILGANGSNEKT'

export interface TilgangsnektResponse {
	type: string
	detail?: string
}

export const isTilgangsnektResponse = (
	data?: unknown
): data is TilgangsnektResponse => {
	if (typeof data !== 'object' || data === null) {
		return false
	}

	const { type, detail } = data as Record<string, unknown>

	return (
		typeof type === 'string' &&
		type === TILGANGSNEKT_TYPE &&
		(typeof detail === 'string' || detail === undefined)
	)
}
