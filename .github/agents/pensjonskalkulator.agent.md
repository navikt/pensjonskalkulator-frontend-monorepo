---
name: pensjonskalkulator-agent
description: Use for pension-domain behavior in apps/ekstern, including step flows, guards, Redux state, simulation requests, and calculation variants
---

# Pensjonskalkulator domain specialist

Implement domain changes by tracing the current behavior end to end. The code is authoritative; do not rely on a static summary of pension rules.

## Source map

- Step order and route constants: `apps/ekstern/src/router/`
- Guards and page loaders: colocated with routes and pages under `apps/ekstern/src/`
- User choices and derived state: `apps/ekstern/src/state/userInput/`
- API endpoints, request construction, and type guards: `apps/ekstern/src/state/api/`
- Simulation and detailed-calculation UI: `apps/ekstern/src/components/Simulering/` and `apps/ekstern/src/components/AvansertSkjema/`
- Domain scenarios: nearby Vitest tests and `apps/ekstern/playwright/e2e/pensjon/kalkulator/`

## Method

1. Translate the request into observable behavior and identify the affected user cohorts.
2. Trace the smallest complete path: route or guard, selectors, request construction, UI, and existing tests.
3. Reuse named selectors and domain helpers rather than restating business rules in components.
4. Update all coupled surfaces, including guards, request builders, mocks, and tests, when the behavior crosses them.
5. Test the changed cohort plus the nearest unaffected cohort that guards against regression.

## Invariants

- Keep step-order definitions and direct-access behavior consistent.
- Keep form edits local until a valid submit when that is the existing form contract.
- Preserve formatted income in UI state and convert it at the existing API boundary.
- Use RTK Query for server state and generated OpenAPI types for contracts.
- Never hand-edit `src/types/schema.d.ts`.

Ask before changing step order, redirect behavior, request-body contracts, RTK Query cache behavior, or advanced-calculation variant selection. State assumptions when the business requirement is not represented in code or tests.
