# ReadMore — `@navikt/ds-react`

ReadMore consists of a button that opens/closes a text panel with an expanded explanation. Use it to clarify difficult terms, justify questions, or provide additional context for users who need more detail.

## Import

```tsx
import { ReadMore } from '@navikt/ds-react'
```

## Props

| Prop           | Type                             | Default    | Description                                                                   |
| -------------- | -------------------------------- | ---------- | ----------------------------------------------------------------------------- |
| `children`     | `ReactNode`                      | —          | Content shown inside the expandable panel                                     |
| `header`       | `ReactNode`                      | —          | Text displayed on the toggle button                                           |
| `open`         | `boolean`                        | —          | Controlled open state. Using this prop removes automatic open/close behaviour |
| `defaultOpen`  | `boolean`                        | `false`    | Whether the panel is initially open (uncontrolled)                            |
| `onOpenChange` | `(open: boolean) => void`        | —          | Callback fired when the open state changes                                    |
| `size`         | `"large" \| "medium" \| "small"` | `"medium"` | Font size for the content                                                     |
| `className`    | `string`                         | —          | Custom class name                                                             |
| `ref`          | `Ref<HTMLButtonElement>`         | —          | Ref forwarded to the underlying `<button>`                                    |

## Usage Examples

### Basic

```tsx
<ReadMore header="Dette regnes som helsemessige begrensninger">
	Med helsemessige begrensninger mener vi funksjonshemming, sykdom, allergier
	som hindrer deg i arbeidet eller andre årsaker som må tas hensyn til når du
	skal finne nytt arbeid.
</ReadMore>
```

### Default open

```tsx
<ReadMore header="Om pensjonsalder" defaultOpen>
	Pensjonsalderen avhenger av ditt fødselsår og din opptjening i folketrygden.
</ReadMore>
```

### Controlled

```tsx
const [open, setOpen] = React.useState(false)

<ReadMore header="Grunnen til at vi spør om dette" open={open} onOpenChange={setOpen}>
  Vi trenger denne informasjonen for å beregne pensjonen din.
</ReadMore>
```

### Small size

```tsx
<ReadMore header="Hva betyr dette?" size="small">
	Beløpet viser din samlede pensjonsopptjening.
</ReadMore>
```

### With logging via onOpenChange (codebase pattern)

This repo wraps the Aksel `ReadMore` in `@/components/common/ReadMore` which adds analytics logging. Always prefer the wrapper when available:

```tsx
import { ReadMore } from '@/components/common/ReadMore'

;<ReadMore name="om-pensjonsalder" header="Om pensjonsalder">
	Pensjonsalderen avhenger av ditt fødselsår.
</ReadMore>
```

### With react-intl

```tsx
const intl = useIntl()

<ReadMore header={intl.formatMessage({ id: 'readmore.header' })}>
  {intl.formatMessage({ id: 'readmore.body' })}
</ReadMore>
```

### With Sanity content (codebase pattern)

For Sanity-managed ReadMore content, use the `SanityReadmore` wrapper:

```tsx
import { SanityReadmore } from '@/components/common/SanityReadmore'

;<SanityReadmore id="om-pensjonsalder" />
```

## Accessibility

- The `header` prop is rendered as a `<button>`, giving it keyboard focus and toggle behaviour out of the box.
- The expandable panel is connected to the button via `aria-expanded`, so screen readers announce the current open/closed state.
- Content inside the panel is hidden from the accessibility tree when collapsed.
- No additional ARIA attributes are needed for basic usage.

## Do's and Don'ts

### ✅ Do

- Use ReadMore for **short** supplementary explanations — one paragraph or a brief list.
- Write button text that clearly describes what will be revealed.
- Keep button text short, ideally a single line.
- Place ReadMore **directly beneath** the form element it explains.
- Use the `onOpenChange` callback for analytics logging.

### 🚫 Don't

- Don't write the header as a question (e.g., _"Hvorfor spør vi om dette?"_) — user testing showed this confuses users. Use a statement instead (e.g., _"Grunnen til at vi spør om dette"_).
- Don't use ReadMore for **critical information** the user must see to complete a task.
- Don't put **large amounts of content** or rich media inside — use `ExpansionCard` for longer content.
- Don't use ReadMore to show overflow content in articles.
- Don't nest multiple ReadMore components inside each other.

## Common Patterns

### Suitable for

- Explaining difficult terms or concepts
- Justifying why a question is asked in a form
- Providing additional context that only some users need

### Not suitable for

- Showing overflow or extra article content (use pagination or tabs)
- Rich content beyond simple text formatting and links
- Important information the user must read
- Very long content (use `ExpansionCard` instead)
