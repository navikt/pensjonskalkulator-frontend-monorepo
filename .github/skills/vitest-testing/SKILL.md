# Vitest Testing Skill

Production-proven testing patterns for the pensjonskalkulator frontend. Every code example matches the actual codebase.

## Quick Reference

```bash
# Run all tests (from apps/ekstern)
pnpm test

# Single file
pnpm vitest run src/components/MyComponent/__tests__/MyComponent.test.tsx

# By pattern
pnpm vitest run -t "should render"

# Watch mode
pnpm test:watch

# With UI
pnpm test:ui
```

## Imports

```tsx
// Rendering, queries, events — userEvent is re-exported from test-utils
// Direct MSW usage for custom handlers
import { HttpResponse, http } from 'msw'
// Vitest globals
import { describe, expect, it, vi } from 'vitest'

// Pre-built RTK Query cache entries for loader/guard tests
import {
	fulfilledGetErApoteker,
	fulfilledGetGrunnbeloep,
	fulfilledGetInntekt,
	fulfilledGetLoependeVedtak0Ufoeregrad,
	fulfilledGetOmstillingsstoenadOgGjenlevendeUtenSak,
	// ... many more variants
	fulfilledGetPerson,
} from '@/mocks/mockedRTKQueryApiCalls'
// MSW helpers for overriding default handlers
import { mockErrorResponse, mockResponse } from '@/mocks/server'
import { server } from '@/mocks/server'
import {
	render,
	screen,
	swallowErrors,
	swallowErrorsAsync,
	userEvent,
} from '@/test-utils'
```

## Component Test Template

```tsx
import { describe, expect, it, vi } from 'vitest'

import { render, screen, userEvent } from '@/test-utils'

import { MyComponent } from '../MyComponent'

describe('MyComponent', () => {
	it('rendrer korrekt', () => {
		render(<MyComponent />)
		expect(screen.getByText('mycomponent.title')).toBeVisible()
	})

	it('håndterer brukerinteraksjon', async () => {
		const user = userEvent.setup()
		render(<MyComponent />)

		await user.click(screen.getByRole('button', { name: /neste/i }))
		expect(screen.getByText('result.key')).toBeVisible()
	})

	it('håndterer callbacks', async () => {
		const onNextMock = vi.fn()
		const user = userEvent.setup()
		render(<MyComponent onNext={onNextMock} />)

		await user.click(screen.getByRole('button', { name: /neste/i }))
		expect(onNextMock).toHaveBeenCalledWith(
			expect.objectContaining({ value: 'expected' })
		)
	})
})
```

## preloadedApiState — Correct Format

The `render()` function accepts `preloadedApiState` which internally calls `apiSlice.util.upsertQueryEntries`. Each key is an **endpoint name** and the value is the **response data** (not the full RTK Query cache entry). The render function builds the `{ endpointName, arg: undefined, value }` entries automatically.

### All Available Endpoint Names

```
getPerson, getInntekt, getGrunnbeloep, getErApoteker,
getOmstillingsstoenadOgGjenlevende, getLoependeVedtak,
offentligTp, offentligTpFoer1963, getAfpOffentligLivsvarig,
tidligstMuligHeltUttak, pensjonsavtaler, alderspensjon,
getSpraakvelgerFeatureToggle, getVedlikeholdsmodusFeatureToggle,
getShowDownloadPdfFeatureToggle, getUtvidetSimuleringsresultatFeatureToggle,
getAnsattId
```

### Correct getPerson Shape

```tsx
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
	},
})
```

### Correct getInntekt Shape

```tsx
preloadedApiState: {
  getInntekt: { beloep: 521338, aar: 2021 },
}
```

### Correct getLoependeVedtak Shape

```tsx
preloadedApiState: {
  getLoependeVedtak: {
    harLoependeVedtak: false,
    ufoeretrygd: { grad: 0 },
  },
}
```

### Correct getErApoteker Shape

```tsx
preloadedApiState: {
  getErApoteker: false, // boolean — transformed from API response
}
```

### Correct getGrunnbeloep Shape

```tsx
preloadedApiState: {
  getGrunnbeloep: 100000, // number — extracted from response.grunnbeløp
}
```

### Correct getOmstillingsstoenadOgGjenlevende Shape

```tsx
preloadedApiState: {
  getOmstillingsstoenadOgGjenlevende: { harLoependeSak: false },
}
```

### Multiple Endpoints Together

```tsx
import {
	loependeVedtak0UfoeregradMock,
	personMock,
} from '@/mocks/mockedRTKQueryApiCalls'

render(<MyComponent />, {
	preloadedApiState: {
		getPerson: personMock,
		getLoependeVedtak: loependeVedtak0UfoeregradMock,
	},
})
```

## preloadedState — Redux State

For non-API Redux state (userInput, session slices):

```tsx
render(<MyComponent />, {
	preloadedState: {
		userInput: {
			...userInputInitialState,
			afp: 'ja_offentlig',
			samtykke: true,
			sivilstand: 'GIFT',
		},
	},
})
```

**Note:** Tests default to `session: { isLoggedIn: true, hasErApotekerError: false }` unless overridden.

## MSW Handler Overrides

### Using mockResponse / mockErrorResponse Helpers

```tsx
import { mockErrorResponse, mockResponse } from '@/mocks/server'

// mockResponse signature:
// mockResponse(path, { status?, json?, text?, method?, baseUrl? })
// Defaults: method='get', status=200, json={ data: 'ok' }

// mockErrorResponse signature:
// mockErrorResponse(path, { status?, json?, method?, baseUrl? })
// Defaults: method='get', status=500, json=''

it('håndterer API-feil', async () => {
	mockErrorResponse('/v6/person')
	render(<MyComponent />)
	expect(await screen.findByText('error.key')).toBeVisible()
})

it('håndterer 403 med reason', async () => {
	mockErrorResponse('/v6/person', {
		status: 403,
		json: { reason: 'INVALID_REPRESENTASJON' },
	})
	render(<MyComponent />)
})

it('håndterer POST-endepunkt feil', async () => {
	mockErrorResponse('/v9/alderspensjon/simulering', {
		method: 'post',
		status: 503,
	})
})

// Custom success response:
mockResponse('/oauth2/session', {
	baseUrl: 'http://localhost:8088/pensjon/kalkulator',
})
```

### Using Direct MSW server.use

```tsx
import { HttpResponse, http } from 'msw'

import { server } from '@/mocks/server'

it('håndterer tilpasset respons', async () => {
	server.use(
		http.get('http://localhost:8088/pensjon/kalkulator/api/v6/person', () => {
			return HttpResponse.json(
				{ reason: 'INSUFFICIENT_LEVEL_OF_ASSURANCE' },
				{ status: 403 }
			)
		})
	)
	render(<MyComponent />)
})
```

**Note:** The full URL in tests is `http://localhost:8088/pensjon/kalkulator/api` + path because `API_BASEURL` resolves to that in test mode. The `mockResponse`/`mockErrorResponse` helpers prepend this automatically — you only pass the path suffix (e.g., `/v6/person`).

## Loader / Guard Test Pattern

Guards use the real Redux store and MSW. They do NOT use `preloadedApiState`. Instead they either:

1. Let MSW default handlers serve mock data, or
2. Mock `store.getState()` to inject specific state, or
3. Use `fulfilledGetPerson` etc. as raw cache entries in `api.queries`.

```tsx
import { describe, expect, it, vi } from 'vitest'

import {
	fulfilledGetLoependeVedtak0Ufoeregrad,
	fulfilledGetPerson,
} from '@/mocks/mockedRTKQueryApiCalls'
import { mockErrorResponse } from '@/mocks/server'
import { paths } from '@/router/constants'
import * as apiSliceUtils from '@/state/api/apiSlice'
import { store } from '@/state/store'
import { userInputInitialState } from '@/state/userInput/userInputSlice'

import { stepStartAccessGuard } from '../loaders'

describe('stepStartAccessGuard', () => {
	afterEach(() => {
		store.dispatch(apiSliceUtils.apiSlice.util.resetApiState())
	})

	it('returnerer person og loependeVedtak', async () => {
		store.getState = vi.fn().mockImplementation(() => ({
			userInput: { ...userInputInitialState },
			session: { isLoggedIn: false, hasErApotekerError: false },
		}))

		const result = await stepStartAccessGuard()
		expect(result).toHaveProperty('person')
		if (result && 'person' in result) {
			expect(result.person?.foedselsdato).toBe('1964-04-30')
		}
	})

	it('redirecter ved API-feil', async () => {
		mockErrorResponse('/v4/vedtak/loepende-vedtak')
		store.getState = vi.fn().mockImplementation(() => ({
			session: { isLoggedIn: true, hasErApotekerError: false },
			userInput: { ...userInputInitialState },
		}))

		const result = await stepStartAccessGuard()
		expect(result).toHaveProperty('status')
		expect((result as Response).status).toBe(302)
		expect((result as Response).headers.get('location')).toBe(paths.uventetFeil)
	})
})

// directAccessGuard uses fulfilledGetPerson as raw cache entries:
it('returnerer ingenting når api kall er registrert', async () => {
	store.getState = vi.fn().mockImplementation(() => ({
		api: { queries: { ...fulfilledGetPerson } },
		userInput: { ...userInputInitialState, samtykke: null },
	}))
	const result = directAccessGuard()
	expect(result).toBeUndefined()
})
```

### fulfilledGetPerson Cache Entry Format

These are raw RTK Query cache entries keyed by `'endpointName(arg)'`. They are used for `store.getState()` mocking in guard tests, NOT for `preloadedApiState`.

```tsx
// From @/mocks/mockedRTKQueryApiCalls
export const fulfilledGetPerson = {
	['getPerson(undefined)']: {
		status: 'fulfilled',
		endpointName: 'getPerson',
		requestId: 'xTaE6mOydr5ZI75UXq4Wi',
		startedTimeStamp: 1688046411971,
		data: {
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
		fulfilledTimeStamp: 1688046412103,
	},
}
```

### Available Prefab Cache Entries

```
fulfilledGetPerson, fulfilledPre1963GetPerson,
fulfilledGetPersonMedSamboer, fulfilledGetPersonMedOekteAldersgrenser,
fulfilledGetPersonEldreEnnAfpUfoereOppsigelsesalder,
fulfilledGetPersonYngreEnnAfpUfoereOppsigelsesalder,
fulfilledGetInntekt, fulfilledGetGrunnbeloep,
fulfilledGetErApoteker, fulfilledGetEkskludertStatus,
fulfilledGetOmstillingsstoenadOgGjenlevendeUtenSak,
fulfilledGetOmstillingsstoenadOgGjenlevende,
fulfilledGetLoependeVedtak0Ufoeregrad,
fulfilledGetLoependeVedtak75Ufoeregrad,
fulfilledGetLoependeVedtak100Ufoeregrad,
fulfilledGetLoependeVedtakLoependeAlderspensjon,
fulfilledGetLoependeVedtakLoependeAlderspensjonMedSisteUtbetaling,
fulfilledGetLoependeVedtakLoepende50Alderspensjon,
fulfilledGetLoependeVedtakLoependeAlderspensjonOg40Ufoeretrygd,
fulfilledGetLoependeVedtakLoependeAFPprivat,
fulfilledGetLoependeVedtakLoependeAFPoffentlig,
fulfilledGetLoependeVedtakPre2025OffentligAfp,
fulfilledGetLoependeVedtakLoepende0Alderspensjon100Ufoeretrygd,
fulfilledGetLoependeVedtakFremtidig,
fulfilledGetLoependeVedtakFremtidigMedAlderspensjon,
fulfilledGetAfpOffentligLivsvarigFalse,
fulfilledsimulerOffentligTp,
fulfilledPensjonsavtaler,
fulfilledAlderspensjonForLiteTrygdetid
```

Also exports reusable mock objects:

```
personMock          // Person data used by fulfilledGetPerson
loependeVedtak0UfoeregradMock  // LoependeVedtak with 0 ufoeregrad
```

## swallowErrors Pattern

Suppresses `console.error` during intentional error rendering to keep test output clean:

```tsx
import { render, screen, swallowErrors, swallowErrorsAsync } from '@/test-utils'

// Synchronous version
it('viser feilmelding', () => {
	swallowErrors(() => {
		render(<ComponentThatThrows />)
	})
	expect(screen.getByText('error.key')).toBeVisible()
})

// Async version
it('viser feilmelding async', async () => {
	await swallowErrorsAsync(async () => {
		render(<ComponentThatThrows />)
	})
	expect(await screen.findByText('error.key')).toBeVisible()
})
```

## vi.useFakeTimers Pattern

For date-dependent logic. The codebase chains `.setSystemTime()` directly:

```tsx
it('beregner alder korrekt for gitt dato', () => {
	vi.useFakeTimers().setSystemTime(new Date('2025-02-15'))

	expect(isFoedselsdatoOverAlder(foedselsdato, minsteAlder)).toBeFalsy()

	vi.useRealTimers()
})

it('returnerer korrekt alder ved slutten av måneden', () => {
	vi.useFakeTimers().setSystemTime(new Date('2025-01-04'))

	const result = getBrukerensAlderISluttenAvMaaneden(
		'1960-01-01',
		nedreAldersgrense
	)
	expect(result).toStrictEqual({ aar: 65, maaneder: 0 })

	vi.useRealTimers()
})
```

## Global Mocks (test-setup.ts)

These are set up globally before all tests — you never need to mock them yourself:

| Mock                                   | Details                                                                                                                      |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `global.scrollTo`                      | No-op `vi.fn()`                                                                                                              |
| `window.matchMedia`                    | Returns `{ matches: false }` with stub listeners                                                                             |
| `window.ResizeObserver`                | Stub with `disconnect`, `observe`, `unobserve`                                                                               |
| `document.cookie`                      | Set to `'decorator-language=nb'`                                                                                             |
| `HTMLElement.prototype.scrollIntoView` | No-op `vi.fn()`                                                                                                              |
| `window.CSS.supports`                  | Returns `false` if not present                                                                                               |
| `@navikt/nav-dekoratoren-moduler`      | Mocked: `getAnalyticsInstance` → `vi.fn()`, `onLanguageSelect` → `vi.fn()`, `setAvailableLanguages` → `vi.fn()`              |
| MSW server                             | `beforeAll: server.listen({ onUnhandledRequest: 'error' })`, `afterEach: server.resetHandlers()`, `afterAll: server.close()` |
| OAuth session                          | `beforeEach: mockResponse('/oauth2/session', { baseUrl: HOST_BASEURL })`                                                     |

**Important:** `onUnhandledRequest: 'error'` means any API call without a handler will fail the test. All endpoints have default MSW handlers returning mock data from `src/mocks/data/`.

## Render Options

```tsx
// Default: with MemoryRouter, logged in, no login flow
render(<Component />)

// Without any router wrapper
render(<Component />, { hasRouter: false })

// With login flow (uses createBrowserRouter + authenticationGuard loader)
render(<Component />, { hasLogin: true })

// Combined
render(<Component />, {
	preloadedApiState: { getPerson: personMock },
	preloadedState: { userInput: { ...userInputInitialState, afp: 'ja_privat' } },
	hasRouter: false,
})
```

## Translation Keys

Tests use mocked translations where plain keys return themselves (key-as-value). Keys containing HTML or `{chunks}` retain their original value:

```tsx
// ✅ Assert on translation key
expect(screen.getByText('stegvisning.start.title')).toBeVisible()

// ❌ Don't assert on Norwegian text
expect(screen.getByText('Beregn din pensjon')).toBeVisible()
```

## Coverage Thresholds

- Lines: 85%, Branches: 85%, Statements: 85%, Functions: 50%
- Enforced per-file in `vite.config.ts`

## File Location

Tests live in `__tests__/` folders next to source code:

```
src/components/MyComponent/
├── MyComponent.tsx
├── MyComponent.module.scss
├── index.ts
└── __tests__/
    └── MyComponent.test.tsx
```
