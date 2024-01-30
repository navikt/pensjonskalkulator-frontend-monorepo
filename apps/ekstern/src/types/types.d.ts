import { components } from './schema'

declare global {
  type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>
  }

  type Locales = 'nb' | 'nn' | 'en'

  type AfpRadio = 'ja_offentlig' | 'ja_privat' | 'nei' | 'vet_ikke'
  type Alder = components['schemas']['Alder']
  type UnleashToggle = components['schemas']['EnablementDto']

  // /person
  type Person = components['schemas']['ApiPersonDto']
  type Sivilstand = components['schemas']['ApiPersonDto']['sivilstand']
  type UtvidetSivilstand = Sivilstand | 'SAMBOER'

  // /inntekt
  type Inntekt = components['schemas']['InntektDto']

  // /ekskludert-status
  type EkskludertStatus = components['schemas']['EkskluderingStatusV1']

  // /tpo-medlemskap
  type TpoMedlemskap = components['schemas']['TjenestepensjonsforholdDto']

  // /tidligste-uttaksalder
  type TidligsteHelUttaksalderRequestBody =
    components['schemas']['IngressUttaksalderSpecForHeltUttakV1']
  type TidligsteGradertUttaksalderRequestBody =
    components['schemas']['IngressUttaksalderSpecForGradertUttakV1']

  // /pensjonsavtaler
  type PensjonsavtalerRequestBody =
    components['schemas']['IngressPensjonsavtaleSpecV2']
  type PensjonsavtalerResponseBody = components['schemas']['PensjonsavtalerDto']
  type Utbetalingsperiode = components['schemas']['UtbetalingsperiodeDto']
  type Pensjonsavtale = components['schemas']['PensjonsavtaleDto'] & {
    key?: number
  }
  type PensjonsavtaleKategori =
    components['schemas']['PensjonsavtaleDto']['kategori']
  type UtilgjengeligeSelskap = components['schemas']['SelskapDto']

  // /simulering/alderspensjon
  type AlderspensjonRequestBody =
    components['schemas']['IngressSimuleringSpecV2']
  type AlderspensjonResponseBody =
    components['schemas']['SimuleringsresultatDto']

  type HeltUttaksperiode = components['schemas']['IngressSimuleringHeltUttakV2']
  type GradertUttaksperiode =
    components['schemas']['IngressSimuleringGradertUttakV2']

  type Simuleringstype =
    components['schemas']['IngressSimuleringSpecV2']['simuleringstype']
  type Pensjonsberegning = {
    beloep: number
    alder: number
  }
}
