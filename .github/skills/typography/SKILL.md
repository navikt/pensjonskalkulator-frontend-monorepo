# Typography — `@navikt/ds-react`

A set of components for Nav's typography styles: headings, body text, labels, and detail text. These components ensure correct font sizing, line height, and accessibility compliance (WCAG text resizing).

## Import

```tsx
import { BodyLong, BodyShort, Detail, Heading, Label } from '@navikt/ds-react'
```

> **Note:** `Ingress` is deprecated. Use `<BodyLong size="large">` instead.

## Components Overview

| Component   | Default element | Purpose                                     |
| ----------- | --------------- | ------------------------------------------- |
| `Heading`   | `<h1>`–`<h6>`   | Page and section headings                   |
| `BodyLong`  | `<p>`           | Running/paragraph text (body copy)          |
| `BodyShort` | `<p>`           | Short text, component descriptions, UI text |
| `Label`     | `<label>`       | Form labels and emphasized short text       |
| `Detail`    | `<p>`           | Very small text, tags, keywords             |

## Props

### `Heading`

| Prop             | Type                                                     | Default     | Description                                                                      |
| ---------------- | -------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------- |
| `size`           | `"xlarge" \| "large" \| "medium" \| "small" \| "xsmall"` | —           | **Required.** xlarge: 40px, large: 32px, medium: 24px, small: 20px, xsmall: 18px |
| `level`          | `"1" \| "2" \| "3" \| "4" \| "5" \| "6"`                 | `"1"`       | Semantic heading level (renders `<h1>`–`<h6>`)                                   |
| `children`       | `ReactNode`                                              | —           | Heading text                                                                     |
| `spacing`        | `boolean`                                                | —           | Adds `margin-bottom` (varies by `size`)                                          |
| `align`          | `"start" \| "center" \| "end"`                           | —           | Text alignment                                                                   |
| `textColor`      | `"default" \| "subtle" \| "contrast"`                    | —           | Text color variant                                                               |
| `visuallyHidden` | `boolean`                                                | —           | Hides visually but remains accessible to screen readers                          |
| `data-color`     | `AkselColorRole`                                         | `"neutral"` | Overrides inherited color                                                        |
| `as`             | `React.ElementType`                                      | —           | Override the rendered element                                                    |
| `className`      | `string`                                                 | —           | Additional CSS class                                                             |
| `ref`            | `Ref<HTMLHeadingElement>`                                | —           | Ref to the heading element                                                       |

**Mobile scaling:** At breakpoint 480px, `xlarge` scales from 40px → 32px, `large` from 32px → 28px.

### `BodyLong`

| Prop             | Type                                  | Default     | Description                                             |
| ---------------- | ------------------------------------- | ----------- | ------------------------------------------------------- |
| `size`           | `"large" \| "medium" \| "small"`      | `"medium"`  | large: 20px, medium: 18px, small: 16px                  |
| `children`       | `ReactNode`                           | —           | Text content                                            |
| `spacing`        | `boolean`                             | —           | Adds `margin-bottom` (varies by `size`)                 |
| `weight`         | `"regular" \| "semibold"`             | `"regular"` | Font weight                                             |
| `truncate`       | `boolean`                             | —           | Truncate overflow text with ellipsis                    |
| `align`          | `"start" \| "center" \| "end"`        | —           | Text alignment                                          |
| `textColor`      | `"default" \| "subtle" \| "contrast"` | —           | Text color variant                                      |
| `visuallyHidden` | `boolean`                             | —           | Hides visually but remains accessible to screen readers |
| `data-color`     | `AkselColorRole`                      | `"neutral"` | Overrides inherited color                               |
| `as`             | `React.ElementType`                   | —           | Override the rendered element (e.g., `"span"`)          |
| `className`      | `string`                              | —           | Additional CSS class                                    |
| `ref`            | `Ref<HTMLParagraphElement>`           | —           | Ref to the paragraph element                            |

### `BodyShort`

| Prop             | Type                                  | Default     | Description                                             |
| ---------------- | ------------------------------------- | ----------- | ------------------------------------------------------- |
| `size`           | `"large" \| "medium" \| "small"`      | `"medium"`  | large: 20px, medium: 18px, small: 16px                  |
| `children`       | `ReactNode`                           | —           | Text content                                            |
| `spacing`        | `boolean`                             | —           | Adds `margin-bottom` (varies by `size`)                 |
| `weight`         | `"regular" \| "semibold"`             | `"regular"` | Font weight                                             |
| `truncate`       | `boolean`                             | —           | Truncate overflow text with ellipsis                    |
| `align`          | `"start" \| "center" \| "end"`        | —           | Text alignment                                          |
| `textColor`      | `"default" \| "subtle" \| "contrast"` | —           | Text color variant                                      |
| `visuallyHidden` | `boolean`                             | —           | Hides visually but remains accessible to screen readers |
| `data-color`     | `AkselColorRole`                      | `"neutral"` | Overrides inherited color                               |
| `as`             | `React.ElementType`                   | —           | Override the rendered element                           |
| `className`      | `string`                              | —           | Additional CSS class                                    |
| `ref`            | `Ref<HTMLParagraphElement>`           | —           | Ref to the paragraph element                            |

### `Label`

| Prop             | Type                                  | Default     | Description                                                                           |
| ---------------- | ------------------------------------- | ----------- | ------------------------------------------------------------------------------------- |
| `size`           | `"medium" \| "small"`                 | `"medium"`  | medium: 18px, small: 16px                                                             |
| `children`       | `ReactNode`                           | —           | Label text                                                                            |
| `spacing`        | `boolean`                             | —           | Adds `margin-bottom`. Requires block element — use `as="p"` since `<label>` is inline |
| `textColor`      | `"default" \| "subtle" \| "contrast"` | —           | Text color variant                                                                    |
| `visuallyHidden` | `boolean`                             | —           | Hides visually but remains accessible to screen readers                               |
| `data-color`     | `AkselColorRole`                      | `"neutral"` | Overrides inherited color                                                             |
| `as`             | `React.ElementType`                   | —           | Override the rendered element (e.g., `"p"`, `"span"`)                                 |
| `className`      | `string`                              | —           | Additional CSS class                                                                  |
| `ref`            | `Ref<HTMLLabelElement>`               | —           | Ref to the label element                                                              |

### `Detail`

| Prop             | Type                                  | Default     | Description                                             |
| ---------------- | ------------------------------------- | ----------- | ------------------------------------------------------- |
| `children`       | `ReactNode`                           | —           | Text content                                            |
| `uppercase`      | `boolean`                             | —           | Renders text in ALL CAPS                                |
| `weight`         | `"regular" \| "semibold"`             | `"regular"` | Font weight                                             |
| `truncate`       | `boolean`                             | —           | Truncate overflow text with ellipsis                    |
| `spacing`        | `boolean`                             | —           | Adds `margin-bottom`                                    |
| `align`          | `"start" \| "center" \| "end"`        | —           | Text alignment                                          |
| `textColor`      | `"default" \| "subtle" \| "contrast"` | —           | Text color variant                                      |
| `visuallyHidden` | `boolean`                             | —           | Hides visually but remains accessible to screen readers |
| `data-color`     | `AkselColorRole`                      | `"neutral"` | Overrides inherited color                               |
| `size`           | `"medium" \| "small"`                 | `"medium"`  | **Deprecated.** Medium is now the same as small         |
| `as`             | `React.ElementType`                   | —           | Override the rendered element                           |
| `className`      | `string`                              | —           | Additional CSS class                                    |
| `ref`            | `Ref<HTMLParagraphElement>`           | —           | Ref to the paragraph element                            |

## Usage Examples

### Heading with level and size

```tsx
<Heading level="1" size="xlarge" spacing>
  Page title
</Heading>
<Heading level="2" size="large" spacing>
  Section heading
</Heading>
<Heading level="3" size="medium">
  Subsection heading
</Heading>
```

### Body text

```tsx
<BodyLong spacing>
  This is a paragraph of running text. Use BodyLong for body copy,
  descriptions, and any multi-line text content.
</BodyLong>

<BodyShort>Short UI text, like a field description.</BodyShort>
```

### Ingress text (replaces deprecated Ingress)

```tsx
<BodyLong size="large">
	This is ingress/intro text that introduces a page or section.
</BodyLong>
```

### Label for form fields

```tsx
<Label htmlFor="my-input">Fornavn</Label>
<input id="my-input" type="text" />
```

### Label with spacing (requires block element)

```tsx
<Label as="p" spacing>
	This label has spacing below it
</Label>
```

### Detail text

```tsx
<Detail>Sist oppdatert: 01.01.2025</Detail>
<Detail uppercase weight="semibold">Kategori</Detail>
```

### Text styling variants

```tsx
{
	/* Subtle color */
}
;<BodyShort textColor="subtle">Secondary information</BodyShort>

{
	/* Semibold weight */
}
;<BodyLong weight="semibold">Emphasized paragraph text</BodyLong>

{
	/* Centered alignment */
}
;<Heading level="2" size="medium" align="center">
	Centered heading
</Heading>

{
	/* Truncated text */
}
;<BodyShort truncate>
	This very long text will be truncated with an ellipsis if it overflows.
</BodyShort>
```

### Visually hidden (screen reader only)

```tsx
<Heading level="1" size="xlarge" visuallyHidden>
	Page title only for screen readers
</Heading>
```

### Override rendered element with `as`

```tsx
{
	/* Render heading as a span (visual heading without semantic heading) */
}
;<Heading level="2" size="large" as="span">
	Looks like a heading but is a span
</Heading>

{
	/* Render BodyLong as a div */
}
;<BodyLong as="div">
	<p>First paragraph</p>
	<p>Second paragraph</p>
</BodyLong>
```

## Accessibility

- **Heading hierarchy:** Always use `level` to match the correct semantic hierarchy on the page. Don't skip heading levels (e.g., don't jump from `h1` to `h3`). Use `size` independently from `level` when you need visual variation without breaking hierarchy.
- **Screen reader text:** Use `visuallyHidden` to provide headings or context for screen readers without visible text.
- **Text resizing:** Typography components use relative units so users can adjust text size and line height per WCAG requirements.
- **Color contrast:** Components do not guarantee contrast — verify your color choices against [WCAG contrast requirements](https://aksel.nav.no/god-praksis/artikler/143-kontrast) using tools like Colour Contrast Analyser or browser DevTools.
- **Semantic HTML:** `Heading` renders `<h1>`–`<h6>`, `BodyLong`/`BodyShort` render `<p>`, `Label` renders `<label>`, `Detail` renders `<p>`. Use the `as` prop only when you need to override for valid reasons.

## Do's and Don'ts

### ✅ Do

- Use `Heading` with both `level` and `size` — they are independent. A visually small heading can be `level="2"`.
- Use `BodyLong` for paragraphs and running text. Use `BodyShort` for short UI text (field descriptions, component labels).
- Use `<BodyLong size="large">` instead of the deprecated `Ingress` component.
- Use `spacing` to add consistent vertical rhythm between text blocks.
- Use `Label` for form field labels — it renders a semantic `<label>` element.
- Prefer `BodyShort` over `Detail` in most cases — `Detail` is very small and only suited for tags/keywords.

### 🚫 Don't

- Don't use `Heading` without `level` for anything other than `h1` — the default is `level="1"`.
- Don't skip heading levels in the document hierarchy.
- Don't use `Detail` for regular body text — it's too small for comfortable reading.
- Don't rely on `textColor` alone for meaning — ensure sufficient contrast and use additional visual cues.
- Don't use `Ingress` — it is deprecated.

## Common Patterns in This Codebase

### Heading with HeadingProps type

This codebase frequently passes `headingLevel` as a prop to child components using the `HeadingProps` type:

```tsx
import { Heading, HeadingProps } from '@navikt/ds-react'

interface Props {
	headingLevel: HeadingProps['level']
}

function Section({ headingLevel }: Props) {
	return (
		<Heading level={headingLevel} size="medium" spacing>
			Section title
		</Heading>
	)
}
```

### BodyLong with FormattedMessage (i18n)

```tsx
import { FormattedMessage } from 'react-intl'

import { BodyLong } from '@navikt/ds-react'

;<BodyLong>
	<FormattedMessage id="grunnlag.sivilstand.ingress" />
</BodyLong>
```

### Label for custom input display

```tsx
import { Label } from '@navikt/ds-react'

;<Label>{intl.formatMessage({ id: 'field.label' })}</Label>
```
