import type {
	EpsOpplysninger,
	EpsSivilstatus,
	PersonInternV1,
	Sivilstatus,
	Vedtak,
} from '@pensjonskalkulator-frontend-monorepo/types'
import { calculateUttaksalderAsDate } from '@pensjonskalkulator-frontend-monorepo/utils/alder'
import {
	DATE_BACKEND_FORMAT,
	DATE_ENDUSER_FORMAT,
} from '@pensjonskalkulator-frontend-monorepo/utils/dates'
import {
	add,
	addYears,
	format,
	isBefore,
	isValid,
	parse,
	parseISO,
	startOfMonth,
} from 'date-fns'

import { erKap19EllerApoteker } from '../../api/formConditions'

export function isSivilstatusWithGjenlevenderett(
	sivilstatus: EpsSivilstatus
): boolean {
	return [
		'GIFT',
		'REGISTRERT_PARTNER',
		'SAMBOER',
		'ENKE_ELLER_ENKEMANN',
		'SKILT',
	].includes(sivilstatus)
}

export function showSivilstatus({
	sivilstatus,
	beregnMedGjenlevenderett,
	erEndring,
	serviceBeregning,
}: {
	sivilstatus: Sivilstatus
	beregnMedGjenlevenderett: boolean
	erEndring: boolean
	serviceBeregning: boolean
}): boolean {
	if (!sivilstatus || (erEndring && !serviceBeregning)) return false

	return (
		(erEndring &&
			serviceBeregning &&
			isSivilstatusWithGjenlevenderett(sivilstatus)) ||
		!isSivilstatusWithGjenlevenderett(sivilstatus) ||
		!beregnMedGjenlevenderett
	)
}

export function showBeregnMedGjenlevenderett({
	initialSivilstatus,
	person,
	harGjenlevenderett,
	erApoteker,
}: {
	initialSivilstatus: EpsSivilstatus
	person?: PersonInternV1
	harGjenlevenderett?: boolean
	erApoteker: boolean
}): boolean {
	if (harGjenlevenderett === true || !person) return false
	return (
		erKap19EllerApoteker(person?.foedselsdato, erApoteker) &&
		isSivilstatusWithGjenlevenderett(initialSivilstatus)
	)
}

export const UTTAKSGRADER_MED_TOLV_MAANEDERS_ENDRINGSFRIST = [
	20, 40, 50, 60, 80,
]

export function getForTidligEndringAvUttaksgradDato({
	vedtak,
	foedselsdato,
	uttaksgrad,
	alderAarUttak,
	alderMdUttak,
}: {
	vedtak: Vedtak | undefined
	foedselsdato: string | undefined
	uttaksgrad: number | null
	alderAarUttak: number | null
	alderMdUttak: number | null
}): string | null {
	const loependeAlderspensjon = vedtak?.loependeAlderspensjon
	const fremtidigAlderspensjon = vedtak?.fremtidigAlderspensjon

	if (
		!loependeAlderspensjon ||
		!foedselsdato ||
		uttaksgrad === null ||
		alderAarUttak === null ||
		alderMdUttak === null
	) {
		return null
	}

	if (
		!UTTAKSGRADER_MED_TOLV_MAANEDERS_ENDRINGSFRIST.includes(uttaksgrad) ||
		(!fremtidigAlderspensjon && uttaksgrad === loependeAlderspensjon.grad) ||
		(fremtidigAlderspensjon && uttaksgrad === fremtidigAlderspensjon.grad)
	) {
		return null
	}
	const uttaksdato = calculateUttaksalderAsDate(
		{ aar: alderAarUttak, maaneder: alderMdUttak },
		foedselsdato
	)
	// Matcher ekstern kalkulator: både valgt uttaksdato og tidligste endring
	// sammenlignes på første dag i måneden.
	const tidligsteEndringsdato = startOfMonth(
		add(
			parse(
				fremtidigAlderspensjon
					? fremtidigAlderspensjon.fom
					: loependeAlderspensjon.uttaksgradFom,
				DATE_BACKEND_FORMAT,
				new Date()
			),
			{ months: 12 }
		)
	)

	if (!isValid(uttaksdato) || !isValid(tidligsteEndringsdato)) {
		return null
	}

	return isBefore(uttaksdato, tidligsteEndringsdato)
		? format(tidligsteEndringsdato, DATE_ENDUSER_FORMAT)
		: null
}

export function showEPSMinstePensjonsgivendeInntektFoerDoedsfall(
	EPSOpplysninger: EpsOpplysninger
): boolean {
	if (!EPSOpplysninger.relasjonPersondata?.foedselsdato) return false
	return isEpsUnder67EllerDoedsdatoFoer67aar({
		epsFoedselsdato: EPSOpplysninger.relasjonPersondata.foedselsdato,
		epsDoedsdato: EPSOpplysninger.relasjonPersondata.doedsdato,
	})
}

export function isEpsUnder67EllerDoedsdatoFoer67aar({
	epsFoedselsdato,
	epsDoedsdato,
}: {
	epsFoedselsdato: string
	epsDoedsdato?: string | null
}): boolean {
	const foedt = parseISO(epsFoedselsdato)
	const fylte67 = addYears(foedt, 67)

	if (epsDoedsdato) {
		const doedsdato = parseISO(epsDoedsdato)
		return doedsdato < fylte67
	}

	return new Date() < fylte67
}

export function getUttaksGradArray({
	skalBeregneAFPPrivat,
	erEndring,
	ufoeretrygdgrad,
	alderAarUttak,
}: {
	skalBeregneAFPPrivat: boolean
	erEndring: boolean
	ufoeretrygdgrad?: number | null
	alderAarUttak: number | null
}) {
	let uttaksgradArray = erEndring
		? [0, ...UTTAKSGRADER_MED_TOLV_MAANEDERS_ENDRINGSFRIST, 100]
		: [...UTTAKSGRADER_MED_TOLV_MAANEDERS_ENDRINGSFRIST, 100]

	if (
		ufoeretrygdgrad &&
		!skalBeregneAFPPrivat &&
		alderAarUttak !== null &&
		alderAarUttak < 67
	) {
		uttaksgradArray = uttaksgradArray.filter((grad) => {
			// Ved UT + AP (endring), 0 grad er mulig
			return (
				(erEndring && grad === 0) ||
				(grad > 0 && grad <= 100 - ufoeretrygdgrad) ||
				grad === 100
			)
		})
	}

	return uttaksgradArray
}
