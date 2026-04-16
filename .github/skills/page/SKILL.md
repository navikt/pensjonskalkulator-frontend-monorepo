# Page — `@navikt/ds-react`

A layout primitive for building page structure. Handles footer positioning, max-width constraints and centering of page blocks.

## Import

```tsx
import { Page } from '@navikt/ds-react'
```

## Sub-components

| Component      | Purpose                                                                             |
| -------------- | ----------------------------------------------------------------------------------- |
| `<Page>`       | Root page wrapper — positions footer and provides overall page structure            |
| `<Page.Block>` | Content block with predefined max-widths, centering and optional responsive gutters |

## Props

### Page

| Prop                  | Type                                      | Default           | Description                                                                |
| --------------------- | ----------------------------------------- | ----------------- | -------------------------------------------------------------------------- |
| `as`                  | `"div" \| "body"`                         | `"div"`           | Overrides the rendered HTML tag                                            |
| `footer`              | `ReactNode`                               | —                 | Footer content; enables better positioning of footer                       |
| `footerPosition`      | `"belowFold"`                             | —                 | Places footer below the page fold (sticky-to-bottom behavior)              |
| `contentBlockPadding` | `"end" \| "none"`                         | `"end"`           | Adds a standardised `4rem` padding between content and footer              |
| `width`               | `"text" \| "md" \| "lg" \| "xl" \| "2xl"` | `max-width: 100%` | Predefined max-width for the page itself                                   |
| `gutters`             | `boolean`                                 | `false`           | Adds standardised responsive `padding-inline` (3rem on ≥ md, 1rem on < md) |
| `className`           | `string`                                  | —                 | Additional CSS class                                                       |
| `ref`                 | `Ref<HTMLElement>`                        | —                 | Ref to the root element                                                    |

### Page.Block

| Prop        | Type                                      | Default           | Description                                                                                     |
| ----------- | ----------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------- |
| `as`        | `React.ElementType`                       | `"div"`           | Overrides the rendered HTML tag — use `"header"`, `"main"`, or `"footer"` for correct semantics |
| `width`     | `"text" \| "md" \| "lg" \| "xl" \| "2xl"` | `max-width: 100%` | Predefined max-width (see table below)                                                          |
| `gutters`   | `boolean`                                 | `false`           | Adds standardised responsive `padding-inline` (3rem on ≥ md, 1rem on < md)                      |
| `className` | `string`                                  | —                 | Additional CSS class                                                                            |
| `ref`       | `Ref<HTMLDivElement>`                     | —                 | Ref to the element                                                                              |

### Width values

| Value  | Max-width       | Description                                                    |
| ------ | --------------- | -------------------------------------------------------------- |
| `2xl`  | 1440px          | For up to 3 columns. Standard max-width for header and footer. |
| `xl`   | 1280px          | For up to 3 columns.                                           |
| `lg`   | 1024px          | For up to 2 columns.                                           |
| `md`   | 768px           | For 1 column.                                                  |
| `text` | 576px + gutters | Recommended line length for running text.                      |

## Usage Examples

### Basic page layout

```tsx
<Page
	footer={
		<Page.Block as="footer" width="2xl" gutters>
			<Footer />
		</Page.Block>
	}
>
	<Page.Block as="header" width="2xl" gutters>
		<Header />
	</Page.Block>
	<Page.Block as="main" width="lg" gutters>
		<Content />
	</Page.Block>
</Page>
```

### Sticky footer (below fold)

Use `footerPosition="belowFold"` to push the footer to the bottom of the viewport even when content is short.

```tsx
<Page
	footerPosition="belowFold"
	contentBlockPadding="end"
	footer={
		<Page.Block as="footer" width="2xl" gutters>
			<Footer />
		</Page.Block>
	}
>
	<Page.Block as="header" width="2xl" gutters>
		<Header />
	</Page.Block>
	<Page.Block as="main" width="lg" gutters>
		<p>Short content — footer stays at the bottom of the viewport.</p>
	</Page.Block>
</Page>
```

### With sidebar (wide content area)

Use a wider `width` on the main block to accommodate sidebars alongside primary content.

```tsx
<Page
	footer={
		<Page.Block as="footer" width="2xl" gutters>
			<Footer />
		</Page.Block>
	}
>
	<Page.Block as="header" width="2xl" gutters>
		<Header />
	</Page.Block>
	<Page.Block as="main" width="xl" gutters>
		<div style={{ display: 'flex', gap: '2rem' }}>
			<aside style={{ width: '280px', flexShrink: 0 }}>
				<Sidebar />
			</aside>
			<section style={{ flex: 1 }}>
				<MainContent />
			</section>
		</div>
	</Page.Block>
</Page>
```

### Content widths — narrow text

Use `width="text"` for pages with long-form readable content.

```tsx
<Page
	footer={
		<Page.Block as="footer" width="2xl" gutters>
			<Footer />
		</Page.Block>
	}
>
	<Page.Block as="header" width="2xl" gutters>
		<Header />
	</Page.Block>
	<Page.Block as="main" width="text" gutters>
		<BodyLong>
			Løpende tekst bør holdes til en maksbredde på ca. 576px for god lesbarhet.
		</BodyLong>
	</Page.Block>
</Page>
```

### No content-to-footer padding

Set `contentBlockPadding="none"` to remove the default `4rem` gap between content and footer.

```tsx
<Page
	contentBlockPadding="none"
	footer={
		<Page.Block as="footer" width="2xl" gutters>
			<Footer />
		</Page.Block>
	}
>
	<Page.Block as="main" width="lg" gutters>
		<Content />
	</Page.Block>
</Page>
```

## Accessibility

- `Page.Block` renders a `<div>` by default. **You must** set the `as` prop to the correct semantic element (`"header"`, `"main"`, `"footer"`) for screen readers and landmark navigation.
- Ensure only one `<main>` landmark exists per page.
- Footer placed via the `footer` prop remains in the expected DOM order for assistive technology.

## Do's and Don'ts

### ✅ Do

- Use `width="2xl"` for header and footer blocks — this is the Nav standard (1440px).
- Use semantic `as` values (`"header"`, `"main"`, `"footer"`) on every `Page.Block`.
- Use `footerPosition="belowFold"` so the footer is always at or below the viewport bottom.
- Enable `gutters` on blocks for standardised responsive horizontal padding.
- Use narrower widths (`"md"`, `"text"`) for single-column or text-heavy content.

### 🚫 Don't

- Don't leave `Page.Block` as a plain `<div>` — always set `as` for proper landmarks.
- Don't use `width="2xl"` on the main content block when the layout is single-column — use `"lg"` or `"md"` instead.
- Don't manually add `max-width` or `margin: 0 auto` — let `Page.Block` handle centering.
- Don't use the deprecated `background` prop — wrap `<Page>` with `<Box asChild background="...">` instead.
- Don't skip `gutters` — without them, content will touch viewport edges on smaller screens.
