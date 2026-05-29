# Tabs — `@navikt/ds-react`

Tabs lets users switch between related content panels on a single page. One panel is always visible. Use Tabs to organise related content without navigating between pages.

## Import

```tsx
import { Tabs } from '@navikt/ds-react'
```

## Sub-components

| Component    | Element    | Description                                |
| ------------ | ---------- | ------------------------------------------ |
| `Tabs`       | `<div>`    | Root wrapper managing state and context    |
| `Tabs.List`  | `<div>`    | Container for tab buttons (role `tablist`) |
| `Tabs.Tab`   | `<button>` | Individual tab trigger (role `tab`)        |
| `Tabs.Panel` | `<div>`    | Content panel (role `tabpanel`)            |

## Props

### `Tabs`

| Prop                    | Type                      | Default    | Description                                                   |
| ----------------------- | ------------------------- | ---------- | ------------------------------------------------------------- |
| `defaultValue`          | `string`                  | —          | Initial selected tab value (uncontrolled)                     |
| `value`                 | `string`                  | —          | Controlled selected tab value                                 |
| `onChange`              | `(value: string) => void` | —          | Callback when selected tab changes                            |
| `size`                  | `"medium" \| "small"`     | `"medium"` | Changes padding and font-size                                 |
| `iconPosition`          | `"left" \| "top"`         | `"left"`   | Icon position in Tab                                          |
| `selectionFollowsFocus` | `boolean`                 | `false`    | Automatically activates tab on focus/arrow-key navigation     |
| `loop`                  | `boolean`                 | `true`     | Loops back to start when navigating past last item            |
| `fill`                  | `boolean`                 | `false`    | Stretches each tab to fill available container space          |
| `children`              | `ReactNode`               | —          | Must include `Tabs.List` and optionally `Tabs.Panel` elements |
| `className`             | `string`                  | —          | Additional CSS class                                          |
| `ref`                   | `Ref<HTMLDivElement>`     | —          | Ref to root element                                           |

### `Tabs.List`

| Prop        | Type                  | Default | Description          |
| ----------- | --------------------- | ------- | -------------------- |
| `children`  | `ReactNode`           | —       | `Tabs.Tab` elements  |
| `className` | `string`              | —       | Additional CSS class |
| `ref`       | `Ref<HTMLDivElement>` | —       | Ref to root element  |

### `Tabs.Tab`

| Prop            | Type                     | Default | Description                                                                         |
| --------------- | ------------------------ | ------- | ----------------------------------------------------------------------------------- |
| `value`         | `string`                 | —       | **Required.** Value for state-handling; matches `Tabs.Panel` value                  |
| `label`         | `ReactNode`              | —       | Tab label text                                                                      |
| `icon`          | `ReactNode`              | —       | Tab icon element                                                                    |
| `id`            | `string`                 | —       | Overrides auto-generated id. If set, also set `aria-controls` matching the panel id |
| `aria-controls` | `string`                 | —       | Id of the panel this tab controls (auto-generated if using `Tabs.Panel`)            |
| `className`     | `string`                 | —       | Additional CSS class                                                                |
| `ref`           | `Ref<HTMLButtonElement>` | —       | Ref to button element                                                               |

### `Tabs.Panel`

| Prop        | Type                  | Default | Description                                                                         |
| ----------- | --------------------- | ------- | ----------------------------------------------------------------------------------- |
| `value`     | `string`              | —       | **Required.** Value for state-handling; must match a `Tabs.Tab` value               |
| `lazy`      | `boolean`             | `true`  | If true, children only render when the panel is selected                            |
| `id`        | `string`              | —       | Overrides auto-generated id. If set, also set `aria-labelledby` matching the tab id |
| `as`        | `React.ElementType`   | —       | Override root HTML element via OverridableComponent API                             |
| `children`  | `ReactNode`           | —       | Panel content                                                                       |
| `className` | `string`              | —       | Additional CSS class                                                                |
| `ref`       | `Ref<HTMLDivElement>` | —       | Ref to root element                                                                 |

## Usage Examples

### Basic (uncontrolled)

```tsx
<Tabs defaultValue="tab1">
	<Tabs.List>
		<Tabs.Tab value="tab1" label="First" />
		<Tabs.Tab value="tab2" label="Second" />
		<Tabs.Tab value="tab3" label="Third" />
	</Tabs.List>
	<Tabs.Panel value="tab1">Content for first tab</Tabs.Panel>
	<Tabs.Panel value="tab2">Content for second tab</Tabs.Panel>
	<Tabs.Panel value="tab3">Content for third tab</Tabs.Panel>
</Tabs>
```

### Controlled

```tsx
function ControlledTabs() {
	const [activeTab, setActiveTab] = useState('overview')

	return (
		<Tabs value={activeTab} onChange={setActiveTab}>
			<Tabs.List>
				<Tabs.Tab value="overview" label="Oversikt" />
				<Tabs.Tab value="details" label="Detaljer" />
			</Tabs.List>
			<Tabs.Panel value="overview">Oversikt-innhold</Tabs.Panel>
			<Tabs.Panel value="details">Detaljer-innhold</Tabs.Panel>
		</Tabs>
	)
}
```

### With icons

```tsx
import { BriefcaseIcon, PersonIcon } from '@navikt/aksel-icons'

;<Tabs defaultValue="person">
	<Tabs.List>
		<Tabs.Tab value="person" label="Person" icon={<PersonIcon aria-hidden />} />
		<Tabs.Tab
			value="arbeid"
			label="Arbeid"
			icon={<BriefcaseIcon aria-hidden />}
		/>
	</Tabs.List>
	<Tabs.Panel value="person">Personinfo</Tabs.Panel>
	<Tabs.Panel value="arbeid">Arbeidsinfo</Tabs.Panel>
</Tabs>
```

### Fill container with small size

```tsx
<Tabs defaultValue="tab1" size="small" fill>
	<Tabs.List>
		<Tabs.Tab value="tab1" label="Tab 1" />
		<Tabs.Tab value="tab2" label="Tab 2" />
		<Tabs.Tab value="tab3" label="Tab 3" />
	</Tabs.List>
	<Tabs.Panel value="tab1">Panel 1</Tabs.Panel>
	<Tabs.Panel value="tab2">Panel 2</Tabs.Panel>
	<Tabs.Panel value="tab3">Panel 3</Tabs.Panel>
</Tabs>
```

### URL sync with shallow routing (Next.js)

```tsx
<Tabs
	value={selectedTab}
	onChange={() => router.push(url, undefined, { shallow: true })}
>
	<Tabs.List>
		<Tabs.Tab value="tab-1" label="Tab 1" />
		<Tabs.Tab value="tab-2" label="Tab 2" />
	</Tabs.List>
	<Tabs.Panel value="tab-1">Panel 1</Tabs.Panel>
	<Tabs.Panel value="tab-2">Panel 2</Tabs.Panel>
</Tabs>
```

### Custom external tabpanel (without `Tabs.Panel`)

When you need the panel outside the `Tabs` wrapper, manage `aria-controls` and `aria-labelledby` manually:

```tsx
function ExternalPanel() {
	const [value, setValue] = useState('first')

	return (
		<>
			<Tabs value={value} onChange={setValue}>
				<Tabs.List>
					<Tabs.Tab
						value="first"
						label="First"
						id="first-tab"
						aria-controls="first-panel"
					/>
					<Tabs.Tab
						value="second"
						label="Second"
						id="second-tab"
						aria-controls="second-panel"
					/>
				</Tabs.List>
			</Tabs>
			<div
				role="tabpanel"
				hidden={value !== 'first'}
				aria-labelledby="first-tab"
				id="first-panel"
				tabIndex={0}
			>
				First panel content
			</div>
			<div
				role="tabpanel"
				hidden={value !== 'second'}
				aria-labelledby="second-tab"
				id="second-panel"
				tabIndex={0}
			>
				Second panel content
			</div>
		</>
	)
}
```

## Accessibility

- Uses [roving tabindex](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets#technique_1_roving_tabindex) for keyboard navigation between tabs.
- **Arrow keys** move focus between tabs. By default, the user must press **Enter** or **Space** to activate a tab.
- Set `selectionFollowsFocus` to `true` for automatic activation on arrow-key navigation (tab activates immediately on focus).
- `Tabs.Tab` and `Tabs.Panel` are automatically linked via `aria-controls` / `aria-labelledby`. Only override `id` if you need custom panel association.
- When using external panels (without `Tabs.Panel`), you **must** set `role="tabpanel"`, `aria-labelledby`, `id`, and `tabIndex={0}` on each panel div.
- `loop` (default `true`) means arrow keys wrap from last tab to first and vice versa.

## Do's and Don'ts

### ✅ Do

- Use Tabs to organise **related content** on a single page.
- Keep tab labels **short and descriptive** — one or two words.
- Always provide either `defaultValue` (uncontrolled) or `value` + `onChange` (controlled).
- Match each `Tabs.Tab` `value` with a corresponding `Tabs.Panel` `value`.
- Consider replacing the tab list with a `Select` on narrow screens if there are many tabs.
- Use `fill` when you want tabs to evenly distribute across the container width.
- Add `aria-hidden` to icons inside `Tabs.Tab` when a `label` is also provided.

### 🚫 Don't

- Don't use Tabs for **filtering or sorting** data — use `ToggleGroup` instead.
- Don't use Tabs for **page navigation** — tabs switch panels, not pages (WCAG 1.3.1).
- Don't use **icon-only** tabs in citizen-facing flows — icons alone are hard for users to understand. Reserve icon-only tabs for expert/internal tools with tooltips.
- Don't use **long multi-line** tab labels — they break the tab layout.
- Don't create too many tabs — excessive tabs cause horizontal scrolling on small screens.
- Don't override `id` on `Tabs.Tab` or `Tabs.Panel` without also setting the corresponding `aria-controls` / `aria-labelledby`.
- Don't hide **critical information** behind a non-default tab that users must see.
