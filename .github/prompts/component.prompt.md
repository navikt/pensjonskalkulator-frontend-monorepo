---
name: component
description: Scaffold a new React component following pensjonskalkulator conventions
---

You are scaffolding a new React component for the pensjonskalkulator frontend (`apps/ekstern/`).

## Ask the User

1. **Component name** (PascalCase)
2. **Location**: `components/common/`, `components/stegvisning/`, `components/Simulering/`, or other
3. **Purpose**: What does it display/do?
4. **Needs translations?** (most components do)
5. **Needs Redux state?** (RTK Query data or userInput)

## File Structure

Create these files:

### `{ComponentName}.tsx`

```tsx
import { useIntl } from 'react-intl'
import { BodyShort, Heading } from '@navikt/ds-react'

import styles from './{ComponentName}.module.scss'

interface Props {
  // Define props
}

export function {ComponentName}({ }: Props) {
  const intl = useIntl()

  return (
    <div className={styles.container}>
      <Heading size="medium" level="2">
        {intl.formatMessage({ id: '{componentname}.title' })}
      </Heading>
    </div>
  )
}
```

### `{ComponentName}.module.scss`

```scss
@use '../../scss/variables';

.container {
	display: flex;
	flex-direction: column;
	gap: var(--a-spacing-3);
}
```

Adjust `@use` depth based on component location. SCSS patterns used in this project:

- **Spacing tokens**: `--a-spacing-1` through `--a-spacing-8` (most common: 1, 2, 4, 6, 8)
- **Color tokens**: `--a-deepblue-500`, `--a-purple-400`, `--a-data-surface-5`, `--a-text-subtle`, `--a-border-default`
- **Border tokens**: `--a-border-radius-medium`
- **Breakpoint variables**: `variables.$a-breakpoint-md` for responsive layouts
- **Input width variables**: `variables.$input-width-s`, `variables.$input-width-m`, `variables.$input-width-l`
- **BEM-like nesting**: Use `&` for modifiers (e.g., `&Item`, `&__endre`)
- **`:global()` selector**: Used to target Aksel component internals (e.g., `.navds-select__container`)
- **All files are CSS Modules** (`*.module.scss`) imported as `styles` object

### `index.ts`

```typescript
export { {ComponentName} } from './{ComponentName}'
```

### `__tests__/{ComponentName}.test.tsx`

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'

import { {ComponentName} } from '../{ComponentName}'

describe('{ComponentName}', () => {
  it('rendrer korrekt', () => {
    render(<{ComponentName} />)
    expect(screen.getByText('{componentname}.title')).toBeVisible()
  })
})
```

**Import rules:**

- `render`, `screen`, `waitFor` from `@/test-utils` (custom wrapper with Redux/IntlProvider/SanityContext/Router)
- `userEvent` from `@testing-library/user-event` (re-exported by `@/test-utils` but imported separately in most test files)
- `vi`, `describe`, `it`, `expect` from `vitest`

## Conventions

- Use `@navikt/ds-react` components — the project uses these Aksel components:
  - **Layout**: `HStack`, `VStack`
  - **Typography**: `Heading`, `BodyLong`, `BodyShort`
  - **Forms**: `Button`, `Radio`, `RadioGroup`, `Select`, `DatePicker`
  - **Feedback**: `Alert`, `ErrorMessage`, `Loader`
  - **Navigation**: `Link`
  - **Disclosure**: `ReadMore`, `Accordion`, `ExpansionCard`, `GuidePanel`, `Modal`
  - **Icons**: `PencilIcon`, `PlusCircleIcon`, `ExternalLinkIcon`, `ArrowCirclepathIcon`, `ChevronDownIcon`, `ChevronUpIcon`
  - **Hooks**: `useDatepicker`, `useId`
- Use `--a-spacing-*` CSS custom properties for spacing
- Use `useIntl()` + `intl.formatMessage({ id: 'key' })` for all text
- Use `<FormattedMessage>` with `getFormatMessageValues()` for rich text with links/formatting
- Use `@/` path alias for imports from `src/`
- Use `clsx` for conditional class names
- Use `vi.fn()` for mock callbacks in tests
- Translation keys use dot notation: `componentname.section.label`
- Test names in Norwegian: `rendrer`, `håndterer`, `viser`
- Logging: Use `logger()` and `wrapLogger()` from `@/utils/logging`
- Logger events: `'radiogroup valgt'`, `'knapp klikket'`, `'button klikk'`, `'skjemavalidering feilet'`

## With RTK Query Data

```tsx
import { apiSlice } from '@/state/api/apiSlice'

export function {ComponentName}() {
  const { data, isLoading } = apiSlice.useGetPersonQuery()

  if (isLoading) return <Loader />
  if (!data) return null

  return <div>{data.navn}</div>
}
```

Available RTK Query hooks:

- `useGetPersonQuery`, `useGetInntektQuery`, `useGetGrunnbeloepQuery`
- `useGetErApotekerQuery`, `useGetOmstillingsstoenadOgGjenlevendeQuery`
- `useGetLoependeVedtakQuery`, `useGetAnsattIdQuery`
- `useGetAfpOffentligLivsvarigQuery`
- `useTidligstMuligHeltUttakQuery`, `useAlderspensjonQuery`
- `usePensjonsavtalerQuery`, `useOffentligTpQuery`, `useOffentligTpFoer1963Query`
- `useGetSpraakvelgerFeatureToggleQuery`, `useGetVedlikeholdsmodusFeatureToggleQuery`
- `useGetShowDownloadPdfFeatureToggleQuery`, `useGetUtvidetSimuleringsresultatFeatureToggleQuery`

Test with preloaded data (uses `apiSlice.util.upsertQueryEntries` under the hood):

```tsx
render(<{ComponentName} />, {
  preloadedApiState: {
    getPerson: {
      navn: 'Aprikos Nordmann',
      fornavn: 'Aprikos',
      sivilstand: 'UGIFT',
      foedselsdato: '1964-04-30',
      pensjoneringAldre: {
        normertPensjoneringsalder: { aar: 67, maaneder: 0 },
        nedreAldersgrense: { aar: 62, maaneder: 0 },
        oevreAldersgrense: { aar: 75, maaneder: 0 },
      },
    },
  },
})
```

Preloaded `userInput` state:

```tsx
render(<{ComponentName} />, {
  preloadedState: {
    userInput: {
      ...userInputInitialState,
      afp: 'ja_privat',
      samtykke: true,
      currentSimulation: {
        uttaksalder: { aar: 67, maaneder: 0 },
        aarligInntektFoerUttakBeloep: '521 338',
        gradertUttaksperiode: null,
        beregningsvalg: null,
        aarligInntektVsaHelPensjon: undefined,
      },
    },
  },
})
```

## Stegvisning Component Pattern

Steps follow a consistent form pattern:

```tsx
interface Props {
  previousValue: SomeType | null
  onCancel?: () => void
  onPrevious: () => void
  onNext: (data: SomeType) => void
}

export function MyStep({ previousValue, onCancel, onPrevious, onNext }: Props) {
  const [validationError, setValidationError] = useState<string>('')

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    if (!data.get('field')) {
      setValidationError(intl.formatMessage({ id: 'error.key' }))
      logger('skjemavalidering feilet', { skjemanavn: 'step-name' })
      return
    }
    logger('radiogroup valgt', { tekst: 'step-name', valg: value })
    onNext(value)
  }

  return (
    <Card hasLargePadding hasMargin>
      <form onSubmit={onSubmit}>
        <Heading size="medium" level="2">...</Heading>
        <RadioGroup error={validationError} ...>...</RadioGroup>
        <Navigation onPrevious={onPrevious} onCancel={onCancel} />
      </form>
    </Card>
  )
}
```

## With Hooks File

For complex logic, create a `hooks.ts`:

```typescript
import { useAppSelector } from '@/state/hooks'
import { selectAfp } from '@/state/userInput/selectors'

export function use{ComponentName}Data() {
  const afp = useAppSelector(selectAfp)
  return { afp, isEligible: afp === 'ja_privat' }
}
```

## Checklist

- ✅ Component uses Aksel DS components
- ✅ All text uses translation keys (add to `translations/nb.ts`, `nn.ts`, `en.ts`)
- ✅ SCSS module with `@use` variables import and `--a-spacing-*` tokens
- ✅ Barrel export in index.ts
- ✅ Test file in `__tests__/` with Norwegian test names
- ✅ Props interface defined
- ✅ Analytics logging via `logger()` / `wrapLogger()`
