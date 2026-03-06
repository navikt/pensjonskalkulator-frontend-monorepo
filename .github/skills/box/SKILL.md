# Box — `@navikt/ds-react`

A layout primitive used as a building block for other components. Sets padding, margin, border, background, shadow, and positioning using design tokens. Renders a `<div>` by default.

## Import

```tsx
import { Box } from '@navikt/ds-react'
```

## Props

### Visual

| Prop           | Type                                                                      | Default | Description                                                                                                                                         |
| -------------- | ------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `background`   | `AkselRootBackgroundToken \| AkselDynamicStatelessBackgroundToken \| ...` | —       | CSS `background-color`. Accepts a [background color token](https://aksel.nav.no/grunnleggende/styling/design-tokens#backgroundColor)                |
| `borderColor`  | `AkselColoredBorderToken`                                                 | —       | CSS `border-color`. Accepts a [border color token](https://aksel.nav.no/grunnleggende/styling/design-tokens#borderColor)                            |
| `borderRadius` | `ResponsiveProp<SpaceDelimitedAttribute<AkselBorderRadiusToken \| "0">>`  | —       | CSS `border-radius`. Accepts a [radius token](https://aksel.nav.no/grunnleggende/styling/design-tokens#radius). Supports shorthand: `"0 full 12 2"` |
| `borderWidth`  | `SpaceDelimitedAttribute<"0" \| "1" \| "2" \| "3" \| "4" \| "5">`         | —       | CSS `border-width`. No border rendered if not set. Supports shorthand: `"1 2 3 4"`                                                                  |
| `shadow`       | `"dialog"`                                                                | —       | Box shadow token                                                                                                                                    |

### Spacing

| Prop            | Type                                                       | Default | Description                                                                                                        |
| --------------- | ---------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------ |
| `padding`       | `ResponsiveProp<AkselSpaceToken>`                          | —       | Padding around children. Accepts a [spacing token](https://aksel.nav.no/grunnleggende/styling/design-tokens#space) |
| `paddingInline` | `ResponsiveProp<AkselSpaceToken \| "start end">`           | —       | Horizontal padding. Supports two-value shorthand: `"space-16 space-20"`                                            |
| `paddingBlock`  | `ResponsiveProp<AkselSpaceToken \| "start end">`           | —       | Vertical padding. Supports two-value shorthand: `"space-16 space-20"`                                              |
| `margin`        | `ResponsiveProp<AkselSpaceToken>`                          | —       | Margin around element                                                                                              |
| `marginInline`  | `ResponsiveProp<"auto" \| AkselSpaceToken \| "start end">` | —       | Horizontal margin. Supports `"auto"` for centering                                                                 |
| `marginBlock`   | `ResponsiveProp<"auto" \| AkselSpaceToken \| "start end">` | —       | Vertical margin. Supports two-value shorthand                                                                      |

### Sizing

| Prop        | Type                     | Default | Description      |
| ----------- | ------------------------ | ------- | ---------------- |
| `width`     | `ResponsiveProp<string>` | —       | CSS `width`      |
| `minWidth`  | `ResponsiveProp<string>` | —       | CSS `min-width`  |
| `maxWidth`  | `ResponsiveProp<string>` | —       | CSS `max-width`  |
| `height`    | `ResponsiveProp<string>` | —       | CSS `height`     |
| `minHeight` | `ResponsiveProp<string>` | —       | CSS `min-height` |
| `maxHeight` | `ResponsiveProp<string>` | —       | CSS `max-height` |

### Positioning

| Prop       | Type                                                                          | Default | Description    |
| ---------- | ----------------------------------------------------------------------------- | ------- | -------------- |
| `position` | `ResponsiveProp<"static" \| "relative" \| "absolute" \| "fixed" \| "sticky">` | —       | CSS `position` |
| `inset`    | `ResponsiveProp<AkselSpaceToken \| "start end">`                              | —       | CSS `inset`    |
| `top`      | `ResponsiveProp<AkselSpaceToken>`                                             | —       | CSS `top`      |
| `right`    | `ResponsiveProp<AkselSpaceToken>`                                             | —       | CSS `right`    |
| `bottom`   | `ResponsiveProp<AkselSpaceToken>`                                             | —       | CSS `bottom`   |
| `left`     | `ResponsiveProp<AkselSpaceToken>`                                             | —       | CSS `left`     |

### Overflow & Flex/Grid

| Prop         | Type                                                                    | Default | Description       |
| ------------ | ----------------------------------------------------------------------- | ------- | ----------------- |
| `overflow`   | `ResponsiveProp<"auto" \| "visible" \| "hidden" \| "clip" \| "scroll">` | —       | CSS `overflow`    |
| `overflowX`  | `ResponsiveProp<"auto" \| "visible" \| "hidden" \| "clip" \| "scroll">` | —       | CSS `overflow-x`  |
| `overflowY`  | `ResponsiveProp<"auto" \| "visible" \| "hidden" \| "clip" \| "scroll">` | —       | CSS `overflow-y`  |
| `flexBasis`  | `ResponsiveProp<string>`                                                | —       | CSS `flex-basis`  |
| `flexShrink` | `ResponsiveProp<string>`                                                | —       | CSS `flex-shrink` |
| `flexGrow`   | `ResponsiveProp<string>`                                                | —       | CSS `flex-grow`   |
| `gridColumn` | `ResponsiveProp<string>`                                                | —       | CSS `grid-column` |

### Polymorphism & Ref

| Prop        | Type                  | Default | Description                                                                     |
| ----------- | --------------------- | ------- | ------------------------------------------------------------------------------- |
| `as`        | `React.ElementType`   | `"div"` | Override the rendered HTML element (e.g. `"nav"`, `"section"`, `"article"`)     |
| `asChild`   | `boolean`             | —       | Merges Box props onto its single child element instead of wrapping in a `<div>` |
| `className` | `string`              | —       | Additional CSS class                                                            |
| `ref`       | `Ref<HTMLDivElement>` | —       | Ref to the root element                                                         |

## ResponsiveProp

Most props accept a `ResponsiveProp`, which is either a single value or an object with breakpoint keys:

```tsx
// Single value — applies to all breakpoints
<Box padding="space-16" />

// Responsive object — different values per breakpoint
<Box padding={{ xs: "space-8", sm: "space-12", md: "space-16", lg: "space-20", xl: "space-24" }} />
```

Breakpoints: `xs` (0px), `sm` (480px), `md` (768px), `lg` (1024px), `xl` (1280px).

## Usage Examples

### Basic wrapper with padding

```tsx
<Box padding="space-16">
	<p>Content with consistent spacing</p>
</Box>
```

### Card-like container

```tsx
<Box
	background="surface-subtle"
	borderColor="border-subtle"
	borderWidth="1"
	borderRadius="xlarge"
	padding="space-16"
	shadow="dialog"
>
	<Heading size="small">Card title</Heading>
	<p>Card content</p>
</Box>
```

### Responsive padding

```tsx
<Box
	padding={{ xs: 'space-8', md: 'space-16', lg: 'space-24' }}
	paddingInline={{ xs: 'space-4', md: 'space-12' }}
>
	<p>Padding adjusts at each breakpoint</p>
</Box>
```

### Semantic element with `as`

```tsx
<Box as="nav" padding="space-8" background="surface-subtle">
  {/* Sidebar navigation */}
</Box>

<Box as="section" paddingBlock="space-24">
  {/* Page section */}
</Box>
```

### With `asChild`

```tsx
<Box
	padding="space-12"
	background="surface-subtle"
	borderRadius="large"
	asChild
>
	<article>
		<p>The article element receives all Box styling props</p>
	</article>
</Box>
```

### Margin for spacing between sections

```tsx
<Box marginBlock="10 0" data-testid="section-wrapper">
	<Heading size="medium">Section</Heading>
</Box>
```

## Accessibility

- Box renders a `<div>` by default, which has no semantic meaning. Use the `as` prop to render appropriate semantic elements (`"nav"`, `"section"`, `"article"`, `"aside"`, `"main"`, `"header"`, `"footer"`).
- Box is **not** a replacement for semantic HTML — always consider whether a more specific element is appropriate.
- Supports [OverridableComponent](https://aksel.nav.no/grunnleggende/kode/overridablecomponent) pattern.

## Do's and Don'ts

### ✅ Do

- Use Box for simple, static containers that need consistent design-token-based styling.
- Use the `as` prop to render the correct semantic HTML element.
- Use responsive props to adapt layout across breakpoints.
- Use spacing tokens (`"space-8"`, `"space-16"`, etc.) instead of custom CSS for padding and margin.
- Combine with `VStack`, `HStack`, and `HGrid` for more complex layouts.

### 🚫 Don't

- Don't use Box when a more specific Aksel component exists (e.g. use `Card` for interactive cards).
- Don't override Box's internal tokens — they are managed by the design system.
- Don't use arbitrary CSS values when a design token is available.
- Don't nest Boxes deeply just for spacing — prefer `VStack`/`HStack` with `gap` for stacking.

## Common Patterns in This Codebase

The `GrunnlagItem` component uses Box for vertical padding:

```tsx
import { Box } from '@navikt/ds-react'

;<Box paddingBlock="4">{children}</Box>
```

The `MaanedsbeloepAvansertBeregning` component uses Box with margin for section spacing:

```tsx
<Box marginBlock="10 0" data-testid="maanedsbloep-avansert-beregning">
	<Heading size="medium">...</Heading>
</Box>
```

The `PensjonVisningMobil` component uses Box with border radius:

```tsx
<Box marginBlock="2 0" borderRadius="medium">
	<VStack gap="2">...</VStack>
</Box>
```

## See Also

- [VStack / HStack](https://aksel.nav.no/komponenter/primitives/vstack) — for flexbox stacking layouts
- [HGrid](https://aksel.nav.no/komponenter/primitives/hgrid) — for grid layouts
- [Bleed](https://aksel.nav.no/komponenter/primitives/bleed) — for negative-margin breakouts
- [Design Tokens](https://aksel.nav.no/grunnleggende/styling/design-tokens) — full list of available token values
