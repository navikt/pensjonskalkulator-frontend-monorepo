# InlineMessage — `@navikt/ds-react`

InlineMessage displays short status messages inline with page content. Use it to show contextual information, success confirmations, warnings, or errors directly where they are relevant.

## Import

```tsx
import { InlineMessage } from '@navikt/ds-react'
```

## Props

| Prop        | Type                                          | Default    | Description                                                       |
| ----------- | --------------------------------------------- | ---------- | ----------------------------------------------------------------- |
| `children`  | `ReactNode`                                   | —          | The message content                                               |
| `status`    | `"info" \| "success" \| "warning" \| "error"` | —          | **Required.** Determines the icon and color scheme of the message |
| `size`      | `"medium" \| "small"`                         | `"medium"` | Controls the size of the message                                  |
| `className` | `string`                                      | —          | Custom CSS class applied to the root element                      |
| `ref`       | `Ref<HTMLDivElement>`                         | —          | Ref forwarded to the underlying `<div>`                           |

> **Note:** `data-color` has no effect on InlineMessage.

## Usage Examples

### Basic variants

```tsx
<InlineMessage status="info">
  Kvalitetssikring må gjennomføres før vedtaket kan fattes.
</InlineMessage>

<InlineMessage status="success">
  Utkastet ble lagret klokken 14:35.
</InlineMessage>

<InlineMessage status="warning">
  Ingen registrert postadresse for bruker, sjekk kontaktinformasjon.
</InlineMessage>

<InlineMessage status="error">
  Kan ikke fatte vedtaket fordi brukeren er inaktiv i Arena.
</InlineMessage>
```

### Small size

```tsx
<InlineMessage status="info" size="small">
	Oppdatert for 5 minutter siden.
</InlineMessage>
```

### Dynamic message with role

```tsx
<InlineMessage status="error" role="alert">
  Noe gikk galt ved lagring. Prøv igjen.
</InlineMessage>

<InlineMessage status="success" role="status">
  Endringene ble lagret.
</InlineMessage>
```

### Inside a form

```tsx
<TextField label="E-post" />
<InlineMessage status="warning" size="small">
  Vi fant ingen konto knyttet til denne e-posten.
</InlineMessage>
```

### With react-intl

```tsx
const intl = useIntl()

<InlineMessage status="info">
  {intl.formatMessage({ id: 'inlinemessage.info.text' })}
</InlineMessage>
```

### Conditional rendering

```tsx
{
	lagret && (
		<InlineMessage status="success" role="status">
			Beregningen ble lagret.
		</InlineMessage>
	)
}
```

## Accessibility

- If InlineMessage **appears dynamically** on the page (e.g., after form submission or an async operation), set `role="alert"` for urgent/critical messages or `role="status"` for non-urgent confirmations. Without a role, dynamically inserted messages are not announced by screen readers.
- Use `role="alert"` sparingly — it interrupts the screen reader immediately. Reserve it for errors and critical warnings.
- Use `role="status"` (or `aria-live="polite"`) for success confirmations and informational updates that do not require immediate attention.
- If the message relates to a specific form field, also link it with `aria-describedby` on the field pointing to the InlineMessage's `id`.
- The component renders a `<div>` — do **not** nest it inside a `<p>` or other element that only allows phrasing content.

## Do's and Don'ts

### ✅ Do

- Use InlineMessage for **short, contextual** status messages close to the content they describe.
- Choose the correct `status` variant to match the semantic meaning of the message (info, success, warning, error).
- Add `role="alert"` or `role="status"` when the message appears dynamically after user interaction.
- Keep content brief — one or two sentences maximum.
- Use `size="small"` for secondary or supplementary messages where the default size feels too prominent.

### 🚫 Don't

- Don't use InlineMessage for **page-level banners** — use `Alert` instead for prominent, top-of-page notifications.
- Don't overuse InlineMessage on a single page — if everything is highlighted, nothing stands out. "Less is more."
- Don't use `role="alert"` on messages that are **always visible** on initial render — roles are for dynamic content changes.
- Don't put **long explanations** in InlineMessage — use `ReadMore` or a dedicated section for detailed content.
- Don't use InlineMessage as a replacement for form field validation errors — prefer the `error` prop on form components.

## Common Patterns

### Suitable for

- Short status messages shown in context (e.g., "Saved at 14:35", "No address registered")
- Inline warnings or errors within a workflow or form section
- Confirmation messages after an action completes
- Informational notes next to content that needs clarification

### Not suitable for

- Page-level alerts or banners (use `Alert`)
- Long explanatory content (use `ReadMore` or `ExpansionCard`)
- Tooltips or term definitions (use `HelpText`)
- Form field validation errors (use the `error` prop on `TextField`, `Select`, etc.)
