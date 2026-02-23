# LinkCard — `@navikt/ds-react`

LinkCard emphasises important links with more context than ordinary text links. It combines a title, description, optional icon, and optional footer into a single clickable card surface.

## Import

```tsx
import { LinkCard } from '@navikt/ds-react'
```

## Sub-components

| Component              | Element            | Description                                         |
| ---------------------- | ------------------ | --------------------------------------------------- |
| `LinkCard`             | `<div>`            | Root wrapper — the entire card surface is clickable |
| `LinkCard.Title`       | `<span>` / heading | Title text (required)                               |
| `LinkCard.Anchor`      | `<a>`              | The actual link element — placed inside Title       |
| `LinkCard.Description` | `<div>`            | 1–2 short sentences elaborating on the title        |
| `LinkCard.Icon`        | `<div>`            | Optional icon/illustration slot                     |
| `LinkCard.Footer`      | `<div>`            | Optional footer content (e.g. tags)                 |
| `LinkCard.Image`       | `<div>`            | Optional image with aspect-ratio support            |

## Props

### `LinkCard`

| Prop            | Type                                                                                                                                                        | Default      | Description                                                 |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ----------------------------------------------------------- |
| `arrow`         | `boolean`                                                                                                                                                   | `true`       | Show an arrow indicator                                     |
| `arrowPosition` | `"baseline" \| "center"`                                                                                                                                    | `"baseline"` | Arrow vertical alignment                                    |
| `size`          | `"small" \| "medium"`                                                                                                                                       | `"medium"`   | Controls padding and typography sizes                       |
| `as`            | `"div" \| "section" \| "article"`                                                                                                                           | `"span"`     | Root HTML element                                           |
| `data-color`    | `"accent" \| "neutral" \| "info" \| "success" \| "warning" \| "danger" \| "meta-purple" \| "meta-lime" \| "brand-beige" \| "brand-blue" \| "brand-magenta"` | —            | Overrides inherited color. Avoid status-colors in LinkCards |
| `className`     | `string`                                                                                                                                                    | —            | Additional CSS class                                        |
| `ref`           | `Ref<HTMLDivElement>`                                                                                                                                       | —            | Ref to root element                                         |

### `LinkCard.Title`

| Prop        | Type                                             | Default  | Description                                     |
| ----------- | ------------------------------------------------ | -------- | ----------------------------------------------- |
| `as`        | `"span" \| "h2" \| "h3" \| "h4" \| "h5" \| "h6"` | `"span"` | Heading tag. Use `"span"` for non-heading cards |
| `className` | `string`                                         | —        | Additional CSS class                            |
| `ref`       | `Ref<HTMLHeadingElement>`                        | —        | Ref to heading element                          |

### `LinkCard.Anchor`

| Prop        | Type                     | Default | Description                                       |
| ----------- | ------------------------ | ------- | ------------------------------------------------- |
| `href`      | `string`                 | —       | Link destination (required)                       |
| `asChild`   | `boolean`                | —       | Merge props with child element (e.g. for routers) |
| `className` | `string`                 | —       | Additional CSS class                              |
| `ref`       | `Ref<HTMLAnchorElement>` | —       | Ref to anchor element                             |

### `LinkCard.Description`

| Prop        | Type                  | Default | Description          |
| ----------- | --------------------- | ------- | -------------------- |
| `className` | `string`              | —       | Additional CSS class |
| `ref`       | `Ref<HTMLDivElement>` | —       | Ref to root element  |

### `LinkCard.Icon`

| Prop        | Type                  | Default | Description          |
| ----------- | --------------------- | ------- | -------------------- |
| `className` | `string`              | —       | Additional CSS class |
| `ref`       | `Ref<HTMLDivElement>` | —       | Ref to root element  |

### `LinkCard.Footer`

| Prop        | Type                  | Default | Description          |
| ----------- | --------------------- | ------- | -------------------- |
| `className` | `string`              | —       | Additional CSS class |
| `ref`       | `Ref<HTMLDivElement>` | —       | Ref to root element  |

### `LinkCard.Image`

| Prop          | Type                  | Default | Description                        |
| ------------- | --------------------- | ------- | ---------------------------------- |
| `aspectRatio` | `ImageAspectRatio`    | —       | CSS aspect-ratio for the image box |
| `className`   | `string`              | —       | Additional CSS class               |
| `ref`         | `Ref<HTMLDivElement>` | —       | Ref to root element                |

## Usage Examples

### Basic

```tsx
<LinkCard>
	<LinkCard.Title>
		<LinkCard.Anchor href="/sykepenger">Sykepenger</LinkCard.Anchor>
	</LinkCard.Title>
	<LinkCard.Description>
		Erstatter inntekten din når du ikke kan jobbe på grunn av sykdom eller
		skade.
	</LinkCard.Description>
</LinkCard>
```

### With icon and footer

```tsx
import { BandageIcon } from '@navikt/aksel-icons'
import { Box, LinkCard, Tag } from '@navikt/ds-react'

;<LinkCard>
	<Box
		asChild
		borderRadius="12"
		padding="space-8"
		style={{ backgroundColor: 'var(--ax-bg-moderateA)' }}
	>
		<LinkCard.Icon>
			<BandageIcon fontSize="2rem" />
		</LinkCard.Icon>
	</Box>
	<LinkCard.Title>
		<LinkCard.Anchor href="/sykepenger">Sykepenger</LinkCard.Anchor>
	</LinkCard.Title>
	<LinkCard.Description>
		Erstatter inntekten din når du ikke kan jobbe på grunn av sykdom eller
		skade.
	</LinkCard.Description>
	<LinkCard.Footer>
		<Tag size="small" variant="neutral">
			Pengestøtte
		</Tag>
	</LinkCard.Footer>
</LinkCard>
```

### Title as semantic heading

```tsx
<LinkCard>
	<LinkCard.Title as="h3">
		<LinkCard.Anchor href="/eksempel">Sykepenger</LinkCard.Anchor>
	</LinkCard.Title>
	<LinkCard.Description>
		Erstatter inntekten din når du ikke kan jobbe på grunn av sykdom eller
		skade.
	</LinkCard.Description>
</LinkCard>
```

### Small size

```tsx
<LinkCard size="small">
	<LinkCard.Title>
		<LinkCard.Anchor href="/info">Les mer om støtte</LinkCard.Anchor>
	</LinkCard.Title>
</LinkCard>
```

### List of LinkCards

When displaying multiple LinkCards together, wrap them in a `<ul>` for proper list semantics:

```tsx
<ul>
	<li>
		<LinkCard>
			<LinkCard.Title>
				<LinkCard.Anchor href="/a">Link A</LinkCard.Anchor>
			</LinkCard.Title>
			<LinkCard.Description>Description A</LinkCard.Description>
		</LinkCard>
	</li>
	<li>
		<LinkCard>
			<LinkCard.Title>
				<LinkCard.Anchor href="/b">Link B</LinkCard.Anchor>
			</LinkCard.Title>
			<LinkCard.Description>Description B</LinkCard.Description>
		</LinkCard>
	</li>
</ul>
```

### With custom click handler (SPA navigation)

```tsx
<LinkCard>
	<LinkCard.Title>
		<LinkCard.Anchor
			href={href}
			onClick={(e) => {
				e.preventDefault()
				navigate(href)
			}}
		>
			Link text
		</LinkCard.Anchor>
	</LinkCard.Title>
	<LinkCard.Description>Description text</LinkCard.Description>
</LinkCard>
```

## Accessibility

- LinkCard wraps content in a clickable `<div>`, **not** an `<a>`. The `<a>` element is placed only around the title via `LinkCard.Anchor`. This avoids noisy screen-reader link lists that would include descriptions, icons, and footer text.
- Text selection inside the card prevents navigation on click, so users can select text without accidentally navigating.
- When using `as="section"`, always provide `aria-label` or `aria-labelledby` for proper landmark identification.
- When using `as="article"`, ensure `LinkCard.Title` renders as a heading (`as="h2"` etc.), not a `"span"`.
- Use `<ul>` / `<li>` when rendering multiple LinkCards as a group.

## Do's and Don'ts

### ✅ Do

- Use LinkCard for links that benefit from rich context (title + description + optional icon).
- Always include `LinkCard.Title` with a `LinkCard.Anchor` inside.
- Keep the title to one line when possible.
- Add a description of 1–2 short sentences that expands on the title — don't repeat the same information.
- Use only relevant icons that add real value.
- Wrap multiple LinkCards in `<ul>` / `<li>` for list semantics.
- Use `as` on `LinkCard.Title` to render a heading when the card sits in a page hierarchy.

### 🚫 Don't

- Don't place interactive content (buttons, forms, inputs) inside a LinkCard.
- Don't use status colors (`info`, `success`, `warning`, `danger`) for `data-color` — prefer `accent` or `neutral`.
- Don't repeat the same text in both title and description.
- Don't use LinkCard when a plain text link suffices — reserve it for prominent navigation.
- Don't nest links or buttons inside LinkCard (only one `LinkCard.Anchor` should exist per card).

## Common Patterns in This Codebase

### LinkCard with SPA navigation and logging

This repo uses LinkCard with React Router navigation and event logging:

```tsx
import { FormattedMessage } from 'react-intl'
import { useNavigate } from 'react-router'

import { LinkCard } from '@navikt/ds-react'

import { wrapLogger } from '@/utils/logging'

;<LinkCard>
	<LinkCard.Title>
		<LinkCard.Anchor
			href={href}
			onClick={handleClick}
			target={isExternal ? '_blank' : undefined}
			rel={isExternal ? 'noopener' : undefined}
		>
			<FormattedMessage id="savnerdunoe.title" />
		</LinkCard.Anchor>
	</LinkCard.Title>
	<LinkCard.Description>
		<FormattedMessage id="savnerdunoe.ingress" />
	</LinkCard.Description>
</LinkCard>
```

Key patterns:

- Use `wrapLogger` around click handlers for analytics tracking.
- Guard for plain left-clicks before calling `e.preventDefault()` so that Cmd+click / middle-click still open in a new tab.
- Set `target="_blank"` and `rel="noopener"` for external links.
