declare type AfpRadio = 'ja_offentlig' | 'ja_privat' | 'nei' | 'vet_ikke'

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
  produktbetegnelse: string
  kategori: PensjonsavtaleKategori
  startAlder: number
  startMaaned: number
  utbetalingsperiode: {
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

declare type UtvidetSivilstand = Sivilstand | 'SAMBOER'

declare type Step = '0' | '1' | '2' | '3'

declare type Person = {
  fornavn: string | null
  sivilstand: Sivilstand | null
  foedselsdato: string | null
}

declare type TpoMedlemskap = {
  harTjenestepensjonsforhold: boolean
}

declare type UnleashToggle = {
  enabled: boolean
}
