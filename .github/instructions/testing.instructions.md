---
applyTo: "**/*.test.{ts,tsx}"
---

# Vitest tests

- Read the production code and the nearest relevant test before writing a new pattern.
- Test observable behavior and meaningful edge cases, not internal state or implementation details.
- Write `describe` and test names in Norwegian Bokmål.
- Prefer accessible queries. Assert translation keys rather than rendered Norwegian copy.
- Import `render`, `screen`, `userEvent`, `waitFor`, and related helpers from `@/test-utils`. Import `renderHook` directly from `@testing-library/react` only when testing a hook.
- Create `userEvent.setup()` before rendering.
- Reuse existing builders, `preloadedState`, `preloadedApiState`, and MSW helpers. Do not duplicate provider setup or share mutable state between tests.
- Restore fake timers and other global mutations after each test.
- Do not add skipped tests, broad snapshots, arbitrary waits, or assertions that merely repeat the implementation.

Run the changed test file first:

```bash
pnpm --dir apps/ekstern vitest run <test-file>
```

Run the ekstern typecheck when test data or types change. Use the full test suite only when the change has broad effects.
