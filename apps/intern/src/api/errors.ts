function apiError(
	name: string,
	message: string,
	status: number,
	statusText: string
): Error {
	const error = new Error(`${message}: ${status} ${statusText}`)
	error.name = name
	return error
}

export const DecryptionError = (status: number, statusText: string) =>
	apiError('DecryptionError', 'Failed to decrypt pid', status, statusText)

export const PersonFetchError = (status: number, statusText: string) =>
	apiError(
		'PersonFetchError',
		'Failed to fetch person data',
		status,
		statusText
	)

export const BeregningError = (status: number, statusText: string) =>
	apiError('BeregningError', 'Failed to calculate pension', status, statusText)

export const VedtakError = (status: number, statusText: string) =>
	apiError(
		'VedtakError',
		'Failed to fetch ongoing decisions',
		status,
		statusText
	)
