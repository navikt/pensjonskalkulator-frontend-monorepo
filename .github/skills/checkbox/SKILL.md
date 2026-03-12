# Checkbox — `@navikt/ds-react`

Checkbox lets users select one or more options from a list. Users can click again to deselect. Use `CheckboxGroup` to group related checkboxes with a shared legend and validation.

## Import

```tsx
import { Checkbox, CheckboxGroup } from '@navikt/ds-react'
```

## Sub-components

| Component       | Element      | Description                                          |
| --------------- | ------------ | ---------------------------------------------------- |
| `CheckboxGroup` | `<fieldset>` | Groups checkboxes with legend, validation, and state |
| `Checkbox`      | `<input>`    | Individual checkbox input with label                 |

## When to Use

- Selecting **multiple** options from a list
- Binary yes/no choices (single standalone checkbox)
- Opt-in/consent confirmations

**When NOT to use:**

- Mutually exclusive options → use [`Radio`](/komponenter/core/radio)
- Very many options → use [`Combobox`](/komponenter/core/combobox)
- Single on/off toggle → consider `Switch` (if available) or a single `Checkbox`

## Props

### `CheckboxGroup`

| Prop           | Type                       | Default        | Description                                          |
| -------------- | -------------------------- | -------------- | ---------------------------------------------------- |
| `legend`       | `ReactNode`                | **(required)** | Fieldset legend                                      |
| `children`     | `ReactNode`                | —              | Collection of `<Checkbox />` elements                |
| `value`        | `any[]`                    | —              | Controlled state for checked checkboxes              |
| `defaultValue` | `any[]`                    | —              | Default checked checkboxes (uncontrolled)            |
| `onChange`     | `(value: any[]) => void`   | `() => {}`     | Returns current checked values in group              |
| `error`        | `ReactNode`                | —              | Error message displayed below group                  |
| `errorId`      | `string`                   | —              | Override internal error ID                           |
| `description`  | `ReactNode`                | —              | Description text extending the legend                |
| `hideLegend`   | `boolean`                  | `false`        | Visually hides legend (still read by screen readers) |
| `size`         | `"medium" \| "small"`      | `"medium"`     | Changes font-size, padding, and gaps                 |
| `disabled`     | `boolean`                  | `false`        | **Avoid for accessibility.** Disables all checkboxes |
| `readOnly`     | `boolean`                  | `false`        | Read-only state                                      |
| `id`           | `string`                   | —              | Override internal ID                                 |
| `className`    | `string`                   | —              | Additional CSS class                                 |
| `ref`          | `Ref<HTMLFieldSetElement>` | —              | Ref to fieldset element                              |

### `Checkbox`

| Prop            | Type                    | Default | Description                                         |
| --------------- | ----------------------- | ------- | --------------------------------------------------- |
| `children`      | `ReactNode`             | —       | Checkbox label                                      |
| `value`         | `any`                   | —       | Checkbox value (used by `CheckboxGroup`)            |
| `error`         | `boolean`               | `false` | Adds error indication on the checkbox               |
| `errorId`       | `string`                | —       | ID for the associated error                         |
| `description`   | `string`                | —       | Description text extending the label                |
| `hideLabel`     | `boolean`               | `false` | Visually hides label (still read by screen readers) |
| `indeterminate` | `boolean`               | `false` | Shows indeterminate (minus) state                   |
| `size`          | `"medium" \| "small"`   | —       | Changes font-size, padding, and gaps                |
| `disabled`      | `boolean`               | `false` | **Avoid for accessibility.** Disables the checkbox  |
| `readOnly`      | `boolean`               | `false` | Read-only state                                     |
| `id`            | `string`                | —       | Override internal ID                                |
| `className`     | `string`                | —       | Additional CSS class                                |
| `ref`           | `Ref<HTMLInputElement>` | —       | Ref to input element                                |

## Usage Examples

### Basic Group (Uncontrolled)

```tsx
<CheckboxGroup legend="Hvilke ytelser mottar du?" defaultValue={[]}>
	<Checkbox value="uforetrygd">Uføretrygd</Checkbox>
	<Checkbox value="alderspensjon">Alderspensjon</Checkbox>
	<Checkbox value="afp">AFP</Checkbox>
</CheckboxGroup>
```

### Controlled Group

```tsx
function VelgYtelser() {
	const [valgte, setValgte] = useState<string[]>([])

	return (
		<CheckboxGroup
			legend="Hvilke ytelser mottar du?"
			value={valgte}
			onChange={setValgte}
		>
			<Checkbox value="uforetrygd">Uføretrygd</Checkbox>
			<Checkbox value="alderspensjon">Alderspensjon</Checkbox>
			<Checkbox value="afp">AFP</Checkbox>
		</CheckboxGroup>
	)
}
```

### With Validation Error

```tsx
function SkjemaCheckbox() {
	const intl = useIntl()
	const [valgte, setValgte] = useState<string[]>([])
	const [validationError, setValidationError] = useState<string>('')

	const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (valgte.length === 0) {
			setValidationError(intl.formatMessage({ id: 'validation.velg.minst.en' }))
			return
		}
		setValidationError('')
		// proceed
	}

	return (
		<form onSubmit={onSubmit}>
			<CheckboxGroup
				legend={intl.formatMessage({ id: 'skjema.ytelser.legend' })}
				value={valgte}
				onChange={(v) => {
					setValgte(v)
					setValidationError('')
				}}
				error={validationError}
			>
				<Checkbox value="uforetrygd">
					{intl.formatMessage({ id: 'ytelse.uforetrygd' })}
				</Checkbox>
				<Checkbox value="alderspensjon">
					{intl.formatMessage({ id: 'ytelse.alderspensjon' })}
				</Checkbox>
			</CheckboxGroup>
		</form>
	)
}
```

### Single Standalone Checkbox

```tsx
function Samtykke() {
	const [godkjent, setGodkjent] = useState(false)

	return (
		<Checkbox
			checked={godkjent}
			onChange={(e) => setGodkjent(e.target.checked)}
		>
			Jeg samtykker til behandling av personopplysninger
		</Checkbox>
	)
}
```

### With Descriptions

```tsx
<CheckboxGroup legend="Velg pensjonsavtaler">
	<Checkbox
		value="otp"
		description="Obligatorisk tjenestepensjon fra arbeidsgiver"
	>
		OTP
	</Checkbox>
	<Checkbox value="ips" description="Individuell pensjonssparing">
		IPS
	</Checkbox>
</CheckboxGroup>
```

### Indeterminate (Select All)

```tsx
function SelectAll() {
	const options = ['uforetrygd', 'alderspensjon', 'afp']
	const [valgte, setValgte] = useState<string[]>([])

	const allSelected = valgte.length === options.length
	const someSelected = valgte.length > 0 && !allSelected

	return (
		<>
			<Checkbox
				checked={allSelected}
				indeterminate={someSelected}
				onChange={() => setValgte(allSelected ? [] : [...options])}
			>
				Velg alle
			</Checkbox>
			<CheckboxGroup
				legend="Ytelser"
				hideLegend
				value={valgte}
				onChange={setValgte}
			>
				{options.map((o) => (
					<Checkbox key={o} value={o}>
						{o}
					</Checkbox>
				))}
			</CheckboxGroup>
		</>
	)
}
```

### Small Size

```tsx
<CheckboxGroup legend="Filter" size="small">
	<Checkbox value="aktiv">Aktiv</Checkbox>
	<Checkbox value="inaktiv">Inaktiv</Checkbox>
</CheckboxGroup>
```

## Accessibility

- **Always provide a legend:** `CheckboxGroup` must have a `legend`. Use `hideLegend` only when context is clear (e.g., table column headers). The hidden legend is still read by screen readers.
- **Always provide a label:** `Checkbox` must have `children` as label text. Use `hideLabel` only in table contexts. The hidden label must still be meaningful.
- **Avoid `disabled`:** [Nav recommends against disabled states](https://aksel.nav.no/god-praksis/artikler/deaktiverte-tilstander). Use `readOnly` or conditionally render the field instead.
- **Keyboard interaction:** Implements standard [HTML checkbox input](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/checkbox). Space toggles, Tab navigates.
- **Error indication:** When `error` is set on `CheckboxGroup`, `aria-invalid` and `aria-describedby` are automatically applied.

## Do's and Don'ts

### ✅ Do

- Use `CheckboxGroup` to wrap related checkboxes with a shared legend.
- Use controlled state (`value` + `onChange`) for form validation and submission.
- Stack checkboxes **vertically** — it's easier to scan than horizontal layout.
- Sort options alphabetically or by relevance.
- Clear validation errors on selection change.
- Use `react-intl` for all user-facing text (labels, legends, errors).
- Use `readOnly` instead of `disabled` when the value should be visible but not editable.

### 🚫 Don't

- Don't use Checkbox for **mutually exclusive** choices — use `Radio` instead.
- Don't use Checkbox for **very many options** — use `Combobox` instead.
- Don't lay out checkboxes **horizontally** — it's hard to read and problematic for zoomed views.
- Don't use `disabled` state if it can be avoided.
- Don't hide the legend without ensuring screen readers still have meaningful context.
- Don't hardcode Norwegian text — use `intl.formatMessage()`.
- Don't use `error` on individual `Checkbox` when inside a `CheckboxGroup` — set `error` on the group instead.

## Common Patterns in This Codebase

### Form step with validation

```tsx
import { useState } from 'react'
import { useIntl } from 'react-intl'

import { Checkbox, CheckboxGroup } from '@navikt/ds-react'

import { logger } from '@/utils/logging'

interface Props {
	onNext: (valgte: string[]) => void
}

export function MittSkjemaSteg({ onNext }: Props) {
	const intl = useIntl()
	const [valgte, setValgte] = useState<string[]>([])
	const [validationError, setValidationError] = useState<string>('')

	const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (valgte.length === 0) {
			setValidationError(intl.formatMessage({ id: 'validation.velg.minst.en' }))
			logger('skjemavalidering feilet', { skjemanavn: 'mitt-skjema' })
			return
		}
		setValidationError('')
		logger('checkboxgroup valgt', { valg: valgte.join(', ') })
		onNext(valgte)
	}

	return (
		<form onSubmit={onSubmit}>
			<CheckboxGroup
				legend={intl.formatMessage({ id: 'skjema.legend' })}
				value={valgte}
				onChange={(v) => {
					setValgte(v)
					setValidationError('')
				}}
				error={validationError}
			>
				<Checkbox value="a">
					{intl.formatMessage({ id: 'skjema.valg.a' })}
				</Checkbox>
				<Checkbox value="b">
					{intl.formatMessage({ id: 'skjema.valg.b' })}
				</Checkbox>
			</CheckboxGroup>
		</form>
	)
}
```

### SCSS styling

```scss
@use '../../../scss/variables';

.checkboxGroup {
	margin-block: var(--a-spacing-4);

	:global(.navds-checkbox-group) {
		width: variables.$input-width-m;
	}
}
```
