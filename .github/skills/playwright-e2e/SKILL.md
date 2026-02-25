# Playwright E2E Testing Skill

Production-proven E2E patterns for the pensjonskalkulator frontend.

## Quick Reference

```bash
# Run E2E tests (from apps/ekstern)
pnpm test:e2e              # Headless chromium
pnpm pw:open               # Playwright UI mode
pnpm pw:test playwright/e2e/pensjon/kalkulator/my-test.spec.ts
```

## File Structure

```
playwright/
├── base.ts                           # Custom test fixture + setupInterceptions
├── e2e/pensjon/kalkulator/           # 17 spec files
├── utils/
│   ├── auth.ts                       # authenticate()
│   ├── error.ts                      # handlePageError — suppress analytics errors
│   ├── form.ts                       # selectDropdown, checkRadio, fillAgePicker, expectElementVisible
│   ├── navigation.ts                 # fillOutStegvisning, waitForStoreDispatch
│   ├── presetStates.ts               # Composed mock scenarios
│   └── mocks/                        # Mock builder functions (person, alderspensjon, etc.)
└── mocks/                            # JSON fixture files (~30 files)
```

---

## 1. Custom Test Fixture (`base.ts`)

The `test` fixture extends Playwright's `baseTest` with auto-authentication:

- **`autoAuth`** (boolean option, default `true`) — calls `authenticate(page)` before each test

```typescript
import { test } from '../../../base'

// Default: autoAuth is true, user lands on /start
test('renders start page', async ({ page }) => {
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

// Disable to customize mocks before auth
test.describe('Custom scenario', () => {
	test.use({ autoAuth: false })

	test('custom user', async ({ page }) => {
		await authenticate(page, [await person({ sivilstand: 'GIFT' })])
	})
})
```

---

## 2. `authenticate()` — Full Flow

```typescript
export const authenticate = async (page, overwrites = []) => {
	await setupInterceptions(page, overwrites)
	await page.goto('/pensjon/kalkulator/')
	const btn = page.getByTestId('landingside-enkel-kalkulator-button')
	await btn.waitFor({ state: 'visible' })
	await btn.click()
	await page.waitForURL(/\/start/)
}
```

Authentication is faked — session endpoints return 200 and `decorator-auth.json` returns `{ authenticated: true, name: "APRIKOS NORDMANN", securityLevel: "4" }`.

---

## 3. `setupInterceptions()` — Route Mocking

Called by `authenticate()`. Steps:

1. Injects `window.__DISABLE_MSW__ = true` and `window.Playwright = true`
2. Sets `navno-consent` cookie
3. Registers 36 default routes (decorator, session, API, CDN, analytics)
4. Merges `overwrites[]` — matching routes replaced, new routes appended
5. Registers `page.route()` for each with GET/POST method matching

All API routes are under `/pensjon/kalkulator/api/...`. Feature toggles go through `/api/feature/{name}` mapped to `toggle-config.json` keys.

> Search `base.ts` for the full 36-route table and feature flag mapping.

---

## 4. Mock Builder Functions (`utils/mocks/`)

All builders return `RouteDefinition` (`{ url, method?, mockFileName?, overrideJsonResponse?, status? }`). They load a base JSON mock and merge overrides.

### Key builders

| Builder                           | URL pattern                              | Method | Key options                                                                       |
| --------------------------------- | ---------------------------------------- | ------ | --------------------------------------------------------------------------------- |
| `person(opts?)`                   | `/api/v6/person`                         | GET    | `alder`, `foedselsdato`, `sivilstand`                                             |
| `alderspensjon(opts?)`            | `/api/v9/alderspensjon/simulering`       | POST   | `preset: 'endring' \| 'for_lite_trygdetid' \| 'med_afp_offentlig'`                |
| `loependeVedtak(opts?)`           | `/api/v4/vedtak/loepende-vedtak`         | GET    | `endring: boolean`, partial `LoependeVedtakV4`                                    |
| `pensjonsavtaler(opts?)`          | `/api/v3/pensjonsavtaler`                | POST   | `delvisSvar`, partial response                                                    |
| `tidligsteUttaksalder(opts?)`     | `/api/v3/tidligste-hel-uttaksalder`      | POST   | `{ aar, maaneder }`                                                               |
| `inntekt(opts?)`                  | `/api/inntekt`                           | GET    | `{ beloep, aar }`                                                                 |
| `offentligTp(opts?)`              | `/api/v2/simuler-oftp`                   | POST   | `preset: 'spk' \| 'klp' \| 'unsupported' \| 'no_membership' \| 'technical_error'` |
| `ekskludert(opts?)`               | `/api/v2/ekskludert`                     | GET    | `{ ekskludert, aarsak }`                                                          |
| `apoteker(opts?)`                 | `/api/v1/er-apoteker`                    | GET    | `{ apoteker, aarsak }`                                                            |
| `toggleConfig(opts?)`             | `/api/feature/`                          | GET    | Toggle overrides                                                                  |
| `afpOffentligLivsvarig(opts?)`    | `/api/v2/tpo-livsvarig-offentlig-afp`    | GET    | `{ afpStatus, maanedligBeloep }`                                                  |
| `omstillingsstoenadOgGjenlevende` | `/api/v1/loepende-omstillingsstoenad...` | GET    | `{ harLoependeSak }`                                                              |

Error variants: `pensjonsavtalerError()`, `apotekerError()`, `afpOffentligLivsvarigError()`, `offentligTpTekniskFeil()`, etc.

---

## 5. Preset States (`utils/presetStates.ts`)

Composed mock arrays for common user profiles, each returning `RouteDefinition[]`:

| Preset                                                  | What It Creates               |
| ------------------------------------------------------- | ----------------------------- |
| `brukerUnder75()` / `brukerOver75()`                    | Person at specific age        |
| `brukerGift1963()`                                      | Married, born 1963-04-30      |
| `apotekerMedlem()`                                      | Born 1962, apoteker           |
| `medPre2025OffentligAfp(fom?)`                          | Pre-2025 offentlig AFP vedtak |
| `medTidligsteUttaksalder(aar, maaneder)`                | Custom earliest age           |
| `apotekerMedlemMedTidligsteUttak(aar, maaneder)`        | Composite                     |
| `brukerUnder75MedPre2025OffentligAfpOgTidligsteUttak()` | Composite                     |

```typescript
test.use({ autoAuth: false })
test('married user', async ({ page }) => {
	await authenticate(page, await presetStates.brukerGift1963())
})
```

---

## 6. `fillOutStegvisning()` — Skip the Step Wizard

Programmatically fills steps via Redux dispatches and navigates to the target.

```typescript
await fillOutStegvisning(page, {
	afp: 'ja_privat', // 'ja_privat' | 'ja_offentlig' | 'nei' | 'vet_ikke'
	samtykke: true,
	samtykkeAfpOffentlig: true, // only needed with ja_offentlig
	sivilstand: 'UGIFT', // e.g. 'UGIFT', 'GIFT', 'SAMBOER'
	epsHarPensjon: null,
	epsHarInntektOver2G: null,
	navigateTo: 'beregning', // target step
})
```

**NavigationStep values:** `'sivilstand' | 'utenlandsopphold' | 'afp' | 'ufoeretrygd-afp' | 'samtykke-offentlig-afp' | 'samtykke' | 'beregning' | 'beregning-detaljert'`

Internally: waits for `window.store.dispatch` to exist, dispatches Redux actions, then calls `window.router.navigate(...)`.

---

## 7. Form Utilities (`utils/form.ts`)

```typescript
await selectDropdown(page, 'my-dropdown-testid', 'option-value')
await checkRadio(page, 'my-radio-testid')
await fillAgePicker(page, 'uttaksalder', { aar: 67, maaneder: 0 })
const el = await expectElementVisible(page, 'my-testid')
```

---

## 8. Test Patterns

### Custom Mocks + fillOutStegvisning

```typescript
test.describe('AFP', () => {
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
```

### Endring with Clock Mock

```typescript
test('shows current vedtak info', async ({ page }) => {
	await page.clock.install({ time: new Date('2029-08-01') })
	await authenticate(page, [
		await loependeVedtak({ endring: true }),
		await alderspensjon({ preset: 'endring' }),
	])
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})
```

### Accessibility Testing

```typescript
import AxeBuilder from '@axe-core/playwright'

test('page has no a11y violations', async ({ page }) => {
	const results = await new AxeBuilder({ page })
		.disableRules(['color-contrast'])
		.analyze()
	expect(results.violations).toEqual([])
})
```

---

## 9. Spec File Reference

| Spec File                                        | What It Tests                                                        |
| ------------------------------------------------ | -------------------------------------------------------------------- |
| `hovedhistorie.spec.ts`                          | Main happy path: landing → wizard → beregning → chart/table/grunnlag |
| `avansert.spec.ts`                               | Advanced calculator: uttaksalder, uttaksgrad, gradert uttak          |
| `endring.spec.ts`                                | Modifying existing alderspensjon vedtak                              |
| `afp.spec.ts`                                    | AFP step choices                                                     |
| `afp-vs-ufoeretrygd.spec.ts`                     | AFP + uføretrygd interaction                                         |
| `ufoeretrygd.spec.ts`                            | 100% and gradert uføretrygd                                          |
| `utland.spec.ts`                                 | Utenlandsopphold scenarios                                           |
| `med-samtykke.spec.ts`                           | Consent with pensjonsavtaler                                         |
| `med-samtykke-offentlig-tjenestepensjon.spec.ts` | Offentlig tjenestepensjon display                                    |
| `med-samtykke-private-pensjonsavtaler.spec.ts`   | Private pensjonsavtaler                                              |
| `livsvarig-afp.spec.ts`                          | Livsvarig AFP offentlig                                              |
| `omstillingsstoenad-og-gjenlevende.spec.ts`      | Omstillingsstønad + gjenlevende                                      |
| `a11y.spec.ts`                                   | Accessibility with axe-core                                          |
| `afp-offentlig-pre2025.spec.ts`                  | Pre-2025 offentlig AFP                                               |
| `graf-horizontal-scroll.spec.ts`                 | Chart scroll behavior                                                |
| `spraakvelger.spec.ts`                           | Language selector                                                    |
| `utenSamtykke.spec.ts`                           | Without consent                                                      |
