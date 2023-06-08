export type UttaksalderRequestBody = {
  sivilstand?: Sivilstand
  harEps?: boolean
  sisteInntekt?: number
}

export type AlderspensjonRequestBody = {
  simuleringstype: string
  uttaksgrad: number
  foersteUttaksdato: string
  epsHarInntektOver2G: boolean
  forventetInntekt?: number
  sivilstand?: Sivilstand
}

export type AlderspensjonResponseBody = {
  pensjon: Pensjonsberegning[]
}
