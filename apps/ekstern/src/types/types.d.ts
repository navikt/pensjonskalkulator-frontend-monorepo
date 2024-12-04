import { paths } from './router/constants'
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
  type Sivilstand = components['schemas']['PersonV2']['sivilstand']
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

  // /v2/vedtak/loepende-vedtak
  export type GetLoependeVedtakQuery = TypedUseQueryStateResult<
    LoependeVedtak,
    void,
    BaseQueryFn<Record<string, unknown>, LoependeVedtak>
  >

  // LoependeVedtakDto
  type LoependeVedtak = components['schemas']['LoependeVedtakV2']

  // /simuler-oftp
  export type SimulerOffentligTpQuery = TypedUseQueryStateResult<
    OffentligTp,
    void,
    BaseQueryFn<Record<string, unknown>, OffentligTp>
  >
  type OffentligTpRequestBody =
    components['schemas']['IngressSimuleringOffentligTjenestepensjonSpecV1']
  type OffentligTp =
    components['schemas']['OffentligTjenestepensjonSimuleringsresultatDtoV1']

  // /tidligste-uttaksalder
  type TidligstMuligHeltUttakRequestBody =
    components['schemas']['IngressUttaksalderSpecForHeltUttakV1']
  type TidligstMuligGradertUttakRequestBody =
    components['schemas']['IngressUttaksalderSpecForGradertUttakV1']

  // /pensjonsavtaler
  type PensjonsavtalerRequestBody =
    components['schemas']['PensjonsavtaleSpecV3']
  type PensjonsavtalerResponseBody =
    components['schemas']['PensjonsavtaleResultV3']
  type Utbetalingsperiode = components['schemas']['UtbetalingsperiodeV3']
  type UtbetalingsperiodeWithoutGrad = Omit<Utbetalingsperiode, 'grad'>
  type Pensjonsavtale = components['schemas']['PensjonsavtaleV3'] & {
    key?: number
  }
  type PensjonsavtaleKategori =
    components['schemas']['PensjonsavtaleV3']['kategori']
  type UtilgjengeligeSelskap = components['schemas']['SelskapV3']

  // /simulering/alderspensjon
  type AlderspensjonRequestBody =
    components['schemas']['IngressSimuleringSpecV7']
  type AlderspensjonSimuleringstype =
    components['schemas']['IngressSimuleringSpecV7']['simuleringstype']
  type AlderspensjonResponseBody = components['schemas']['SimuleringResultatV7']
  type Vilkaarsproeving = components['schemas']['VilkaarsproevingV7']
  type VilkaarsproevingAlternativ = components['schemas']['AlternativV7']
  type SimulertOpptjeningGrunnlag =
    components['schemas']['SimulertOpptjeningGrunnlagV7']
  type AlderspensjonMaanedligVedEndring =
    components['schemas']['AlderspensjonsMaanedligV7']
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
    components['schemas']['IngressSimuleringHeltUttakV7'],
    'aarligInntektVsaPensjon'
  > & {
    aarligInntektVsaPensjon?: AarligInntektVsaPensjon
  }

  type GradertUttak = Omit<
    components['schemas']['IngressSimuleringGradertUttakV7'],
    'aarligInntektVsaPensjonBeloep'
  > & {
    aarligInntektVsaPensjonBeloep?: string
  }

  type Simuleringstype =
    components['schemas']['IngressSimuleringSpecV7']['simuleringstype']
  type Pensjonsberegning = components['schemas']['PensjonsberegningV7']
  type PensjonsberegningMedDetaljer =
    components['schemas']['AlderspensjonsberegningV7']

  type Ansatt = components['schemas']['AnsattV1']

  type BeregningVisning = 'enkel' | 'avansert'
}
