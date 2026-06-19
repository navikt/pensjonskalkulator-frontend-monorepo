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

Domain expert for NAV's pension calculator frontend (`apps/ekstern/`). Use `search` to find implementation details — this document encodes **business domain knowledge** that isn't discoverable from code alone.

---

## Domain Glossary

### Pension Types

| Type                               | Description                                                                                                                             |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Alderspensjon**                  | State old-age pension (folketrygd). Always present.                                                                                     |
| **AFP Privat**                     | Contractual early retirement, private sector. Livsvarig (lifelong).                                                                     |
| **AFP Offentlig Livsvarig**        | Public sector AFP, lifelong component.                                                                                                  |
| **Pre-2025 Offentlig AFP**         | Legacy public AFP for overgangskull (born 1954–1962). AFP age 62–66, then alderspensjon from 67.                                        |
| **Uføretrygd**                     | Disability pension. Has `grad` (percentage). Affects AFP eligibility and uttaksgrad constraints. Not simulated — from `loependeVedtak`. |
| **Pensjonsavtaler (private)**      | Private pension agreements from Norsk Pensjon. Requires `samtykke`.                                                                     |
| **Offentlig Tjenestepensjon (TP)** | Public service pension. Two variants: `fra-1963` and `foer-1963`.                                                                       |
| **Pensjonsgivende inntekt**        | Taxable income shown in chart.                                                                                                          |

### Key Domain Terms

- **Uttaksalder** (`Alder: { aar, maaneder }`): Withdrawal age. Has nedreAldersgrense (min), normertPensjonsalder (standard), oevreAldersgrense (max, typically 75).
- **Kap19 / Kap20**: Old vs new pension calculation rules. Users born before 1963 may have both.
- **Overgangskull**: Transitional cohort born 1954–1962. May choose AFP etterfulgt av alderspensjon.
- **Endring**: Modification of existing running pension (løpende vedtak with alderspensjon).
- **Løpende vedtak**: Current active pension decisions — alderspensjon, uføretrygd, afpPrivat, afpOffentlig, fremtidigAlderspensjon.
- **Grunnbeløp (G)**: Base amount from folketrygden.
- **EPS**: Ektefelle/partner/samboer. Fields: `epsHarPensjon`, `epsHarInntektOver2G`.
- **Samtykke**: Consent for private pensjonsavtaler lookup. **SamtykkeOffentligAFP**: Consent for offentlig AFP livsvarig data.
- **Sivilstand**: Civil status. SAMBOER only valid in vedtak context.
- **Apoteker**: Pharmacist — treated like kap19 for step navigation.
- **Beregningsvalg**: `'uten_afp' | 'med_afp'` — only for gradert uføretrygd + AFP users.
- **AfpUtregningValg**: `'AFP_ETTERFULGT_AV_ALDERSPENSJON' | 'KUN_ALDERSPENSJON'` — for overgangskull.
- **Vilkaarsproeving**: Eligibility check from simulation. Contains `vilkaarErOppfylt` + optional `alternativ` ages.

---

## Simuleringstype Resolution

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

**Priority**: Endring checks first → skalBeregneAfpKap19 → ufoeregrad special handling → standard AFP switch.

---

## Step Flows

Three step order arrays in `src/router/constants.ts`, selected by `getStepArrays(isEndring, isKap19OrApoteker)`:

**Standard** (`stegvisningOrder`):

```
/login → /start → /sivilstand → /utenlandsopphold → /afp → /ufoeretrygd-afp → /samtykke-offentlig-afp → /samtykke → /beregning
```

**Endring** (`stegvisningOrderEndring`) — has existing alderspensjon:

```
/login → /start → /afp → /ufoeretrygd-afp → /samtykke-offentlig-afp → /beregning-detaljert
```

**Kap19/Apoteker** (`stegvisningOrderKap19`) — born before 1963 OR apoteker:

```
/login → /start → /sivilstand → /utenlandsopphold → /afp → /samtykke → /beregning
```

Flow selection: `isEndring` = has alderspensjon vedtak; `isKap19OrApoteker` = `isOvergangskull(foedselsdato) || erApoteker`.

### Key Skip Conditions

- **AFP step skipped** when: existing AFP/pre2025 vedtak, uføretrygd.grad === 100, gradert uføre + apoteker, gradert uføre + over AFP_UFOERE_OPPSIGELSESALDER, (apoteker OR kap19) + fremtidigAlderspensjon without alderspensjon, or apoteker + endring
- **Sivilstand/Utenlandsopphold skipped** when: isEndring AND (isKap19 OR erApoteker)
- **Ufoeretrygd-AFP shown only** when: `ufoeretrygd.grad && afp && afp !== 'nei'`
- **Samtykke-offentlig-AFP shown only** when: `afp === 'ja_offentlig'`
- **Beregning redirects to beregning-detaljert** when: skalBeregneAfpKap19, has alderspensjon vedtak, or (skalBeregneKunAlderspensjon AND harSamtykketPensjonsavtaler)

### AFP Step Variants

- `AFP` (born after 1963): 4 radio options (ja_offentlig, ja_privat, nei, vet_ikke)
- `AFPOvergangskullUtenAP` (overgangskull without AP): 4 options + AfpUtregningValg radio
- `AFPPrivat` (born before 1963, over 67 or endring): Only ja_privat/nei

---

## State Architecture

Three Redux slices: `api` (RTK Query cache), `session` (isLoggedIn, hasErApotekerError), `userInput` (all user choices + currentSimulation).

### Key Patterns

- **Income handling**: Stored as formatted strings (`'521 338'`) in Redux. Convert via `formatInntektToNumber()` only when building API request bodies.
- **Income fallback**: `selectAarligInntektFoerUttakBeloep` — user input (string) → Skatteetaten amount. `null` = "not set" (falls back); string = "user explicitly set this".
- **Sivilstand fallback**: `selectSivilstand` — user override → vedtak sivilstand (if endring) → person API sivilstand.
- **Form state (AvansertSkjema)**: Local-first (useState) → Redux only on successful submit. FormData is source of truth for submit.
- **Veileder FNR**: `veilederBorgerFnr`/`veilederBorgerEncryptedFnr` in Redux; encrypted FNR sent as `fnr` header. `flush` action preserves these fields.

### Key Selectors

Search `state/userInput/selectors.ts` for full list. Critical derived selectors:

- `selectSkalBeregneAfpKap19` — `afpUtregningValg === 'AFP_ETTERFULGT_AV_ALDERSPENSJON'`
- `selectIsEndring` — from getLoependeVedtak (has alderspensjon vedtak)
- `selectIsVeileder` — `!!veilederBorgerFnr || !!veilederBorgerEncryptedFnr`

---

## Key Business Rules

### AFP Interactions

- AFP mutually exclusive with 100% uføretrygd (step skipped)
- Gradert uføretrygd + AFP: requires Beregningsvalg (uten_afp/med_afp)
- `med_afp`: age auto-set to nedreAldersgrense, no uføretrygd constraint on uttaksgrad
- `uten_afp`: uttaksgrad ≤ (100 - uføregrad) when age < normertPensjonsalder
- `harAfp` in pensjonsavtaler request: only true for `ja_privat` (NOT offentlig)
- `brukerBaOmAfp` in offentligTp request: true for both privat AND offentlig

### Uføretrygd

- `grad`: 0 (none), 1–99 (gradert), 100 (full)
- 100% uføre: skips AFP; both ages must be ≥ normertPensjonsalder
- When beregningsvalg !== 'med_afp': simuleringstype forced to `ALDERSPENSJON`

### Apoteker

- Treated like kap19 for navigation (uses `stegvisningOrderKap19`)
- AFP skipped if apoteker + endring, or apoteker + gradert uføretrygd
- `erApoteker` passed through to offentligTp request body

### 12-Month Endring Rule

When modifying existing gradert vedtak, new uttaksdato must be ≥ 12 months after `forrigeEndringsdato`.

---

## App Structure

### Entrypoints

- **Borger**: `src/main.tsx` → basename `/pensjon/kalkulator`
- **Veileder**: `src/main-veileder.tsx` → basename `/pensjon/kalkulator/veileder` — two-phase UI (enter fødselsnummer → encrypt → show calculator), skips landing page, auto-redirects after 1 hour inactivity

### AvansertSkjema Variants

Selected in `RedigerAvansertBeregning` by priority:

1. `skalBeregneAfpKap19` → **Kap19Afp** (no uttaksgrad, no gradert, max age 66y11m)
2. Gradert uføretrygd → **GradertUfoeretrygd** (has Beregningsvalg, hidden age pickers in med_afp)
3. All others → **AndreBrukere** (full form: uttaksgrad, gradert/helt ages, income, stillingsprosent)

---

## Boundaries

### ✅ Always

- Keep step order arrays and guard logic in sync
- Use RTK Query for API data (don't fetch manually)
- Use react-intl translation keys for all user text
- Test with `render` from `@/test-utils`; update MSW handlers when changing API interactions
- Income: store as formatted strings, convert with `formatInntektToNumber()` for API calls only

### ⚠️ Ask First

- Changing step flow order or adding/removing steps
- Modifying guard/loader redirect logic
- Changing API request body structure or AvansertSkjema variant selection logic

### 🚫 Never

- Hand-edit `src/types/schema.d.ts` (auto-generated from OpenAPI)
- Bypass directAccessGuard for deep-links
- Hardcode Norwegian text (use translations)
- Dispatch to Redux from AvansertSkjema local state before form submit
