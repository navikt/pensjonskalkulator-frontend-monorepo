# HGrid — `@navikt/ds-react`

A primitive layout component that creates CSS Grid-based horizontal grids. Suited for building page layouts and grouping cards into columns with responsive breakpoint support.

## Import

```tsx
import { HGrid } from '@navikt/ds-react'
```

## Props

| Prop            | Type                                        | Default | Description                                                                                                                          |
| --------------- | ------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `columns`       | `ResponsiveProp<string \| number>`          | —       | Number of columns. Sets `grid-template-columns`, so `fr`, `minmax` etc. work. Can be a number, a CSS string, or a responsive object. |
| `gap`           | `ResponsiveProp<AkselSpaceToken>`           | —       | Spacing between columns. Accepts a spacing token, a two-axis string (`"space-32 space-16"`), or a responsive object.                 |
| `align`         | `"start" \| "center" \| "end"`              | stretch | Vertical alignment of children. Elements stretch to parent height by default.                                                        |
| `padding`       | `ResponsiveProp<AkselSpaceToken>`           | —       | Padding around children. Accepts a spacing token or responsive object.                                                               |
| `paddingInline` | `ResponsiveProp<AkselSpaceToken>`           | —       | Horizontal padding. Supports two-value shorthand (`"space-16 space-20"`).                                                            |
| `paddingBlock`  | `ResponsiveProp<AkselSpaceToken>`           | —       | Vertical padding. Supports two-value shorthand.                                                                                      |
| `margin`        | `ResponsiveProp<AkselSpaceToken>`           | —       | Margin around element. Accepts a spacing token or responsive object.                                                                 |
| `marginInline`  | `ResponsiveProp<AkselSpaceToken \| "auto">` | —       | Horizontal margin. Supports two-value shorthand and `"auto"`.                                                                        |
| `marginBlock`   | `ResponsiveProp<AkselSpaceToken \| "auto">` | —       | Vertical margin. Supports two-value shorthand and `"auto"`.                                                                          |
| `asChild`       | `boolean`                                   | —       | Merges HGrid props onto its single child element instead of rendering a wrapper `<div>`.                                             |
| `className`     | `string`                                    | —       | Additional CSS class                                                                                                                 |
| `ref`           | `Ref<HTMLDivElement>`                       | —       | Ref to the underlying `<div>` element                                                                                                |

> **ResponsiveProp** — any prop marked `ResponsiveProp<T>` accepts either a plain value or an object with breakpoint keys: `{ xs?, sm?, md?, lg?, xl? }`.

## Usage Examples

### Equal columns

```tsx
<HGrid columns={3} gap="space-12">
	<div>Column 1</div>
	<div>Column 2</div>
	<div>Column 3</div>
</HGrid>
```

### Responsive columns

```tsx
<HGrid
	columns={{ xs: 1, md: 2, lg: 3 }}
	gap={{ xs: 'space-8', md: 'space-12', lg: 'space-20' }}
>
	<Card>A</Card>
	<Card>B</Card>
	<Card>C</Card>
</HGrid>
```

### Mixed column widths with fr units

```tsx
<HGrid columns="1fr 2fr" gap="space-12">
	<aside>Sidebar</aside>
	<main>Main content</main>
</HGrid>
```

### Responsive mixed columns

```tsx
<HGrid
	columns={{ sm: 1, md: 1, lg: '1fr auto', xl: '1fr auto' }}
	gap="space-16"
>
	<div>Content</div>
	<div>Side panel</div>
</HGrid>
```

### With minmax for flexible columns

```tsx
<HGrid columns="repeat(3, minmax(0, 1fr))" gap="space-12">
	<div>Flexible 1</div>
	<div>Flexible 2</div>
	<div>Flexible 3</div>
</HGrid>
```

### Two-axis gap (row gap × column gap)

```tsx
<HGrid columns={2} gap="space-32 space-16">
	<div>A</div>
	<div>B</div>
	<div>C</div>
	<div>D</div>
</HGrid>
```

### Vertical alignment

```tsx
<HGrid columns={3} gap="space-12" align="center">
	<div>Short</div>
	<div>Taller content that wraps to multiple lines</div>
	<div>Short</div>
</HGrid>
```

### asChild — merge onto child element

```tsx
;<HGrid columns={2} gap="space-12" asChild>
	<section className="my-section">
		<div>Column 1</div>
		<div>Column 2</div>
	</section>
</HGrid>
{
	/* Renders a single <section> with grid styles applied */
}
```

## Accessibility

- `HGrid` renders a `<div>` by default — it carries no semantic meaning. Use `asChild` to render a semantically appropriate element (e.g. `<section>`, `<nav>`, `<main>`) when the content warrants it.
- Column order in the DOM should match the visual reading order. Avoid CSS-only reordering that creates a mismatch between visual and DOM order, as this confuses keyboard and screen reader navigation.
- Ensure grid children have sufficient contrast and spacing to remain legible at all responsive breakpoints.

## Do's and Don'ts

### ✅ Do

- Use `HGrid` for page-level layout (sidebar + main, card grids).
- Use responsive objects for `columns` and `gap` to adapt layouts across breakpoints.
- Use CSS grid string syntax (`"1fr auto"`, `"repeat(3, minmax(0, 1fr))"`) for advanced column definitions.
- Use Aksel spacing tokens for `gap`, `padding`, and `margin` to stay consistent with the design system.
- Use `asChild` to render a semantic HTML element when the grid represents a meaningful section.

### 🚫 Don't

- Don't nest `HGrid` deeply when a single grid with `grid-template-columns` can handle the layout.
- Don't use `HGrid` for single-column stacking — use `VStack` instead.
- Don't hard-code pixel values for `gap` or `padding` — use Aksel spacing tokens.
- Don't reorder columns visually (via CSS `order`) without matching the DOM order, as it breaks accessibility.
- Don't use `HGrid` for flex-based layouts — use `HStack` for horizontal flex rows.
