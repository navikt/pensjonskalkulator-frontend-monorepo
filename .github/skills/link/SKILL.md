# Link — `@navikt/ds-react`

Link is a clickable text element used for navigation. It wraps a standard [anchor element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a) with Nav's design system styling.

## Import

```tsx
import { Link } from '@navikt/ds-react'
```

## Props

| Prop         | Type                                                              | Default | Description                                                                                                         |
| ------------ | ----------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------- |
| `href`       | `string`                                                          | —       | URL the link points to. **Always include even when using `onClick` for navigation** (keyboard accessibility).       |
| `children`   | `ReactNode`                                                       | —       | Link text or content                                                                                                |
| `underline`  | `boolean`                                                         | `true`  | When `false`, underline only appears on hover. **Only remove in menus or contexts where it's obvious it's a link.** |
| `inlineText` | `boolean`                                                         | `false` | Renders with `display: inline` for proper wrapping when the link is inside a paragraph or sentence.                 |
| `as`         | `React.ElementType`                                               | `"a"`   | Polymorphic element override. Use to render as React Router `Link`, Next.js `Link`, etc.                            |
| `data-color` | `AkselMainColorRole \| AkselBrandColorRole \| AkselMetaColorRole` | —       | Overrides inherited color. Prefer `accent` or `neutral`.                                                            |
| `className`  | `string`                                                          | —       | Additional CSS class                                                                                                |
| `ref`        | `Ref<HTMLAnchorElement>`                                          | —       | Ref to root anchor element                                                                                          |

All standard `<a>` HTML attributes (`target`, `rel`, `onClick`, etc.) are also supported.

> **Deprecated:** The `variant` prop (`"action" | "neutral" | "subtle"`) was removed in v8. Use `data-color` instead.

## Usage Examples

### Basic link

```tsx
<Link href="https://nav.no">Gå til NAV</Link>
```

### Inline link in a paragraph

```tsx
<BodyLong>
	Du kan lese mer om{' '}
	<Link href="/vilkaar" inlineText>
		vilkårene for alderspensjon
	</Link>{' '}
	på våre sider.
</BodyLong>
```

### External link with icon (opens in new tab)

```tsx
import { ExternalLinkIcon } from '@navikt/aksel-icons'
import { Link } from '@navikt/ds-react'

;<Link href="https://example.com" target="_blank" inlineText>
	Ekstern ressurs
	<ExternalLinkIcon
		title="åpner i en ny fane"
		width="1.25rem"
		height="1.25rem"
	/>
</Link>
```

### As React Router Link

```tsx
import { Link as ReactRouterLink } from 'react-router'

import { Link } from '@navikt/ds-react'

;<Link as={ReactRouterLink} to="/neste-steg">
	Gå til neste steg
</Link>
```

### Without underline (menus/navigation only)

```tsx
<nav>
	<Link href="/side-a" underline={false}>
		Side A
	</Link>
	<Link href="/side-b" underline={false}>
		Side B
	</Link>
</nav>
```

### With color override

```tsx
<Link href="/info" data-color="neutral">
	Nøytral lenke
</Link>
```

## Accessibility

- **Always include `href`** — even when handling navigation with `onClick`. Without `href`, the link is not keyboard-focusable and screen readers cannot identify the destination.
- **Keep underline on by default** — underline is the primary visual indicator that text is a link. Only remove it in menus or navigation where the context makes it obvious.
- **External links must be announced** — when using `target="_blank"`, include an `ExternalLinkIcon` with a descriptive `title` (e.g., `"åpner i en ny fane"`) so screen readers announce the behavior.
- **Write descriptive link text** — avoid "klikk her" or "les mer". The link text should describe where the link goes. Screen reader users often navigate by listing all links on a page.
- **Don't use the word "lenke"** in link text — users already know it's a link from its role.
- **Unique link text per page** — avoid multiple links with identical text. Users with assistive technology use link text to distinguish destinations.
- **Images as links** — if a link contains only an image, the image must have descriptive `alt` text. If a link contains both text and an image, use `alt=""` on the image.

## Do's and Don'ts

### ✅ Do

- Use `inlineText` when the link appears inside running text (`BodyLong`, `BodyShort`, `Label`, etc.).
- Use `as` to integrate with your router (React Router, Next.js) instead of wrapping or reimplementing.
- Include `ExternalLinkIcon` with a `title` when opening links in new tabs.
- Keep link text short and descriptive — start with the most relevant word.
- Place links at the beginning or end of a sentence when possible.
- Use `onClick` for analytics logging alongside `href` for navigation.

### 🚫 Don't

- Don't remove `underline` in body text — only in menus/navigation where context is clear.
- Don't use `target="_blank"` without indicating it to the user (icon or text).
- Don't use a URL as the link text — it's unreadable for screen readers.
- Don't open links in new tabs by default — only do it when users are mid-process or comparing information.
- Don't use external-link icons for links to other domains — only use them for links that open in a new tab.
- Don't omit `href` when using `onClick` for navigation — the link becomes inaccessible.
- Don't use the deprecated `variant` prop — use `data-color` instead.

## Common Patterns in This Codebase

### ExternalLink wrapper component

This repo has a reusable `ExternalLink` component that wraps `Link` with standard external link behavior:

```tsx
import { ExternalLink } from '@/components/common/ExternalLink'

;<ExternalLink href="https://nav.no/din-pensjon">
	Gå til Din Pensjon
</ExternalLink>
```

It automatically adds `target="_blank"`, `inlineText`, `ExternalLinkIcon` with accessible title, and analytics logging via `onClick`.

### React Router integration

When linking to internal routes, use the `as` prop with React Router's `Link`:

```tsx
import { Link as ReactRouterLink } from 'react-router'

import { Link } from '@navikt/ds-react'

;<Link as={ReactRouterLink} to={paths.login}>
	<FormattedMessage id="error.404.button.link_1" />
</Link>
```

### Inline links in Sanity rich text

Links in Sanity portable text content use the `Link` component with `inlineText` and conditionally add `ExternalLinkIcon` for external URLs:

```tsx
<Link href={value?.href} target="_blank" inlineText>
	{children}
	<ExternalLinkIcon
		title="åpner i en ny fane"
		width="1.25rem"
		height="1.25rem"
	/>
</Link>
```
