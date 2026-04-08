---
applyTo: 'apps/ekstern/src/**/*.{tsx,ts}'
---

# React Component Standards

## Folder Structure

```
src/components/MyComponent/
├── MyComponent.tsx              # Main component (named export)
├── MyComponent.module.scss      # Scoped styles
├── index.ts                     # Re-exports: export { MyComponent } from './MyComponent'
├── hooks.ts                     # Complex logic extracted into custom hooks
├── utils.ts                     # Pure helper functions, constants, validation
├── Felles/                      # Shared sub-components
│   ├── SharedPart.tsx
│   └── index.ts
└── __tests__/
    └── MyComponent.test.tsx
```

## Component Patterns

### Named exports — no default exports

```tsx
// ✅ Correct
export function MyComponent({ title }: Props) {
	return <Heading>{title}</Heading>
}

// 🚫 Never
export default function MyComponent() { ... }
```

### Props — named `Props` interface

```tsx
interface Props {
  onNext: (data: FormData) => void
  onPrevious: () => void
  onCancel?: () => void
}

export function MyStep({ onNext, onPrevious, onCancel }: Props) { ... }
```

### Hooks — extract complex logic into `hooks.ts` in the same folder

```tsx
// hooks.ts
export function useFormLocalState(initialValues: InitialValues) {
	const [localField, setLocalField] = useState(initialValues.field)
	return [localField, handlers] as const
}
```

## Styling

All styling uses SCSS modules with Aksel design tokens. Never use `style={{}}` or Tailwind.

```tsx
import styles from './MyComponent.module.scss'
```

```scss
.wrapper {
	padding: var(--a-spacing-4);
	margin-bottom: var(--a-spacing-6);
	color: var(--a-text-subtle);
	border: 1px solid var(--a-border-default);
	border-radius: var(--a-border-radius-medium);
}
```

## Forms

### `onSubmit` validation — clear errors on success, log on failure

This pattern is easy to get wrong. Always use `FormData`, validate before dispatching, and log failures:

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

### Error display — pass error string to Aksel component `error` prop

```tsx
<RadioGroup error={validationError} onChange={() => setValidationError('')}>
	<Radio value="ja">{intl.formatMessage({ id: 'label.ja' })}</Radio>
	<Radio value="nei">{intl.formatMessage({ id: 'label.nei' })}</Radio>
</RadioGroup>
```

## Internationalization

All user-facing text must use react-intl — never hardcode Norwegian strings.

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

Rich text helpers: `getFormatMessageValues` from `src/utils/translations.tsx`.

## State (Redux / RTK Query)

### RTK Query — use auto-generated hooks with `skip` for conditional fetching

```tsx
const { data, isFetching, isError } = useGetLoependeVedtakQuery()
const { data: avtaler } = usePensjonsavtalerQuery(body, { skip: !body })
```

### Redux — use typed hooks from `@/state/hooks`

```tsx
const foedselsdato = useAppSelector(selectFoedselsdato)
dispatch(userInputActions.setAfp(value))
```

## Boundaries

### ✅ Always

- Use Aksel DS components from `@navikt/ds-react`
- Use translation keys for all user-facing text (`useIntl` / `<FormattedMessage>`)
- Use SCSS modules with Aksel tokens for styles
- Named exports only, re-exported via `index.ts`
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
