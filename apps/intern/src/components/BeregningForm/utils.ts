import type { Sivilstand } from '@pensjonskalkulator-frontend-monorepo/types'

export function isSivilstatusWithGjenlevenderett(
	sivilstatus: Sivilstand
): boolean {
	return [
		'GIFT',
		'REGISTRERT_PARTNER',
		'SAMBOER',
		'ENKE_ELLER_ENKEMANN',
		'SKILT',
	].includes(sivilstatus)
}

export function shouldShowSivilstand(
	sivilstand: Sivilstand | null,
	beregnMedGjenlevenderett: boolean
): boolean {
	if (!sivilstand) return true
	return (
		!isSivilstatusWithGjenlevenderett(sivilstand) || !beregnMedGjenlevenderett
	)
}
