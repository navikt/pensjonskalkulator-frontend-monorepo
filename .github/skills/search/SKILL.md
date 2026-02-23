# Search

Component from `@navikt/ds-react` that provides a search input field with or without an accompanying search button. Used for free-text search across NAV applications.

> **Status:** Stable

## Import

```tsx
import { Search } from '@navikt/ds-react'
```

## Sub-components

| Component       | Description                                             |
| --------------- | ------------------------------------------------------- |
| `Search`        | Main search input component                             |
| `Search.Button` | Custom search submit button (used as child of `Search`) |

## When to Use

- Free-text search (global site search, page-level search)
- Filtering content by search term
- Searching for specific identifiers (e.g. personnummer)

**When NOT to use:**

- Filtering from a predefined list → use `UNSAFE_Combobox`
- Selecting from a small set of options → use `Select`, `Radio`, or `Checkbox`

## Props

### Search Props

| Prop            | Type                                   | Default        | Description                                                                                  |
| --------------- | -------------------------------------- | -------------- | -------------------------------------------------------------------------------------------- |
| `label`         | `ReactNode`                            | **(required)** | Search label. Hidden by default but required for WCAG.                                       |
| `hideLabel`     | `boolean`                              | `true`         | Shows label and description for screen readers only.                                         |
| `variant`       | `"primary" \| "secondary" \| "simple"` | `"primary"`    | Button variant. `primary` = main search, `secondary` = default choice, `simple` = no button. |
| `size`          | `"medium" \| "small"`                  | `"medium"`     | Changes font-size, padding and gaps.                                                         |
| `clearButton`   | `boolean`                              | `true`         | Shows/hides the clear button.                                                                |
| `htmlSize`      | `string \| number`                     | —              | HTML `size` attribute. Sets input width in characters.                                       |
| `onChange`      | `(value: string) => void`              | —              | Callback when input value changes.                                                           |
| `onClear`       | `(e: SearchClearEvent) => void`        | —              | Callback on clear-button click or Escape keydown.                                            |
| `onSearchClick` | `(value: string) => void`              | —              | Callback for search button submit.                                                           |
| `error`         | `ReactNode`                            | —              | Error message.                                                                               |
| `description`   | `ReactNode`                            | —              | Description text below label.                                                                |
| `disabled`      | `boolean`                              | `false`        | Disables the element. Avoid if possible for accessibility.                                   |
| `defaultValue`  | `string`                               | —              | Initial value (uncontrolled).                                                                |
| `value`         | `string`                               | —              | Controlled value.                                                                            |
| `id`            | `string`                               | —              | Override internal ID.                                                                        |
| `className`     | `string`                               | —              | CSS class for wrapper.                                                                       |
| `ref`           | `Ref<HTMLInputElement>`                | —              | Ref to the input element.                                                                    |

### Search.Button Props

| Prop        | Type                     | Default | Description                                                    |
| ----------- | ------------------------ | ------- | -------------------------------------------------------------- |
| `children`  | `ReactNode`              | —       | Text displayed after the search icon.                          |
| `disabled`  | `boolean`                | —       | Disables the button. Inherits from parent `Search` if not set. |
| `loading`   | `boolean`                | `false` | Replaces button content with a Loader.                         |
| `className` | `string`                 | —       | CSS class.                                                     |
| `ref`       | `Ref<HTMLButtonElement>` | —       | Ref to the button element.                                     |

> `Search.Button` inherits `size` and `variant` from the parent `Search` context. It renders as `type="submit"`.

## Variant Guide

| Variant       | When to use                                                               |
| ------------- | ------------------------------------------------------------------------- |
| `"primary"`   | Main/global search — the primary function of the page. Only one per page. |
| `"secondary"` | **Default choice when in doubt.** Secondary or contextual search.         |
| `"simple"`    | No search button. Shows a magnifying glass icon inside the input.         |

## Usage Examples

### Basic Search (Uncontrolled)

```tsx
<form role="search" onSubmit={handleSubmit}>
	<Search label="Søk i alle NAV sine sider" variant="primary" />
</form>
```

### Secondary Variant

```tsx
<form role="search" onSubmit={handleSubmit}>
	<Search label="Søk" variant="secondary" />
</form>
```

### Simple Variant (No Button)

```tsx
<Search label="Søk" variant="simple" />
```

### Controlled Search

```tsx
import { useState } from 'react'

import { Search } from '@navikt/ds-react'

function SøkeFelt() {
	const [søkeord, setSøkeord] = useState('')

	return (
		<form role="search">
			<Search
				label="Søk"
				variant="secondary"
				value={søkeord}
				onChange={setSøkeord}
				onSearchClick={(value) => utførSøk(value)}
			/>
		</form>
	)
}
```

### With Custom Search Button Text

```tsx
<Search label="Søk" variant="primary">
	<Search.Button>Søk</Search.Button>
</Search>
```

### Small Size

```tsx
<Search label="Søk" size="small" variant="secondary" />
```

### Without Clear Button

```tsx
<Search label="Søk" clearButton={false} />
```

### With htmlSize (Fixed Width)

```tsx
<Search label="Søk med personnummer" htmlSize="11" hideLabel={false} />
```

### Visible Label and Description

```tsx
<Search
	label="Søk på siden"
	description="Skriv inn søkeord for å finne relevant innhold"
	hideLabel={false}
	variant="simple"
/>
```

### With Error Message

```tsx
<Search label="Søk" variant="secondary" error="Søkefeltet kan ikke være tomt" />
```

### As a Filter

```tsx
import { useState } from 'react'

import { Search } from '@navikt/ds-react'

function FilterSøk({ items, onFilter }: Props) {
	const [filter, setFilter] = useState('')

	const handleChange = (value: string) => {
		setFilter(value)
		onFilter(
			items.filter((item) => item.toLowerCase().includes(value.toLowerCase()))
		)
	}

	return (
		<Search
			label="Filtrer resultater"
			variant="simple"
			value={filter}
			onChange={handleChange}
		/>
	)
}
```

## Accessibility

- **Label is required** — even when hidden (`hideLabel={true}`), the `label` prop is mandatory for screen readers.
- **Use `role="search"`** — wrap `Search` in a `<form role="search">` to expose it as an ARIA search landmark. Helps screen readers navigate directly to the search field.
- **Multiple search landmarks** — if the page has more than one search, use `aria-label` or `aria-labelledby` on each `<form role="search">` to differentiate them.
- **Escape clears the field** — pressing Escape clears the input value. This is standardized across browsers for `type="search"`.
- **Avoid `disabled`** — use sparingly; disabled elements are invisible to some assistive technologies.

### Keyboard Interaction

| Key      | Action                                                     |
| -------- | ---------------------------------------------------------- |
| `Escape` | Clears the search field                                    |
| `Enter`  | Submits the form (when inside a `<form>`)                  |
| `Tab`    | Moves focus between input, clear button, and search button |

## Integration with This Repo

When using in pensjonskalkulator, follow these patterns:

```tsx
import { useState } from 'react'
import { useIntl } from 'react-intl'

import { Search } from '@navikt/ds-react'

function SøkeFelt() {
	const intl = useIntl()
	const [søkeord, setSøkeord] = useState('')

	return (
		<form role="search">
			<Search
				label={intl.formatMessage({ id: 'søk.label' })}
				variant="secondary"
				value={søkeord}
				onChange={setSøkeord}
			/>
		</form>
	)
}
```

Style overrides use SCSS modules with Aksel tokens:

```scss
@use '../../../scss/variables';

.search {
	margin-top: var(--a-spacing-4);

	:global(.navds-search__wrapper) {
		width: variables.$input-width-m;
	}
}
```

## Do's and Don'ts

### ✅ Do

- Wrap `Search` in `<form role="search">` for proper semantics and submission
- Use `variant="secondary"` as the default — only use `"primary"` for the main page search
- Set `htmlSize` to match expected input length (e.g. `"11"` for personnummer)
- Always provide a descriptive `label` even when hidden
- Use controlled state (`value` + `onChange`) for predictable search behavior
- Use `onSearchClick` or form `onSubmit` to handle search submission
- Wrap all user-facing strings in `react-intl`

### 🚫 Don't

- Use more than one `variant="primary"` Search on the same page
- Forget `label` — it is required for WCAG compliance
- Make the search field too narrow for typical search queries
- Use `disabled` without a strong reason — it harms accessibility
- Set `hideLabel={false}` unless the context genuinely needs a visible label
- Use deprecated `clearButtonLabel` prop — use `<Provider />` instead
- Rely solely on `onSearchClick` without a `<form>` — submit buttons need a form for proper behavior
