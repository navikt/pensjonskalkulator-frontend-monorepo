# Modal Component

> **Package:** `@navikt/ds-react`
> **Status:** Stable (will be deprecated early 2027 — prefer [Dialog](./dialog.md) for new code)
> **Docs:** https://aksel.nav.no/komponenter/core/modal

A modal is a temporary window that opens on top of the page. It captures the user's attention while preserving the page context. Use it when the user must acknowledge information or focus on a specific task. Built on the native `<dialog>` element.

## Import

```tsx
import { Button, Modal } from '@navikt/ds-react'
```

## Sub-components

| Component      | Element    | Description                                        |
| -------------- | ---------- | -------------------------------------------------- |
| `Modal`        | `<dialog>` | Root element. Manages open state and backdrop.     |
| `Modal.Header` | `<div>`    | Header area (custom alternative to `header` prop). |
| `Modal.Body`   | `<div>`    | Scrollable main content area.                      |
| `Modal.Footer` | `<div>`    | Footer for action buttons.                         |

## Key Props

### `Modal`

| Prop                   | Type                                                                                                       | Default                   | Description                                                                                             |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------- |
| `open`                 | `boolean`                                                                                                  | —                         | Controlled open state. Keep in sync via `onClose`. Can also use `ref.current.showModal()` / `.close()`. |
| `onClose`              | `ReactEventHandler<HTMLDialogElement>`                                                                     | —                         | Called when the modal is closed (Escape, backdrop click, or programmatic close).                        |
| `onBeforeClose`        | `() => boolean`                                                                                            | —                         | Return `false` to prevent closing. Use for unsaved-changes confirmation.                                |
| `onCancel`             | `ReactEventHandler<HTMLDialogElement>`                                                                     | —                         | Called on Escape key press. Call `e.preventDefault()` to block Escape-to-close.                         |
| `header`               | `{ heading: string; label?: string; icon?: ReactNode; size?: "small" \| "medium"; closeButton?: boolean }` | —                         | Shorthand header config. Auto-wires `aria-labelledby`. Alternative: use `<Modal.Header>` instead.       |
| `width`                | `number \| "small" \| "medium" \| \`${number}${string}\``                                                  | `fit-content (max 700px)` | Width of the modal.                                                                                     |
| `size`                 | `"small" \| "medium"`                                                                                      | —                         | Affects internal padding.                                                                               |
| `placement`            | `"top" \| "center"`                                                                                        | `"center"`                | Viewport placement. Always centered on mobile / old browsers.                                           |
| `closeOnBackdropClick` | `boolean`                                                                                                  | `false`                   | Close when clicking outside. **Don't use if closing may cause data loss.**                              |
| `closeButton`          | `boolean`                                                                                                  | `true`                    | Show/hide the X close button.                                                                           |
| `portal`               | `boolean`                                                                                                  | —                         | Render into a different DOM node (uses `rootElement` from `<Provider>` or `document.body`).             |
| `ref`                  | `Ref<HTMLDialogElement>`                                                                                   | —                         | Ref to the native `<dialog>` element. Used for imperative open/close.                                   |
| `aria-labelledby`      | `string`                                                                                                   | —                         | Set manually when **not** using the `header` prop.                                                      |
| `aria-label`           | `string`                                                                                                   | —                         | Alternative to `aria-labelledby` when `header` prop is not used.                                        |

### `Modal.Header`

| Prop          | Type      | Default | Description                                 |
| ------------- | --------- | ------- | ------------------------------------------- |
| `closeButton` | `boolean` | `true`  | Show/hide the X close button in the header. |

### `Modal.Body`

| Prop        | Type     | Default | Description   |
| ----------- | -------- | ------- | ------------- |
| `className` | `string` | —       | Custom class. |

### `Modal.Footer`

| Prop        | Type     | Default | Description   |
| ----------- | -------- | ------- | ------------- |
| `className` | `string` | —       | Custom class. |

## Opening and Closing Patterns

### Pattern 1: Ref-based (preferred in this codebase)

Use `useRef<HTMLDialogElement>` with `.showModal()` / `.close()`:

```tsx
const modalRef = React.useRef<HTMLDialogElement>(null)

<Button onClick={() => modalRef.current?.showModal()}>Åpne</Button>

<Modal
  ref={modalRef}
  header={{ heading: 'Bekreft handling' }}
  width="medium"
>
  <Modal.Body>
    <BodyLong>Er du sikker?</BodyLong>
  </Modal.Body>
  <Modal.Footer>
    <Button onClick={() => modalRef.current?.close()}>Ja</Button>
    <Button variant="secondary" onClick={() => modalRef.current?.close()}>
      Avbryt
    </Button>
  </Modal.Footer>
</Modal>
```

### Pattern 2: Controlled with `open` prop

```tsx
const [open, setOpen] = useState(false)

<Button onClick={() => setOpen(true)}>Åpne</Button>

<Modal
  open={open}
  onClose={() => setOpen(false)}
  header={{ heading: 'Tittel' }}
>
  <Modal.Body>
    <BodyLong>Innhold her.</BodyLong>
  </Modal.Body>
  <Modal.Footer>
    <Button onClick={() => setOpen(false)}>Lukk</Button>
  </Modal.Footer>
</Modal>
```

## Usage Examples

### Confirmation dialog

```tsx
const modalRef = React.useRef<HTMLDialogElement>(null)

<Button variant="danger" onClick={() => modalRef.current?.showModal()}>
  Slett
</Button>

<Modal
  ref={modalRef}
  header={{ heading: 'Er du sikker?' }}
  width="small"
>
  <Modal.Body>
    <BodyLong>Denne handlingen kan ikke angres.</BodyLong>
  </Modal.Body>
  <Modal.Footer>
    <Button
      variant="danger"
      onClick={() => {
        handleDelete()
        modalRef.current?.close()
      }}
    >
      Slett
    </Button>
    <Button variant="secondary" onClick={() => modalRef.current?.close()}>
      Avbryt
    </Button>
  </Modal.Footer>
</Modal>
```

### Modal with form

```tsx
const modalRef = React.useRef<HTMLDialogElement>(null)

<Modal ref={modalRef} header={{ heading: 'Rediger opplysninger' }}>
  <form
    onSubmit={(e) => {
      e.preventDefault()
      handleSubmit()
      modalRef.current?.close()
    }}
  >
    <Modal.Body>
      <TextField label="Navn" />
      <TextField label="E-post" type="email" />
    </Modal.Body>
    <Modal.Footer>
      <Button type="submit">Lagre</Button>
      <Button
        type="button"
        variant="secondary"
        onClick={() => modalRef.current?.close()}
      >
        Avbryt
      </Button>
    </Modal.Footer>
  </form>
</Modal>
```

### Custom header (manual aria)

When using `<Modal.Header>` instead of the `header` prop, you must set `aria-label` or `aria-labelledby` manually:

```tsx
<Modal ref={modalRef} aria-labelledby="my-heading">
	<Modal.Header>
		<Heading id="my-heading" size="medium">
			Egendefinert tittel
		</Heading>
	</Modal.Header>
	<Modal.Body>
		<BodyLong>Innhold.</BodyLong>
	</Modal.Body>
</Modal>
```

### Preventing close (unsaved changes)

```tsx
<Modal
	ref={modalRef}
	header={{ heading: 'Rediger' }}
	onBeforeClose={() => {
		if (hasUnsavedChanges) {
			return false // prevents close
		}
		return true
	}}
>
	{/* ... */}
</Modal>
```

## Accessibility

- **`header` prop auto-wires `aria-labelledby`.** If you use `<Modal.Header>` instead, you **must** set `aria-label` or `aria-labelledby` manually.
- **Focus is managed automatically.** The `<dialog>` element receives `autoFocus`, so focus moves into the modal on open and returns to the trigger on close.
- **Focus is trapped** inside the modal while open (native `<dialog>` behavior).
- **Escape key** closes the modal by default. Override with `onCancel={(e) => e.preventDefault()}` if needed (use sparingly).
- **Tab order in footer is reversed** — the primary button is visually on the right but comes first in tab order. (Note: the newer Dialog component fixes this.)
- If the trigger element is removed while the modal is open, manually set focus in `onClose`.
- Always include a visible close mechanism (X button or explicit cancel button).

## Testing

- Modal has a short open animation. In tests, add a small delay or enable `prefers-reduced-motion`.
- Use `ref.current?.showModal()` to open in tests, then query the dialog content.

```tsx
// Example test setup
const modalRef = React.createRef<HTMLDialogElement>()
render(<MyComponentWithModal ref={modalRef} />)

// Open modal
act(() => modalRef.current?.showModal())

// Assert content
expect(screen.getByText('Bekreft handling')).toBeInTheDocument()
```

## Do's and Don'ts

### ✅ Do

- Always provide a visible way to close the modal (close button or cancel button).
- Use the `header` prop for automatic `aria-labelledby` wiring.
- Keep content concise and focused on one task.
- Use the ref-based pattern (`useRef<HTMLDialogElement>` + `.showModal()` / `.close()`) — it is the established pattern in this codebase.
- Use `width="medium"` or `width="small"` for consistent sizing.
- Use `onBeforeClose` to guard against accidental data loss.
- Consider migrating to `Dialog` for new code (Modal will be deprecated in early 2027).

### 🚫 Don't

- Don't use modals for content requiring long or complex interaction.
- Don't use modals for information the user needs continuous access to.
- Don't use more than three buttons in the footer.
- Don't nest modals inside other modals.
- Don't forget `aria-label` / `aria-labelledby` if you omit the `header` prop.
- Don't use `closeOnBackdropClick={true}` if closing could cause data loss.
- Don't use modals for multi-step navigation flows.

## Mobile Behavior

Below the `sm` breakpoint (768px), margins are removed so the modal uses the full viewport width.

## Codebase Patterns

In this project, Modal is used with the **ref-based pattern**:

```tsx
// Typical pattern in pensjonskalkulator
const avbrytModalRef = React.useRef<HTMLDialogElement>(null)

// Open
avbrytModalRef.current?.showModal()

// Close
avbrytModalRef.current?.close()

// JSX
<Modal
  ref={avbrytModalRef}
  header={{ heading: intl.formatMessage({ id: 'some.key' }) }}
  width="medium"
>
  <Modal.Footer>
    <Button onClick={() => { doAction(); avbrytModalRef.current?.close() }}>
      Bekreft
    </Button>
    <Button variant="secondary" onClick={() => avbrytModalRef.current?.close()}>
      Avbryt
    </Button>
  </Modal.Footer>
</Modal>
```
