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
  type: 'tjenestepensjon' | 'fripolise' | 'offentlig tjenestepensjon'
  fra: string
  utbetalesFraAlder: number
  utbetalesTilAlder?: number
  aarligUtbetaling: number
}

declare type Sivilstand = {
  gift: boolean
  samboer: boolean
}
