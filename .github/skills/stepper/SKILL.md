# Stepper — `@navikt/ds-react`

Stepper lets users navigate between steps and/or shows their progression through a multi-step flow, such as a form wizard. Each step renders as a clickable link or button with a numbered indicator.

## Import

```tsx
import { Stepper } from '@navikt/ds-react'
```

## Sub-components

| Component      | Element                      | Description                                  |
| -------------- | ---------------------------- | -------------------------------------------- |
| `Stepper`      | `<ol>`                       | Root ordered list wrapping all steps         |
| `Stepper.Step` | `<a>` / `<button>` / `<div>` | Individual step — renders as link by default |

## Props

### `Stepper`

| Prop           | Type                         | Default      | Description                                                                                                       |
| -------------- | ---------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------- |
| `activeStep`   | `number`                     | —            | Current active step. **Index starts at 1**, not 0                                                                 |
| `onStepChange` | `(step: number) => void`     | —            | Callback for next `activeStep`. Index starts at 1                                                                 |
| `orientation`  | `"horizontal" \| "vertical"` | `"vertical"` | The direction the component grows                                                                                 |
| `children`     | `ReactNode`                  | —            | Should contain `<Stepper.Step>` elements                                                                          |
| `interactive`  | `boolean`                    | `true`       | **Deprecated** — use `interactive` on `<Stepper.Step>` instead. For fully static steppers use `Process` component |
| `className`    | `string`                     | —            | Additional CSS class                                                                                              |
| `ref`          | `Ref<HTMLOListElement>`      | —            | Ref to root element                                                                                               |

### `Stepper.Step`

| Prop          | Type                     | Default | Description                                                                |
| ------------- | ------------------------ | ------- | -------------------------------------------------------------------------- |
| `children`    | `string`                 | —       | Text label shown next to the step indicator                                |
| `completed`   | `boolean`                | `false` | Shows a checkmark icon on the step indicator                               |
| `interactive` | `boolean`                | `true`  | Makes step non-interactive if `false`. Renders as `<div>`, overriding `as` |
| `as`          | `React.ElementType`      | —       | Override the default element (e.g., `"button"` for SPA navigation)         |
| `href`        | `string`                 | —       | URL for the step link (when using default `<a>` element)                   |
| `className`   | `string`                 | —       | Additional CSS class                                                       |
| `ref`         | `Ref<HTMLAnchorElement>` | —       | Ref to step element                                                        |

## Usage Examples

### Basic vertical stepper

```tsx
function BasicStepper() {
	const [activeStep, setActiveStep] = useState(1)

	return (
		<Stepper activeStep={activeStep} onStepChange={setActiveStep}>
			<Stepper.Step href="/steg/1">Start søknad</Stepper.Step>
			<Stepper.Step href="/steg/2">Personopplysninger</Stepper.Step>
			<Stepper.Step href="/steg/3">Arbeidsforhold</Stepper.Step>
			<Stepper.Step href="/steg/4">Oppsummering</Stepper.Step>
		</Stepper>
	)
}
```

### Horizontal orientation

```tsx
<Stepper activeStep={2} onStepChange={setActiveStep} orientation="horizontal">
	<Stepper.Step href="/steg/1">Steg 1</Stepper.Step>
	<Stepper.Step href="/steg/2">Steg 2</Stepper.Step>
	<Stepper.Step href="/steg/3">Steg 3</Stepper.Step>
</Stepper>
```

### With completed steps

```tsx
<Stepper activeStep={3} onStepChange={setActiveStep}>
	<Stepper.Step completed href="/steg/1">
		Personopplysninger
	</Stepper.Step>
	<Stepper.Step completed href="/steg/2">
		Arbeidsforhold
	</Stepper.Step>
	<Stepper.Step href="/steg/3">Tilleggsopplysninger</Stepper.Step>
	<Stepper.Step interactive={false}>Oppsummering</Stepper.Step>
</Stepper>
```

### Button steps (SPA navigation)

```tsx
<Stepper activeStep={activeStep} onStepChange={setActiveStep}>
	<Stepper.Step as="button" completed>
		Personopplysninger
	</Stepper.Step>
	<Stepper.Step as="button">Arbeidsforhold</Stepper.Step>
	<Stepper.Step as="button" interactive={false}>
		Oppsummering
	</Stepper.Step>
</Stepper>
```

### With onClick handlers (SPA)

```tsx
<Stepper activeStep={activeStep}>
	<Stepper.Step as="button" onClick={() => navigate('/steg/1')} completed>
		Start søknad
	</Stepper.Step>
	<Stepper.Step as="button" onClick={() => navigate('/steg/2')}>
		Personopplysninger
	</Stepper.Step>
</Stepper>
```

## Accessibility

- Renders as an `<ol>` (ordered list), providing semantic step ordering for screen readers.
- Step indicators display a number or checkmark, giving clear visual feedback on progress.
- Non-interactive steps render as `<div>` instead of `<a>`, preventing keyboard/screen reader users from activating them.
- `activeStep` is 1-indexed — this aligns with how users think about steps ("Step 1 of 4"), making `aria-label` values intuitive.
- Default `<a>` elements are keyboard-focusable; use `as="button"` for SPA navigation where links aren't appropriate.

## Common Patterns

### Multi-step form wizard with React state

```tsx
function StepWizard() {
	const [activeStep, setActiveStep] = useState(1)
	const totalSteps = 4

	const handleNext = () => setActiveStep((s) => Math.min(s + 1, totalSteps))
	const handlePrevious = () => setActiveStep((s) => Math.max(s - 1, 1))

	return (
		<>
			<Stepper activeStep={activeStep} onStepChange={setActiveStep}>
				<Stepper.Step completed={activeStep > 1}>
					Personopplysninger
				</Stepper.Step>
				<Stepper.Step completed={activeStep > 2}>Arbeidsforhold</Stepper.Step>
				<Stepper.Step completed={activeStep > 3}>
					Tilleggsopplysninger
				</Stepper.Step>
				<Stepper.Step interactive={false}>Oppsummering</Stepper.Step>
			</Stepper>

			{activeStep === 1 && <StepOne onNext={handleNext} />}
			{activeStep === 2 && (
				<StepTwo onNext={handleNext} onPrevious={handlePrevious} />
			)}
			{activeStep === 3 && (
				<StepThree onNext={handleNext} onPrevious={handlePrevious} />
			)}
			{activeStep === 4 && <Summary onPrevious={handlePrevious} />}
		</>
	)
}
```

### Stepper vs. Process vs. FormProgress

| Component      | Use when                                                     |
| -------------- | ------------------------------------------------------------ |
| `Stepper`      | User can navigate between steps (e.g., inside a form wizard) |
| `FormProgress` | Multi-step form with progress bar and collapsible stepper    |
| `Process`      | Showing a timeline the user cannot interact with             |

## Do's and Don'ts

### ✅ Do

- Use Stepper for **multi-step flows** where users need to navigate between steps.
- Mark previously completed steps with `completed` to show progress.
- Use `onStepChange` to handle navigation and optionally validate before allowing step changes.
- Use `interactive={false}` on steps the user hasn't reached yet or shouldn't skip to.
- Use `as="button"` for SPA navigation where `<a>` tags with `href` aren't appropriate.
- Prefer `FormProgress` when you also need a progress bar showing completion percentage.

### 🚫 Don't

- Don't use Stepper as the **only** navigation — it supplements primary navigation.
- Don't set `activeStep` to `0` — the index starts at **1**.
- Don't use the deprecated `interactive` prop on `Stepper` — set it on individual `Stepper.Step` instead.
- Don't put interactive elements inside `Stepper.Step` children — the step itself is the interactive element.
- Don't use Stepper for non-interactive timelines — use `Process` instead.
- Don't use Stepper when you need a progress bar — use `FormProgress` instead.
