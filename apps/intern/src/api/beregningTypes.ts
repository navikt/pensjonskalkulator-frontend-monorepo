export type Sivilstand = 'GIFT' | 'UGIFT' | 'SAMBOER' | 'REGISTRERT_PARTNER'

export type JaNei = 'ja' | 'nei'

export interface BeregningFormData {
	sivilstand: Sivilstand
	alderAarUttak: string
	alderMdUttak: string
	ektefelleMottarPensjon: JaNei
	ektefelleInntektOver2G: JaNei
	pensjonsgivendeInntektFremTilUttak: string
	harInntektVedSidenAvUttak: JaNei
	pensjonsgivendeInntektVedSidenAvUttak: string
	alderAarInntektSlutter: string
	alderMdInntektSlutter: string
}

export type BeregningParams = BeregningFormData

export interface ValidationErrors {
	sivilstand?: string
	alderAarUttak?: string
	alderMdUttak?: string
	ektefelleMottarPensjon?: string
	ektefelleInntektOver2G?: string
	pensjonsgivendeInntektFremTilUttak?: string
	harInntektVedSidenAvUttak?: string
	pensjonsgivendeInntektVedSidenAvUttak?: string
	alderAarInntektSlutter?: string
	alderMdInntektSlutter?: string
}

export interface BeregningResult {
	[key: string]: unknown
}

export const defaultBeregningFormData: BeregningFormData = {
	sivilstand: 'GIFT',
	alderAarUttak: '',
	alderMdUttak: '',
	ektefelleMottarPensjon: 'nei',
	ektefelleInntektOver2G: 'nei',
	pensjonsgivendeInntektFremTilUttak: '',
	harInntektVedSidenAvUttak: 'nei',
	pensjonsgivendeInntektVedSidenAvUttak: '',
	alderAarInntektSlutter: '',
	alderMdInntektSlutter: '',
}
