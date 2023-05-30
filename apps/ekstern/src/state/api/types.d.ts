declare type Uttaksalder = {
  aar: number
  maaned: number
}

declare type Pensjonsberegning = {
  pensjonsaar: number
  pensjonsbeloep: number
  alder: number
}

declare type Pensjonsavtale = {
  type:
    | 'privat tjenestepensjon'
    | 'offentlig tjenestepensjon'
    | 'fripolise'
    | 'egen sparing'
  fra: string
  utbetalesFraAlder: number
  utbetalesTilAlder?: number
  aarligUtbetaling: number
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

declare type Person = {
  sivilstand: Sivilstand
}

declare type UnleashToggle = {
  enabled: boolean
}
