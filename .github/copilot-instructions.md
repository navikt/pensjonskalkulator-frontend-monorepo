# Repository guide

This is NAV's Norwegian pension-calculator frontend monorepo. It uses pnpm workspaces, React 19, TypeScript, Vite, Redux Toolkit, React Router, SCSS modules, Vitest, and Playwright.

## Work efficiently

- Treat these instructions and the nearest matching implementation as the source of truth. Search further only when they are incomplete or conflict with the code.
- Start in the affected workspace and inspect only the target plus one or two comparable files. Avoid repository-wide discovery for a scoped task.
- Make the smallest complete change. Preserve public behavior unless the request explicitly changes it.
- Reuse existing components, helpers, fixtures, selectors, and test utilities before adding abstractions.
- Keep related surfaces in sync: implementation, translations, tests, barrel exports, mocks, and documentation when applicable.

## Repository map

- `apps/ekstern`: mature citizen-facing calculator, including the Express auth/proxy server.
- `apps/intern`: internal caseworker calculator and Express BFF.
- `packages/api`: shared API utilities.
- `packages/mocks`: shared mock data.

For `apps/ekstern`, `@/` resolves to `src/`. All routes use the `/pensjon/kalkulator` base path.

## Commands

Use pnpm only. The pinned version is in the root `packageManager` field.

| Scope                    | Command                                                                       |
| ------------------------ | ----------------------------------------------------------------------------- |
| Install                  | `pnpm install`                                                                |
| Typecheck all workspaces | `pnpm typecheck`                                                              |
| Lint both apps           | `pnpm lint`                                                                   |
| Test all workspaces      | `pnpm test`                                                                   |
| Build all workspaces     | `pnpm build`                                                                  |
| Ekstern typecheck        | `pnpm --filter @pensjonskalkulator-frontend-monorepo/ekstern typecheck`       |
| Ekstern lint             | `pnpm --filter @pensjonskalkulator-frontend-monorepo/ekstern lint`            |
| Ekstern stylelint        | `pnpm --filter @pensjonskalkulator-frontend-monorepo/ekstern stylelint:check` |
| Intern typecheck         | `pnpm --filter @pensjonskalkulator-frontend-monorepo/intern typecheck`        |

Run the narrowest relevant check first. Run a targeted Vitest or Playwright file for test changes, the affected workspace's typecheck for TypeScript changes, and stylelint for SCSS changes. Escalate to root checks only for cross-workspace or build/configuration changes.

## Repository rules

- Use named exports and existing `index.ts` barrel patterns; do not add default exports.
- Prefer Aksel components from `@navikt/ds-react`. Use SCSS modules and the design tokens already used nearby.
- Put all user-facing text in the existing `react-intl` translation files and keep supported locales aligned.
- Use typed Redux hooks and existing RTK Query hooks. Do not introduce manual fetching for API state already owned by RTK Query.
- Never hand-edit `apps/ekstern/src/types/schema.d.ts`; regenerate it with the workspace's `fetch-dev-types` script.
- Do not use npm or yarn.

## Confirm before changing

Ask before changing:

- route or step-flow order,
- guard/loader redirect behavior,
- RTK Query endpoints or cache configuration,
- Express authentication or proxy behavior,
- production Nais resources or access policies.

Path-specific instructions under `.github/instructions/` add rules for React/Aksel source files and tests.
