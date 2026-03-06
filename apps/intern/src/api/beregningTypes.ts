import type {
	AlderspensjonResponseBody,
	Sivilstatus,
} from '@pensjonskalkulator-frontend-monorepo/types'

export type BakgrunnForBrukAvOpplysningerOmEPS =
	| 'SAMTYKKE_BEGGE_PARTER'
	| 'DOEDSFALL_REGISTRERT'

export interface BeregningFormData {
	sivilstatus: Sivilstatus
	beregnMedGjenlevenderett: boolean
	bakgrunnForBrukAvOpplysningerOmEPS: BakgrunnForBrukAvOpplysningerOmEPS | null
	alderAarUttak: number | null
	alderMdUttak: number | null
	uttaksgrad: number | null
	aarligInntektVsaPensjonGradertUttak: number | null
	alderAarHeltUttak: number | null
	alderMdHeltUttak: number | null
	epsHarPensjon: boolean | null
	epsHarInntektOver2G: boolean | null
	aarligInntektFoerUttakBeloep: string
	harInntektVedSidenAvUttak: boolean | null
	pensjonsgivendeInntektVedSidenAvUttak: string
	alderAarInntektSlutter: number | null
	alderMdInntektSlutter: number | null
	harInntektVedSidenAvGradertUttak: boolean | null
	pensjonsgivendeInntektVedSidenAvGradertUttak: string
	alderAarInntektGradertSlutter: number | null
	alderMdInntektGradertSlutter: number | null
}

export type BeregningParams = BeregningFormData

export interface ValidationErrors {
	sivilstatus?: string
	bakgrunnForBrukAvOpplysningerOmEPS?: string
	beregnMedGjenlevenderett?: string
	alderAarUttak?: string
	alderMdUttak?: string
	uttaksgrad?: string
	aarligInntektVsaPensjonGradertUttak?: string
	alderAarHeltUttak?: string
	alderMdHeltUttak?: string
	epsHarPensjon?: string
	epsHarInntektOver2G?: string
	aarligInntektFoerUttakBeloep?: string
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

export function mapPersonSivilstatus(sivilstand: string): string {
	switch (sivilstand) {
		case 'UOPPGITT':
			return ''
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
	sivilstatus: 'UOPPGITT',
	beregnMedGjenlevenderett: false,
	bakgrunnForBrukAvOpplysningerOmEPS: null,
	alderAarUttak: null,
	alderMdUttak: null,
	uttaksgrad: null,
	aarligInntektVsaPensjonGradertUttak: null,
	alderAarHeltUttak: null,
	alderMdHeltUttak: null,
	epsHarPensjon: null,
	epsHarInntektOver2G: null,
	aarligInntektFoerUttakBeloep: '',
	harInntektVedSidenAvUttak: null,
	pensjonsgivendeInntektVedSidenAvUttak: '',
	alderAarInntektSlutter: null,
	alderMdInntektSlutter: null,
	harInntektVedSidenAvGradertUttak: null,
	pensjonsgivendeInntektVedSidenAvGradertUttak: '',
	alderAarInntektGradertSlutter: null,
	alderMdInntektGradertSlutter: null,
}
