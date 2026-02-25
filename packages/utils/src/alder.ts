import { isAfter, isBefore, isSameDay, parse } from 'date-fns'

import { DATE_BACKEND_FORMAT } from './dates'

export const isOvergangskull = (foedselsdato: string): boolean => {
	const DATE_START = new Date(1954, 0, 0)
	const DATE_STOP = new Date(1963, 0, 1)
	const parsedFoedselsdato = parse(
		foedselsdato,
		DATE_BACKEND_FORMAT,
		new Date()
	)
	return (
		isAfter(parsedFoedselsdato, DATE_START) &&
		isBefore(parsedFoedselsdato, DATE_STOP)
	)
}

export const isFoedtEtter1963 = (
	foedselsdato: string | undefined | null
): boolean | null => {
	if (!foedselsdato) {
		return null
	}
	const FIRST_DAY_1963 = new Date(1963, 0, 1)
	return (
		isAfter(new Date(foedselsdato), FIRST_DAY_1963) ||
		isSameDay(new Date(foedselsdato), FIRST_DAY_1963)
	)
}
