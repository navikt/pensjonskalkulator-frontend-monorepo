# ProgressBar — `@navikt/ds-react`

ProgressBar shows the progress of a process. Use it for step indicators or time-consuming operations with an expected duration.

## Import

```tsx
import { ProgressBar } from '@navikt/ds-react'
```

## Props

| Prop              | Type                                                                                                                                                        | Default    | Description                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------- |
| `value`           | `number`                                                                                                                                                    | `0`        | Current progress. If `simulated` is set, it overrides `value`                                   |
| `valueMax`        | `number`                                                                                                                                                    | `100`      | Maximum progress value                                                                          |
| `size`            | `"large" \| "medium" \| "small"`                                                                                                                            | `"medium"` | Changes bar height                                                                              |
| `simulated`       | `{ seconds: number; onTimeout: () => void }`                                                                                                                | —          | Visually simulates loading with a preset animation. Shows indeterminate animation after timeout |
| `aria-label`      | `string`                                                                                                                                                    | —          | Accessible name for the progress bar. **Required** unless `aria-labelledby` is used             |
| `aria-labelledby` | `string`                                                                                                                                                    | —          | ID of the element labeling the bar. **Required** unless `aria-label` is used                    |
| `data-color`      | `"accent" \| "neutral" \| "info" \| "success" \| "warning" \| "danger" \| "meta-purple" \| "meta-lime" \| "brand-beige" \| "brand-blue" \| "brand-magenta"` | —          | Override bar color                                                                              |
| `className`       | `string`                                                                                                                                                    | —          | Additional CSS class                                                                            |
| `ref`             | `Ref<HTMLDivElement>`                                                                                                                                       | —          | Ref to root element                                                                             |

## Usage Examples

### Determinate progress (manual control)

```tsx
<ProgressBar value={6} valueMax={12} aria-label="Fremdrift" />
```

### With external label via aria-labelledby

```tsx
<p id="progress-label">Laster innhold</p>
<ProgressBar value={40} valueMax={100} aria-labelledby="progress-label" />
```

### Different sizes

```tsx
<VStack gap="space-16">
	<ProgressBar
		value={3}
		valueMax={12}
		size="small"
		aria-label="Fremdrift liten"
	/>
	<ProgressBar
		value={6}
		valueMax={12}
		size="medium"
		aria-label="Fremdrift medium"
	/>
	<ProgressBar
		value={11}
		valueMax={12}
		size="large"
		aria-label="Fremdrift stor"
	/>
</VStack>
```

### Simulated progress (automatic animation with timeout)

```tsx
function LoadingContent() {
	const [timedOut, setTimedOut] = useState(false)

	return (
		<VStack gap="space-8">
			<ProgressBar
				simulated={{ seconds: 10, onTimeout: () => setTimedOut(true) }}
				aria-label="Laster innhold"
			/>
			{timedOut && <BodyShort>Dette tar lenger tid enn forventet.</BodyShort>}
		</VStack>
	)
}
```

### Indeterminate progress (value omitted)

When `value` is `0` (default) and no `simulated` prop is set, the bar renders at its starting position. Use `simulated` for an indeterminate animation.

```tsx
<ProgressBar
	simulated={{ seconds: 30, onTimeout: handleTimeout }}
	aria-label="Laster data"
/>
```

### With color override

```tsx
<ProgressBar
	value={75}
	valueMax={100}
	data-color="success"
	aria-label="Opplasting fullført"
/>
```

### Step indicator pattern

```tsx
function StepProgress({
	currentStep,
	totalSteps,
}: {
	currentStep: number
	totalSteps: number
}) {
	return (
		<VStack gap="space-4">
			<BodyShort>
				Steg {currentStep} av {totalSteps}
			</BodyShort>
			<ProgressBar
				value={currentStep}
				valueMax={totalSteps}
				aria-label={`Steg ${currentStep} av ${totalSteps}`}
			/>
		</VStack>
	)
}
```

## Accessibility

- You **must** provide either `aria-label` or `aria-labelledby`. The component requires an accessible name.
- When using `simulated` progress, the accessible text remains static (it does not update as the visual animation progresses).
- For multi-step processes, include visible text describing the current step alongside the bar.
- When the bar enters an indeterminate state, provide a visible explanation (e.g., "Dette tar lenger tid enn forventet").

## Do's and Don'ts

### ✅ Do

- Use ProgressBar for **loading indicators** or **step progress** where you can convey how far along a process is.
- Always provide a visible label or contextual text alongside the bar.
- Use `simulated` for async operations where you can estimate duration but don't have exact progress.
- Handle the `onTimeout` callback in `simulated` to inform users when loading takes longer than expected.
- Use `size="small"` for inline or compact layouts.

### 🚫 Don't

- Don't use ProgressBar for **multi-step form navigation** — use `FormProgress` instead.
- Don't omit `aria-label` / `aria-labelledby` — the component will not be accessible.
- Don't use ProgressBar without visible context — users need text to understand what is loading.
- Don't rely solely on color (`data-color`) to convey meaning — always pair with text.
- Don't set `value` greater than `valueMax`.

## Common Patterns

### Loading with react-intl

```tsx
const intl = useIntl()

<ProgressBar
  simulated={{ seconds: 15, onTimeout: () => setTimedOut(true) }}
  aria-label={intl.formatMessage({ id: 'loading.progress.label' })}
/>
```

### Controlled progress with API state

```tsx
function UploadProgress({ progress }: { progress: number }) {
	const intl = useIntl()

	return (
		<VStack gap="space-4">
			<BodyShort>
				{intl.formatMessage({ id: 'upload.progress' }, { percent: progress })}
			</BodyShort>
			<ProgressBar
				value={progress}
				valueMax={100}
				aria-label={intl.formatMessage({ id: 'upload.progress.label' })}
			/>
		</VStack>
	)
}
```

## Related Components

- **`FormProgress`** — For multi-step form navigation with a stepper. Prefer this over ProgressBar in form flows.
- **`Loader`** — Spinning indicator for indeterminate loading without progress information.
