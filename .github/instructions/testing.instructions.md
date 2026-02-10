---
applyTo: '**/*.test.{ts,tsx}'
---

# Testing Standards

## Test Framework

This project uses **Vitest** with **Testing Library** and **MSW** (Mock Service Worker).

## Test Structure

Tests live in `__tests__/` folders next to the code they test:

```
src/components/MyComponent/
├── MyComponent.tsx
├── MyComponent.module.scss
├── index.ts
└── __tests__/
    └── MyComponent.test.tsx
```

## Imports

### From `@/test-utils` (the only render source)

`@/test-utils` re-exports **everything** from `@testing-library/react` plus `userEvent` from `@testing-library/user-event`. It also exports `render` (aliased from `renderWithProviders`), `swallowErrors`, and `swallowErrorsAsync`.

```tsx
// ✅ Standard test imports — all from @/test-utils
import {
	act,
	render,
	screen,
	swallowErrors,
	swallowErrorsAsync,
	userEvent,
	waitFor,
	within,
} from '@/test-utils'
```

### From `vitest` directly

```tsx
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
```

### From `@testing-library/react` directly — NEVER import `render`

Only import `renderHook` from `@testing-library/react` when testing custom hooks:

```tsx
import { renderHook } from '@testing-library/react'
```

## Rendering Components

Always use `render` from `@/test-utils`. It wraps components with:

- **Redux Provider** (with `setupStore`, defaults to `isLoggedIn: true`)
- **IntlProvider** (locale `nb`, with mocked translations — simple keys map to themselves)
- **SanityContext.Provider** (pre-loaded with JSON fixture data for guidePanels, readMore, forbeholdAvsnitt)
- **MemoryRouter** (default) or **RouterProvider with authenticationGuard** (when `hasLogin: true`)

### Options: `ExtendedRenderOptions`

```tsx
interface ExtendedRenderOptions {
  preloadedState?: Partial<RootState>    // Redux slices: session, userInput
  preloadedApiState?: { [Key in QueryKeys]?: ... }  // RTK Query cache
  store?: AppStore                        // Custom store instance
  hasRouter?: boolean                     // default: true (MemoryRouter)
  hasLogin?: boolean                      // default: false; true = RouterProvider + authenticationGuard
}
```

### `preloadedState` — Redux state shape

`RootState` has three slices: `api` (RTK Query, use `preloadedApiState` instead), `session`, and `userInput`.

```tsx
// Session slice
render(<Comp />, {
	preloadedState: {
		session: { isLoggedIn: true, hasErApotekerError: false },
	},
})

// UserInput slice — common fields
render(<Comp />, {
	preloadedState: {
		userInput: {
			afp: 'ja_offentlig', // AfpRadio: 'ja_offentlig' | 'ja_privat' | 'nei' | 'vet_ikke'
			samtykke: true,
			samtykkeOffentligAFP: true,
			harUtenlandsopphold: true,
			utenlandsperioder: [
				{
					landkode: 'SWE',
					arbeidetUtenlands: true,
					startdato: '01.01.2010',
					sluttdato: '31.12.2015',
				},
			],
			sivilstand: 'GIFT',
			currentSimulation: {
				beregningsvalg: 'med_afp', // null | 'med_afp' | 'uten_afp'
				uttaksalder: { aar: 67, maaneder: 0 },
				aarligInntektFoerUttakBeloep: '500000',
				gradertUttaksperiode: null,
			},
		},
	},
})
```

Note: `render` defaults `session` to `{ isLoggedIn: true, hasErApotekerError: false }` — tests are logged in by default.

### `preloadedApiState` — RTK Query cache injection

Uses `apiSlice.util.upsertQueryEntries` under the hood. All endpoint names (type `QueryKeys`):

| Endpoint                                     | Data type                                                                                                                                        |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `getInntekt`                                 | `Inntekt` (`{ beloep: number, aar: number }`)                                                                                                    |
| `getPerson`                                  | `Person` (`{ navn, fornavn, sivilstand, foedselsdato, pensjoneringAldre: { normertPensjoneringsalder, nedreAldersgrense, oevreAldersgrense } }`) |
| `getGrunnbeloep`                             | `number`                                                                                                                                         |
| `getErApoteker`                              | `boolean`                                                                                                                                        |
| `getOmstillingsstoenadOgGjenlevende`         | `{ harLoependeSak: boolean }`                                                                                                                    |
| `getLoependeVedtak`                          | `LoependeVedtak`                                                                                                                                 |
| `offentligTp`                                | `OffentligTp`                                                                                                                                    |
| `offentligTpFoer1963`                        | `OffentligTp`                                                                                                                                    |
| `getAfpOffentligLivsvarig`                   | `AfpOffentligLivsvarig`                                                                                                                          |
| `tidligstMuligHeltUttak`                     | `TidligstMuligHeltUttak`                                                                                                                         |
| `pensjonsavtaler`                            | `Pensjonsavtaler`                                                                                                                                |
| `alderspensjon`                              | `Alderspensjon`                                                                                                                                  |
| `getSpraakvelgerFeatureToggle`               | `UnleashToggle`                                                                                                                                  |
| `getUtvidetSimuleringsresultatFeatureToggle` | `UnleashToggle`                                                                                                                                  |
| `getVedlikeholdsmodusFeatureToggle`          | `UnleashToggle`                                                                                                                                  |
| `getShowDownloadPdfFeatureToggle`            | `UnleashToggle`                                                                                                                                  |
| `getAnsattId`                                | `Ansatt`                                                                                                                                         |

```tsx
render(<Comp />, {
	preloadedApiState: {
		getPerson: {
			navn: 'Aprikos Nordmann',
			fornavn: 'Aprikos',
			sivilstand: 'UGIFT',
			foedselsdato: '1963-04-30',
			pensjoneringAldre: {
				normertPensjoneringsalder: { aar: 67, maaneder: 0 },
				nedreAldersgrense: { aar: 62, maaneder: 0 },
				oevreAldersgrense: { aar: 75, maaneder: 0 },
			},
		},
		getInntekt: { beloep: 521338, aar: 2021 },
		getLoependeVedtak: {
			harLoependeVedtak: false,
			ufoeretrygd: { grad: 0 },
		},
	},
})
```

### `hasRouter: false` — No router wrapping

```tsx
render(<MyComponent />, { hasRouter: false })
```

### `hasLogin: true` — Login flow with `authenticationGuard` loader

Wraps in `createBrowserRouter` with `authenticationGuard` as loader. Uses `RouterProvider` instead of `MemoryRouter`. Requires a mocked `/oauth2/session` response (provided globally in `test-setup.ts`).

```tsx
render(<MyComponent />, { hasLogin: true })
```

### Pre-built API state fixtures from `@/mocks/mockedRTKQueryApiCalls`

For loader tests and store-level tests that need the raw RTK Query cache format:

```tsx
import {
	fulfilledGetGrunnbeloep,
	fulfilledGetLoependeVedtak0Ufoeregrad,
	fulfilledGetPerson,
} from '@/mocks/mockedRTKQueryApiCalls'
```

These are raw cache entries (e.g., `{ 'getPerson(undefined)': { status: 'fulfilled', data: ... } }`) used with direct store manipulation in loader tests. For component tests, prefer `preloadedApiState`.

## User Interactions

Always call `userEvent.setup()` before `render`:

```tsx
it('håndterer klikk', async () => {
	const user = userEvent.setup()
	render(<MyComponent />)

	await user.click(screen.getByRole('button', { name: /beregn/i }))
	expect(screen.getByText('resultat.key')).toBeInTheDocument()
})
```

## MSW Mocking

### Global setup (`test-setup.ts`)

MSW is configured globally:

- `beforeAll`: `server.listen({ onUnhandledRequest: 'error' })` — unhandled requests throw
- `beforeEach`: `mockResponse('/oauth2/session', { baseUrl: HOST_BASEURL })` — session always mocked
- `afterEach`: `server.resetHandlers()` — overrides cleared between tests
- `afterAll`: `server.close()`

### `mockResponse` — Override a successful response

```tsx
import { mockResponse } from '@/mocks/server'

mockResponse('/v6/person', {
  json: { fornavn: 'Test', sivilstand: 'GIFT', foedselsdato: '1963-04-30', pensjoneringAldre: { ... } },
})

// Full signature:
mockResponse(path: string, options?: {
  status?: number       // default: 200
  json?: Record<string, unknown>  // default: { data: 'ok' }
  text?: string         // if set, returns text response instead of JSON
  method?: 'post' | 'get'  // default: 'get'
  baseUrl?: string      // default: API_BASEURL
})
```

### `mockErrorResponse` — Override with error

```tsx
import { mockErrorResponse } from '@/mocks/server'

mockErrorResponse('/v6/person')                    // 500 by default
mockErrorResponse('/v6/person', { status: 403 })   // custom status

// Full signature:
mockErrorResponse(path: string, options?: {
  status?: number       // default: 500
  json?: Record<string, unknown>  // default: ''
  method?: 'post' | 'get'  // default: 'get'
  baseUrl?: string      // default: API_BASEURL
})
```

### Direct `server.use` — Custom handlers

For complex scenarios not covered by `mockResponse`/`mockErrorResponse`:

```tsx
import { HttpResponse, http } from 'msw'

import { server } from '@/mocks/server'

server.use(
	http.post(`${API_BASEURL}/v9/alderspensjon/simulering`, () => {
		return HttpResponse.json({
			alderspensjon: [{ alder: 67, beloep: 300000 }],
			vilkaarsproeving: { vilkaarErOppfylt: true },
		})
	})
)
```

### Common API paths used in tests

- `/oauth2/session` — session check (baseUrl: `HOST_BASEURL`)
- `/inntekt` — income
- `/v6/person` — person data
- `/v4/vedtak/loepende-vedtak` — current vedtak
- `/v9/alderspensjon/simulering` — pension simulation (POST)
- `/v3/tidligste-hel-uttaksalder` — earliest withdrawal age
- `/v3/pensjonsavtaler` — pension agreements (POST)
- `/v2/simuler-oftp/fra-1963` — public TP simulation (POST)
- `/v2/simuler-oftp/foer-1963` — public TP pre-1963 simulation (POST)
- `/v1/er-apoteker` — pharmacist check
- `/api/v1/grunnbeløp` — base amount
- `/feature/pensjonskalkulator.disable-spraakvelger` — feature toggle
- `/feature/pensjonskalkulator.vedlikeholdsmodus` — maintenance mode toggle
- `/feature/utvidet-simuleringsresultat` — extended results toggle

## Global Mocks in `test-setup.ts`

The following are mocked globally for all tests:

| Mock                                          | Details                                                                                                                          |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `global.scrollTo`                             | `vi.fn()`                                                                                                                        |
| `window.matchMedia`                           | Returns `{ matches: false, addListener, addEventListener, removeListener, removeEventListener }`                                 |
| `window.ResizeObserver`                       | `{ disconnect: vi.fn(), observe: vi.fn(), unobserve: vi.fn() }`                                                                  |
| `window.document.cookie`                      | Set to `'decorator-language=nb'` (writable)                                                                                      |
| `window.HTMLElement.prototype.scrollIntoView` | `vi.fn()`                                                                                                                        |
| `window.CSS.supports`                         | `() => false` (if not already present)                                                                                           |
| `@navikt/nav-dekoratoren-moduler`             | `vi.mock` — `getAnalyticsInstance` returns `vi.fn()`, `onLanguageSelect` returns `vi.fn()`, `setAvailableLanguages` is `vi.fn()` |

## Translation Key Assertions

The test translation system in `test-utils.tsx` processes all keys from `translations/nb.ts` (plus `test-translations`):

- **Simple keys** (no HTML or `{chunks}`): the key maps to **itself**. Assert with the key name.
- **Complex keys** (containing HTML tags or `{interpolation}`): the key maps to the **original Norwegian value** with tags/chunks.

```tsx
// ✅ Simple key — key renders as itself
expect(screen.getByText('stegvisning.start.title')).toBeInTheDocument()

// ✅ Complex key with chunks — original value with chunks intact
// Use a matcher function or regex if needed

// ❌ Never assert plain Norwegian text for simple keys
expect(screen.getByText('Beregn din pensjon')).toBeInTheDocument()
```

## Norwegian Naming Convention

All test descriptions and describe blocks are written in **Norwegian Bokmål**. Use the same convention:

```tsx
describe('MittKomponent', () => {
  describe('Gitt at brukeren har uføretrygd, ', () => {
    it('viser riktig tekst og lenke', () => { ... })
    it('brukeren kan overskrive den', () => { ... })
  })

  describe('Når simuleringen svarer med vilkaarIkkeOppfylt, ', () => {
    it('viser alert med informasjon om alternativer', () => { ... })
  })
})
```

Common patterns in test names:

- `viser riktig tekst/tittel/innhold`
- `rendrer med riktig ...`
- `brukeren kan ...`
- `Når brukeren klikker på ...`
- `Gitt at brukeren har ...`
- `returnerer true/false når ...`
- `nullstiller/oppdaterer ... og hasUnsavedChanges`

## `vi.useFakeTimers` — Date-Dependent Tests

Many age-calculation functions depend on `Date.now()`. Use `vi.useFakeTimers().setSystemTime()` to pin the date:

```tsx
it('beregner riktig alder', () => {
	vi.useFakeTimers().setSystemTime(new Date('2025-06-06'))

	const result = getAlderFromFoedselsdato('1963-04-30')
	expect(result).toBe(62)

	vi.useRealTimers()
})
```

Always call `vi.useRealTimers()` in `afterEach` or at the end of the test. This is critical for:

- `getAlderFromFoedselsdato`, `isAlderOver67`, `isAlderOver62`, `isAlder75MaanedenFylt`
- `transformFoedselsdatoToAlder`, `getBrukerensAlderISluttenAvMaaneden`
- Highcharts utility functions that compute current year
- LanguageProvider timeout tests

## Guard / Loader Testing Pattern

Loaders are tested by calling them directly with a mock `LoaderFunctionArgs`:

```tsx
import { LoaderFunctionArgs } from 'react-router'

import { mockErrorResponse, mockResponse } from '@/mocks/server'
import * as apiSliceUtils from '@/state/api/apiSlice'
import { store } from '@/state/store'

import { stepStartAccessGuard } from '../loaders'

function createMockRequest(url = 'https://example.com'): LoaderFunctionArgs {
	return {
		request: new Request(url),
		params: {},
		context: {},
	}
}

describe('Loaders', () => {
	beforeEach(() => {
		sessionStorage.clear()
	})
	afterEach(() => {
		store.dispatch(apiSliceUtils.apiSlice.util.resetApiState())
	})

	it('redirecter til /start når brukeren er veileder', async () => {
		const mockedState = {
			userInput: { ...userInputInitialState, veilederBorgerFnr: '81549300' },
		}
		store.getState = vi.fn().mockImplementation(() => mockedState)

		const result = await landingPageAccessGuard(createMockRequest())
		expect(result).toHaveProperty('status', 302)
		expect(result.headers.get('location')).toBe('/start')
	})
})
```

Key patterns:

- Mock `store.getState` with `vi.fn().mockImplementation()` to control Redux state
- Use `mockResponse`/`mockErrorResponse` for API responses the loader fetches
- Assert redirect responses with `status: 302` and `headers.get('location')`
- Reset API state in `afterEach` with `store.dispatch(apiSlice.util.resetApiState())`

## `swallowErrors` / `swallowErrorsAsync`

Suppress expected `console.error` output (e.g., React error boundaries, intentional error renders):

```tsx
import { render, screen, swallowErrors, swallowErrorsAsync } from '@/test-utils'

// Synchronous — wraps render that triggers console.error
it('rendrer feilmelding', () => {
	swallowErrors(() => {
		render(<ComponentThatThrows />)
	})
	expect(screen.getByText('error.key')).toBeInTheDocument()
})

// Async — wraps async operations that trigger console.error
it('håndterer async feil', async () => {
	await swallowErrorsAsync(async () => {
		render(<ComponentWithAsyncError />)
		await waitFor(() => {
			expect(screen.getByText('error.key')).toBeInTheDocument()
		})
	})
})
```

Both work by temporarily replacing `console.error` with a no-op and restoring it after the callback.

## `waitFor` / `findBy` Patterns for Async Content

### `waitFor` — Wait for assertions to pass

```tsx
it('laster data og viser resultat', async () => {
	render(<Beregning />)

	await waitFor(() => {
		expect(screen.getByText('resultat.key')).toBeInTheDocument()
	})
})
```

### `findBy*` — Query that waits (returns promise)

```tsx
it('viser innhold etter lasting', async () => {
	render(<PageWithLoader />)

	const heading = await screen.findByRole('heading', { name: /tittel/i })
	expect(heading).toBeInTheDocument()
})
```

### Combined patterns

```tsx
it('laster og viser avtaler', async () => {
  const user = userEvent.setup()
  render(<Pensjonsavtaler />, {
    preloadedState: { userInput: { samtykke: true, afp: 'ja_privat', ... } },
  })

  // Wait for loading to finish
  await waitFor(() => {
    expect(screen.queryByText('application.loading')).not.toBeInTheDocument()
  })

  // Now interact
  await user.click(screen.getByRole('button', { name: /vis detaljer/i }))
  expect(screen.getByText('detaljer.key')).toBeInTheDocument()
})
```

## Running Tests

```bash
# All tests (from apps/ekstern)
pnpm test

# Single file
pnpm vitest run src/components/MyComponent/__tests__/MyComponent.test.tsx

# By name pattern
pnpm vitest run -t "should handle click"

# Watch mode
pnpm test:watch
```

## Coverage Thresholds

Enforced in `vite.config.ts`:

- Lines: 85%
- Branches: 85%
- Statements: 85%
- Functions: 50%

## E2E Tests (Playwright)

E2E tests live in `playwright/e2e/` and run with:

```bash
pnpm test:e2e          # Headless chromium
pnpm pw:open           # UI mode
```

## Boundaries

### ✅ Always

- Use `render` from `@/test-utils` (never from `@testing-library/react`)
- Use `userEvent.setup()` before render, then `user.click()` etc.
- Test user-visible behavior, not implementation details
- Use `userEvent` over `fireEvent`
- Write test descriptions in Norwegian Bokmål
- Clean up fake timers with `vi.useRealTimers()`
- MSW overrides auto-reset between tests via `server.resetHandlers()` in global `afterEach`

### ⚠️ Ask First

- Adding new test utilities or helpers
- Disabling or skipping tests

### 🚫 Never

- Import `render` directly from `@testing-library/react`
- Test implementation details (internal state, private methods)
- Commit failing tests
- Share mutable state between tests
- Assert Norwegian text for simple translation keys (assert the key itself)
