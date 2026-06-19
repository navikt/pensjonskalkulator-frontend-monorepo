# Bleed — `@navikt/ds-react`

A layout primitive that applies **negative margin** to let content "bleed" outside its parent's padding. Useful for breaking out of a padded container (e.g. a full-width image inside a card) or for 1 px optical alignment nudges.

## Import

```tsx
import { Bleed } from '@navikt/ds-react'
```

## Props

| Prop                | Type                                                              | Default | Description                                                                                                                                                                                                       |
| ------------------- | ----------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `marginInline`      | `ResponsiveProp<SpacingToken \| "full" \| "px" \| "token token">` | —       | **Negative** horizontal margin. Accepts a spacing token, two tokens (`"space-4 space-8"`), or `"full"` to stretch to viewport edge. Also accepts a responsive object.                                             |
| `marginBlock`       | `ResponsiveProp<SpacingToken \| "px" \| "token token">`           | —       | **Negative** vertical margin. Same as `marginInline` but does **not** accept `"full"`.                                                                                                                            |
| `reflectivePadding` | `boolean`                                                         | `false` | When `true`, adds padding equal to the negative margin. The element bleeds visually (background extends) but inner content stays in its original position. Overwrites child padding when combined with `asChild`. |
| `asChild`           | `boolean`                                                         | `false` | Renders as the nearest child element instead of an extra `<div>`. Merges classes, styles, and event handlers.                                                                                                     |
| `className`         | `string`                                                          | —       | Additional CSS class                                                                                                                                                                                              |
| `ref`               | `Ref<HTMLDivElement>`                                             | —       | Ref to the underlying DOM element                                                                                                                                                                                 |

### ResponsiveProp

All margin props accept either a single token or a per-breakpoint object:

```ts
// Single value — applies at all breakpoints
marginInline="space-16"

// Two-value shorthand — inline-start / inline-end
marginInline="space-16 space-20"

// Responsive object — keys: xs, sm, md, lg, xl, 2xl
marginInline={{ xs: "space-0 space-8", sm: "space-12", md: "space-16 space-20", lg: "space-20", xl: "space-24", "2xl": "space-32" }}
```

### Special values

| Value    | Behaviour                                                                                                                                                                  |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"full"` | Uses `calc((100vw - 100%) / -2)` to extend to the viewport edge. **`marginInline` only.** You may need `overflow-x: hidden` on `<body>` to prevent a horizontal scrollbar. |
| `"px"`   | Applies a 1 px negative margin — handy for [optical alignment](https://medium.com/design-bridges/optical-effects-9fca82b4cd9a).                                            |

## Usage Examples

### Basic bleed — break out of parent padding

```tsx
<Box padding="space-8">
	<p>This paragraph respects the padding.</p>

	<Bleed marginInline="space-8">
		<p>This paragraph bleeds through the parent's horizontal padding.</p>
	</Bleed>
</Box>
```

### Full-width image inside a padded container

```tsx
<Box padding="space-12">
	<Heading size="medium">Artikkel</Heading>

	<Bleed marginInline="full">
		<img
			src="/hero.jpg"
			alt="Illustrasjon"
			style={{ width: '100%', display: 'block' }}
		/>
	</Bleed>

	<BodyLong>Brødtekst som følger normal padding.</BodyLong>
</Box>
```

### Reflective padding — background bleeds, content stays

Use `reflectivePadding` when the background should extend but the text should remain aligned with surrounding content.

```tsx
<Box padding="space-8">
	<p>Normal content.</p>

	<Bleed marginInline="space-8" reflectivePadding>
		<div style={{ backgroundColor: 'var(--a-surface-info-subtle)' }}>
			Content stays aligned, but the background stretches edge-to-edge.
		</div>
	</Bleed>
</Box>
```

### With asChild — avoid extra DOM wrapper

`asChild` merges Bleed's negative-margin styles onto the child element directly.

```tsx
<Box padding="space-6">
	<Bleed marginInline="space-6" asChild>
		<img
			src="/banner.jpg"
			alt="Banner"
			style={{ width: '100%', display: 'block' }}
		/>
	</Bleed>
</Box>
```

### Responsive margins

```tsx
<Bleed
	marginInline={{
		xs: 'space-4',
		md: 'space-8',
		lg: 'space-12',
	}}
>
	<Card>Responsive bleed</Card>
</Bleed>
```

### Optical alignment with px

```tsx
<Bleed marginInline="px">
	<Button variant="tertiary">Optisk justert knapp</Button>
</Bleed>
```

## Accessibility

- Bleed is a purely visual layout utility — it renders a `<div>` (or the child element when `asChild` is used) and adds no semantic meaning.
- Ensure bleed content does not overflow the visible viewport in a way that hides interactive elements from keyboard or screen-reader users.
- When using `marginInline="full"`, verify there is no unintended horizontal scrollbar that could confuse assistive-technology users.

## Do's and Don'ts

### ✅ Do

- Use Bleed to let images, dividers, or background colours extend past a parent's padding.
- Use `reflectivePadding` when you want the background to bleed but the text to stay aligned.
- Use `asChild` to avoid unnecessary wrapper `<div>` elements.
- Use `"full"` for true edge-to-edge layouts within a padded page.
- Combine with `Box` padding tokens so the bleed amount matches the padding it cancels.

### 🚫 Don't

- Don't use Bleed for building larger page layouts — use `Page`, `HGrid`, or `VStack`/`HStack` instead.
- Don't use `marginInline="full"` for header/footer components — use `Page.Block` with `width="full"`.
- Don't forget `overflow-x: hidden` on `<body>` when using `"full"` if a horizontal scrollbar appears.
- Don't combine `reflectivePadding` with `asChild` unless you intend to overwrite the child's existing padding.

## See Also

- [Box](/komponenter/primitives/box) — padded container that Bleed often cancels
- [Page](/komponenter/primitives/page) — page-level layout primitive
- [HGrid](/komponenter/primitives/hgrid) — grid layout primitive
- [Layout Primitives overview](https://aksel.nav.no/grunnleggende/kode/layout-primitives) — full list of layout primitives
