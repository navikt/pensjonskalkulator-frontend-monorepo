# Textarea — `@navikt/ds-react`

Textarea is a multi-line text input for situations where the user needs to enter longer or free-form text of unknown length.

## Import

```tsx
import { Textarea } from '@navikt/ds-react'
```

## Props

| Prop                   | Type                                    | Default    | Description                                                                                              |
| ---------------------- | --------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------- |
| `label`                | `ReactNode`                             | —          | **Required.** Label for the textarea                                                                     |
| `description`          | `ReactNode`                             | —          | Additional description below the label                                                                   |
| `error`                | `ReactNode`                             | —          | Error message displayed below the field                                                                  |
| `errorId`              | `string`                                | —          | Override internal error element id                                                                       |
| `size`                 | `"medium" \| "small"`                   | `"medium"` | Changes font-size, padding, and gaps                                                                     |
| `maxLength`            | `number`                                | —          | Shows a character counter. **Visual only** — you must still validate the limit yourself                  |
| `minRows`              | `number`                                | —          | Minimum number of visible rows when empty                                                                |
| `maxRows`              | `number`                                | —          | Maximum number of visible rows before scrolling                                                          |
| `resize`               | `boolean \| "vertical" \| "horizontal"` | —          | Enables user resizing of the field                                                                       |
| `hideLabel`            | `boolean`                               | `false`    | Visually hides the label while keeping it accessible to screen readers                                   |
| `value`                | `string`                                | —          | Controlled value                                                                                         |
| `defaultValue`         | `string`                                | —          | Uncontrolled default value                                                                               |
| `readOnly`             | `boolean`                               | —          | Read-only state                                                                                          |
| `disabled`             | `boolean`                               | —          | Disables the element. **Avoid for accessibility** — prefer `readOnly` or omitting the field              |
| `id`                   | `string`                                | —          | Override internal id                                                                                     |
| `className`            | `string`                                | —          | Additional CSS class                                                                                     |
| `ref`                  | `Ref<HTMLTextAreaElement>`              | —          | Ref to the underlying `<textarea>` element                                                               |
| `UNSAFE_autoScrollbar` | `boolean`                               | —          | Stops growing and shows scrollbar when out of room. Requires `display:flex` on parent. **Experimental.** |

## Usage Examples

### Basic

```tsx
<Textarea label="Har du noen tilbakemeldinger?" />
```

### With description

```tsx
<Textarea
	label="Beskriv situasjonen"
	description="Gi oss en kort beskrivelse av hva som skjedde."
/>
```

### With error message

```tsx
<Textarea label="Kommentar" error="Du må fylle ut dette feltet." />
```

### With character counter

```tsx
<Textarea label="Melding" maxLength={500} description="Maks 500 tegn." />
```

### Controlled

```tsx
function ControlledTextarea() {
	const [value, setValue] = useState('')

	return (
		<Textarea
			label="Din melding"
			value={value}
			onChange={(e) => setValue(e.target.value)}
			maxLength={300}
		/>
	)
}
```

### Small size

```tsx
<Textarea label="Kort kommentar" size="small" />
```

### With hidden label (e.g. inside a table)

```tsx
<Textarea label="Kommentar for rad 1" hideLabel />
```

### With resize enabled

```tsx
<Textarea label="Fritekst" resize="vertical" minRows={4} />
```

### Read-only

```tsx
<Textarea label="Notat" value="Denne teksten kan ikke endres." readOnly />
```

## Accessibility

- **Always provide a `label`**, even when using `hideLabel`. The label is read by screen readers regardless of visibility.
- When using `hideLabel` (e.g., in tables), ensure the label text is meaningful and descriptive.
- **Avoid `disabled`** — screen readers may skip disabled fields entirely. Prefer `readOnly` or simply displaying the value as plain text.
- The `maxLength` character counter is announced to assistive technologies via `aria-describedby`.

## Do's and Don'ts

### ✅ Do

- Use Textarea for **multi-line, free-form text** of unknown length.
- Always provide a descriptive `label`.
- Use `description` to give users additional guidance on what to enter.
- Use `maxLength` to show a visual character counter when there is a limit.
- Validate character limits server-side — `maxLength` is only a visual indicator.
- Use `readOnly` instead of `disabled` when displaying non-editable text.
- Set an appropriate field width (50–75 characters / 20–35em) for readability.

### 🚫 Don't

- Don't use Textarea for **short, structured input** (name, date, number) — use `TextField` instead.
- Don't use **placeholder text** — it disappears on focus and fails WCAG contrast requirements when dark enough to be visible.
- Don't rely solely on `maxLength` for validation — it is a visual hint, not an enforced limit.
- Don't use `disabled` state if it can be avoided — it harms accessibility.
- Don't omit the `label` prop — it is required for accessibility even if hidden visually.

## Common Patterns

### Form with validation

```tsx
function FeedbackForm() {
	const [feedback, setFeedback] = useState('')
	const [error, setError] = useState<string | undefined>()

	const handleSubmit = () => {
		if (!feedback.trim()) {
			setError('Du må skrive en tilbakemelding.')
			return
		}
		if (feedback.length > 500) {
			setError('Tilbakemeldingen kan ikke være lengre enn 500 tegn.')
			return
		}
		setError(undefined)
		// submit logic
	}

	return (
		<Textarea
			label="Tilbakemelding"
			description="Fortell oss hva du synes."
			value={feedback}
			onChange={(e) => setFeedback(e.target.value)}
			maxLength={500}
			error={error}
		/>
	)
}
```
