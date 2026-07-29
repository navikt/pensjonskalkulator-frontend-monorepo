---
name: vitest-test
description: Add focused Vitest coverage for an existing component, hook, loader, or utility
argument-hint: "target=<path> behaviors=<expected outcomes>"
agent: agent
---

Add or update tests for:

- Target: `${input:target:path to the production file}`
- Behaviors: `${input:behaviors:observable outcomes and edge cases}`

Read the [testing instructions](../instructions/testing.instructions.md), the target, and the closest relevant test. Reuse the repository's render wrapper, state/API preload options, builders, and MSW helpers. Do not reproduce provider setup or broad fixture objects when an existing helper can express the case.

Write the smallest set of tests that would fail without the intended behavior. Include error or boundary cases only when relevant to the target. Do not change production behavior unless the user requested a fix.

Run:

```bash
pnpm --dir apps/ekstern vitest run <test-file>
```

Finish with the behaviors covered and any important gap that remains outside scope.
