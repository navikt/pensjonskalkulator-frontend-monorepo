---
applyTo: '**/*.test.{ts,tsx}'
---

# Testing Standards

## Imports

```tsx
// ✅ All render/screen/userEvent from @/test-utils — NEVER from @testing-library/react
// Only renderHook comes from @testing-library/react directly
import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
	render,
	screen,
	swallowErrors,
	swallowErrorsAsync,
	userEvent,
	waitFor,
} from '@/test-utils'
```

## Rendering — `render` from `@/test-utils`

Wraps with Redux, IntlProvider (keys map to themselves), SanityContext, and MemoryRouter.

```tsx
interface ExtendedRenderOptions {
  preloadedState?: Partial<RootState>    // Redux slices: session, userInput
  preloadedApiState?: { [Key in QueryKeys]?: ... }  // RTK Query cache
  store?: AppStore                        // Custom store instance
  hasRouter?: boolean                     // default: true (MemoryRouter)
  hasLogin?: boolean                      // default: false; true = RouterProvider + authenticationGuard
}
```

### `preloadedState` — tests default to `session: { isLoggedIn: true, hasErApotekerError: false }`

```tsx
render(<Comp />, {
	preloadedState: {
		userInput: {
			afp: 'ja_offentlig', // 'ja_offentlig' | 'ja_privat' | 'nei' | 'vet_ikke'
			samtykke: true,
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

### `preloadedApiState` example — injects fulfilled RTK Query cache (typed as `QueryKeys`)

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
		getLoependeVedtak: {
			harLoependeVedtak: false,
			ufoeretrygd: { grad: 0 },
		},
	},
})
```

## User Interactions

Always call `userEvent.setup()` **before** `render`:

```tsx
const user = userEvent.setup()
render(<MyComponent />)
await user.click(screen.getByRole('button', { name: /beregn/i }))
```

## MSW Mocking

```tsx
import { mockResponse, mockErrorResponse } from '@/mocks/server'

mockResponse(path: string, options?: {  // default: GET, 200, json: { data: 'ok' }
  status?: number; json?: Record<string, unknown>; text?: string;
  method?: 'post' | 'get'; baseUrl?: string;
})
mockErrorResponse(path: string, options?: {  // default: GET, 500
  status?: number; json?: Record<string, unknown>;
  method?: 'post' | 'get'; baseUrl?: string;
})
```

```tsx
mockResponse('/v6/person', {
	json: { fornavn: 'Test', sivilstand: 'GIFT', foedselsdato: '1963-04-30' },
})
mockErrorResponse('/v6/person') // 500
mockErrorResponse('/v6/person', { status: 403 })
```

## Key Rules

### Translation keys — assert the key, not Norwegian text

```tsx
// ✅ Simple key renders as itself
expect(screen.getByText('stegvisning.start.title')).toBeInTheDocument()

// ❌ Never assert plain Norwegian text for simple keys
expect(screen.getByText('Beregn din pensjon')).toBeInTheDocument()
```

### Norwegian naming

Write all `describe`/`it` descriptions in Norwegian Bokmål.

### swallowErrors

```tsx
swallowErrors(() => {
	render(<ComponentThatThrows />)
})
await swallowErrorsAsync(async () => {
	render(<Comp />) /* await assertions */
})
```

### Fake timers

Always clean up: call `vi.useRealTimers()` after `vi.useFakeTimers()`.

## Boundaries

### ✅ Always

- Use `render` from `@/test-utils` (never from `@testing-library/react`)
- Call `userEvent.setup()` before render
- Test user-visible behavior, not implementation details
- Use `userEvent` over `fireEvent`
- Write test descriptions in Norwegian Bokmål
- Clean up fake timers with `vi.useRealTimers()`

### ⚠️ Ask First

- Adding new test utilities or helpers
- Disabling or skipping tests

### 🚫 Never

- Import `render` from `@testing-library/react`
- Test implementation details (internal state, private methods)
- Commit failing tests
- Share mutable state between tests
- Assert Norwegian text for simple translation keys (assert the key itself)
