# Tag — `@navikt/ds-react`

A small, non-interactive label used to categorise content by topic, status, or type. Tags look like physical labels and help users scan and understand content at a glance.

## Import

```tsx
import { Tag } from '@navikt/ds-react'
```

## Props

| Prop         | Type                                                                                                                                                        | Default     | Description                                                                         |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------- |
| `children`   | `ReactNode`                                                                                                                                                 | —           | **Required.** Tag text content                                                      |
| `variant`    | `"outline" \| "moderate" \| "strong"`                                                                                                                       | `"outline"` | Visual style — outline (border only), moderate (light fill), or strong (solid fill) |
| `size`       | `"medium" \| "small" \| "xsmall"`                                                                                                                           | `"medium"`  | Controls padding and font size                                                      |
| `data-color` | `"accent" \| "neutral" \| "info" \| "success" \| "warning" \| "danger" \| "meta-purple" \| "meta-lime" \| "brand-beige" \| "brand-blue" \| "brand-magenta"` | `"neutral"` | Tag colour                                                                          |
| `icon`       | `ReactNode`                                                                                                                                                 | —           | Icon displayed before the text                                                      |
| `className`  | `string`                                                                                                                                                    | —           | Additional CSS class                                                                |
| `ref`        | `Ref<HTMLSpanElement>`                                                                                                                                      | —           | Ref to the underlying `<span>` element                                              |

> **Deprecated legacy variants:** The old `variant` values (`"info"`, `"warning"`, `"error"`, `"success"`, `"neutral"`, `"alt1"`, `"alt2"`, `"alt3"` and their `-filled`/`-moderate` suffixes) still work but are deprecated. Use the new `variant` + `data-color` combination instead.

### Legacy → New Mapping

| Legacy `variant`  | New `variant` | New `data-color` |
| ----------------- | ------------- | ---------------- |
| `"info"`          | `"outline"`   | `"info"`         |
| `"info-filled"`   | `"strong"`    | `"info"`         |
| `"info-moderate"` | `"moderate"`  | `"info"`         |
| `"success"`       | `"outline"`   | `"success"`      |
| `"warning"`       | `"outline"`   | `"warning"`      |
| `"error"`         | `"outline"`   | `"danger"`       |
| `"neutral"`       | `"outline"`   | `"neutral"`      |
| `"alt1"`          | `"outline"`   | `"meta-purple"`  |
| `"alt2"`          | `"outline"`   | `"meta-lime"`    |
| `"alt3"`          | `"outline"`   | `"info"`         |

## Usage Examples

### Basic tag

```tsx
<Tag variant="outline" data-color="neutral">
	Kategori
</Tag>
```

### Different colours

```tsx
import { Tag } from '@navikt/ds-react'
import { HStack } from '@navikt/ds-react'

;<HStack gap="space-8">
	<Tag variant="outline" data-color="info">
		Info
	</Tag>
	<Tag variant="outline" data-color="success">
		Suksess
	</Tag>
	<Tag variant="outline" data-color="warning">
		Advarsel
	</Tag>
	<Tag variant="outline" data-color="danger">
		Feil
	</Tag>
	<Tag variant="outline" data-color="neutral">
		Nøytral
	</Tag>
</HStack>
```

### Visual variants (same colour, different emphasis)

```tsx
<HStack gap="space-8">
	<Tag variant="outline" data-color="info">
		Outline
	</Tag>
	<Tag variant="moderate" data-color="info">
		Moderate
	</Tag>
	<Tag variant="strong" data-color="info">
		Strong
	</Tag>
</HStack>
```

### Small and xsmall sizes

```tsx
<HStack gap="space-8" align="center">
	<Tag variant="outline" size="medium">
		Medium
	</Tag>
	<Tag variant="outline" size="small">
		Small
	</Tag>
	<Tag variant="outline" size="xsmall">
		XSmall
	</Tag>
</HStack>
```

### With icon

```tsx
import { CheckmarkCircleIcon } from '@navikt/aksel-icons'

;<Tag
	variant="outline"
	data-color="success"
	icon={<CheckmarkCircleIcon aria-hidden />}
>
	Godkjent
</Tag>
```

### Tags in a list (accessible pattern)

```tsx
<ul style={{ display: 'flex', gap: '0.5rem', listStyle: 'none', padding: 0 }}>
	<li>
		<Tag variant="outline" data-color="info">
			Sykepenger
		</Tag>
	</li>
	<li>
		<Tag variant="outline" data-color="success">
			Foreldrepenger
		</Tag>
	</li>
	<li>
		<Tag variant="outline" data-color="neutral">
			Alderspensjon
		</Tag>
	</li>
</ul>
```

## Accessibility

- **Tag is not interactive** — it renders as a `<span>`. It has no click handler or keyboard interaction.
- **No semantic meaning by default.** Tags carry no implicit ARIA semantics. If you need to communicate meaning, wrap them in semantic elements.
- **Use a list for multiple tags.** When rendering several tags together, wrap them in a `<ul>` with each tag in a `<li>`. This ensures screen readers announce them as a list rather than reading them as a continuous sentence.
- **Icons must be decorative.** Always add `aria-hidden` to tag icons since the text already conveys meaning.

## Do's and Don'ts

### ✅ Do

- Use Tag to label content with a category, status, or topic.
- Keep tag text short and concrete — ideally a single word.
- Use `data-color` to convey semantic meaning (e.g. `"success"` for positive states, `"danger"` for errors).
- Wrap multiple tags in a `<ul>`/`<li>` structure for screen readers.
- Maintain good spacing between tags and interactive elements (buttons, chips, links).

### 🚫 Don't

- Don't use Tag as a link — use [Link](https://aksel.nav.no/komponenter/core/link) instead.
- Don't use Tag for filtering — use [Chips](https://aksel.nav.no/komponenter/core/chips) instead.
- Don't make Tag clickable — it is a static label with no interactive affordance.
- Don't use the deprecated legacy `variant` values — migrate to `variant` + `data-color`.
- Don't use long sentences as tag text.
- Don't place tags too close to buttons or other interactive elements — users may think they are clickable.

## Best Practices

- **Consistent colour usage:** Pick a colour convention for your domain and stick to it (e.g. `"success"` for approved states, `"warning"` for pending).
- **Variant hierarchy:** Use `"outline"` as the default. Reserve `"strong"` for tags that need high visual emphasis and `"moderate"` for a middle ground.
- **Size matching:** Match tag size to surrounding text — use `"small"` or `"xsmall"` in compact layouts like tables.

## See Also

- [Chips](https://aksel.nav.no/komponenter/core/chips) — for interactive filtering
- [Link](https://aksel.nav.no/komponenter/core/link) — for navigation
- [Alert / InlineMessage](https://aksel.nav.no/komponenter/core/alert) — for contextual status messages
