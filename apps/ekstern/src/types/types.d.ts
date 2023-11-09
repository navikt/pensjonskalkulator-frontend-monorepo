import { components } from './schema'

declare global {
  type AfpRadio = 'ja_offentlig' | 'ja_privat' | 'nei' | 'vet_ikke'
  type Alder = components['schemas']['Alder']
  type UnleashToggle = components['schemas']['EnablementDto']

  // /person
  type Person = components['schemas']['ApiPersonDto']
  type Sivilstand = components['schemas']['ApiPersonDto']['sivilstand']
  type UtvidetSivilstand = Sivilstand | 'SAMBOER'

  // /inntekt
  type Inntekt = components['schemas']['InntektDto']

  // /sak-status
  type SakStatus = components['schemas']['SakDto']

  // /tpo-medlemskap
  type TpoMedlemskap = components['schemas']['TjenestepensjonsforholdDto']

  // /tidligste-uttaksalder
  type TidligsteUttaksalderRequestBody =
    components['schemas']['UttaksalderIngressSpecDto']

  // /pensjonsavtaler
  type PensjonsavtalerRequestBody =
    components['schemas']['PensjonsavtaleIngressSpecDto']
  type PensjonsavtalerResponseBody = components['schemas']['PensjonsavtalerDto']
  type Utbetalingsperiode = components['schemas']['UtbetalingsperiodeDto']
  type Pensjonsavtale = components['schemas']['PensjonsavtaleDto'] & {
    key?: number
  }
  type PensjonsavtaleKategori =
    components['schemas']['PensjonsavtaleDto']['kategori']
  type UtilgjengeligeSelskap = components['schemas']['SelskapDto']

  // / alderspensjon
  type AlderspensjonRequestBody = components['schemas']['SimuleringSpecDto']
  type AlderspensjonResponseBody =
    components['schemas']['SimuleringsresultatDto']
  type Simuleringstype =
    components['schemas']['SimuleringSpecDto']['simuleringstype']
  type Pensjonsberegning = {
    beloep: number
    alder: number
  }
}
