import type { Sivilstatus } from '@pensjonskalkulator-frontend-monorepo/types'
import { isFoedtFoer1963 } from '@pensjonskalkulator-frontend-monorepo/utils/alder'

import type { BeregningFormData, InternAfpRadio } from './beregningTypes'

export function harPartner(sivilstatus: Sivilstatus | null): boolean {
	return (
		sivilstatus !== null &&
		['GIFT', 'REGISTRERT_PARTNER', 'SAMBOER'].includes(sivilstatus as string)
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

export function showEpsHarPensjon({
	sivilstatus,
	beregnMedGjenlevenderett,
	erEndring,
}: {
	sivilstatus: Sivilstatus | null
	beregnMedGjenlevenderett: boolean
	erEndring: boolean
}): boolean {
	return harPartner(sivilstatus) && !beregnMedGjenlevenderett && !erEndring
}

export function showEpsHarInntektOver2G({
	sivilstatus,
	epsHarPensjon,
	beregnMedGjenlevenderett,
	erEndring,
}: {
	sivilstatus: Sivilstatus | null
	epsHarPensjon: boolean | null
	beregnMedGjenlevenderett: boolean
	erEndring: boolean
}): boolean {
	return (
		harPartner(sivilstatus) &&
		epsHarPensjon === false &&
		!beregnMedGjenlevenderett &&
		!erEndring
	)
}

export function showGradertUttakFields(uttaksgrad: number | null): boolean {
	return uttaksgrad !== null && uttaksgrad !== 100
}

export function showHeltUttakAlder(uttaksgrad: number | null): boolean {
	return showGradertUttakFields(uttaksgrad)
}

export function showInntektGradertFields(uttaksgrad: number | null): boolean {
	return showGradertUttakFields(uttaksgrad)
}

export function showHarInntektVedSidenAvUttak(
	uttaksgrad: number | null
): boolean {
	return uttaksgrad !== null
}

export function showInntektHeltFields(
	harInntektVedSidenAvUttak: boolean | null
): boolean {
	return harInntektVedSidenAvUttak === true
}

export function validateGradertUttakRequired(formData: BeregningFormData): {
	alderAarHeltUttak?: string
	alderMdHeltUttak?: string
} {
	const errors: { alderAarHeltUttak?: string; alderMdHeltUttak?: string } = {}

	if (showHeltUttakAlder(formData.uttaksgrad)) {
		if (formData.alderAarHeltUttak === null) {
			errors.alderAarHeltUttak = 'Alder (år) for 100 % uttak er påkrevd'
		}
		if (formData.alderMdHeltUttak === null) {
			errors.alderMdHeltUttak = 'Alder (md.) for 100 % uttak er påkrevd'
		}
	}

	return errors
}

export function showAfpOffentligFields({
	afp,
	foedselsdato,
}: {
	afp: InternAfpRadio | undefined
	foedselsdato: string | undefined
}): boolean {
	return (
		(afp === 'ja_offentlig' || afp === 'serviceberegning') &&
		!!foedselsdato &&
		isFoedtFoer1963(foedselsdato)
	)
}

export function isUttakNesteKalenderaar({
	foedselsdato,
	alderAarUttak,
	alderMdUttak,
}: {
	foedselsdato: string | undefined
	alderAarUttak: number | null
	alderMdUttak: number | null
}): boolean {
	if (!foedselsdato || alderAarUttak == null || alderMdUttak == null)
		return false
	const birthDate = new Date(foedselsdato)
	const uttakYear =
		birthDate.getFullYear() +
		alderAarUttak +
		Math.floor((birthDate.getMonth() + alderMdUttak + 1) / 12)
	return uttakYear > new Date().getFullYear()
}
