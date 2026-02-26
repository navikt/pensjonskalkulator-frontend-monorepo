export class ApiError extends Error {
	status: number
	statusText: string

	constructor(message: string, status: number, statusText: string) {
		super(message)
		this.name = 'ApiError'
		this.status = status
		this.statusText = statusText
		Object.setPrototypeOf(this, ApiError.prototype)
	}

	isUnauthorized(): boolean {
		return this.status === 401 || this.status === 403
	}

	isServerError(): boolean {
		return this.status >= 500
	}

	isClientError(): boolean {
		return this.status >= 400 && this.status < 500
	}
}

export class ValidationError extends Error {
	field?: string

	constructor(message: string, field?: string) {
		super(message)
		this.name = 'ValidationError'
		this.field = field
		Object.setPrototypeOf(this, ValidationError.prototype)
	}
}

export class DecryptionError extends ApiError {
	constructor(status: number, statusText: string) {
		super('Failed to decrypt pid', status, statusText)
		this.name = 'DecryptionError'
		Object.setPrototypeOf(this, DecryptionError.prototype)
	}
}

export class PersonFetchError extends ApiError {
	constructor(status: number, statusText: string) {
		super('Failed to fetch person data', status, statusText)
		this.name = 'PersonFetchError'
		Object.setPrototypeOf(this, PersonFetchError.prototype)
	}
}

export class BeregningError extends ApiError {
	constructor(status: number, statusText: string) {
		super('Failed to calculate pension', status, statusText)
		this.name = 'BeregningError'
		Object.setPrototypeOf(this, BeregningError.prototype)
	}
}

export class VedtakError extends ApiError {
	constructor(status: number, statusText: string) {
		super('Failed to fetch ongoing decisions', status, statusText)
		this.name = 'VedtakError'
		Object.setPrototypeOf(this, VedtakError.prototype)
	}
}
