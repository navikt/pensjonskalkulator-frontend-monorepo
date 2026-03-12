# ToggleGroup — `@navikt/ds-react`

Lets users make a choice that affects page content. A group of connected buttons where only one can be selected at a time — similar to a segmented control.

## Import

```tsx
import { ToggleGroup } from '@navikt/ds-react'
```

## Sub-components

| Component            | Purpose                                                  |
| -------------------- | -------------------------------------------------------- |
| `<ToggleGroup>`      | Wrapper — groups toggle items, manages selection state   |
| `<ToggleGroup.Item>` | Individual toggle button with a value for state handling |

## Props

### ToggleGroup (wrapper)

| Prop           | Type                      | Default    | Description                                                        |
| -------------- | ------------------------- | ---------- | ------------------------------------------------------------------ |
| `children`     | `ReactNode`               | —          | `ToggleGroup.Item` elements                                        |
| `defaultValue` | `string`                  | —          | Initial selected value (uncontrolled mode)                         |
| `value`        | `string`                  | —          | Controlled selected value                                          |
| `onChange`     | `(value: string) => void` | —          | Callback when selection changes                                    |
| `size`         | `"medium" \| "small"`     | `"medium"` | Changes padding and font-size                                      |
| `label`        | `ReactNode`               | —          | Label describing the ToggleGroup                                   |
| `fill`         | `boolean`                 | `false`    | Stretch each button to fill available space                        |
| `data-color`   | `AkselColorRole`          | —          | Overrides inherited color (`"accent"` and `"neutral"` recommended) |
| `className`    | `string`                  | —          | Additional CSS class                                               |
| `ref`          | `Ref<HTMLDivElement>`     | —          | Ref to the wrapper element                                         |

> **Deprecated:** The `variant` prop (`"action" | "neutral"`) is deprecated. Use `data-color` instead.

### ToggleGroup.Item

| Prop        | Type                     | Default | Description                            |
| ----------- | ------------------------ | ------- | -------------------------------------- |
| `value`     | `string`                 | —       | **Required.** Value for state handling |
| `label`     | `ReactNode`              | —       | Item label text                        |
| `icon`      | `ReactNode`              | —       | Item icon                              |
| `className` | `string`                 | —       | Additional CSS class                   |
| `ref`       | `Ref<HTMLButtonElement>` | —       | Ref to the button element              |

> **Deprecated:** The `children` prop on `ToggleGroup.Item` is deprecated. Use `label` and/or `icon` instead.

## Usage Examples

### Uncontrolled with defaultValue

```tsx
<ToggleGroup defaultValue="tabell" label="Visning">
	<ToggleGroup.Item value="tabell" label="Tabell" />
	<ToggleGroup.Item value="graf" label="Graf" />
</ToggleGroup>
```

### Controlled

```tsx
const [value, setValue] = useState('enkel')

<ToggleGroup value={value} onChange={setValue} label="Beregningstype">
  <ToggleGroup.Item value="enkel" label="Enkel" />
  <ToggleGroup.Item value="avansert" label="Avansert" />
</ToggleGroup>
```

### With icons

```tsx
import { BarChartIcon, TableIcon } from '@navikt/aksel-icons'

;<ToggleGroup defaultValue="tabell" label="Visning">
	<ToggleGroup.Item
		value="tabell"
		icon={<TableIcon aria-hidden />}
		label="Tabell"
	/>
	<ToggleGroup.Item
		value="graf"
		icon={<BarChartIcon aria-hidden />}
		label="Graf"
	/>
</ToggleGroup>
```

### Fill variant

```tsx
<ToggleGroup defaultValue="alle" label="Filter" fill>
	<ToggleGroup.Item value="alle" label="Alle" />
	<ToggleGroup.Item value="aktive" label="Aktive" />
	<ToggleGroup.Item value="avsluttet" label="Avsluttet" />
</ToggleGroup>
```

### Small size

```tsx
<ToggleGroup defaultValue="tabell" size="small" label="Visning">
	<ToggleGroup.Item value="tabell" label="Tabell" />
	<ToggleGroup.Item value="graf" label="Graf" />
</ToggleGroup>
```

## Accessibility

- Implements [roving tabindex](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets#technique_1_roving_tabindex) for keyboard navigation between toggle buttons.
- Always provide a `label` prop unless the button text makes the purpose self-explanatory.
- Place controlled content immediately after the ToggleGroup in the DOM. If that is not possible, use `aria-controls` on the ToggleGroup to reference the content container.
- When the toggle updates page content, consider adding an ARIA live region to announce changes:

```tsx
<div aria-live="polite" className="sr-only">
	{`Viser ${activeView}`}
</div>
```

## Do's and Don'ts

### ✅ Do

- Use ToggleGroup for filtering content in lists or tables.
- Use ToggleGroup for switching between views (e.g. "Tabell" / "Graf").
- Always provide a descriptive `label` to clarify the purpose of the toggle.
- Use `Tooltip` on toggle items, especially when using icon-only items.
- Ensure the full component is visible on screen — don't let it overflow.
- Use `data-color` instead of the deprecated `variant` prop.
- Use `label` and `icon` props on `ToggleGroup.Item` instead of deprecated `children`.

### 🚫 Don't

- Don't use ToggleGroup as a form input — use `RadioGroup` instead.
- Don't use ToggleGroup for navigation between panels — use `Tabs` instead.
- Don't use icon-only toggles on public-facing pages unless globally understood.
- Don't squeeze the component so text wraps to multiple lines.
- Don't pass the deprecated `variant` prop — use `data-color` instead.

## Common Patterns in This Codebase

The `Beregning` page uses a controlled ToggleGroup to switch between simple and advanced calculation views:

```tsx
import { ToggleGroup } from '@navikt/ds-react'

;<ToggleGroup value={visning} variant="neutral" onChange={onToggleChange}>
	<ToggleGroup.Item value="enkel">
		{intl.formatMessage({ id: 'beregning.toggle.enkel' })}
	</ToggleGroup.Item>
	<ToggleGroup.Item value="avansert">
		{intl.formatMessage({ id: 'beregning.toggle.avansert' })}
	</ToggleGroup.Item>
</ToggleGroup>
```

## See Also

- [Tabs](https://aksel.nav.no/komponenter/core/tabs) — for panel navigation
- [RadioGroup](https://aksel.nav.no/komponenter/core/radio) — for form selections
- [Chips](https://aksel.nav.no/komponenter/core/chips) — for multi-select filtering
