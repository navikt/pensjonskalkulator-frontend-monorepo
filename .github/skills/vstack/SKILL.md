# VStack — `@navikt/ds-react`

A primitive layout component for vertically stacking elements with consistent spacing. It is a wrapper for `display: flex` with `flex-direction: column`, and is one of the Aksel [layout primitives](https://aksel.nav.no/grunnleggende/kode/layout-primitives).

## Import

```tsx
import { VStack } from '@navikt/ds-react'
```

## Props

| Prop            | Type                                                                                                  | Default     | Description                                                                                            |
| --------------- | ----------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------ |
| `gap`           | `ResponsiveProp<AkselSpaceToken>`                                                                     | —           | CSS `gap`. Accepts a spacing token, a two-axis string (`"space-32 space-16"`), or a responsive object. |
| `align`         | `ResponsiveProp<"start" \| "center" \| "end" \| "baseline" \| "stretch">`                             | `"stretch"` | CSS `align-items`. Controls horizontal alignment of children.                                          |
| `justify`       | `ResponsiveProp<"start" \| "center" \| "end" \| "space-around" \| "space-between" \| "space-evenly">` | —           | CSS `justify-content`. Controls vertical distribution of children.                                     |
| `padding`       | `ResponsiveProp<AkselSpaceToken>`                                                                     | —           | Padding around children. Accepts a spacing token or responsive object.                                 |
| `paddingInline` | `ResponsiveProp<AkselSpaceToken>`                                                                     | —           | Horizontal padding. Supports two-value shorthand (`"space-16 space-20"`).                              |
| `paddingBlock`  | `ResponsiveProp<AkselSpaceToken>`                                                                     | —           | Vertical padding. Supports two-value shorthand.                                                        |
| `margin`        | `ResponsiveProp<AkselSpaceToken>`                                                                     | —           | Margin around element. Accepts a spacing token or responsive object.                                   |
| `marginInline`  | `ResponsiveProp<AkselSpaceToken \| "auto">`                                                           | —           | Horizontal margin. Supports two-value shorthand and `"auto"`.                                          |
| `marginBlock`   | `ResponsiveProp<AkselSpaceToken \| "auto">`                                                           | —           | Vertical margin. Supports two-value shorthand and `"auto"`.                                            |
| `width`         | `ResponsiveProp<string>`                                                                              | —           | CSS `width`                                                                                            |
| `minWidth`      | `ResponsiveProp<string>`                                                                              | —           | CSS `min-width`                                                                                        |
| `maxWidth`      | `ResponsiveProp<string>`                                                                              | —           | CSS `max-width`                                                                                        |
| `height`        | `ResponsiveProp<string>`                                                                              | —           | CSS `height`                                                                                           |
| `minHeight`     | `ResponsiveProp<string>`                                                                              | —           | CSS `min-height`                                                                                       |
| `maxHeight`     | `ResponsiveProp<string>`                                                                              | —           | CSS `max-height`                                                                                       |
| `position`      | `ResponsiveProp<"static" \| "relative" \| "absolute" \| "fixed" \| "sticky">`                         | —           | CSS `position`                                                                                         |
| `overflow`      | `ResponsiveProp<"hidden" \| "auto" \| "visible" \| "clip" \| "scroll">`                               | —           | CSS `overflow`                                                                                         |
| `flexBasis`     | `ResponsiveProp<string>`                                                                              | —           | CSS `flex-basis`                                                                                       |
| `flexShrink`    | `ResponsiveProp<string>`                                                                              | —           | CSS `flex-shrink`                                                                                      |
| `flexGrow`      | `ResponsiveProp<string>`                                                                              | —           | CSS `flex-grow`                                                                                        |
| `gridColumn`    | `ResponsiveProp<string>`                                                                              | —           | CSS `grid-column`                                                                                      |
| `as`            | `React.ElementType`                                                                                   | `"div"`     | Override the rendered HTML element.                                                                    |
| `asChild`       | `boolean`                                                                                             | —           | Merges VStack props onto its single child element instead of rendering a wrapper `<div>`.              |
| `className`     | `string`                                                                                              | —           | Additional CSS class                                                                                   |
| `ref`           | `Ref<HTMLDivElement>`                                                                                 | —           | Ref to the underlying element                                                                          |

> **ResponsiveProp** — any prop marked `ResponsiveProp<T>` accepts either a plain value or an object with breakpoint keys: `{ xs?, sm?, md?, lg?, xl? }`.

## Usage Examples

### Basic vertical stack with gap

```tsx
<VStack gap="space-8">
	<BodyLong>First item</BodyLong>
	<BodyLong>Second item</BodyLong>
	<BodyLong>Third item</BodyLong>
</VStack>
```

### Centered content

```tsx
<VStack gap="space-12" align="center">
	<Heading size="medium">Centered heading</Heading>
	<BodyLong>Centered paragraph</BodyLong>
	<Button>Action</Button>
</VStack>
```

### Form layout

```tsx
<VStack gap="space-8">
	<TextField label="Fornavn" />
	<TextField label="Etternavn" />
	<TextField label="E-post" type="email" />
	<Button type="submit">Send inn</Button>
</VStack>
```

### Responsive gap

```tsx
<VStack gap={{ xs: 'space-4', sm: 'space-8', md: 'space-12', lg: 'space-16' }}>
	<div>Tighter on mobile, spacious on desktop</div>
	<div>Adapts to viewport</div>
</VStack>
```

### Two-axis gap (row gap × column gap)

```tsx
<VStack gap="space-4 space-8">
	<div>Row gap is space-4, column gap is space-8</div>
	<div>Useful when VStack children also have inline content</div>
</VStack>
```

### With justify and width

```tsx
<VStack gap="space-8" justify="space-between" height="100vh" width="100%">
	<header>Top</header>
	<main>Middle</main>
	<footer>Bottom</footer>
</VStack>
```

### asChild — merge onto child element

```tsx
;<VStack gap="space-8" asChild>
	<form onSubmit={handleSubmit}>
		<TextField label="Felt 1" />
		<TextField label="Felt 2" />
		<Button type="submit">Send</Button>
	</form>
</VStack>
{
	/* Renders a single <form> with flex-column styles applied */
}
```

### Using `as` to change the rendered element

```tsx
<VStack gap="space-8" as="section">
	<Heading size="small">Section heading</Heading>
	<BodyLong>Section content</BodyLong>
</VStack>
```

## Accessibility

- `VStack` renders a `<div>` by default — it carries no semantic meaning. Use `as` or `asChild` to render a semantically appropriate element (e.g. `<section>`, `<nav>`, `<form>`) when the content warrants it.
- DOM order should match visual reading order. Since VStack stacks top-to-bottom, ensure the source order reflects the intended reading sequence.
- Ensure stacked children have sufficient spacing (`gap`) to remain visually distinct and legible at all viewport sizes.

## Do's and Don'ts

### ✅ Do

- Use `VStack` to group form elements vertically with consistent spacing.
- Use Aksel spacing tokens for `gap`, `padding`, and `margin` to stay consistent with the design system.
- Use responsive objects for `gap` to adapt spacing across breakpoints.
- Use `as` or `asChild` to render a semantic HTML element when the stack represents a meaningful section or form.
- Use `align="center"` when children should be horizontally centered within the stack.

### 🚫 Don't

- Don't use `VStack` for page-level grid layouts — use `Page` and `HGrid` instead.
- Don't hard-code pixel values for `gap` or `padding` — use Aksel spacing tokens.
- Don't nest VStacks deeply when a single VStack with appropriate gap can handle the layout.
- Don't use `VStack` for horizontal layouts — use `HStack` instead.
- Don't use `VStack` when you need CSS Grid features like column templates — use `HGrid` instead.

## Common Patterns in This Codebase

VStack is used throughout the app for vertical grouping with numeric gap shorthand:

```tsx
<VStack gap="4">
	<Heading size="small">{heading}</Heading>
	<BodyLong>{description}</BodyLong>
</VStack>
```

Two-axis gap with width and margin is used for detailed views:

```tsx
<VStack gap="4 8" width="100%" marginBlock="2 0">
	{/* Content with row and column gap */}
</VStack>
```

## See Also

- [HStack](https://aksel.nav.no/komponenter/primitives/hstack) — for horizontal flex rows
- [HGrid](https://aksel.nav.no/komponenter/primitives/hgrid) — for CSS Grid-based page layouts
- [Page](https://aksel.nav.no/komponenter/primitives/page) — for page-level layout structure
