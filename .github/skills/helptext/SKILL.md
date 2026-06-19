# HelpText — `@navikt/ds-react`

HelpText displays a small question-mark icon that reveals a popover with a short explanation when clicked. Use it to clarify unfamiliar terms or concepts without cluttering the page.

## Import

```tsx
import { HelpText } from '@navikt/ds-react'
```

## Props

| Prop               | Type                                                                                                                                                                 | Default             | Description                                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `children`         | `ReactNode`                                                                                                                                                          | —                   | Content shown inside the popover                                                                                   |
| `title`            | `string`                                                                                                                                                             | `"Mer informasjon"` | Tooltip text on hover/focus. **Always provide a descriptive title** — it is the accessible name for screen readers |
| `placement`        | `"top" \| "bottom" \| "right" \| "left" \| "top-start" \| "top-end" \| "bottom-start" \| "bottom-end" \| "right-start" \| "right-end" \| "left-start" \| "left-end"` | `"top"`             | Orientation of the popover. Prefer `"top"`, `"bottom"`, `"right"`, `"left"` for general usage                      |
| `strategy`         | `"absolute" \| "fixed"`                                                                                                                                              | `"absolute"`        | CSS `position` strategy. Use `"fixed"` when the trigger is inside a fixed container but the popover is not         |
| `wrapperClassName` | `string`                                                                                                                                                             | —                   | Class name applied to the outer wrapper element                                                                    |
| `className`        | `string`                                                                                                                                                             | —                   | Class name applied to the button element                                                                           |
| `ref`              | `Ref<HTMLButtonElement>`                                                                                                                                             | —                   | Ref forwarded to the underlying `<button>`                                                                         |

## Usage Examples

### Basic

```tsx
<HelpText title="Hva er AFP?">
	Avtalefestet pensjon (AFP) er en pensjonsordning for deg som jobber i privat
	eller offentlig sektor med tariffavtale.
</HelpText>
```

### With placement

```tsx
<HelpText title="Om dette feltet" placement="right">
	Feltet viser din samlede pensjonsopptjening.
</HelpText>
```

### Next to a label

```tsx
<HStack gap="2" align="center">
	<Label>Sivilstand</Label>
	<HelpText title="Om sivilstand">
		Sivilstanden din kan påvirke beregningen av alderspensjon.
	</HelpText>
</HStack>
```

### In a table header

```tsx
<Table>
	<Table.Header>
		<Table.Row>
			<Table.HeaderCell>
				<HStack gap="2" align="center">
					Pensjonsgivende inntekt
					<HelpText title="Om pensjonsgivende inntekt">
						Inntekt som gir opptjening i folketrygden.
					</HelpText>
				</HStack>
			</Table.HeaderCell>
		</Table.Row>
	</Table.Header>
</Table>
```

### With react-intl

```tsx
const intl = useIntl()

<HelpText title={intl.formatMessage({ id: 'helptext.afp.title' })}>
  {intl.formatMessage({ id: 'helptext.afp.body' })}
</HelpText>
```

### Fixed strategy (inside a Modal or fixed container)

```tsx
<Modal open={open} onClose={onClose}>
	<Modal.Body>
		<HelpText title="Om beregning" strategy="fixed">
			Beregningen tar hensyn til din samlede opptjening.
		</HelpText>
	</Modal.Body>
</Modal>
```

## Accessibility

- The `title` prop sets the accessible name (tooltip) on the button. **Always provide a descriptive `title`** so screen reader users understand what the help icon explains. The default `"Mer informasjon"` is too generic when multiple HelpText instances appear on the same page.
- The popover content is **not** automatically announced when the button is activated — screen readers require the user to navigate into the popover to read it. HelpText does not move focus or use an ARIA live region.
- The icon button is small. Ensure adequate spacing between the HelpText and other interactive elements to meet touch-target requirements.
- The popover renders as a `<div>`. Do **not** nest HelpText inside a `<p>` or other element that only allows [phrasing content](https://developer.mozilla.org/en-US/docs/Web/HTML/Content_categories#phrasing_content).

## Do's and Don'ts

### ✅ Do

- Use HelpText for **short** tips, definitions, or clarifications.
- Provide a unique, descriptive `title` for every instance.
- Place HelpText **next to** the term or field it explains, using `HStack` with `gap` and `align="center"` for alignment.
- Keep popover content to one or two sentences.
- Use `placement` to avoid the popover being clipped by container edges.

### 🚫 Don't

- Don't put **long explanations** in HelpText — use `ReadMore` or a dedicated page instead.
- Don't use HelpText for **critical information** the user must see to complete a task.
- Don't nest HelpText inside a `<p>` tag (the popover renders a `<div>`, which is invalid inside `<p>`).
- Don't rely on the default `title` when there are **multiple** HelpText instances on the page — each needs a unique label.
- Don't place HelpText too close to other interactive elements — the small icon is hard to tap on mobile.

## Common Patterns

### Suitable for

- Tips and advice alongside form fields
- Explaining domain-specific terms (e.g., "AFP", "pensjonsgivende inntekt")
- Adding context to table column headers

### Not suitable for

- Large amounts of content (use `ReadMore` or `ExpansionCard`)
- Step-by-step instructions (use a guide panel or dedicated page)
- Error messages or validation feedback (use `Alert` or form `error` props)
