declare type AfpRadio = 'ja_offentlig' | 'ja_privat' | 'nei' | 'vet_ikke'

declare type Uttaksalder = {
  aar: number
  maaneder: number
  uttaksdato: string
}

declare type UttaksalderForenklet = Omit<Uttaksalder, 'uttaksdato'>

declare type Pensjonsberegning = {
  beloep: number
  alder: number
}

declare type Utbetalingsperiode = {
  startAlder: number
  startMaaned: number
  sluttAlder?: number
  sluttMaaned?: number
  aarligUtbetaling: number
  grad: number
}

declare type Pensjonsavtale = {
  key: number
  produktbetegnelse: string
  kategori: PensjonsavtaleKategori
  startAlder?: number
  sluttAlder?: number
  utbetalingsperioder: Utbetalingsperiode[]
}

declare type UtilgjengeligeSelskap = {
  navn: string
  heltUtilgjengelig: boolean
}

declare type Sivilstand =
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

declare type UtvidetSivilstand = Sivilstand | 'SAMBOER'

declare type Step = '0' | '1' | '2' | '3'

declare type Person = {
  fornavn: string
  sivilstand: Sivilstand
  foedselsdato: string
}

declare type Inntekt = {
  beloep: number
  aar: number
}

declare type TpoMedlemskap = {
  harTjenestepensjonsforhold: boolean
}

declare type UnleashToggle = {
  enabled: boolean
}
