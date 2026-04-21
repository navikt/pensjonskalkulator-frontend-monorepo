# GuidePanel — `@navikt/ds-react`

GuidePanel gives users a friendly welcome and introduction to a solution or page. It displays guidance text alongside a character illustration.

## Import

```tsx
import { GuidePanel } from '@navikt/ds-react'
```

## Props

| Prop           | Type                        | Default                   | Description                                             |
| -------------- | --------------------------- | ------------------------- | ------------------------------------------------------- |
| `children`     | `ReactNode`                 | —                         | GuidePanel content                                      |
| `illustration` | `ReactNode`                 | Default Nav character     | Custom SVG/img element to replace the default avatar    |
| `poster`       | `boolean`                   | `true` on mobile (<480px) | Renders illustration above content instead of beside it |
| `className`    | `string`                    | —                         | Additional CSS class                                    |
| `ref`          | `LegacyRef<HTMLDivElement>` | —                         | Ref to root element                                     |

## Usage Examples

### Basic

```tsx
<GuidePanel>
	Saksbehandlingstiden varierer fra kommune til kommune. Hvis det går mer enn X
	måneder siden du søkte, skal du få brev om at saksbehandlingstiden er
	forlenget.
</GuidePanel>
```

### With heading

```tsx
import { BodyLong, GuidePanel, Heading } from '@navikt/ds-react'

;<GuidePanel>
	<Heading level="2" size="medium">
		Viktig informasjon
	</Heading>
	<BodyLong>
		Her er noe du bør være klar over når du fyller ut skjemaet.
	</BodyLong>
</GuidePanel>
```

### Poster mode (illustration on top)

```tsx
<GuidePanel poster>
	<Heading level="2" size="medium">
		Velkommen!
	</Heading>
	<BodyLong>
		Her kan du beregne din fremtidige pensjon. Vi trenger noen opplysninger fra
		deg først.
	</BodyLong>
</GuidePanel>
```

### Custom illustration

```tsx
import { GuidePanel, BodyLong } from '@navikt/ds-react'

const CustomAvatar = () => (
  <svg width="100" height="100" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="40" fill="#0067C5" />
  </svg>
)

<GuidePanel illustration={<CustomAvatar />}>
  <BodyLong>
    Denne guidepanelen bruker en tilpasset illustrasjon.
  </BodyLong>
</GuidePanel>
```

## Accessibility

- GuidePanel renders a `<div>` — it is not a semantic landmark. Wrap in `<section>` with `aria-label` or `aria-labelledby` when it represents a distinct content region.
- The default illustration is decorative and handled by Aksel with appropriate ARIA attributes. Custom illustrations should include `aria-hidden="true"` if purely decorative.
- Maintain proper heading hierarchy inside the panel (`<Heading level="2">` if the parent context uses `<h1>`).
- Ensure any interactive elements inside GuidePanel are keyboard accessible.

## Do's and Don'ts

### ✅ Do

- Use for **guidance, tips, and introductions** to a page or process.
- Place at the **top of the page** — that is where users expect it.
- Keep text **short, clear, and informative**.
- Use `poster` mode when the illustration should always appear above content.
- Wrap in `<section>` when it represents a distinct content area on the page.
- Use the avatar to display an **illustration of a person** from Aksel's illustration library.

### 🚫 Don't

- Don't use for **critical alerts or error messages** — use `Alert` instead.
- Don't use for **form validation feedback** — use field-level `error` props or `ErrorSummary`.
- Don't use **multiple GuidePanels** on the same page.
- Don't put **complex nested layouts** (grids, tables) inside the panel — keep content simple and vertical.
- Don't use for **inline notifications** — use `InlineMessage` instead.

## Common Patterns in This Codebase

### SanityGuidePanel wrapper

This repo wraps `GuidePanel` in a `SanityGuidePanel` component that loads content from Sanity CMS:

```tsx
import { SanityGuidePanel } from '@/components/common/SanityGuidePanel'

;<SanityGuidePanel
	id="vurderer_du_a_velge_afp"
	className={styles.guidePanel}
	hasSection
/>
```

The wrapper always uses `poster` mode, renders an optional `<Heading level="2">` if the Sanity entry has `overskrift`, and uses `PortableText` for rich text content. When `hasSection` is `true`, it wraps the panel in a `<section>` element.

### Typical styling

```scss
.guidePanel {
	margin-bottom: var(--a-spacing-8);
}

.section {
	display: flex;
	margin-bottom: var(--a-spacing-10);

	@media (min-width: variables.$a-breakpoint-lg) {
		max-width: 632px;
	}
}
```

### Key files

- `src/components/common/SanityGuidePanel/SanityGuidePanel.tsx` — CMS-driven wrapper
- `src/components/common/SanityGuidePanel/SanityGuidePanel.module.scss` — Styling
