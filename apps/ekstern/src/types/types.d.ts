import { components } from './schema'

declare global {
  type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>
  }

  type Locales = 'nb' | 'nn' | 'en'

  type Path = (typeof paths)[number]

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
  export type GetInntektQuery = TypedUseQueryStateResult<
    Inntekt,
    void,
    BaseQueryFn<Record<string, unknown>, Inntekt>
  >
  type Inntekt = components['schemas']['InntektDto']

  // /ekskludert-status
  export type GetEkskludertStatusQuery = TypedUseQueryStateResult<
    EkskludertStatus,
    void,
    BaseQueryFn<Record<string, unknown>, Person>
  >
  type EkskludertStatus = components['schemas']['EkskluderingStatusV1']

  // /loepende-omstillingsstoenad-eller-gjenlevendeytelse
  type OmstillingsstoenadOgGjenlevende =
    components['schemas']['BrukerHarLoependeOmstillingsstoenadEllerGjenlevendeYtelse']

  // /ufoeregrad
  type Ufoeregrad = components['schemas']['UfoeregradDto']

  // /tpo-medlemskap
  export type TpoMedlemskapQuery = TypedUseQueryStateResult<
    TpoMedlemskap,
    void,
    BaseQueryFn<Record<string, unknown>, TpoMedlemskap>
  >
  type TpoMedlemskap =
    components['schemas']['MedlemskapITjenestepensjonsordningDto']

  // /tidligste-uttaksalder
  type TidligstMuligHeltUttakRequestBody =
    components['schemas']['IngressUttaksalderSpecForHeltUttakV1']
  type TidligstMuligGradertUttakRequestBody =
    components['schemas']['IngressUttaksalderSpecForGradertUttakV1']

  // /pensjonsavtaler
  type PensjonsavtalerRequestBody =
    components['schemas']['PensjonsavtaleSpecV2']
  type PensjonsavtalerResponseBody =
    components['schemas']['PensjonsavtaleResultV2']
  type Utbetalingsperiode = components['schemas']['UtbetalingsperiodeV2']
  type Pensjonsavtale = components['schemas']['PensjonsavtaleV2'] & {
    key?: number
  }
  type PensjonsavtaleKategori =
    components['schemas']['PensjonsavtaleV2']['kategori']
  type UtilgjengeligeSelskap = components['schemas']['SelskapV2']

  // /simulering/alderspensjon
  type AlderspensjonRequestBody =
    components['schemas']['IngressSimuleringSpecV6']
  type AfpSimuleringstype =
    components['schemas']['IngressSimuleringSpecV6']['simuleringstype']
  type AlderspensjonResponseBody = components['schemas']['SimuleringResultatV6']
  type Vilkaarsproeving = components['schemas']['VilkaarsproevingV6']
  type VilkaarsproevingAlternativ = components['schemas']['AlternativV6']
  type SimulertOpptjeningGrunnlag =
    components['schemas']['SimulertOpptjeningGrunnlagV6']
  type AarligInntektVsaPensjon = {
    beloep: string
    sluttAlder: Alder
  }

  type Land = components['schemas']['LandInfo']
  type Utenlandsperiode = {
    id: string
    landkode: string
    arbeidetUtenlands: boolean | null
    startdato: string
    sluttdato?: string
  }

  type HeltUttak = Omit<
    components['schemas']['IngressSimuleringHeltUttakV6'],
    'aarligInntektVsaPensjon'
  > & {
    aarligInntektVsaPensjon?: AarligInntektVsaPensjon
  }

  type GradertUttak = Omit<
    components['schemas']['IngressSimuleringGradertUttakV6'],
    'aarligInntektVsaPensjonBeloep'
  > & {
    aarligInntektVsaPensjonBeloep?: string
  }

  type Simuleringstype =
    components['schemas']['IngressSimuleringSpecV6']['simuleringstype']
  type Pensjonsberegning = components['schemas']['PensjonsberegningV6']
  type PensjonsberegningMedDetaljer =
    components['schemas']['AlderspensjonsberegningV6']

  type Ansatt = components['schemas']['AnsattV1']

  type BeregningVisning = 'enkel' | 'avansert'
}
