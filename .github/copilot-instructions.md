# Copilot Instructions

## Project Overview

Norwegian pension calculator ("pensjonskalkulator") frontend monorepo for NAV. pnpm workspace with two React 19 apps (Vite + TypeScript + Redux Toolkit + React Router + SCSS modules) and shared packages.

## Workspace Structure

- `apps/ekstern` — Public-facing pension calculator (mature). Express server for auth, proxying, Unleash toggles.
- `apps/intern` — Internal pension calculator (early stage). Express BFF with Azure AD auth.
- `packages/api` — Shared API utilities (scaffold).
- `packages/mocks` — Shared mock data (empty).

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
pnpm --filter @pensjonskalkulaotor-frontend-monorepo/sanity sanity build/start  # Build / start Sanity Studio
pnpm --filter @pensjonskalkulaotor-frontend-monorepo/<package> <command>  # Run command in specific package
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

## Key Conventions

- **Package manager**: pnpm with strict peer deps. `@navikt` packages from GitHub Packages registry.
- **Component structure**: Each component folder has the component file, SCSS module, `index.ts` re-export, and `__tests__/` folder. Named exports only — no default exports.
- **Generated types**: `src/types/schema.d.ts` is generated from OpenAPI spec — 🚫 never hand-edit. Regenerate with `pnpm fetch-dev-types`.
- **Path aliases**: `@/` maps to `src/` in ekstern.
- **Base path**: All routes live under `/pensjon/kalkulator`. Changing it requires updates in `router/constants.ts`, `vite.config.ts`, `index.html`, and `veileder/index.html`.
- **Monitoring**: Grafana Faro Web SDK for frontend observability (paused on localhost).

## Boundaries

### ✅ Always

- Use pnpm (not npm/yarn)
- Use named exports from `index.ts` barrel files
- Use SCSS modules with Aksel design tokens (`--a-spacing-*`, `--a-border-radius-*`)
- Write test names in Norwegian Bokmål (`rendrer korrekt`, `håndterer klikk`)
- Assert on translation keys, not hardcoded Norwegian text

### ⚠️ Ask First

- Changes to route/step flow order (`router/constants.ts`)
- Changes to RTK Query endpoints or cache configuration
- Changes to the Express server auth/proxy layer

### 🚫 Never

- Hand-edit `src/types/schema.d.ts` — it's generated
- Use default exports
- Use npm or yarn
- Skip running `pnpm typecheck` after changing types
