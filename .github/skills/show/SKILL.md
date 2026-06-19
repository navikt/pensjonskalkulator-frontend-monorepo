# Show — `@navikt/ds-react`

A responsive primitive that shows its children only at specified breakpoints using CSS `display: none`. Content remains in the DOM when hidden — this is **not** conditional rendering or lazy-loading, it is a CSS visibility utility.

## Import

```tsx
import { Show } from '@navikt/ds-react'
```

## Props

| Prop        | Type                                    | Default | Description                                                                           |
| ----------- | --------------------------------------- | ------- | ------------------------------------------------------------------------------------- |
| `above`     | `"sm" \| "md" \| "lg" \| "xl" \| "2xl"` | —       | Show element **above** the breakpoint (inclusive)                                     |
| `below`     | `"sm" \| "md" \| "lg" \| "xl" \| "2xl"` | —       | Show element **below** the breakpoint (inclusive)                                     |
| `as`        | `"div" \| "span"`                       | `"div"` | Overrides the rendered HTML tag                                                       |
| `asChild`   | `boolean`                               | —       | When `true`, renders as its child element, merging classes, styles and event handlers |
| `className` | `string`                                | —       | Additional CSS class                                                                  |
| `ref`       | `Ref<HTMLDivElement>`                   | —       | Ref to the underlying DOM element                                                     |

### Breakpoint Reference

| Token | Width   |
| ----- | ------- |
| `xs`  | 320 px  |
| `sm`  | 480 px  |
| `md`  | 768 px  |
| `lg`  | 1024 px |
| `xl`  | 1280 px |
| `2xl` | 1440 px |

`above` and `below` are **inclusive** — e.g. `above="md"` means the element is visible when the viewport is ≥ 768 px.

## Usage Examples

### Show on desktop only

```tsx
<Show above="md">
	<Sidebar />
</Show>
```

The sidebar is visible at `md` (768 px) and wider. On smaller screens it is hidden via `display: none`.

### Show on mobile only

```tsx
<Show below="md">
	<MobileMenu />
</Show>
```

The mobile menu is visible below `md` (< 768 px). On wider viewports it is hidden.

### Combined with Hide for layout switching

```tsx
import { Hide, Show } from '@navikt/ds-react'

{
	/* Desktop layout */
}
;<Show above="lg">
	<DesktopNavigation />
</Show>

{
	/* Mobile layout */
}
;<Hide above="lg">
	<HamburgerMenu />
</Hide>
```

### Using asChild to avoid extra wrapper elements

```tsx
<Show above="md" asChild>
	<nav className="desktop-nav">
		<a href="/hjem">Hjem</a>
		<a href="/kalkulator">Kalkulator</a>
	</nav>
</Show>
```

When `asChild` is true, `Show` does not render its own `<div>`. Instead it merges its responsive styles directly onto the `<nav>` element.

### Rendering as a span (inline context)

```tsx
<Heading level="2" size="medium">
	Pensjonskalkulator
	<Show above="lg" as="span">
		{' '}
		— detaljert visning
	</Show>
</Heading>
```

Use `as="span"` when the Show is placed inside inline or text-level content.

## Accessibility

- Because `Show` uses CSS `display: none`, hidden content is **removed from the accessibility tree** — screen readers will not announce it.
- Do not rely on `Show`/`Hide` to convey different information at different breakpoints. The **semantic content** should be equivalent across viewports; only the presentation should change.
- If you show different interactive controls at different breakpoints (e.g. a sidebar vs. a hamburger menu), make sure both paths provide the same navigation and functionality.

## Do's and Don'ts

### ✅ Do

- Use `Show` to display layout elements (sidebars, nav items, supplementary panels) at appropriate breakpoints.
- Pair `Show` with `Hide` when you need to swap between two different presentations at a breakpoint.
- Use `asChild` to avoid unnecessary wrapper `<div>` elements in the DOM.
- Use `as="span"` when placing `Show` inside inline content.

### 🚫 Don't

- Don't use `Show` for conditional rendering based on application state — use normal React conditionals instead.
- Don't use `Show` as a substitute for lazy-loading — children are always rendered in the DOM and will fetch data, run effects, etc.
- Don't duplicate critical content across `Show`/`Hide` pairs with different text — keep content semantically equivalent.
- Don't use both `above` and `below` on the same `Show` instance — use two separate components or combine with `Hide`.

## See Also

- [Hide](https://aksel.nav.no/komponenter/primitives/hide) — the inverse primitive that **hides** content at specified breakpoints
- [Breakpoints](https://aksel.nav.no/grunnleggende/styling/brekkpunkter) — Aksel breakpoint tokens and media-query usage
