export interface Uttaksalder {
	aar: number
	maaneder: number
}

export interface Uttaksperiode {
	startAlder: Uttaksalder
	grad: number
	aarligInntektVsaPensjon?: {
		beloep: number
		sluttAlder?: Uttaksalder
	}
}

export interface PensjonsavtalerRequestBody {
	uttaksperioder: Uttaksperiode[]
	aarligInntektFoerUttak: number
	antallInntektsaarEtterUttak?: number
}

export interface AlderspensjonRequestBody {
	simuleringstype: string
	sivilstand?: string
	epsHarInntektOver2G?: boolean
	epsHarPensjon?: boolean
	heltUttak: {
		uttaksalder: Uttaksalder
		aarligInntektVsaPensjon?: {
			beloep: number
			sluttAlder?: Uttaksalder
		}
	}
	gradertUttak?: {
		grad: number
		uttaksalder: Uttaksalder
		aarligInntektVsaPensjonBeloep?: number
	}
	aarligInntektFoerUttakBeloep?: number
	utenlandsperioder?: unknown[]
}

export interface AfpPensjonsberegning {
	alder: number
	beloep: number
}

export interface AlderspensjonPensjonsberegning {
	alderspensjon: AfpPensjonsberegning[]
	afpPrivat?: AfpPensjonsberegning[]
	afpOffentlig?: AfpPensjonsberegning[]
	vilkaarsproeving?: {
		vilkaarErOppfylt: boolean
	}
	harForLiteTrygdetid?: boolean
}

export type Sivilstand =
	| 'UNKNOWN'
	| 'UOPPGITT'
	| 'UGIFT'
	| 'GIFT'
	| 'ENKE_ELLER_ENKEMANN'
	| 'SKILT'
	| 'SEPARERT'
	| 'REGISTRERT_PARTNER'
	| 'SEPARERT_PARTNER'
	| 'SKILT_PARTNER'
	| 'GJENLEVENDE_PARTNER'

export interface LoependeVedtak {
	harLoependeVedtak: boolean
	alderspensjon?: {
		grad: number
		uttaksgradFom: string
		fom: string
		sivilstand: Sivilstand
		sisteUtbetaling?: {
			beloep: number
			utbetalingsdato: string
		}
	}
	ufoeretrygd: {
		grad: number
	}
	afpPrivat?: {
		fom: string
	}
	afpOffentlig?: {
		fom: string
	}
	pre2025OffentligAfp?: {
		fom: string
	}
	fremtidigAlderspensjon?: {
		grad: number
		fom: string
	}
}

export interface Person {
	navn: string
	fornavn: string
	sivilstand: Sivilstand
	foedselsdato: string
	pensjoneringAldre: {
		normertPensjoneringsalder: Uttaksalder
		nedreAldersgrense: Uttaksalder
		oevreAldersgrense: Uttaksalder
	}
}
