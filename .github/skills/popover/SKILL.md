# Popover

> **Package:** `@navikt/ds-react`
> **Import:** `import { Popover, Button } from "@navikt/ds-react";`
> **Docs:** <https://aksel.nav.no/komponenter/core/popover>

A hidden panel anchored to an element that overlays other elements in the interface. You control when and how it appears. Uses [Floating UI](https://floating-ui.com/docs/react) for positioning.

---

## Sub-components

| Component         | Element | Purpose                                                            |
| ----------------- | ------- | ------------------------------------------------------------------ |
| `Popover`         | `<div>` | Root container — the floating panel anchored to a trigger element  |
| `Popover.Content` | `<div>` | Content wrapper — provides padding and styling for popover content |

---

## Props

### `Popover` (root)

| Prop        | Type                    | Default      | Description                                                                                        |
| ----------- | ----------------------- | ------------ | -------------------------------------------------------------------------------------------------- |
| `children`  | `ReactNode`             | —            | Popover content (typically `Popover.Content`)                                                      |
| `open`      | `boolean`               | —            | Controls whether the popover is visible                                                            |
| `onClose`   | `() => void`            | —            | Callback fired when the popover should close (Escape key, outside click)                           |
| `anchorEl`  | `Element \| null`       | —            | The DOM element the popover anchors to                                                             |
| `placement` | `Placement`             | `"top"`      | Preferred placement relative to anchor                                                             |
| `offset`    | `number`                | `8`          | Distance in pixels from anchor to popover                                                          |
| `strategy`  | `"absolute" \| "fixed"` | `"absolute"` | CSS positioning strategy. Use `"fixed"` when anchor is inside a fixed container but popover is not |
| `flip`      | `boolean`               | `true`       | Automatically flips placement to keep popover in view                                              |
| `className` | `string`                | —            | Additional CSS class on the popover container                                                      |
| `ref`       | `Ref<HTMLDivElement>`   | —            | Ref to the popover element                                                                         |

**Placement values:** `"top"` `"bottom"` `"right"` `"left"` `"top-start"` `"top-end"` `"bottom-start"` `"bottom-end"` `"right-start"` `"right-end"` `"left-start"` `"left-end"`

> **Note:** Keep general usage to `"top"`, `"bottom"`, `"left"`, `"right"`.

### `Popover.Content`

| Prop        | Type                  | Default | Description                           |
| ----------- | --------------------- | ------- | ------------------------------------- |
| `children`  | `ReactNode`           | —       | Content to display inside the popover |
| `className` | `string`              | —       | Additional CSS class                  |
| `ref`       | `Ref<HTMLDivElement>` | —       | Ref to the content element            |

> **Deprecated prop:** `arrow` (`boolean`) — no longer has any effect and should not be used.

---

## Usage Examples

### Basic popover

```tsx
import { useRef, useState } from 'react'

import { Button, Popover } from '@navikt/ds-react'

function BasicPopover() {
	const buttonRef = useRef<HTMLButtonElement>(null)
	const [open, setOpen] = useState(false)

	return (
		<>
			<Button
				ref={buttonRef}
				onClick={() => setOpen(!open)}
				aria-expanded={open}
			>
				Åpne popover
			</Button>
			<Popover
				open={open}
				onClose={() => setOpen(false)}
				anchorEl={buttonRef.current}
			>
				<Popover.Content>Innhold i popover</Popover.Content>
			</Popover>
		</>
	)
}
```

### With different placements

```tsx
import { useRef, useState } from 'react'

import { Button, Popover } from '@navikt/ds-react'

function PlacementPopover() {
	const buttonRef = useRef<HTMLButtonElement>(null)
	const [open, setOpen] = useState(false)

	return (
		<>
			<Button
				ref={buttonRef}
				onClick={() => setOpen(!open)}
				aria-expanded={open}
			>
				Vis detaljer
			</Button>
			<Popover
				open={open}
				onClose={() => setOpen(false)}
				anchorEl={buttonRef.current}
				placement="bottom-start"
				offset={12}
			>
				<Popover.Content>
					Popover plassert under knappen, venstrejustert.
				</Popover.Content>
			</Popover>
		</>
	)
}
```

### With form content

```tsx
import { useRef, useState } from 'react'

import { BodyLong, Button, Popover, TextField } from '@navikt/ds-react'

function FormPopover() {
	const buttonRef = useRef<HTMLButtonElement>(null)
	const [open, setOpen] = useState(false)

	return (
		<>
			<Button
				ref={buttonRef}
				onClick={() => setOpen(!open)}
				aria-expanded={open}
			>
				Gi tilbakemelding
			</Button>
			<Popover
				open={open}
				onClose={() => setOpen(false)}
				anchorEl={buttonRef.current}
				placement="bottom"
			>
				<Popover.Content>
					<BodyLong spacing>Har du tilbakemelding?</BodyLong>
					<TextField label="Din tilbakemelding" />
					<Button
						size="small"
						style={{ marginTop: '0.5rem' }}
						onClick={() => setOpen(false)}
					>
						Send
					</Button>
				</Popover.Content>
			</Popover>
		</>
	)
}
```

### Inside a fixed container

```tsx
<Popover
	open={open}
	onClose={() => setOpen(false)}
	anchorEl={anchorRef.current}
	strategy="fixed"
>
	<Popover.Content>
		Bruker fixed posisjonering for riktig plassering i fixed containere.
	</Popover.Content>
</Popover>
```

---

## Accessibility

- **Always set `aria-expanded`** on the trigger element to indicate whether the popover is open (`true`) or closed (`false`).
- **Place the popover directly after the trigger** in the DOM for optimal screen reader interaction.
- The popover closes on **Escape** key press and **outside click** via the `onClose` callback.
- Focus management is handled by the component — focus moves into the popover when opened.

---

## Best Practices

### ✅ Do

- Use a `ref` on the trigger element and pass `ref.current` to `anchorEl`.
- Always provide an `onClose` handler to allow closing via Escape and outside click.
- Set `aria-expanded` on the trigger button to reflect the open state.
- Place the `<Popover>` immediately after its trigger element in the JSX tree.
- Use `strategy="fixed"` when the anchor is inside a scrollable or `overflow: hidden` container.
- Keep popover content concise and focused.
- Use `Popover.Content` to wrap content for proper padding and styling.

### 🚫 Don't

- Don't open popover on `:hover` — this is not supported. Use [Tooltip](https://aksel.nav.no/komponenter/core/tooltip) for hover-based overlays.
- Don't use popover for large amounts of content — consider a [Dialog](https://aksel.nav.no/komponenter/core/dialog) instead.
- Don't use popover to describe actions or elements — use Tooltip for that purpose.
- Don't use the deprecated `arrow` prop — it no longer has any effect.
- Don't forget to manage open/close state — Popover is fully controlled.
- Don't nest popovers inside other popovers.

---

## Common Patterns

### Toggle pattern with ref

```tsx
const buttonRef = useRef<HTMLButtonElement>(null);
const [open, setOpen] = useState(false);

<Button ref={buttonRef} onClick={() => setOpen((x) => !x)} aria-expanded={open}>
  Toggle
</Button>
<Popover open={open} onClose={() => setOpen(false)} anchorEl={buttonRef.current}>
  <Popover.Content>...</Popover.Content>
</Popover>
```

### Popover used internally by other components

Popover is used internally by these Aksel components:

- `Dropdown` / `ActionMenu` — menu positioning
- `DatePicker` / `MonthPicker` — calendar panel
- `HelpText` — help text bubble

If your use case matches one of these, prefer the higher-level component.
