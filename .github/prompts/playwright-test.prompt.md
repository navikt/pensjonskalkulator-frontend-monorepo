---
name: playwright-test
description: Generate a Playwright E2E test spec for the pensjonskalkulator
---

You are generating a Playwright E2E test for the pensjonskalkulator frontend (`apps/ekstern/`).

## Ask the User

1. **What feature/flow** are you testing?
2. **User scenarios** — what user profiles and conditions?
3. **Key assertions** — what should be verified?

## Test Template

```typescript
import { expect } from '@playwright/test'

import { test } from '../../../base'
import { authenticate } from '../../../utils/auth'
import { loependeVedtak, person } from '../../../utils/mocks'
import { fillOutStegvisning } from '../../../utils/navigation'

test.describe('Feature Name', () => {
	test.describe('Given a standard user', () => {
		test('Then expected behavior occurs', async ({ page }) => {
			// autoAuth=true by default: calls authenticate(page) which:
			// 1. Sets up route interceptions (setupInterceptions)
			// 2. Navigates to /pensjon/kalkulator/
			// 3. Clicks the "enkel kalkulator" button
			// 4. Waits for /start URL
			await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
		})
	})

	test.describe('Given a custom user scenario', () => {
		test.use({ autoAuth: false })

		test('Then custom behavior occurs', async ({ page }) => {
			await authenticate(page, [
				await person({
					alder: { aar: 65, maaneder: 0, dager: 0 },
					sivilstand: 'GIFT',
				}),
			])

			await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
		})
	})
})
```

## authenticate() Function

```typescript
authenticate(page: Page, overwrites?: RouteDefinition[]): Promise<void>
```

The `overwrites` parameter is an array of `RouteDefinition` objects:

```typescript
type RouteDefinition = {
	url: RegExp | string
	method?: 'GET' | 'POST'
	mockFileName?: string // Loads from playwright/mocks/{name}
	overrideJsonResponse?: Record<string, unknown> | unknown[]
	status?: number
}
```

Each overwrite replaces a matching default route interception. New routes (non-matching) are appended.

## Mock Builders (from `utils/mocks`)

All mock builders are **async** and return `Promise<RouteDefinition>`:

```typescript
// Person — customize age, sivilstand, birth date, pensjoneringAldre
await person({ alder: { aar: 65, maaneder: 0, dager: 0 }, sivilstand: 'GIFT' })
await person({ foedselsdato: '1963-04-30', fornavn: 'Aprikos', pensjoneringAldre: { ... } })

// Løpende vedtak — customize with partial overrides or endring mode
await loependeVedtak()                    // Default (no vedtak)
await loependeVedtak({ endring: true })   // Loads loepende-vedtak-endring.json
await loependeVedtak({ pre2025OffentligAfp: { fom: '2023-01-01' } })
await loependeVedtak({ fremtidigAlderspensjon: { grad: 100, fom: '2099-01-01' } })

// Alderspensjon simulering
await alderspensjon()

// Apoteker status
await apoteker({ apoteker: true, aarsak: 'ER_APOTEKER' })
await apotekerError()

// Inntekt
await inntekt()

// Offentlig tjenestepensjon variants
await offentligTp()
await offentligTpTekniskFeil()
await offentligTpTomSimulering()
await offentligTpIkkeMedlem()
await offentligTpAnnenOrdning()

// Pensjonsavtaler variants
await pensjonsavtaler()
await pensjonsavtalerError()
await pensjonsavtalerDelvisSvarTom()

// AFP offentlig livsvarig
await afpOffentligLivsvarig()
await afpOffentligLivsvarigError()
await afpOffentligLivsvarigFlereTpOrdninger()

// Others
await tidligsteUttaksalder({ aar: 62, maaneder: 10 })
await omstillingsstoenadOgGjenlevende()
await ekskludert()
await toggleConfig()
await representasjonBanner()
```

## Preset States (from `utils/presetStates`)

Convenience functions returning `RouteDefinition[]` arrays:

```typescript
import { presetStates } from '../../../utils/presetStates'

test.use({ autoAuth: false })
test('scenario', async ({ page }) => {
	await authenticate(page, await presetStates.brukerGift1963())
})
```

Available presets:

- `presetStates.brukerUnder75()` — person aged 65
- `presetStates.brukerOver75()` — person aged 75+
- `presetStates.brukerGift1963()` — person born 1963-04-30, GIFT sivilstand
- `presetStates.brukerEldreEnn67()` — person born 1956-04-30, UGIFT
- `presetStates.apotekerMedlem()` — person born 1962 + apoteker status
- `presetStates.medPre2025OffentligAfp(fom?)` — løpende vedtak with pre2025 AFP
- `presetStates.medFremtidigAlderspensjonVedtak()` — løpende vedtak with fremtidig vedtak
- `presetStates.medTidligsteUttaksalder(aar, maaneder)` — custom tidligste uttaksalder
- `presetStates.apotekerMedlemMedTidligsteUttak(aar, maaneder)` — combined
- `presetStates.brukerUnder75MedPre2025OffentligAfpOgTidligsteUttak()` — combined

## fillOutStegvisning() — Skip Steps via Redux Dispatch

```typescript
await fillOutStegvisning(page, {
  afp?: AfpRadio,                           // 'ja_privat' | 'ja_offentlig' | 'nei' | 'vet_ikke'
  samtykke?: boolean,
  samtykkeAfpOffentlig?: boolean,           // Only dispatched if afp === 'ja_offentlig'
  sivilstand?: Sivilstand,                  // Also accepts epsHarPensjon and epsHarInntektOver2G
  epsHarPensjon?: boolean | null,
  epsHarInntektOver2G?: boolean | null,
  navigateTo: NavigationStep,               // Required: target step
})
```

`NavigationStep` values: `'sivilstand'`, `'utenlandsopphold'`, `'afp'`, `'ufoeretrygd-afp'`, `'samtykke-offentlig-afp'`, `'samtykke'`, `'beregning'`, `'beregning-detaljert'`

The function dispatches Redux actions directly via `page.evaluate()` then navigates using `window.router.navigate()`.

## Direct Redux Dispatch

```typescript
import { waitForStoreDispatch } from '../../../utils/navigation'

await waitForStoreDispatch(page)
await page.evaluate(() => {
	window.store.dispatch({ type: 'userInputSlice/setAfp', payload: 'ja_privat' })
	window.router.navigate('/pensjon/kalkulator/beregning')
})
```

## Accessibility

```typescript
import AxeBuilder from '@axe-core/playwright'

test('no a11y violations', async ({ page }) => {
	const results = await new AxeBuilder({ page }).analyze()
	expect(results.violations).toEqual([])
})
```

## File Location

Place test specs in: `apps/ekstern/playwright/e2e/pensjon/kalkulator/`

## Conventions

- BDD-style: `test.describe('Given X', () => { test('Then Y', ...) })`
- Use `autoAuth: false` + `authenticate()` for custom scenarios
- Use mock builders for dynamic responses (all are async, return `RouteDefinition`)
- Use `getByRole`, `getByTestId` locators
- Wait for async content with `await expect(...).toBeVisible()`
- Key test-ids: `stegvisning-neste-button`, `stegvisning-tilbake-button`, `stegvisning-avbryt-button`, `landingside-enkel-kalkulator-button`
