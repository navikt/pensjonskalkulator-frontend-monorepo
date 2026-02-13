# Playwright E2E Testing Skill

Production-proven E2E patterns for the pensjonskalkulator frontend.

## Quick Reference

```bash
# Run E2E tests (from apps/ekstern)
pnpm test:e2e              # Headless chromium
pnpm pw:open               # Playwright UI mode

# Specific test file
pnpm pw:test playwright/e2e/pensjon/kalkulator/my-test.spec.ts

# Specific browser
pnpm pw:test --project=firefox
```

## File Structure

```
playwright/
├── base.ts                           # Custom test fixture + setupInterceptions (347 lines)
├── tsconfig.json
├── e2e/pensjon/kalkulator/           # 17 spec files
├── utils/
│   ├── auth.ts                       # authenticate() — 18 lines
│   ├── error.ts                      # handlePageError — suppress analytics errors
│   ├── form.ts                       # selectDropdown, checkRadio, fillAgePicker, expectElementVisible
│   ├── mock.ts                       # loadJSONMock, loadHTMLMock
│   ├── navigation.ts                 # fillOutStegvisning, waitForStoreDispatch — 108 lines
│   ├── presetStates.ts               # Composed mock scenarios — 102 lines
│   └── mocks/                        # Mock builder functions
│       ├── index.ts                  # Re-exports all builders
│       ├── types.ts                  # RouteDefinition, PersonMockOptions, etc.
│       ├── person.ts
│       ├── alderspensjon.ts
│       ├── loepende-vedtak.ts
│       ├── pensjonsavtaler.ts
│       ├── offentlig-tp.ts           # 202 lines — many presets
│       ├── inntekt.ts
│       ├── tidligste-uttaksalder.ts
│       ├── toggle-config.ts
│       ├── ekskludert.ts
│       ├── apoteker.ts
│       ├── afp-offentlig-livsvarig.ts
│       ├── omstillingsstoenad-og-gjennlevende.ts
│       └── representasjons-banner.ts
└── mocks/                            # JSON fixture files (~30 files)
```

---

## 1. Custom Test Fixture (`base.ts`)

The `test` fixture extends Playwright's `baseTest` with:

- **`autoAuth`** (boolean option, default `true`) — when true, the `page` fixture calls `authenticate(page)` automatically before each test
- **`browser`** — worker-scoped shared Chromium instance
- **`context`** — new browser context per test
- **`page`** — new page per test; auto-authenticates if `autoAuth` is true

```typescript
import { test } from '../../../base'

// Default: autoAuth is true, user lands on /start automatically
test('renders start page', async ({ page }) => {
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

// Disable autoAuth to customize mock setup before authentication
test.describe('Custom scenario', () => {
	test.use({ autoAuth: false })

	test('custom user', async ({ page }) => {
		await authenticate(page, [await person({ sivilstand: 'GIFT' })])
	})
})
```

### `RouteDefinition` Type

All mock overrides use this shape:

```typescript
{
  url: RegExp | string
  method?: 'GET' | 'POST'
  mockFileName?: string
  overrideJsonResponse?: Record<string, unknown> | unknown[]
  status?: number
}
```

---

## 2. `authenticate()` — Full Flow

```typescript
// utils/auth.ts
export const authenticate = async (page, overwrites = []) => {
	await setupInterceptions(page, overwrites) // 1. Set up all 36 route mocks + overwrites
	await page.goto('/pensjon/kalkulator/') // 2. Navigate to landing page
	const btn = page.getByTestId('landingside-enkel-kalkulator-button')
	await btn.waitFor({ state: 'visible' }) // 3. Wait for button
	await btn.click() // 4. Click "enkel kalkulator"
	await page.waitForURL(/\/start/) // 5. Wait for /start route
}
```

Authentication is faked — session endpoints return 200 and `decorator-auth.json` returns `{ authenticated: true, name: "APRIKOS NORDMANN", securityLevel: "4" }`.

---

## 3. `setupInterceptions()` — All 36 Default Routes

Called by `authenticate()`. Steps:

1. Injects init script: `window.__DISABLE_MSW__ = true` and `window.Playwright = true`
2. Sets `navno-consent` cookie (analytics/surveys disabled)
3. Registers 36 default routes (below)
4. Merges `overwrites[]` — matching routes replaced, new routes appended
5. Registers error handler (suppresses Amplitude/representasjon-banner errors)
6. Registers `page.route()` for each route with GET/POST method matching

### Default Routes Table

| URL Pattern                                                                      | Method | Mock/Response                                  |
| -------------------------------------------------------------------------------- | ------ | ---------------------------------------------- |
| `cdn.nav.no/.../.*.(js\|css\|svg)`                                               | GET    | status 200 (empty)                             |
| `cdn.nav.no/aksel/fonts/...`                                                     | GET    | status 200                                     |
| Decorator CSS                                                                    | GET    | status 200                                     |
| Representasjon banner JS                                                         | GET    | status 200                                     |
| `in2.taskanalytics.com/tm.js`                                                    | GET    | status 200                                     |
| `/auth?`                                                                         | GET    | `decorator-auth.json`                          |
| `login.ekstern.dev.nav.no/oauth2/session`                                        | GET    | status 200                                     |
| `login.nav.no/oauth2/session`                                                    | GET    | status 200                                     |
| `representasjon/harRepresentasjonsforhold`                                       | GET    | `representasjon-banner.json`                   |
| `/collect$`                                                                      | GET    | status 200                                     |
| `/api/ta/`                                                                       | GET    | `decorator-ta.json`                            |
| `main-menu?`                                                                     | GET    | `decorator-main-menu.html`                     |
| `user-menu?`                                                                     | GET    | `decorator-user-menu.html`                     |
| `ops-messages/`                                                                  | GET    | `[]`                                           |
| `/env?chatbot=false&logoutWarning=true&redirectToUrl=`                           | GET    | `decorator-env-features.json`                  |
| `amplitude.nav.no/collect-auto`                                                  | POST   | status 200                                     |
| `/pensjon/kalkulator/oauth2/session/`                                            | GET    | status 200                                     |
| `/pensjon/kalkulator/api/feature/`                                               | GET    | `toggle-config.json` (feature flag resolution) |
| `/pensjon/kalkulator/api/v1/er-apoteker`                                         | GET    | `er-apoteker.json`                             |
| `/pensjon/kalkulator/api/v2/tpo-livsvarig-offentlig-afp`                         | GET    | `afp-offentlig-livsvarig.json`                 |
| `/pensjon/kalkulator/api/v2/ekskludert`                                          | GET    | `ekskludert-status.json`                       |
| `/pensjon/kalkulator/api/v1/ansatt-id`                                           | GET    | `{ id: 'mock-ansatt-id' }`                     |
| `/pensjon/kalkulator/api/v1/loepende-omstillingsstoenad-eller-gjenlevendeytelse` | GET    | `omstillingsstoenad-og-gjenlevende.json`       |
| `/pensjon/kalkulator/api/v4/vedtak/loepende-vedtak`                              | GET    | `loepende-vedtak.json`                         |
| `/pensjon/kalkulator/api/v6/person`                                              | GET    | `person.json`                                  |
| `/pensjon/kalkulator/api/inntekt`                                                | GET    | `inntekt.json`                                 |
| `/pensjon/kalkulator/api/v2/simuler-oftp`                                        | POST   | `offentlig-tp.json`                            |
| `/pensjon/kalkulator/api/v3/tidligste-hel-uttaksalder`                           | POST   | `tidligste-uttaksalder.json`                   |
| `/pensjon/kalkulator/api/v3/pensjonsavtaler`                                     | POST   | `pensjonsavtaler.json`                         |
| `/pensjon/kalkulator/api/v9/alderspensjon/simulering`                            | POST   | `alderspensjon.json`                           |
| `g.nav.no/api/v1/grunnbel%C3%B8p`                                                | GET    | Grunnbeløp inline JSON                         |
| `api.uxsignals.com/v2/study/id/*/active`                                         | GET    | `{ active: false }`                            |
| `g2by7q6m.apicdn.sanity.io.*readmore`                                            | GET    | `sanity-readmore-data.json`                    |
| `g2by7q6m.apicdn.sanity.io.*guidepanel`                                          | GET    | `sanity-guidepanel-data.json`                  |
| `g2by7q6m.apicdn.sanity.io.*forbeholdAvsnitt`                                    | GET    | `sanity-forbehold-avsnitt-data.json`           |
| `nav.no/pensjon/selvbetjening/dinpensjon`                                        | GET    | `dinpensjon.html`                              |

### Feature Flag Resolution

When `/api/feature/{name}` is hit, the handler maps feature names to `toggle-config.json` keys:

| Feature URL Name                          | Config Key                   |
| ----------------------------------------- | ---------------------------- |
| `pensjonskalkulator.disable-spraakvelger` | `spraakvelger`               |
| `pensjonskalkulator.vedlikeholdsmodus`    | `vedlikeholdsmodus`          |
| `utvidet-simuleringsresultat`             | `utvidetSimuleringsresultat` |
| `pensjonskalkulator.enable-redirect-1963` | `enableRedirect1963`         |

Default `toggle-config.json`: `{ spraakvelger: { enabled: false }, enableRedirect1963: { enabled: true }, vedlikeholdsmodus: { enabled: false }, utvidetSimuleringsresultat: { enabled: false } }`

---

## 4. Mock Builder Functions (`utils/mocks/`)

All builders return `RouteDefinition` (or `Promise<RouteDefinition>`). They load a base JSON mock and merge overrides.

### `person(options?)`

- **Parameters:** `{ alder?: { aar, maaneder?, dager? }, foedselsdato?, sivilstand?, navn?, fornavn?, pensjoneringAldre? }`
- If `alder` provided: calculates `foedselsdato` dynamically from current date
- **URL:** `/pensjon/kalkulator/api/v6/person` (GET)
- **Base mock:** `person.json` → `{ navn, fornavn, sivilstand: "UGIFT", foedselsdato: "1964-04-30", pensjoneringAldre: { normertPensjoneringsalder: {aar:67,maaneder:0}, nedreAldersgrense: {aar:62,maaneder:0}, oevreAldersgrense: {aar:75,maaneder:0} } }`

### `alderspensjon(options?)`

- **Parameters:** `Partial<PersonligSimuleringResultV8> & { preset?: 'endring' | 'for_lite_trygdetid' | 'med_afp_offentlig' }`
- **Base mocks:** `alderspensjon.json` / `alderspensjon_endring.json` / `alderspensjon_for_lite_trygdetid.json` / `alderspensjon_med_afp_offentlig.json`
- **URL:** `/pensjon/kalkulator/api/v9/alderspensjon/simulering` (POST)

### `loependeVedtak(options?)`

- **Parameters:** `Partial<LoependeVedtakV4> & { endring?: boolean }`
- **Base mock:** `loepende-vedtak.json` → `{ harLoependeVedtak: false, ufoeretrygd: { grad: 0 } }` or `loepende-vedtak-endring.json` if `endring: true`
- **URL:** `/pensjon/kalkulator/api/v4/vedtak/loepende-vedtak` (GET)

### `pensjonsavtaler(options?)`

- **Parameters:** `Partial<PensjonsavtaleResultV3> & { delvisSvar?: false }`
- **Base mock:** `pensjonsavtaler.json` or `pensjonsavtaler-delvis-svar.json` if `delvisSvar === false`
- **URL:** `/pensjon/kalkulator/api/v3/pensjonsavtaler` (POST)

### `pensjonsavtalerError()`

Returns 503 status, empty JSON, POST.

### `pensjonsavtalerDelvisSvarTom()`

Returns `{ avtaler: [], utilgjengeligeSelskap: ['Something'] }`, POST.

### `tidligsteUttaksalder(options?)`

- **Parameters:** `Partial<UttaksalderResultV2>`
- **Base mock:** `tidligste-uttaksalder.json` → `{ aar: 62, maaneder: 10 }`
- **URL:** `/pensjon/kalkulator/api/v3/tidligste-hel-uttaksalder` (POST)

### `inntekt(options?)`

- **Parameters:** `Partial<InntektDto>`
- **Base mock:** `inntekt.json` → `{ beloep: 521338, aar: 2021 }`
- **URL:** `/pensjon/kalkulator/api/inntekt` (GET)

### `offentligTp(options?)`

- **Parameters:** `Partial<OffentligTjenestepensjonSimuleringResultV2> & { preset?: OffentligTpPreset, unsupportedProviders?: string[] }`
- **Presets:** `'spk'` (SPK with betinget), `'spk_uten_betinget'`, `'klp'`, `'unsupported'` (TP_ORDNING_STOETTES_IKKE), `'no_membership'`, `'technical_error'` (TEKNISK_FEIL), `'empty_response'` (TOM_SIMULERING), `'server_error'` (503)
- **URL:** `/pensjon/kalkulator/api/v2/simuler-oftp` (POST)

### `offentligTpTekniskFeil()`

Returns `{ simuleringsresultatStatus: 'TEKNISK_FEIL', muligeTpLeverandoerListe: [] }`

### `offentligTpTomSimulering()`

Returns `{ simuleringsresultatStatus: 'TOM_SIMULERING_FRA_TP_ORDNING', muligeTpLeverandoerListe: [] }`

### `offentligTpIkkeMedlem()`

Returns `{ simuleringsresultatStatus: 'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING', muligeTpLeverandoerListe: [] }`

### `offentligTpAnnenOrdning()`

Returns `{ simuleringsresultatStatus: 'TP_ORDNING_STOETTES_IKKE', muligeTpLeverandoerListe: ['KLP'] }`

### `ekskludert(options?)`

- **Base mock:** `ekskludert-status.json` → `{ ekskludert: false, aarsak: "NONE" }`
- **URL:** `/pensjon/kalkulator/api/v2/ekskludert` (GET)

### `apoteker(options?)`

- **Base mock:** `er-apoteker.json` → `{ apoteker: false, aarsak: "NONE" }`
- **URL:** `/pensjon/kalkulator/api/v1/er-apoteker` (GET)

### `apotekerError()`

Returns 500 with `{ message: 'Internal Server Error' }`.

### `toggleConfig(options?)`

- **Base mock:** `toggle-config.json`
- **URL:** `/pensjon/kalkulator/api/feature/` (GET)

### `afpOffentligLivsvarig(options?)`

- **Parameters:** `{ afpStatus?, maanedligBeloep?, virkningFom?, sistBenyttetGrunnbeloep? }`
- **Default override:** `{ afpStatus: true, maanedligBeloep: 25000, virkningFom: '2023-01-01', sistBenyttetGrunnbeloep: 118620 }`
- **Base mock:** `afp-offentlig-livsvarig.json` (all null by default)
- **URL:** `/pensjon/kalkulator/api/v2/tpo-livsvarig-offentlig-afp` (GET)

### `afpOffentligLivsvarigError()` / `afpOffentligLivsvarigFlereTpOrdninger()`

Both return 500 to the same URL.

### `omstillingsstoenadOgGjenlevende(options?)`

- **Base mock:** `omstillingsstoenad-og-gjenlevende.json` → `{ harLoependeSak: false }`
- **URL:** `/pensjon/kalkulator/api/v1/loepende-omstillingsstoenad-eller-gjenlevendeytelse` (GET)

### `representasjonBanner(options?)`

- **Parameters:** `{ value?: boolean }`
- **Base mock:** `representasjon-banner.json` → `{ value: false }`
- **URL:** `/representasjon/api/representasjon/harRepresentasjonsforhold` (GET)

---

## 5. Preset States (`utils/presetStates.ts`)

Composed mock arrays for common user profiles. Each returns `RouteDefinition[]`.

| Preset                                                  | What It Creates               | Mocks Composed                                                                        |
| ------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------- |
| `brukerUnder75()`                                       | Person aged 65y 11m 5d        | `person({ alder: { aar: 65, maaneder: 11, dager: 5 } })`                              |
| `brukerOver75()`                                        | Person aged 75y 1m            | `person({ alder: { aar: 75, maaneder: 1, dager: 0 } })`                               |
| `brukerGift1963()`                                      | Married, born 1963-04-30      | `person({ fornavn: 'Aprikos', sivilstand: 'GIFT', foedselsdato: '1963-04-30', ... })` |
| `brukerEldreEnn67()`                                    | Born 1956-04-30               | `person({ foedselsdato: '1956-04-30', ... })`                                         |
| `apotekerMedlem()`                                      | Born 1962, apoteker           | `person(...)` + `apoteker({ apoteker: true, aarsak: 'ER_APOTEKER' })`                 |
| `medPre2025OffentligAfp(fom?)`                          | Pre-2025 offentlig AFP vedtak | `loependeVedtak({ pre2025OffentligAfp: { fom } })`                                    |
| `medFremtidigAlderspensjonVedtak()`                     | Future vedtak                 | `loependeVedtak({ fremtidigAlderspensjon: { grad: 100, fom: '2099-01-01' } })`        |
| `medTidligsteUttaksalder(aar, maaneder)`                | Custom earliest age           | `tidligsteUttaksalder({ aar, maaneder })`                                             |
| `apotekerMedlemMedTidligsteUttak(aar, maaneder)`        | Composite                     | `apotekerMedlem()` + `medTidligsteUttaksalder()`                                      |
| `brukerUnder75MedPre2025OffentligAfpOgTidligsteUttak()` | Composite                     | `brukerUnder75()` + `medPre2025OffentligAfp()` + `medTidligsteUttaksalder(62, 10)`    |

```typescript
import { presetStates } from '../../../utils/presetStates'

test.use({ autoAuth: false })

test('married user born 1963', async ({ page }) => {
	await authenticate(page, await presetStates.brukerGift1963())
})

test('apoteker with earliest withdrawal age', async ({ page }) => {
	await authenticate(
		page,
		await presetStates.apotekerMedlemMedTidligsteUttak(63, 6)
	)
})
```

---

## 6. `fillOutStegvisning()` — Skip the Step Wizard

Programmatically fills steps via Redux dispatches and navigates to the target.

### Parameters

```typescript
fillOutStegvisning(page: Page, args: {
  afp?: 'ja_privat' | 'ja_offentlig' | 'nei' | 'vet_ikke'
  samtykke?: boolean
  samtykkeAfpOffentlig?: boolean
  sivilstand?: Sivilstand   // e.g. 'UGIFT', 'GIFT', 'SAMBOER'
  epsHarPensjon?: boolean | null
  epsHarInntektOver2G?: boolean | null
  navigateTo: NavigationStep
})
```

**NavigationStep values:** `'sivilstand' | 'utenlandsopphold' | 'afp' | 'ufoeretrygd-afp' | 'samtykke-offentlig-afp' | 'samtykke' | 'beregning' | 'beregning-detaljert'`

### Behavior (step by step)

1. Calls `waitForStoreDispatch(page)` — polls up to 30s for `window.store.dispatch` to exist
2. If `sivilstand` provided → dispatches `userInputSlice/setSivilstand` with `{ sivilstand, epsHarPensjon, epsHarInntektOver2G }`
3. If `afp` provided → dispatches `userInputSlice/setAfp` with payload
4. If `afp === 'ja_offentlig'` and `samtykkeAfpOffentlig` provided → dispatches `userInputSlice/setSamtykkeOffentligAFP`
5. If `samtykke` provided → dispatches `userInputSlice/setSamtykke`
6. Calls `window.router.navigate('/pensjon/kalkulator/{navigateTo}')`
7. Waits for URL to match `**/pensjon/kalkulator/{navigateTo}*`

```typescript
// Skip wizard and go directly to beregning with AFP privat
await fillOutStegvisning(page, {
	afp: 'ja_privat',
	samtykke: true,
	sivilstand: 'UGIFT',
	navigateTo: 'beregning',
})
```

### `waitForStoreDispatch(page)`

Polls every 100ms (up to 30s) for `window.store` to exist and `window.store.dispatch` to be a function.

### Manual Dispatch Pattern

```typescript
await waitForStoreDispatch(page)
await page.evaluate(() => {
	window.store.dispatch({
		type: 'userInputSlice/setAfp',
		payload: 'ja_privat',
	})
	window.store.dispatch({
		type: 'userInputSlice/setSamtykke',
		payload: true,
	})
	window.router.navigate('/pensjon/kalkulator/beregning')
})
```

---

## 7. Form Utilities (`utils/form.ts`)

```typescript
// Select a dropdown option
await selectDropdown(page, 'my-dropdown-testid', 'option-value')

// Check a radio button
await checkRadio(page, 'my-radio-testid')

// Fill age picker (year + month selects)
await fillAgePicker(page, 'uttaksalder', { aar: 67, maaneder: 0 })

// Wait for element and return it
const el = await expectElementVisible(page, 'my-testid')
```

---

## 8. All 17 Spec Files

| Spec File                                        | Lines | What It Tests                                                                                                                                                                                                  |
| ------------------------------------------------ | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hovedhistorie.spec.ts`                          | 1438  | Main happy path: landing → wizard steps → beregning → chart/table/grunnlag. GIFT sivilstand, over-75, fremtidig vedtak.                                                                                        |
| `avansert.spec.ts`                               | 1192  | Advanced calculator: Enkel/Avansert toggle, uttaksalder, uttaksgrad (20-100%), gradert uttak, inntekt, vilkårsprøving. Uses `MOCK_DATE = 2024-01-01`.                                                          |
| `endring.spec.ts`                                | 2565  | Modifying existing alderspensjon vedtak. Endring-specific wizard, grad changes, AFP with endring. Uses `MOCK_DATE = 2029-08-01`, `loependeVedtak({ endring: true })` + `alderspensjon({ preset: 'endring' })`. |
| `afp.spec.ts`                                    | 509   | AFP step: vet_ikke/nei/ja_privat/ja_offentlig choices, pre-1963 offentlig, apoteker error warnings.                                                                                                            |
| `afp-vs-ufoeretrygd.spec.ts`                     | 886   | AFP + uføretrygd interaction: gradert UT (40%), uttaksgrad limits before 67, all AFP choices with UT.                                                                                                          |
| `ufoeretrygd.spec.ts`                            | 706   | 100% and gradert uføretrygd: skipped AFP step, age 67-75 only, uttaksgrad restrictions.                                                                                                                        |
| `utland.spec.ts`                                 | 721   | Utenlandsopphold: avtaleland vs ikke-avtaleland, overlapping stays, for_lite_trygdetid.                                                                                                                        |
| `med-samtykke.spec.ts`                           | 360   | Consent scenarios with pensjonsavtaler: SPK success/error/empty, no TPO, annen ordning.                                                                                                                        |
| `med-samtykke-offentlig-tjenestepensjon.spec.ts` | 1111  | Offentlig tjenestepensjon display: SPK/KLP/unsupported/no membership/error, betinget tjenestepensjon.                                                                                                          |
| `med-samtykke-private-pensjonsavtaler.spec.ts`   | 376   | Private pensjonsavtaler: no avtaler, has avtaler, delvis svar, API error, early start age.                                                                                                                     |
| `livsvarig-afp.spec.ts`                          | 277   | Livsvarig AFP offentlig: vedtak found, beløp null, API error, multiple TP ordninger.                                                                                                                           |
| `omstillingsstoenad-og-gjenlevende.spec.ts`      | 132   | Omstillingsstønad + gjenlevende: løpende sak, combined with uføretrygd.                                                                                                                                        |
| `spraakvelger.spec.ts`                           | 17    | Language selector: Bokmål default, stegvisning titles.                                                                                                                                                         |
| `a11y.spec.ts`                                   | 249   | Accessibility with axe-core: every wizard step, resultat, avansert, vedlikeholdsmodus, static pages.                                                                                                           |
| `afp-offentlig-pre2025.spec.ts`                  | 44    | Pre-2025 offentlig AFP: born 1960, custom ingress, full flow.                                                                                                                                                  |
| `graf-horizontal-scroll.spec.ts`                 | 95    | Chart scroll: desktop no scroll, mobile (414×896) scroll buttons.                                                                                                                                              |
| `utenSamtykke.spec.ts`                           | 108   | Without consent: no pensjonsavtaler column, start ny beregning link.                                                                                                                                           |

---

## 9. Real Test Patterns from Spec Files

### Pattern: Default autoAuth (hovedhistorie)

```typescript
import { expect } from '@playwright/test'

import { test } from '../../../base'

test.describe('Logged in', () => {
	test('Start page renders correctly', async ({ page }) => {
		// autoAuth is true — already on /start
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
	})
})
```

### Pattern: Custom Mocks + fillOutStegvisning (afp)

```typescript
import { test } from '../../../base'
import { authenticate } from '../../../utils/auth'
import { person, tidligsteUttaksalder } from '../../../utils/mocks'
import { fillOutStegvisning } from '../../../utils/navigation'

test.describe('AFP', () => {
	test.describe('Person born after 1963', () => {
		test.use({ autoAuth: false })

		test('AFP privat shows in chart', async ({ page }) => {
			await authenticate(page, [
				await person({ foedselsdato: '1964-04-30' }),
				await tidligsteUttaksalder({ aar: 62, maaneder: 10 }),
			])

			await fillOutStegvisning(page, {
				afp: 'ja_privat',
				samtykke: true,
				sivilstand: 'UGIFT',
				navigateTo: 'beregning',
			})

			await expect(page.getByText('AFP')).toBeVisible()
		})
	})
})
```

### Pattern: Endring with Clock Mock

```typescript
import { test } from '../../../base'
import { authenticate } from '../../../utils/auth'
import { alderspensjon, loependeVedtak } from '../../../utils/mocks'

const MOCK_DATE = '2029-08-01'

test.describe('Endring', () => {
	test.use({ autoAuth: false })

	test('shows current vedtak info', async ({ page }) => {
		await page.clock.install({ time: new Date(MOCK_DATE) })
		await authenticate(page, [
			await loependeVedtak({ endring: true }),
			await alderspensjon({ preset: 'endring' }),
		])

		await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
	})
})
```

### Pattern: Uføretrygd with Vedtak Override

```typescript
import { test } from '../../../base'
import { authenticate } from '../../../utils/auth'
import { loependeVedtak } from '../../../utils/mocks'

test.describe('100% uføretrygd', () => {
	test.use({ autoAuth: false })

	test('AFP step is skipped', async ({ page }) => {
		await authenticate(page, [
			await loependeVedtak({ ufoeretrygd: { grad: 100 } }),
		])
		// AFP step not shown, ages 67-75 only
	})
})
```

### Pattern: Offentlig Tjenestepensjon with Presets

```typescript
import { test } from '../../../base'
import { authenticate } from '../../../utils/auth'
import { offentligTp } from '../../../utils/mocks'
import { fillOutStegvisning } from '../../../utils/navigation'

test.describe('SPK membership', () => {
	test.use({ autoAuth: false })

	test('shows tjenestepensjon in chart', async ({ page }) => {
		await authenticate(page, [await offentligTp({ preset: 'spk' })])

		await fillOutStegvisning(page, {
			afp: 'ja_offentlig',
			samtykkeAfpOffentlig: true,
			samtykke: true,
			sivilstand: 'UGIFT',
			navigateTo: 'beregning',
		})

		await expect(page.getByText('Tjenestepensjon')).toBeVisible()
	})
})
```

### Pattern: Preset States

```typescript
import { test } from '../../../base'
import { authenticate } from '../../../utils/auth'
import { presetStates } from '../../../utils/presetStates'

test.describe('Pre-2025 offentlig AFP', () => {
	test.use({ autoAuth: false })

	test('shows custom start page', async ({ page }) => {
		await authenticate(page, [
			...(await presetStates.brukerUnder75MedPre2025OffentligAfpOgTidligsteUttak()),
		])
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
	})
})
```

### Pattern: Accessibility Testing (a11y)

```typescript
import AxeBuilder from '@axe-core/playwright'

import { expect, test } from '../../../base'
import { fillOutStegvisning } from '../../../utils/navigation'

test.describe('Accessibility', () => {
	test('start page has no a11y violations', async ({ page }) => {
		const results = await new AxeBuilder({ page })
			.disableRules(['color-contrast'])
			.analyze()

		expect(results.violations).toEqual([])
	})

	test('beregning page has no a11y violations', async ({ page }) => {
		await fillOutStegvisning(page, {
			afp: 'ja_privat',
			samtykke: true,
			sivilstand: 'UGIFT',
			navigateTo: 'beregning',
		})

		const results = await new AxeBuilder({ page })
			.disableRules(['color-contrast'])
			.analyze()

		expect(results.violations).toEqual([])
	})
})
```
