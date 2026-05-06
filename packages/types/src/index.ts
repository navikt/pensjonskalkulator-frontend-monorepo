import type { components } from './schema'

// Common types used across apps
export type Alder = components['schemas']['Alder']
export type Person = components['schemas']['PersonResultV6']

export type PersonInternV1 = components['schemas']['PersonInternV1Person']

// Used in ekstern app. Does not have "Samboer"
export type Sivilstand =
	components['schemas']['AlderspensjonDetaljerV4']['sivilstand']
export type PensjoneringAldre =
	components['schemas']['PersonResultV6']['pensjoneringAldre']
// New type for sivilstatus, used in intern app. Has "Samboer"
export type Sivilstatus =
	components['schemas']['SimuleringV1Spec']['sivilstatus']

export type EpsSivilstatus =
	components['schemas']['EpsV1SivilstatusResult']['sivilstatus']
// Inntekt
export type Inntekt = components['schemas']['InntektDto']

// Ekskludert status
export type EkskludertStatus = components['schemas']['EkskluderingStatusV1']
export type ApotekerStatus = components['schemas']['ApotekerStatusV1']

// AFP
export type AfpOffentligLivsvarig =
	components['schemas']['LivsvarigOffentligAfpResultV2']

// Loepende vedtak
export type LoependeVedtak = components['schemas']['LoependeVedtakV4']

// Vedtak
export type Vedtak = components['schemas']['VedtakV1Samling']

export type VedtakInformasjonOmAvdoed =
	components['schemas']['VedtakV1InformasjonOmAvdoed']

// Omstillingsstoenad
export type OmstillingsstoenadOgGjenlevende =
	components['schemas']['BrukerHarLoependeOmstillingsstoenadEllerGjenlevendeYtelse']

// Simulering
export type AlderspensjonRequestBody =
	components['schemas']['PersonligSimuleringSpecV9']
export type AlderspensjonSimuleringstype =
	components['schemas']['PersonligSimuleringSpecV9']['simuleringstype']
export type AlderspensjonResponseBody =
	components['schemas']['PersonligSimuleringResultV9']
export type Vilkaarsproeving =
	components['schemas']['PersonligSimuleringVilkaarsproevingResultV9']
export type VilkaarsproevingAlternativ =
	components['schemas']['PersonligSimuleringAlternativResultV9']
export type SimulertOpptjeningGrunnlag =
	components['schemas']['PersonligSimuleringAarligInntektResultV9']
export type AlderspensjonMaanedligVedEndring =
	components['schemas']['PersonligSimuleringMaanedligPensjonResultV9']
export type AfpEtterfulgtAvAlderspensjon =
	components['schemas']['PersonligSimuleringPre2025OffentligAfpResultV9']
export type HeltUttakSpec =
	components['schemas']['PersonligSimuleringHeltUttakSpecV9']
export type GradertUttakSpec =
	components['schemas']['PersonligSimuleringGradertUttakSpecV9']
export type AfpPrivatPensjonsberegning =
	components['schemas']['PersonligSimuleringAfpPrivatResultV9']
export type AfpPensjonsberegning =
	components['schemas']['PersonligSimuleringAarligPensjonResultV9']
export type AlderspensjonPensjonsberegning =
	components['schemas']['PersonligSimuleringAlderspensjonResultV9']
export type Pre2025OffentligPensjonsberegning =
	components['schemas']['PersonligSimuleringPre2025OffentligAfpResultV9']

// Simulering Intern
export type SimuleringRequestBody = components['schemas']['SimuleringV1Spec']
export type SimuleringsType =
	components['schemas']['SimuleringV1Spec']['simuleringstype']
export type SimuleringResponseBody = components['schemas']['SimuleringV1Result']
export type SimuleringVilkaarsproevingResultat =
	components['schemas']['SimuleringV1Vilkaarsproevingsresultat']
export type SimuleringUttaksparametre =
	components['schemas']['SimuleringV1Uttaksparametre']
export type TidsbegrensetOffentligAFP =
	components['schemas']['SimuleringV1TidsbegrensetOffentligAfp']
export type SimuleringAlderspensjon =
	components['schemas']['SimuleringV1Alderspensjon']
export type SimuleringMaanedligAlderspensjon =
	components['schemas']['SimuleringV1MaanedligAlderspensjon']
export type SimuleringAfpPrivat = components['schemas']['SimuleringV1PrivatAfp']
export type SimuleringAfpOffentlig =
	components['schemas']['SimuleringV1OffentligAfpSpec']
export type SimuleringGradertUttak =
	components['schemas']['SimuleringV1GradertUttakSpec']
export type SimuleringHeltUttak =
	components['schemas']['SimuleringV1HeltUttakSpec']
export type SimuleringAarligInntekt =
	components['schemas']['SimuleringV1AarligBeloep']
export type SimuleringUtenlandsperiode =
	components['schemas']['SimuleringV1UtenlandsperiodeSpec']
export type SimuleringAldersbestemtUtbetaling =
	components['schemas']['SimuleringV1AldersbestemtUtbetaling']
export type SimuleringMaanedligVedEndring =
	components['schemas']['SimuleringV1Uttaksbeloep']
export type Eps = components['schemas']['SimuleringV1EpsSpec']
export type LevendeEps = components['schemas']['SimuleringV1LevendeEps']
export type AvdoedEps = components['schemas']['SimuleringV1AvdoedEps']

// Pensjonsavtaler
export type PensjonsavtalerRequestBody =
	components['schemas']['PensjonsavtaleSpecV3']
export type PensjonsavtalerResponseBody =
	components['schemas']['PensjonsavtaleResultV3']
export type Utbetalingsperiode = components['schemas']['UtbetalingsperiodeV3']
export type UtbetalingsperiodeOffentligTP =
	components['schemas']['UtbetalingsperiodeV2']
export type Pensjonsavtale = components['schemas']['PensjonsavtaleV3']
export type PensjonsavtaleKategori =
	components['schemas']['PensjonsavtaleV3']['kategori']
export type UtilgjengeligeSelskap = components['schemas']['SelskapV3']

// Offentlig tjenestepensjon
export type OffentligTpRequestBody =
	components['schemas']['SimuleringOffentligTjenestepensjonSpecV2']
export type OffentligTp =
	components['schemas']['OffentligTjenestepensjonSimuleringResultV2']
export type SimulertTjenestepensjon =
	| components['schemas']['SimulertTjenestepensjonV2']
	| components['schemas']['SimulertTjenestepensjonFoer1963V1']
export type OffentligTpFoer1963RequestBody =
	components['schemas']['SimuleringOffentligTjenestepensjonFoer1963SpecV1']
export type OffentligTpFoer1963 =
	components['schemas']['OffentligTjenestepensjonSimuleringFoer1963ResultV1']
export type OffentligTpResponse = OffentligTp | OffentligTpFoer1963
export type UtbetalingsperiodeFoer1963 =
	components['schemas']['UtbetalingsperiodeFoer1963V1']

// Uttaksalder
export type TidligstMuligHeltUttakRequestBody =
	components['schemas']['UttaksalderSpecV3']
export type TidligstMuligGradertUttakRequestBody =
	components['schemas']['UttaksalderResultV3']

// Ansatt
export type Ansatt = components['schemas']['AnsattV1']

// Land
export type Land = components['schemas']['LandInfo']

// Unleash
export type UnleashToggle = components['schemas']['EnablementDto']

// Re-export schema for advanced usage
export type { components, paths, operations } from './schema'
export type Locales = 'nb' | 'nn' | 'en'

// EPS Opplysninger
export type EpsOpplysninger = components['schemas']['EpsV1Familierelasjon']
