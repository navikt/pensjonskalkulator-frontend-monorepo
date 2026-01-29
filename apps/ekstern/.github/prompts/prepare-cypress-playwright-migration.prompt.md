---
agent: agent
---

## Task Context

Prepare for migrating a Cypress E2E test file to Playwright by creating a tracking checklist and a code skeleton. This ensures a systematic and organized migration process.

## Inputs

- **Cypress Test File**: The existing `.cy.ts` file to be migrated.

## Outputs

1.  **Checklist File**: A markdown file (e.g., `filename.checklist.md`) listing all test cases.
2.  **Skeleton Spec File**: A Playwright spec file (e.g., `filename.spec.ts`) mirroring the structure of the Cypress file but with empty test bodies.

## Instructions

### 1. Analyze the Cypress File
- Read the provided Cypress test file.
- Identify all `describe` and `it` blocks.
- Note the nesting structure.

### 2. Create the Checklist File
- Create a new file named `{original_filename}.checklist.md` in the same directory as the target Playwright spec.
- List every `it` block as a checklist item.
- Number the items sequentially.
- Format: `1. [ ] Test description string`
- Include a header and a status legend.

### 3. Create the Skeleton Spec File
- Create a new file named `{original_filename}.spec.ts` in the `playwright/e2e/pensjon/kalkulator/` directory (mirroring the Cypress path).
- **Imports**:
    - Import `test`, `expect` from `../../../base`.
    - Import `authenticate` from `../../../utils/auth`.
    - Import `fillOutStegvisning` from `../../../utils/navigation`.
    - Import necessary mocks from `../../../utils/mocks`.
    - Import `presetStates` from `../../../utils/presetStates`.
- **Structure**:
    - Replicate the `describe` nesting using `test.describe`.
    - Replicate the `it` blocks using `test`.
- **Content**:
    - Add a comment before each `test` block corresponding to its number in the checklist (e.g., `// 1`).
    - Leave the test body empty or containing `// TODO: Migrate`.
    - If `beforeEach` blocks exist in Cypress, create corresponding `test.beforeEach` blocks in Playwright, but leave them empty or with a comment to migrate setup logic later.
- **Do NOT** implement the test logic or assertions yet. This step is strictly for scaffolding.

## Example Output

**Checklist (`example.checklist.md`):**
```markdown
# Example Migration Checklist

1. [ ] shows the welcome page
2. [ ] allows navigation to the next step
```

**Skeleton (`example.spec.ts`):**
```typescript
import { test, expect } from '../../../base'
import { authenticate } from '../../../utils/auth'

test.describe('Main flow', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Migrate setup
  })

  // 1
  test('shows the welcome page', async ({ page }) => {
    // TODO: Migrate
  })

  // 2
  test('allows navigation to the next step', async ({ page }) => {
    // TODO: Migrate
  })
})
```
