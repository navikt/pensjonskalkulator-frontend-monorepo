---
applyTo: 'apps/ekstern/src/**/*.{tsx,ts}'
---

# React Component Standards (Aksel Design System)

## 1. Folder Structure Convention

```
src/components/MyComponent/
├── MyComponent.tsx              # Main component (named export)
├── MyComponent.module.scss      # Scoped styles
├── index.ts                     # Re-exports: export { MyComponent } from './MyComponent'
├── hooks.ts                     # Complex logic extracted into custom hooks
├── utils.ts                     # Pure helper functions, constants, validation
├── Felles/                      # Shared sub-components (when multiple variants exist)
│   ├── SharedPart.tsx
│   ├── SharedPart.module.scss
│   └── index.ts
├── VariantA/
│   ├── VariantA.tsx
│   └── index.ts
└── __tests__/
    └── MyComponent.test.tsx
```

Key conventions:

- Every component folder has an `index.ts` barrel file
- SCSS module type declarations (`*.module.scss.d.ts`) may exist alongside SCSS files
- `hooks.ts` / `hooks.tsx` files live inside the component folder, not in a global hooks directory
- `utils.ts` files live inside the component folder for component-specific logic

## 2. Component Patterns

### Named function components, no default exports

```tsx
// ✅ Correct
export function MyComponent({ title }: Props) {
	return <Heading>{title}</Heading>
}

// index.ts
export { MyComponent } from './MyComponent'
```

```tsx
// 🚫 Never
export default function MyComponent() { ... }
```

### Props — inline interface or named `Props`

```tsx
interface Props {
  onNext: (data: FormData) => void
  onPrevious: () => void
  onCancel?: () => void
}

export function MyStep({ onNext, onPrevious, onCancel }: Props) { ... }
```

### Hooks pattern — extract complex logic into `hooks.ts`

When a component has significant state, memoization, or side effects, extract into a custom hook in the same folder:

```tsx
// MyComponent.tsx
import { useFormLocalState } from './hooks'

// hooks.ts
export function useFormLocalState(initialValues: InitialValues) {
	const [localField, setLocalField] = useState(initialValues.field)
	// ... complex state, useMemo, useEffect
	return [localField, handlers] as const
}

export function MyComponent(props: Props) {
	const [state, handlers] = useFormLocalState(props)
	// ...
}
```

Hook return types are commonly tuples (`[state, handlers]`) or objects.

## 3. SCSS Module Patterns

### Import convention

```tsx
import styles from './MyComponent.module.scss'
```

### Shared variables

```scss
@use '../../scss/variables'; // depth varies
```

### Aksel design tokens (CSS custom properties)

```scss
.wrapper {
	padding: var(--a-spacing-4);
	margin-bottom: var(--a-spacing-6);
	color: var(--a-text-subtle);
	border: 1px solid var(--a-border-default);
	border-radius: var(--a-border-radius-medium);
}
```

Common spacing tokens: `--a-spacing-1` through `--a-spacing-8`.
Color tokens: `--a-deepblue-500`, `--a-purple-400`, `--a-data-surface-5`, `--a-gray-500`, `--a-text-subtle`.
Border tokens: `--a-border-default`, `--a-border-radius-medium`.
Font tokens: `--a-font-line-height-xlarge`.

### Responsive breakpoints

```scss
@media (min-width: variables.$a-breakpoint-md) {
	.wrapper {
		flex-direction: row;
	}
}
```

### Input width variables

```scss
.select {
	width: variables.$input-width-m;
}
.datepicker input {
	width: variables.$input-width-s;
}
```

### BEM-like naming with `&` nesting

```scss
.utenlandsperioder {
	margin-block: var(--a-spacing-4);

	&Item {
		display: flex;
		flex-direction: column;
	}
	&Text {
		flex-grow: 1;
	}
	&Buttons {
		display: flex;
		justify-content: space-between;
	}
}
```

### `:global()` to target Aksel component internals

```scss
.selectSivilstand {
	:global(.navds-select__container) {
		width: variables.$input-width-m;
	}
}
```

### Composable utility classes

```scss
// modules/whitesection.module.scss — composed into component styles
.wrapper {
	composes: whitesection from '../../scss/modules/whitesection.module.scss';
}
```

### No inline styles, no Tailwind

All styling goes through SCSS modules with Aksel tokens. Never use `style={{}}` for spacing/layout.

## 4. Aksel Design System — Component Catalog

Components actively used from `@navikt/ds-react`:

**Layout:** `HStack`, `VStack`, `Box`
**Typography:** `Heading`, `BodyLong`, `BodyShort`, `Label`
**Form controls:** `Button`, `Radio`, `RadioGroup`, `Select`, `TextField`, `Chips.Toggle`, `DatePicker` (+ `useDatepicker` hook)
**Feedback:** `Alert`, `ErrorMessage`, `Loader`, `Modal`
**Navigation:** `Link`
**Disclosure:** `ReadMore`, `Accordion`, `Accordion.Item`, `ExpansionCard`
**Data display:** `Table`, `Table.Row`, `Table.ExpandableRow`, `Table.Body`, `Table.Header`, `Table.HeaderCell`, `Table.DataCell`, `GuidePanel`
**Divider:** `Divider`
**Icons:** `PencilIcon`, `PlusCircleIcon`, `ExternalLinkIcon`, `ChevronDownIcon`, `ChevronUpIcon`, `ArrowCirclepathIcon`

## 5. Internationalization (react-intl)

### `useIntl()` for programmatic text

```tsx
const intl = useIntl()
const label = intl.formatMessage({ id: 'mycomponent.label' })
```

### `<FormattedMessage>` with chunks for rich text

```tsx
<FormattedMessage
	id="mycomponent.ingress"
	values={{
		...getFormatMessageValues(intl),
		strong: (chunks: React.ReactNode) => <strong>{chunks}</strong>,
	}}
/>
```

Rich text helpers live in `src/utils/translations.tsx` (`getFormatMessageValues`).

### Translation files

`src/translations/{nb,nn,en}.ts` — flat key-value maps with ~500+ keys each.

## 6. RTK Query in Components

### Query hooks (auto-generated from `apiSlice`)

```tsx
const { data, isFetching, isError } = useGetLoependeVedtakQuery()
const { data: pensjonsavtaler } = usePensjonsavtalerQuery(requestBody, {
	skip: !requestBody,
})
```

### Selector-based access (for derived/cached data)

```tsx
import { apiSlice } from '@/state/api/apiSlice'

const selectResult = apiSlice.endpoints.getLoependeVedtak.select()
```

## 7. Redux — Typed Hooks

```tsx
import { useAppDispatch, useAppSelector } from '@/state/hooks'

// Reading state
const foedselsdato = useAppSelector(selectFoedselsdato)
const afp = useAppSelector(selectAfp)

// Dispatching actions
const dispatch = useAppDispatch()
dispatch(userInputActions.setAfp(value))
dispatch(userInputActions.flush())
```

Selectors are imported from `@/state/userInput/selectors`.
Actions from `@/state/userInput/userInputSlice` (via `userInputActions`).

## 8. Form Patterns

### Local state validation with `onSubmit`

```tsx
const [validationError, setValidationError] = useState<string>('')

const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
	e.preventDefault()
	const data = new FormData(e.currentTarget)
	const value = data.get('fieldName') as string

	if (!value) {
		setValidationError(intl.formatMessage({ id: 'error.required' }))
		logger('skjemavalidering feilet', { skjemanavn: FORM_NAME })
		return
	}

	setValidationError('')
	logger('radiogroup valgt', { tekst: 'field', valg: value })
	onNext(value)
}
```

### Error display — via Aksel component `error` prop

```tsx
<RadioGroup error={validationError} onChange={() => setValidationError('')}>
	<Radio value="ja">{intl.formatMessage({ id: 'label.ja' })}</Radio>
	<Radio value="nei">{intl.formatMessage({ id: 'label.nei' })}</Radio>
</RadioGroup>
```

### Multi-field validation (object errors)

```tsx
const [validationErrors, setValidationErrors] = useState<
	Record<string, string>
>({
	sivilstand: '',
	epsHarPensjon: '',
	epsHarInntektOver2G: '',
})
```

### Detached form pattern

When form fields are visually separated from the submit button (e.g., a list between them):

```tsx
<form id="my-form" onSubmit={handleSubmit} />
<RadioGroup>
  <Radio form="my-form" value="ja" />
</RadioGroup>
{/* Other content between form and navigation */}
<Navigation form="my-form" onPrevious={onPrevious} />
```

### Step navigation callbacks

Every wizard step receives `onNext`, `onPrevious`, and optional `onCancel`. The `onNext` signature varies per step — it passes typed form data upward:

```tsx
onNext: (afpInput: AfpRadio) => void
onNext: (data: { sivilstand: Sivilstand; epsHarPensjon: boolean | null }) => void
```

## 9. Compound Component Pattern

```tsx
// Card.tsx
export function Card({ hasLargePadding, hasMargin, children }: Props) {
  return <section className={clsx(styles.card, ...)}>{children}</section>
}
Card.Content = CardContent  // static property

// Usage
<Card hasLargePadding hasMargin>
  <Card.Content text={{ header: '...', ingress: '...' }} />
</Card>
```

## 10. Sanity CMS Content Integration

### `SanityGuidePanel` — CMS-driven guide panels

```tsx
<SanityGuidePanel id="sanity-content-id" />
```

Fetches from `SanityContext.guidePanelData[id]`, renders Aksel `GuidePanel` with `poster` mode + Sanity PortableText body.

### `SanityReadmore` — CMS-driven expandable sections

```tsx
<SanityReadmore id="sanity-readmore-id" className={styles.readmore} />
```

Fetches from `SanityContext.readMoreData[id]`, renders via internal `ReadMore` wrapper.

Both components consume data from `SanityContext` (React context populated at app level).

## 11. Accessibility Patterns

### Heading levels — passed as props, never hardcoded at wrong level

```tsx
<Heading level={headingLevel} size="medium">
	{intl.formatMessage({ id: 'title' })}
</Heading>
```

### `role="img"` for chart containers

```tsx
<div role="img" aria-label={intl.formatMessage({ id: 'chart.label' })}>
  <HighchartsReact ... />
</div>
```

### ARIA attributes on form elements

- `aria-invalid` set by Aksel form components when `error` prop is present
- Focus management: on validation failure, focus is programmatically moved to first `[aria-invalid]` element
- `aria-live="polite"` on loaders and dynamic content
- `inert` attribute on collapsed `ShowMore` content

### `data-testid` for test selectors

```tsx
<Button data-testid="stegvisning-neste-button" type="submit">
```

## 12. Conditional Classnames with `clsx`

```tsx
import clsx from 'clsx'

;<div
	className={clsx(
		styles.card,
		isActive && styles.active,
		hasMargin && styles.margin
	)}
/>
```

## 13. Path Aliases

`@/` maps to `src/` (configured via tsconfig paths + vite-tsconfig-paths):

```tsx
import { paths } from '@/router/constants'
import { useAppSelector } from '@/state/hooks'
```

## 14. Import Order

Prettier auto-sorts imports (via @trivago/prettier-plugin-sort-imports):

1. `@navikt` packages
2. `@/` path aliases
3. Relative imports
4. CSS/SCSS imports last

## Boundaries

### ✅ Always

- Use Aksel DS components from `@navikt/ds-react`
- Use translation keys for all user-facing text (`useIntl` / `<FormattedMessage>`)
- Use SCSS modules for component styles with Aksel tokens
- Named exports only, re-exported via `index.ts`
- Use `clsx` for conditional classnames
- Use `@/` path aliases for non-relative imports
- Extract complex logic into `hooks.ts` in the component folder

### ⚠️ Ask First

- Adding new npm dependencies
- Creating new Redux slices
- Changing routing or step flow order

### 🚫 Never

- Use inline styles (`style={{}}`) for spacing or layout
- Use Tailwind or utility-class CSS frameworks
- Use default exports
- Hardcode Norwegian text (use react-intl)
- Import from `@testing-library/react` directly (use `@/test-utils`)
- Hand-edit `src/types/schema.d.ts` (it's auto-generated)
