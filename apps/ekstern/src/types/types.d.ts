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
  type TidligsteHelUttaksalderRequestBody =
    components['schemas']['IngressUttaksalderSpecForHeltUttakV1']
  type TidligsteGradertUttaksalderRequestBody =
    components['schemas']['IngressUttaksalderSpecForGradertUttakV1']

  // /pensjonsavtaler
  type PensjonsavtalerRequestBody =
    components['schemas']['PensjonsavtaleIngressSpecDtoV2']
  type PensjonsavtalerResponseBody = components['schemas']['PensjonsavtalerDto']
  type Utbetalingsperiode = components['schemas']['UtbetalingsperiodeDto']
  type Pensjonsavtale = components['schemas']['PensjonsavtaleDto'] & {
    key?: number
  }
  type PensjonsavtaleKategori =
    components['schemas']['PensjonsavtaleDto']['kategori']
  type UtilgjengeligeSelskap = components['schemas']['SelskapDto']

  // / alderspensjon
  type AlderspensjonRequestBody =
    components['schemas']['SimuleringIngressSpecDto']
  type AlderspensjonResponseBody =
    components['schemas']['SimuleringsresultatDto']

  type HeltUttaksperiode =
    components['schemas']['SimuleringHeltUttakIngressDtoV2']
  type GradertUttaksperiode =
    components['schemas']['SimuleringGradertUttakIngressDtoV2']

  type Simuleringstype =
    components['schemas']['SimuleringSpecDto']['simuleringstype']
  type Pensjonsberegning = {
    beloep: number
    alder: number
  }
}
