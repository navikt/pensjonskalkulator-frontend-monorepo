import type { Sivilstatus } from '@pensjonskalkulator-frontend-monorepo/types'

import type { BeregningFormData } from './beregningTypes'

export function harPartner(sivilstatus: Sivilstatus | null): boolean {
	return (
		sivilstatus !== null &&
		[
			'GIFT',
			'REGISTRERT_PARTNER',
			'SAMBOER',
			'ENKE_ELLER_ENKEMANN',
			'SKILT',
		].includes(sivilstatus as string)
	)
}

export function getPartnerBetegnelse(sivilstatus: Sivilstatus): string {
	if (sivilstatus === 'UOPPGITT') {
		return ''
	}

	switch (sivilstatus) {
		case 'SAMBOER':
			return 'samboer'
		case 'REGISTRERT_PARTNER':
			return 'partner'
		case 'GIFT':
			return 'ektefelle'
		default:
			return 'partner'
	}
}

export function shouldShowEpsHarPensjon(
	sivilstatus: Sivilstatus | null
): boolean {
	return harPartner(sivilstatus)
}

export function shouldShowEpsHarInntektOver2G(
	sivilstatus: Sivilstatus | null,
	epsHarPensjon: boolean | null
): boolean {
	return harPartner(sivilstatus) && epsHarPensjon === false
}

export function shouldShowGradertUttakFields(
	uttaksgrad: number | null
): boolean {
	return uttaksgrad !== null && uttaksgrad !== 100
}

export function shouldShowHeltUttakAlder(uttaksgrad: number | null): boolean {
	return shouldShowGradertUttakFields(uttaksgrad)
}

export function shouldShowInntektGradertFields(
	uttaksgrad: number | null
): boolean {
	return shouldShowGradertUttakFields(uttaksgrad)
}

export function shouldShowInntektHeltFields(
	harInntektVedSidenAvUttak: boolean | null
): boolean {
	return harInntektVedSidenAvUttak === true
}

export function validateGradertUttakRequired(formData: BeregningFormData): {
	alderAarHeltUttak?: string
	alderMdHeltUttak?: string
} {
	const errors: { alderAarHeltUttak?: string; alderMdHeltUttak?: string } = {}

	if (shouldShowHeltUttakAlder(formData.uttaksgrad)) {
		if (formData.alderAarHeltUttak === null) {
			errors.alderAarHeltUttak = 'Alder (år) for 100 % uttak er påkrevd'
		}
		if (formData.alderMdHeltUttak === null) {
			errors.alderMdHeltUttak = 'Alder (md.) for 100 % uttak er påkrevd'
		}
	}

	return errors
}
