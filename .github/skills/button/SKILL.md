# Button — `@navikt/ds-react`

A clickable action element used for form submissions, calculations, and user interactions. Part of NAV's Aksel Design System.

## Import

```tsx
import { Button } from '@navikt/ds-react'
```

## Variants

| Variant             | Usage                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------- |
| `primary`           | Main action in a section — highest visual weight (e.g. "Send søknad", "Beregn")             |
| `secondary`         | Supporting actions alongside a primary button (e.g. "Tilbake", "Nullstill")                 |
| `tertiary`          | De-emphasized actions (e.g. "Avbryt"). Must include an icon when used alone                 |
| `secondary-neutral` | Neutral-colored secondary — use when color should not draw attention                        |
| `tertiary-neutral`  | Neutral-colored tertiary                                                                    |
| `danger`            | Destructive actions (e.g. "Slett"). Set via `data-color="danger"` on the button or a parent |

> **Note:** `danger` is applied through the `data-color` prop, not `variant`.

## Props

| Prop           | Type                                                    | Default     | Description                                                         |
| -------------- | ------------------------------------------------------- | ----------- | ------------------------------------------------------------------- |
| `children`     | `ReactNode`                                             | —           | Button content (label text)                                         |
| `variant`      | `"primary" \| "secondary" \| "tertiary"` + neutral vars | `"primary"` | Visual style and interaction design                                 |
| `size`         | `"medium" \| "small" \| "xsmall"`                       | `"medium"`  | Controls padding, height, and font-size                             |
| `loading`      | `boolean`                                               | `false`     | Replaces content with a spinner, preserves width                    |
| `icon`         | `ReactNode`                                             | —           | Icon element rendered inside the button                             |
| `iconPosition` | `"left" \| "right"`                                     | `"left"`    | Side of the label where the icon appears                            |
| `disabled`     | `boolean`                                               | `false`     | **Avoid if possible** — poor UX and accessibility                   |
| `as`           | `React.ElementType`                                     | `"button"`  | Polymorphic — render as `"a"`, `Link`, etc.                         |
| `data-color`   | `"accent" \| "neutral" \| "danger"` + others            | —           | Overrides inherited color. Prefer `accent`, `neutral`, and `danger` |
| `className`    | `string`                                                | —           | Additional CSS class                                                |
| `ref`          | `Ref<HTMLButtonElement>`                                | —           | Ref to the underlying DOM element                                   |

All standard `<button>` HTML attributes (`type`, `onClick`, `aria-label`, `data-testid`, etc.) are also accepted.

## Usage Examples

### Basic Variants

```tsx
<Button variant="primary">Lagre</Button>
<Button variant="secondary">Tilbake</Button>
<Button variant="tertiary">Avbryt</Button>
```

### With Icon

Icons should have `aria-hidden` when used alongside text.

```tsx
import { ChevronLeftCircleIcon } from '@navikt/aksel-icons'

;<Button
	icon={<ChevronLeftCircleIcon aria-hidden />}
	iconPosition="left"
	size="xsmall"
	variant="tertiary"
>
	Vis færre år
</Button>
```

### Icon on the Right

```tsx
import { ChevronRightCircleIcon } from '@navikt/aksel-icons'

;<Button
	icon={<ChevronRightCircleIcon aria-hidden />}
	iconPosition="right"
	size="xsmall"
	variant="tertiary"
>
	Vis flere år
</Button>
```

### Icon-Only Button

Must have an accessible label via `aria-label`, `title`, or a Tooltip.

```tsx
import { TrashIcon } from '@navikt/aksel-icons'

;<Button
	icon={<TrashIcon aria-hidden />}
	variant="tertiary"
	aria-label="Slett opphold"
/>
```

### Loading State

```tsx
<Button loading>Sender...</Button>
```

### Button as Link

Use the `as` prop with `href` so native link behaviors (open in new tab, etc.) work.

```tsx
<Button as="a" href="https://nav.no">
	Gå til nav.no
</Button>
```

### Danger / Destructive

```tsx
<Button data-color="danger">Slett</Button>
```

### Size Variants

```tsx
<Button size="medium">Standard</Button>
<Button size="small">Liten</Button>
<Button size="xsmall">Ekstra liten</Button>
```

### Form Submit (default type is `"submit"`)

```tsx
<Button type="submit" form="my-form-id">
	Beregn pensjon
</Button>
```

## Common Patterns in This Codebase

### Step Navigation (Primary → Secondary → Tertiary)

```tsx
import { FormattedMessage } from 'react-intl'

import { Button, HStack } from '@navikt/ds-react'

;<HStack gap="4">
	<Button type="submit" form={formId}>
		<FormattedMessage id="stegvisning.neste" />
	</Button>
	<Button type="button" variant="secondary" onClick={onPrevious}>
		<FormattedMessage id="stegvisning.tilbake" />
	</Button>
	<Button type="button" variant="tertiary" onClick={onCancel}>
		<FormattedMessage id="stegvisning.avbryt" />
	</Button>
</HStack>
```

### Form Button Row (Submit + Reset + Cancel)

```tsx
<Button form={formId}>
  {intl.formatMessage({ id: 'beregning.avansert.button.beregn' })}
</Button>
<Button type="button" variant="secondary" onClick={resetForm}>
  {intl.formatMessage({ id: 'beregning.avansert.button.nullstill' })}
</Button>
<Button type="button" variant="tertiary" onClick={gaaTilResultat}>
  {intl.formatMessage({ id: 'beregning.avansert.button.avbryt' })}
</Button>
```

### Retry Button with Icon

```tsx
import { ArrowCirclepathIcon } from '@navikt/aksel-icons'

;<Button
	size="small"
	iconPosition="right"
	variant="tertiary"
	onClick={onRetry}
	icon={<ArrowCirclepathIcon aria-hidden />}
>
	<FormattedMessage id="application.global.retry" />
</Button>
```

### Logging Wrapper

Buttons in this codebase wrap `onClick` with `wrapLogger` for analytics:

```tsx
import { wrapLogger } from '@/utils/logging'

;<Button
	variant="primary"
	onClick={wrapLogger('knapp klikket', { tekst: 'Enkel kalkulator' })(handler)}
>
	Start kalkulator
</Button>
```

## Accessibility

- **`aria-label` override:** Include the visible text first, then additional context.
  ```tsx
  <Button aria-label="Slett søknad.docx">Slett</Button>
  ```
- **Icons with text:** Always set `aria-hidden` on the icon so it is excluded from the accessible name.
- **Icon-only buttons:** Must have a text alternative (`aria-label`, `title`, or Tooltip).
- **Avoid `disabled`:** It prevents focus and is a poor way to communicate state. Show validation errors or explain why the action is unavailable instead.
- **`type` attribute:** Always set `type="button"` for non-submit buttons inside forms to prevent accidental submission.

## Do's and Don'ts

### ✅ Do

- Use **one primary** button per section/context for the main action.
- Use **sentence case** for button labels (capitalize first word only).
- Keep button text **short and descriptive** of the single action it performs.
- Use the **same color/variant** for buttons in a group.
- Set `type="button"` on buttons that should **not** submit a form.
- Wrap `onClick` with `wrapLogger` for analytics tracking.
- Use `<HStack gap="4">` to space grouped buttons.
- Use `as="a"` with `href` when the button navigates to a URL.

### ❌ Don't

- Don't use multiple primary buttons in the same section.
- Don't mix different color variants in the same button group (neutral + accent exception allowed).
- Don't use a tertiary button alone without an icon — it won't look like a button.
- Don't use `disabled` — prefer explaining why the action is unavailable.
- Don't assign multiple actions to one button or use long multi-line labels.
- Don't use `xsmall` without enough spacing between buttons, especially on mobile.
- Don't use `<Button onClick={navigate}>` for navigation — use `as="a"` with `href` instead.

## Quick Reference

```tsx
// Primary action
<Button>Send inn</Button>

// Secondary action
<Button variant="secondary">Tilbake</Button>

// Tertiary with icon
<Button variant="tertiary" icon={<XMarkIcon aria-hidden />}>Avbryt</Button>

// Loading
<Button loading>Lagrer...</Button>

// As link
<Button as="a" href="/path">Gå videre</Button>

// Small with icon on right
<Button size="small" icon={<ChevronRightIcon aria-hidden />} iconPosition="right">
  Neste
</Button>

// Danger
<Button data-color="danger">Slett</Button>

// Icon-only
<Button icon={<PencilIcon aria-hidden />} variant="tertiary" aria-label="Rediger" />
```
