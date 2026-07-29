---
name: playwright-test
description: Add a focused Playwright test using the existing fixtures, routes, and mock builders
argument-hint: "flow=<feature> scenarios=<profiles> assertions=<outcomes>"
agent: agent
---

Add a Playwright test for:

- Flow: `${input:flow:feature or user journey}`
- Scenarios: `${input:scenarios:user profiles and conditions}`
- Assertions: `${input:assertions:user-visible outcomes}`

If the requested behavior is ambiguous, ask one focused question. Otherwise:

1. Read the production flow, the closest spec under `apps/ekstern/playwright/e2e/pensjon/kalkulator/`, and only the fixture or mock helpers it uses.
2. Reuse `base.ts`, authentication helpers, preset states, and route builders. Do not duplicate shared setup or hardcode API responses when a builder exists.
3. Prefer role, label, and text locators. Use test IDs only where semantic locators are not stable or available.
4. Keep the test deterministic: wait on observable UI or network outcomes, not arbitrary timeouts.
5. Cover the requested behavior without expanding into unrelated permutations.

Run the new spec with:

```bash
pnpm --dir apps/ekstern exec playwright test <spec-file> --project=chromium
```

Finish with the scenario covered and any reused fixtures or builders.
