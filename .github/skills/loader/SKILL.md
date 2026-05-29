# Loader — `@navikt/ds-react`

Loader is a visual spinner indicating that something is loading or processing. It reassures users that something is happening, even when specific progress information is unavailable.

## Import

```tsx
import { Loader } from '@navikt/ds-react'
```

## Props

| Prop          | Type                                                                               | Default     | Description                                                  |
| ------------- | ---------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------ |
| `size`        | `"3xlarge" \| "2xlarge" \| "xlarge" \| "large" \| "medium" \| "small" \| "xsmall"` | `"medium"`  | Width/height: 88px · 64px · 40px · 32px · 24px · 20px · 16px |
| `title`       | `ReactNode`                                                                        | `"Venter…"` | Accessible title on the SVG element                          |
| `variant`     | `"neutral" \| "interaction" \| "inverted"`                                         | `"neutral"` | Color variant                                                |
| `transparent` | `boolean`                                                                          | `false`     | Sets SVG background to transparent                           |
| `data-color`  | `AkselColorRole`                                                                   | —           | Overrides inherited color                                    |
| `className`   | `string`                                                                           | —           | Additional CSS class                                         |
| `ref`         | `Ref<SVGSVGElement>`                                                               | —           | Ref to the SVG element                                       |

## Usage Examples

### Basic

```tsx
<Loader />
```

### Different sizes

```tsx
<Loader size="xsmall" />
<Loader size="small" />
<Loader size="medium" />
<Loader size="large" />
<Loader size="xlarge" />
<Loader size="2xlarge" />
<Loader size="3xlarge" />
```

### With accessible title

```tsx
<Loader title="Laster innhold …" />
```

Using react-intl:

```tsx
<Loader title={intl.formatMessage({ id: 'loading.message' })} />
```

Or with `<FormattedMessage>`:

```tsx
<Loader title={<FormattedMessage id="pageframework.loading" />} />
```

### Color variants

```tsx
<Loader variant="neutral" />
<Loader variant="interaction" />
<Loader variant="inverted" />
```

### Transparent background

```tsx
<Loader transparent />
```

### Inline in text or headers

```tsx
<BodyLong weight="semibold">{isLoading ? <Loader /> : person?.navn}</BodyLong>
```

### Full-page loading state

```tsx
<Loader
	data-testid="pageframework-loader"
	size="3xlarge"
	title={intl.formatMessage({ id: 'pageframework.loading' })}
/>
```

## Accessibility

- The `title` prop sets the accessible label on the SVG. Defaults to `"Venter…"`. Always provide a descriptive title when context requires it.
- Add `aria-live="polite"` on the Loader or its container so screen readers announce the loading state.
- Read [WCAG 4.1.3 Status Messages](https://aksel.nav.no/god-praksis/artikler/413-statusbeskjeder) before using Loader — loading states are status messages and should be communicated without moving focus.
- When wait time exceeds 9 seconds, display explanatory text alongside the Loader.

## Do's and Don'ts

### ✅ Do

- Use Loader to indicate content loading or an action in progress that takes **more than 1 second**.
- Provide a descriptive `title` for screen readers, especially when multiple loaders exist on a page.
- Use `size="3xlarge"` for full-page or section-level loading states.
- Use small sizes (`"xsmall"`, `"small"`) for inline or button-level loaders.
- Show explanatory text alongside the Loader when wait time exceeds 9 seconds.
- Add `data-testid` for test selectors.

### 🚫 Don't

- Don't use Loader when loading takes **less than 1 second** — it causes unnecessary flicker.
- Don't use Loader for loading individual elements on a page — use [Skeleton](https://aksel.nav.no/komponenter/core/skeleton) instead to avoid layout shift.
- Don't use Loader for long processes with **known duration or progression** — use [ProgressBar](https://aksel.nav.no/komponenter/core/progressbar) instead.
- Don't forget the `title` prop when the default `"Venter…"` doesn't describe the context.
- Don't cause [Cumulative Layout Shift](https://web.dev/articles/cls) (CLS) — if Loader causes content to shift, use Skeleton instead.

## Common Patterns in This Codebase

### Custom Loader wrapper

This repo wraps the Aksel Loader in a custom component at `@/components/common/Loader` that adds `aria-live="polite"` and optional centering:

```tsx
import { Loader } from '@/components/common/Loader'

// Centered by default (block + auto margin)
<Loader
  data-testid="my-loader"
  size="3xlarge"
  title={intl.formatMessage({ id: 'loading.message' })}
/>

// Inline (not centered)
<Loader isCentered={false} />
```

**Always prefer the custom wrapper** (`@/components/common/Loader`) over importing directly from `@navikt/ds-react`. It ensures consistent accessibility (`aria-live="polite"`) and centering behavior.

### Section-level loading pattern

Used when an entire section or page is loading data:

```tsx
if (isLoading) {
	return (
		<Loader
			data-testid="uttaksalder-loader"
			size="3xlarge"
			title={intl.formatMessage({ id: 'beregning.loading' })}
		/>
	)
}
```

### Inline loading in headers

Used inside Accordion headers or text when a single value is loading:

```tsx
<Accordion.Header>
	{headerTitle}: <Loader data-testid={`${headerTitle}-loader`} />
</Accordion.Header>
```

### Conditional inline loader

```tsx
<BodyLong weight="semibold">{isFetching ? <Loader /> : person?.navn}</BodyLong>
```
