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
  type Person = components['schemas']['PersonResultV6']
  type Sivilstand =
    components['schemas']['AlderspensjonDetaljerV4']['sivilstand']
  type pensjoneringAldre =
    components['schemas']['PersonResultV6']['pensjoneringAldre']
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

  // /v2/tpo-livsvarig-offentlig-afp
  type AfpOffentligLivsvarig =
    components['schemas']['LivsvarigOffentligAfpResultV2']

  // /loepende-omstillingsstoenad-eller-gjenlevendeytelse
  type OmstillingsstoenadOgGjenlevende =
    components['schemas']['BrukerHarLoependeOmstillingsstoenadEllerGjenlevendeYtelse']

  // /v4/vedtak/loepende-vedtak
  type LoependeVedtak = components['schemas']['LoependeVedtakV4']

  // /tidligste-uttaksalder
  type TidligstMuligHeltUttakRequestBody =
    components['schemas']['UttaksalderSpecV3']
  type TidligstMuligGradertUttakRequestBody =
    components['schemas']['UttaksalderResultV3']

  // /simulering/alderspensjon
  type AlderspensjonRequestBody =
    components['schemas']['PersonligSimuleringSpecV9']
  type AlderspensjonSimuleringstype =
    components['schemas']['PersonligSimuleringSpecV9']['simuleringstype']
  type AlderspensjonResponseBody =
    components['schemas']['PersonligSimuleringResultV9']
  type Vilkaarsproeving =
    components['schemas']['PersonligSimuleringVilkaarsproevingResultV9']
  type VilkaarsproevingAlternativ =
    components['schemas']['PersonligSimuleringAlternativResultV9']
  type SimulertOpptjeningGrunnlag =
    components['schemas']['PersonligSimuleringAarligInntektResultV9']
  type AlderspensjonMaanedligVedEndring =
    components['schemas']['PersonligSimuleringMaanedligPensjonResultV9']
  type AfpEtterfulgtAvAlderspensjon =
    components['schemas']['PersonligSimuleringPre2025OffentligAfpResultV9']
  type AarligInntektVsaPensjon = {
    beloep: string
    sluttAlder: Alder
  }
  type HeltUttak = Omit<
    components['schemas']['PersonligSimuleringHeltUttakSpecV9'],
    'aarligInntektVsaPensjon'
  > & {
    aarligInntektVsaPensjon?: AarligInntektVsaPensjon
  }

  type GradertUttak = Omit<
    components['schemas']['PersonligSimuleringGradertUttakSpecV9'],
    'aarligInntektVsaPensjonBeloep'
  > & {
    aarligInntektVsaPensjonBeloep?: string
  }
  type AfpPrivatPensjonsberegning =
    components['schemas']['PersonligSimuleringAfpPrivatResultV9']
  type AfpPensjonsberegning =
    components['schemas']['PersonligSimuleringAarligPensjonResultV9']
  type AlderspensjonPensjonsberegning =
    components['schemas']['PersonligSimuleringAlderspensjonResultV9']
  type pre2025OffentligPensjonsberegning =
    components['schemas']['PersonligSimuleringPre2025OffentligAfpResultV9']
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
    | components['schemas']['SimulertTjenestepensjonV2']
    | components['schemas']['SimulertTjenestepensjonFoer1963V1']
  // /simuler-oftp/foer-1963
  type OffentligTpFoer1963RequestBody =
    components['schemas']['SimuleringOffentligTjenestepensjonFoer1963SpecV1']
  type OffentligTpFoer1963 =
    components['schemas']['OffentligTjenestepensjonSimuleringFoer1963ResultV1']
  // Union type for both offentlig tp responses
  type OffentligTpResponse = OffentligTp | OffentligTpFoer1963
  type UtbetalingsperiodeFoer1963 =
    components['schemas']['UtbetalingsperiodeFoer1963V1']
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
