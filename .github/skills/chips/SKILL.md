# Chips — `@navikt/ds-react`

Small interactive components for filtering data and displaying selected filters.

## Import

```tsx
import { Chips } from '@navikt/ds-react'
```

## Sub-components

| Component           | Purpose                                                                       |
| ------------------- | ----------------------------------------------------------------------------- |
| `<Chips>`           | Wrapper that renders a `<ul>` — groups chips horizontally, wraps like a cloud |
| `<Chips.Toggle>`    | Selectable chip — toggles `aria-pressed` and visual selected state            |
| `<Chips.Removable>` | Displays a selected filter the user can dismiss via `onDelete`                |

## Props

### Chips (wrapper)

| Prop        | Type                    | Default    | Description                    |
| ----------- | ----------------------- | ---------- | ------------------------------ |
| `size`      | `"medium" \| "small"`   | `"medium"` | Changes padding and font-sizes |
| `className` | `string`                | —          | Additional CSS class           |
| `ref`       | `Ref<HTMLUListElement>` | —          | Ref to the `<ul>` element      |

### Chips.Toggle

| Prop         | Type                                                                                                                                                        | Default | Description                                      |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------ |
| `selected`   | `boolean`                                                                                                                                                   | —       | Toggles `aria-pressed` and visual selected state |
| `checkmark`  | `boolean`                                                                                                                                                   | `true`  | Show checkmark icon when selected                |
| `data-color` | `"accent" \| "neutral" \| "info" \| "success" \| "warning" \| "danger" \| "meta-purple" \| "meta-lime" \| "brand-beige" \| "brand-blue" \| "brand-magenta"` | —       | Color variant                                    |
| `onClick`    | `() => void`                                                                                                                                                | —       | Click handler                                    |
| `as`         | `React.ElementType`                                                                                                                                         | —       | Override rendered element                        |
| `className`  | `string`                                                                                                                                                    | —       | Additional CSS class                             |
| `ref`        | `Ref<HTMLButtonElement>`                                                                                                                                    | —       | Ref to the button                                |

### Chips.Removable

| Prop         | Type                                                                                                                                                        | Default | Description                                   |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | --------------------------------------------- |
| `onDelete`   | `() => void`                                                                                                                                                | —       | Called when the user clicks the remove button |
| `data-color` | `"accent" \| "neutral" \| "info" \| "success" \| "warning" \| "danger" \| "meta-purple" \| "meta-lime" \| "brand-beige" \| "brand-blue" \| "brand-magenta"` | —       | Color variant                                 |
| `as`         | `React.ElementType`                                                                                                                                         | —       | Override rendered element                     |
| `className`  | `string`                                                                                                                                                    | —       | Additional CSS class                          |
| `ref`        | `Ref<HTMLButtonElement>`                                                                                                                                    | —       | Ref to the button                             |

> **Deprecated:** The `variant` prop (`"action" | "neutral"`) is deprecated on both `Chips.Toggle` and `Chips.Removable`. Use `data-color` instead.

## Usage Examples

### Toggle chips — multi-select filter

```tsx
const [selected, setSelected] = useState<string[]>([])
const options = ['Sykepenger', 'Foreldrepenger', 'Alderspensjon']

<Chips>
  {options.map((option) => (
    <Chips.Toggle
      key={option}
      selected={selected.includes(option)}
      onClick={() =>
        setSelected((prev) =>
          prev.includes(option)
            ? prev.filter((x) => x !== option)
            : [...prev, option]
        )
      }
    >
      {option}
    </Chips.Toggle>
  ))}
</Chips>
```

### Toggle chips — single-select (no checkmark)

```tsx
const [selected, setSelected] = useState<string | null>(null)
const options = ['62 år', '65 år', '67 år', '70 år']

<Chips>
  {options.map((option) => (
    <Chips.Toggle
      key={option}
      selected={selected === option}
      checkmark={false}
      onClick={() => setSelected(option)}
    >
      {option}
    </Chips.Toggle>
  ))}
</Chips>
```

### Removable chips — showing active filters

```tsx
const [filters, setFilters] = useState(['Oslo', 'Bergen', 'Trondheim'])

<Chips>
  {filters.map((filter) => (
    <Chips.Removable
      key={filter}
      onDelete={() => setFilters((prev) => prev.filter((x) => x !== filter))}
    >
      {filter}
    </Chips.Removable>
  ))}
</Chips>
```

### Filter pattern — toggle + removable together

```tsx
const categories = ['Helse', 'Økonomi', 'Arbeid']
const [activeFilters, setActiveFilters] = useState<string[]>([])

{
	/* Toggle chips to add filters */
}
;<Chips>
	{categories.map((cat) => (
		<Chips.Toggle
			key={cat}
			selected={activeFilters.includes(cat)}
			onClick={() =>
				setActiveFilters((prev) =>
					prev.includes(cat) ? prev.filter((x) => x !== cat) : [...prev, cat]
				)
			}
		>
			{cat}
		</Chips.Toggle>
	))}
</Chips>

{
	/* Removable chips to show / clear active filters */
}
{
	activeFilters.length > 0 && (
		<Chips>
			{activeFilters.map((filter) => (
				<Chips.Removable
					key={filter}
					onDelete={() =>
						setActiveFilters((prev) => prev.filter((x) => x !== filter))
					}
				>
					{filter}
				</Chips.Removable>
			))}
		</Chips>
	)
}
```

### Small size

```tsx
<Chips size="small">
	<Chips.Toggle selected>Kompakt</Chips.Toggle>
	<Chips.Toggle>Alternativ</Chips.Toggle>
</Chips>
```

## Accessibility

- `Chips.Toggle` sets `aria-pressed` automatically based on the `selected` prop.
- When chip interaction updates page content (e.g. filters a list), use an **ARIA live region** to announce changes to screen reader users:

```tsx
<div aria-live="polite" className="sr-only">
	{`${filteredResults.length} treff`}
</div>
```

- Each chip renders as a `<button>` inside a `<li>`, so they are keyboard-navigable by default.

## Do's and Don'ts

### ✅ Do

- Use Toggle chips to filter data in lists or tables.
- Use Removable chips to display currently active filters.
- Group chips horizontally (row or wrapping cloud layout).
- Provide **at least 3 options** when using `checkmark={false}` so the selected state is distinguishable.
- Add an ARIA live region when chip interaction updates content on the page.

### 🚫 Don't

- Don't use Chips for navigation menus — use proper nav components.
- Don't use Chips for static metadata — use `Tag` instead.
- Don't use Chips as form inputs — use `Checkbox`/`RadioGroup` instead.
- Don't stack chips vertically — they are designed for horizontal flow.
- Don't use the deprecated `variant` prop — use `data-color` instead.

## Common Patterns in This Codebase

The `VelgUttaksalder` component uses `Chips.Toggle` with `checkmark={false}` for single-select age picking:

```tsx
import { Chips } from '@navikt/ds-react'

;<Chips className={styles.chipsWrapper}>
	{ages.map((age) => (
		<Chips.Toggle
			selected={currentAge === age}
			checkmark={false}
			key={age}
			onClick={() => onAgeClick(age)}
		>
			{age}
		</Chips.Toggle>
	))}
</Chips>
```

## See Also

- [Tag](/komponenter/core/tag) — for static, non-interactive labels
- [CheckboxGroup / RadioGroup](/komponenter/core/checkbox) — for form selections
