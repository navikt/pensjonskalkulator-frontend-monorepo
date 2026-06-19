# Tooltip — `@navikt/ds-react`

Tooltip is a small popover with text that appears on focus or hover. Use it to describe an interactive element or the action it performs.

## Import

```tsx
import { Tooltip } from '@navikt/ds-react'
```

## Props

| Prop             | Type                                        | Default                          | Description                                                                                                                                |
| ---------------- | ------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `content`        | `string`                                    | —                                | **Required.** Text content inside the tooltip                                                                                              |
| `children`       | `ReactElement & RefAttributes<HTMLElement>` | —                                | **Required.** The element the tooltip anchors to. Must be a single ReactElement (no fragments)                                             |
| `placement`      | `"top" \| "right" \| "bottom" \| "left"`    | `"top"`                          | Orientation of the tooltip relative to the anchor                                                                                          |
| `arrow`          | `boolean`                                   | `true`                           | Toggles rendering of the tooltip arrow                                                                                                     |
| `offset`         | `number`                                    | `10` (with arrow), `2` (without) | Distance in pixels from anchor to tooltip                                                                                                  |
| `delay`          | `number`                                    | `150`                            | Delay in milliseconds before opening                                                                                                       |
| `maxChar`        | `number`                                    | `80`                             | Max character length. Exceeding emits a console warning. Prefer shortening content over increasing this value                              |
| `keys`           | `string[] \| [string[], string[]]`          | —                                | Keyboard shortcut keys to display                                                                                                          |
| `open`           | `boolean`                                   | —                                | Controlled open state                                                                                                                      |
| `defaultOpen`    | `boolean`                                   | `false`                          | Starts tooltip in open state. Use sparingly — hover/focus elsewhere closes it. `open` overwrites this                                      |
| `onOpenChange`   | `(open: boolean) => void`                   | —                                | Change handler for open state                                                                                                              |
| `describesChild` | `boolean`                                   | `false`                          | When `false`, tooltip **labels** the element (sets `aria-label`). When `true`, tooltip **describes** the element (sets `aria-describedby`) |
| `className`      | `string`                                    | —                                | Class name applied to the tooltip element                                                                                                  |
| `ref`            | `Ref<HTMLDivElement>`                       | —                                | Ref forwarded to the tooltip container                                                                                                     |

## Usage Examples

### Basic — labeling an icon button

When a button has no visible text, the tooltip serves as its accessible label (`describesChild` defaults to `false`).

```tsx
import { PrinterLargeIcon } from '@navikt/aksel-icons'
import { Button, Tooltip } from '@navikt/ds-react'

;<Tooltip content="Skriv ut dokument">
	<Button icon={<PrinterLargeIcon aria-hidden />} />
</Tooltip>
```

### Describing a button that already has a visible label

When the element already has visible text, use `describesChild` so the tooltip adds supplementary info via `aria-describedby` instead of replacing the label.

```tsx
<Tooltip content="Åpner i ny fane" describesChild>
	<Button>Gå til søknad</Button>
</Tooltip>
```

### With placement

```tsx
<Tooltip content="Neste steg" placement="right">
	<Button icon={<ArrowRightIcon aria-hidden />} />
</Tooltip>
```

### With keyboard shortcut

```tsx
<Tooltip content="Skriv ut" keys={['Ctrl', 'P']}>
	<Button icon={<PrinterLargeIcon aria-hidden />} />
</Tooltip>
```

### With multiple keyboard shortcuts (nested arrays)

```tsx
<Tooltip
	content="Lagre"
	keys={[
		['Ctrl', 'S'],
		['⌘', 'S'],
	]}
>
	<Button icon={<FloppydiskIcon aria-hidden />} />
</Tooltip>
```

### Without arrow

```tsx
<Tooltip content="Slett" arrow={false}>
	<Button variant="danger" icon={<TrashIcon aria-hidden />} />
</Tooltip>
```

### With custom delay

```tsx
<Tooltip content="Kopier lenke" delay={500}>
	<Button icon={<LinkIcon aria-hidden />} />
</Tooltip>
```

### Controlled open state

```tsx
const [open, setOpen] = useState(false)

<Tooltip content="Kontrollert tooltip" open={open} onOpenChange={setOpen}>
  <Button>Hover meg</Button>
</Tooltip>
```

## Accessibility

- **Labels by default:** When `describesChild` is `false` (default), the tooltip sets `aria-label` on the child, meaning the tooltip text **replaces** the child's accessible name. Use this for icon-only buttons that have no visible text.
- **Describes when opted in:** When `describesChild` is `true`, the tooltip sets `aria-describedby`, adding supplementary information without replacing the existing label. Use this when the child already has visible text.
- **Keyboard shortcut announcement:** When `keys` are provided, `aria-keyshortcuts` is automatically set on the child element.
- **Screen readers** read the tooltip content when the element receives keyboard focus.
- **Touch devices:** Tooltip appears on press and closes when tapping outside. Less suitable for touch-only interactions.
- **Escape dismissal:** Users can close the tooltip with the Escape key.

## Do's and Don'ts

### ✅ Do

- Use Tooltip for **short** text describing an interactive element or its action.
- Keep content under **80 characters** (the `maxChar` default).
- Use on **icon-only buttons** where the tooltip provides the accessible label.
- Set `describesChild` when the child element already has visible text.
- Ensure the element is **understandable without** the tooltip — it should enhance, not define, comprehension.

### 🚫 Don't

- Don't use Tooltip on **non-interactive elements** (e.g., plain text, images). It must wrap an interactive element.
- Don't use Tooltip for **rich content** (images, videos, buttons) — use `Popover` instead.
- Don't use Tooltip for **error messages or form help text** — these must be always visible.
- Don't use Tooltip to **reveal hidden content** that users need — design the UI so it's visible.
- Don't use Tooltip for **essential information** that must be seen to complete a task.
- Don't wrap **React fragments** or multiple children — the child must be a single ReactElement.

## Common Patterns

### Suitable for

- Icon-only buttons that need an accessible label (e.g., print, delete, copy)
- Supplementary description of interactive elements with visible labels
- Displaying keyboard shortcuts alongside their trigger element

### Not suitable for

- Long explanations (use `ReadMore` or `ExpansionCard`)
- Form field help text (use `description` prop on form components or `HelpText`)
- Error messages or validation feedback (use `Alert` or form `error` props)
- Rich content with links, buttons, or images (use `Popover`)
- Content on mobile/touch-only interfaces (tooltip requires hover or focus)
