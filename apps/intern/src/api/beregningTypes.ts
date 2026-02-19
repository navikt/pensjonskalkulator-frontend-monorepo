import type { AlderspensjonResponseBody } from '@pensjonskalkulator-frontend-monorepo/types'

export type Sivilstand = 'GIFT' | 'UGIFT' | 'SAMBOER' | 'REGISTRERT_PARTNER'

export type JaNei = 'ja' | 'nei' | ''

export interface BeregningFormData {
	sivilstand: Sivilstand
	alderAarUttak: string
	alderMdUttak: string
	uttaksgrad: string
	aarligInntektVsaPensjonGradertUttak: string
	alderAarHeltUttak: string
	alderMdHeltUttak: string
	ektefelleMottarPensjon: JaNei
	ektefelleInntektOver2G: JaNei
	pensjonsgivendeInntektFremTilUttak: string
	harInntektVedSidenAvUttak: JaNei
	pensjonsgivendeInntektVedSidenAvUttak: string
	alderAarInntektSlutter: string
	alderMdInntektSlutter: string
	harInntektVedSidenAvGradertUttak: JaNei
	pensjonsgivendeInntektVedSidenAvGradertUttak: string
	alderAarInntektGradertSlutter: string
	alderMdInntektGradertSlutter: string
}

export type BeregningParams = BeregningFormData

export interface ValidationErrors {
	sivilstand?: string
	alderAarUttak?: string
	alderMdUttak?: string
	uttaksgrad?: string
	aarligInntektVsaPensjonGradertUttak?: string
	alderAarHeltUttak?: string
	alderMdHeltUttak?: string
	ektefelleMottarPensjon?: string
	ektefelleInntektOver2G?: string
	pensjonsgivendeInntektFremTilUttak?: string
	harInntektVedSidenAvUttak?: string
	pensjonsgivendeInntektVedSidenAvUttak?: string
	alderAarInntektSlutter?: string
	alderMdInntektSlutter?: string
	harInntektVedSidenAvGradertUttak?: string
	pensjonsgivendeInntektVedSidenAvGradertUttak?: string
	alderAarInntektGradertSlutter?: string
	alderMdInntektGradertSlutter?: string
}

export type BeregningResult = AlderspensjonResponseBody

export function mapPersonSivilstand(sivilstand: string): Sivilstand {
	switch (sivilstand) {
		case 'GIFT':
			return 'GIFT'
		case 'SAMBOER':
			return 'SAMBOER'
		case 'REGISTRERT_PARTNER':
			return 'REGISTRERT_PARTNER'
		default:
			return 'UGIFT'
	}
}

export const defaultBeregningFormData: BeregningFormData = {
	sivilstand: 'UGIFT',
	alderAarUttak: '',
	alderMdUttak: '',
	uttaksgrad: '100',
	aarligInntektVsaPensjonGradertUttak: '',
	alderAarHeltUttak: '',
	alderMdHeltUttak: '',
	ektefelleMottarPensjon: '',
	ektefelleInntektOver2G: '',
	pensjonsgivendeInntektFremTilUttak: '',
	harInntektVedSidenAvUttak: '',
	pensjonsgivendeInntektVedSidenAvUttak: '',
	alderAarInntektSlutter: '',
	alderMdInntektSlutter: '',
	harInntektVedSidenAvGradertUttak: '',
	pensjonsgivendeInntektVedSidenAvGradertUttak: '',
	alderAarInntektGradertSlutter: '',
	alderMdInntektGradertSlutter: '',
}
