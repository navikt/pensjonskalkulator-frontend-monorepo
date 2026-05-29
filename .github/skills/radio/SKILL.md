# Radio — `@navikt/ds-react`

Radio lets users select exactly one option from a list. A selection cannot be removed, only replaced by another option.

## Import

```tsx
import { Radio, RadioGroup } from '@navikt/ds-react'
```

## Sub-components

| Component      | Purpose                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| `<RadioGroup>` | Wrapper — renders a `<fieldset>` with `<legend>`. Groups `<Radio>` children and manages selected state. |
| `<Radio>`      | Individual radio option — renders an `<input type="radio">` with a label.                               |

## Props

### RadioGroup

| Prop           | Type                       | Default      | Description                                          |
| -------------- | -------------------------- | ------------ | ---------------------------------------------------- |
| `legend`       | `ReactNode`                | **required** | Fieldset legend — always provide a meaningful label  |
| `children`     | `ReactNode`                | —            | Collection of `<Radio />` elements                   |
| `value`        | `any`                      | —            | Controlled selected value                            |
| `defaultValue` | `any`                      | —            | Default checked radio (uncontrolled)                 |
| `onChange`     | `(value: any) => void`     | `() => {}`   | Called with the value of the newly selected radio    |
| `name`         | `string`                   | —            | Override internal name attribute                     |
| `error`        | `ReactNode`                | —            | Error message displayed below the group              |
| `errorId`      | `string`                   | —            | Override internal error element id                   |
| `description`  | `ReactNode`                | —            | Additional description below the legend              |
| `hideLegend`   | `boolean`                  | `false`      | Visually hides legend (still read by screen readers) |
| `size`         | `"medium" \| "small"`      | `"medium"`   | Changes font-size, padding and gaps                  |
| `required`     | `boolean`                  | —            | Marks the group as required                          |
| `readOnly`     | `boolean`                  | —            | Read-only state                                      |
| `disabled`     | `boolean`                  | —            | Disables all radios (**avoid for accessibility**)    |
| `className`    | `string`                   | —            | Additional CSS class                                 |
| `ref`          | `Ref<HTMLFieldSetElement>` | —            | Ref to the fieldset element                          |

### Radio

| Prop          | Type                    | Default | Description                                       |
| ------------- | ----------------------- | ------- | ------------------------------------------------- |
| `children`    | `ReactNode`             | —       | Radio label text                                  |
| `value`       | `any`                   | —       | Radio value — matched against `RadioGroup.value`  |
| `description` | `string`                | —       | Additional description below the label            |
| `size`        | `"medium" \| "small"`   | —       | Overrides group size                              |
| `disabled`    | `boolean`               | —       | Disables this radio (**avoid for accessibility**) |
| `id`          | `string`                | —       | Override internal id                              |
| `className`   | `string`                | —       | Additional CSS class                              |
| `ref`         | `Ref<HTMLInputElement>` | —       | Ref to the input element                          |

## Usage Examples

### Basic group (uncontrolled)

```tsx
<RadioGroup legend="Velg et alternativ" name="example">
	<Radio value="option1">Alternativ 1</Radio>
	<Radio value="option2">Alternativ 2</Radio>
	<Radio value="option3">Alternativ 3</Radio>
</RadioGroup>
```

### With description

```tsx
<RadioGroup
	legend="Har du bodd utenfor Norge?"
	description="Gjelder opphold over 12 måneder"
>
	<Radio value="ja">Ja</Radio>
	<Radio value="nei">Nei</Radio>
</RadioGroup>
```

### With error validation

```tsx
const [error, setError] = useState<string | undefined>()

<RadioGroup
  legend="Har du AFP?"
  error={error}
  defaultValue={savedValue}
  onChange={() => setError(undefined)}
>
  <Radio value="ja">Ja</Radio>
  <Radio value="nei">Nei</Radio>
  <Radio value="vet_ikke">Vet ikke</Radio>
</RadioGroup>
```

### Controlled

```tsx
const [value, setValue] = useState<string | null>(null)

<RadioGroup
  legend="Har partneren din pensjon?"
  value={value}
  onChange={setValue}
  error={validationError}
>
  <Radio value="ja">Ja</Radio>
  <Radio value="nei">Nei</Radio>
</RadioGroup>
```

### Horizontal layout (use sparingly)

Use `HStack` from `@navikt/ds-react` for horizontal radios. Only for 2 options with very short labels.

```tsx
import { HStack, Radio, RadioGroup } from '@navikt/ds-react'

;<RadioGroup legend="Svar">
	<HStack gap="6">
		<Radio value="ja">Ja</Radio>
		<Radio value="nei">Nei</Radio>
	</HStack>
</RadioGroup>
```

### With defaultValue from existing state

```tsx
<RadioGroup
	legend={<FormattedMessage id="some.label" />}
	name="field-name"
	defaultValue={existingValue}
	onChange={handleChange}
	error={validationError}
>
	<Radio value="ja">
		<FormattedMessage id="radio.ja" />
	</Radio>
	<Radio value="nei">
		<FormattedMessage id="radio.nei" />
	</Radio>
</RadioGroup>
```

### Small size

```tsx
<RadioGroup legend="Velg størrelse" size="small">
	<Radio value="a">Liten</Radio>
	<Radio value="b">Stor</Radio>
</RadioGroup>
```

## Accessibility

- **Always provide a `legend`** — even when visually hidden with `hideLegend`, screen readers still announce it.
- **Keyboard navigation**: Standard HTML radio behavior — Tab into the group, arrow keys to move between options.
- **Avoid `disabled`** — prefer `readOnly` or conditionally rendering the field. See [Nav's guidance on disabled states](https://aksel.nav.no/god-praksis/artikler/deaktiverte-tilstander).
- **`hideLegend`** — only use when the context already provides a visible label (e.g. table column headers).
- The component renders a native `<fieldset>` + `<legend>` + `<input type="radio">` structure.

## Do's and Don'ts

### ✅ Do

- Always wrap `<Radio>` elements inside a `<RadioGroup>`.
- Always provide a meaningful `legend` — it labels the entire group for screen readers.
- List options vertically (default) for easy scanning.
- Include a neutral option like "Vet ikke" or "Ikke relevant" when a user might need to skip.
- Sort options alphabetically unless a more logical order exists.
- Clear validation errors when the user makes a new selection.
- Use `defaultValue` for uncontrolled forms and `value` + `onChange` for controlled forms.

### 🚫 Don't

- Don't use Radio when users can select multiple options — use `CheckboxGroup` instead.
- Don't use Radio with many options (7+) — use `Select` or `Combobox` instead.
- Don't use `disabled` — prefer `readOnly` or removing the field entirely.
- Don't use `description` on `<Radio>` in horizontal layouts.
- Don't use horizontal layout with more than 2 options or long label text.
- Don't mix controlled (`value`) and uncontrolled (`defaultValue`) patterns in the same group.

## Common Patterns in This Codebase

### Yes/No radio with validation (uncontrolled with `defaultValue`)

Used in step-flow forms (`stegvisning`) for binary questions:

```tsx
const [validationError, setValidationError] = useState('')

<RadioGroup
  name="field-name"
  legend={<FormattedMessage id="label.key" />}
  description={<FormattedMessage id="description.key" />}
  defaultValue={savedValue}
  onChange={() => setValidationError('')}
  error={validationError}
>
  <Radio value="ja">
    <FormattedMessage id="radio.ja" />
  </Radio>
  <Radio value="nei">
    <FormattedMessage id="radio.nei" />
  </Radio>
</RadioGroup>
```

### Controlled radio with conditional rendering

Used when selecting a value reveals additional fields:

```tsx
const [value, setValue] = useState<string | null>(initialValue)

<RadioGroup
  legend={intl.formatMessage({ id: 'label.key' })}
  value={value}
  onChange={setValue}
  error={validationError}
>
  <Radio value="ja"><FormattedMessage id="radio.ja" /></Radio>
  <Radio value="nei"><FormattedMessage id="radio.nei" /></Radio>
</RadioGroup>

{value === 'ja' && <AdditionalFields />}
```

### Multi-option radio with alerts

Used in AFP selection where certain choices trigger informational alerts:

```tsx
<RadioGroup
	legend={<FormattedMessage id="afp.label" />}
	defaultValue={afp}
	onChange={handleRadioChange}
	error={validationError}
>
	<Radio value="ja_offentlig">Ja, offentlig</Radio>
	{showWarning && <Alert variant="warning">...</Alert>}
	<Radio value="ja_privat">Ja, privat</Radio>
	<Radio value="nei">Nei</Radio>
	<Radio value="vet_ikke">Vet ikke</Radio>
</RadioGroup>
```

## See Also

- [CheckboxGroup](/komponenter/core/checkbox) — for multi-select form fields
- [Select](/komponenter/core/select) — for single-select with many options
- [Combobox](/komponenter/core/combobox) — for searchable single-select with many options
