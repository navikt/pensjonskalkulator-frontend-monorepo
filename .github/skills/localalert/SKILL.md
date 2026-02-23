# LocalAlert — Aksel Design System

> **Package:** `@navikt/ds-react`
> **Documentation:** <https://aksel.nav.no/komponenter/core/localalert>

## Description

`LocalAlert` displays important messages about a specific part of the page. It is placed near the event or context it relates to. It uses a compound component pattern with sub-components for header, title, content, and close button.

> **Note:** `LocalAlert` is the modern compound-component replacement for the legacy `Alert` component. Prefer `LocalAlert` for new code. The legacy `Alert` is still exported but `LocalAlert` gives more structural control.

## Import

```tsx
import { LocalAlert } from '@navikt/ds-react'
```

## Sub-components

| Sub-component            | Description                                       |
| ------------------------ | ------------------------------------------------- |
| `LocalAlert.Header`      | Wrapper for the title and optional close button   |
| `LocalAlert.Title`       | Heading for the alert (default renders as `<h2>`) |
| `LocalAlert.Content`     | Body content area below the header                |
| `LocalAlert.CloseButton` | Dismissible close button (place inside Header)    |

## Props

### `LocalAlert` (root)

| Prop        | Type                                                  | Default      | Description                                                                                                         |
| ----------- | ----------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------- |
| `status`    | `"announcement" \| "success" \| "warning" \| "error"` | **required** | Type of alert. Changes color and icon.                                                                              |
| `size`      | `"medium" \| "small"`                                 | `"medium"`   | Changes padding and font-sizes.                                                                                     |
| `as`        | `"section" \| "div"`                                  | `"section"`  | HTML element for root. Use `"div"` to avoid duplicate landmark warnings when multiple alerts share the same status. |
| `children`  | `ReactNode`                                           | **required** | Component content (Header, Content, etc.).                                                                          |
| `className` | `string`                                              | —            | Additional CSS class.                                                                                               |
| `ref`       | `Ref<HTMLDivElement>`                                 | —            | Ref forwarded to root element.                                                                                      |

### `LocalAlert.Title`

| Prop | Type                                            | Default | Description                    |
| ---- | ----------------------------------------------- | ------- | ------------------------------ |
| `as` | `"h2" \| "h3" \| "h4" \| "h5" \| "h6" \| "div"` | `"h2"`  | Set the correct heading level. |

### `LocalAlert.CloseButton`

Standard `<button>` props (`React.ButtonHTMLAttributes<HTMLButtonElement>`). Use `onClick` to handle dismissal.

### `LocalAlert.Header`

Standard `<div>` props. Wraps `Title` and optionally `CloseButton`.

### `LocalAlert.Content`

Standard `<div>` props. Body content below the header.

## Usage Examples

### Basic — all statuses

```tsx
<LocalAlert status="announcement">
  <LocalAlert.Header>
    <LocalAlert.Title as="h2">Informasjon</LocalAlert.Title>
  </LocalAlert.Header>
  <LocalAlert.Content>
    Dette er en informasjonsmelding.
  </LocalAlert.Content>
</LocalAlert>

<LocalAlert status="success">
  <LocalAlert.Header>
    <LocalAlert.Title as="h2">Lagret</LocalAlert.Title>
  </LocalAlert.Header>
  <LocalAlert.Content>
    Endringene dine er lagret.
  </LocalAlert.Content>
</LocalAlert>

<LocalAlert status="warning">
  <LocalAlert.Header>
    <LocalAlert.Title as="h2">Advarsel</LocalAlert.Title>
  </LocalAlert.Header>
  <LocalAlert.Content>
    Du har ulagrede endringer.
  </LocalAlert.Content>
</LocalAlert>

<LocalAlert status="error">
  <LocalAlert.Header>
    <LocalAlert.Title as="h2">Feil</LocalAlert.Title>
  </LocalAlert.Header>
  <LocalAlert.Content>
    Noe gikk galt. Prøv igjen senere.
  </LocalAlert.Content>
</LocalAlert>
```

### Small size

```tsx
<LocalAlert status="warning" size="small">
	<LocalAlert.Header>
		<LocalAlert.Title as="h3">Advarsel</LocalAlert.Title>
	</LocalAlert.Header>
	<LocalAlert.Content>Kompakt varsel.</LocalAlert.Content>
</LocalAlert>
```

### Closable

```tsx
const [open, setOpen] = useState(true)

{
	open && (
		<LocalAlert status="success">
			<LocalAlert.Header>
				<LocalAlert.Title as="h2">Lagret</LocalAlert.Title>
				<LocalAlert.CloseButton onClick={() => setOpen(false)} />
			</LocalAlert.Header>
			<LocalAlert.Content>Endringene dine er lagret.</LocalAlert.Content>
		</LocalAlert>
	)
}
```

### Without heading (title-less)

```tsx
<LocalAlert status="announcement">
	<LocalAlert.Header>
		<LocalAlert.Title as="div">Kort melding uten heading</LocalAlert.Title>
	</LocalAlert.Header>
</LocalAlert>
```

### Avoiding landmark duplication

When multiple alerts of the same status appear on one page, use `as="div"` or add unique `aria-label`:

```tsx
<LocalAlert status="error" as="div">
	<LocalAlert.Header>
		<LocalAlert.Title as="h3">Felt-feil</LocalAlert.Title>
	</LocalAlert.Header>
	<LocalAlert.Content>Ugyldig verdi i feltet.</LocalAlert.Content>
</LocalAlert>
```

## Accessibility

| Concern                  | Detail                                                                                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`role="alert"`**       | The component has `role="alert"` by default, causing screen readers to announce it immediately. Override with `role={undefined}` when the alert is not dynamically injected.   |
| **Heading level**        | `<LocalAlert.Title />` renders as `<h2>` by default. Always set `as` to the correct level for the surrounding heading hierarchy.                                               |
| **Icon alt text**        | Icons have built-in alt text matching their severity: "Kunngjøring", "Suksess", "Advarsel", "Feil".                                                                            |
| **Landmark**             | Root renders as `<section>` by default. Multiple alerts with the same status can trigger axe-core landmark-unique warnings — use `as="div"` or unique `aria-label` to resolve. |
| **InfoCard alternative** | If the content is static / not triggered by an event, consider using `InfoCard` instead (no `role="alert"`).                                                                   |

## Best Practices

### ✅ Do

- Place the alert close to the event or content it refers to.
- Use one alert at a time — multiple alerts compete for attention.
- Write clear, actionable content especially for errors — tell the user what to do next.
- Set the correct heading level with `as` on `LocalAlert.Title`.
- Use `role={undefined}` for alerts that are present on page load (not dynamically injected).
- Use `as="div"` on the root when you have multiple alerts with the same status on one page.

### ❌ Don't

- Don't use LocalAlert as a toast or empty-state placeholder.
- Don't rely solely on color/icon to communicate meaning — the text must be self-explanatory.
- Don't leave heading level as default `h2` without checking context.
- Don't use `role="alert"` for static informational content that doesn't need immediate announcement.
- Don't nest multiple LocalAlerts inside each other.

## Legacy `Alert` Component

The legacy `Alert` component is still available for backward compatibility. It uses a simpler flat API:

```tsx
import { Alert } from "@navikt/ds-react";

<Alert variant="info">Informasjonsmelding</Alert>
<Alert variant="warning">Advarsel</Alert>
<Alert variant="error">Feilmelding</Alert>
<Alert variant="success">Suksessmelding</Alert>
```

### Legacy `Alert` Props

| Prop              | Type                                          | Default      | Description                            |
| ----------------- | --------------------------------------------- | ------------ | -------------------------------------- |
| `variant`         | `"error" \| "warning" \| "info" \| "success"` | **required** | Severity level.                        |
| `size`            | `"medium" \| "small"`                         | `"medium"`   | Padding and font size.                 |
| `fullWidth`       | `boolean`                                     | `false`      | Removes border-radius.                 |
| `contentMaxWidth` | `boolean`                                     | `true`       | Limits content width to 43.5rem.       |
| `inline`          | `boolean`                                     | `false`      | Removes background, border, padding.   |
| `closeButton`     | `boolean`                                     | `false`      | Shows close button (requires onClose). |
| `onClose`         | `() => void`                                  | —            | Close callback (requires closeButton). |

> **Migration note:** When writing new code, prefer `LocalAlert` over the legacy `Alert`. The compound pattern gives better control over structure and heading levels.
