import type { BeregningFormData, Sivilstand } from './beregningTypes'

export function isHarPartner(sivilstand: Sivilstand | null): boolean {
	return (
		sivilstand !== null &&
		['GIFT', 'REGISTRERT_PARTNER', 'SAMBOER'].includes(sivilstand)
	)
}

export function getPartnerBetegnelse(sivilstand: Sivilstand | null): string {
	switch (sivilstand) {
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
	sivilstand: Sivilstand | null
): boolean {
	return isHarPartner(sivilstand)
}

export function shouldShowEpsHarInntektOver2G(
	sivilstand: Sivilstand | null,
	epsHarPensjon: boolean | null
): boolean {
	return isHarPartner(sivilstand) && epsHarPensjon === false
}

export function shouldShowGradertUttakFields(
	uttaksgrad: number | null
): boolean {
	return uttaksgrad !== null && uttaksgrad !== 100
}

export function shouldShowHeltUttakAlder(uttaksgrad: number | null): boolean {
	return shouldShowGradertUttakFields(uttaksgrad)
}

export function shouldShowInntektVedSidenAvGradert(
	uttaksgrad: number | null
): boolean {
	return shouldShowGradertUttakFields(uttaksgrad)
}

export function shouldShowInntektGradertFields(
	uttaksgrad: number | null,
	harInntektVedSidenAvGradertUttak: boolean | null
): boolean {
	return (
		shouldShowGradertUttakFields(uttaksgrad) &&
		harInntektVedSidenAvGradertUttak === true
	)
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
