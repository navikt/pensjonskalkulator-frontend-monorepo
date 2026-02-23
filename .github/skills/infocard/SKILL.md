# InfoCard — `@navikt/ds-react`

InfoCard highlights content on a page. It is styled with color and icon to help users understand the message. Use it for content that deserves extra attention, but not for critical alerts (use `Alert` for those).

## Import

```tsx
import { InfoCard } from '@navikt/ds-react'
```

## Sub-components

| Component          | Element | Description                                 |
| ------------------ | ------- | ------------------------------------------- |
| `InfoCard`         | `<div>` | Root wrapper (or `<section>` via `as` prop) |
| `InfoCard.Header`  | `<div>` | Header area with optional icon              |
| `InfoCard.Title`   | `<h2>`  | Title heading (configurable level via `as`) |
| `InfoCard.Content` | `<div>` | Body content area                           |

## Props

### `InfoCard`

| Prop         | Type                                                                                                                                                        | Default    | Description                                                                        |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------- |
| `children`   | `ReactNode`                                                                                                                                                 | —          | Component content                                                                  |
| `size`       | `"medium" \| "small"`                                                                                                                                       | `"medium"` | Changes the size of the card                                                       |
| `data-color` | `"accent" \| "neutral" \| "info" \| "success" \| "warning" \| "danger" \| "meta-purple" \| "meta-lime" \| "brand-beige" \| "brand-blue" \| "brand-magenta"` | —          | Sets the visual color theme                                                        |
| `as`         | `"div" \| "section"`                                                                                                                                        | `"div"`    | Root HTML element. When using `section`, provide `aria-label` or `aria-labelledby` |
| `className`  | `string`                                                                                                                                                    | —          | Additional CSS class                                                               |
| `ref`        | `Ref<HTMLDivElement>`                                                                                                                                       | —          | Ref to root element                                                                |

### `InfoCard.Header`

| Prop        | Type                  | Default | Description                          |
| ----------- | --------------------- | ------- | ------------------------------------ |
| `icon`      | `ReactNode`           | —       | Icon displayed in the header         |
| `children`  | `ReactNode`           | —       | Header content (typically the Title) |
| `className` | `string`              | —       | Additional CSS class                 |
| `ref`       | `Ref<HTMLDivElement>` | —       | Ref to root element                  |

### `InfoCard.Title`

| Prop        | Type                                            | Default | Description                |
| ----------- | ----------------------------------------------- | ------- | -------------------------- |
| `children`  | `ReactNode`                                     | —       | Title text                 |
| `as`        | `"h2" \| "h3" \| "h4" \| "h5" \| "h6" \| "div"` | `"h2"`  | HTML element for the title |
| `className` | `string`                                        | —       | Additional CSS class       |
| `ref`       | `Ref<HTMLHeadingElement>`                       | —       | Ref to heading element     |

### `InfoCard.Content`

| Prop        | Type                  | Default | Description          |
| ----------- | --------------------- | ------- | -------------------- |
| `children`  | `ReactNode`           | —       | Body content         |
| `className` | `string`              | —       | Additional CSS class |
| `ref`       | `Ref<HTMLDivElement>` | —       | Ref to root element  |

## Usage Examples

### Basic

```tsx
<InfoCard data-color="info">
	<InfoCard.Header>
		<InfoCard.Title>Informasjon</InfoCard.Title>
	</InfoCard.Header>
	<InfoCard.Content>
		Her er noe viktig informasjon du bør vite om.
	</InfoCard.Content>
</InfoCard>
```

### With icon

```tsx
import { InformationIcon } from '@navikt/aksel-icons'

;<InfoCard data-color="info">
	<InfoCard.Header icon={<InformationIcon aria-hidden />}>
		<InfoCard.Title>Fremhevet informasjon</InfoCard.Title>
	</InfoCard.Header>
	<InfoCard.Content>
		InfoCard brukes for å fremheve informasjon på en side.
	</InfoCard.Content>
</InfoCard>
```

### Small size

```tsx
<InfoCard size="small" data-color="neutral">
	<InfoCard.Header>
		<InfoCard.Title as="h3">Kompakt variant</InfoCard.Title>
	</InfoCard.Header>
	<InfoCard.Content>En mindre versjon av kortet.</InfoCard.Content>
</InfoCard>
```

### Success variant with icon

```tsx
import { CheckmarkCircleIcon } from '@navikt/aksel-icons'

;<InfoCard data-color="success">
	<InfoCard.Header icon={<CheckmarkCircleIcon aria-hidden />}>
		<InfoCard.Title as="h3">Alt er i orden</InfoCard.Title>
	</InfoCard.Header>
	<InfoCard.Content>Beregningen din er fullført.</InfoCard.Content>
</InfoCard>
```

### Warning variant

```tsx
import { ExclamationmarkTriangleIcon } from '@navikt/aksel-icons'

;<InfoCard data-color="warning">
	<InfoCard.Header icon={<ExclamationmarkTriangleIcon aria-hidden />}>
		<InfoCard.Title as="h3">Merk</InfoCard.Title>
	</InfoCard.Header>
	<InfoCard.Content>
		Denne informasjonen kan påvirke beregningen din.
	</InfoCard.Content>
</InfoCard>
```

### As section landmark

```tsx
<InfoCard
	as="section"
	aria-label="Viktig informasjon om pensjon"
	data-color="accent"
>
	<InfoCard.Header>
		<InfoCard.Title>Pensjonsinfo</InfoCard.Title>
	</InfoCard.Header>
	<InfoCard.Content>
		Innhold som utgjør en logisk seksjon på siden.
	</InfoCard.Content>
</InfoCard>
```

## Accessibility

- **Heading level**: `InfoCard.Title` renders as `<h2>` by default. Always set `as` to the correct heading level for your page hierarchy (e.g., `as="h3"` inside an `<h2>` section).
- **Icon accessibility**: If the icon does not add meaning beyond the text, hide it with `aria-hidden`. Only give the icon a `title` if it conveys information not present in the text.
- **Section landmark**: When using `as="section"`, always provide `aria-label` or `aria-labelledby`. If multiple InfoCards appear on the same page as sections, use unique labels to avoid `axe-core` "landmark-unique" warnings.

## Do's and Don'ts

### ✅ Do

- Use InfoCard to highlight content that deserves extra attention.
- Choose a `data-color` and icon that match the tone of the message.
- Set the correct heading level with `as` on `InfoCard.Title`.
- Keep content concise and focused.
- Use `aria-hidden` on decorative icons.

### 🚫 Don't

- Don't use InfoCard for critical alerts or errors — use `Alert` instead.
- Don't overuse InfoCard on a page — if everything is highlighted, nothing stands out.
- Don't leave the default `h2` heading level if the context requires a different level.
- Don't use InfoCard as a replacement for `ReadMore` or `ExpansionCard` when content should be collapsible.
- Don't put interactive elements (links, buttons) inside the header — place them in `InfoCard.Content`.

## Color Reference

| `data-color`    | Use case                                               |
| --------------- | ------------------------------------------------------ |
| `accent`        | Default emphasis, general highlighting                 |
| `neutral`       | Subdued, informational without strong semantic meaning |
| `info`          | Informational content                                  |
| `success`       | Positive outcomes, confirmations                       |
| `warning`       | Caution, things to be aware of                         |
| `danger`        | Serious issues (but not blocking alerts)               |
| `meta-purple`   | Decorative / meta information                          |
| `meta-lime`     | Decorative / meta information                          |
| `brand-beige`   | NAV brand styling                                      |
| `brand-blue`    | NAV brand styling                                      |
| `brand-magenta` | NAV brand styling                                      |
