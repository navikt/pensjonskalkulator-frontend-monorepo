# Select

Component from `@navikt/ds-react` that renders a native HTML `<select>` dropdown. Lets users pick one option from a list.

## Import

```tsx
import { Select } from '@navikt/ds-react'
```

## When to Use

- Selecting **one** option from a list of many alternatives
- Standardized value entry (e.g. country, civil status, percentage)

**When NOT to use:**

- Few alternatives (≤ 5–7) → use `Radio`
- Multiple selections → use `Combobox` or `Checkbox`
- Searchable / filterable list → use `UNSAFE_Combobox`
- Navigation — using Select to navigate can violate [WCAG 3.2.2 On Input](https://www.w3.org/WAI/WCAG21/Understanding/on-input.html)

## Props

| Prop          | Type                     | Default        | Description                                             |
| ------------- | ------------------------ | -------------- | ------------------------------------------------------- |
| `label`       | `ReactNode`              | **(required)** | Label for the select                                    |
| `children`    | `ReactNode`              | **(required)** | Collection of `<option />` elements                     |
| `description` | `ReactNode`              | —              | Description text below the label                        |
| `error`       | `ReactNode`              | —              | Error message shown below the field                     |
| `errorId`     | `string`                 | —              | Override internal error element ID                      |
| `size`        | `"medium" \| "small"`    | `"medium"`     | Changes font-size, padding and gaps                     |
| `hideLabel`   | `boolean`                | `false`        | Visually hides the label (still read by screen readers) |
| `disabled`    | `boolean`                | `false`        | Disables element (**avoid for a11y**)                   |
| `readOnly`    | `boolean`                | `false`        | Read-only state                                         |
| `id`          | `string`                 | —              | Override internal ID                                    |
| `style`       | `CSSProperties`          | —              | Inline style on select wrapper                          |
| `className`   | `string`                 | —              | CSS class on wrapper                                    |
| `ref`         | `Ref<HTMLSelectElement>` | —              | Ref to the underlying `<select>` element                |

All standard `<select>` HTML attributes (`value`, `defaultValue`, `onChange`, `name`, `form`, `aria-*`, `data-*`, etc.) are also accepted.

## Usage Examples

### Basic

```tsx
import { Select } from '@navikt/ds-react'

function EksempelSelect() {
	return (
		<Select label="Velg land">
			<option value="">Velg …</option>
			<option value="NO">Norge</option>
			<option value="SE">Sverige</option>
			<option value="DK">Danmark</option>
		</Select>
	)
}
```

### Controlled

```tsx
import { useState } from 'react'

import { Select } from '@navikt/ds-react'

function KontrollertSelect() {
	const [verdi, setVerdi] = useState('')

	return (
		<Select
			label="Velg sivilstand"
			value={verdi}
			onChange={(e) => setVerdi(e.target.value)}
		>
			<option disabled value="">
				Velg …
			</option>
			<option value="UGIFT">Ugift</option>
			<option value="GIFT">Gift</option>
			<option value="SAMBOER">Samboer</option>
		</Select>
	)
}
```

### With Description

```tsx
<Select
	label="Velg sivilstand"
	description="Vi trenger dette for å beregne pensjonen din"
	value={sivilstand}
	onChange={(e) => setSivilstand(e.target.value)}
>
	<option disabled value="" />
	{sivilstandOptions.map((option) => (
		<option key={option} value={option}>
			{option}
		</option>
	))}
</Select>
```

### With Error

```tsx
<Select
	label="Velg land"
	error={validationError ? 'Du må velge et land' : undefined}
	value={land}
	onChange={(e) => {
		setLand(e.target.value)
		setValidationError('')
	}}
>
	<option disabled value="">
		Velg …
	</option>
	{landListe.map((l) => (
		<option key={l.kode} value={l.kode}>
			{l.navn}
		</option>
	))}
</Select>
```

### Small Size

```tsx
<Select
	label="År"
	size="small"
	value={aar}
	onChange={(e) => setAar(e.target.value)}
>
	<option disabled value="" />
	{years.map((y) => (
		<option key={y} value={y}>
			{y}
		</option>
	))}
</Select>
```

### Hidden Label (e.g. in a Table)

```tsx
<Select label="Velg måned" hideLabel value={maaned} onChange={handleChange}>
	<option disabled value="" />
	{maaneder.map((m) => (
		<option key={m.value} value={m.value}>
			{m.label}
		</option>
	))}
</Select>
```

### Dynamic Options with Disabled Placeholder

```tsx
<Select
	label={intl.formatMessage({ id: 'skjema.land.label' })}
	value={valgtLand}
	onChange={handleLandChange}
	error={
		validationErrors.land
			? intl.formatMessage({ id: validationErrors.land })
			: ''
	}
>
	<option disabled value="">
		{' '}
	</option>
	{landListeData.map((land) => (
		<option key={land.landkode} value={land.landkode}>
			{getTranslatedLand(land, locale)}
		</option>
	))}
</Select>
```

### Auto-Width Based on Options

```tsx
<Select
	label="Stillingsprosent"
	style={{ width: 'auto' }}
	value={prosent}
	onChange={(e) => setProsent(e.target.value)}
>
	{[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((p) => (
		<option key={p} value={p}>
			{`${p} %`}
		</option>
	))}
</Select>
```

## Accessibility

- **Always provide a `label`** — even when using `hideLabel`, the label text must be meaningful because screen readers still read it.
- **Do NOT use for navigation** — changing a select should not cause a context change (WCAG 3.2.2).
- **Avoid `disabled`** — prefer `readOnly`, displaying information as text, or not rendering the field at all. See [Nav guidance on disabled states](https://aksel.nav.no/god-praksis/artikler/deaktiverte-tilstander).
- The native `<select>` element is used, so keyboard interaction and screen reader support come from the browser/OS.
- Use `aria-invalid` when there is a validation error for explicit invalid state signaling.

## Integration with This Repo

When using in pensjonskalkulator, follow these patterns:

```tsx
import { useState } from 'react'
import { useIntl } from 'react-intl'

import { Select } from '@navikt/ds-react'

// All labels and descriptions via react-intl
const intl = useIntl()

<Select
  label={intl.formatMessage({ id: 'my.component.label' })}
  description={intl.formatMessage({ id: 'my.component.description' })}
  error={
    validationError
      ? intl.formatMessage({ id: validationError })
      : ''
  }
  value={value}
  onChange={(e) => setValue(e.target.value)}
>
  <option disabled value="">
    {' '}
  </option>
  {options.map((opt) => (
    <option key={opt.value} value={opt.value}>
      {intl.formatMessage({ id: opt.labelId })}
    </option>
  ))}
</Select>
```

Style overrides use SCSS modules with Aksel tokens:

```scss
@use '../../../scss/variables';

.select {
	margin-top: var(--a-spacing-4);
	width: variables.$input-width-m;
}
```

## Do's and Don'ts

### ✅ Do

- Always include a `label` — use `hideLabel` only when context is obvious (e.g. table columns)
- Use a disabled empty `<option>` as placeholder so the user is forced to make an active choice
- Use `style={{ width: "auto" }}` to size the field to its content when options are static
- Use controlled `value` + `onChange` for predictable state management
- Wrap user-facing strings in `react-intl` (`intl.formatMessage`)
- Clear validation errors when the user changes their selection
- Use `error` prop for validation messages (not a standalone `ErrorMessage`)
- Use `readOnly` instead of `disabled` when the value should be visible but not editable

### 🚫 Don't

- Use Select for navigation — it may violate WCAG 3.2.2
- Use `disabled` state without strong justification — it hurts accessibility
- Set `hideLabel` without ensuring the label text is still meaningful for screen readers
- Use Select when there are only a few options — prefer `Radio` instead
- Forget to handle the empty/placeholder option in validation logic
- Put very long text in option items — they get cut off in native dropdowns
