# Accordion — `@navikt/ds-react`

Accordion lets users show and hide content sections by clicking on their headings. It groups related content into collapsible items.

## Import

```tsx
import { Accordion } from '@navikt/ds-react'
```

## Sub-components

| Component           | Element    | Description                          |
| ------------------- | ---------- | ------------------------------------ |
| `Accordion`         | `<div>`    | Root wrapper for all accordion items |
| `Accordion.Item`    | `<div>`    | Individual collapsible section       |
| `Accordion.Header`  | `<button>` | Clickable heading that toggles open  |
| `Accordion.Content` | `<div>`    | Collapsible content area             |

## Props

### `Accordion`

| Prop         | Type                                                              | Default    | Description                                             |
| ------------ | ----------------------------------------------------------------- | ---------- | ------------------------------------------------------- |
| `size`       | `"large" \| "medium" \| "small"`                                  | `"medium"` | Size of the accordion                                   |
| `indent`     | `boolean`                                                         | `true`     | Whether to indent content                               |
| `children`   | `ReactNode`                                                       | —          | Instances of `Accordion.Item`                           |
| `as`         | `"div" \| "section"`                                              | `"div"`    | Root HTML element. Use `section` with `aria-label`      |
| `data-color` | `AkselMainColorRole \| AkselBrandColorRole \| AkselMetaColorRole` | —          | Overrides inherited color. Prefer `accent` or `neutral` |
| `className`  | `string`                                                          | —          | Additional CSS class                                    |
| `ref`        | `Ref<HTMLDivElement>`                                             | —          | Ref to root element                                     |

### `Accordion.Item`

| Prop           | Type                      | Default | Description                                        |
| -------------- | ------------------------- | ------- | -------------------------------------------------- |
| `children`     | `ReactNode`               | —       | Should include one `Header` and one `Content`      |
| `open`         | `boolean`                 | —       | Controlled open state (disables automatic control) |
| `defaultOpen`  | `boolean`                 | `false` | Initial open state (uncontrolled)                  |
| `onOpenChange` | `(open: boolean) => void` | —       | Callback when open state changes                   |
| `className`    | `string`                  | —       | Additional CSS class                               |
| `ref`          | `Ref<HTMLDivElement>`     | —       | Ref to root element                                |

### `Accordion.Header`

| Prop        | Type                     | Default | Description           |
| ----------- | ------------------------ | ------- | --------------------- |
| `children`  | `ReactNode`              | —       | Header text/content   |
| `className` | `string`                 | —       | Additional CSS class  |
| `ref`       | `Ref<HTMLButtonElement>` | —       | Ref to button element |

### `Accordion.Content`

| Prop        | Type                  | Default | Description          |
| ----------- | --------------------- | ------- | -------------------- |
| `children`  | `ReactNode`           | —       | Content to show/hide |
| `className` | `string`              | —       | Additional CSS class |
| `ref`       | `Ref<HTMLDivElement>` | —       | Ref to root element  |

## Usage Examples

### Basic

```tsx
<Accordion>
	<Accordion.Item>
		<Accordion.Header>Section 1</Accordion.Header>
		<Accordion.Content>Content for section 1</Accordion.Content>
	</Accordion.Item>
	<Accordion.Item>
		<Accordion.Header>Section 2</Accordion.Header>
		<Accordion.Content>Content for section 2</Accordion.Content>
	</Accordion.Item>
</Accordion>
```

### With defaultOpen

```tsx
<Accordion>
	<Accordion.Item defaultOpen>
		<Accordion.Header>Open by default</Accordion.Header>
		<Accordion.Content>This section starts open.</Accordion.Content>
	</Accordion.Item>
	<Accordion.Item>
		<Accordion.Header>Closed by default</Accordion.Header>
		<Accordion.Content>This section starts closed.</Accordion.Content>
	</Accordion.Item>
</Accordion>
```

### Controlled

```tsx
function ControlledAccordion() {
	const [openItems, setOpenItems] = useState<Record<string, boolean>>({
		section1: false,
		section2: false,
	})

	return (
		<Accordion>
			<Accordion.Item
				open={openItems.section1}
				onOpenChange={(open) =>
					setOpenItems((prev) => ({ ...prev, section1: open }))
				}
			>
				<Accordion.Header>Section 1</Accordion.Header>
				<Accordion.Content>Controlled content 1</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item
				open={openItems.section2}
				onOpenChange={(open) =>
					setOpenItems((prev) => ({ ...prev, section2: open }))
				}
			>
				<Accordion.Header>Section 2</Accordion.Header>
				<Accordion.Content>Controlled content 2</Accordion.Content>
			</Accordion.Item>
		</Accordion>
	)
}
```

### Small size with no indent

```tsx
<Accordion size="small" indent={false}>
	<Accordion.Item>
		<Accordion.Header>Compact section</Accordion.Header>
		<Accordion.Content>Compact content without indent.</Accordion.Content>
	</Accordion.Item>
</Accordion>
```

### As landmark section

```tsx
<Accordion as="section" aria-label="Frequently asked questions">
	<Accordion.Item>
		<Accordion.Header>What is this?</Accordion.Header>
		<Accordion.Content>An FAQ section.</Accordion.Content>
	</Accordion.Item>
</Accordion>
```

## Accessibility

- `Accordion.Header` renders a `<button>`, so screen readers can activate it. Do **not** put rich semantic content (links, headings, interactive elements) inside the header — screen readers ignore nested semantics inside buttons (only [phrasing content](https://developer.mozilla.org/en-US/docs/Web/HTML/Content_categories#phrasing_content) is allowed).
- When using `as="section"`, always provide `aria-label` or `aria-labelledby` for proper landmark identification.
- If you have multiple `as="section"` Accordions on one page, give each a unique `aria-label` to avoid `axe-core` "landmark-unique" warnings.

## Do's and Don'ts

### ✅ Do

- Use Accordion for grouping **related** content (e.g., FAQ lists, detail sections).
- Always include **at least two** `Accordion.Item` children.
- Keep content inside each item short and directly related to the header.
- Use `defaultOpen` for sections users are likely to read.
- Use `onOpenChange` for analytics logging when items open/close.

### 🚫 Don't

- Don't use Accordion for a **single collapsible item** — use `ReadMore` instead.
- Don't hide **critical information** users must see to understand the page.
- Don't put **links, buttons, or headings** inside `Accordion.Header`.
- Don't use Accordion to explain form questions — use `HelpText` or `ReadMore`.
- Don't put extremely long content in a single item — split into multiple items or use a dedicated page.
- Don't create separate single-item Accordions side by side — combine them into one Accordion.

## Common Patterns in This Codebase

### Wrapper with logging

This repo wraps `Accordion.Item` in a custom `AccordionItem` component that logs open/close events:

```tsx
import { Accordion } from '@navikt/ds-react'

import { AccordionItem } from '@/components/common/AccordionItem'

;<Accordion>
	<AccordionItem name="Section name for logging">
		<GrunnlagSection headerTitle="Title" headerValue="Value">
			<BodyLong>Content here</BodyLong>
		</GrunnlagSection>
	</AccordionItem>
</Accordion>
```

The `AccordionItem` wrapper supports both uncontrolled (`initialOpen`) and controlled (`isOpen` + `onClick`) modes, and automatically logs accordion open/close events via the `logger` utility.

### GrunnlagSection pattern

`GrunnlagSection` is a reusable sub-component that renders `Accordion.Header` and `Accordion.Content` together with a title/value header layout:

```tsx
<AccordionItem name="Grunnlag: Sivilstand">
	<GrunnlagSection
		headerTitle={intl.formatMessage({ id: 'grunnlag.sivilstand.title' })}
		headerValue={formatertSivilstand}
	>
		<BodyLong>
			<FormattedMessage id="grunnlag.sivilstand.ingress" />
		</BodyLong>
	</GrunnlagSection>
</AccordionItem>
```
