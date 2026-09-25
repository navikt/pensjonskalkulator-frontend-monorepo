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
	maanedligBeloep?: number | null
}

export interface AfpPrivatPensjonsberegning {
	alder: number
	beloep: number
	kompensasjonstillegg: number
	kronetillegg: number
	livsvarig: number
	maanedligBeloep?: number | null
}

export interface AlderspensjonResult {
	alder: number
	beloep: number
	inntektspensjonBeloep?: number | null
	garantipensjonBeloep?: number | null
	delingstall?: number | null
	pensjonBeholdningFoerUttakBeloep?: number | null
	andelsbroekKap19?: number | null
	andelsbroekKap20?: number | null
	sluttpoengtall?: number | null
	trygdetidKap19?: number | null
	trygdetidKap20?: number | null
	poengaarFoer92?: number | null
	poengaarEtter91?: number | null
	forholdstall?: number | null
	grunnpensjon?: number | null
	tilleggspensjon?: number | null
	pensjonstillegg?: number | null
	skjermingstillegg?: number | null
	kapittel19Gjenlevendetillegg?: number | null
}

export interface Pre2025OffentligAfp {
	alderAar: number
	totaltAfpBeloep: number
	tidligereArbeidsinntekt: number
	grunnbeloep: number
	sluttpoengtall: number
	trygdetid: number
	poengaarTom1991: number
	poengaarFom1992: number
	grunnpensjon: number
	tilleggspensjon: number
	afpTillegg: number
	saertillegg: number
	afpGrad: number
	afpAvkortetTil70Prosent: boolean
}

export interface AlderspensjonPensjonsberegning {
	alderspensjon: AlderspensjonResult[]
	alderspensjonMaanedligVedEndring?: {
		gradertUttakMaanedligBeloep?: number | null
		heltUttakMaanedligBeloep: number
	} | null
	pre2025OffentligAfp?: Pre2025OffentligAfp | null
	afpPrivat?: AfpPrivatPensjonsberegning[]
	afpOffentlig?: AfpPensjonsberegning[]
	vilkaarsproeving?: {
		vilkaarErOppfylt: boolean
		alternativ?: {
			gradertUttaksalder?: Uttaksalder | null
			uttaksgrad?: number | null
			heltUttaksalder: Uttaksalder
		} | null
	}
	harForLiteTrygdetid?: boolean | null
	trygdetid?: number | null
	opptjeningGrunnlagListe?:
		| {
				aar: number
				pensjonsgivendeInntektBeloep: number
		  }[]
		| null
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

export type AlderspensjonSivilstand = Sivilstand | 'SAMBOER'

export interface LoependeVedtak {
	harLoependeVedtak: boolean
	alderspensjon?: {
		grad: number
		uttaksgradFom: string
		fom: string
		sivilstand: AlderspensjonSivilstand
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
