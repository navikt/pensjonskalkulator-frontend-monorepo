# TextField — Aksel Design System

> **Package:** `@navikt/ds-react`
> **Documentation:** https://aksel.nav.no/komponenter/core/textfield

TextField is a standard input element for short text or numeric input. It wraps a native `<input>` with consistent labelling, description, error handling, and sizing. The component uses `React.forwardRef` and exposes the underlying `HTMLInputElement`.

---

## Import

```tsx
import { TextField } from '@navikt/ds-react'
```

---

## Key Props

| Prop           | Type                                                                      | Default      | Description                                                    |
| -------------- | ------------------------------------------------------------------------- | ------------ | -------------------------------------------------------------- |
| `label`        | `ReactNode`                                                               | **required** | Input label — always required                                  |
| `description`  | `ReactNode`                                                               | —            | Adds a description to extend the labelling                     |
| `error`        | `ReactNode`                                                               | —            | Error message displayed below the input                        |
| `errorId`      | `string`                                                                  | —            | Override internal errorId                                      |
| `size`         | `"medium" \| "small"`                                                     | `"medium"`   | Changes font-size, padding, and gaps                           |
| `type`         | `"text" \| "number" \| "email" \| "password" \| "tel" \| "url" \| "time"` | `"text"`     | HTML input type — helps users fill in the correct information  |
| `hideLabel`    | `boolean`                                                                 | `false`      | Visually hides the label (still available to screen readers)   |
| `htmlSize`     | `number`                                                                  | —            | Exposes the HTML `size` attribute (visual width in characters) |
| `value`        | `string \| number`                                                        | —            | Controlled value                                               |
| `defaultValue` | `string \| number`                                                        | —            | Uncontrolled initial value                                     |
| `disabled`     | `boolean`                                                                 | —            | Disables the input — **avoid for accessibility**               |
| `readOnly`     | `boolean`                                                                 | —            | Read-only state                                                |
| `id`           | `string`                                                                  | —            | Override internal id                                           |
| `ref`          | `Ref<HTMLInputElement>`                                                   | —            | Ref to the underlying input element                            |

TextField also accepts all standard `InputHTMLAttributes<HTMLInputElement>` (except `size`, which is replaced by `htmlSize`).

---

## Usage Examples

### Basic

```tsx
import { TextField } from '@navikt/ds-react'

function BasicExample() {
	return <TextField label="Fornavn" />
}
```

### With description

```tsx
import { TextField } from '@navikt/ds-react'

function WithDescription() {
	return <TextField label="Fødselsnummer" description="11 siffer" />
}
```

### With error message

```tsx
import { TextField } from '@navikt/ds-react'

function WithError() {
	return (
		<TextField
			label="E-post"
			type="email"
			error="Du må fylle inn en gyldig e-postadresse"
		/>
	)
}
```

### Numeric input (recommended pattern)

Use `type="text"` with `inputMode="numeric"` instead of `type="number"` to avoid native number-input quirks while still getting a numeric keyboard on mobile.

```tsx
import { TextField } from '@navikt/ds-react'

function NumericInput() {
	return (
		<TextField
			label="Din månedslønn før skatt"
			description="Inntekt i norske kroner"
			type="text"
			inputMode="numeric"
		/>
	)
}
```

For decimal values, use `inputMode="decimal"` instead.

### Small size

```tsx
import { TextField } from '@navikt/ds-react'

function SmallTextField() {
	return <TextField label="Postnummer" size="small" htmlSize={4} />
}
```

### Controlled with validation

```tsx
import { useState } from 'react'

import { TextField } from '@navikt/ds-react'

function ControlledExample() {
	const [value, setValue] = useState('')
	const [error, setError] = useState<string | undefined>()

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value
		setValue(newValue)
		setError(newValue.length === 0 ? 'Feltet er påkrevd' : undefined)
	}

	return (
		<TextField
			label="Organisasjonsnummer"
			description="9 siffer"
			type="text"
			inputMode="numeric"
			value={value}
			onChange={handleChange}
			error={error}
		/>
	)
}
```

### Hidden label (e.g., in a table)

```tsx
import { TextField } from '@navikt/ds-react'

function TableCellInput() {
	return <TextField label="Beløp" hideLabel type="text" inputMode="numeric" />
}
```

### Real-world pattern from this project

This project uses controlled TextFields with i18n, refs, and validation error objects:

```tsx
import { useRef, useState } from 'react'
import { useIntl } from 'react-intl'

import { TextField } from '@navikt/ds-react'

function InntektField() {
	const intl = useIntl()
	const inputRef = useRef<HTMLInputElement>(null)
	const [value, setValue] = useState('')
	const [validationError, setValidationError] = useState<string | undefined>()

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setValue(e.target.value.replace(/[^0-9]/g, ''))
		setValidationError(undefined)
	}

	return (
		<TextField
			ref={inputRef}
			type="text"
			inputMode="numeric"
			label={intl.formatMessage({ id: 'inntekt.label' })}
			description={intl.formatMessage({ id: 'inntekt.description' })}
			error={validationError}
			onChange={handleChange}
			value={value}
		/>
	)
}
```

---

## Accessibility

- **Always provide a `label`** — it is required. Use `hideLabel` only when the label is visually redundant (e.g., in table cells where the column header serves as the label). The label is still read by screen readers.
- **Do not use placeholder text as a label** — it disappears when the user types and fails WCAG contrast requirements when made dark enough to read.
- **Avoid `disabled`** — prefer `readOnly` or displaying the value as plain text. Disabled fields are hard to perceive and cannot be focused.
- **Use `autoComplete`** on fields that ask for the user's own personal information. Turn it off for fields about other people (e.g., children, spouse).
- **Match `type` to the data** — use `email`, `tel`, `url`, etc. to get the correct mobile keyboard and browser behavior.
- **Avoid prefix/suffix** — they cause problems with autofill tools, screen readers, and screen magnifiers, and can make the field look pre-filled.

---

## Do's and Don'ts

### ✅ Do

- Use `label` and `description` to clearly explain what the user should enter.
- Adjust the width of the TextField to match expected input length (use `htmlSize` or CSS).
- Use `type="text"` with `inputMode="numeric"` for numeric fields instead of `type="number"`.
- Use `inputMode="decimal"` when decimals are needed.
- Accept flexible user input (e.g., phone numbers with spaces, account numbers with dots).
- Use `autoComplete` for personal data fields.
- Use `error` prop for validation messages — it automatically links the error to the input via `aria-describedby`.
- Use `ref` when you need to programmatically focus the input (e.g., after validation failure).

### 🚫 Don't

- Don't use placeholder text for labelling — it disappears and fails contrast requirements.
- Don't use `type="number"` — it has [well-documented problems](https://stackoverflow.blog/2022/12/26/why-the-number-input-is-the-worst-input/). Use `inputMode="numeric"` instead.
- Don't use the same width for all fields — vary width to signal expected input length.
- Don't use `disabled` unless absolutely necessary — it hurts accessibility.
- Don't use prefix or suffix inside the TextField — it causes issues with assistive technology.
- Don't do overly strict validation — accept input that is understandable even if not perfectly formatted.
- Don't auto-format input in a way that disrupts typing — if formatting, do it on blur or in a non-disruptive way.

---

## Common Patterns & Tips

1. **Numeric currency fields:** Use `type="text"` + `inputMode="numeric"` and strip non-digits in `onChange`. This is the standard pattern in this project for all monetary inputs.
2. **Validation errors with i18n:** Store validation error message IDs in state and resolve them via `intl.formatMessage()` in the `error` prop.
3. **Form binding:** Use the `name` prop for native form submission with `FormData`, or use `form` attribute to link to a parent form by ID.
4. **Conditional error display:** Pass `undefined` (not empty string) to clear the error state: `error={hasError ? message : undefined}`.
5. **Ref for focus management:** Use `ref` to focus the input after validation failure or modal open.
6. **Width control:** Use `htmlSize` for character-based width or `className` with CSS for pixel-based width.
7. **Uncontrolled forms:** Use `defaultValue` and `name` when you don't need real-time state — simpler and avoids unnecessary re-renders.
