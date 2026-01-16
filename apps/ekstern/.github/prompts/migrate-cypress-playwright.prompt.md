---
mode: agent
---

## Task Context

Convert existing Cypress E2E tests to idiomatic Playwright tests following the established patterns in this repository.

- **Playwright config:**  
  `playwright.config.ts`
  - testDir: `playwright/e2e/pensjon/kalkulator`
  - baseURL: `http://localhost:4173`
  - webServer: `npm run preview`
  - timeouts, retries, workers supported

- **Shared helpers:**  
  `playwright/base.ts` exports:
  - `test`
  - `expect`
  - `setupInterceptions`
  - `login`
  - `fillOutStegvisning`
  - `handlePageError`
  - `loadJSONFixture`

---

## Key Files to Reference

- **Coding standards:**  
  `.github/copilot-instructions.md` (TypeScript style, imports, no semicolons, single quotes)

- **CI:**  
  `.github/workflows/check-pull-request.yaml` (Playwright sharded run, blob reporter)

- **Migration example:**  
  `playwright/e2e/pensjon/kalkulator/hovedhistorie.spec.ts` (gold standard migration showing all patterns)

- **Base setup:**  
  `playwright/base.ts` — Exports `test`, `expect`, `setupInterceptions`

- **Auth helper:**  
  `playwright/utils/auth.ts` — Exports `authenticate(page, overwrites?)`

- **Navigation helper:**  
  `playwright/utils/navigation.ts` — Exports `fillOutStegvisning(page, args)`

- **Mock helpers:**  
  `playwright/utils/mocks/*.ts` — Type-safe mock generators (`person()`, `loependeVedtak()`, etc.)

- **Preset states:**  
  `playwright/utils/presetStates.ts` — Common test scenarios

- **Coding standards:**  
  `.github/copilot-instructions.md`

---

## Migration Requirements

- Place new specs under `playwright/e2e/pensjon/kalkulator`, mirroring Cypress folder structure where sensible.
- Import from `../../../base`:
  - `test`, `expect`, `setupInterceptions`
  - Optionally: `handlePageError`, `loadJSONFixture`
- Import utilities from `../../../utils`:
  - `authenticate` from `auth.ts`
  - `fillOutStegvisning` from `navigation.ts`
  - Mock helpers from `mocks/*.ts` (e.g., `person`, `loependeVedtak`)
  - `presetStates` for common test scenarios
- Add a `beforeEach` that awaits `setupInterceptions(page, overwrites?)` when not using auto-auth
- When using auto-auth (default), setup is handled automatically

---

## Core Architecture Patterns

- Do **not** attach another `page.on('pageerror', ...)` — `setupInterceptions` already wires `handlePageError`.
- Use `await login(page)` instead of manual navigation/network waiting.
- Do not add extra `waitForResponse` for the initial five startup calls.
- Prefer robust locators:
  - **Primary selectors:** Use `getByTestId` or `getByRole` - both are acceptable and encouraged
  - **Never use:** `getByText`, `contains`, or text-based selectors
  - **Never use CSS selectors** like classes or IDs, except for specific form inputs with `name` attributes
  - `getByLabel`, `getByPlaceholder` for form inputs when appropriate
  - All assertions must use Playwright `expect` (`toBeVisible`, `toHaveText`, `toContainText`, etc.) with auto-waiting
  - **Never test text content directly** - always use test IDs or roles
  - Avoid fixed delays or `waitForTimeout`
- Network mocking must stay centralized in `setupInterceptions`.
  - For different data, pass per-spec `overwrites` (array of `RouteDefinition`) with correct HTTP method matching.
  - Do not add ad-hoc `page.route` in specs for endpoints already covered.
  - For simple tweaks, prefer `jsonResponse` in the overwrite.
  - For larger tweaks from fixtures, use:
    ```typescript
    const data = await loadJSONFixture('file.json')
    // mutate as needed, then pass as `jsonResponse: data`
    ```
- Keep endpoint versions aligned with our mocks. Do not introduce mocks we’ve removed (e.g., `enable-redirect-1963`). Don’t use the old `person v4` endpoint.
- Use helpers for state changes: prefer `fillOutStegvisning(page, args)` over raw `page.evaluate`.
- Do not import Redux action creators into specs; the helper handles dispatching safely in the browser context.
- Ensure tests are independent, deterministic, and shard-friendly.
  - Each test should start from a known state and not rely on state from previous tests
  - Tests can share `beforeEach` setup within a `describe` block
  - Tests should be runnable in any order

---

## Authentication Patterns

Follow repository TypeScript/ESLint/Prettier rules (no semicolons, single quotes, named exports).

### Pattern 1: Auto-auth (default)

```typescript
test('my test', async ({ page }) => {
  // Page is already authenticated and at /start
  await expect(page.getByTestId('stegvisning.start.title')).toBeVisible()
})
```

### Pattern 2: Disable auto-auth

```typescript
test.describe('Unauthenticated scenarios', () => {
  test.use({ autoAuth: false })

  test.beforeEach(async ({ page }) => {
    await setupInterceptions(page, [{ url: /\/oauth2\/session/, status: 401 }])
    await page.goto('/pensjon/kalkulator/')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('user can log in', async ({ page }) => {
    // Test login flow
  })
})
```

### Pattern 3: Custom data with authenticate

```typescript
test.use({ autoAuth: false })

test('test with custom user', async ({ page }) => {
  await authenticate(page, [
    await person({ foedselsdato: '1962-04-30' }),
    ...(await presetStates.medTidligsteUttaksalder(62, 10)),
  ])
  // Now at /start with custom data
})
```

---

## Mock Override Patterns

**Using type-safe mock helpers:**

```typescript
import {
  loependeVedtak,
  person,
  tidligsteUttaksalder,
} from '../../../utils/mocks'
import { presetStates } from '../../../utils/presetStates'

// Single override
await authenticate(page, [
  await person({
    sivilstand: 'GIFT',
    foedselsdato: '1963-04-30',
  }),
])

// Multiple overrides
await authenticate(page, [
  await person({ alder: { aar: 75, maaneder: 1 } }),
  await loependeVedtak({
    pre2025OffentligAfp: { fom: '2023-01-01' },
  }),
  await tidligsteUttaksalder({ aar: 67, maaneder: 0 }),
])

// Using preset combinations
await authenticate(page, [
  ...(await presetStates.brukerGift1963()),
  ...(await presetStates.medTidligsteUttaksalder(62, 10)),
])
```

**Mock helper return type:**

```typescript
// All mock helpers return RouteDefinition:
type RouteDefinition = {
  url: RegExp | string
  method?: 'GET' | 'POST'
  overrideJsonResponse?: Record<string, unknown> | unknown[]
}
```

---

## Navigation & State Management

**Using fillOutStegvisning:**

```typescript
import { fillOutStegvisning } from 'utils/navigation'

// Navigate to a specific step with state
await fillOutStegvisning(page, {
  sivilstand: 'GIFT',
  epsHarPensjon: null,
  epsHarInntektOver2G: null,
  afp: 'nei',
  samtykke: true,
  navigateTo: 'beregning',
})

// Only navigate, no state changes
await fillOutStegvisning(page, {
  navigateTo: 'samtykke',
})
```

**Never import Redux actions directly - use helpers!**

❌ Don't do this:

```typescript
import { setAfp } from '@/state/userInput/userInputReducer'

await page.evaluate(() => store.dispatch(setAfp('ja_privat')))
```

✅ Do this:

```typescript
await fillOutStegvisning(page, { afp: 'ja_privat', navigateTo: 'beregning' })
```

---

## Locator Patterns

**Selector strategy:**

1. **`getByTestId()` or `getByRole()`** - Both are primary selectors (use either based on context)
2. **`getByLabel()`, `getByPlaceholder()`** - For form inputs when appropriate
3. **`locator()` with specific attributes** - Only for form inputs with `name` attribute (e.g., `input[name="samtykke"]`)
4. **NEVER use:** `getByText()`, `contains()`, or any text-based content selectors
5. **NEVER use:** CSS classes or IDs as selectors

**Examples:**

```typescript
// Test IDs - use when element has a translation ID
await expect(page.getByTestId('stegvisning.start.title')).toBeVisible()
await page.getByTestId('stegvisning-neste-button').click()

// Test IDs with logical names - use when no translation ID exists
await page.getByTestId('afp-radio-group').click()

// Role - acceptable alternative
const button = page.getByRole('button', { name: 'Kom i gang' })
await button.click()

// Chaining locators
const link = page
  .getByTestId('start-brukere-fyllt-75-ingress')
  .getByRole('link')
await expect(link).toHaveAttribute('href', /\/planlegger-pensjon/)

// Form inputs with name attribute
const radioButton = page.locator(
  'input[type="radio"][name="samtykke"][value="ja"]'
)
await radioButton.check()
```

**Test ID Naming Convention:**

- **If testing translated content:** Use the translation ID (e.g., `stegvisning.start.title`)
- **If testing non-translated elements:** Use a logical, descriptive name (e.g., `stegvisning-neste-button`, `afp-radio-group`)
- Use dots (`.`) for hierarchical translation keys
- Use hyphens (`-`) for logical component-based names

---

## Helper Functions Pattern

**Reusable step helpers within test file:**

```typescript
test.describe('Feature', () => {
  // Helpers at top of describe block - extract when used 3+ times
  const selectSamtykkeRadio = async (
    page: Page,
    option: 'ja' | 'nei' = 'nei'
  ) => {
    await test.step(`Select samtykke option: ${option}`, async () => {
      await expect(
        page.getByTestId('stegvisning.samtykke_pensjonsavtaler.title')
      ).toBeVisible()
      const radioButton = page.locator(
        `input[type="radio"][name="samtykke"][value="${option}"]`
      )
      await radioButton.check()
      await expect(radioButton).toBeChecked()
      await waitForValidationErrorsToClear(page)
    })
  }

  const waitForValidationErrorsToClear = async (page: Page, timeout = 5000) => {
    const validationMessage = page.getByTestId('validation-error-message')
    await expect(validationMessage).toHaveCount(0, { timeout })
  }

  const clickNeste = async (page: Page, expectedUrl?: RegExp) => {
    await test.step('Click "Neste" button', async () => {
      const button = page.getByTestId('stegvisning-neste-button')
      await button.click()
      if (expectedUrl) {
        await expect(page).toHaveURL(expectedUrl, { timeout: 20000 })
      }
    })
  }

  // Tests use helpers
  test('my test', async ({ page }) => {
    await selectSamtykkeRadio(page, 'ja')
    await clickNeste(page)
  })
})
```

**Helper extraction guidelines:**

- Extract to helper function when pattern is used **3 or more times** in a test file
- Keep helpers at the top of the `test.describe()` block
- Do NOT move helpers to `playwright/utils/` unless used across multiple test files
- Wrap helper logic in `test.step()` for better reporting

---

## Assertions & Waiting

**Use Playwright's auto-waiting:**

```typescript
// Auto-waits
await expect(page.getByTestId('result')).toBeVisible()
await expect(page.getByText('Success')).toContainText('Success')
await expect(page).toHaveURL(/\/beregning$/)

// Explicit timeout when needed
await expect(page.getByTestId('loader')).toBeHidden({ timeout: 5000 })

// Avoid arbitrary waits
// ❌ Bad
await page.waitForTimeout(2000)
```

**Check for dynamic content:**

```typescript
// Wait for element to disappear
await expect(page.getByTestId('loader')).toHaveCount(0, { timeout: 5000 })

// Check if element exists without failing
const errorExists = await page
  .getByTestId('error')
  .isVisible()
  .catch(() => false)
if (errorExists) {
  // Handle error state
}
```

**Never test text content directly:**

```typescript
// ❌ Bad - testing text content
await expect(page.getByText('Welcome')).toBeVisible()
await expect(element).toContainText('Expected text')

// ✅ Good - using test IDs or roles
await expect(page.getByTestId('stegvisning.start.title')).toBeVisible()
await expect(page.getByRole('heading', { name: 'Kom i gang' })).toBeVisible()
```

---

## Network Mocking Strategy

### Default Routes

All standard endpoints are mocked by default in `playwright/base.ts`:

- Authentication endpoints
- Person data (`/api/v6/person`)
- Income (`/api/inntekt`)
- Pension agreements (`/api/v3/pensjonsavtaler`)
- Simulation (`/api/v8/alderspensjon/simulering`)
- Feature toggles
- Decorator components

### When to Override

**Always prefer type-safe mock helpers for readability and type safety:**

```typescript
// ✅ Good - Using type-safe mock helpers
await authenticate(page, [
  await person({ sivilstand: 'GIFT' }), // Changes person endpoint
  await tidligsteUttaksalder({ aar: 67, maaneder: 0 }), // Changes tidligste-uttaksalder endpoint
])

// ✅ Good - Combining mock helpers and preset states
await authenticate(page, [
  await person({ foedselsdato: '1963-04-30' }),
  ...(await presetStates.medTidligsteUttaksalder(62, 10)),
])

// ❌ Avoid - Direct JSON response overrides (not readable)
await setupInterceptions(page, [
  {
    url: /\/api\/v6\/person/,
    overrideJsonResponse: { fornavn: 'Custom', navn: 'Custom Navn', foedselsdato: '1960-01-01' },
  },
])
```

**Mock helper coverage:**

- Type-safe mock helpers should cover all or most test scenarios
- If a scenario isn't covered, consider adding a new mock helper or preset state
- Direct `overrideJsonResponse` is discouraged - prefer readable, type-safe helpers

### Available Mock Helpers

Located in `playwright/utils/mocks/`:

- `person(options)` — User data
- `loependeVedtak(options)` — Current pension decisions
- `tidligsteUttaksalder(options)` — Earliest withdrawal age
- `apoteker(options)` — Pharmacy association membership
- `inntekt(options)` — Income data
- `pensjonsavtaler(options)` — Pension agreements
- `offentligTp(options)` — Public service pension
- `ekskludert(options)` — Exclusion status
- `omstillingsstoenadOgGjenlevende(options)` — Adjustment/survivor benefits
- `alderspensjon(options)` — Old-age pension simulation
- `toggleConfig(options)` — Feature flags

---

## Common Migration Patterns

### Cypress → Playwright Cheat Sheet

| Cypress Pattern                | Playwright Equivalent                                           |
| ------------------------------ | --------------------------------------------------------------- |
| `cy.visit('/path')`            | `await page.goto('/path')`                                      |
| `cy.get('[data-testid="id"]')` | `page.getByTestId('id')` or `page.getByRole()`                  |
| `cy.contains('text')`          | `page.getByTestId()` or `page.getByRole()` **(NEVER USE TEXT)** |
| `cy.get('.class')`             | `page.getByTestId('...')` **(NEVER USE CLASSES)**               |
| `cy.get('#id')`                | `page.getByTestId('...')` **(NEVER USE CSS IDs)**               |
| `cy.get('button').click()`     | `await page.getByTestId('button-id').click()`                   |
| `.should('be.visible')`        | `await expect(element).toBeVisible()`                           |
| `.should('have.value', 'x')`   | `await expect(input).toHaveValue('x')`                          |
| `.should('have.text', 'x')`    | Use test ID instead, never test text directly                   |
| `.should('have.attr', 'href')` | `await expect(link).toHaveAttribute('href', /pattern/)`         |
| `cy.intercept(...)`            | Use type-safe mock helpers passed to `authenticate()`           |
| `cy.wait('@alias')`            | Remove (auto-waiting) or use `waitForResponse()` sparingly      |
| `cy.login()`                   | `await authenticate(page, [mockHelpers])` or rely on `autoAuth` |
| `cy.fillOutStegvisning({})`    | `await fillOutStegvisning(page, {})`                            |

---

### Handling beforeEach

**Cypress:**

```typescript
beforeEach(() => {
  cy.login()
  cy.contains('button', 'Kom i gang').click()
})
```

**Playwright (with auto-auth):**

```typescript
test.beforeEach(async ({ page }) => {
  // Already at /start, just navigate if needed
  const button = page.getByRole('button', { name: 'Kom i gang' })
  await button.click()
  await expect(page).toHaveURL(/\/sivilstand$/)
})
```

**Playwright (without auto-auth):**

```typescript
test.describe('My tests', () => {
  test.use({ autoAuth: false })

  test.beforeEach(async ({ page }) => {
    await authenticate(page, [await person({ sivilstand: 'GIFT' })])
  })

  test('...', async ({ page }) => {
    // At /start with custom data
  })
})
```

---

## Test Structure Best Practices

### Use test.step() for Complex Operations

Wrap multi-step operations in `test.step()` for better reporting and debugging:

```typescript
await test.step('Select samtykke option: nei', async () => {
  await expect(
    page.getByTestId('stegvisning.samtykke_pensjonsavtaler.title')
  ).toBeVisible()
  const radioButton = page.locator(
    'input[type="radio"][name="samtykke"][value="nei"]'
  )
  await radioButton.check()
  await expect(radioButton).toBeChecked()
})
```

### Create Helper Functions

Extract repeated patterns into helper functions at the top of your test file:

```typescript
const clickNeste = async (page: Page, expectedUrl?: RegExp) => {
  await test.step('Click "Neste" button', async () => {
    const button = page.getByTestId('stegvisning-neste-button')
    await button.click()
    if (expectedUrl) {
      await expect(page).toHaveURL(expectedUrl, { timeout: 20000 })
    }
  })
}

const waitForValidationErrorsToClear = async (page: Page, timeout = 5000) => {
  const validationMessage = page.getByText(/Du må svare/i)
  await expect(validationMessage).toHaveCount(0, { timeout })
}
```

### Use Nested test.describe() for Gherkin-Style Structure

Organize tests with nested `test.describe()` blocks that mirror user stories:

```typescript
test.describe('Som bruker som har logget inn på kalkulatoren', () => {
  test.describe('Når jeg navigerer videre fra /login til /start', () => {
    test('forventer jeg å se en startside som ønsker meg velkommen', async ({
      page,
    }) => {
      await expect(page.getByTestId('stegvisning.start.title')).toBeVisible()
    })
  })
})
```

---

## Selector Guidelines (Hovedhistorie Standard)

### Priority Order for Selectors

1. **`getByTestId`** - Primary selector for all test-specific elements

   ```typescript
   page.getByTestId('stegvisning.start.title')
   page.getByTestId('stegvisning-neste-button')
   page.getByTestId('afp-radio-group')
   ```

2. **`getByRole`** - For semantic elements with accessible names

   ```typescript
   page.getByRole('button', { name: 'Kom i gang' })
   page.getByRole('heading', { name: 'Pensjonsavtaler' })
   page.getByRole('radio', { name: /nei/i })
   ```

3. **`locator` with specific attributes** - For form inputs with names/values

   ```typescript
   page.locator('input[type="radio"][name="samtykke"][value="nei"]')
   page.locator('select[name="sivilstand"]')
   ```

4. **`getByText`/text selectors** - Last resort only
   ```typescript
   page.getByText(/Du må svare/i)
   page.locator('text=/validation|feil/i')
   ```

### Common Patterns from Hovedhistorie

**Checking radio buttons:**

```typescript
const radioButton = page.locator(
  'input[type="radio"][name="epsHarPensjon"][value="nei"]'
)
await radioButton.check()
await expect(radioButton).toBeChecked()
```

**Selecting dropdown options:**

```typescript
const sivilstandSelect = page.locator('select[name="sivilstand"]')
await sivilstandSelect.selectOption('GIFT')
await expect(sivilstandSelect).toHaveValue('GIFT')
```

**Navigating and waiting for URL:**

```typescript
await clickNeste(page, /\/pensjon\/kalkulator\/sivilstand$/)
await expect(page).toHaveURL(/\/pensjon\/kalkulator\/samtykke$/)
```

**Checking for validation errors:**

```typescript
await expect(page.getByTestId('validation-error-message')).toBeHidden({
  timeout: 5000,
})
await waitForValidationErrorsToClear(page)
```

**Finding elements within sections:**

```typescript
const forbeholdSection = page
  .getByRole('heading', { name: /Forbehold/ })
  .locator('xpath=ancestor::section')
const forbeholdLink = forbeholdSection.getByRole('link', {
  name: /Alle forbehold/,
})
```

---

## Validation & Debugging

### Running Tests

```bash
# Run all Playwright tests
npm run pw:test

# Run specific file
npx playwright test hovedhistorie

# Debug mode
npx playwright test --debug

# UI mode
npx playwright test --ui
```

### Common Issues

- **Test hangs on navigation:**
  - Check that `fillOutStegvisning` has all required state for the target step
  - Verify URL pattern in `waitForURL` is correct

- **Element not found:**
  - Use `--debug` to inspect page state
  - Check if element is in shadow DOM (use `>>` combinator)
  - Verify test-id hasn't changed in component

- **Network request not mocked:**
  - Check method matches (`GET` vs `POST`)
  - Verify URL pattern in `setupInterceptions`
  - Use browser DevTools Network tab in debug mode

- **State not persisting:**
  - Ensure `fillOutStegvisning` is awaited
  - Check Redux action is dispatched correctly in helper

---

## Migration Checklist

For each Cypress spec being migrated:

- [ ] Create `.spec.ts` file under `playwright/e2e/pensjon/kalkulator/`
- [ ] Import from `../../../base`: `test`, `expect`, `setupInterceptions`
- [ ] Import helpers: `authenticate`, `fillOutStegvisning`, mock helpers, `presetStates`
- [ ] Structure with nested `test.describe()` matching Gherkin style
- [ ] Use `test.use({ autoAuth: false })` if testing unauthenticated flows
- [ ] Replace `cy.login()` with `authenticate(page, overwrites)` or rely on auto-auth
- [ ] Replace `cy.intercept()` with **type-safe mock helpers** passed to `authenticate()` - avoid direct JSON overrides
- [ ] Replace ALL `cy.get('[data-testid="..."]')` with `page.getByTestId('...')` or `page.getByRole()`
- [ ] Replace `cy.contains()` with `page.getByTestId()` or `page.getByRole()` - **NEVER use text selectors**
- [ ] Replace ALL CSS selectors with `getByTestId` or `getByRole`
- [ ] Ensure test IDs follow naming convention (translation IDs use dots, logical names use hyphens)
- [ ] Add test IDs to components if missing (prefer test IDs over roles when possible)
- [ ] Replace `.should()` chains with `await expect(...).toBe...()`
- [ ] Replace `cy.wait('@alias')` with auto-waiting (usually remove it)
- [ ] Use `fillOutStegvisning()` for navigation with state
- [ ] Create helper functions for patterns used 3+ times in the test file
- [ ] Wrap complex steps in `test.step()` for better reporting
- [ ] Ensure no hardcoded waits (`waitForTimeout`)
- [ ] Verify test passes locally with `npm run pw:test`
- [ ] Check code follows ESLint/Prettier rules (no semicolons, single quotes)

---

## Success Criteria

- ✅ All tests pass locally and in CI
- ✅ No flaky timing issues (proper use of auto-waiting)
- ✅ Tests are independent (no shared state between tests)
- ✅ Follows patterns from `hovedhistorie.spec.ts` (the golden standard)
- ✅ Uses type-safe mock helpers exclusively (no raw JSON overrides)
- ✅ Combines mock helpers with preset states when appropriate
- ✅ **Uses `getByTestId` or `getByRole`** as primary selectors (both acceptable)
- ✅ **Never uses `getByText`, `contains`, or text-based selectors**
- ✅ **No CSS class or ID selectors** (except for specific form input `name` attributes)
- ✅ **Never tests text content directly** - always uses test IDs or roles
- ✅ Uses type-safe mock helpers, never direct JSON overrides
- ✅ Proper use of nested `test.describe()` for Gherkin-style organization
- ✅ Helper functions extracted for repeated patterns (clickNeste, waitForValidation, etc.)
- ✅ Uses `test.step()` for complex multi-step operations
- ✅ No Cypress-specific code remains

---

## Additional Resources

- Playwright documentation: https://playwright.dev
- **Gold standard example:** `playwright/e2e/pensjon/kalkulator/hovedhistorie.spec.ts`
- Mock helpers: `playwright/utils/mocks/`
- Preset states: `playwright/utils/presetStates.ts`
- Auth helper: `playwright/utils/auth.ts`
- Navigation helper: `playwright/utils/navigation.ts`
- Base setup: `playwright/base.ts`
