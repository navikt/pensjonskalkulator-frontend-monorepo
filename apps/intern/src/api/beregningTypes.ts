export type Sivilstand = 'GIFT' | 'UGIFT' | 'SAMBOER' | 'REGISTRERT_PARTNER'

export type JaNei = 'ja' | 'nei' | ''

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
	ektefelleMottarPensjon: '',
	ektefelleInntektOver2G: '',
	pensjonsgivendeInntektFremTilUttak: '',
	harInntektVedSidenAvUttak: '',
	pensjonsgivendeInntektVedSidenAvUttak: '',
	alderAarInntektSlutter: '',
	alderMdInntektSlutter: '',
}
