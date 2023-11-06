import { components } from './schema'

declare global {
  type AfpRadio = 'ja_offentlig' | 'ja_privat' | 'nei' | 'vet_ikke'
  type Alder = components['schemas']['Alder']

  type UnleashToggle = components['schemas']['EnablementDto']

  // /person
  type Person = components['schemas']['PersonDto']
  type Sivilstand = components['schemas']['PersonDto']['sivilstand']
  // TODO fikse i utvidetSivilstand, da alle tydeligvis kan ha SAMBOER?
  type UtvidetSivilstand = Sivilstand | 'SAMBOER'

  // /inntekt
  type Inntekt = components['schemas']['InntektDto']

  // /sak-status
  type SakStatus = components['schemas']['SakDto']

  // /pensjonsavtaler
  type Utbetalingsperiode = components['schemas']['UtbetalingsperiodeDto']
  type Pensjonsavtale = components['schemas']['PensjonsavtaleDto'] & {
    key?: number
  }
  type PensjonsavtaleKategori =
    components['schemas']['PensjonsavtaleDto']['kategori']
  type UtilgjengeligeSelskap = components['schemas']['SelskapDto']

  // / alderspensjon
  declare type Pensjonsberegning = {
    beloep: number
    alder: number
  }

  // /tpo-medlemskap
  type TpoMedlemskap = components['schemas']['TjenestepensjonsforholdDto']
}
