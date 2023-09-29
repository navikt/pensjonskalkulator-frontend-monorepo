declare type AfpRadio = 'ja_offentlig' | 'ja_privat' | 'nei' | 'vet_ikke'

declare type Alder = {
  aar: number
  maaneder: number
}

declare type Pensjonsberegning = {
  beloep: number
  alder: number
}

declare type Utbetalingsperiode = {
  startAlder: Alder
  sluttAlder?: Alder
  aarligUtbetaling: number
  grad: number
}

declare type Pensjonsavtale = {
  key: number
  produktbetegnelse: string
  kategori: PensjonsavtaleKategori
  startAar?: number
  sluttAar?: number
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
