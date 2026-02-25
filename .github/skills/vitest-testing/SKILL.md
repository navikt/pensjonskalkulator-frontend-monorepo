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

# Watch mode / UI mode
pnpm test:watch
pnpm test:ui
```

## Imports

```tsx
import { HttpResponse, http } from 'msw'
import { describe, expect, it, vi } from 'vitest'

import { fulfilledGetPerson, personMock } from '@/mocks/mockedRTKQueryApiCalls'
import { mockErrorResponse, mockResponse } from '@/mocks/server'
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

The `render()` function accepts `preloadedApiState` which calls `apiSlice.util.upsertQueryEntries`. Each key is an **endpoint name**, the value is the **response data** (not the full cache entry).

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
		getInntekt: { beloep: 521338, aar: 2021 },
		getLoependeVedtak: { harLoependeVedtak: false, ufoeretrygd: { grad: 0 } },
		getErApoteker: false,
		getGrunnbeloep: 100000,
		getOmstillingsstoenadOgGjenlevende: { harLoependeSak: false },
	},
})
```

Reusable mock objects: `personMock`, `loependeVedtak0UfoeregradMock` from `@/mocks/mockedRTKQueryApiCalls`.

## preloadedState — Redux State

For non-API Redux state (userInput, session slices):

```tsx
render(<MyComponent />, {
	preloadedState: {
		userInput: {
			...userInputInitialState,
			afp: 'ja_offentlig',
			samtykke: true,
		},
	},
})
```

Tests default to `session: { isLoggedIn: true, hasErApotekerError: false }` unless overridden.

## MSW Handler Overrides

### Using mockResponse / mockErrorResponse

```tsx
// mockResponse(path, { status?, json?, text?, method?, baseUrl? })
// mockErrorResponse(path, { status?, json?, method?, baseUrl? })

it('håndterer API-feil', async () => {
	mockErrorResponse('/v6/person')
	render(<MyComponent />)
	expect(await screen.findByText('error.key')).toBeVisible()
})

it('håndterer 403', async () => {
	mockErrorResponse('/v6/person', {
		status: 403,
		json: { reason: 'INVALID_REPRESENTASJON' },
	})
	render(<MyComponent />)
})

it('håndterer POST-feil', async () => {
	mockErrorResponse('/v9/alderspensjon/simulering', {
		method: 'post',
		status: 503,
	})
})
```

Full URL in tests: `http://localhost:8088/pensjon/kalkulator/api` + path. The helpers prepend this automatically.

### Direct MSW server.use

```tsx
import { server } from '@/mocks/server'

server.use(
	http.get('http://localhost:8088/pensjon/kalkulator/api/v6/person', () =>
		HttpResponse.json(
			{ reason: 'INSUFFICIENT_LEVEL_OF_ASSURANCE' },
			{ status: 403 }
		)
	)
)
```

## Loader / Guard Test Pattern

Guards use the real Redux store and MSW — NOT `preloadedApiState`. They mock `store.getState()` or use `fulfilledGetPerson` etc. as raw cache entries:

```tsx
import { store } from '@/state/store'

import { stepStartAccessGuard } from '../loaders'

describe('stepStartAccessGuard', () => {
	afterEach(() => {
		store.dispatch(apiSlice.util.resetApiState())
	})

	it('returnerer person og loependeVedtak', async () => {
		store.getState = vi.fn().mockImplementation(() => ({
			userInput: { ...userInputInitialState },
			session: { isLoggedIn: false, hasErApotekerError: false },
		}))
		const result = await stepStartAccessGuard()
		expect(result).toHaveProperty('person')
	})

	it('redirecter ved API-feil', async () => {
		mockErrorResponse('/v4/vedtak/loepende-vedtak')
		store.getState = vi.fn().mockImplementation(() => ({
			session: { isLoggedIn: true, hasErApotekerError: false },
			userInput: { ...userInputInitialState },
		}))
		const result = await stepStartAccessGuard()
		expect((result as Response).headers.get('location')).toBe(paths.uventetFeil)
	})
})
```

Raw cache entries (keyed `'endpointName(undefined)'`) are for `store.getState()` mocking only. See `@/mocks/mockedRTKQueryApiCalls` for the full list of `fulfilledGet*` exports.

## swallowErrors Pattern

```tsx
swallowErrors(() => {
	render(<ComponentThatThrows />)
})
await swallowErrorsAsync(async () => {
	render(<ComponentThatThrows />)
})
```

## vi.useFakeTimers Pattern

```tsx
it('beregner alder korrekt', () => {
	vi.useFakeTimers().setSystemTime(new Date('2025-02-15'))
	expect(isFoedselsdatoOverAlder(foedselsdato, minsteAlder)).toBeFalsy()
	vi.useRealTimers()
})
```

## Global Mocks (test-setup.ts)

| Mock                                   | Details                                                                     |
| -------------------------------------- | --------------------------------------------------------------------------- |
| `global.scrollTo`                      | No-op `vi.fn()`                                                             |
| `window.matchMedia`                    | Returns `{ matches: false }` with stub listeners                            |
| `window.ResizeObserver`                | Stub with `disconnect`, `observe`, `unobserve`                              |
| `document.cookie`                      | `'decorator-language=nb'`                                                   |
| `HTMLElement.prototype.scrollIntoView` | No-op `vi.fn()`                                                             |
| `@navikt/nav-dekoratoren-moduler`      | Mocked: `getAnalyticsInstance`, `onLanguageSelect`, `setAvailableLanguages` |
| MSW server                             | `beforeAll: listen`, `afterEach: resetHandlers`, `afterAll: close`          |

**Important:** `onUnhandledRequest: 'error'` — any API call without a handler fails the test.

## Render Options

```tsx
render(<C />)                                    // Default: MemoryRouter, logged in
render(<C />, { hasRouter: false })              // No router wrapper
render(<C />, { hasLogin: true })                // With login flow (createBrowserRouter + authenticationGuard)
render(<C />, { preloadedApiState: { ... }, preloadedState: { ... } })
```

## Translation Keys

Tests use mocked translations where keys return themselves:

```tsx
// ✅ Assert on key
expect(screen.getByText('stegvisning.start.title')).toBeVisible()
// ❌ Don't assert on Norwegian text
```

## Coverage & File Location

- Thresholds: Lines 85%, Branches 85%, Statements 85%, Functions 50% (per-file)
- Tests in `__tests__/` folders next to source code
