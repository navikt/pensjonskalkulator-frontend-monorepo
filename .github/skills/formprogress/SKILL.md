# FormProgress — `@navikt/ds-react`

FormProgress shows users which step they are on in a multi-page form. It renders a progress bar with a collapsible stepper that lets users navigate between steps.

## Import

```tsx
import { FormProgress } from '@navikt/ds-react'
```

## Sub-components

| Component           | Element         | Description                                  |
| ------------------- | --------------- | -------------------------------------------- |
| `FormProgress`      | `<div>`         | Root wrapper with progress bar and stepper   |
| `FormProgress.Step` | `<a>` / `<div>` | Individual step — same API as `Stepper.Step` |

## Props

### `FormProgress`

| Prop               | Type                                                                             | Default | Description                                                                  |
| ------------------ | -------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------- |
| `totalSteps`       | `number`                                                                         | —       | Total number of steps                                                        |
| `activeStep`       | `number`                                                                         | —       | Current active step. **Index starts at 1**, not 0                            |
| `children`         | `ReactNode`                                                                      | —       | Should contain `<FormProgress.Step>` elements                                |
| `onStepChange`     | `(step: number) => void`                                                         | —       | Callback for next `activeStep`. Index starts at 1                            |
| `interactiveSteps` | `boolean`                                                                        | `true`  | Makes all steps non-interactive if `false`                                   |
| `open`             | `boolean`                                                                        | —       | Controls stepper visibility. Using this removes automatic open-state control |
| `onOpenChange`     | `(open: boolean) => void`                                                        | —       | Callback for current open-state                                              |
| `translations`     | `RecursivePartial<{ step: string; showAllSteps: string; hideAllSteps: string }>` | —       | i18n API for customizing texts and labels                                    |
| `className`        | `string`                                                                         | —       | Additional CSS class                                                         |
| `ref`              | `Ref<HTMLDivElement>`                                                            | —       | Ref to root element                                                          |

### `FormProgress.Step`

| Prop          | Type                     | Default | Description                                                                |
| ------------- | ------------------------ | ------- | -------------------------------------------------------------------------- |
| `children`    | `string`                 | —       | Text label shown next to the step indicator                                |
| `completed`   | `boolean`                | `false` | Shows a checkmark icon on the step indicator                               |
| `interactive` | `boolean`                | `true`  | Makes step non-interactive if `false`. Renders as `<div>` instead of `<a>` |
| `as`          | `React.ElementType`      | —       | Override the default element (e.g., `"button"` for SPA navigation)         |
| `href`        | `string`                 | —       | URL for the step link (when using default `<a>` element)                   |
| `className`   | `string`                 | —       | Additional CSS class                                                       |
| `ref`         | `Ref<HTMLAnchorElement>` | —       | Ref to step element                                                        |

## Usage Examples

### Basic

```tsx
<FormProgress totalSteps={4} activeStep={1}>
	<FormProgress.Step>Personopplysninger</FormProgress.Step>
	<FormProgress.Step>Arbeidsforhold</FormProgress.Step>
	<FormProgress.Step>Tilleggsopplysninger</FormProgress.Step>
	<FormProgress.Step>Oppsummering</FormProgress.Step>
</FormProgress>
```

### With completed steps and navigation

```tsx
function MyForm() {
	const [activeStep, setActiveStep] = useState(2)

	return (
		<FormProgress
			totalSteps={4}
			activeStep={activeStep}
			onStepChange={setActiveStep}
		>
			<FormProgress.Step completed>Personopplysninger</FormProgress.Step>
			<FormProgress.Step>Arbeidsforhold</FormProgress.Step>
			<FormProgress.Step>Tilleggsopplysninger</FormProgress.Step>
			<FormProgress.Step interactive={false}>Oppsummering</FormProgress.Step>
		</FormProgress>
	)
}
```

### With href links (multi-page forms)

```tsx
<FormProgress totalSteps={5} activeStep={3}>
	<FormProgress.Step completed href="/steg/1">
		Dine opplysninger
	</FormProgress.Step>
	<FormProgress.Step completed href="/steg/2">
		Barn
	</FormProgress.Step>
	<FormProgress.Step href="/steg/3">Fastlege</FormProgress.Step>
	<FormProgress.Step href="/steg/4">Tilleggsopplysninger</FormProgress.Step>
	<FormProgress.Step interactive={false}>Oppsummering</FormProgress.Step>
</FormProgress>
```

### With button steps (SPA navigation)

```tsx
<FormProgress
	totalSteps={3}
	activeStep={activeStep}
	onStepChange={setActiveStep}
>
	<FormProgress.Step as="button" completed>
		Personopplysninger
	</FormProgress.Step>
	<FormProgress.Step as="button">Arbeidsforhold</FormProgress.Step>
	<FormProgress.Step as="button" interactive={false}>
		Oppsummering
	</FormProgress.Step>
</FormProgress>
```

### Controlled open state

```tsx
function ControlledFormProgress() {
	const [activeStep, setActiveStep] = useState(2)
	const [isOpen, setIsOpen] = useState(false)

	return (
		<FormProgress
			totalSteps={3}
			activeStep={activeStep}
			onStepChange={setActiveStep}
			open={isOpen}
			onOpenChange={setIsOpen}
		>
			<FormProgress.Step completed>Steg 1</FormProgress.Step>
			<FormProgress.Step>Steg 2</FormProgress.Step>
			<FormProgress.Step interactive={false}>Steg 3</FormProgress.Step>
		</FormProgress>
	)
}
```

### With custom translations

```tsx
<FormProgress
	totalSteps={3}
	activeStep={1}
	translations={{
		step: 'Step',
		showAllSteps: 'Show all steps',
		hideAllSteps: 'Hide all steps',
	}}
>
	<FormProgress.Step>Step 1</FormProgress.Step>
	<FormProgress.Step>Step 2</FormProgress.Step>
	<FormProgress.Step>Step 3</FormProgress.Step>
</FormProgress>
```

### Non-interactive (read-only progress)

```tsx
<FormProgress totalSteps={4} activeStep={2} interactiveSteps={false}>
	<FormProgress.Step completed>Personopplysninger</FormProgress.Step>
	<FormProgress.Step>Arbeidsforhold</FormProgress.Step>
	<FormProgress.Step>Tilleggsopplysninger</FormProgress.Step>
	<FormProgress.Step>Oppsummering</FormProgress.Step>
</FormProgress>
```

## Accessibility

- The progress bar provides a visual indicator of form completion percentage.
- The collapsible stepper list uses appropriate ARIA attributes for expand/collapse state.
- Step indicators use checkmarks for completed steps, providing clear visual feedback.
- Non-interactive steps render as `<div>` instead of `<a>`, preventing keyboard/screen reader users from activating them.
- Use the `translations` prop to localize the "Vis alle steg" / "Skjul alle steg" toggle labels and step counter text.
- `activeStep` is 1-indexed — this aligns with how users think about steps ("Step 1 of 4"), making `aria-label` values intuitive.

## Do's and Don'ts

### ✅ Do

- Use FormProgress for **multi-step forms** where users need to see their position and navigate between steps.
- Mark previous steps as `completed` to give users a clear sense of progress.
- Make the last step a **summary/review page**.
- Use `onStepChange` to handle navigation and validate before allowing step changes.
- Use `interactive={false}` on steps the user hasn't reached yet or shouldn't skip to.
- Use the `translations` prop for English or Nynorsk forms.

### 🚫 Don't

- Don't include **intro pages** or **receipt/confirmation pages** as steps — only include the actual form steps.
- Don't use FormProgress for generic progress indicators — use `ProgressBar` instead.
- Don't set `activeStep` to `0` — the index starts at **1**.
- Don't use FormProgress for non-form flows (e.g., showing process status) — use `Stepper` or `Process` instead.
- Don't forget to set `totalSteps` to match the number of `<FormProgress.Step>` children.
- Don't put interactive elements inside `FormProgress.Step` children — the step itself is the interactive element.

## Common Patterns

### Multi-step wizard with React state

```tsx
function FormWizard() {
	const [activeStep, setActiveStep] = useState(1)
	const totalSteps = 4

	const handleNext = () => setActiveStep((s) => Math.min(s + 1, totalSteps))
	const handlePrevious = () => setActiveStep((s) => Math.max(s - 1, 1))

	return (
		<>
			<FormProgress
				totalSteps={totalSteps}
				activeStep={activeStep}
				onStepChange={setActiveStep}
			>
				<FormProgress.Step completed={activeStep > 1}>
					Personopplysninger
				</FormProgress.Step>
				<FormProgress.Step completed={activeStep > 2}>
					Arbeidsforhold
				</FormProgress.Step>
				<FormProgress.Step completed={activeStep > 3}>
					Tilleggsopplysninger
				</FormProgress.Step>
				<FormProgress.Step interactive={false}>Oppsummering</FormProgress.Step>
			</FormProgress>

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

### With react-intl translations

```tsx
const intl = useIntl()

<FormProgress
  totalSteps={3}
  activeStep={activeStep}
  onStepChange={setActiveStep}
  translations={{
    step: intl.formatMessage({ id: 'formprogress.step' }),
    showAllSteps: intl.formatMessage({ id: 'formprogress.show' }),
    hideAllSteps: intl.formatMessage({ id: 'formprogress.hide' }),
  }}
>
  <FormProgress.Step completed={activeStep > 1}>
    {intl.formatMessage({ id: 'steg.personopplysninger' })}
  </FormProgress.Step>
  <FormProgress.Step completed={activeStep > 2}>
    {intl.formatMessage({ id: 'steg.arbeidsforhold' })}
  </FormProgress.Step>
  <FormProgress.Step interactive={false}>
    {intl.formatMessage({ id: 'steg.oppsummering' })}
  </FormProgress.Step>
</FormProgress>
```
