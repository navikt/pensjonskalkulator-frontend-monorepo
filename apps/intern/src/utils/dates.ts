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

const twoDigitYearTo4Digit = (yy: string): string => {
	const year = parseInt(yy, 10)
	const currentYear = new Date().getFullYear()
	const currentCentury = Math.floor(currentYear / 100) * 100
	const pivot = currentYear % 100
	return year <= pivot
		? `${currentCentury + year}`
		: `${currentCentury - 100 + year}`
}

const expandTwoDigitYear = (d: string): string => {
	if (/^\d{6}$/.test(d)) {
		return d.slice(0, 4) + twoDigitYearTo4Digit(d.slice(4))
	}
	return d.slice(0, -2) + twoDigitYearTo4Digit(d.slice(-2))
}

const DATE_PATTERNS: Array<{
	regex: RegExp
	prepare: (d: string) => string
	fmt: string
}> = [
	{ regex: /^\d{2}\.\d{2}\.\d{4}$/, prepare: (d) => d, fmt: 'dd.MM.yyyy' },
	{ regex: /^\d{8}$/, prepare: (d) => d, fmt: 'ddMMyyyy' },
	{ regex: /^\d{2}\/\d{2}\/\d{4}$/, prepare: (d) => d, fmt: 'dd/MM/yyyy' },
	{ regex: /^\d{2}-\d{2}-\d{4}$/, prepare: (d) => d, fmt: 'dd-MM-yyyy' },
	{ regex: /^\d{6}$/, prepare: expandTwoDigitYear, fmt: 'ddMMyyyy' },
	{
		regex: /^\d{2}\.\d{2}\.\d{2}$/,
		prepare: expandTwoDigitYear,
		fmt: 'dd.MM.yyyy',
	},
	{
		regex: /^\d{2}\/\d{2}\/\d{2}$/,
		prepare: expandTwoDigitYear,
		fmt: 'dd/MM/yyyy',
	},
	{
		regex: /^\d{2}-\d{2}-\d{2}$/,
		prepare: expandTwoDigitYear,
		fmt: 'dd-MM-yyyy',
	},
]

export function normalizeDateInput(
	d: string | null | undefined
): string | null {
	if (!d) return null
	for (const { regex, prepare, fmt } of DATE_PATTERNS) {
		if (regex.test(d)) {
			const parsed = parse(prepare(d), fmt, new Date())
			if (isValid(parsed)) {
				return format(parsed, DATE_ENDUSER_FORMAT)
			}
		}
	}
	return null
}
