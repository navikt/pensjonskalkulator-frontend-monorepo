# ErrorSummary — `@navikt/ds-react`

ErrorSummary gives users an overview of validation errors in a form that must be fixed before they can continue. Each error message links directly to the corresponding field.

## Import

```tsx
import { ErrorSummary } from '@navikt/ds-react'
```

## Sub-components

| Component           | Element | Description                                    |
| ------------------- | ------- | ---------------------------------------------- |
| `ErrorSummary`      | `<div>` | Root wrapper with heading and list of errors   |
| `ErrorSummary.Item` | `<a>`   | Individual error link pointing to a form field |

## Props

### `ErrorSummary`

| Prop         | Type                  | Default                                             | Description                                     |
| ------------ | --------------------- | --------------------------------------------------- | ----------------------------------------------- |
| `children`   | `ReactNode`           | —                                                   | Collection of `ErrorSummary.Item`               |
| `heading`    | `ReactNode`           | `"Du må rette disse feilene før du kan fortsette:"` | Heading above the error links                   |
| `headingTag` | `ElementType`         | `"h2"`                                              | HTML heading element to render                  |
| `size`       | `"medium" \| "small"` | `"medium"`                                          | Changes padding and font-sizes                  |
| `className`  | `string`              | —                                                   | Additional CSS class                            |
| `ref`        | `Ref<HTMLDivElement>` | —                                                   | Ref to root element (used for focus management) |

### `ErrorSummary.Item`

| Prop        | Type                     | Default | Description                              |
| ----------- | ------------------------ | ------- | ---------------------------------------- |
| `children`  | `ReactNode`              | —       | Error message link text                  |
| `href`      | `string`                 | —       | Anchor link to the field (e.g. `#email`) |
| `className` | `string`                 | —       | Additional CSS class                     |
| `ref`       | `Ref<HTMLAnchorElement>` | —       | Ref to anchor element                    |

## Usage Examples

### Basic

```tsx
<ErrorSummary heading="Du må rette disse feilene før du kan fortsette:">
	<ErrorSummary.Item href="#age">Du må fylle ut alder</ErrorSummary.Item>
	<ErrorSummary.Item href="#email">E-postadressen er ugyldig</ErrorSummary.Item>
</ErrorSummary>
```

### With form validation and focus management

```tsx
function MyForm() {
	const errorSummaryRef = useRef<HTMLDivElement>(null)
	const [errors, setErrors] = useState<{ id: string; message: string }[]>([])

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		const newErrors: { id: string; message: string }[] = []

		if (!age) newErrors.push({ id: 'age', message: 'Du må fylle ut alder' })
		if (!email)
			newErrors.push({ id: 'email', message: 'E-postadressen er ugyldig' })

		setErrors(newErrors)
	}

	useEffect(() => {
		if (errors.length > 0) {
			errorSummaryRef.current?.focus()
		}
	}, [errors])

	return (
		<form onSubmit={handleSubmit}>
			{errors.length > 0 && (
				<ErrorSummary ref={errorSummaryRef}>
					{errors.map((error) => (
						<ErrorSummary.Item key={error.id} href={`#${error.id}`}>
							{error.message}
						</ErrorSummary.Item>
					))}
				</ErrorSummary>
			)}

			<TextField
				id="age"
				label="Alder"
				error={errors.find((e) => e.id === 'age')?.message}
			/>
			<TextField
				id="email"
				label="E-post"
				error={errors.find((e) => e.id === 'email')?.message}
			/>
			<Button type="submit">Send inn</Button>
		</form>
	)
}
```

### Small size with custom heading tag

```tsx
<ErrorSummary
	size="small"
	headingTag="h3"
	heading="Rett feilene for å gå videre:"
>
	<ErrorSummary.Item href="#name">Navn er påkrevd</ErrorSummary.Item>
</ErrorSummary>
```

### Dynamic errors from validation schema

```tsx
{
	validationErrors.length > 0 && (
		<ErrorSummary ref={errorSummaryRef}>
			{validationErrors.map(({ field, message }) => (
				<ErrorSummary.Item key={field} href={`#${field}`}>
					{message}
				</ErrorSummary.Item>
			))}
		</ErrorSummary>
	)
}
```

## Accessibility

- **Focus management**: Move focus to `ErrorSummary` every time the user submits and errors are present. Use `ref` and call `ref.current.focus()` in a `useEffect`. This scrolls the component into view and causes screen readers to read the heading.
- The heading (`h2` by default) provides a semantic landmark. Adjust `headingTag` to match the surrounding heading hierarchy.
- Each `ErrorSummary.Item` renders an anchor (`<a>`) that links to the field's `id`. Clicking an item sets focus on the corresponding form field.
- For single-field forms, skip `ErrorSummary` and focus the field directly instead.

## Do's and Don'ts

### ✅ Do

- Show `ErrorSummary` only after the user attempts to submit or proceed — not before.
- Move focus to `ErrorSummary` each time the user tries to submit and errors exist.
- Use error messages that match the inline error text on each field exactly.
- Link each error to its field using `href="#fieldId"` matching the field's `id` attribute.
- Place the component directly above the submit/next button.
- List **all** errors that prevent the user from continuing.
- Keep `ErrorSummary` in sync with inline errors if validating on the fly.

### 🚫 Don't

- Don't show `ErrorSummary` before the user has attempted to submit.
- Don't use `ErrorSummary` for a single-field form — focus the field directly instead.
- Don't use different wording in `ErrorSummary.Item` vs. the inline field error.
- Don't forget to set `id` on form fields — without it, the `href` links won't work.
- Don't place `ErrorSummary` far from the submit button — it should be visually close to the action that triggered validation.
- Don't use `ErrorSummary` for success messages or informational notices — use `Alert` instead.

## See Also

- [`Alert`](alert.md) — for feedback messages (success, warning, info, error)
- [`TextField`](textfield.md) — form field with built-in `error` prop for inline validation
