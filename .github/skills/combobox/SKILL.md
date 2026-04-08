# Combobox (UNSAFE_Combobox)

Component from `@navikt/ds-react` that combines a text input with a dropdown list. Lets users type to filter or select from a list of options.

> **Beta / UNSAFE prefix:** This component is prefixed with `UNSAFE_` — breaking changes may occur in minor versions. Evaluate before using in production.

## Import

```tsx
import { UNSAFE_Combobox } from '@navikt/ds-react'
```

## When to Use

- Selecting from a large list of options (7+ items)
- Standardized value entry (e.g. country names)
- Single or multi-select scenarios
- Searching/filtering large datasets

**When NOT to use:**

- Fewer than 7 options → use `Radio`, `Checkbox`, or `Select`
- Simple single select without many options → use `Select`
- Free-text input without predefined options → use `TextField`

## Props

| Prop                        | Type                                                                     | Default        | Description                                          |
| --------------------------- | ------------------------------------------------------------------------ | -------------- | ---------------------------------------------------- |
| `label`                     | `ReactNode`                                                              | **(required)** | Combobox label                                       |
| `options`                   | `string[]`                                                               | **(required)** | List of selectable options                           |
| `selectedOptions`           | `string[] \| ComboboxOption[]`                                           | `[]`           | Controlled list of selected options                  |
| `onToggleSelected`          | `(option: string, isSelected: boolean, isCustomOption: boolean) => void` | —              | Callback when an option is selected/deselected       |
| `isMultiSelect`             | `boolean`                                                                | `false`        | Enable multi-select mode (displays chips)            |
| `allowNewValues`            | `boolean`                                                                | `false`        | Allow user to add values not in the options list     |
| `isLoading`                 | `boolean`                                                                | `false`        | Show spinner during async operations                 |
| `filteredOptions`           | `string[] \| ComboboxOption[]`                                           | —              | Override internal filtering (for server-side search) |
| `shouldAutocomplete`        | `boolean`                                                                | `false`        | Enable inline text autocomplete                      |
| `shouldShowSelectedOptions` | `boolean`                                                                | `true`         | Show selected options as chips before input          |
| `maxSelected`               | `number \| { limit: number }`                                            | —              | Maximum number of selections                         |
| `isListOpen`                | `boolean`                                                                | —              | Controlled open/closed state for dropdown            |
| `toggleListButton`          | `boolean`                                                                | `true`         | Show the expand/collapse toggle button               |
| `defaultValue`              | `string`                                                                 | —              | Initial input value (uncontrolled)                   |
| `readOnly`                  | `boolean`                                                                | `false`        | Read-only state                                      |
| `hideLabel`                 | `boolean`                                                                | `false`        | Visually hide the label                              |
| `error`                     | `ReactNode`                                                              | —              | Error message                                        |
| `description`               | `ReactNode`                                                              | —              | Description text below label                         |
| `id`                        | `string`                                                                 | —              | Override internal ID                                 |
| `className`                 | `string`                                                                 | —              | CSS class for wrapper                                |
| `inputClassName`            | `string`                                                                 | —              | CSS class for the input field                        |
| `ref`                       | `Ref<HTMLInputElement>`                                                  | —              | Ref to the input element                             |

## Usage Examples

### Single Select

```tsx
import { useState } from 'react'

import { UNSAFE_Combobox } from '@navikt/ds-react'

function LandVelger() {
	const [valgtLand, setValgtLand] = useState<string[]>([])
	const land = ['Norge', 'Sverige', 'Danmark', 'Finland', 'Island']

	return (
		<UNSAFE_Combobox
			label="Velg land"
			options={land}
			selectedOptions={valgtLand}
			onToggleSelected={(option, isSelected) => {
				setValgtLand(isSelected ? [option] : [])
			}}
		/>
	)
}
```

### Multi Select

```tsx
import { useState } from 'react'

import { UNSAFE_Combobox } from '@navikt/ds-react'

function SpraakVelger() {
	const [valgte, setValgte] = useState<string[]>([])
	const spraak = [
		'Norsk',
		'Engelsk',
		'Svensk',
		'Dansk',
		'Tysk',
		'Fransk',
		'Spansk',
	]

	return (
		<UNSAFE_Combobox
			label="Velg språk"
			options={spraak}
			selectedOptions={valgte}
			isMultiSelect
			onToggleSelected={(option, isSelected) => {
				setValgte((prev) =>
					isSelected ? [...prev, option] : prev.filter((o) => o !== option)
				)
			}}
		/>
	)
}
```

### Multi Select with Max Selections

```tsx
<UNSAFE_Combobox
	label="Velg inntil 3 kategorier"
	options={kategorier}
	selectedOptions={valgte}
	isMultiSelect
	maxSelected={3}
	onToggleSelected={(option, isSelected) => {
		setValgte((prev) =>
			isSelected ? [...prev, option] : prev.filter((o) => o !== option)
		)
	}}
/>
```

### Allow New Values

```tsx
<UNSAFE_Combobox
	label="Velg eller legg til kompetanse"
	options={['React', 'TypeScript', 'Node.js']}
	selectedOptions={valgte}
	isMultiSelect
	allowNewValues
	onToggleSelected={(option, isSelected, isCustomOption) => {
		if (isSelected) {
			setValgte((prev) => [...prev, option])
		} else {
			setValgte((prev) => prev.filter((o) => o !== option))
		}
	}}
/>
```

### Custom Filtering (Server-Side / Async)

```tsx
import { useState } from 'react'

import { UNSAFE_Combobox } from '@navikt/ds-react'

function AsyncSearch() {
	const [valgte, setValgte] = useState<string[]>([])
	const [filteredOptions, setFilteredOptions] = useState<string[]>([])
	const [isLoading, setIsLoading] = useState(false)

	const handleSearchChange = async (searchTerm: string) => {
		if (searchTerm.length < 2) {
			setFilteredOptions([])
			return
		}
		setIsLoading(true)
		try {
			const results = await fetchOptions(searchTerm)
			setFilteredOptions(results)
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<UNSAFE_Combobox
			label="Søk etter person"
			options={filteredOptions}
			filteredOptions={filteredOptions}
			selectedOptions={valgte}
			isLoading={isLoading}
			onToggleSelected={(option, isSelected) => {
				setValgte(isSelected ? [option] : [])
			}}
			onChange={handleSearchChange}
		/>
	)
}
```

### Showing Selections Externally (Filter Pattern)

```tsx
import { useState } from 'react'

import { Chips, UNSAFE_Combobox } from '@navikt/ds-react'

function FilterCombobox() {
	const [valgte, setValgte] = useState<string[]>([])
	const alternativer = ['Aktiv', 'Inaktiv', 'Under behandling', 'Avsluttet']

	return (
		<>
			<UNSAFE_Combobox
				label="Filtrer på status"
				options={alternativer}
				selectedOptions={valgte}
				isMultiSelect
				shouldShowSelectedOptions={false}
				onToggleSelected={(option, isSelected) => {
					setValgte((prev) =>
						isSelected ? [...prev, option] : prev.filter((o) => o !== option)
					)
				}}
			/>
			<Chips>
				{valgte.map((v) => (
					<Chips.Removable
						key={v}
						onClick={() => setValgte((prev) => prev.filter((o) => o !== v))}
					>
						{v}
					</Chips.Removable>
				))}
			</Chips>
		</>
	)
}
```

### With Validation Error

```tsx
const intl = useIntl()

<UNSAFE_Combobox
  label={intl.formatMessage({ id: 'skjema.land.label' })}
  options={land}
  selectedOptions={valgtLand}
  error={validationError}
  description={intl.formatMessage({ id: 'skjema.land.description' })}
  onToggleSelected={(option, isSelected) => {
    setValidationError('')
    setValgtLand(isSelected ? [option] : [])
  }}
/>
```

## Accessibility

- Follows [WAI-ARIA Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
- Input uses `role="combobox"` with `aria-autocomplete="list"` and `aria-controls`
- Uses `type="text"` (not `type="search"`) for better screen reader/braille display compatibility
- Virtual focus for dropdown navigation — only the input receives tab focus
- Expand/collapse and clear actions available via keyboard (arrow keys and Escape)
- Multi-select chips are focusable for keyboard removal
- `isLoading` announces loading state to screen readers

### Keyboard Interaction

| Key       | Action                                         |
| --------- | ---------------------------------------------- |
| `↓` / `↑` | Navigate options in dropdown                   |
| `Enter`   | Select focused option                          |
| `Escape`  | Close dropdown / clear input                   |
| `←` / `→` | Navigate between selected chips (multi-select) |

### Known Issues

- **VoiceOver + Safari:** Options were not read aloud when navigating with arrow keys. Fixed in macOS 15 Sequoia.

## Integration with This Repo

When using in pensjonskalkulator, follow these patterns:

```tsx
import { useState } from 'react'
import { useIntl } from 'react-intl'

import { UNSAFE_Combobox } from '@navikt/ds-react'

// All labels and descriptions via react-intl
const intl = useIntl()

<UNSAFE_Combobox
  label={intl.formatMessage({ id: 'my.component.label' })}
  description={intl.formatMessage({ id: 'my.component.description' })}
  error={validationError}
  options={options}
  selectedOptions={selected}
  onToggleSelected={handleToggle}
/>
```

Style overrides use SCSS modules with Aksel tokens:

```scss
@use '../../../scss/variables';

.combobox {
	margin-top: var(--a-spacing-4);

	:global(.navds-combobox__wrapper) {
		width: variables.$input-width-m;
	}
}
```

## Do's and Don'ts

### ✅ Do

- Provide predefined options even when `allowNewValues` is enabled
- Use `isLoading` when fetching async options to give user feedback
- Keep option text short enough to fit dropdown width
- Use `shouldShowSelectedOptions={false}` for filter UIs with external chip display
- Use controlled `selectedOptions` + `onToggleSelected` for predictable state
- Wrap in `react-intl` for all user-facing strings
- Use `error` prop for validation (not standalone `ErrorMessage`)

### 🚫 Don't

- Use for fewer than 7 options — prefer `Radio`, `Checkbox`, or `Select`
- Use without any predefined options when `allowNewValues` is on — use `TextField` instead
- Set `hideLabel` without a very good reason (e.g. search bar in header)
- Forget to clear validation errors on selection change
- Put long text in option items — they wrap and become hard to read
- Use deprecated `clearButton` / `clearButtonLabel` props (no longer functional)
