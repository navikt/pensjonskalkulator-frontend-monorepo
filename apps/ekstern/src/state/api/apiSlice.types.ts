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
  simuleringstype: string
  forventetInntekt?: number
  uttaksgrad: number
  foersteUttaksdato: string
  sivilstand?: Sivilstand
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
