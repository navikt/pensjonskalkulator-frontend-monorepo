import type {
	EpsOpplysninger,
	SimuleringResponseBody,
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
	aarligInntektFoerUttakBeloep: number | null
	harInntektVedSidenAvUttak: boolean | null
	pensjonsgivendeInntektVedSidenAvUttak: number | null
	alderAarInntektSlutter: number | null
	alderMdInntektSlutter: number | null
	pensjonsgivendeInntektVedSidenAvGradertUttak: number | null
	alderAarInntektGradertSlutter: number | null
	alderMdInntektGradertSlutter: number | null
	harHentetEPSOpplysninger: boolean
	epsOpplysninger: EpsOpplysninger | undefined
	epsAntallUtenlandsOppholdAar: number | undefined
	epsPensjonsgivendeInntektFoerDoedsDato: number | null
	epsMinstePensjonsgivendeInntektFoerDoedsfall: boolean | null
	epsMedlemAvFolketrygdenVedDoedsDato: boolean | null
	epsRegistretSomFlykting: boolean | null
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
	pensjonsgivendeInntektVedSidenAvGradertUttak?: string
	alderAarInntektGradertSlutter?: string
	alderMdInntektGradertSlutter?: string
	harHentetEPSOpplysninger?: string
	epsOpplysninger?: string
	epsAntallUtenlandsOppholdAar?: string
	epsPensjonsgivendeInntektFoerDoedsDato?: string
	epsMinstePensjonsgivendeInntektFoerDoedsfall?: string
	epsMedlemAvFolketrygdenVedDoedsDato?: string
	epsRegistretSomFlykting?: string
}

export type BeregningResult = SimuleringResponseBody

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
	aarligInntektFoerUttakBeloep: null,
	harInntektVedSidenAvUttak: null,
	pensjonsgivendeInntektVedSidenAvUttak: null,
	alderAarInntektSlutter: null,
	alderMdInntektSlutter: null,
	pensjonsgivendeInntektVedSidenAvGradertUttak: null,
	alderAarInntektGradertSlutter: null,
	alderMdInntektGradertSlutter: null,
	epsAntallUtenlandsOppholdAar: undefined,
	epsOpplysninger: undefined,
	epsPensjonsgivendeInntektFoerDoedsDato: null,
	epsMinstePensjonsgivendeInntektFoerDoedsfall: null,
	epsMedlemAvFolketrygdenVedDoedsDato: null,
	epsRegistretSomFlykting: null,
	harHentetEPSOpplysninger: false,
}
