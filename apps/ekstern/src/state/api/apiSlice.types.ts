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

export type Uttaksperiode = {
  startAlder: { aar: number; maaneder: number }
  grad: number
  aarligInntekt: number
}

export type PensjonsavtalerResponseBody = {
  avtaler: Omit<Pensjonsavtale, 'key'>[]
  utilgjengeligeSelskap: UtilgjengeligeSelskap[]
}

export type AlderspensjonRequestBody = {
  simuleringstype: 'ALDERSPENSJON' | 'ALDERSPENSJON_MED_AFP_PRIVAT'
  forventetInntekt?: number
  uttaksgrad: number
  foedselsdato: string
  foersteUttaksalder: { aar: number; maaneder: number }
  sivilstand?: UtvidetSivilstand
  epsHarInntektOver2G: boolean
}

export type AlderspensjonResponseBody = {
  alderspensjon: Pensjonsberegning[]
  afpPrivat: Pensjonsberegning[]
  vilkaarErOppfylt: boolean
}

export type TidligsteUttaksalderRequestBody = {
  sivilstand?: Sivilstand
  harEps?: boolean
  sisteInntekt?: number
}
