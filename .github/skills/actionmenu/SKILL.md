# ActionMenu Component Skill

Dropdown menu for actions and navigation from the Aksel Design System (`@navikt/ds-react`).

ActionMenu is used to organize secondary actions behind a trigger button, reducing visual complexity. Common use cases include table row actions, context-specific actions in expert systems, and navigation between systems.

**Source:** [aksel.nav.no/komponenter/core/actionmenu](https://aksel.nav.no/komponenter/core/actionmenu)

## Import

```tsx
import { ChevronDownIcon } from '@navikt/aksel-icons'
import { ActionMenu, Button } from '@navikt/ds-react'
```

## Sub-components

| Sub-component             | Purpose                                             |
| ------------------------- | --------------------------------------------------- |
| `ActionMenu`              | Root wrapper. Controls open/close state.            |
| `ActionMenu.Trigger`      | Wraps the button that opens the menu.               |
| `ActionMenu.Content`      | Container for menu items. Rendered as a portal.     |
| `ActionMenu.Item`         | A clickable action item.                            |
| `ActionMenu.Group`        | Groups related items with an optional label.        |
| `ActionMenu.Divider`      | Visual separator between groups.                    |
| `ActionMenu.CheckboxItem` | Toggleable checkbox item. Must be inside a `Group`. |
| `ActionMenu.RadioGroup`   | Radio group wrapper for single-select items.        |
| `ActionMenu.RadioItem`    | Radio option inside a `RadioGroup`.                 |
| `ActionMenu.Sub`          | Wrapper for a submenu.                              |
| `ActionMenu.SubTrigger`   | Item that opens a nested submenu.                   |
| `ActionMenu.SubContent`   | Content container for a submenu.                    |

## Props Reference

### ActionMenu (Root)

| Prop            | Type                      | Default | Description                            |
| --------------- | ------------------------- | ------- | -------------------------------------- |
| `open?`         | `boolean`                 | —       | Controlled open state.                 |
| `onOpenChange?` | `(open: boolean) => void` | —       | Callback when menu opens/closes.       |
| `rootElement?`  | `HTMLElement \| null`     | —       | Portal container for the menu content. |

### ActionMenu.Content

| Prop     | Type               | Default   | Description                               |
| -------- | ------------------ | --------- | ----------------------------------------- |
| `align?` | `"start" \| "end"` | `"start"` | Horizontal alignment relative to trigger. |

### ActionMenu.Item

| Prop            | Type                     | Default  | Description                                                          |
| --------------- | ------------------------ | -------- | -------------------------------------------------------------------- |
| `onSelect?`     | `(event: Event) => void` | —        | Called when item is selected.                                        |
| `disabled?`     | `boolean`                | —        | Disables the item.                                                   |
| `variant?`      | `"danger"`               | —        | Styles as a destructive action (red).                                |
| `shortcut?`     | `string`                 | —        | Visual shortcut hint (e.g. `"⌘S"`). Does not implement the shortcut. |
| `icon?`         | `ReactNode`              | —        | Icon element. Always gets `aria-hidden`.                             |
| `iconPosition?` | `"left" \| "right"`      | `"left"` | Position of the icon.                                                |
| `as?`           | `React.ElementType`      | —        | Render as a different element (e.g. `"a"` for links).                |

### ActionMenu.Group

| Prop          | Type     | Default | Description                                  |
| ------------- | -------- | ------- | -------------------------------------------- |
| `label?`      | `string` | —       | Visual and accessible label for the group.   |
| `aria-label?` | `string` | —       | Accessible-only label (no visual rendering). |

### ActionMenu.CheckboxItem

| Prop               | Type                         | Default | Description                          |
| ------------------ | ---------------------------- | ------- | ------------------------------------ |
| `checked?`         | `CheckedState`               | —       | Whether the item is checked.         |
| `onCheckedChange?` | `(checked: boolean) => void` | —       | Callback when checked state changes. |
| `onSelect?`        | `(event: Event) => void`     | —       | Called when item is selected.        |
| `disabled?`        | `boolean`                    | —       | Disables the item.                   |
| `shortcut?`        | `string`                     | —       | Visual shortcut hint.                |

### ActionMenu.RadioGroup

| Prop             | Type                      | Default | Description                      |
| ---------------- | ------------------------- | ------- | -------------------------------- |
| `label?`         | `string`                  | —       | Visual and accessible label.     |
| `aria-label?`    | `string`                  | —       | Accessible-only label.           |
| `value?`         | `string`                  | —       | Controlled selected value.       |
| `onValueChange?` | `(value: string) => void` | —       | Callback when selection changes. |

### ActionMenu.RadioItem

| Prop        | Type                     | Default      | Description                     |
| ----------- | ------------------------ | ------------ | ------------------------------- |
| `value`     | `string`                 | **required** | The value of this radio option. |
| `onSelect?` | `(event: Event) => void` | —            | Called when item is selected.   |
| `disabled?` | `boolean`                | —            | Disables the item.              |

### ActionMenu.Sub

| Prop            | Type                      | Default | Description                            |
| --------------- | ------------------------- | ------- | -------------------------------------- |
| `open?`         | `boolean`                 | —       | Controlled open state for the submenu. |
| `onOpenChange?` | `(open: boolean) => void` | —       | Callback when submenu opens/closes.    |

### ActionMenu.SubTrigger

| Prop            | Type                | Default  | Description              |
| --------------- | ------------------- | -------- | ------------------------ |
| `icon?`         | `ReactNode`         | —        | Icon element.            |
| `iconPosition?` | `"left" \| "right"` | `"left"` | Position of the icon.    |
| `disabled?`     | `boolean`           | —        | Disables the subtrigger. |

## Usage Examples

### Basic Menu

```tsx
<ActionMenu>
	<ActionMenu.Trigger>
		<Button
			variant="secondary"
			icon={<ChevronDownIcon aria-hidden />}
			iconPosition="right"
		>
			Handlinger
		</Button>
	</ActionMenu.Trigger>
	<ActionMenu.Content>
		<ActionMenu.Item onSelect={() => console.log('edit')}>
			Rediger
		</ActionMenu.Item>
		<ActionMenu.Item onSelect={() => console.log('copy')}>
			Kopier
		</ActionMenu.Item>
		<ActionMenu.Item variant="danger" onSelect={() => console.log('delete')}>
			Slett
		</ActionMenu.Item>
	</ActionMenu.Content>
</ActionMenu>
```

### Grouped Items with Dividers

```tsx
<ActionMenu>
	<ActionMenu.Trigger>
		<Button
			data-color="neutral"
			variant="secondary"
			icon={<ChevronDownIcon aria-hidden />}
			iconPosition="right"
		>
			Meny
		</Button>
	</ActionMenu.Trigger>
	<ActionMenu.Content>
		<ActionMenu.Group label="Systemer og oppslagsverk">
			<ActionMenu.Item onSelect={handleSelect}>A-inntekt</ActionMenu.Item>
			<ActionMenu.Item onSelect={handleSelect}>Aa-registeret</ActionMenu.Item>
		</ActionMenu.Group>
		<ActionMenu.Divider />
		<ActionMenu.Group label="Kommunikasjon">
			<ActionMenu.Item onSelect={handleSelect}>Gosys</ActionMenu.Item>
			<ActionMenu.Item onSelect={handleSelect}>Modia</ActionMenu.Item>
		</ActionMenu.Group>
	</ActionMenu.Content>
</ActionMenu>
```

### With Icons

```tsx
import { FilesIcon, PencilIcon, TrashIcon } from '@navikt/aksel-icons'

;<ActionMenu>
	<ActionMenu.Trigger>
		<Button
			variant="secondary"
			icon={<ChevronDownIcon aria-hidden />}
			iconPosition="right"
		>
			Handlinger
		</Button>
	</ActionMenu.Trigger>
	<ActionMenu.Content>
		<ActionMenu.Item onSelect={handleEdit} icon={<PencilIcon aria-hidden />}>
			Rediger
		</ActionMenu.Item>
		<ActionMenu.Item onSelect={handleCopy} icon={<FilesIcon aria-hidden />}>
			Kopier
		</ActionMenu.Item>
		<ActionMenu.Item
			variant="danger"
			onSelect={handleDelete}
			icon={<TrashIcon aria-hidden />}
		>
			Slett
		</ActionMenu.Item>
	</ActionMenu.Content>
</ActionMenu>
```

### CheckboxItems (Multi-select)

```tsx
const [showName, setShowName] = useState(true)
const [showAge, setShowAge] = useState(false)

<ActionMenu>
  <ActionMenu.Trigger>
    <Button variant="secondary" icon={<ChevronDownIcon aria-hidden />} iconPosition="right">
      Kolonner
    </Button>
  </ActionMenu.Trigger>
  <ActionMenu.Content>
    <ActionMenu.Group label="Synlige kolonner">
      <ActionMenu.CheckboxItem
        checked={showName}
        onCheckedChange={setShowName}
      >
        Navn
      </ActionMenu.CheckboxItem>
      <ActionMenu.CheckboxItem
        checked={showAge}
        onCheckedChange={setShowAge}
      >
        Alder
      </ActionMenu.CheckboxItem>
    </ActionMenu.Group>
  </ActionMenu.Content>
</ActionMenu>
```

### RadioItems (Single-select)

```tsx
const [sortBy, setSortBy] = useState("name")

<ActionMenu>
  <ActionMenu.Trigger>
    <Button variant="secondary" icon={<ChevronDownIcon aria-hidden />} iconPosition="right">
      Sortering
    </Button>
  </ActionMenu.Trigger>
  <ActionMenu.Content>
    <ActionMenu.RadioGroup label="Sorter etter" value={sortBy} onValueChange={setSortBy}>
      <ActionMenu.RadioItem value="name">Navn</ActionMenu.RadioItem>
      <ActionMenu.RadioItem value="date">Dato</ActionMenu.RadioItem>
      <ActionMenu.RadioItem value="status">Status</ActionMenu.RadioItem>
    </ActionMenu.RadioGroup>
  </ActionMenu.Content>
</ActionMenu>
```

### Submenus

```tsx
<ActionMenu>
	<ActionMenu.Trigger>
		<Button
			variant="secondary"
			icon={<ChevronDownIcon aria-hidden />}
			iconPosition="right"
		>
			Handlinger
		</Button>
	</ActionMenu.Trigger>
	<ActionMenu.Content>
		<ActionMenu.Item onSelect={handleSave}>Lagre</ActionMenu.Item>
		<ActionMenu.Sub>
			<ActionMenu.SubTrigger>Eksporter som</ActionMenu.SubTrigger>
			<ActionMenu.SubContent>
				<ActionMenu.Item onSelect={() => exportAs('pdf')}>PDF</ActionMenu.Item>
				<ActionMenu.Item onSelect={() => exportAs('csv')}>CSV</ActionMenu.Item>
				<ActionMenu.Item onSelect={() => exportAs('xlsx')}>
					Excel
				</ActionMenu.Item>
			</ActionMenu.SubContent>
		</ActionMenu.Sub>
	</ActionMenu.Content>
</ActionMenu>
```

### With Shortcuts

```tsx
<ActionMenu>
	<ActionMenu.Trigger>
		<Button
			variant="secondary"
			icon={<ChevronDownIcon aria-hidden />}
			iconPosition="right"
		>
			Fil
		</Button>
	</ActionMenu.Trigger>
	<ActionMenu.Content>
		<ActionMenu.Item onSelect={handleSave} shortcut="⌘S">
			Lagre
		</ActionMenu.Item>
		<ActionMenu.Item onSelect={handleUndo} shortcut="⌘Z">
			Angre
		</ActionMenu.Item>
		<ActionMenu.Divider />
		<ActionMenu.Item variant="danger" onSelect={handleDelete} shortcut="⌫">
			Slett
		</ActionMenu.Item>
	</ActionMenu.Content>
</ActionMenu>
```

> **Note:** The `shortcut` prop is purely visual. You must implement keyboard shortcut handling yourself (see the Aksel docs for a React implementation pattern).

### Controlled Open State

```tsx
const [open, setOpen] = useState(false)

<ActionMenu open={open} onOpenChange={setOpen}>
  <ActionMenu.Trigger>
    <Button variant="secondary" icon={<ChevronDownIcon aria-hidden />} iconPosition="right">
      Meny
    </Button>
  </ActionMenu.Trigger>
  <ActionMenu.Content>
    <ActionMenu.Item onSelect={handleAction}>Handling</ActionMenu.Item>
  </ActionMenu.Content>
</ActionMenu>
```

### Item as Link

```tsx
<ActionMenu.Item as="a" href="/dashboard" onSelect={handleNav}>
	Gå til dashboard
</ActionMenu.Item>
```

## Accessibility

- Implements the WAI-ARIA [Menu Button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/) and [Menu](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/) patterns.
- The menu is modal when open — users cannot interact with content outside the menu until it is closed.
- Clicking outside the menu closes it and returns focus to the trigger.
- Full keyboard navigation: `Arrow Up/Down` to move between items, `Enter/Space` to select, `Escape` to close.
- Submenus open with `Arrow Right` and close with `Arrow Left`.
- Groups should always have a `label` or `aria-label` for screen readers.
- `CheckboxItem` and `RadioItem` must always be inside a labeled `Group` or `RadioGroup`.

## Do's and Don'ts

### ✅ Do

- Use `ActionMenu` for **secondary** actions (not primary actions).
- Always use a `Button` with an icon (typically `ChevronDownIcon`) as the trigger.
- Group related items with `ActionMenu.Group` and separate groups with `ActionMenu.Divider`.
- Give every group a `label` or `aria-label`.
- Keep submenus to maximum one level deep (two at most).
- Ensure `SubTrigger` text clearly describes what the submenu contains.
- If one item in a group has an icon, give all items in that group an icon.
- Use `variant="danger"` for destructive actions like delete.

### 🚫 Don't

- Don't attach ActionMenu to a primary button (`variant="primary"`).
- Don't use ActionMenu for actions that should always be immediately visible.
- Don't use icons that look like built-in elements (e.g. checkmarks or chevrons on regular items).
- Don't rely on `shortcut` prop to implement actual keyboard shortcuts — it's visual-only.
- Don't nest more than two levels of submenus.
- Don't use `CheckboxItem` or `RadioItem` outside of a `Group` / `RadioGroup`.
- Don't use ActionMenu on open public-facing pages without considering that hidden actions may not be discovered by all users.

## Common Patterns in This Codebase

### With react-intl translations

```tsx
const intl = useIntl()

<ActionMenu>
  <ActionMenu.Trigger>
    <Button
      variant="secondary"
      icon={<ChevronDownIcon aria-hidden />}
      iconPosition="right"
    >
      {intl.formatMessage({ id: "actionmenu.trigger.label" })}
    </Button>
  </ActionMenu.Trigger>
  <ActionMenu.Content>
    <ActionMenu.Group label={intl.formatMessage({ id: "actionmenu.group.label" })}>
      <ActionMenu.Item onSelect={handleAction}>
        {intl.formatMessage({ id: "actionmenu.item.label" })}
      </ActionMenu.Item>
    </ActionMenu.Group>
  </ActionMenu.Content>
</ActionMenu>
```

### Table Row Actions

```tsx
function RowActions({ row }: { row: DataRow }) {
	return (
		<ActionMenu>
			<ActionMenu.Trigger>
				<Button
					variant="tertiary"
					size="small"
					icon={<MenuElipsisHorizontalIcon aria-hidden />}
					aria-label={`Handlinger for ${row.name}`}
				/>
			</ActionMenu.Trigger>
			<ActionMenu.Content align="end">
				<ActionMenu.Item onSelect={() => handleEdit(row.id)}>
					Rediger
				</ActionMenu.Item>
				<ActionMenu.Divider />
				<ActionMenu.Item variant="danger" onSelect={() => handleDelete(row.id)}>
					Slett
				</ActionMenu.Item>
			</ActionMenu.Content>
		</ActionMenu>
	)
}
```
