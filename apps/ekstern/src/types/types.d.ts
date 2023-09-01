declare type Uttaksalder = {
  aar: number
  maaned: number
  uttaksdato: string
}

declare type Pensjonsberegning = {
  belop: number
  alder: number
}

declare type Pensjonsavtale = {
  key: number
  produktbetegnelse: string
  kategori: PensjonsavtaleKategori
  startAlder: number
  startMaaned: number
  utbetalingsperioder: {
    startAlder: number
    startMaaned: number
    sluttAlder?: number
    sluttMaaned?: number
    aarligUtbetaling: number
    grad: number
  }
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

declare type Step = '0' | '1' | '2' | '3'

declare type Person = {
  fornavn: string
  sivilstand: Sivilstand
  foedselsdato: string
}

declare type TpoMedlemskap = {
  harTjenestepensjonsforhold: boolean
}

declare type UnleashToggle = {
  enabled: boolean
}
