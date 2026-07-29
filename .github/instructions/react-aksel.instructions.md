---
applyTo: "apps/ekstern/src/**/*.{ts,tsx,scss}"
---

# React and Aksel

- Read the target and the nearest comparable component before editing. Match its composition, naming, imports, and folder structure.
- Prefer direct use of `@navikt/ds-react` over custom equivalents. Do not recreate design-system behavior.
- Use named exports. Add or update the local `index.ts` when the component is part of that folder's public surface.
- Keep component props explicit and typed. Extract hooks or helpers only when they make non-trivial logic easier to test or reuse.
- Use typed hooks from `@/state/hooks` and existing RTK Query hooks. Keep API and cache changes out of UI-only work.

## UI and content

- Use semantic HTML and preserve keyboard, focus, label, error, and heading behavior.
- Use `react-intl` for every user-facing string. Update all existing locale files together.
- Use SCSS modules and existing Aksel tokens or shared modules. Do not use inline layout styles, Tailwind, or hardcoded spacing values.
- Avoid styling Aksel internals with `:global()` unless no supported component API can achieve the result; ask before introducing a new override.
- Follow the nearest form's validation and analytics pattern. Surface validation errors and do not update persisted state before successful submission.

## Completion

- Add or update behavior-focused tests when behavior changes.
- Run the targeted test, the ekstern typecheck, and stylelint when SCSS changes.
- Do not hand-edit `src/types/schema.d.ts`.
