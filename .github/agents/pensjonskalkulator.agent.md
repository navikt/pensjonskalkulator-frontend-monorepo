---
name: pensjonskalkulator-agent
description: Comprehensive domain expert for NAV's pensjonskalkulator frontend — pension types, step flows, state management, simulation logic, guard system, and business rules
tools:
  - execute
  - read
  - edit
  - search
---

# Pensjonskalkulator Agent

Domain expert for NAV's pension calculator frontend monorepo. The main app is at `apps/ekstern/`. This agent encodes the complete domain model, user flows, state architecture, component hierarchy, and business rules needed to work effectively on this codebase.

---

## 1. Domain Model — Pension Types & Key Concepts

### Pension Types

| Type                               | Description                                                                                                                                                                 | Series Color                   |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| **Alderspensjon**                  | State old-age pension (folketrygd). Always present.                                                                                                                         | Deep blue (`--a-deepblue-500`) |
| **AFP Privat**                     | Contractual early retirement, private sector. Livsvarig (lifelong).                                                                                                         | Purple (`--a-purple-400`)      |
| **AFP Offentlig Livsvarig**        | Public sector AFP, lifelong component. Fetched separately via `/v2/tpo-livsvarig-offentlig-afp`.                                                                            | Purple                         |
| **Pre-2025 Offentlig AFP**         | Legacy public AFP for overgangskull (born 1954–1962). AFP from age 62–66, then alderspensjon from 67. Simuleringstype: `PRE2025_OFFENTLIG_AFP_ETTERFULGT_AV_ALDERSPENSJON`. | Purple                         |
| **Uføretrygd**                     | Disability pension. Has a `grad` (percentage). Affects AFP eligibility and uttaksgrad constraints. Not simulated — comes from `loependeVedtak`.                             | N/A                            |
| **Pensjonsavtaler (private)**      | Private pension agreements fetched from Norsk Pensjon. Requires `samtykke`.                                                                                                 | Green (`--a-data-surface-5`)   |
| **Offentlig Tjenestepensjon (TP)** | Public service pension. Two variants: `fra-1963` (POST `/v2/simuler-oftp/fra-1963`) and `foer-1963` (POST `/v2/simuler-oftp/foer-1963`).                                    | Green                          |
| **Pensjonsgivende inntekt**        | Taxable income. Shown in chart as income before/during/after pension.                                                                                                       | Gray (`--a-gray-500`)          |

### Key Domain Terms

- **Uttaksalder** (`Alder: { aar: number, maaneder: number }`): Withdrawal age for pension. Has nedreAldersgrense (minimum), normertPensjonsalder (standard), and oevreAldersgrense (maximum, typically 75).
- **Kap19 / Kap20**: Chapter 19 (old) vs Chapter 20 (new) pension calculation rules. Users born before 1963 may have both (andelsbrøk).
- **Overgangskull**: Transitional cohort born 1954–1962. May choose AFP etterfulgt av alderspensjon.
- **Endring**: Modification of an existing running pension (løpende vedtak with alderspensjon).
- **Løpende vedtak**: User's current active pension decisions — includes alderspensjon (grad, sivilstand, fom), uføretrygd (grad), afpPrivat (fom), afpOffentlig (fom), fremtidigAlderspensjon (grad, fom).
- **Grunnbeløp (G)**: Base amount from folketrygden. Fetched externally from `https://g.nav.no/api/v1/grunnbeløp`.
- **EPS**: Ektefelle/partner/samboer — spouse. Fields: `epsHarPensjon`, `epsHarInntektOver2G`.
- **Samtykke**: Consent for looking up private pensjonsavtaler from Norsk Pensjon.
- **SamtykkeOffentligAFP**: Consent for fetching offentlig AFP livsvarig data.
- **Sivilstand**: Civil status. Values: `UGIFT, GIFT, ENKE_ELLER_ENKEMANN, SKILT, SEPARERT, REGISTRERT_PARTNER, SEPARERT_PARTNER, SKILT_PARTNER, GJENLEVENDE_PARTNER, SAMBOER` (SAMBOER only valid in vedtak context).
- **Apoteker**: Pharmacist — special case. Detected via `/v1/er-apoteker`. Affects step flow (treated like kap19 for navigation). Uses `erApoteker` flag.
- **Beregningsvalg**: `'uten_afp' | 'med_afp'` — only for users with gradert uføretrygd + AFP. Determines whether simulation includes AFP.
- **AfpUtregningValg**: `'AFP_ETTERFULGT_AV_ALDERSPENSJON' | 'KUN_ALDERSPENSJON'` — for overgangskull choosing how to calculate offentlig AFP.
- **Vilkaarsproeving**: Eligibility check result from simulation. Contains `vilkaarErOppfylt: boolean` and optional `alternativ` with suggested ages.

### Simuleringstype (AlderspensjonSimuleringstype)

Determined by `getSimuleringstypeFromRadioEllerVedtak()` in `state/api/utils.ts`:

| Simuleringstype                                     | Condition                         |
| --------------------------------------------------- | --------------------------------- |
| `ALDERSPENSJON`                                     | Default, no AFP                   |
| `ALDERSPENSJON_MED_AFP_PRIVAT`                      | AFP = ja_privat                   |
| `ALDERSPENSJON_MED_AFP_OFFENTLIG_LIVSVARIG`         | AFP = ja_offentlig                |
| `ENDRING_ALDERSPENSJON`                             | Has existing alderspensjon vedtak |
| `ENDRING_ALDERSPENSJON_MED_AFP_PRIVAT`              | Endring + AFP privat              |
| `ENDRING_ALDERSPENSJON_MED_AFP_OFFENTLIG_LIVSVARIG` | Endring + AFP offentlig           |
| `PRE2025_OFFENTLIG_AFP_ETTERFULGT_AV_ALDERSPENSJON` | skalBeregneAfpKap19 = true        |

Priority: Endring checks first → skalBeregneAfpKap19 → ufoeregrad special handling → standard AFP switch.

---

## 2. User Flows

### Flow Selection Logic

Three step order arrays in `src/router/constants.ts`:

**Standard flow** (`stegvisningOrder`):

```
/login → /start → /sivilstand → /utenlandsopphold → /afp → /ufoeretrygd-afp → /samtykke-offentlig-afp → /samtykke → /beregning
```

**Endring flow** (`stegvisningOrderEndring`) — user has existing alderspensjon:

```
/login → /start → /afp → /ufoeretrygd-afp → /samtykke-offentlig-afp → /beregning-detaljert
```

Skips sivilstand, utenlandsopphold, samtykke. Goes directly to avansert beregning.

**Kap19/Apoteker flow** (`stegvisningOrderKap19`) — born before 1963 OR is apoteker:

```
/login → /start → /sivilstand → /utenlandsopphold → /afp → /samtykke → /beregning
```

Skips ufoeretrygd-afp and samtykke-offentlig-afp.

**Flow selection** via `getStepArrays(isEndring, isKap19OrApoteker)`:

- `isEndring` = `isLoependeVedtakEndring(loependeVedtak)` (has alderspensjon vedtak)
- `isKap19OrApoteker` = `isOvergangskull(foedselsdato) || erApoteker`

### Veileder Mode

- Entry: `src/main-veileder.tsx` → `<VeilederInput />` component
- Basename: `/pensjon/kalkulator/veileder` (vs `/pensjon/kalkulator` for borger)
- Two-phase UI: first enter borger's fødselsnummer → encrypted via `/v1/encrypt` → then shows full calculator
- `veilederBorgerFnr`/`veilederBorgerEncryptedFnr` stored in Redux, encrypted FNR sent as `fnr` header on all API requests
- Veileder skips landing page (guard redirects to `/start`)
- Cancel button hidden for veileder (`onCancel = undefined`)
- Auto-redirects after 1 hour of inactivity
- `flush` action preserves veileder FNR fields

### Beregning Mode Selection

`beregningEnkelAccessGuard` redirects `/beregning` → `/beregning-detaljert` when:

- `skalBeregneAfpKap19` is true, OR
- `loependeVedtak.alderspensjon` exists (endring), OR
- `harSamtykketPensjonsavtaler && skalBeregneKunAlderspensjon`

Users can toggle between enkel/avansert via UI buttons (unless forced to avansert).

---

## 3. Step Wizard — Exact Steps, Data Collected, Skip Conditions

### `/login` — LandingPage

- Shows "Enkel kalkulator" button → navigates to `/start`
- If not logged in, also shows "Uinnlogget kalkulator" link
- **Skip**: Veileder redirected to `/start`

### `/start` — StepStart

- **Loader fetches** (parallel): vedlikeholdsmodus toggle, getPerson, getLoependeVedtak. Background: getInntekt, getOmstillingsstoenadOgGjenlevende, getGrunnbeloep, getErApoteker.
- **Error handling**: 403 + INVALID_REPRESENTASJON → `/ingen-tilgang`; 403 + INSUFFICIENT_LEVEL_OF_ASSURANCE → `/for-lavt-sikkerhetsnivaa`; other → `/uventet-feil`
- **Vedlikeholdsmodus** → redirects to `/kalkulatoren-virker-ikke`
- **Age 75+**: Shows `StartForBrukereFyllt75` (links to dinPensjonInnlogget, no wizard)
- **Pre2025OffentligAfp + alderspensjon.grad===0**: Navigates directly to `/beregning-detaljert`
- **Collects**: Nothing (informational). Shows ingress variant based on endring/pre2025/standard.

### `/sivilstand` — StepSivilstand

- **Skip**: If endring AND (kap19 OR erApoteker)
- **Collects**: Sivilstand (Select), epsHarPensjon (RadioGroup, shown if GIFT/REGISTRERT_PARTNER/SAMBOER), epsHarInntektOver2G (RadioGroup, shown if epsHarPensjon=nei)
- **Dispatches**: `setSivilstand({ sivilstand, epsHarPensjon, epsHarInntektOver2G })`

### `/utenlandsopphold` — StepUtenlandsopphold

- **Skip**: If endring AND (kap19 OR erApoteker)
- **Collects**: harUtenlandsopphold (ja/nei radio). If "ja", shows UtenlandsoppholdListe with modal for CRUD of periods.
- **Each period**: landkode, arbeidetUtenlands (conditional on country), startdato, sluttdato (optional = permanent)
- **Dispatches**: `setHarUtenlandsopphold`. If "nei", flushes utenlandsperioder.

### `/afp` — StepAFP

- **Skip conditions** (all use `skip()` to next step):
  1. User has afpPrivat, afpOffentlig, pre2025OffentligAfp, or ufoeretrygd.grad === 100
  2. Gradert uføretrygd AND erApoteker
  3. Gradert uføretrygd AND birth date over AFP_UFOERE_OPPSIGELSESALDER
  4. (erApoteker OR isKap19) AND fremtidigAlderspensjon AND no alderspensjon
  5. erApoteker AND isEndring
- **Three component variants**:
  - `AFP` (born after 1963): 4 radio options (ja_offentlig, ja_privat, nei, vet_ikke)
  - `AFPOvergangskullUtenAP` (overgangskull without AP): 4 radio options + second radio for AfpUtregningValg (AFP_ETTERFULGT_AV_ALDERSPENSJON / KUN_ALDERSPENSJON)
  - `AFPPrivat` (born before 1963, over 67 or endring): Only 2 options (ja_privat, nei)
- **Dispatches**: `setAfp`, optionally `setAfpUtregningValg`

### `/ufoeretrygd-afp` — StepUfoeretrygdAFP

- **Show condition**: `loependeVedtak.ufoeretrygd.grad && afp && afp !== 'nei'`
- **Otherwise**: Skipped
- **Collects**: Nothing (informational step about uføretrygd + AFP interaction)
- Uses `getStepArrays(isEndring, false)` — never kap19

### `/samtykke-offentlig-afp` — StepSamtykkeOffentligAFP

- **Show condition**: `afp === 'ja_offentlig'`
- **Otherwise**: Skipped
- **Collects**: samtykkeOffentligAFP (ja/nei radio)
- **Dispatches**: `setSamtykkeOffentligAFP`

### `/samtykke` — StepSamtykkePensjonsavtaler

- **Skip**: If endring AND (kap19 OR erApoteker)
- **Collects**: samtykke (ja/nei radio) for private pension agreement lookup
- **Side effect**: If not consenting, invalidates `OffentligTp` and `Pensjonsavtaler` cache tags
- Pre-fetches `getAfpOffentligLivsvarig` in background if samtykkeOffentligAFP AND over 62

### `/beregning` — Beregning (enkel)

- Shows: TidligstMuligUttaksalder, VelgUttaksalder (age chips), Simulering (chart), Grunnlag, SavnerDuNoe
- Fetches tidligstMuligHeltUttak (skipped if uføregrad or pre2025OffentligAfp)
- Fetches alderspensjon simulation when uttaksalder selected

### `/beregning-detaljert` — Beregning (avansert)

- Two modes via `avansertSkjemaModus`: `'redigering'` (form) | `'resultat'` (chart + details)
- Renders `RedigerAvansertBeregning` in redigering mode → one of three AvansertSkjema variants

---

## 4. State Architecture

### Redux Store Shape

```
{
  api: { ... }          // RTK Query cache (reducerPath: 'api')
  session: {
    isLoggedIn: boolean
    hasErApotekerError: boolean
  }
  userInput: {
    veilederBorgerFnr?: string
    veilederBorgerEncryptedFnr?: string
    harUtenlandsopphold: boolean | null
    utenlandsperioder: Utenlandsperiode[]
    samtykke: boolean | null
    samtykkeOffentligAFP: boolean | null
    afp: AfpRadio | null              // 'ja_offentlig' | 'ja_privat' | 'nei' | 'vet_ikke'
    afpUtregningValg: AfpUtregningValg
    sivilstand: Sivilstand | null
    epsHarPensjon: boolean | null
    epsHarInntektOver2G: boolean | null
    afpInntektMaanedFoerUttak: boolean | null
    stillingsprosentVsaPensjon: number | null
    stillingsprosentVsaGradertPensjon: number | null
    currentSimulation: {
      uttaksalder: Alder | null
      aarligInntektFoerUttakBeloep: string | null
      aarligInntektVsaHelPensjon?: AarligInntektVsaPensjon
      gradertUttaksperiode: GradertUttak | null
      beregningsvalg: Beregningsvalg | null
    }
    xAxis: string[]
  }
}
```

### API Endpoints (RTK Query — `state/api/apiSlice.ts`)

Global config: `keepUnusedDataFor: 3600` (1 hour), `tagTypes: ['Person', 'OffentligTp', 'Alderspensjon', 'Pensjonsavtaler']`.

| Endpoint                             | Method | URL                                                       | Purpose                                                                                           |
| ------------------------------------ | ------ | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `getInntekt`                         | GET    | `/inntekt`                                                | Pensionsgivende inntekt from Skatteetaten                                                         |
| `getPerson`                          | GET    | `/v6/person`                                              | Name, foedselsdato, pensjoneringAldre (normert, nedre, oevre)                                     |
| `getGrunnbeloep`                     | GET    | `https://g.nav.no/api/v1/grunnbeløp`                      | External. Extracts `grunnbeløp` number                                                            |
| `getErApoteker`                      | GET    | `/v1/er-apoteker`                                         | Returns boolean (transforms ApotekerStatusV1)                                                     |
| `getOmstillingsstoenadOgGjenlevende` | GET    | `/v1/loepende-omstillingsstoenad-eller-gjenlevendeytelse` | harLoependeSak boolean                                                                            |
| `getLoependeVedtak`                  | GET    | `/v4/vedtak/loepende-vedtak`                              | Current running pension decisions                                                                 |
| `offentligTp`                        | POST   | `/v2/simuler-oftp/fra-1963`                               | Public TP simulation (born 1963+)                                                                 |
| `offentligTpFoer1963`                | POST   | `/v2/simuler-oftp/foer-1963`                              | Public TP simulation (born before 1963)                                                           |
| `getAfpOffentligLivsvarig`           | GET    | `/v2/tpo-livsvarig-offentlig-afp`                         | Public AFP lifelong data                                                                          |
| `tidligstMuligHeltUttak`             | POST   | `/v3/tidligste-hel-uttaksalder`                           | Earliest full withdrawal age                                                                      |
| `pensjonsavtaler`                    | POST   | `/v3/pensjonsavtaler`                                     | Private pension agreements (from Norsk Pensjon)                                                   |
| `alderspensjon`                      | POST   | `/v9/alderspensjon/simulering`                            | Main simulation endpoint                                                                          |
| `getAnsattId`                        | GET    | `/v1/ansatt-id`                                           | Veileder employee info                                                                            |
| Feature toggles                      | GET    | `/feature/pensjonskalkulator.*`                           | Unleash toggles (vedlikeholdsmodus, spraakvelger, show-download-pdf, utvidet-simuleringsresultat) |

### Key Selectors (`state/userInput/selectors.ts`)

**Memoized (createSelector):**

- `selectFoedselsdato` — from getPerson response
- `selectNormertPensjonsalder`, `selectNedreAldersgrense`, `selectOevreAldersgrense` — from getPerson.pensjoneringAldre
- `selectMaxOpptjeningsalder` — `{ aar: oevreAldersgrense.aar, maaneder: 11 }`
- `selectLoependeVedtak`, `selectUfoeregrad`, `selectIsEndring` — from getLoependeVedtak
- `selectAarligInntektFoerUttakBeloepFraSkatt` — from getInntekt (formatted)
- `selectErApoteker`, `selectGrunnbeloep`

**Derived:**

- `selectIsVeileder` — `!!veilederBorgerFnr || !!veilederBorgerEncryptedFnr`
- `selectSkalBeregneAfpKap19` — `afpUtregningValg === 'AFP_ETTERFULGT_AV_ALDERSPENSJON'`
- `selectSkalBeregneKunAlderspensjon` — `afpUtregningValg === 'KUN_ALDERSPENSJON'`
- `selectSivilstand` — fallback chain: user override → vedtak sivilstand (if endring) → person API sivilstand
- `selectAarligInntektFoerUttakBeloep` — fallback: user input → Skatteetaten amount

### Request Body Builders (`state/api/utils.ts`)

- `generateAlderspensjonRequestBody` — Full simulation request with gradertUttak, heltUttak, beregningsvalg, skalBeregneAfpKap19
- `generateAlderspensjonEnkelRequestBody` — Simpler version for enkel mode (no gradert, no beregningsvalg)
- `generateTidligstMuligHeltUttakRequestBody` — Earliest withdrawal age request
- `generatePensjonsavtalerRequestBody` — Private pension lookup. `harAfp` only true for `ja_privat` (not offentlig). Always sends `grad: 100`.
- `generateOffentligTpRequestBody` — Public TP (1963+). `brukerBaOmAfp = afp === 'ja_offentlig' || afp === 'ja_privat'`
- `generateOffentligTpFoer1963RequestBody` — Public TP (pre-1963). Has `stillingsprosentOff*` and `afpOrdning: 'AFPSTAT'` when kap19

**Income handling**: Stored as formatted strings (`'521 338'`) in Redux, converted via `formatInntektToNumber()` only when building request bodies.

**`innvilgetLivsvarigOffentligAfp` pattern**: Used in tidligstMuligHeltUttak, alderspensjon, alderspensjonEnkel. Converts monthly to annual (`* 12`). Only included when afpStatus + maanedligBeloep + virkningFom all truthy.

---

## 5. Guard System — Exact Logic

### `authenticationGuard` (parent layout loader)

Fetches `${HOST_BASEURL}/oauth2/session`. Sets `sessionActions.setLoggedIn(response.ok)`.

### `directAccessGuard`

Checks `state.api.queries` — if undefined or empty (no API calls made), redirects to `/start`. Exception: `?sanity-timeout` query param bypasses check. Used by error pages and `/beregning-detaljert`.

### `stepStartAccessGuard`

1. Fetches vedlikeholdsmodus, getPerson, getLoependeVedtak (parallel await)
2. Background fetches: getInntekt, getOmstillingsstoenadOgGjenlevende, getGrunnbeloep, getErApoteker
3. If vedlikeholdsmodus.enabled → `/kalkulatoren-virker-ikke`
4. getPerson 403 errors: INVALID_REPRESENTASJON → `/ingen-tilgang`, INSUFFICIENT_LEVEL_OF_ASSURANCE → `/for-lavt-sikkerhetsnivaa`
5. getLoependeVedtak failure → same 403 logic or `/uventet-feil`
6. Sets `hasErApotekerError` if getErApoteker fails

### `stepSivilstandAccessGuard` / `stepUtenlandsoppholdAccessGuard`

Skip if `isEndring AND (isKap19 OR erApoteker)` → calls `skip(stepArrays, currentPath, request)`.

### `stepAFPAccessGuard`

Skips when user has existing AFP vedtak, 100% uføretrygd, gradert uføre + apoteker, gradert uføre + over AFP age limit, (apoteker OR kap19) + fremtidigAlderspensjon without alderspensjon, or apoteker + endring.

### `stepUfoeretrygdAFPAccessGuard`

Shows only when `ufoeretrygd.grad && afp && afp !== 'nei'`. Uses `getStepArrays(isEndring, false)` (never kap19).

### `stepSamtykkeOffentligAFPAccessGuard`

Shows only when `afp === 'ja_offentlig'`.

### `stepSamtykkePensjonsavtaler`

Skips if `isEndring AND (isKap19 OR erApoteker)`. Pre-fetches getAfpOffentligLivsvarig if samtykkeOffentligAFP AND over 62.

### `beregningEnkelAccessGuard`

Redirects to `/beregning-detaljert` if skalBeregneAfpKap19, has alderspensjon vedtak, or (skalBeregneKunAlderspensjon AND harSamtykketPensjonsavtaler).

### `skip()` function

Finds current path in step arrays, redirects to next (or previous if `?back=true`) step. Uses `getStepArrays(isEndring, isKap19OrApoteker)` to select the right array.

---

## 6. Component Hierarchy

### Pages (`src/pages/`)

```
LandingPage
StepStart → StartForBrukereUnder75 | StartForBrukereFyllt75
StepSivilstand → Sivilstand
StepUtenlandsopphold → Utenlandsopphold → UtenlandsoppholdListe → UtenlandsoppholdModal
StepAFP → AFP | AFPOvergangskullUtenAP | AFPPrivat
StepUfoeretrygdAFP → Ufoere
StepSamtykkeOffentligAFP → SamtykkeOffentligAFP
StepSamtykkePensjonsavtaler → SamtykkePensjonsavtaler
Beregning (visning='enkel'|'avansert')
  ├── BeregningEnkel → TidligstMuligUttaksalder, VelgUttaksalder, Simulering, Grunnlag, SavnerDuNoe
  └── BeregningAvansert
       ├── (redigering) RedigerAvansertBeregning
       │    ├── AvansertSkjemaForAndreBrukere (default)
       │    ├── AvansertSkjemaForBrukereMedGradertUfoeretrygd (gradert uføre)
       │    └── AvansertSkjemaForBrukereMedKap19Afp (kap19 AFP)
       └── (resultat) InfoOmLoependeVedtak, Simulering, Grunnlag, SavnerDuNoe
ErrorSecurityLevel, IngenTilgang, StepFeil, StepKalkulatorVirkerIkke
VeilederInput → BorgerInformasjon + RouterProvider
```

### AvansertSkjema Variant Selection (`RedigerAvansertBeregning`)

| Priority | Condition                              | Variant                            | Key Differences                                                                      |
| -------- | -------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------ |
| 1        | `skalBeregneAfpKap19`                  | **Kap19Afp** (588 lines)           | No uttaksgrad, no gradert. AFP income radio, max age 66y11m.                         |
| 2        | `ufoeretrygd.grad > 0 && grad !== 100` | **GradertUfoeretrygd** (928 lines) | Has Beregningsvalg (uten_afp/med_afp). IntroAFP. Hidden age pickers in med_afp mode. |
| 3        | All others                             | **AndreBrukere** (987 lines)       | Full form: uttaksgrad, gradert/helt age pickers, income fields, stillingsprosent.    |

**Shared between all variants:**

- `useFormLocalState` hook — all local form state via useState
- `useFormValidationErrors` hook — per-field validation errors
- `onAvansertBeregningSubmit` — central submit handler reading from FormData
- Felles components: AvansertSkjemaInntekt, AvansertSkjemaIntroEndring, FormButtonRow, ReadMoreOmPensjonsalder

**Form state pattern**: Local-first (useState) → Redux only on successful submit. FormData is source of truth for submit despite React-controlled UI. Unsaved changes tracked via useEffect comparing all fields.

### Simulering Component Tree

```
Simulering (main orchestrator)
  ├── HighchartsReact (stacked column chart)
  ├── SimuleringGrafNavigation (scroll left/right)
  ├── SimuleringPensjonsavtalerAlert
  ├── SimuleringAfpOffentligAlert
  ├── SimuleringEndringBanner (monthly amounts for endring)
  ├── TabellVisning (accessible table, inside ReadMore)
  ├── MaanedsbeloepAvansertBeregning (monthly breakdown)
  │    ├── PensjonVisningDesktop (HStack of Box cards)
  │    └── PensjonVisningMobil (ReadMore accordions)
  └── BeregningsdetaljerForOvergangskull (kap19 detail tables)
       ├── AlderspensjonDetaljerGrunnlag
       └── AfpDetaljerGrunnlag
```

### Grunnlag (Basis for Calculation)

```
Grunnlag
  ├── GrunnlagItem (gray) → Pensjonsgivendeinntekt (enkel only)
  ├── GrunnlagItem (blue) → Alderspensjon info + ReadMore detaljer
  ├── GrunnlagItem (purple) → GrunnlagAFP + ReadMore detaljer
  ├── GrunnlagItem (green) → Pensjonsavtaler
  │    ├── PrivatePensjonsavtaler (Desktop/Mobile)
  │    └── OffentligTjenestepensjon
  └── Accordion "Om deg"
       ├── GrunnlagSection → Sivilstand
       └── GrunnlagSection → GrunnlagUtenlandsopphold
```

---

## 7. Simulation & Chart System

### Chart: Highcharts stacked column chart

- 4 series stacked bottom-to-top: Inntekt (gray), AFP (purple), TP+Pensjonsavtaler (green), Alderspensjon (blue)
- X-axis: ages from uttaksalder to max(75/77, highest pensjonsavtale end year), suffixed with "+"
- Y-axis: NOK amounts, formatted with `formatInntekt`, 100k tick intervals
- Scrollable plot area (minWidth: 750), with navigation buttons
- Point click: highlights column, fades others, shows tooltip with breakdown
- Faded colors for non-selected columns (e.g., deepblue-500 → deepblue-200)

### Data Processing (`Simulering/utils.ts`)

- `processInntektArray()` — splits into before/gradert/helt periods, prorates monthly
- `processPensjonsberegningArray()` / `processPensjonsberegningArrayForKap19()` — maps AP to age array, extends livsvarig
- `processAfpPensjonsberegningArray()` — AFP start offset, extends livsvarig
- `processPre2025OffentligAfpPensjonsberegningArray()` — AFP ages 62–66, ends at 67
- `processPensjonsavtalerArray()` — flattens all utbetalingsperioder, prorates per year

### Key Hooks (`Simulering/hooks.tsx`)

- `useSimuleringChartLocalState()` — builds Highcharts options from all data, manages scroll buttons
- `usePensjonsavtalerAlerts()` — cascade of 7 alert conditions for pension agreements
- `useAfpOffentligAlerts()` — cascade of 6 alert conditions for public AFP
- `useOffentligTpData()` — determines which TP query (foer1963 vs fra1963), filters AFP periods, determines SPK besteberegning

### VelgUttaksalder (Enkel mode)

- Chips from tidligstMuligUttak to oevreAldersgrense
- First chip: exact earliest age with months, rest: whole years
- Dispatches `setCurrentSimulationUttaksalder` on click

### VilkaarsproevingAlert

- Shows when simulation returns `vilkaarErOppfylt === false`
- Suggests alternative ages (helt uttak, gradert uttak, or combination)
- Special kap19 mode: warns about AFP income month before withdrawal
- In avansert mode: switches back to redigering on vilkaar failure

---

## 8. Key Business Rules

### AFP Eligibility & Interactions

- `AfpRadio`: `'ja_offentlig' | 'ja_privat' | 'nei' | 'vet_ikke'`
- AFP is mutually exclusive with 100% uføretrygd (step skipped)
- Gradert uføretrygd + AFP: requires Beregningsvalg (uten_afp/med_afp)
- `med_afp` mode: age auto-set to nedreAldersgrense, no uføretrygd constraint on uttaksgrad
- `uten_afp` mode: uttaksgrad ≤ (100 - uføregrad) when age < normertPensjonsalder
- `harAfp` in pensjonsavtaler request: only true for `ja_privat` (NOT offentlig)
- `brukerBaOmAfp` in offentligTp request: true for both privat AND offentlig
- AFP offentlig livsvarig fetched separately, requires samtykkeOffentligAFP AND user over 62

### Apoteker Special Case

- Detected via `/v1/er-apoteker` (transforms `apoteker && aarsak === 'ER_APOTEKER'`)
- Treated like kap19 for step navigation (uses `stegvisningOrderKap19`)
- AFP step skipped if apoteker + endring, or apoteker + gradert uføretrygd
- `ApotekereWarning` shown when AFP=ja_offentlig AND hasErApotekerError AND born after 1963
- `erApoteker` passed through to offentligTp request body

### Uføretrygd Interactions

- `grad`: 0 (none), 1–99 (gradert), 100 (full)
- 100% uføre: skips AFP step entirely; both ages must be ≥ normertPensjonsalder
- Gradert uføre: shows Beregningsvalg if AFP selected; uttaksgrad constrained to ≤ (100 - uføregrad)
- When beregningsvalg !== 'med_afp': simuleringstype forced to `ALDERSPENSJON` (no AFP)

### Samtykke Requirements

- `samtykke` (pensjonsavtaler): Required to fetch private pension agreements. Without it, invalidates cache tags.
- `samtykkeOffentligAFP`: Required to fetch offentlig AFP livsvarig data. Pre-fetched when granted + over 62.

### 12-Month Endring Rule

- When modifying existing gradert vedtak, new uttaksdato must be ≥ 12 months after `forrigeEndringsdato`
- Validated in `validateEndringGradertUttak()`, shows alert with future-allowed date

### Income Fallback Chain

- Annual income before withdrawal: User input → Skatteetaten amount (formatted)
- `null` in user input specifically means "not set" → falls back to Skatt
- String value means "user explicitly set this"

### Sivilstand Fallback Chain

- User override → vedtak sivilstand (if endring) → person API sivilstand

---

## 9. Translations & Testing Patterns

### react-intl Pattern

- All user-facing text uses `<FormattedMessage id="..." />` or `intl.formatMessage({ id: '...' })`
- `getFormatMessageValues()` provides rich text components (bold, links) for complex messages
- Three locales: nb (bokmål), nn (nynorsk), en (English)
- Sanity CMS content via `SanityReadmore` and `SanityContext`

### Norwegian Test Naming

- Test files use `__tests__/` directories colocated with source
- Test descriptions typically in Norwegian: `'viser riktig innhold'`, `'redirecter til start'`
- Test utility: `render` from `@/test-utils` (wraps with Provider, LanguageProvider, Router)
- MSW handlers in `src/mocks/handlers.ts` with fixture data

### Logging/Analytics Pattern

Every component logs:

- `'radiogroup valgt'` with tekst + valg
- `'button klikk'` / `'knapp klikket'` on navigation
- `'skjemavalidering feilet'` with skjemanavn + data on failure
- `ALERT_VIST` when alerts are displayed
- Uses shared `logger()` and `wrapLogger()` utilities

---

## 10. Error Handling

### VilkaarsproevingAlert

- When `vilkaarErOppfylt === false` from simulation
- Suggests alternative ages from `vilkaarsproeving.alternativ`
- Three modes: withAFP (kap19 AFP), skalBeregneAfpKap19, default
- Links to external info about pension rules

### Error Pages

- `/uventet-feil` (StepFeil): Generic error, "Prøv igjen" button
- `/kalkulatoren-virker-ikke` (StepKalkulatorVirkerIkke): Maintenance mode, links to dinPensjonInnlogget
- `/ingen-tilgang` (IngenTilgang): Invalid representasjon/fullmakt, "Bytt bruker" button
- `/for-lavt-sikkerhetsnivaa` (ErrorSecurityLevel): Forces re-login at higher security level via OAuth2 logout

### RouteErrorBoundary

- 404 errors → `ErrorPage404` (links to /login and nav.no/pensjon)
- Other errors → `ErrorPageUnexpected` (cancel button)

### API Error Handling

- Both BeregningEnkel and BeregningAvansert redirect to `/uventet-feil` on 503 or PARSING_ERROR
- Offentlig TP: status-based alerts (BRUKER_ER_IKKE_MEDLEM, TP_ORDNING_STOETTES_IKKE, TEKNISK_FEIL, TOM_SIMULERING)
- Pensjonsavtaler: alerts for no results, API error, partial response

### Security Level Check

- 403 + `INSUFFICIENT_LEVEL_OF_ASSURANCE` from getPerson/getLoependeVedtak
- Redirects to `/for-lavt-sikkerhetsnivaa` which offers OAuth2 re-login

---

## 11. Infrastructure & Configuration

### Dual Entrypoints

| Aspect               | main.tsx (Borger)             | main-veileder.tsx (Veileder)   |
| -------------------- | ----------------------------- | ------------------------------ |
| Router               | Top-level createBrowserRouter | Inside VeilederInput component |
| Basename             | `/pensjon/kalkulator`         | `/pensjon/kalkulator/veileder` |
| Root component       | RouterProvider                | VeilederInput                  |
| Google Translate fix | Yes                           | No                             |
| Print styles         | Yes                           | No                             |
| MSW disable flag     | No                            | `__DISABLE_MSW__`              |

### Base Path & URLs

- `API_PATH`: `/pensjon/kalkulator/api`
- `HOST_BASEURL`: Empty string in production (relative), `http://localhost:8088` in test
- External URLs defined in `src/router/constants.ts` (dinPensjon, norskPensjon, afp.no, etc.)

### Monitoring

- Grafana Faro Web SDK (`src/faro.ts`)
- Paused on localhost, telemetry URL from `nais.js`

### Feature Toggles (Unleash)

- `pensjonskalkulator.vedlikeholdsmodus` — maintenance mode
- `pensjonskalkulator.disable-spraakvelger` — language switcher
- `pensjonskalkulator.show-download-pdf` — PDF download button
- `utvidet-simuleringsresultat` — extended simulation results

### Sanity CMS

- ReadMore, GuidePanel, and Forbehold content
- `LanguageProvider` fetches with 10s timeout
- Fixtures regenerated via `scripts/FetchSanityData.js`

---

## Common Tasks

### Adding a New Step

1. Add path to `src/router/constants.ts` and relevant step order array(s)
2. Create guard/loader in `src/router/loaders.tsx`
3. Create page component in `src/pages/`
4. Create stegvisning component in `src/components/stegvisning/`
5. Add to `useStegvisningNavigation` if custom navigation needed
6. Add MSW fixtures and tests

### Adding a New API Endpoint

1. Regenerate types: `pnpm fetch-dev-types` (in apps/ekstern)
2. Add endpoint in `state/api/apiSlice.ts` with typeguard in `typeguards.ts`
3. Add request builder in `state/api/utils.ts` if POST
4. Add MSW handler in `src/mocks/handlers.ts` + fixture data
5. Write tests

### Modifying Feature Toggles

Feature toggles use Unleash. Keep toggle names in sync across apiSlice endpoints, server, and mocks.

---

## Boundaries

### ✅ Always

- Keep step order arrays and guard logic in sync
- Use RTK Query for API data (don't fetch manually)
- Use translation keys (react-intl) for all user text
- Test with `render` from `@/test-utils`
- Update MSW handlers when changing API interactions
- Income values: store as formatted strings, convert with `formatInntektToNumber()` for API calls only

### ⚠️ Ask First

- Changing step flow order or adding/removing steps
- Modifying guard/loader redirect logic
- Changing API request body structure
- Adding new feature toggles
- Modifying AvansertSkjema variant selection logic

### 🚫 Never

- Hand-edit `src/types/schema.d.ts` (auto-generated from OpenAPI)
- Bypass directAccessGuard for deep-links
- Store tokens in localStorage
- Hardcode Norwegian text (use translations)
- Dispatch to Redux from AvansertSkjema local state before form submit
