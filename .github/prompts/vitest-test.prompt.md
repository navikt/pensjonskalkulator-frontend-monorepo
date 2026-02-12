---
name: vitest-test
description: Generate a Vitest test file for components, pages, utilities, or hooks
---

You are generating a Vitest test file for the pensjonskalkulator frontend (`apps/ekstern/`).

## Ask the User

1. **What are you testing?** Component, page/loader, utility function, or hook?
2. **File path** of the code to test
3. **Key behaviors** to cover

## Rules

- Import `render`, `screen`, `waitFor` from `@/test-utils` (custom wrapper — NOT from `@testing-library/react`)
- Import `userEvent` from `@/test-utils` (re-exported from `@testing-library/user-event`)
- Import `vi`, `describe`, `it`, `expect` from `vitest`
- Use `vi.fn()` for mocks, `vi.useFakeTimers()` for date logic
- Test names in Norwegian: `rendrer korrekt`, `håndterer klikk`, `returnerer forventet verdi`
- Assert on translation keys, not Norwegian text (test-utils replaces translations with their keys)
- Place test in `__tests__/` folder next to source

## Component Test

```tsx
import { describe, expect, it, vi } from 'vitest'

import { render, screen, userEvent } from '@/test-utils'

import { MyComponent } from '../MyComponent'

describe('MyComponent', () => {
	it('rendrer korrekt', () => {
		render(<MyComponent />)
		expect(screen.getByText('mycomponent.title')).toBeVisible()
	})

	it('rendrer med API-data', () => {
		render(<MyComponent />, {
			preloadedApiState: {
				getPerson: {
					navn: 'Aprikos Nordmann',
					fornavn: 'Aprikos',
					sivilstand: 'UGIFT',
					foedselsdato: '1964-04-30',
					pensjoneringAldre: {
						normertPensjoneringsalder: { aar: 67, maaneder: 0 },
						nedreAldersgrense: { aar: 62, maaneder: 0 },
						oevreAldersgrense: { aar: 75, maaneder: 0 },
					},
				},
				getInntekt: { beloep: 521338, aar: 2023 },
				getLoependeVedtak: {
					alderspensjon: null,
					ufoeretrygd: { grad: 0 },
					afpPrivat: null,
					afpOffentlig: null,
					pre2025OffentligAfp: null,
					fremtidigAlderspensjon: null,
				},
			},
		})
	})

	it('håndterer brukerinteraksjon', async () => {
		const user = userEvent.setup()
		const onClickMock = vi.fn()
		render(<MyComponent onClick={onClickMock} />)
		await user.click(screen.getByRole('button', { name: /neste/i }))
		expect(onClickMock).toHaveBeenCalled()
	})

	it('rendrer med preloaded userInput state', () => {
		render(<MyComponent />, {
			preloadedState: {
				userInput: {
					...userInputInitialState,
					afp: 'ja_privat',
					samtykke: true,
					sivilstand: null,
					epsHarPensjon: null,
					epsHarInntektOver2G: null,
					harUtenlandsopphold: null,
					utenlandsperioder: [],
					samtykkeOffentligAFP: null,
					afpUtregningValg: 'IKKE_RELEVANT',
					afpInntektMaanedFoerUttak: null,
					stillingsprosentVsaPensjon: null,
					stillingsprosentVsaGradertPensjon: null,
					currentSimulation: {
						uttaksalder: null,
						aarligInntektFoerUttakBeloep: null,
						gradertUttaksperiode: null,
						beregningsvalg: null,
					},
					xAxis: [],
				},
			},
		})
	})
})
```

## Available preloadedApiState Keys

These correspond to RTK Query endpoint names in `apiSlice.ts`:

- `getInntekt` → `Inntekt` (`{ beloep: number, aar: number }`)
- `getPerson` → `Person` (`{ navn, fornavn, sivilstand, foedselsdato, pensjoneringAldre }`)
- `getGrunnbeloep` → `number` (e.g., `124028`)
- `getErApoteker` → `boolean`
- `getOmstillingsstoenadOgGjenlevende` → `{ harLoependeSak: boolean }`
- `getLoependeVedtak` → `LoependeVedtak`
- `offentligTp` → `OffentligTp`
- `offentligTpFoer1963` → `OffentligTpFoer1963`
- `getAfpOffentligLivsvarig` → `AfpOffentligLivsvarig`
- `tidligstMuligHeltUttak` → `Alder` (`{ aar: number, maaneder: number }`)
- `pensjonsavtaler` → `{ avtaler: Pensjonsavtale[], partialResponse: boolean }`
- `alderspensjon` → `AlderspensjonResponseBody`
- `getSpraakvelgerFeatureToggle` → `{ enabled: boolean }`
- `getVedlikeholdsmodusFeatureToggle` → `{ enabled: boolean }`
- `getShowDownloadPdfFeatureToggle` → `{ enabled: boolean }`
- `getUtvidetSimuleringsresultatFeatureToggle` → `{ enabled: boolean }`
- `getAnsattId` → `{ id: string }`

## Utility Test

```tsx
import { describe, expect, it, vi } from 'vitest'

import { myFunction } from '../myUtil'

describe('myFunction', () => {
	it('returnerer forventet verdi', () => {
		expect(myFunction('input')).toBe('output')
	})

	it('håndterer dato-logikk', () => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2030-01-01'))
		expect(myFunction()).toBe('expected')
		vi.useRealTimers()
	})
})
```

## Loader/Guard Test

Guards are called with `{ request, params }`. The `request` URL must include the full base path `/pensjon/kalkulator/`:

```tsx
import { describe, expect, it } from 'vitest'

import { mockErrorResponse } from '@/mocks/server'

import { myGuard } from '../loaders'

describe('myGuard', () => {
	it('returnerer data ved gyldig tilgang', async () => {
		const result = await myGuard({
			request: new Request('http://localhost/pensjon/kalkulator/path'),
			params: {},
			context: {},
		})
		expect(result).toHaveProperty('person')
	})

	it('redirecter ved feil', async () => {
		mockErrorResponse('/v6/person', { status: 403 })
		const result = await myGuard({
			request: new Request('http://localhost/pensjon/kalkulator/path'),
			params: {},
			context: {},
		})
		expect((result as Response).status).toBe(302)
	})
})
```

## MSW Override

The project uses MSW (Mock Service Worker) with handlers in `src/mocks/handlers.ts`.

**`mockResponse` signature** (from `@/mocks/server`):

```typescript
mockResponse(path: string, options?: {
  status?: number       // default: 200
  json?: Record<string, unknown>
  text?: string
  method?: 'post' | 'get'  // default: 'get'
  baseUrl?: string          // default: API_BASEURL
})
```

**`mockErrorResponse` signature** (from `@/mocks/server`):

```typescript
mockErrorResponse(path: string, options?: {
  status?: number       // default: 500
  json?: Record<string, unknown>
  method?: 'post' | 'get'  // default: 'get'
  baseUrl?: string          // default: API_BASEURL
})
```

**Direct MSW override** (for more control):

```tsx
import { HttpResponse, http } from 'msw'

import { server } from '@/mocks/server'

it('håndterer API-feil', async () => {
	server.use(
		http.get(
			'/pensjon/kalkulator/api/v6/person',
			() => new HttpResponse(null, { status: 500 })
		)
	)
	render(<MyComponent />)
	expect(await screen.findByText('error.key')).toBeVisible()
})
```

## Typeguard Test Pattern

Typeguards in `src/state/api/typeguards.ts` use `any` input and check fields:

```tsx
import { describe, expect, it } from 'vitest'

import { isMyType } from '../typeguards'

describe('isMyType', () => {
	it('returnerer true for gyldig data', () => {
		expect(isMyType({ field: 'value', count: 42 })).toBe(true)
	})

	it('returnerer false for null', () => {
		expect(isMyType(null)).toBe(false)
	})

	it('returnerer false for undefined', () => {
		expect(isMyType(undefined)).toBe(false)
	})

	it('returnerer false når felt mangler', () => {
		expect(isMyType({ field: 'value' })).toBe(false)
	})

	it('returnerer false for feil type', () => {
		expect(isMyType({ field: 123, count: 42 })).toBe(false)
	})
})
```

## render() Options

The custom `render()` from `@/test-utils` wraps components in `Provider` (Redux), `IntlProvider`, `SanityContext.Provider`, and `MemoryRouter`. Options:

```typescript
render(ui, {
  preloadedState?: Partial<RootState>,    // Redux state (session, userInput)
  preloadedApiState?: { ... },            // RTK Query cached responses
  store?: AppStore,                        // Custom store instance
  hasRouter?: boolean,                     // default: true (MemoryRouter)
  hasLogin?: boolean,                      // default: false (use RouterProvider with auth guard)
})
```

Default test session state: `{ isLoggedIn: true, hasErApotekerError: false }`
