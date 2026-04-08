import {
	DATE_BACKEND_FORMAT,
	DATE_ENDUSER_FORMAT,
	validateDateEndUserFormat,
} from '@pensjonskalkulator-frontend-monorepo/utils/dates'
import landListData from '@pensjonskalkulator-frontend-monorepo/utils/land-list'
import { addYears, areIntervalsOverlapping, isBefore, parse } from 'date-fns'

import type {
	LandDetails,
	OppholdDateFields,
	OppholdField,
	OppholdLabelFields,
	OppholdValues,
} from './types'

export type UtenlandsoppholdValidationField =
	| 'land'
	| 'arbeidetUtenlands'
	| 'startdato'
	| 'sluttdato'

export type UtenlandsoppholdValidationCode =
	| 'land-required'
	| 'arbeidet-utenlands-required'
	| 'startdato-required'
	| 'date-format'
	| 'startdato-before-foedselsdato'
	| 'date-after-max'
	| 'sluttdato-before-startdato'
	| 'overlap-non-avtaleland'
	| 'overlap-different-land'
	| 'overlap-same-bostatus'
	| 'overlap-same-jobbstatus'

export type UtenlandsperiodeValidationInput = {
	id?: string
	landkode: string
	arbeidetUtenlands?: boolean | null
	startdato: string
	sluttdato?: string
}

export type UtenlandsoppholdValidationResult = {
	isValid: boolean
	errors: Partial<
		Record<UtenlandsoppholdValidationField, UtenlandsoppholdValidationCode>
	>
	overlap?: {
		landkode: string
		periodestart: string
		periodeslutt: string
	}
}

type OverlapDetails = UtenlandsoppholdValidationResult['overlap']
type OppholdValidationErrors = UtenlandsoppholdValidationResult['errors']

export const emptyOpphold: OppholdValues = {
	land: '',
	arbeidetUtenlands: null,
	startdato: '',
	sluttdato: '',
	brukFoedselsdato: false,
}

export const landList = landListData as LandDetails[]

export const getLandDetails = (landkode: string) =>
	landList.find((l) => l.landkode === landkode)

export const isAvtaleland = (landkode: string) =>
	getLandDetails(landkode)?.kravOmArbeid === true

const parseEndUserDate = (value: string) =>
	parse(value, DATE_ENDUSER_FORMAT, new Date())

const parseBackendDate = (value: string) =>
	parse(value, DATE_BACKEND_FORMAT, new Date())

const getMaxOppholdDate = (foedselsdato?: string) =>
	foedselsdato ? addYears(parseBackendDate(foedselsdato), 100) : undefined

const hasErrors = (errors: OppholdValidationErrors) =>
	Object.values(errors).some(Boolean)

const getStartdatoError = (
	startdato: string,
	foedselsdato?: string
): UtenlandsoppholdValidationCode | undefined => {
	if (!startdato) {
		return 'startdato-required'
	}

	if (!validateDateEndUserFormat(startdato)) {
		return 'date-format'
	}

	if (
		foedselsdato &&
		isBefore(parseEndUserDate(startdato), parseBackendDate(foedselsdato))
	) {
		return 'startdato-before-foedselsdato'
	}

	const maxOppholdDate = getMaxOppholdDate(foedselsdato)

	if (maxOppholdDate && isBefore(maxOppholdDate, parseEndUserDate(startdato))) {
		return 'date-after-max'
	}

	return undefined
}

const getSluttdatoError = ({
	startdato,
	sluttdato,
	foedselsdato,
}: {
	startdato: string
	sluttdato?: string
	foedselsdato?: string
}): UtenlandsoppholdValidationCode | undefined => {
	if (!sluttdato) {
		return undefined
	}

	if (!validateDateEndUserFormat(sluttdato)) {
		return 'date-format'
	}

	if (
		validateDateEndUserFormat(startdato) &&
		isBefore(parseEndUserDate(sluttdato), parseEndUserDate(startdato))
	) {
		return 'sluttdato-before-startdato'
	}

	const maxOppholdDate = getMaxOppholdDate(foedselsdato)

	if (maxOppholdDate && isBefore(maxOppholdDate, parseEndUserDate(sluttdato))) {
		return 'date-after-max'
	}

	return undefined
}

const getCurrentInterval = (opphold: OppholdValues, foedselsdato: string) => ({
	start: parseEndUserDate(opphold.startdato),
	end: opphold.sluttdato
		? parseEndUserDate(opphold.sluttdato)
		: getMaxOppholdDate(foedselsdato)!,
})

const getPeriodInterval = (
	utenlandsperiode: UtenlandsperiodeValidationInput,
	foedselsdato: string
) => ({
	start: parseEndUserDate(utenlandsperiode.startdato),
	end: utenlandsperiode.sluttdato
		? parseEndUserDate(utenlandsperiode.sluttdato)
		: getMaxOppholdDate(foedselsdato)!,
})

const getOverlapValidationResult = ({
	opphold,
	foedselsdato,
	utenlandsperiodeId,
	utenlandsperioder,
}: {
	opphold: OppholdValues
	foedselsdato: string
	utenlandsperiodeId?: string
	utenlandsperioder: UtenlandsperiodeValidationInput[]
}): UtenlandsoppholdValidationResult | undefined => {
	const currentInterval = getCurrentInterval(opphold, foedselsdato)

	for (const utenlandsperiode of utenlandsperioder) {
		if (utenlandsperiode.id === utenlandsperiodeId) {
			continue
		}

		if (
			!areIntervalsOverlapping(
				currentInterval,
				getPeriodInterval(utenlandsperiode, foedselsdato)
			)
		) {
			continue
		}

		const overlap = {
			landkode: utenlandsperiode.landkode,
			periodestart: utenlandsperiode.startdato,
			periodeslutt: utenlandsperiode.sluttdato ?? '',
		}

		if (!isAvtaleland(utenlandsperiode.landkode)) {
			return {
				isValid: false,
				errors: { startdato: 'overlap-non-avtaleland' },
				overlap,
			}
		}

		if (utenlandsperiode.landkode !== opphold.land) {
			return {
				isValid: false,
				errors: { land: 'overlap-different-land' },
				overlap,
			}
		}

		if (
			opphold.arbeidetUtenlands === false &&
			!utenlandsperiode.arbeidetUtenlands
		) {
			return {
				isValid: false,
				errors: { arbeidetUtenlands: 'overlap-same-bostatus' },
				overlap,
			}
		}

		if (
			opphold.arbeidetUtenlands === true &&
			utenlandsperiode.arbeidetUtenlands
		) {
			return {
				isValid: false,
				errors: { arbeidetUtenlands: 'overlap-same-jobbstatus' },
				overlap,
			}
		}
	}

	return undefined
}

export const getOppholdFieldName = <T extends OppholdField>(
	index: number,
	field: T
) => `utenlandsOpphold.${index}.${field}` as const

export const getOppholdLabels = (opphold: OppholdLabelFields) => {
	const labels: string[] = []
	const isVarigOpphold = Boolean(opphold.startdato && !opphold.sluttdato)

	if (isVarigOpphold) {
		labels.push('Varig opphold')
	}

	if (opphold.arbeidetUtenlands === true) {
		labels.push(isVarigOpphold ? 'jobbet' : 'Jobbet')
	}

	return labels
}

export const getOppholdDateText = (opphold: OppholdDateFields) => {
	if (opphold.startdato && opphold.sluttdato) {
		return `${opphold.startdato}-${opphold.sluttdato}`
	}

	return opphold.startdato
}

export const getOppholdSummaryText = (opphold: OppholdLabelFields) => {
	const dateText = getOppholdDateText(opphold)
	const labels = getOppholdLabels(opphold)
	const labelText = labels.length > 0 ? `(${labels.join(', ')})` : ''
	const summaryText = [dateText, labelText].filter(Boolean).join(' ')

	return summaryText ? ` ${summaryText}` : ''
}

export const getOppholdCopyText = (oppholdList: OppholdValues[]) =>
	oppholdList
		.map((opphold) => {
			const landDetails = getLandDetails(opphold.land)
			const etiketter: string[] = []
			let periodeTekst = ''

			if (opphold.startdato && opphold.sluttdato) {
				periodeTekst = `${opphold.startdato}-${opphold.sluttdato}`
			} else if (opphold.startdato) {
				periodeTekst = opphold.startdato
				etiketter.push('Varig opphold')
			}

			if (opphold.arbeidetUtenlands === true) {
				etiketter.push(opphold.sluttdato ? 'Jobbet' : 'jobbet')
			}

			const detaljer = [
				periodeTekst,
				etiketter.length > 0 ? `(${etiketter.join(', ')})` : '',
			]
				.filter(Boolean)
				.join(' ')

			return [landDetails?.navn ?? opphold.land, detaljer]
				.filter(Boolean)
				.join(', ')
		})
		.join('\n\n')

export const formatFoedselsdato = (value?: string) => {
	if (!value) return ''
	const isoDate = value.split('T')[0]
	const [year, month, day] = isoDate.split('-')
	if (!year || !month || !day) return ''
	return `${day}.${month}.${year}`
}

export const validateOpphold = ({
	opphold,
	foedselsdato,
	utenlandsperiodeId,
	utenlandsperioder,
}: {
	opphold: OppholdValues
	foedselsdato?: string
	utenlandsperiodeId?: string
	utenlandsperioder: UtenlandsperiodeValidationInput[]
}): UtenlandsoppholdValidationResult => {
	const errors: OppholdValidationErrors = {}

	if (!opphold.land) {
		return {
			isValid: false,
			errors: { land: 'land-required' },
		}
	}

	if (isAvtaleland(opphold.land) && opphold.arbeidetUtenlands === null) {
		errors.arbeidetUtenlands = 'arbeidet-utenlands-required'
	}

	const startdatoError = getStartdatoError(opphold.startdato, foedselsdato)
	const sluttdatoError = getSluttdatoError({
		startdato: opphold.startdato,
		sluttdato: opphold.sluttdato || undefined,
		foedselsdato,
	})

	if (startdatoError) {
		errors.startdato = startdatoError
	}

	if (sluttdatoError) {
		errors.sluttdato = sluttdatoError
	}

	if (hasErrors(errors)) {
		return { isValid: false, errors }
	}

	if (!foedselsdato || utenlandsperioder.length === 0) {
		return { isValid: true, errors }
	}

	const overlapValidationResult = getOverlapValidationResult({
		opphold,
		foedselsdato,
		utenlandsperiodeId,
		utenlandsperioder,
	})

	if (overlapValidationResult) {
		return overlapValidationResult
	}

	return { isValid: true, errors }
}

export const getOppholdValidationMessage = (
	code: UtenlandsoppholdValidationCode,
	field?: UtenlandsoppholdValidationField,
	overlap?: OverlapDetails
) => {
	const overlapLand = overlap?.landkode
		? (getLandDetails(overlap.landkode)?.navn ?? overlap.landkode)
		: 'et annet opphold'
	const overlapPeriodestart = overlap?.periodestart ?? ''
	const overlapPeriodeslutt = overlap?.periodeslutt || '(Varig opphold)'

	switch (code) {
		case 'land-required':
			return 'Du må velge land for oppholdet ditt.'
		case 'arbeidet-utenlands-required':
			return 'Du må svare «Ja» eller «Nei» på om du jobbet under oppholdet.'
		case 'startdato-required':
			return 'Du må oppgi startdato for oppholdet ditt.'
		case 'date-format':
			return 'Oppgi dag, måned og år som DD.MM.ÅÅÅÅ.'
		case 'startdato-before-foedselsdato':
			return 'Startdato kan ikke være før fødselsdatoen din.'
		case 'date-after-max':
			return field === 'sluttdato'
				? 'Sluttdato kan ikke være senere enn 100 år etter fødselsdatoen din.'
				: 'Startdato kan ikke være senere enn 100 år etter fødselsdatoen din.'
		case 'sluttdato-before-startdato':
			return 'Sluttdato kan ikke være før startdato.'
		case 'overlap-non-avtaleland':
			return `Du har allerede registrert at du har bodd i ${overlapLand} fra ${overlapPeriodestart} til ${overlapPeriodeslutt}. Du kan ikke ha overlappende opphold med landet ${overlapLand}.`
		case 'overlap-different-land':
			return `Du har allerede registrert at du har bodd i ${overlapLand} fra ${overlapPeriodestart} til ${overlapPeriodeslutt}. Du kan ikke ha overlappende opphold i to ulike land.`
		case 'overlap-same-bostatus':
			return `Du har allerede registrert at du har bodd i ${overlapLand} fra ${overlapPeriodestart} til ${overlapPeriodeslutt}. Du kan ikke ha overlappende boopphold.`
		case 'overlap-same-jobbstatus':
			return `Du har allerede registrert at du har jobbet i ${overlapLand} fra ${overlapPeriodestart} til ${overlapPeriodeslutt}. Du kan ikke ha overlappende jobbperioder.`
	}
}
