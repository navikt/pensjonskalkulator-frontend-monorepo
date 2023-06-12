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
  navn: string
  type: PensjonsavtaleType
  startAar: number
  startMaaned: number
  sluttAar?: number
  sluttMaaned?: number
  grad: number
  beholdning: number
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
}

declare type UnleashToggle = {
  enabled: boolean
}
