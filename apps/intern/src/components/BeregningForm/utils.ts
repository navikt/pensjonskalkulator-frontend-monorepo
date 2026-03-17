import type {
	EpsOpplysninger,
	PersonInternV1,
	Sivilstatus,
} from '@pensjonskalkulator-frontend-monorepo/types'
import { isFoedtFoer1963 } from '@pensjonskalkulator-frontend-monorepo/utils/alder'
import { addYears, parseISO } from 'date-fns'

export function isSivilstatusWithGjenlevenderett(
	sivilstatus: Sivilstatus
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
}: {
	sivilstatus: Sivilstatus | null
	beregnMedGjenlevenderett: boolean
}): boolean {
	if (!sivilstatus) return true
	return (
		!isSivilstatusWithGjenlevenderett(sivilstatus) || !beregnMedGjenlevenderett
	)
}

export function showBeregnMedGjenlevenderett({
	initialSivilstatus,
	person,
}: {
	initialSivilstatus: Sivilstatus
	person: PersonInternV1
}): boolean {
	return (
		isFoedtFoer1963(person?.foedselsdato) &&
		isSivilstatusWithGjenlevenderett(initialSivilstatus)
	)
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
