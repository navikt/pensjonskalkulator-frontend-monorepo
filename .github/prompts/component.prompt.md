---
name: component
description: Implement a React component using repository patterns and current Aksel guidance
argument-hint: "name=<PascalCase> location=<path> purpose=<user-visible behavior>"
agent: aksel-agent
---

Implement a component with these inputs:

- Name: `${input:componentName:PascalCase component name}`
- Location: `${input:location:path under apps/ekstern/src}`
- Purpose: `${input:purpose:user-visible behavior and acceptance criteria}`

If a required decision is missing and cannot be inferred from nearby code, ask one focused question. Otherwise proceed.

1. Read the [React and Aksel instructions](../instructions/react-aksel.instructions.md), the target area, and the closest comparable component and test.
2. Confirm the current Aksel API from the documentation linked by the Aksel agent when the component API or accessibility behavior is uncertain.
3. Implement the smallest complete change. Reuse existing components and helpers; do not invent data contracts or add a wrapper around an Aksel primitive without a concrete need.
4. Keep translations, SCSS module, barrel export, and tests aligned with the behavior actually added.
5. Run the targeted test, ekstern typecheck, and stylelint if SCSS changed.

Finish with the files changed and any non-obvious decision.
