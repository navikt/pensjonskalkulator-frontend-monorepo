# ExpansionCard — `@navikt/ds-react`

Collapsible card that groups information or actions in a box users can expand and collapse. Built as a `<section>` element for screen reader context.

## Import

```tsx
import { ExpansionCard } from '@navikt/ds-react'
```

## Sub-components

| Component                   | Element              | Description                                                           |
| --------------------------- | -------------------- | --------------------------------------------------------------------- |
| `ExpansionCard`             | `<section>`          | Root wrapper — renders a landmark section                             |
| `ExpansionCard.Header`      | `<div>`              | Clickable header area (entire header is clickable via pseudo-element) |
| `ExpansionCard.Title`       | `<h2>` (overridable) | Title text inside the header                                          |
| `ExpansionCard.Description` | `<p>`                | Optional description text below the title                             |
| `ExpansionCard.Content`     | `<div>`              | Collapsible content area                                              |

## Props

### ExpansionCard

| Prop              | Type                                                                                                                                                        | Default     | Description                                        |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | -------------------------------------------------- |
| `aria-label`      | `string`                                                                                                                                                    | —           | Required if `aria-labelledby` is not set           |
| `aria-labelledby` | `string`                                                                                                                                                    | —           | Required if `aria-label` is not set                |
| `open`            | `boolean`                                                                                                                                                   | —           | Controlled open state (disables automatic control) |
| `defaultOpen`     | `boolean`                                                                                                                                                   | `false`     | Initial open state (uncontrolled)                  |
| `onToggle`        | `(open: boolean) => void`                                                                                                                                   | —           | Callback when card is opened/closed                |
| `size`            | `"medium" \| "small"`                                                                                                                                       | `"medium"`  | Size variant                                       |
| `data-color`      | `"accent" \| "neutral" \| "info" \| "success" \| "warning" \| "danger" \| "meta-purple" \| "meta-lime" \| "brand-beige" \| "brand-blue" \| "brand-magenta"` | `"neutral"` | Color variant                                      |
| `className`       | `string`                                                                                                                                                    | —           | Additional CSS class                               |
| `ref`             | `Ref<HTMLDivElement>`                                                                                                                                       | —           | Ref to root element                                |

### ExpansionCard.Header

| Prop        | Type                  | Default | Description          |
| ----------- | --------------------- | ------- | -------------------- |
| `children`  | `ReactNode`           | —       | Header content       |
| `className` | `string`              | —       | Additional CSS class |
| `ref`       | `Ref<HTMLDivElement>` | —       | Ref to root element  |

### ExpansionCard.Title

| Prop        | Type                             | Default    | Description                          |
| ----------- | -------------------------------- | ---------- | ------------------------------------ |
| `size`      | `"large" \| "medium" \| "small"` | `"medium"` | Text sizing                          |
| `as`        | `React.ElementType`              | —          | Override heading element (e.g. `h3`) |
| `children`  | `ReactNode`                      | —          | Title text                           |
| `className` | `string`                         | —          | Additional CSS class                 |
| `ref`       | `Ref<HTMLHeadingElement>`        | —          | Ref to heading element               |

### ExpansionCard.Description

| Prop        | Type                        | Default | Description          |
| ----------- | --------------------------- | ------- | -------------------- |
| `children`  | `ReactNode`                 | —       | Description text     |
| `className` | `string`                    | —       | Additional CSS class |
| `ref`       | `Ref<HTMLParagraphElement>` | —       | Ref to `<p>` element |

### ExpansionCard.Content

| Prop        | Type                  | Default | Description          |
| ----------- | --------------------- | ------- | -------------------- |
| `children`  | `ReactNode`           | —       | Collapsible content  |
| `className` | `string`              | —       | Additional CSS class |
| `ref`       | `Ref<HTMLDivElement>` | —       | Ref to root element  |

## Usage Examples

### Basic — title only

```tsx
<ExpansionCard aria-label="Utbetaling av sykepenger">
	<ExpansionCard.Header>
		<ExpansionCard.Title>Utbetaling av sykepenger</ExpansionCard.Title>
	</ExpansionCard.Header>
	<ExpansionCard.Content>
		<BodyLong>Innhold som vises når kortet er åpent.</BodyLong>
	</ExpansionCard.Content>
</ExpansionCard>
```

### With description

```tsx
<ExpansionCard aria-label="Din sykmelding">
	<ExpansionCard.Header>
		<ExpansionCard.Title size="small">Din sykmelding</ExpansionCard.Title>
		<ExpansionCard.Description>
			Gjelder fra 01.01.2024 til 31.01.2024
		</ExpansionCard.Description>
	</ExpansionCard.Header>
	<ExpansionCard.Content>
		<BodyLong>Detaljer om sykmeldingen din.</BodyLong>
	</ExpansionCard.Content>
</ExpansionCard>
```

### With aria-labelledby

```tsx
<ExpansionCard aria-labelledby="card-title">
	<ExpansionCard.Header>
		<ExpansionCard.Title id="card-title" size="small">
			Oppsummering
		</ExpansionCard.Title>
		<ExpansionCard.Description>
			Se detaljer om beregningen
		</ExpansionCard.Description>
	</ExpansionCard.Header>
	<ExpansionCard.Content>
		<BodyLong>Beregningsdetaljer her.</BodyLong>
	</ExpansionCard.Content>
</ExpansionCard>
```

### Controlled

```tsx
function ControlledCard() {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<ExpansionCard
			aria-label="Kontrollert kort"
			open={isOpen}
			onToggle={(open) => setIsOpen(open)}
		>
			<ExpansionCard.Header>
				<ExpansionCard.Title>Kontrollert kort</ExpansionCard.Title>
			</ExpansionCard.Header>
			<ExpansionCard.Content>
				<BodyLong>Kontrollert innhold.</BodyLong>
			</ExpansionCard.Content>
		</ExpansionCard>
	)
}
```

### Default open

```tsx
<ExpansionCard aria-label="Åpent kort" defaultOpen>
	<ExpansionCard.Header>
		<ExpansionCard.Title>Starter åpent</ExpansionCard.Title>
	</ExpansionCard.Header>
	<ExpansionCard.Content>
		<BodyLong>Innholdet vises med én gang.</BodyLong>
	</ExpansionCard.Content>
</ExpansionCard>
```

### Small size

```tsx
<ExpansionCard aria-label="Kompakt kort" size="small">
	<ExpansionCard.Header>
		<ExpansionCard.Title size="small">Kompakt kort</ExpansionCard.Title>
	</ExpansionCard.Header>
	<ExpansionCard.Content>
		<BodyLong size="small">Kompakt innhold.</BodyLong>
	</ExpansionCard.Content>
</ExpansionCard>
```

## Accessibility

- **Requires `aria-label` or `aria-labelledby`** — the component renders as a `<section>` landmark element. Each card must have a unique accessible label describing the section.
- **Entire header is clickable** — implemented via a pseudo-element technique, so rich content works in the header without nesting everything inside a `<button>`. Trade-off: users cannot select/copy text in the header.
- **Screen reader interaction** — screen readers announce the section context. The expand/collapse button has its own accessible label.
- **Place close/open button on the right** — follows the standardized pattern for expandable panels (Jakob's Law). The clear border guides the user to the button via the Gestalt principle of continuity.
- **Set a reasonable max-width** — keep header text and the toggle button visually connected. Avoid full-width layouts that separate them.

## Do's and Don'ts

### ✅ Do

- Always provide `aria-label` or `aria-labelledby` with a **unique** descriptive label.
- Use for supplementary information users may optionally expand (e.g., detailed explanations, extra context).
- Keep content focused — the header should clearly introduce what users will see when they expand.
- Use `onToggle` for analytics logging of open/close events.
- Set a contextual max-width so header and toggle button stay visually connected.
- Consider using `Accordion` when you have many collapsible items grouped together.

### 🚫 Don't

- Don't hide **critical information** users must see — people tend to skip collapsed content.
- Don't use many ExpansionCards in sequence — use `Accordion` instead.
- Don't put large amounts of content inside — consider a dedicated page instead.
- Don't put content that needs headings inside — headings shouldn't be hidden in collapsible sections.
- Don't use without `aria-label` or `aria-labelledby` — this breaks screen reader navigation.
- Don't nest interactive elements (links, buttons) inside `ExpansionCard.Header`.

## Common Patterns in This Codebase

### Wrapper with logging

This repo wraps `ExpansionCard` in a custom component that logs open/close events via the `logger` utility:

```tsx
import { ExpansionCard as ExpansionCardAksel } from '@navikt/ds-react'

import { ExpansionCard } from '@/components/common/ExpansionCard'

// The wrapper adds a `name` prop for logging and delegates to the Aksel component.
// Sub-components (Header, Title, Description, Content) are used from the Aksel import directly.
;<ExpansionCard name="Detaljer om pensjon" aria-labelledby="card-title">
	<ExpansionCardAksel.Header>
		<ExpansionCardAksel.Title id="card-title" size="small">
			Detaljer om pensjon
		</ExpansionCardAksel.Title>
		<ExpansionCardAksel.Description>
			Se hva som inngår i beregningen
		</ExpansionCardAksel.Description>
	</ExpansionCardAksel.Header>
	<ExpansionCardAksel.Content>
		<BodyLong>Innhold her.</BodyLong>
	</ExpansionCardAksel.Content>
</ExpansionCard>
```

> **Note:** When using the local `ExpansionCard` wrapper, sub-components (`Header`, `Title`, `Description`, `Content`) must still be accessed from the Aksel import (`ExpansionCardAksel.Header` etc.), since the wrapper only wraps the root component.

## See Also

- [Accordion](/komponenter/core/accordion) — for multiple collapsible items grouped together
- [ReadMore](/komponenter/core/readmore) — for inline show/hide of supplementary text
