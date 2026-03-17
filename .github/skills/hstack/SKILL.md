# HStack — `@navikt/ds-react`

Layout primitive for horizontal grouping of elements with consistent spacing. Wraps `display: flex` with `flex-direction: row`.

## Import

```tsx
import { HStack } from '@navikt/ds-react'
```

## Props

| Prop            | Type                                                                                                  | Default     | Description                                                                                                |
| --------------- | ----------------------------------------------------------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------- |
| `gap`           | `ResponsiveProp<AkselSpaceToken>`                                                                     | —           | CSS `gap`. Accepts a spacing token, a two-value shorthand (`"space-32 space-16"`), or a responsive object. |
| `align`         | `ResponsiveProp<"start" \| "center" \| "end" \| "baseline" \| "stretch">`                             | `"stretch"` | CSS `align-items`.                                                                                         |
| `justify`       | `ResponsiveProp<"start" \| "center" \| "end" \| "space-around" \| "space-between" \| "space-evenly">` | —           | CSS `justify-content`.                                                                                     |
| `wrap`          | `boolean`                                                                                             | —           | Sets CSS `flex-wrap: wrap`.                                                                                |
| `padding`       | `ResponsiveProp<AkselSpaceToken>`                                                                     | —           | Padding around children.                                                                                   |
| `paddingInline` | `ResponsiveProp<AkselSpaceToken>`                                                                     | —           | Horizontal padding. Supports two-value shorthand.                                                          |
| `paddingBlock`  | `ResponsiveProp<AkselSpaceToken>`                                                                     | —           | Vertical padding. Supports two-value shorthand.                                                            |
| `margin`        | `ResponsiveProp<AkselSpaceToken>`                                                                     | —           | Margin around element.                                                                                     |
| `marginInline`  | `ResponsiveProp<AkselSpaceToken \| "auto">`                                                           | —           | Horizontal margin. Supports two-value shorthand.                                                           |
| `marginBlock`   | `ResponsiveProp<AkselSpaceToken \| "auto">`                                                           | —           | Vertical margin. Supports two-value shorthand.                                                             |
| `width`         | `ResponsiveProp<string>`                                                                              | —           | CSS `width`.                                                                                               |
| `minWidth`      | `ResponsiveProp<string>`                                                                              | —           | CSS `min-width`.                                                                                           |
| `maxWidth`      | `ResponsiveProp<string>`                                                                              | —           | CSS `max-width`.                                                                                           |
| `height`        | `ResponsiveProp<string>`                                                                              | —           | CSS `height`.                                                                                              |
| `minHeight`     | `ResponsiveProp<string>`                                                                              | —           | CSS `min-height`.                                                                                          |
| `maxHeight`     | `ResponsiveProp<string>`                                                                              | —           | CSS `max-height`.                                                                                          |
| `position`      | `ResponsiveProp<"static" \| "relative" \| "absolute" \| "fixed" \| "sticky">`                         | —           | CSS `position`.                                                                                            |
| `overflow`      | `ResponsiveProp<"hidden" \| "auto" \| "visible" \| "clip" \| "scroll">`                               | —           | CSS `overflow`.                                                                                            |
| `flexBasis`     | `ResponsiveProp<string>`                                                                              | —           | CSS `flex-basis`.                                                                                          |
| `flexShrink`    | `ResponsiveProp<string>`                                                                              | —           | CSS `flex-shrink`.                                                                                         |
| `flexGrow`      | `ResponsiveProp<string>`                                                                              | —           | CSS `flex-grow`.                                                                                           |
| `gridColumn`    | `ResponsiveProp<string>`                                                                              | —           | CSS `grid-column`.                                                                                         |
| `as`            | `React.ElementType`                                                                                   | —           | Override the rendered HTML element (e.g. `"nav"`, `"section"`).                                            |
| `asChild`       | `boolean`                                                                                             | —           | Merges props onto its single child element instead of rendering a wrapper.                                 |
| `className`     | `string`                                                                                              | —           | Additional CSS class.                                                                                      |
| `ref`           | `Ref<HTMLDivElement>`                                                                                 | —           | Ref to the underlying DOM element.                                                                         |

### ResponsiveProp

Most props accept a single value or a responsive object keyed by breakpoint:

```tsx
gap="space-8"
gap={{ xs: 'space-4', sm: 'space-8', md: 'space-12', lg: 'space-16', xl: 'space-20' }}
```

## Usage Examples

### Basic horizontal stack

```tsx
<HStack gap="space-4">
	<Tag variant="info">Status A</Tag>
	<Tag variant="info">Status B</Tag>
	<Tag variant="info">Status C</Tag>
</HStack>
```

### Space-between buttons

```tsx
<HStack gap="space-4" justify="space-between">
	<Button variant="secondary">Tilbake</Button>
	<Button>Neste</Button>
</HStack>
```

### Centered items

```tsx
<HStack gap="space-8" align="center" justify="center">
	<Loader size="small" />
	<BodyShort>Laster …</BodyShort>
</HStack>
```

### Responsive gap

```tsx
<HStack gap={{ xs: 'space-4', md: 'space-8', xl: 'space-12' }}>
	<Card>A</Card>
	<Card>B</Card>
	<Card>C</Card>
</HStack>
```

### Two-value gap shorthand (row-gap column-gap)

```tsx
<HStack gap="space-4 space-12" wrap>
	<Box>Item 1</Box>
	<Box>Item 2</Box>
	<Box>Item 3</Box>
	<Box>Item 4</Box>
</HStack>
```

### Wrapping items

```tsx
<HStack gap="space-4" wrap>
	{items.map((item) => (
		<Chips.Toggle key={item}>{item}</Chips.Toggle>
	))}
</HStack>
```

### Using asChild

```tsx
<HStack asChild gap="space-4">
	<nav>
		<a href="/a">Link A</a>
		<a href="/b">Link B</a>
	</nav>
</HStack>
```

## Accessibility

- HStack renders a `<div>` by default. Use the `as` prop to render a semantically appropriate element (e.g. `as="nav"`) when the content warrants it.
- The component produces no extra ARIA attributes — accessibility depends on the children.
- When items wrap across multiple lines, ensure the reading order remains logical.

## Do's and Don'ts

### ✅ Do

- Use HStack for horizontal grouping of small elements (Tags, Buttons, Cards).
- Use `gap` with Aksel spacing tokens for consistent spacing.
- Use `wrap` when children may overflow the container width.
- Use responsive props when spacing should change across breakpoints.
- Use `as` or `asChild` to render semantic HTML when appropriate.

### 🚫 Don't

- Don't use HStack for larger page layouts — use `Page` or `HGrid` instead.
- Don't combine `as` and `asChild` on the same component.
- Don't use raw CSS values for `gap` — always use Aksel spacing tokens.
- Don't nest HStacks unnecessarily — one level is usually enough.

## Common Patterns in This Codebase

The `Navigation` component uses HStack to lay out step navigation buttons:

```tsx
import { Button, HStack } from '@navikt/ds-react'

;<HStack gap="4" marginBlock="4 0" className={className}>
	<Button type="submit">Neste</Button>
	<Button type="button" variant="secondary" onClick={onPrevious}>
		Tilbake
	</Button>
	<Button type="button" variant="tertiary" onClick={onCancel}>
		Avbryt
	</Button>
</HStack>
```

The `PensjonVisningDesktop` component uses a two-value gap shorthand:

```tsx
import { HStack } from '@navikt/ds-react'

;<HStack gap="4 12" width="100%">
	{pensjonsdata.map((data, index) => (
		<PensjonKort key={index} data={data} />
	))}
</HStack>
```

## See Also

- [VStack](https://aksel.nav.no/komponenter/primitives/vstack) — vertical stacking (`flex-direction: column`)
- [HGrid](https://aksel.nav.no/komponenter/primitives/hgrid) — CSS Grid-based horizontal layout for larger page sections
- [Page](https://aksel.nav.no/komponenter/primitives/page) — full-page layout primitive
