export type TidligsteUttaksalderRequestBody = {
  sivilstand?: Sivilstand
  harEps?: boolean
  sisteInntekt?: number
}

export type Uttaksperiode = {
  startAlder: { aar: number; maaneder: number }
  grad: number
  aarligInntekt: number
}

export type PensjonsavtalerRequestBody = {
  aarligInntektFoerUttak?: number
  uttaksperioder: Uttaksperiode[]
  antallInntektsaarEtterUttak: number
  harAfp?: boolean
  harEpsPensjon?: boolean
  harEpsPensjonsgivendeInntektOver2G?: boolean
  antallAarIUtlandetEtter16?: number
  sivilstand?: Sivilstand
}

export type PensjonsavtalerResponseBody = {
  avtaler: Omit<Pensjonsavtale, 'key'>[]
  utilgjengeligeSelskap: UtilgjengeligeSelskap[]
}

export type AlderspensjonRequestBody = {
  simuleringstype: 'ALDERSPENSJON' | 'ALDERSPENSJON_MED_AFP_PRIVAT'
  uttaksgrad: number
  foersteUttaksalder: { aar: number; maaneder: number }
  foedselsdato: string
  epsHarInntektOver2G: boolean
  forventetInntekt?: number
  sivilstand?: UtvidetSivilstand
}

export type AlderspensjonResponseBody = {
  alderspensjon: Pensjonsberegning[]
  afpPrivat: Pensjonsberegning[]
  vilkaarErOppfylt: boolean
}
