import { isValid, parse } from 'date-fns'

export const DATE_BACKEND_FORMAT = 'yyyy-MM-dd'
export const DATE_ENDUSER_FORMAT = 'dd.MM.yyyy'

const MAANEDER = [
	'januar',
	'februar',
	'mars',
	'april',
	'mai',
	'juni',
	'juli',
	'august',
	'september',
	'oktober',
	'november',
	'desember',
]

/** Norsk månedsnavn for kalendermåned 1–12 (1 = januar) */
export const getMaanedNavn = (kalendermaaned: number): string | undefined =>
	MAANEDER[kalendermaaned - 1]

export const validateDateEndUserFormat = (
	d: string | null | undefined
): boolean => {
	if (!d) return false
	const date = parse(d, 'dd.MM.yyyy', new Date())
	return isValid(date)
}
