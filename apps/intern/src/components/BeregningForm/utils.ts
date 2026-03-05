import type {
	PersonInternV1,
	Sivilstatus,
} from '@pensjonskalkulator-frontend-monorepo/types'
import { isFoedtFoer1963 } from '@pensjonskalkulator-frontend-monorepo/utils/alder'

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
