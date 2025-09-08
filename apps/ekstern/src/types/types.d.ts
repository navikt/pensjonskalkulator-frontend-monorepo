import { components } from './schema'

declare global {
  type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>
  }

  type Locales = 'nb' | 'nn' | 'en'

  type BooleanRadio = 'ja' | 'nei'
  type AfpRadio = 'ja_offentlig' | 'ja_privat' | 'nei' | 'vet_ikke'
  type AfpUtregningValg =
    | 'KUN_ALDERSPENSJON'
    | 'AFP_ETTERFULGT_AV_ALDERSPENSJON'
    | null
  type BeregningVisning = 'enkel' | 'avansert'
  type Beregningsvalg = 'uten_afp' | 'med_afp'
  type Alder = components['schemas']['Alder']

  type UnleashToggle = components['schemas']['EnablementDto']

  // fetching av landliste
  type Land = components['schemas']['LandInfo']
  type Utenlandsperiode = {
    id: string
    landkode: string
    arbeidetUtenlands: boolean | null
    startdato: string
    sluttdato?: string
  }
  // /ansatt-id
  type Ansatt = components['schemas']['AnsattV1']

  // /person
  type Person = components['schemas']['PersonResultV5']
  type Sivilstand =
    components['schemas']['AlderspensjonDetaljerV4']['sivilstand']
  type pensjoneringAldre =
    components['schemas']['PersonResultV5']['pensjoneringAldre']

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
  type ApotekerStatusV1 = components['schemas']['ApotekerStatusV1']

  // /loepende-omstillingsstoenad-eller-gjenlevendeytelse
  type OmstillingsstoenadOgGjenlevende =
    components['schemas']['BrukerHarLoependeOmstillingsstoenadEllerGjenlevendeYtelse']

  // /v4/vedtak/loepende-vedtak
  type LoependeVedtak = components['schemas']['LoependeVedtakV4']

  // /tidligste-uttaksalder
  type TidligstMuligHeltUttakRequestBody =
    components['schemas']['UttaksalderSpecV2']
  type TidligstMuligGradertUttakRequestBody =
    components['schemas']['UttaksalderResultV2']

  // /simulering/alderspensjon
  type AlderspensjonRequestBody =
    components['schemas']['PersonligSimuleringSpecV8']
  type AlderspensjonSimuleringstype =
    components['schemas']['PersonligSimuleringSpecV8']['simuleringstype']
  type AlderspensjonResponseBody =
    components['schemas']['PersonligSimuleringResultV8']
  type Vilkaarsproeving =
    components['schemas']['PersonligSimuleringVilkaarsproevingResultV8']
  type VilkaarsproevingAlternativ =
    components['schemas']['PersonligSimuleringAlternativResultV8']
  type SimulertOpptjeningGrunnlag =
    components['schemas']['PersonligSimuleringAarligInntektResultV8']
  type AlderspensjonMaanedligVedEndring =
    components['schemas']['PersonligSimuleringMaanedligPensjonResultV8']
  type AfpEtterfulgtAvAlderspensjon =
    components['schemas']['PersonligSimuleringPre2025OffentligAfpResultV8']
  type AarligInntektVsaPensjon = {
    beloep: string
    sluttAlder: Alder
  }
  type HeltUttak = Omit<
    components['schemas']['PersonligSimuleringHeltUttakSpecV8'],
    'aarligInntektVsaPensjon'
  > & {
    aarligInntektVsaPensjon?: AarligInntektVsaPensjon
  }

  type GradertUttak = Omit<
    components['schemas']['PersonligSimuleringGradertUttakSpecV8'],
    'aarligInntektVsaPensjonBeloep'
  > & {
    aarligInntektVsaPensjonBeloep?: string
  }
  type AfpPrivatPensjonsberegning =
    components['schemas']['PersonligSimuleringAfpPrivatResultV8']
  type AfpPensjonsberegning =
    components['schemas']['PersonligSimuleringAarligPensjonResultV8']
  type AlderspensjonPensjonsberegning =
    components['schemas']['PersonligSimuleringAlderspensjonResultV8']
  type pre2025OffentligPensjonsberegning =
    components['schemas']['PersonligSimuleringPre2025OffentligAfpResultV8']
  // /pensjonsavtaler
  type PensjonsavtalerRequestBody =
    components['schemas']['PensjonsavtaleSpecV3']
  type PensjonsavtalerResponseBody =
    components['schemas']['PensjonsavtaleResultV3']
  type Utbetalingsperiode = components['schemas']['UtbetalingsperiodeV3']
  type UtbetalingsperiodeOffentligTP =
    components['schemas']['UtbetalingsperiodeV2']
  type Pensjonsavtale = components['schemas']['PensjonsavtaleV3'] & {
    key?: number
  }
  type PensjonsavtaleKategori =
    components['schemas']['PensjonsavtaleV3']['kategori']
  type UtilgjengeligeSelskap = components['schemas']['SelskapV3']

  // /simuler-oftp
  export type SimulerOffentligTpQuery = TypedUseQueryStateResult<
    OffentligTp,
    void,
    BaseQueryFn<Record<string, unknown>, OffentligTp>
  >
  type OffentligTpRequestBody =
    components['schemas']['SimuleringOffentligTjenestepensjonSpecV2']
  type OffentligTp =
    components['schemas']['OffentligTjenestepensjonSimuleringResultV2']
  type SimulertTjenestepensjon =
    components['schemas']['SimulertTjenestepensjonV2']
}

declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      ['representasjon-banner']: CustomElement<{
        representasjonstyper?: string
        redirectTo: string
        style?: React.CSSProperties
      }>
    }
  }
}
