# List — Aksel Design System

**Package:** `@navikt/ds-react`
**Import:** `import { List } from '@navikt/ds-react'`
**Documentation:** https://aksel.nav.no/komponenter/core/list
**Status:** Stable

## Description

List displays content in a concise, scannable format — ideal for summarising text or listing criteria. Renders as an unordered (`<ul>`) or ordered (`<ol>`) list with Aksel typography and spacing.

## Sub-components

| Component   | Element | Description          |
| ----------- | ------- | -------------------- |
| `List`      | `<div>` | List wrapper         |
| `List.Item` | `<li>`  | Individual list item |

## Props

### List

| Prop              | Type                             | Default    | Description                                     |
| ----------------- | -------------------------------- | ---------- | ----------------------------------------------- |
| `as`              | `'ul' \| 'ol'`                   | `'ul'`     | HTML list element to render                     |
| `size`            | `'small' \| 'medium' \| 'large'` | `'medium'` | Controls margin-block and font size             |
| `className`       | `string`                         | —          | Additional CSS class                            |
| `ref`             | `Ref<HTMLDivElement>`            | —          | Ref forwarded to the wrapper div                |
| `aria-label`      | `string`                         | —          | Accessible label for the list                   |
| `aria-labelledby` | `string`                         | —          | ID of element that labels the list              |
| ~~`title`~~       | ~~`string`~~                     | —          | **Deprecated** — use `<Heading>` above the list |

### List.Item

| Prop        | Type                 | Default | Description                                             |
| ----------- | -------------------- | ------- | ------------------------------------------------------- |
| `children`  | `ReactNode`          | —       | List item content (required)                            |
| `title`     | `string`             | —       | Bold title rendered above the item content              |
| `icon`      | `ReactNode`          | —       | Custom icon replacing the bullet (unordered lists only) |
| `className` | `string`             | —       | Additional CSS class                                    |
| `ref`       | `Ref<HTMLLIElement>` | —       | Ref forwarded to the `<li>` element                     |

## Usage Examples

### Unordered list (default)

```tsx
import { List } from '@navikt/ds-react'

;<List>
	<List.Item>Alderspensjon fra folketrygden</List.Item>
	<List.Item>Avtalefestet pensjon (AFP)</List.Item>
	<List.Item>Pensjon fra andre ordninger</List.Item>
</List>
```

### Ordered list

```tsx
<List as="ol">
	<List.Item>Logg inn med BankID</List.Item>
	<List.Item>Fyll ut skjemaet</List.Item>
	<List.Item>Send inn søknaden</List.Item>
</List>
```

### With item titles

```tsx
<List>
	<List.Item title="Alderspensjon">
		Pensjon fra folketrygden basert på opptjening.
	</List.Item>
	<List.Item title="AFP">
		Avtalefestet pensjon for ansatte i privat eller offentlig sektor.
	</List.Item>
</List>
```

### With custom icons

```tsx
import { CheckmarkIcon } from '@navikt/aksel-icons'

;<List>
	<List.Item icon={<CheckmarkIcon aria-hidden />}>
		Søknaden er mottatt
	</List.Item>
	<List.Item icon={<CheckmarkIcon aria-hidden />}>Vedtak er fattet</List.Item>
</List>
```

### Nested list

```tsx
<List>
	<List.Item>
		Pensjonsgivende inntekt
		<List>
			<List.Item>Lønnsinntekt</List.Item>
			<List.Item>Næringsinntekt</List.Item>
		</List>
	</List.Item>
	<List.Item>Trygdetid</List.Item>
</List>
```

### Small size

```tsx
<List size="small">
	<List.Item>Kompakt listepunkt</List.Item>
	<List.Item>Mindre tekst og avstand</List.Item>
</List>
```

### With heading (replaces deprecated title prop)

```tsx
import { Heading, List } from '@navikt/ds-react'

<Heading size="small" level="3">Krav for å få alderspensjon</Heading>
<List>
  <List.Item>Du må ha bodd i Norge i minst 5 år</List.Item>
  <List.Item>Du må være fylt 67 år</List.Item>
</List>
```

## Accessibility

- The component renders `role="list"` on the inner `<ul>`/`<ol>` element, ensuring screen readers announce it as a list.
- Use `aria-label` or `aria-labelledby` to give the list an accessible name when context is not clear from surrounding content.
- Custom icons on `List.Item` should include `aria-hidden` since they are decorative — the bullet/number role is handled by the list semantics.
- Icons are **only supported on unordered lists** (`as="ul"`). A console warning is emitted if `icon` is used with `as="ol"`.

## Common Patterns

### Sanity portable text integration

```tsx
// Map Sanity block content to Aksel List
const components = {
	list: {
		bullet: ({ children }) => <List as="ul">{children}</List>,
		number: ({ children }) => <List as="ol">{children}</List>,
	},
	listItem: {
		bullet: ({ children }) => <List.Item>{children}</List.Item>,
		number: ({ children }) => <List.Item>{children}</List.Item>,
	},
}
```

### Error page summary

```tsx
<List>
	<List.Item>
		<BodyLong>Sjekk at nettadressen er riktig stavet.</BodyLong>
	</List.Item>
	<List.Item>
		<BodyLong>Gå tilbake til forsiden og prøv på nytt.</BodyLong>
	</List.Item>
</List>
```

## Do's and Don'ts

### ✅ Do

- Use List to summarise longer text or list criteria.
- Keep list items short and scannable.
- Use `as="ol"` when the order of items matters (e.g. steps in a process).
- Place a `<Heading>` above the list instead of using the deprecated `title` prop.
- Use `aria-label` when the list has no visible heading.
- Match `size` to surrounding typography for visual consistency.

### ❌ Don't

- Don't use List for long-form content — keep items concise.
- Don't embed rich content like images or video inside list items (it breaks the list flow).
- Don't use the `icon` prop on ordered lists — it is ignored and triggers a warning.
- Don't use the deprecated `title` prop on `List` — use `<Heading>` instead.
- Don't nest lists more than two levels deep — it harms readability.
- Don't use `List` as a layout tool — use `VStack`/`HStack` for layout purposes.
