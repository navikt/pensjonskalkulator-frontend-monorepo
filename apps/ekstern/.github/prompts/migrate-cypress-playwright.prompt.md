---
mode: agent
---

Task: Convert existing Cypress E2E tests to idiomatic Playwright tests for this repository.

Context inputs the agent must honor

- Playwright config: `playwright.config.ts` (testDir `playwright/e2e/pensjon/kalkulator`, baseURL `http://localhost:4173`, webServer `npm run preview`, timeouts, retries, workers)
- Shared helpers: `playwright/base.ts` exports `test`, `expect`, `setupInterceptions`, `login`, `fillOutStegvisning`, `handlePageError`, `loadJSONFixture`
- Coding standards: `.github/copilot-instructions.md` (TypeScript style, imports, no semicolons, single quotes)
- CI: `.github/workflows/check-pull-request.yaml` (Playwright sharded run, blob reporter)

Requirements

- Place new specs under `playwright/e2e/pensjon/kalkulator` mirroring Cypress folder structure where sensible
- Import from `../../../base`:
  - `test`, `expect`, `setupInterceptions`, `login`, `fillOutStegvisning`, and optionally `handlePageError`, `loadJSONFixture`
- Add a `beforeEach` that:
  - awaits `setupInterceptions(page, overwrites?)`
  - Do NOT attach another `page.on('pageerror', ...)` — `setupInterceptions` already wires `handlePageError`
- Use `await login(page)` instead of manual navigation and network waiting
  - Do not add extra `waitForResponse` for the initial five startup calls
- Prefer robust locators:
  - `getByRole`, `getByTestId`, `getByLabel`, `getByPlaceholder`; use `locator('text=…')` only as fallback
- Assertions must use Playwright `expect` (`toBeVisible`, `toHaveText`, etc.) with auto-waiting. Avoid fixed delays or `waitForTimeout`.
- Network mocking must stay centralized in `setupInterceptions`. For different data, pass per-spec `overwrites` (array of `RouteDefinition`) with correct HTTP method matching. Do not add ad-hoc `page.route` in specs for endpoints already covered.
  - For simple tweaks, prefer `jsonResponse` in the overwrite
  - For larger tweaks starting from existing fixtures, use `const data = await loadJSONFixture('file.json')` and mutate as needed, then pass as `jsonResponse: data`
- Keep endpoint versions aligned with our mocks:
  - `GET /pensjon/kalkulator/api/v5/person`
  - `GET /pensjon/kalkulator/api/v2/ekskludert`
  - `GET /pensjon/kalkulator/api/inntekt`
  - `GET /pensjon/kalkulator/api/v1/loepende-omstillingsstoenad-eller-gjenlevendeytelse`
  - `GET /pensjon/kalkulator/api/v4/vedtak/loepende-vedtak`
  - `POST /pensjon/kalkulator/api/v2/simuler-oftp`
  - `POST /pensjon/kalkulator/api/v2/tidligste-hel-uttaksalder`
  - `POST /pensjon/kalkulator/api/v3/pensjonsavtaler`
  - `POST /pensjon/kalkulator/api/v8/alderspensjon/simulering`
  - `GET https://g.nav.no/api/v1/grunnbeløp`
  - `GET https?://api.uxsignals.com/v2/study/id/*/active`
- Do not introduce mocks we’ve removed (e.g., `enable-redirect-1963`) and don’t use the old `person v4` endpoint.
- Use helpers for state changes: prefer `fillOutStegvisning(page, args)` over raw `page.evaluate`.
  - Do not import Redux action creators into specs; the helper handles dispatching safely in the browser context.
- Ensure tests are independent, deterministic, and shard-friendly.
- Follow repository TypeScript/ESLint/Prettier rules (no semicolons, single quotes, named exports).

Constraints

- Do not modify production source code while migrating tests.
- Avoid adding global Playwright configuration changes unless necessary; prefer per-spec usage of provided helpers.
- Keep mocks method-aware; if adding per-spec `overwrites`, set `method` correctly or they won’t match.
- Do not add error handlers in specs beyond using `setupInterceptions` (it already attaches `handlePageError`).

Success criteria

- Converted Playwright specs pass locally with `npm run pw:test`.
- CI job `run-integration-tests-playwright` passes across all shards and uploads blob reports.
- No flaky timing (no arbitrary sleeps); tests rely on Playwright auto-waiting and assertions.
- Specs use centralized `setupInterceptions`; any deviations are justified via `overwrites`.
- Selectors are resilient (role/test-id preferred) and avoid brittle text/CSS where possible.
- All references to legacy Cypress-specific patterns (cy.\*, intercept aliases, should-chaining) are removed or replaced with Playwright idioms.

Deliverables

- One Playwright `.spec.ts` file per migrated Cypress spec, placed under `playwright/e2e/pensjon/kalkulator`.
- If a spec requires different network data, include an `overwrites` example within its `beforeEach` using the `RouteDefinition` shape.
- Remove or deprecate the Cypress spec counterparts as appropriate (out of scope for this agent unless explicitly asked).

Migration checklist per spec

- [ ] File created at correct path with Playwright imports from `../../../base`
- [ ] `beforeEach` calls `setupInterceptions(page, overwrites?)` (no extra pageerror handler)
- [ ] Uses `login(page)` and/or `fillOutStegvisning`
- [ ] Uses robust locators and Playwright `expect`
- [ ] No redundant waits; no manual intercepts for covered routes
- [ ] Per-spec overwrites (if any) are method-aware and minimal
- [ ] Runs locally and green in CI

Troubleshooting (local)

- If you see Vite proxy errors to outdated endpoints (e.g., `/pensjon/kalkulator/api/v4/person`) when running `npm run pw:test`, build the app once with `npm run build` so `vite preview` serves an up-to-date bundle.
