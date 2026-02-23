# Dropdown

> **Package:** `@navikt/ds-react`
> **Import:** `import { Dropdown, Button } from "@navikt/ds-react";`
> **Docs:** <https://aksel.nav.no/komponenter/core/dropdown>

> **Note:** Dropdown is being superseded by [ActionMenu](https://aksel.nav.no/komponenter/core/actionmenu). Prefer ActionMenu for new code when possible.

A generic popover menu component that opens on click. Best suited for internal work surfaces used frequently — context menus, action lists, and toolbar menus.

---

## Sub-components

| Component                           | Element           | Purpose                                               |
| ----------------------------------- | ----------------- | ----------------------------------------------------- |
| `Dropdown`                          | Provider          | Root wrapper — manages open/close state and selection |
| `Dropdown.Toggle`                   | `<button>`        | Trigger button that opens/closes the menu             |
| `Dropdown.Menu`                     | `<div>` (Popover) | The popover container for menu content                |
| `Dropdown.Menu.List`                | `<ul>`            | Simple flat list of items                             |
| `Dropdown.Menu.List.Item`           | `<button>`        | A clickable item in a flat list                       |
| `Dropdown.Menu.GroupedList`         | `<dl>`            | List with grouped sections and headings               |
| `Dropdown.Menu.GroupedList.Heading` | `<details>`       | Section heading within a grouped list                 |
| `Dropdown.Menu.GroupedList.Item`    | `<button>`        | A clickable item in a grouped list                    |
| `Dropdown.Menu.Divider`             | `<hr>`            | Visual separator between list sections                |

---

## Props

### `Dropdown` (root)

| Prop            | Type                          | Default | Description                                                                |
| --------------- | ----------------------------- | ------- | -------------------------------------------------------------------------- |
| `children`      | `ReactNode`                   | —       | Must contain `Dropdown.Toggle` and `Dropdown.Menu`                         |
| `onSelect`      | `(event: MouseEvent) => void` | —       | Called when any item is selected                                           |
| `closeOnSelect` | `boolean`                     | `true`  | Close the menu after an item is selected                                   |
| `defaultOpen`   | `boolean`                     | `false` | Uncontrolled initial open state                                            |
| `open`          | `boolean`                     | —       | Controlled open state (requires manual `onOpenChange`/`onSelect` handling) |
| `onOpenChange`  | `(open: boolean) => void`     | —       | Callback when open state changes                                           |

### `Dropdown.Toggle`

| Prop        | Type                     | Default | Description                                              |
| ----------- | ------------------------ | ------- | -------------------------------------------------------- |
| `children`  | `ReactNode`              | —       | Button content                                           |
| `className` | `string`                 | —       | Additional CSS class                                     |
| `ref`       | `Ref<HTMLButtonElement>` | —       | Ref to the toggle button element                         |
| `as`        | `React.ElementType`      | —       | Render as a different element (OverridableComponent API) |

Extends `React.ButtonHTMLAttributes<HTMLButtonElement>`.

### `Dropdown.Menu`

| Prop        | Type                    | Default        | Description                                   |
| ----------- | ----------------------- | -------------- | --------------------------------------------- |
| `children`  | `ReactNode`             | —              | Menu content (lists, grouped lists, dividers) |
| `onClose`   | `() => void`            | —              | Callback fired when the menu closes           |
| `strategy`  | `"fixed" \| "absolute"` | `"absolute"`   | Popover positioning strategy                  |
| `placement` | `Placement`             | `"bottom-end"` | Popover placement relative to toggle          |
| `className` | `string`                | —              | Additional CSS class                          |
| `ref`       | `Ref<HTMLDivElement>`   | —              | Ref to the menu container                     |

**Placement values:** `"top"` `"bottom"` `"right"` `"left"` `"top-start"` `"top-end"` `"bottom-start"` `"bottom-end"` `"right-start"` `"right-end"` `"left-start"` `"left-end"`

### `Dropdown.Menu.List.Item` / `Dropdown.Menu.GroupedList.Item`

| Prop        | Type                     | Default | Description                                        |
| ----------- | ------------------------ | ------- | -------------------------------------------------- |
| `children`  | `ReactNode`              | —       | Item content                                       |
| `as`        | `React.ElementType`      | —       | Render as a different element (e.g. `"a"`, `Link`) |
| `disabled`  | `boolean`                | —       | Disables the item                                  |
| `onClick`   | `(event) => void`        | —       | Click handler for the item                         |
| `className` | `string`                 | —       | Additional CSS class                               |
| `ref`       | `Ref<HTMLButtonElement>` | —       | Ref to the item element                            |

### `Dropdown.Menu.Divider`

Standard `React.HTMLAttributes<HTMLHRElement>`. No custom props.

---

## Usage Examples

### Basic with flat list

```tsx
import { Button, Dropdown } from '@navikt/ds-react'

function BasicDropdown() {
	return (
		<Dropdown>
			<Button as={Dropdown.Toggle}>Meny</Button>
			<Dropdown.Menu>
				<Dropdown.Menu.List>
					<Dropdown.Menu.List.Item onClick={() => console.log('Rediger')}>
						Rediger
					</Dropdown.Menu.List.Item>
					<Dropdown.Menu.List.Item onClick={() => console.log('Slett')}>
						Slett
					</Dropdown.Menu.List.Item>
				</Dropdown.Menu.List>
			</Dropdown.Menu>
		</Dropdown>
	)
}
```

### Grouped list with headings and divider

```tsx
import { Button, Dropdown } from '@navikt/ds-react'

function GroupedDropdown() {
	return (
		<Dropdown onSelect={(event) => console.log(event)}>
			<Button as={Dropdown.Toggle}>Toggle</Button>
			<Dropdown.Menu>
				<Dropdown.Menu.GroupedList>
					<Dropdown.Menu.GroupedList.Heading>
						Systemer og oppslagsverk
					</Dropdown.Menu.GroupedList.Heading>
					<Dropdown.Menu.GroupedList.Item onClick={() => {}}>
						Gosys
					</Dropdown.Menu.GroupedList.Item>
					<Dropdown.Menu.GroupedList.Item as="a" href="https://nav.no">
						Infotrygd
					</Dropdown.Menu.GroupedList.Item>
				</Dropdown.Menu.GroupedList>
				<Dropdown.Menu.Divider />
				<Dropdown.Menu.List>
					<Dropdown.Menu.List.Item onClick={() => {}}>
						Kontakt
					</Dropdown.Menu.List.Item>
					<Dropdown.Menu.List.Item disabled>
						Deaktivert valg
					</Dropdown.Menu.List.Item>
				</Dropdown.Menu.List>
			</Dropdown.Menu>
		</Dropdown>
	)
}
```

### Controlled open state

```tsx
import { useState } from 'react'

import { Button, Dropdown } from '@navikt/ds-react'

function ControlledDropdown() {
	const [open, setOpen] = useState(false)

	return (
		<Dropdown open={open} onOpenChange={setOpen}>
			<Button as={Dropdown.Toggle}>Toggle</Button>
			<Dropdown.Menu onClose={() => setOpen(false)}>
				<Dropdown.Menu.List>
					<Dropdown.Menu.List.Item onClick={() => setOpen(false)}>
						Valg 1
					</Dropdown.Menu.List.Item>
				</Dropdown.Menu.List>
			</Dropdown.Menu>
		</Dropdown>
	)
}
```

### Items as links (with Next.js Link)

```tsx
import Link from 'next/link'

import { Button, Dropdown } from '@navikt/ds-react'

function LinkDropdown() {
	return (
		<Dropdown>
			<Button as={Dropdown.Toggle}>Navigasjon</Button>
			<Dropdown.Menu>
				<Dropdown.Menu.List>
					<Dropdown.Menu.List.Item as={Link} href="/side-a">
						Side A
					</Dropdown.Menu.List.Item>
					<Dropdown.Menu.List.Item as={Link} href="/side-b" target="_blank">
						Side B (ny fane)
					</Dropdown.Menu.List.Item>
				</Dropdown.Menu.List>
			</Dropdown.Menu>
		</Dropdown>
	)
}
```

---

## Accessibility

- `Dropdown.Toggle` automatically sets `aria-expanded` based on open state.
- The menu opens in a `Popover`, which manages focus trapping and Escape-to-close.
- Keyboard navigation (arrow keys) works within the menu items.
- Use descriptive text for toggle buttons — avoid generic labels like "Menu" without context.
- Items rendered as links (`as="a"` or `as={Link}`) retain native link semantics.

---

## Best Practices

### ✅ Do

- Use `Button as={Dropdown.Toggle}` to get standard button styling on the trigger.
- Use `Dropdown.Menu.GroupedList` with `Heading` to organize related items into logical sections.
- Use `Dropdown.Menu.Divider` to visually separate groups.
- Use the `as` prop on items to render links (e.g. `as="a"` or `as={Link}`) for navigation actions.
- Set `strategy="fixed"` when the dropdown is inside a scrollable or overflow-hidden container.
- Consider `ActionMenu` for new implementations — Dropdown will eventually be deprecated.

### ❌ Don't

- Don't use Dropdown on public-facing pages where users visit infrequently — it requires familiarity.
- Don't nest Dropdowns inside each other.
- Don't use Dropdown for form select inputs — use `Select` or `Combobox` instead.
- Don't forget to handle `onClose` and `onSelect` when using controlled (`open`) state.
- Don't place complex interactive content (forms, inputs) inside the menu — keep items simple.

---

## Common Patterns

### Toolbar actions menu

```tsx
<Dropdown>
	<Button variant="tertiary" size="small" as={Dropdown.Toggle}>
		Handlinger
	</Button>
	<Dropdown.Menu>
		<Dropdown.Menu.List>
			<Dropdown.Menu.List.Item onClick={handleEdit}>
				Rediger
			</Dropdown.Menu.List.Item>
			<Dropdown.Menu.List.Item onClick={handleDuplicate}>
				Dupliser
			</Dropdown.Menu.List.Item>
			<Dropdown.Menu.List.Item onClick={handleDelete}>
				Slett
			</Dropdown.Menu.List.Item>
		</Dropdown.Menu.List>
	</Dropdown.Menu>
</Dropdown>
```

### Keep menu open after selection

```tsx
<Dropdown closeOnSelect={false}>
	<Button as={Dropdown.Toggle}>Filtrer</Button>
	<Dropdown.Menu>
		<Dropdown.Menu.List>
			<Dropdown.Menu.List.Item onClick={toggleFilter1}>
				Filter 1
			</Dropdown.Menu.List.Item>
			<Dropdown.Menu.List.Item onClick={toggleFilter2}>
				Filter 2
			</Dropdown.Menu.List.Item>
		</Dropdown.Menu.List>
	</Dropdown.Menu>
</Dropdown>
```
