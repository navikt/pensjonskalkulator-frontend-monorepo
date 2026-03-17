# Skeleton — `@navikt/ds-react`

Skeleton gives users a temporary visual placeholder while content loads or processes. It is a stylised representation of the actual content that will appear, reducing perceived load time and minimising layout shift (CLS).

## Import

```tsx
import { Skeleton } from '@navikt/ds-react'
```

## Props

| Prop        | Type                                             | Default  | Description                                                         |
| ----------- | ------------------------------------------------ | -------- | ------------------------------------------------------------------- |
| `variant`   | `"text" \| "circle" \| "rectangle" \| "rounded"` | `"text"` | Shape of the skeleton placeholder                                   |
| `width`     | `string \| number`                               | —        | Width of the skeleton. Required when not inferring from `children`  |
| `height`    | `string \| number`                               | —        | Height of the skeleton. Required when not inferring from `children` |
| `as`        | `"div" \| "span"`                                | `"div"`  | Overrides the rendered HTML element                                 |
| `children`  | `ReactNode`                                      | —        | Content to wrap — skeleton infers dimensions from children          |
| `className` | `string`                                         | —        | Additional CSS class                                                |
| `ref`       | `Ref<HTMLDivElement>`                            | —        | Ref to root element                                                 |

### Variant Guide

| Variant     | Use case                               |
| ----------- | -------------------------------------- |
| `text`      | Single line of text (default)          |
| `circle`    | Avatar, icon, or circular element      |
| `rectangle` | Card, image, or rectangular block      |
| `rounded`   | Rounded-corner card or tag placeholder |

## Usage Examples

### Text placeholder

```tsx
<Skeleton variant="text" width="100%" height={24} />
<Skeleton variant="text" width="60%" height={24} />
```

### Circle avatar

```tsx
<Skeleton variant="circle" width={48} height={48} />
```

### Rectangle card

```tsx
<Skeleton variant="rectangle" width="100%" height={120} />
```

### Rounded placeholder

```tsx
<Skeleton variant="rounded" width={200} height={40} />
```

### Wrapping a real component (infer dimensions)

When you pass `children`, the Skeleton infers its dimensions from the child element. The child content is hidden with `visibility: hidden` and `aria-hidden`.

```tsx
import { BodyLong, Heading, Skeleton } from '@navikt/ds-react'

function ArticleSkeleton() {
	return (
		<div>
			<Skeleton variant="text">
				<Heading size="medium">Placeholder heading</Heading>
			</Skeleton>
			<Skeleton variant="text">
				<BodyLong>
					Placeholder paragraph text that spans a line or two.
				</BodyLong>
			</Skeleton>
		</div>
	)
}
```

### Inline skeleton with `as="span"`

Use `as="span"` when the skeleton must sit inline with other text elements:

```tsx
<BodyLong>
	Beregnet pensjon: <Skeleton as="span" variant="text" width={80} height={20} />
</BodyLong>
```

### Full loading card pattern

```tsx
function CardSkeleton() {
	return (
		<div className="card">
			<Skeleton variant="rectangle" width="100%" height={160} />
			<div style={{ padding: '1rem' }}>
				<Skeleton variant="text" width="70%" height={28} />
				<Skeleton variant="text" width="100%" height={20} />
				<Skeleton variant="text" width="90%" height={20} />
			</div>
		</div>
	)
}
```

### Conditional rendering (loading vs content)

```tsx
function UserProfile({ isLoading, user }) {
	if (isLoading) {
		return (
			<section aria-label="Laster brukerprofil" aria-busy="true">
				<Skeleton variant="circle" width={64} height={64} />
				<Skeleton variant="text" width={200} height={24} />
				<Skeleton variant="text" width={150} height={20} />
			</section>
		)
	}

	return (
		<section aria-label="Brukerprofil">
			<img src={user.avatar} alt={user.name} />
			<Heading size="small">{user.name}</Heading>
			<BodyLong>{user.email}</BodyLong>
		</section>
	)
}
```

## Accessibility

- The Skeleton component sets `aria-hidden`, `visibility: hidden`, and `pointer-events: none` on child content. Screen readers will **not** announce skeleton content.
- Because skeletons are invisible to assistive technology, you **must** provide loading context separately:
  - Wrap skeleton sections in a container with `aria-busy="true"` while loading, and remove it when content is ready.
  - Use `aria-live="polite"` regions to announce when loading completes.
  - Alternatively, wrap skeletons in a `<section>` with a descriptive `aria-label` (e.g., `"Laster innhold"`).
- At longer load times (approaching 9 seconds), provide a visible progress indicator or explanatory text.

## Do's and Don'ts

### ✅ Do

- Use Skeleton to reduce perceived load time for content that loads within **a few seconds**.
- Match skeleton shapes to the actual content layout to minimise layout shift.
- Provide `width` and `height` explicitly when not using `children` for dimension inference.
- Use `as="span"` when embedding a skeleton inline within text or inline elements.
- Add `aria-busy="true"` on the parent container during loading.
- Use `aria-live` regions so screen readers know when content has loaded.

### 🚫 Don't

- Don't use Skeleton for load times exceeding **9 seconds** — use a Loader with an explanation instead.
- Don't show more skeleton elements than actual content will contain — it confuses users.
- Don't use Skeleton when the content might be empty — use a Loader or empty state instead.
- Don't rely solely on Skeleton for accessibility — it is `aria-hidden`, so assistive tech needs separate cues.
- Don't nest interactive elements inside Skeleton — all children have `pointer-events: none`.
- Don't forget to specify `width`/`height` when not wrapping children — the skeleton may collapse to zero size.

## Common Patterns

### Skeleton wrapper utility

Create a reusable loading wrapper that handles aria attributes:

```tsx
interface LoadingWrapperProps {
	isLoading: boolean
	label: string
	children: React.ReactNode
	skeleton: React.ReactNode
}

function LoadingWrapper({
	isLoading,
	label,
	children,
	skeleton,
}: LoadingWrapperProps) {
	return (
		<section aria-label={label} aria-busy={isLoading}>
			{isLoading ? skeleton : children}
		</section>
	)
}
```

### Multiple text lines

```tsx
function TextBlockSkeleton({ lines = 3 }: { lines?: number }) {
	return (
		<div>
			{Array.from({ length: lines }).map((_, i) => (
				<Skeleton
					key={i}
					variant="text"
					width={i === lines - 1 ? '60%' : '100%'}
					height={20}
				/>
			))}
		</div>
	)
}
```
