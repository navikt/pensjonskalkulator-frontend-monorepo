import { components } from './schema'

declare global {
  type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>
  }

  type Locales = 'nb' | 'nn' | 'en'

  type BooleanRadio = 'ja' | 'nei'

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
  type TidligstMuligHeltUttakRequestBody =
    components['schemas']['IngressUttaksalderSpecForHeltUttakV1']
  type TidligstMuligGradertUttakRequestBody =
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
    components['schemas']['IngressSimuleringSpecV4']
  type AfpSimuleringstype =
    components['schemas']['IngressSimuleringSpecV4']['simuleringstype']
  type AlderspensjonResponseBody = components['schemas']['SimuleringResultatV4']
  type Vilkaarsproeving = components['schemas']['VilkaarsproevingV4']
  type AarligInntektVsaPensjon = {
    beloep: string
    sluttAlder: Alder
  }

  type HeltUttak = Omit<
    components['schemas']['IngressSimuleringHeltUttakV4'],
    'aarligInntektVsaPensjon'
  > & {
    aarligInntektVsaPensjon?: AarligInntektVsaPensjon
  }

  type GradertUttak = Omit<
    components['schemas']['IngressSimuleringGradertUttakV4'],
    'aarligInntektVsaPensjonBeloep'
  > & {
    aarligInntektVsaPensjonBeloep?: string
  }

  type Simuleringstype =
    components['schemas']['IngressSimuleringSpecV4']['simuleringstype']
  type AfpOffentlig = components['schemas']['AfpOffentligV4']
  type Pensjonsberegning = {
    beloep: number
    alder: number
  }

  type BeregningVisning = 'enkel' | 'avansert'
}
