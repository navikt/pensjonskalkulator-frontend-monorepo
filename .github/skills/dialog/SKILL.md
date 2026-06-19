# Dialog Component

> **Package:** `@navikt/ds-react`
> **Status:** Beta (stable for adoption, replaces Modal)
> **Docs:** https://aksel.nav.no/komponenter/core/dialog

A dialog is a temporary window that opens on top of the page. It captures the user's attention and focus while preserving the page context. Use it when the user must acknowledge information or focus on a specific task.

## Import

```tsx
import { Button, Dialog } from '@navikt/ds-react'
```

## Sub-components

| Component             | Element          | Description                                      |
| --------------------- | ---------------- | ------------------------------------------------ |
| `Dialog`              | —                | Root provider. Manages open state and size.      |
| `Dialog.Trigger`      | `<button>`       | Wraps a button that opens the dialog.            |
| `Dialog.CloseTrigger` | `<button>`       | Wraps a button that closes the dialog.           |
| `Dialog.Popup`        | `<div>` (portal) | The popup container. Configures modal behaviour. |
| `Dialog.Header`       | `<div>`          | Header area with optional close button.          |
| `Dialog.Title`        | `<h2>`           | Dialog heading. Auto-wires `aria-labelledby`.    |
| `Dialog.Description`  | `<p>`            | Optional description below the title.            |
| `Dialog.Body`         | `<div>`          | Scrollable main content area.                    |
| `Dialog.Footer`       | `<div>`          | Footer for action buttons.                       |

## Key Props

### `Dialog` (root)

| Prop                   | Type                                        | Default    | Description                                              |
| ---------------------- | ------------------------------------------- | ---------- | -------------------------------------------------------- |
| `open`                 | `boolean`                                   | —          | Controlled open state.                                   |
| `defaultOpen`          | `boolean`                                   | `false`    | Uncontrolled initial open state.                         |
| `onOpenChange`         | `(nextOpen: boolean, event: Event) => void` | —          | Called when dialog opens/closes (before animation ends). |
| `onOpenChangeComplete` | `(open: boolean) => void`                   | —          | Called after open/close animation completes.             |
| `size`                 | `"medium" \| "small"`                       | `"medium"` | Affects padding and title/description font-size.         |

### `Dialog.Popup`

| Prop                  | Type                                                        | Default                      | Description                                        |
| --------------------- | ----------------------------------------------------------- | ---------------------------- | -------------------------------------------------- |
| `modal`               | `true \| "trap-focus"`                                      | `true`                       | `true` = full modal. `"trap-focus"` = softer lock. |
| `closeOnOutsideClick` | `boolean`                                                   | `true`                       | Close when clicking outside the popup.             |
| `position`            | `"center" \| "bottom" \| "left" \| "right" \| "fullscreen"` | `"center"`                   | Placement in the viewport.                         |
| `width`               | `"small" \| "medium" \| "large" \| string`                  | `"medium"`                   | CSS width (ignored when fullscreen).               |
| `height`              | `"small" \| "medium" \| "large" \| string`                  | —                            | CSS height (ignored when fullscreen/left/right).   |
| `withBackdrop`        | `boolean`                                                   | `true` when `modal === true` | Show backdrop overlay.                             |
| `role`                | `"dialog" \| "alertdialog"`                                 | `"dialog"`                   | ARIA role.                                         |
| `initialFocusTo`      | `RefObject<HTMLElement> \| (() => HTMLElement \| null)`     | popup element                | Override initial focus target.                     |
| `returnFocusTo`       | `RefObject<HTMLElement> \| (() => HTMLElement \| null)`     | trigger element              | Override return focus target on close.             |
| `rootElement`         | `HTMLElement \| null`                                       | `document.body`              | Custom portal container.                           |

### `Dialog.Header`

| Prop              | Type      | Default | Description                                 |
| ----------------- | --------- | ------- | ------------------------------------------- |
| `withClosebutton` | `boolean` | `true`  | Show/hide the X close button in the header. |

## Usage Examples

### Basic dialog with trigger

```tsx
<Dialog>
	<Dialog.Trigger>
		<Button>Åpne dialog</Button>
	</Dialog.Trigger>
	<Dialog.Popup>
		<Dialog.Header>
			<Dialog.Title>Bekreft handling</Dialog.Title>
			<Dialog.Description>
				Er du sikker på at du vil fortsette?
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Body>
			<BodyLong>Denne handlingen kan ikke angres.</BodyLong>
		</Dialog.Body>
		<Dialog.Footer>
			<Button>Bekreft</Button>
			<Dialog.CloseTrigger>
				<Button variant="secondary">Avbryt</Button>
			</Dialog.CloseTrigger>
		</Dialog.Footer>
	</Dialog.Popup>
</Dialog>
```

### Controlled dialog

```tsx
const [open, setOpen] = useState(false)

<Dialog open={open} onOpenChange={(nextOpen) => setOpen(nextOpen)}>
  <Dialog.Popup>
    <Dialog.Header>
      <Dialog.Title>Kontrollert dialog</Dialog.Title>
    </Dialog.Header>
    <Dialog.Body>
      <BodyLong>Innhold her.</BodyLong>
    </Dialog.Body>
    <Dialog.Footer>
      <Dialog.CloseTrigger>
        <Button variant="secondary">Lukk</Button>
      </Dialog.CloseTrigger>
    </Dialog.Footer>
  </Dialog.Popup>
</Dialog>

<Button onClick={() => setOpen(true)}>Åpne</Button>
```

### Right-positioned drawer

```tsx
<Dialog>
	<Dialog.Trigger>
		<Button>Åpne drawer</Button>
	</Dialog.Trigger>
	<Dialog.Popup position="right" modal="trap-focus">
		<Dialog.Header>
			<Dialog.Title>Detaljer</Dialog.Title>
		</Dialog.Header>
		<Dialog.Body>
			<BodyLong>Innhold i sidepanel.</BodyLong>
		</Dialog.Body>
	</Dialog.Popup>
</Dialog>
```

### Confirmation dialog (alertdialog)

```tsx
<Dialog>
	<Dialog.Trigger>
		<Button variant="danger">Slett</Button>
	</Dialog.Trigger>
	<Dialog.Popup role="alertdialog" closeOnOutsideClick={false}>
		<Dialog.Header withClosebutton={false}>
			<Dialog.Title>Bekreft sletting</Dialog.Title>
		</Dialog.Header>
		<Dialog.Body>
			<BodyLong>Er du sikker? Denne handlingen kan ikke angres.</BodyLong>
		</Dialog.Body>
		<Dialog.Footer>
			<Button variant="danger">Slett</Button>
			<Dialog.CloseTrigger>
				<Button variant="secondary">Avbryt</Button>
			</Dialog.CloseTrigger>
		</Dialog.Footer>
	</Dialog.Popup>
</Dialog>
```

### Custom initial focus

```tsx
const searchRef = useRef<HTMLInputElement>(null)

<Dialog>
  <Dialog.Trigger>
    <Button>Søk</Button>
  </Dialog.Trigger>
  <Dialog.Popup initialFocusTo={searchRef}>
    <Dialog.Header>
      <Dialog.Title>Søk</Dialog.Title>
    </Dialog.Header>
    <Dialog.Body>
      <TextField ref={searchRef} label="Søkeord" />
    </Dialog.Body>
  </Dialog.Popup>
</Dialog>
```

## Accessibility

- **`Dialog.Title` provides `aria-labelledby` automatically.** If you omit the title, you must manually set `aria-label` or `aria-labelledby` on `Dialog.Popup`.
- **Focus is trapped** inside the dialog while open. The popup element itself receives focus on open.
- Use `initialFocusTo` to redirect initial focus (e.g. to a search field).
- `Dialog.Trigger` automatically receives focus when the dialog closes. Use `returnFocusTo` to override.
- **Escape key** closes the dialog by default.
- Use `role="alertdialog"` for destructive or confirmation dialogs that should not be easily dismissed.
- Tab order in the footer follows visual order (unlike the legacy Modal component).

## Testing

- Dialog has entry/exit animations. Use `waitFor` in tests or enable `prefers-reduced-motion`.
- To disable exit animations in tests, set `AKSEL_NO_EXIT_ANIMATIONS = true` in a `beforeAll` block:

```tsx
beforeAll(() => {
	globalThis.AKSEL_NO_EXIT_ANIMATIONS = true
})
```

## Do's and Don'ts

### ✅ Do

- Always provide a visible way to close the dialog (close button in header or an explicit cancel/close button).
- Use `Dialog.Title` for an accessible heading — screen reader users rely on it.
- Keep content concise and focused on one task.
- Use `role="alertdialog"` with `closeOnOutsideClick={false}` for destructive actions.
- Use `Dialog.CloseTrigger` to wrap close/cancel buttons — it handles the close logic.
- Prefer the uncontrolled pattern (`defaultOpen` + `Dialog.Trigger`) for simple use cases.

### 🚫 Don't

- Don't use dialogs for content that requires long or complex interaction.
- Don't use dialogs for information the user needs continuous access to.
- Don't use more than three buttons in the footer.
- Don't nest dialogs inside other dialogs.
- Don't forget `aria-label`/`aria-labelledby` if you omit `Dialog.Title`.
- Don't use `modal="trap-focus"` unless users genuinely need access to background content (drawer/expert UI only).

## Migration from Modal

Dialog replaces `Modal` from `@navikt/ds-react`. Key differences:

| Modal                          | Dialog                                           |
| ------------------------------ | ------------------------------------------------ |
| `<Modal header={{ heading }}>` | `<Dialog.Header><Dialog.Title>` compound pattern |
| `<Modal.Header>`               | `<Dialog.Header>`                                |
| `<Modal.Body>`                 | `<Dialog.Body>`                                  |
| `<Modal.Footer>`               | `<Dialog.Footer>`                                |
| `ref.current.showModal()`      | Use `open` prop or `Dialog.Trigger`              |
| `onClose`                      | `onOpenChange(nextOpen, event)`                  |
| `onBeforeClose`                | Call `event.preventDefault()` in `onOpenChange`  |
| `closeOnBackdropClick={false}` | `closeOnOutsideClick={false}`                    |
| Tab order reversed in footer   | Tab order matches visual order                   |
