# Hide — `@navikt/ds-react`

Responsive primitive that hides its children at specified breakpoints using `display: none`. Content is hidden visually but still rendered in the DOM — Hide is not a replacement for lazy-loading or conditional rendering.

## Import

```tsx
import { Hide } from '@navikt/ds-react'
```

## Props

| Prop        | Type                                    | Default | Description                                                             |
| ----------- | --------------------------------------- | ------- | ----------------------------------------------------------------------- |
| `above`     | `"sm" \| "md" \| "lg" \| "xl" \| "2xl"` | —       | Hide element at viewports **above** the breakpoint (inclusive)          |
| `below`     | `"sm" \| "md" \| "lg" \| "xl" \| "2xl"` | —       | Hide element at viewports **below** the breakpoint (inclusive)          |
| `as`        | `"div" \| "span"`                       | `"div"` | Override the rendered HTML element                                      |
| `asChild`   | `boolean`                               | —       | Render as its child element, merging classes, styles and event handlers |
| `className` | `string`                                | —       | Additional CSS class                                                    |
| `ref`       | `Ref<HTMLDivElement>`                   | —       | Ref to the underlying DOM element                                       |

### Breakpoint values

| Token | Value  |
| ----- | ------ |
| `sm`  | 480px  |
| `md`  | 768px  |
| `lg`  | 1024px |
| `xl`  | 1280px |
| `2xl` | 1440px |

## Usage Examples

### Hide on mobile (show only on larger screens)

```tsx
<Hide below="md">
	<Sidebar />
</Hide>
```

Elements inside are hidden when the viewport is **768px or narrower**.

### Hide on desktop (show only on small screens)

```tsx
<Hide above="lg">
	<MobileMenu />
</Hide>
```

Elements inside are hidden when the viewport is **1024px or wider**.

### Combined with Show for responsive swap

Use `Hide` and `Show` together to render different content at different breakpoints:

```tsx
import { Hide, Show } from '@navikt/ds-react'

{
	/* Full sidebar visible on desktop only */
}
;<Hide below="md">
	<DesktopSidebar />
</Hide>

{
	/* Compact menu visible on mobile only */
}
;<Show below="md">
	<MobileMenu />
</Show>
```

### Using asChild to avoid extra wrapper elements

```tsx
<Hide below="md" asChild>
	<nav className="desktop-nav">
		<a href="/home">Hjem</a>
		<a href="/about">Om oss</a>
	</nav>
</Hide>
```

With `asChild`, Hide does not render its own `<div>` — it merges responsive hiding behavior onto the child element directly.

### Inline usage with `as="span"`

```tsx
<Heading level="2" size="medium">
	Pensjonskalkulator
	<Hide below="md" as="span">
		{' '}
		— detaljert visning
	</Hide>
</Heading>
```

## Accessibility

- Hidden content is still present in the DOM and **will be read by screen readers** unless separately hidden with `aria-hidden="true"`.
- Do not use `Hide` to remove content that is essential for understanding. If content must be available to all users, consider a responsive layout instead.
- When swapping content between breakpoints with `Hide`/`Show`, ensure both versions convey equivalent information to assistive technologies.
- If using `Hide` to toggle navigation, ensure the alternative navigation (e.g. a hamburger menu) is keyboard-accessible and announced properly.

## Do's and Don'ts

### ✅ Do

- Use Hide to adapt layouts to different screen sizes (e.g. hide a sidebar on mobile).
- Use Hide together with Show for responsive content swapping.
- Use `asChild` to avoid unnecessary wrapper `<div>` elements.
- Use `as="span"` when hiding inline content within text or headings.

### 🚫 Don't

- Don't use Hide to conditionally render content based on application state — use regular conditional rendering (`{condition && <Component />}`) instead.
- Don't rely on Hide for lazy-loading — hidden children are still rendered in the DOM and will execute effects and fetch data.
- Don't use Hide to permanently remove content from the page — it's a responsive visibility utility, not a toggle.
- Don't nest multiple Hide components with conflicting breakpoints — the result may be confusing and hard to maintain.
