export const getHost = (mode: string) =>
	mode === 'test' ? 'http://localhost:8088' : ''

export const DEFAULT_BASE_URL = '/pensjon/kalkulator'
export const DEFAULT_API_PATH = `${DEFAULT_BASE_URL}/api`

export const getApiBaseUrl = (mode: string = 'development') =>
	`${getHost(mode)}${DEFAULT_API_PATH}`

export const getHostBaseUrl = (mode: string = 'development') =>
	`${getHost(mode)}${DEFAULT_BASE_URL}`
