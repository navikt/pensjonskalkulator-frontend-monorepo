# Copilot Instructions

## Project Overview

Norwegian pension calculator ("pensjonskalkulator") frontend monorepo for NAV. pnpm workspace with two React 19 apps and shared packages.

### Workspace Structure

- `apps/ekstern` — Public-facing pension calculator (the main, mature app). Vite + TypeScript + Redux Toolkit (RTK Query) + React Router + SCSS modules. Has a Node/Express server for auth (TokenX/Azure OBO), proxying, and Unleash feature toggles.
- `apps/intern` — Internal pension calculator (early stage, minimal code). Vite + TypeScript.
- `packages/api` — Shared API utilities (currently a scaffold, used as a workspace dependency by intern).
- `packages/mocks` — Shared mock data (currently empty).

## Commands

### Root-level (pnpm monorepo)

```bash
pnpm install              # Install all dependencies
pnpm dev                  # Start intern app dev server
pnpm dev:ekstern          # Start ekstern app dev server
pnpm build                # Build all packages
pnpm build:ekstern        # Build only ekstern
pnpm build:intern         # Build only intern
pnpm test                 # Run all unit tests
pnpm lint                 # ESLint across all apps
pnpm lint:fix             # ESLint with auto-fix
pnpm typecheck            # TypeScript check all packages
pnpm format               # Prettier format all files
pnpm format:check         # Prettier check (no write)
```

### Ekstern app (`apps/ekstern`)

```bash
cd apps/ekstern
pnpm test                         # Vitest (all, with coverage, --pool=forks)
pnpm vitest run src/path/to/file.test.tsx  # Run a single test file
pnpm vitest run -t "test name"    # Run tests matching a name pattern
pnpm test:watch                   # Vitest in watch mode
pnpm test:e2e                     # Playwright E2E (chromium)
pnpm pw:open                      # Playwright UI mode
pnpm lint                         # ESLint
pnpm typecheck                    # TypeScript check (app + server)
pnpm stylelint:check              # Stylelint for SCSS/CSS
```

### Intern app (`apps/intern`)

```bash
cd apps/intern
pnpm test                 # (No tests yet — exits 0)
pnpm lint                 # ESLint
pnpm typecheck            # TypeScript check
```

## Architecture (ekstern app)

### State Management

Redux Toolkit store with 3 slices: `api` (RTK Query), `session`, `userInput`.

**RTK Query apiSlice** (`state/api/apiSlice.ts`) — 17 endpoints:

| Endpoint                                     | Method | URL                                                       | Tags              |
| -------------------------------------------- | ------ | --------------------------------------------------------- | ----------------- |
| `getInntekt`                                 | GET    | `/inntekt`                                                | —                 |
| `getPerson`                                  | GET    | `/v6/person`                                              | `Person`          |
| `getGrunnbeloep`                             | GET    | `https://g.nav.no/api/v1/grunnbeløp` (external)           | —                 |
| `getErApoteker`                              | GET    | `/v1/er-apoteker`                                         | —                 |
| `getOmstillingsstoenadOgGjenlevende`         | GET    | `/v1/loepende-omstillingsstoenad-eller-gjenlevendeytelse` | —                 |
| `getLoependeVedtak`                          | GET    | `/v4/vedtak/loepende-vedtak`                              | —                 |
| `offentligTp`                                | POST   | `/v2/simuler-oftp/fra-1963`                               | `OffentligTp`     |
| `offentligTpFoer1963`                        | POST   | `/v2/simuler-oftp/foer-1963`                              | `OffentligTp`     |
| `getAfpOffentligLivsvarig`                   | GET    | `/v2/tpo-livsvarig-offentlig-afp`                         | —                 |
| `tidligstMuligHeltUttak`                     | POST   | `/v3/tidligste-hel-uttaksalder`                           | —                 |
| `pensjonsavtaler`                            | POST   | `/v3/pensjonsavtaler`                                     | `Pensjonsavtaler` |
| `alderspensjon`                              | POST   | `/v9/alderspensjon/simulering`                            | `Alderspensjon`   |
| `getSpraakvelgerFeatureToggle`               | GET    | `/feature/pensjonskalkulator.disable-spraakvelger`        | —                 |
| `getUtvidetSimuleringsresultatFeatureToggle` | GET    | `/feature/utvidet-simuleringsresultat`                    | —                 |
| `getVedlikeholdsmodusFeatureToggle`          | GET    | `/feature/pensjonskalkulator.vedlikeholdsmodus`           | —                 |
| `getShowDownloadPdfFeatureToggle`            | GET    | `/feature/pensjonskalkulator.show-download-pdf`           | —                 |
| `getAnsattId`                                | GET    | `/v1/ansatt-id`                                           | —                 |

Config: `keepUnusedDataFor: 3600` (1 hour cache), `tagTypes: ['Person', 'OffentligTp', 'Alderspensjon', 'Pensjonsavtaler']`. `prepareHeaders` injects encrypted FNR for veileder flows.

**userInputSlice** (`state/userInput/userInputSlice.ts`) — Key actions:

- `setAfp`, `setAfpUtregningValg`, `setAfpInntektMaanedFoerUttak`
- `setSivilstand` (sets sivilstand + epsHarPensjon + epsHarInntektOver2G atomically)
- `setSamtykke`, `setSamtykkeOffentligAFP`
- `setHarUtenlandsopphold`, `setUtenlandsperiode` (upsert by id), `deleteUtenlandsperiode`, `flushUtenlandsperioder`
- `setCurrentSimulationUttaksalder`, `setCurrentSimulationAarligInntektFoerUttakBeloep`, `setCurrentSimulationGradertUttaksperiode`, `setCurrentSimulationBeregningsvalg`, `setCurrentSimulationAarligInntektVsaHelPensjon`
- `setVeilederBorgerFnr` (sets both fnr and encryptedFnr)
- `setStillingsprosentVsaPensjon`, `setStillingsprosentVsaGradertPensjon`
- `setXAxis`
- `flush` — resets ALL user input except veilederBorgerFnr/encryptedFnr
- `flushCurrentSimulation` — resets only currentSimulation

**sessionSlice**: `isLoggedIn: boolean`, `hasErApotekerError: boolean`

**Key patterns:**

- Income stored as formatted strings (`'521 338'`), converted via `formatInntektToNumber()` for API calls
- Sivilstand fallback chain: user override → vedtak sivilstand (if endring) → person API sivilstand
- Income fallback chain: user-entered amount → Skatteetaten amount (formatted)

### Routing & Step Flow

React Router with guard/loader pattern in `src/router/loaders.tsx`. Three step flows defined in `src/router/constants.ts`:

**stegvisningOrder** (default — 9 steps):
`/login → /start → /sivilstand → /utenlandsopphold → /afp → /ufoeretrygd-afp → /samtykke-offentlig-afp → /samtykke → /beregning`

**stegvisningOrderEndring** (modifying existing pension — 6 steps):
`/login → /start → /afp → /ufoeretrygd-afp → /samtykke-offentlig-afp → /beregning-detaljert`

**stegvisningOrderKap19** (born before 1963 or apoteker — 7 steps):
`/login → /start → /sivilstand → /utenlandsopphold → /afp → /samtykke → /beregning`

Guard pattern: `directAccessGuard()` → fetch data → evaluate skip → `skip(stepArrays, currentPath, request)` or return data. `directAccessGuard` redirects to `/start` if Redux store has no API queries (prevents deep-linking). Exception: `?sanity-timeout` param bypasses this.

Key guard logic:

- `stepStartAccessGuard`: Parallel-fetches vedlikeholdsmodus, person, loependeVedtak. Background-fetches inntekt, omstillingsstoenad, grunnbeloep, erApoteker. Handles 403 → `/ingen-tilgang` or `/for-lavt-sikkerhetsnivaa`.
- `stepAFPAccessGuard`: Skips if existing AFP vedtak, 100% uføregrad, gradert uføre+apoteker, gradert uføre over AFP_UFOERE_OPPSIGELSESALDER, kap19/apoteker with fremtidig vedtak, or apoteker+endring.
- `beregningEnkelAccessGuard`: Redirects to `/beregning-detaljert` for skalBeregneAfpKap19, existing alderspensjon, or skalBeregneKunAlderspensjon+samtykke.

### Two Entrypoints

- `src/main.tsx` — Borger (citizen) app. `BrowserRouter` with `basename: /pensjon/kalkulator`. Uses idporten auth. Exposes `store` and `router` to `window` when `window.Playwright` is set.
- `src/main-veileder.tsx` — Veileder (caseworker) app. Renders `<VeilederInput>` directly (which creates its own router with `basename: /pensjon/kalkulator/veileder`). Uses Azure auth. Encrypts borger FNR via `/v1/encrypt` API.

Both share the same router, components, and state — they differ in auth flow and entry HTML.

### Beregning Pages

Two calculation modes:

- **BeregningEnkel** (`/beregning`): Fetches `tidligstMuligHeltUttak` → shows `VelgUttaksalder` → fetches `alderspensjon` → shows `Simulering`, `Grunnlag`, `SavnerDuNoe`, `GrunnlagForbehold`.
- **BeregningAvansert** (`/beregning-detaljert`): `RedigerAvansertBeregning` form → shows results with `Simulering`, `Grunnlag`. Has `avansertSkjemaModus` ('redigering'|'resultat') managed via `BeregningContext`.
- Toggle between modes (unless endring, afpKap19, or kunAlderspensjon+samtykke).
- Unsaved changes modal on mode switch and browser back.
- PDF download via `src/pdf-view/` (client-side HTML generation, 855-line hooks.ts).

### Testing Patterns

- **Unit/integration**: Vitest + Testing Library. Tests in `__tests__/` folders. ~133 test files, ~43,400 lines of test code.
- **Test utilities**: `src/test-utils.tsx` provides `render` wrapping Redux Provider, IntlProvider, SanityContext, MemoryRouter. Options: `preloadedState` (Redux), `preloadedApiState` (RTK Query cache via `upsertQueryEntries`), `hasRouter`, `hasLogin`.
- **MSW**: `onUnhandledRequest: 'error'`. Helpers: `mockResponse(path, options)`, `mockErrorResponse(path, options)`. Default session mock in `beforeEach`.
- **Translation keys**: Simple keys render as themselves in tests. Assert key names, not Norwegian text.
- **Test naming**: Norwegian Bokmål (`rendrer korrekt`, `håndterer klikk`, `Gitt at brukeren har ...`).
- **Coverage thresholds**: 85% lines/branches/statements, 50% functions.

### Content & Internationalization

- React Intl for i18n with translations in `src/translations/{nb,nn,en}.ts` (~570 keys in nb).
- Sanity CMS for rich content (GuidePanel, ReadMore, Forbehold sections). Schema types: guidePanelType, readmoreType, forbeholdAvsnittType, tagType. Custom studio components: TaggedDocumentPreview, DocumentIdLock, AuditTimeline.
- `LanguageProvider` bridges NAV decorator language selection with React Intl and Sanity content loading.
- `SanityContext` provides pre-fetched CMS data to components.

### Server (`server/`)

Express server (374 lines) handling:

- TokenX/Azure OBO token exchange for backend API proxying.
- Unleash feature toggles (server-side, exposed to frontend via `/feature/*` routes).
- Static asset serving with separate routing for borger vs veileder entry HTML.
- Prometheus metrics and correlation ID middleware.
- `/v1/encrypt` endpoint for veileder FNR encryption.

## Key Conventions

- **Package manager**: pnpm (strict peer dependencies). `@navikt` scoped packages from GitHub Packages registry.
- **ESLint**: Flat config (ESLint 9). Root `eslint.config.mjs` exports `createConfig()` factory; each app extends it. Includes react, sonarjs, and import plugins.
- **Prettier**: Tabs, single quotes, no semicolons. Import sorting via `@trivago/prettier-plugin-sort-imports` with order: `@navikt` → `@/` → relative → CSS.
- **Path aliases**: `@/` maps to `src/` in ekstern (via `vite-tsconfig-paths`).
- **CSS**: SCSS modules per component with Aksel design tokens (`--a-spacing-*`, `--a-border-radius-*`). `composes:` from shared modules (`frame.module.scss`, `whitesection.module.scss`). BEM-like naming. Auto-generated `.module.scss.d.ts` via `vite-plugin-sass-dts`. Breakpoints via `variables.$a-breakpoint-lg`.
- **Git hooks**: Husky runs lint-staged (ESLint + Prettier) on pre-commit, typecheck on pre-push.
- **Generated types**: `src/types/schema.d.ts` from OpenAPI spec — do not hand-edit. Regenerate with `pnpm fetch-dev-types`.
- **Component structure**: Each component folder contains the component file, SCSS module, `index.ts` re-export, and `__tests__/` folder. Named exports only, no default exports.
- **Base path**: All routes are under `/pensjon/kalkulator`. Changing this requires updates in `router/constants.ts`, `vite.config.ts`, `index.html`, and `veileder/index.html`.
- **Monitoring**: Grafana Faro Web SDK for frontend observability. Paused on localhost.

## Intern App

The intern app (`apps/intern`) has full production infrastructure already set up but a stub frontend:

- **Server**: Express BFF on port 8080 with Azure AD auth (OBO token exchange via `@navikt/oasis`), rate limiting, Winston logging, Unleash feature toggles, Prometheus health endpoints
- **Deployment**: NAIS configs in `.nais/` for dev and prod, Docker setup, Azure AD RBAC groups
- **Frontend**: Currently a placeholder — plans to adopt the same tech stack as ekstern (Vite, React 19, RTK Query, Aksel DS, react-intl, SCSS modules, Vitest, Playwright)
- **Dev server**: Port 5174, proxy to localhost:8080

## Deep Architecture (ekstern)

### RTK Query Cache Strategy

- `keepUnusedDataFor: 3600` — 1 hour cache means data persists across route transitions
- `directAccessGuard` relies on cache existence to allow navigation
- `prepareHeaders` reads `veilederBorgerFnr`/`veilederBorgerEncryptedFnr` from Redux state; if both exist, sets `'fnr'` header to encrypted value
- Tag-based invalidation: `Person`, `OffentligTp`, `Alderspensjon`, `Pensjonsavtaler`
- `getGrunnbeloep` uses absolute external URL (`https://g.nav.no/...`), bypassing baseUrl
- `pensjonsavtaler` transforms response: adds `key: index` to each avtale, sets `partialResponse` from `utilgjengeligeSelskap.length > 0`
- `getErApoteker` transforms: `response.apoteker && response.aarsak === 'ER_APOTEKER'`

### Guard/Loader System

Every step has a guard in `src/router/loaders.tsx` following this pattern:

1. Check `directAccessGuard()` — redirect to `/start` if RTK Query cache is empty
2. Fetch required data via `store.dispatch(apiSlice.endpoints.xxx.initiate()).unwrap()`
3. Evaluate skip conditions based on user profile (kap19, AFP, uføregrad, apoteker, endring)
4. Call `skip(stepArrays, currentPath, request)` to skip forward/backward respecting `?back=true` param
5. Return loader data or redirect

`getStepArrays(isEndring, isKap19OrApoteker)` selects the correct flow array.

### Stegvisning Navigation

- `useStegvisningNavigation(currentPath)` hook returns `[{ onStegvisningNext, onStegvisningPrevious, onStegvisningCancel }]`
- `getStepArrays(isEndring, isKap19)` selects the correct step order
- `onStegvisningPrevious` adds `?back=true` so guards skip backward correctly
- `onStegvisningCancel` dispatches `flush()` to reset userInput state
- Veileder mode: `onCancel` is `undefined` (no cancel button shown)

### Request Body Builders

All in `src/state/api/utils.ts`, named `generateXxxRequestBody`:

- `getSimuleringstypeFromRadioEllerVedtak(loependeVedtak, afp, skalBeregneAfpKap19?, beregningsvalg?)` — resolves `AlderspensjonSimuleringstype` from combination of vedtak state, AFP choice, and beregningsvalg
- Income always formatted via `formatInntektToNumber()`
- `epsHarInntektOver2G` falls back to `checkHarSamboer(sivilstand)` in some builders (tidligstMuligHeltUttak, pensjonsavtaler) but to `undefined` in others (alderspensjon)
- `innvilgetLivsvarigOffentligAfp`: converts monthly to annual (`* 12`), only included if afpStatus + maanedligBeloep + virkningFom all truthy
- Utenlandsperioder transformed with date format conversion (DD.MM.YYYY → YYYY-MM-DD)

### SCSS Module Patterns

- Components use `composes:` to inherit from shared modules (`scss/modules/frame.module.scss`, `whitesection.module.scss`)
- CSS custom properties: `var(--a-spacing-*)` for spacing, `var(--a-surface-*)` for colors
- BEM-like naming within modules: `.section`, `.section__largePadding`
- Auto-generated `.module.scss.d.ts` type declarations (via `vite-plugin-sass-dts`)
- Breakpoints via `@media (min-width: variables.$a-breakpoint-lg)`
- Input widths: `variables.$input-width-m`, `variables.$input-width-s`

### Playwright E2E Architecture

- Custom test fixture in `playwright/base.ts` with `autoAuth` option (default true)
- `authenticate(page, overwrites?)` sets up ~35 route interceptions + navigates through landing
- Redux store accessed via `page.evaluate(() => window.store.dispatch(...))`
- Mock builders: `person()`, `loependeVedtak()`, `pensjonsavtaler()`, `alderspensjon()`, `tidligsteUttaksalder()`, `inntekt()`, `toggleConfig()` — return `RouteDefinition` objects
- Preset states compose multiple mocks for common scenarios
- `fillOutStegvisning(page, overrides)` bulk-dispatches form state + navigates to beregning
- 17 spec files covering all flows

### Domain Concepts

- **Alderspensjon**: State retirement pension, main calculation output
- **AFP (Avtalefestet pensjon)**: Contractual early retirement pension — `ja_privat` (private sector), `ja_offentlig` (public sector), `nei`, `vet_ikke`
- **Uføretrygd**: Disability pension, has `grad` (0-100%). Affects which steps are shown and simulation type
- **Kap19**: Users born before 1963 — different pension rules, separate step flow, separate offentligTp endpoint (foer-1963)
- **Endring/Endringssøknad**: User modifying an existing running alderspensjon. Detected via `isLoependeVedtakEndring(loependeVedtak)` — true if `alderspensjon` exists in vedtak
- **Uttaksalder**: Withdrawal age as `{ aar: number, maaneder: number }`
- **Simuleringstype**: Resolved by `getSimuleringstypeFromRadioEllerVedtak()` — e.g. `ALDERSPENSJON`, `ALDERSPENSJON_MED_AFP_PRIVAT`, `ENDRING_ALDERSPENSJON`, etc.
- **Beregningsvalg**: `null | 'med_afp' | 'uten_afp'` — for users with gradert uføretrygd choosing AFP inclusion
- **Pensjonsavtaler**: Private pension agreements fetched from external providers
- **OffentligTp**: Public sector pension (tjenestepensjon) — separate endpoints for born before/after 1963
- **Apoteker**: Pharmacist status — special case affecting step flow and AFP eligibility
- **Samtykke**: Consent for looking up private pension agreements or public AFP data
- **Grunnbeløp (G)**: Base amount used in pension calculations, fetched from external API
- **EPS**: Ektefelle/Partner/Samboer — spouse fields (epsHarPensjon, epsHarInntektOver2G)
- **Veileder**: NAV caseworker using the calculator on behalf of a citizen (borger)

### Sanity CMS

- Schema types: `guidePanelType`, `readmoreType`, `forbeholdAvsnittType`, `tagType`
- Custom studio components: `TaggedDocumentPreview` (language-filtered preview), `DocumentIdLock` (prevents ID changes), `AuditTimeline` (content history)
- Data fetched at runtime, stored in `SanityContext`
- Components: `SanityGuidePanel` (renders from `guidePanelData[id]`), `SanityReadmore` (renders from `readMoreData[id]`)
- Separate Dockerfile (`Dockerfile-sanity`) and NAIS config for Sanity studio deployment
- Scripts: `FetchSanityData.js` (fetches CMS content to JSON), `FetchLandListe.js` (fetches country list)
