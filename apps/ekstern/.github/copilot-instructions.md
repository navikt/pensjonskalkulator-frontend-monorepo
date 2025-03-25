# Pensjonskalkulator Frontend Coding Guidelines

This document provides guidelines for Copilot to follow when suggesting code for this project.

## Project Overview

- Frontend application for pension calculator for users born 1963 or later
- React-based SPA using TypeScript, Vite, React Router, React-Intl for translations
- Uses NAV design system (@navikt/ds-react and @navikt/ds-css)

## File Structure

- Each component should be in its own directory (`ComponentName/`)
- Component files should follow this pattern:
  - `ComponentName/ComponentName.tsx` - Main component file
  - `ComponentName/index.ts` - Exports component(s)
  - `ComponentName/ComponentName.module.scss` - Component styles (if needed)
  - `ComponentName/__tests__/ComponentName.test.tsx` - Component tests
- Group related components in logical directories (e.g., `common/`, `Simulering/`)

## Component Guidelines

- Use functional components with React hooks
- TypeScript interfaces should be explicit for props
- Export named components (not default exports)
- Use destructuring for props
- Components should be:
  - Self-contained and reusable where possible
  - Focused on a single responsibility
  - Well-typed with TypeScript

## Example Component Structure:

```tsx
import React from 'react'
import { useIntl } from 'react-intl'

import { SomeComponent } from '@navikt/ds-react'

import { someUtil } from '@/utils/someUtil'

import styles from './ComponentName.module.scss'

export interface ComponentNameProps {
  someProp: string
  optionalProp?: boolean
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  someProp,
  optionalProp = false,
}) => {
  const intl = useIntl()

  return <div className={styles.container}>{/* Component content */}</div>
}
```

## Styling Conventions

- Use CSS Modules (`.module.scss` files)
- Follow BEM-like naming convention within modules
- Use `clsx` when combining multiple class names
- Import styles as `styles` and use as `className={styles.elementName}`
- Prefer NAV design system components and styling where possible

## Testing Guidelines

- Tests go in `__tests__` subdirectory within component directory
- Use Vitest for testing
- Test files should match component name: `ComponentName.test.tsx`
- Use testing-library/react for component testing
- Make use of test-utils.tsx wrappers for common testing patterns

## Code Style

- Use semicolons at the end of statements: No
- Use single quotes for strings
- 2 spaces for indentation
- Trailing commas in objects and arrays
- Arrow function parameters always have parentheses
- End files with a newline
- Maximum line length should be reasonable (no hard limit but keep readability in mind)
- No unused variables or imports
- Follow the conventions of eslint.config.mjs and .prettierrc.cjs

## Best Practices

- Use named exports instead of default exports
- Prefer functional components over class components
- Use React hooks appropriately
- Utilize TypeScript for type safety
- Follow i18n patterns using react-intl
- Prefer early returns for conditionals
- Use destructuring for props and state
- Keep components small and focused
- Follow accessibility best practices

## State Management

- Use React hooks for local state
- Use context API for shared state when appropriate
- Redux is used for global state management

## Internationalization

- All user-facing strings should use react-intl
- Use formatMessage with IDs referencing keys in translation files

## Error Handling

- Use error boundaries for component errors
- Handle API errors gracefully
- Provide meaningful error messages to users
