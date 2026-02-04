# Pensjonskalkulator-frontend: Full Repository Guide

This document walks through the entire codebase: entrypoints, routing, state, API bindings, utilities, components, tests, Sanity studio, build tooling, server, and supporting scripts.

## Structure At A Glance

- `src/` React app (two entrypoints: borger and veileder), Redux store, RTK Query API layer, routing, translations, utilities, styling, and tests.
- `server/` Node/Express edge server that authenticates, proxies to backend, and serves static assets.
- `sanity/` Sanity Studio schemas, plugins, and desk structure for CMS-backed content.
- `scripts/` Helper scripts (land list fetch, Sanity data fetch, custom PostCSS loader).
- `public/`, `static/`, `veileder/`, `index.html` built assets and shells.
- E2E: `playwright/`. Unit/integration tests live next to code under `__tests__`.

## Entrypoints & Bootstrapping

- `src/main.tsx`: Borger app bootstrap. Sets up MSW in dev, applies Google Translate workaround, initializes Grafana Faro logging, wraps the app with Redux Provider, `LanguageProvider` (intl + Sanity data), and React Router (`routes` with `BASE_PATH`). Exposes store/router for Playwright.
- `src/main-veileder.tsx`: Veileder-specific bootstrap. Uses same providers but renders `VeilederInput` page. MSW can be disabled via `window.__DISABLE_MSW__`.
- `index.html` / `veileder/index.html`: HTML shells. Borger shell loads NAV decorator/representasjon banner after MSW ready in dev; veileder shell is slim.
- `src/faro.ts` + `src/nais.js`: Grafana Faro instrumentation configuration (paused on localhost; collects to `telemetryCollectorURL`).

## Routing

- `src/router/constants.ts`: `BASE_PATH` `/pensjon/kalkulator`, external URLs, path constants, step sequences.
- `src/router/routes.tsx`: Route tree composed under `PageFramework`. Guards handle auth and flow constraints; error boundary (`RouteErrorBoundary`) wraps routes; custom 404 and unexpected error pages.
- `src/router/loaders.tsx`: Guard/loader logic:
  - `authenticationGuard` checks `/oauth2/session` and sets session state.
  - `directAccessGuard` blocks deep-links when required data missing.
  - Step-specific guards fetch person/vedtak/feature toggles, redirect based on eligibility (AFP, uføregrad, apoteker, kap19, endring), perform Umami logging, and compute skip logic via `skip` helper.
  - `beregningEnkelAccessGuard` funnels kap19 or løpende alderspensjon to advanced view.
- Tests: `src/router/__tests__` cover routing tables and loader redirects. Error pages covered under `RouteErrorBoundary/__tests__`.

## State Management

- `src/state/store.ts`: Redux Toolkit store with RTK Query, session slice, userInput slice, listener middleware; exports typed hooks.
- `src/state/session/sessionSlice.ts`: `isLoggedIn`, `hasErApotekerError` flags; setters and selectors.
- `src/state/userInput/userInputSlice.ts`: Central user input state (veileder fnr/encrypted fnr, utenlandsperioder CRUD, samtykker, AFP radio/valg, sivilstand, EPS flags, advanced simulation mutable state, xAxis). Reducers handle formatting (`formatInntekt`) and clearing.
- `src/state/userInput/selectors.ts`: Derived selectors (foedselsdato, grunnbeløp, sivilstand w/ fallback to vedtak, income prioritization, løpende vedtak, endring detection, kap19 AFP flag, etc.) using RTK Query cached responses.
- `src/state/api/apiSlice.ts`: RTK Query endpoints:
  - Fetchers: `getPerson`, `getGrunnbeloep`, `getErApoteker`, `getInntekt`, `getLoependeVedtak`, `getOmstillingsstoenadOgGjenlevende`, feature toggles, `getAnsattId`.
  - Simulations: `offentligTp`, `getAfpOffentligLivsvarig`, `tidligstMuligHeltUttak`, `pensjonsavtaler`, `alderspensjon`.
  - Headers inject encrypted fnr for veileder flows.
  - Transformations add keys to pensjonsavtaler and normalize grunnbeløp.
- `src/state/api/utils.ts`: Request-body builders (tidligst uttak, alderspensjon advanced/simple, pensjonsavtaler, offentlig TP) and simuleringstype resolver using vedtak/AFP/uføregrad. Includes `transformUtenlandsperioderArray`.
- `src/state/api/typeguards.ts`: Robust runtime validators for API responses (inntekt, pensjonsberegning arrays, hvilke objekter for AFP/alderspensjon/TP, toggles, apoteker status, etc.), enum guards, anchor tag detector.
- Tests: `src/state/__tests__` (store), `api/__tests__` for utils, typeguards, apiSlice; userInput selectors/reducer tests.

## Internationalization & Sanity Content

- `src/context/LanguageProvider`: React Intl + NAV decorator language bridge. Loads Aksel locales, handles cookies (`decorator-language`), fetches Sanity ReadMore/GuidePanel/Forbehold data with timeout fallback to error route, supports disabling language switch via Unleash toggle.
- `src/context/SanityContext`: Provides fetched Sanity data and loading state to components.
- `src/utils/translations.tsx`: Maps React Intl rich-text tags to components (external links via `ExternalLink`).
- Translations files: `src/translations/{nb,nn,en}.ts` plus tests for translation helpers.
- Sanity client helpers: `src/utils/sanity.tsx` sets dataset (dev/prod) and PortableText renderers with NAV design system components, external-link logging.
- Sanity studio:
  - Schemas: `sanity/schemaTypes` define documents for `forbeholdAvsnitt`, `guidepanel`, `readmore`, tags, and localized string type.
  - Common fields, tag references, preview components (tagged document preview), desk structure grouping tags and tagged documents.
  - Plugins: audit timeline, document ID lock (5-minute editable window), document internationalization, color input, vision, custom structure. Configured in `sanity.config.ts`; CLI config in `sanity.cli.ts`.
- Scripts: `scripts/FetchSanityData.js` pulls prod Sanity content into `src/playwright` and `src/mocks` JSON fixtures.

## Utilities

- Date/age: `utils/alder.ts` (age calculations, format/unformat uttaksalder, bounds checks, 75+ rules, overgangskull detection).
- Income: `utils/inntekt.ts` (format/validate/update caret), decimal formatting.
- Navigation: `utils/navigation.ts` skip helper for step flow.
- Logging: `utils/logging.ts`, `loggerConstants.ts` wrap NAV decorator analytics; `logOpenLink`, `wrapLogger`.
- Event helpers: `utils/events.ts` add/remove listeners with self-destruct/cleanup.
- Sanity/PortableText renderer: `utils/sanity.tsx`.
- Misc: `string.ts` capitalize, `dates.ts` validation/format constants, `radio.ts` converters, `pensjonsavtaler.ts` category map, `uttaksgrad.ts` constants, `viewport.ts` + `useIsMobile` hook, `googleTranslateWorkaround.js` DOM patch for translation extensions, `land.ts` lookups against `assets/land-liste.json`, `sivilstand.ts` helpers/formatters, `afp.ts` formatting, `loependeVedtak.ts` endring detector, `events.ts`.
- Tests reside in `utils/__tests__` for each helper and hook.

## Components (Highlights)

The component tree is large; key groups:

- `components/common/`: Reusable UI wrappers (Alert, ExpansionCard with logging, Card, Divider, AccordionItem, Loader, ShowMore, ReadMore, SanityReadmore, SanityGuidePanel, PageFramework layout + login focus check, ExternalLink, TelefonLink, AgePicker, ApotekereWarning, SanityReadmore/GuidePanel, Navigation wrappers).
- `components/stegvisning/`: Flow UI for steps (Start variants, Sivilstand, Utenlandsopphold, AFP variants, Ufør, Samtykke steps, Navigation hooks/utils). Hooks emit analytics and manage next/back per `stegvisningOrder`.
- `components/Grunnlag*`, `InfoOm*`, `GrunnlagItem`, `GrunnlagForbehold`: Display fetched basis data and warnings.
- Simulation: `components/Simulering/*` charts (Highcharts helpers), income cards, alerts, graf navigation, pensjonsavtaler alert, advanced monthly amounts, beregningsdetaljer with AFP/alderspensjon details, simuleringsdetaljer. Utilities in `Simulering/utils(.ts|highcharts)`; tests include snapshots.
- Forms: `EndreInntekt`, `VelgUttaksalder` (with helpers/tests), `AvansertSkjema` variants (kap19 AFP, gradert uføretrygd, andre brukere) plus hooks/utils and form button rows.
- `Pensjonsavtaler` module: Private/offentlig TP lists, utils, mobile/desktop variants, tests.
- `UtenlandsoppholdModal` + list components with hooks/utils.
- Misc sections: `LightBlueFooter`, `Signals` (feature flag banners), `SavnerDuNoe`, `TidligstMuligUttaksalder`, `VilkaarsproevingAlert`, `TabellVisning` (data table with hooks/utils/tests), `RedigerAvansertBeregning`, `SimuleringEndringBanner`.
- Each major component folder contains SCSS module, index re-export, and granular tests in `__tests__`.

## Pages

- Step flow: `StepStart`, `StepSivilstand`, `StepUtenlandsopphold`, `StepAFP`, `StepUfoeretrygdAFP`, `StepSamtykkeOffentligAFP`, `StepSamtykkePensjonsavtaler`.
- Result/summary: `Beregning` (tabs for `BeregningEnkel`/`BeregningAvansert`, context provider, modal handling for unsaved advanced state, navigation to tabs, analytics).
- Info/error: `Forbehold` (Sanity-based), `IngenTilgang`, `ErrorSecurityLevel`, `StepFeil`, `StepKalkulatorVirkerIkke`.
- Landing: `LandingPage` with logged-in/anonymous flows to calculator or external links.
- Veileder: `VeilederInput` flow with request error handling.
- Each page has aligned tests under `__tests__`.

## Styling

- Global styles: `src/scss/global.scss`, `designsystem.scss` imports NAV DS tokens; CSS modules per component. Shared module fragments under `src/scss/modules`.
- Custom PostCSS loader (`scripts/CustomPostCSSLoader.js`) processes SCSS for CSS modules compose support (Vite workaround).

## Testing & Mocks

- Unit/integration: Vitest + Testing Library. Setup in `src/test-setup.ts` (MSW server, decorator mocks, DOM polyfills, cookies, CSS.supports).
- Render helpers: `src/test-utils.tsx` renders with providers, intl, Sanity context, preloaded RTK Query data; exports `render` alias.
- MSW: `src/mocks/handlers.ts` covers all API endpoints with fixture JSON; `src/mocks/server.ts` for node, `src/mocks/browser.ts` for browser. Fixtures under `src/mocks/data`, mirroring backend responses for various ages/AFP combos.
- Additional mock states for RTK Query in `mocks/mockedRTKQueryApiCalls.ts`.
- Coverage output lives in `/coverage`.

## Node Server

- `server/server.ts`: Express server with Prometheus metrics, Unleash feature toggles, correlation ID middleware, health endpoints, status endpoint passthrough, decorator assets, static asset serving, TokenX/Azure OBO auth handling, proxy to backend `/api` and `/v3/api-docs`, redirect to detaljert kalkulator, g-regulering gate, veileder vs borger entry routing. Uses oasis helpers (`getToken`, `validateToken`, `requestOboToken`, `parseAzureUserToken`).
- `server/ensureEnv.ts`: Ensures required env vars exist at startup.
- Build script: `pnpm build:server` (`tsconfig.server.json`).

## Build & Tooling

- Vite config (`vite.config.ts`): Two HTML entrypoints, manual vendor chunks, eslint/stylelint/sassDts plugins, visualizer output (`analice.html`), dev proxy to server, custom MSW SW header middleware, test config with coverage thresholds.
- TypeScript configs: root, node, server, sanity variants.
- Lint/format: ESLint (with import/react/sonar), Prettier (with sort-imports plugin), Stylelint SCSS.
- Git hooks via Husky/Lint-Staged.
- Scripts: `fetch-land-liste` (writes `src/assets/land-liste.json`), `fetch-sanity-data` (writes fixtures), `fetch-dev-types` (openapi-typescript -> `src/types/schema.d.ts`, then prettier/eslint).

## Types

- Generated OpenAPI Types: `src/types/schema.d.ts` (Do not hand-edit).
- Sanity types: `src/types/sanity.types.ts`.
- Global/declaration helpers: `src/types/global.d.ts`, `types.d.ts`, `common-types.ts`, testing library typings.

## Paths & Environment

- `src/paths.ts` builds API/HOST base URLs using Vite `BASE_URL`; `getHost` adds test host.
- Env vars: `VITE_DECORATOR_URL`, `VITE_BYTT_BRUKER_URL`, `VITE_REPRESENTASJON_BANNER` used in templates and loaders; server expects OAuth/provider settings plus backend URL and Unleash settings.

## Pages & Component Testing Notes

- Each page/component’s `__tests__` focus on conditional rendering, navigation callbacks, analytics events, validation, and guards. Simulation components include snapshot tests for chart configuration. Step components validate skip behavior and triggers for modal dialogs/back navigation.

## Running Locally

- Dev: `pnpm start` (Vite dev server), `pnpm start:q2` (veileder proxy/Node watcher).
- Build: `pnpm build` (staging mode) / `build:production`.
- Tests: `pnpm test` (Vitest), `cy:test` / `pw:test` for E2E.
- Type/lint/format: `pnpm typecheck | eslint:check | stylelint:check | prettier:check`.

## Data & Fixtures

- Assets: `src/assets/land-liste.json`, SVG icons.
- Mocks: comprehensive JSON scenarios for AFP/private/public, pensjonsavtaler, alderspensjon per uttaksalder, unleash toggles, Sanity content, person data, incomes, vedtak flags.

## What Lives Where (Quick Map)

- Entrypoints: `src/main.tsx`, `src/main-veileder.tsx`, `index.html`, `veileder/index.html`.
- Routing: `src/router/*`.
- State: `src/state/*`.
- Contexts: `src/context/LanguageProvider`, `src/context/SanityContext`.
- Utilities: `src/utils/*`.
- Components: `src/components/**/*` (with SCSS + tests).
- Pages: `src/pages/**/*`.
- Mocks & tests: `src/mocks/*`, `src/**/__tests__`.
- Server: `server/server.ts`, `server/ensureEnv.ts`.
- Sanity: `sanity/*`, `sanity.config.ts`, `sanity.cli.ts`.
- Scripts/tooling: `scripts/*`, `vite.config.ts`, lint/prettier configs.

This overview should help you navigate every file and understand how the frontend, server, CMS, utilities, and tests fit together.

## Deeper Flows & Relationships

### User Journeys (Borger)

1. **App bootstrap**: `main.tsx` adds the Google Translate DOM patch, initializes Faro, spins up MSW in dev, and renders `RouterProvider` with `BASE_PATH` so all routes live under `/pensjon/kalkulator`.
2. **Auth check**: `authenticationGuard` (runs on route group) calls `/oauth2/session`; `sessionSlice` stores `isLoggedIn`.
3. **Landing page**: `LandingPage` reads `isLoggedIn` to choose between redirect-to-login (builds `HOST_BASEURL/oauth2/login?redirect=...`) or going straight to `/start`. It also offers the unauthenticated calculator link.
4. **Step flow orchestration**:
   - `loaders.tsx` fetches data before each step; `directAccessGuard` blocks deep-links unless the store already has RTK Query results.
   - `getStepArrays` (from `components/stegvisning/utils`) chooses the step order based on endringssøknad (`isLoependeVedtakEndring`), kap19 (born before 1963), and apoteker status. `skip` helper decides forward/back redirect using the `back` query param.
   - `stepStartAccessGuard`: fetches multiple endpoints in parallel (person, løpende vedtak, vedlikeholdsmodus toggle, apoteker, income, omstillingsstønad, grunnbeløp). Handles 403 reasons (`INVALID_REPRESENTASJON`, `INSUFFICIENT_LEVEL_OF_ASSURANCE`) by redirecting to dedicated pages; redirect to maintenance or unexpected error; logs diagnostic info. Supplies `{ person, loependeVedtak }` to `StepStart`.
   - `stepSivilstandAccessGuard`/`stepUtenlandsoppholdAccessGuard`: fetch person + løpende vedtak (+ grunnbeløp for sivilstand) then skip steps for endringssøknad in kap19/apoteker cases.
   - `stepAFPAccessGuard`: prefetches income + omstillingsstønad, evaluates vedtak+uføregrad+apoteker to hide AFP step when not relevant; can skip for gradert uføre over cutoff or pre2025 offentlig AFP with future alderspensjon.
   - `stepUfoeretrygdAFPAccessGuard`: shows only when user answered AFP `ja/vet_ikke` and has uføregrad.
   - `stepSamtykkeOffentligAFPAccessGuard` and `stepSamtykkePensjonsavtaler`: gate based on AFP answer and kap19/apoteker/endring rules.
   - `beregningEnkelAccessGuard`: redirects to advanced view if kap19 AFP or løpende alderspensjon exists.
5. **Page components consume loader data + store**: Steps dispatch to `userInputSlice` (e.g., `setSivilstand`, `setHarUtenlandsopphold`, `setAfp`, samtykker). Navigation buttons use `useStegvisningNavigation` to call `onStegvisningNext/Previous/Cancel`, respecting skip logic.
6. **Beregning (results)**:
   - `Beregning.tsx` hosts tabs for simple (`BeregningEnkel`) vs advanced (`BeregningAvansert`) views with a shared `BeregningContext` for advanced form state. It tracks unsaved changes and intercepts browser back (`popstate`) to show a confirmation modal before leaving advanced mode.
   - Switching tabs resets advanced simulation state (`flushCurrentSimulation`) and uses `navigate` to `/beregning` vs `/beregning-detaljert`.
   - Advanced forms build request payloads via `generateAlderspensjonRequestBody` / `generatePensjonsavtalerRequestBody` using selectors for sivilstand, income (user override vs skatt), AFP choices, utenlandsperioder, and vedtak.
   - Simple view uses `generateAlderspensjonEnkelRequestBody` with selected uttaksalder. Results components render tables/charts from RTK Query responses.

### Veileder Journey

- Entry: `main-veileder.tsx` + `veileder/index.html` mount `VeilederInput` at `BASE_PATH/veileder`.
- `VeilederInput` flow:
  - Fetches `getAnsattId` for header display.
  - Allows entering a borger fnr; posts to `/v1/encrypt` (API_BASEURL) to get encrypted fnr, stores both via `setVeilederBorgerFnr`, invalidates `getPerson` cache.
  - When encrypted fnr is set, `getPerson` query runs with the header `fnr` (set in `apiSlice.prepareHeaders`) to fetch user data.
  - Auto-timeout after 1h (query param `?timeout` shows warning on refresh).
  - Once person is resolved, renders the full router under `/veileder/*` with the same step logic as borger. `BorgerInformasjon` shows active fnr.

### Data & API Interactions

- Shared RTK Query cache powers both loaders and components; selectors pull data (`selectPersonResponse`, `selectLoependeVedtakResponse`, etc.) and derive booleans for UI branching (kap19, apoteker, endring).
- Request builders ensure numeric formatting (`formatInntektToNumber`), date formatting (`DATE_BACKEND_FORMAT`), and optional fields trimming. AFP simuleringstype derives from vedtak + user answers.
- Feature toggles: fetched via RTK Query (`getSpraakvelgerFeatureToggle`, `getUtvidetSimuleringsresultatFeatureToggle`, `getVedlikeholdsmodusFeatureToggle`) and consumed in LanguageProvider and StepStart guard. Server also checks Unleash `g-regulering` to hard-redirect.

### Content & Language Flow

- Language selection flows from NAV decorator (`onLanguageSelect`) to cookie and React Intl locale; LanguageProvider fetches Sanity documents per locale with a 10s timeout — if any dataset is empty or times out, user is redirected to `uventet-feil?sanity-timeout=1`.
- Sanity data (ReadMore, GuidePanel, Forbehold) is exposed via `SanityContext` and consumed by components like `SanityReadmore`, `SanityGuidePanel`, `Forbehold`, and page footers/sections.
- PortableText link rendering routes clicks through `logOpenLink` to emit analytics before opening.

### Analytics & Logging

- `logger` (NAV decorator analytics) is imported across components; `wrapLogger` decorates handlers and sends legacy + current event names. Constants in `loggerConstants.ts` avoid duplicate strings.
- Route loaders log info about feature toggles and vedtak states (Umami/analytics).
- External link clicks are intercepted to log before navigation.

### Testing & Mocks Flow

- MSW handlers match API paths using `API_BASEURL`/`HOST_BASEURL`, covering happy and error paths (403 reasons for access control, simulated income/pensjon/AFP per uttaksalder). Snapshot and logic tests rely on these fixtures.
- `test-utils.tsx` hydrates Sanity context from mock JSON, sets logged-in session by default, and can preload RTK Query data. Tests for loaders reroute using MemoryRouter or `RouterProvider` as needed.

### Server ↔ Frontend Interaction

- Frontend dev server proxies `/pensjon/kalkulator/api` to the Node server; Node server performs OBO token exchange to backend, injects Authorization, and proxies OpenAPI docs.
- Static serving: Node serves built assets and `appVeileder` entry from `/veileder/*` when Azure auth is used; redirects accordingly based on provider (idporten vs azure).
- Correlation IDs are added to all requests; metrics via `express-prom-bundle`. Feature toggle endpoint exposed unauthenticated for the frontend to poll.

### State ↔ API ↔ UI Loop

- Headers for RTK Query calls are derived from Redux state: `apiSlice.prepareHeaders` injects the encrypted fnr so veileder requests are scoped to the selected borger; `userInput` reducers are the only place that can update those values.
- Derived selectors layer RTK Query responses (`getPerson`, `getLoependeVedtak`, `getInntekt`) with user choices to build request bodies in `state/api/utils.ts`; those payloads power `Beregning{Enkel,Avansert}` and pensjonsavtaler/TP simulations.
- `keepUnusedDataFor: 3600` keeps fetched data hot across route transitions so loaders and components share cache instead of rerequesting; `directAccessGuard` relies on that cache existing to allow deep links.
- `flush`/`flushCurrentSimulation` in `userInputSlice` reset only the parts of state needed when switching tabs or starting a new session, preventing stale advanced-form values from leaking into simple results.
- `xAxis` in `userInputSlice` is written by chart helpers and reused when switching tabs so chart state stays aligned with the current simulation response.

### Guards, Navigation, and Flow Dependencies

- `getStepArrays` combines `stegvisningOrder{,Kap19,Endring}` (router constants) with `skip` logic so the same navigation hooks work for kap19, endringssøknad, and apoteker cases; changing step order requires updating both constants and related tests under `components/stegvisning/__tests__`.
- `directAccessGuard` blocks routes when the RTK Query cache is empty (no prior loader run). Playwright sets up the store before routing so deep-link tests pass.
- Query param `back` is respected by `skip` to decide whether to move backward when a guard skips a step, keeping browser back/forward consistent with step skipping.
- `RouteErrorBoundary` wraps every route and renders dedicated 404/500 pages; loaders log via `logger` before redirecting so analytics captures failure reasons.

### Runtime, Auth, and Hosting Links

- Router `BASE_PATH` is shared by Vite config, service worker URL for MSW, and Express’ static serving paths. Any base-path change requires touching `router/constants.ts`, `vite.config.ts`, `index.html`, and `veileder/index.html`.
- Auth differences: idporten serves `index.html` for all routes and uses TokenX OBO; Azure serves `veileder/index.html` and redirects borger routes to `/veileder`. Server-side `addCorrelationId` prepends a UUID before proxying.
- Unleash is consumed both client-side (RTK Query feature endpoints) and server-side (`g-regulering` redirect, maintenance toggle). Keep toggle names in sync across `apiSlice` handlers, `server/server.ts`, and tests/mocks.

### Change Guide (what to touch together)

- **New step or flow change**: update `router/constants.ts` (paths + step arrays), add loader/guard logic in `router/loaders.tsx`, add page under `pages/`, wire navigation in `components/stegvisning`, and extend MSW fixtures + tests.
- **New backend endpoint**: regenerate types (`npm run fetch-dev-types`), add RTK Query endpoint in `state/api/apiSlice.ts` with typeguards/transformations, extend request builders in `state/api/utils.ts`, add mocks in `src/mocks/handlers.ts` + fixtures, and cover with Vitest + MSW tests.
- **Sanity schema/content change**: update `sanity/schemaTypes/*`, regenerate Sanity types (`sanity-typegen`), adjust LanguageProvider queries if needed, add fixtures used by tests (`scripts/FetchSanityData.js`), and extend translations for nb/nn/en.
- **Analytics**: add event names to `utils/loggerConstants.ts` (and optionally `logging.ts` helpers), and ensure components wrap handlers with `wrapLogger` to emit both legacy and new events.
- **Veileder auth flow**: when changing fnr handling, keep `setVeilederBorgerFnr` and `apiSlice.prepareHeaders` aligned; ensure encrypted fnr passes to the backend and invalidate `getPerson` tags when switching user.
