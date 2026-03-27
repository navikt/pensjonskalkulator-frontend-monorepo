export function toRawValue(value: unknown): string {
	return typeof value === 'string' || typeof value === 'number'
		? String(value)
		: ''
}
