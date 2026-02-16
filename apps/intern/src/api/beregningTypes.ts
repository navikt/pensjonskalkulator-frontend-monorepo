export type Sivilstand = 'GIFT' | 'UGIFT' | 'SAMBOER'

export type JaNei = 'ja' | 'nei'

export interface BeregningFormData {
	sivilstand: Sivilstand
	ektefelleMottarPensjon: JaNei
	ektefelleInntektOver2G: JaNei
}

export type BeregningParams = BeregningFormData

export interface BeregningResult {
	[key: string]: unknown
}

export const defaultBeregningFormData: BeregningFormData = {
	sivilstand: 'GIFT',
	ektefelleMottarPensjon: 'nei',
	ektefelleInntektOver2G: 'nei',
}
