# GlobalAlert — `@navikt/ds-react`

GlobalAlert displays prominent alerts that affect the entire application. It is placed at the top of the page, spans full width, and is used for urgent system messages or important announcements.

## Import

```tsx
import { GlobalAlert } from '@navikt/ds-react'
```

## Sub-components

| Component                 | Element     | Description                              |
| ------------------------- | ----------- | ---------------------------------------- |
| `GlobalAlert`             | `<section>` | Root wrapper with status color and icon  |
| `GlobalAlert.Header`      | `<div>`     | Contains icon, title, and close button   |
| `GlobalAlert.Title`       | `<h2>`      | Alert heading (set level with `as` prop) |
| `GlobalAlert.Content`     | `<div>`     | Main message body                        |
| `GlobalAlert.CloseButton` | `<button>`  | Optional dismiss button                  |

## Props

### `GlobalAlert`

| Prop        | Type                                                  | Default     | Description                                                                                                          |
| ----------- | ----------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------- |
| `status`    | `"announcement" \| "success" \| "warning" \| "error"` | —           | **Required.** Type of alert                                                                                          |
| `centered`  | `boolean`                                             | `true`      | Whether title and content are centered                                                                               |
| `size`      | `"medium" \| "small"`                                 | `"medium"`  | Changes the size                                                                                                     |
| `as`        | `"div" \| "section"`                                  | `"section"` | Root HTML element. Use `"div"` to avoid axe-core landmark-unique warnings when multiple alerts share the same status |
| `children`  | `ReactNode`                                           | —           | Should include `GlobalAlert.Header` and optionally `GlobalAlert.Content`                                             |
| `className` | `string`                                              | —           | Additional CSS class                                                                                                 |
| `ref`       | `Ref<HTMLDivElement>`                                 | —           | Ref to root element                                                                                                  |

### `GlobalAlert.Header`

| Prop        | Type                  | Default | Description          |
| ----------- | --------------------- | ------- | -------------------- |
| `children`  | `ReactNode`           | —       | Title and close btn  |
| `className` | `string`              | —       | Additional CSS class |
| `ref`       | `Ref<HTMLDivElement>` | —       | Ref to root element  |

### `GlobalAlert.Title`

| Prop        | Type                                            | Default | Description            |
| ----------- | ----------------------------------------------- | ------- | ---------------------- |
| `children`  | `ReactNode`                                     | —       | Title text             |
| `as`        | `"h2" \| "h3" \| "h4" \| "h5" \| "h6" \| "div"` | `"h2"`  | Heading level element  |
| `className` | `string`                                        | —       | Additional CSS class   |
| `ref`       | `Ref<HTMLHeadingElement>`                       | —       | Ref to heading element |

### `GlobalAlert.Content`

| Prop        | Type                  | Default | Description          |
| ----------- | --------------------- | ------- | -------------------- |
| `children`  | `ReactNode`           | —       | Message body content |
| `className` | `string`              | —       | Additional CSS class |
| `ref`       | `Ref<HTMLDivElement>` | —       | Ref to root element  |

### `GlobalAlert.CloseButton`

| Prop        | Type                     | Default | Description           |
| ----------- | ------------------------ | ------- | --------------------- |
| `onClick`   | `() => void`             | —       | Close button handler  |
| `className` | `string`                 | —       | Additional CSS class  |
| `ref`       | `Ref<HTMLButtonElement>` | —       | Ref to button element |

## Usage Examples

### Basic announcement

```tsx
<GlobalAlert status="announcement">
	<GlobalAlert.Header>
		<GlobalAlert.Title>Planlagt vedlikehold</GlobalAlert.Title>
	</GlobalAlert.Header>
	<GlobalAlert.Content>
		Systemet vil være utilgjengelig natt til søndag grunnet planlagt
		vedlikehold.
	</GlobalAlert.Content>
</GlobalAlert>
```

### Warning with close button

```tsx
function SystemWarning() {
	const [open, setOpen] = useState(true)

	if (!open) return null

	return (
		<GlobalAlert status="warning">
			<GlobalAlert.Header>
				<GlobalAlert.Title>Ustabile tjenester</GlobalAlert.Title>
				<GlobalAlert.CloseButton onClick={() => setOpen(false)} />
			</GlobalAlert.Header>
			<GlobalAlert.Content>
				Vi opplever ustabilitet i noen av våre tjenester. Prøv igjen senere.
			</GlobalAlert.Content>
		</GlobalAlert>
	)
}
```

### Error status

```tsx
<GlobalAlert status="error">
	<GlobalAlert.Header>
		<GlobalAlert.Title as="h3">Tjenesten er nede</GlobalAlert.Title>
	</GlobalAlert.Header>
	<GlobalAlert.Content>
		Vi jobber med å løse problemet. Prøv igjen om noen minutter.
	</GlobalAlert.Content>
</GlobalAlert>
```

### Small size, left-aligned

```tsx
<GlobalAlert status="success" size="small" centered={false}>
	<GlobalAlert.Header>
		<GlobalAlert.Title>Oppdatering fullført</GlobalAlert.Title>
	</GlobalAlert.Header>
	<GlobalAlert.Content>Alle endringer er lagret.</GlobalAlert.Content>
</GlobalAlert>
```

### Header only (no content body)

```tsx
<GlobalAlert status="announcement">
	<GlobalAlert.Header>
		<GlobalAlert.Title>Kort kunngjøring uten ekstra innhold</GlobalAlert.Title>
	</GlobalAlert.Header>
</GlobalAlert>
```

### With links and actions inside content

```tsx
import { Button, Link } from '@navikt/ds-react'

;<GlobalAlert status="warning">
	<GlobalAlert.Header>
		<GlobalAlert.Title>Viktig melding</GlobalAlert.Title>
		<GlobalAlert.CloseButton onClick={handleClose} />
	</GlobalAlert.Header>
	<GlobalAlert.Content>
		Les mer om situasjonen på{' '}
		<Link href="/driftsmeldinger">driftsmeldinger</Link>.{' '}
		<Button size="small">Oppdater siden</Button>
	</GlobalAlert.Content>
</GlobalAlert>
```

## Accessibility

- **`role="alert"`** is applied automatically — screen readers announce content immediately when the component appears in the DOM.
- **Icons have default alt text** communicating severity: "Kunngjøring", "Suksess", "Advarsel", "Feil".
- **Heading level**: `GlobalAlert.Title` defaults to `<h2>`. Always set the correct level with the `as` prop to maintain a logical heading hierarchy on the page.
- **Landmark uniqueness**: The root defaults to `<section>`. If multiple GlobalAlerts with the same status appear on one page, use `as="div"` or add unique `aria-label`/`aria-labelledby` to avoid axe-core `landmark-unique` warnings.

## Do's and Don'ts

### ✅ Do

- Show **only one** GlobalAlert at a time — multiple alerts take significant space and push content down.
- Place at the **very top** of the page, above all other content.
- Write **clear, explicit** content — not all users understand icon/color meaning alone.
- For **error** alerts, tell the user what to do next.
- Set the correct **heading level** with `as` on `GlobalAlert.Title`.
- Use the `CloseButton` for **dismissible** announcements (e.g., maintenance notices).
- Manage open/closed state with `useState` when using `CloseButton`.

### 🚫 Don't

- Don't show **multiple** GlobalAlerts stacked — combine messages into one alert.
- Don't use GlobalAlert as a **toast** notification or inline feedback.
- Don't use it for **empty state** messaging.
- Don't leave heading level as default `h2` if the page context requires a different level.
- Don't use `status="error"` for **form validation** — use inline `Alert` or field-level errors instead.
- Don't put **critical form content** after a GlobalAlert that pushes it out of view.

## Common Patterns in This Codebase

### Conditional rendering with state

```tsx
function DriftsMelding() {
	const intl = useIntl()
	const [visible, setVisible] = useState(true)

	if (!visible) return null

	return (
		<GlobalAlert status="warning">
			<GlobalAlert.Header>
				<GlobalAlert.Title as="h2">
					{intl.formatMessage({ id: 'driftsmelding.title' })}
				</GlobalAlert.Title>
				<GlobalAlert.CloseButton onClick={() => setVisible(false)} />
			</GlobalAlert.Header>
			<GlobalAlert.Content>
				<FormattedMessage id="driftsmelding.body" />
			</GlobalAlert.Content>
		</GlobalAlert>
	)
}
```

### API-driven alert

```tsx
function ApiStatusAlert() {
	const { data } = useGetDriftsmeldingQuery()

	if (!data?.melding) return null

	return (
		<GlobalAlert status={data.status}>
			<GlobalAlert.Header>
				<GlobalAlert.Title as="h2">{data.title}</GlobalAlert.Title>
			</GlobalAlert.Header>
			<GlobalAlert.Content>{data.melding}</GlobalAlert.Content>
		</GlobalAlert>
	)
}
```
