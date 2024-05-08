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
  export type GetPersonQuery = TypedUseQueryStateResult<
    Person,
    void,
    BaseQueryFn<Record<string, unknown>, Person>
  >
  type Person = components['schemas']['PersonV2']
  type Sivilstand = components['schemas']['ApiPersonDto']['sivilstand']
  type UtvidetSivilstand = Sivilstand | 'SAMBOER'

  // /inntekt
  type Inntekt = components['schemas']['InntektDto']

  // /ekskludert-status
  export type GetEkskludertStatusQuery = TypedUseQueryStateResult<
    EkskludertStatus,
    void,
    BaseQueryFn<Record<string, unknown>, Person>
  >
  type EkskludertStatus = components['schemas']['EkskluderingStatusV1']

  // /tpo-medlemskap
  export type TpoMedlemskapQuery = TypedUseQueryStateResult<
    TpoMedlemskap,
    void,
    BaseQueryFn<Record<string, unknown>, TpoMedlemskap>
  >
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
    components['schemas']['IngressSimuleringSpecV5']
  type AfpSimuleringstype =
    components['schemas']['IngressSimuleringSpecV5']['simuleringstype']
  type AlderspensjonResponseBody = components['schemas']['SimuleringResultatV5']
  type Vilkaarsproeving = components['schemas']['VilkaarsproevingV5']
  type AarligInntektVsaPensjon = {
    beloep: string
    sluttAlder: Alder
  }

  type HeltUttak = Omit<
    components['schemas']['IngressSimuleringHeltUttakV5'],
    'aarligInntektVsaPensjon'
  > & {
    aarligInntektVsaPensjon?: AarligInntektVsaPensjon
  }

  type GradertUttak = Omit<
    components['schemas']['IngressSimuleringGradertUttakV5'],
    'aarligInntektVsaPensjonBeloep'
  > & {
    aarligInntektVsaPensjonBeloep?: string
  }

  type Simuleringstype =
    components['schemas']['IngressSimuleringSpecV5']['simuleringstype']
  type AfpPrivat = components['schemas']['AfpPrivatV5']
  type AfpOffentlig = components['schemas']['AfpOffentligV5']
  type Pensjonsberegning = {
    beloep: number
    alder: number
  }

  type Ansatt = components['schemas']['AnsattV1']

  type BeregningVisning = 'enkel' | 'avansert'
}
