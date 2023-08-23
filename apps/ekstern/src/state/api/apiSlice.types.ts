export type PensjonsavtalerRequestBody = {
  aarligInntektFoerUttak?: number
  uttaksperioder: Uttaksperiode[]
  antallInntektsaarEtterUttak: number
}

export type Uttaksperiode = {
  startAlder: number
  startMaaned: number
  grad: number
  aarligInntekt: number
}

export type PensjonsavtalerResponseBody = {
  avtaler: Pensjonsavtale[]
  utilgjengeligeSelskap: UtilgjengeligeSelskap[]
}

export type AlderspensjonRequestBody = {
  simuleringstype: 'ALDER' | 'ALDER_M_AFP_PRIVAT'
  forventetInntekt?: number
  uttaksgrad: number
  foedselsdato: string
  foersteUttaksalder: { aar: number; maaned: number }
  sivilstand?: UtvidetSivilstand
  epsHarInntektOver2G: boolean
}

export type AlderspensjonResponseBody = {
  alderspensjon: Pensjonsberegning[]
  afpPrivat: Pensjonsberegning[]
}

export type UttaksalderRequestBody = {
  sivilstand?: Sivilstand
  harEps?: boolean
  sisteInntekt?: number
}
