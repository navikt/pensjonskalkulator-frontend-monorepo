import { DATE_ENDUSER_FORMAT } from '@pensjonskalkulator-frontend-monorepo/utils/dates'
import { format, isValid, parse } from 'date-fns'

export function formatEndUserDate(date: Date): string {
	return format(date, DATE_ENDUSER_FORMAT)
}

export function parseEndUserDate(value: string): Date
export function parseEndUserDate(
	value: string | null | undefined
): Date | undefined
export function parseEndUserDate(
	value: string | null | undefined
): Date | undefined {
	if (!value) return undefined
	const date = parse(value, DATE_ENDUSER_FORMAT, new Date())
	return isValid(date) ? date : undefined
}

export function parseStrictEndUserDate(value: unknown): Date | undefined {
	if (typeof value !== 'string') return undefined
	if (!/^\d{2}\.\d{2}\.\d{4}$/.test(value)) return undefined

	const date = parseEndUserDate(value)
	return date && formatEndUserDate(date) === value ? date : undefined
}
