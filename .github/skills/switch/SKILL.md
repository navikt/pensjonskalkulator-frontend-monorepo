# Switch — `@navikt/ds-react`

A toggle switch component for binary (on/off) settings. Switch provides immediate visual feedback and should be used for settings that take effect immediately without requiring form submission.

## Import

```tsx
import { Switch } from '@navikt/ds-react'
```

## Props

| Prop             | Type                                             | Default    | Description                                                                                               |
| ---------------- | ------------------------------------------------ | ---------- | --------------------------------------------------------------------------------------------------------- |
| `children`       | `ReactNode`                                      | —          | **Required.** Label text for the switch                                                                   |
| `checked`        | `boolean`                                        | —          | Controlled checked state. When provided, component operates in controlled mode                            |
| `defaultChecked` | `boolean`                                        | `false`    | Initial checked state for uncontrolled mode                                                               |
| `onChange`       | `(event: ChangeEvent<HTMLInputElement>) => void` | —          | Callback fired when switch is toggled                                                                     |
| `size`           | `"medium" \| "small"`                            | `"medium"` | Changes font-size, padding, and toggle size                                                               |
| `position`       | `"left" \| "right"`                              | `"left"`   | Positions toggle on left or right side of label                                                           |
| `loading`        | `boolean`                                        | `false`    | Shows a loading spinner inside the toggle. Automatically disables interaction                             |
| `description`    | `string`                                         | —          | Supplementary text displayed below the label                                                              |
| `hideLabel`      | `boolean`                                        | `false`    | Visually hides label and description (still available to screen readers)                                  |
| `disabled`       | `boolean`                                        | `false`    | Disables the switch. **Avoid using if possible** — prefer read-only state or removing the option entirely |
| `readOnly`       | `boolean`                                        | `false`    | Makes the switch read-only (visually indicates state but blocks interaction)                              |
| `id`             | `string`                                         | auto       | Override internal id. Useful for linking with external labels                                             |
| `className`      | `string`                                         | —          | Additional CSS class for the root wrapper                                                                 |
| `ref`            | `Ref<HTMLInputElement>`                          | —          | Ref forwarded to the underlying `<input type="checkbox">`                                                 |

> All standard `InputHTMLAttributes<HTMLInputElement>` props are supported except `size` (overridden by Aksel's `size` prop).

## Usage Examples

### Basic (Uncontrolled)

```tsx
<Switch defaultChecked>Varsle med SMS</Switch>
```

### Controlled

```tsx
function NotificationSettings() {
	const [smsEnabled, setSmsEnabled] = useState(false)

	return (
		<Switch
			checked={smsEnabled}
			onChange={(e) => setSmsEnabled(e.target.checked)}
		>
			Varsle med SMS
		</Switch>
	)
}
```

### With Description

```tsx
<Switch description="Vi sender deg en melding når søknaden er behandlet">
	Varsle med SMS
</Switch>
```

### Small Size

```tsx
<Switch size="small">Kompakt brytervisning</Switch>
```

### Right Position (Toggle on Right)

```tsx
<Switch position="right">Varsle med SMS</Switch>
```

### Loading State

```tsx
function AsyncSwitch() {
	const [loading, setLoading] = useState(false)
	const [checked, setChecked] = useState(false)

	const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
		setLoading(true)
		try {
			await updateNotificationSettings(e.target.checked)
			setChecked(e.target.checked)
		} finally {
			setLoading(false)
		}
	}

	return (
		<Switch checked={checked} onChange={handleChange} loading={loading}>
			Varsle med SMS
		</Switch>
	)
}
```

### Hidden Label (Standalone Toggle)

Use when the switch's purpose is clear from surrounding context. Always provide a label for screen readers:

```tsx
<HStack gap="4" align="center">
	<BodyShort>Varsle med SMS</BodyShort>
	<Switch hideLabel>Varsle med SMS</Switch>
</HStack>
```

### Read-Only State

```tsx
<Switch checked readOnly>
	Varsle med SMS (innstilling styres av administrator)
</Switch>
```

### With react-intl

```tsx
const intl = useIntl()

<Switch
  checked={settings.smsEnabled}
  onChange={(e) => updateSettings({ smsEnabled: e.target.checked })}
  description={intl.formatMessage({ id: 'settings.sms.description' })}
>
  {intl.formatMessage({ id: 'settings.sms.label' })}
</Switch>
```

### Multiple Switches in a Group

```tsx
function NotificationPreferences() {
	const [notifications, setNotifications] = useState({
		sms: false,
		email: true,
		push: false,
	})

	const handleToggle =
		(key: keyof typeof notifications) => (e: ChangeEvent<HTMLInputElement>) => {
			setNotifications((prev) => ({ ...prev, [key]: e.target.checked }))
		}

	return (
		<VStack gap="4">
			<Switch checked={notifications.sms} onChange={handleToggle('sms')}>
				Varsle med SMS
			</Switch>
			<Switch checked={notifications.email} onChange={handleToggle('email')}>
				Varsle med e-post
			</Switch>
			<Switch checked={notifications.push} onChange={handleToggle('push')}>
				Varsle med push-melding
			</Switch>
		</VStack>
	)
}
```

## Accessibility

- Switch renders as an `<input type="checkbox" role="switch">` — screen readers announce it as a switch/toggle.
- The `children` prop provides the accessible label via an associated `<label>`.
- When `hideLabel={true}`, the label is visually hidden but still available to screen readers via `.navds-sr-only`.
- When `loading={true}`, the component is automatically disabled and shows `aria-live="polite"` on the loader.
- When `readOnly={true}`, a read-only icon is shown alongside the label for sighted users, and the toggle blocks interaction.
- Use `description` for supplementary information — it is automatically linked via `aria-describedby`.

## Do's and Don'ts

### ✅ Do

- Use Switch for **settings that take effect immediately** without form submission (e.g., notification preferences, view modes, feature toggles).
- Provide clear, concise labels that describe the **action or state** being toggled (e.g., "Varsle med SMS", not just "SMS").
- Use `loading` state when the toggle triggers an async action (e.g., API call) to provide feedback.
- Use `position="right"` when listing multiple switches in a column to align toggles vertically.
- Use `description` for additional context when the label alone is ambiguous.
- Provide immediate feedback or confirmation when a switch changes system state (e.g., toast notification, updated UI).

### 🚫 Don't

- Don't use Switch in forms that require submission — use `Checkbox` instead.
- Don't use Switch for **navigation** or **mode switching** — use `Tabs` or `ToggleGroup` instead.
- Don't use Switch for **multi-step actions** (e.g., "Delete account") — use a `Button` with confirmation dialog.
- Don't disable switches to hide options — **remove the switch entirely** or use read-only state with an explanation.
- Don't put multiple unrelated switches in a horizontal row — stack them vertically with `VStack`.
- Don't rely solely on color to indicate state — the toggle position and checkmark provide non-color cues.
- Don't use Switch for **selections that require explicit form submission** — use `Checkbox` or `RadioGroup`.

## Switch vs Other Components

| Component     | Use When                                                               |
| ------------- | ---------------------------------------------------------------------- |
| `Switch`      | Settings that take effect **immediately** (e.g., notifications on/off) |
| `Checkbox`    | Selections in a **form** that require submission                       |
| `ToggleGroup` | Switching between **views or modes** (e.g., Enkel/Avansert)            |
| `Tabs`        | Switching between **different content sections**                       |
| `RadioGroup`  | Selecting **one option** from multiple mutually exclusive choices      |

## Common Patterns

### Immediate Setting Toggle

```tsx
function DarkModeToggle() {
	const [darkMode, setDarkMode] = useState(false)

	const handleToggle = (e: ChangeEvent<HTMLInputElement>) => {
		const enabled = e.target.checked
		setDarkMode(enabled)
		document.body.classList.toggle('dark-mode', enabled)
	}

	return (
		<Switch checked={darkMode} onChange={handleToggle}>
			Mørk modus
		</Switch>
	)
}
```

### Async Toggle with Error Handling

```tsx
function NotificationSwitch() {
	const [checked, setChecked] = useState(false)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string>()

	const handleToggle = async (e: ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.checked
		setLoading(true)
		setError(undefined)

		try {
			await updateUserPreference('notifications', newValue)
			setChecked(newValue)
		} catch (err) {
			setError('Kunne ikke oppdatere innstilling')
			// Revert to previous state
		} finally {
			setLoading(false)
		}
	}

	return (
		<VStack gap="2">
			<Switch
				checked={checked}
				onChange={handleToggle}
				loading={loading}
				description="Vi sender deg en e-post når søknaden er behandlet"
			>
				Varsle med e-post
			</Switch>
			{error && (
				<Alert variant="error" size="small">
					{error}
				</Alert>
			)}
		</VStack>
	)
}
```

### Settings List with Right-Aligned Toggles

```tsx
function SettingsList() {
	const [settings, setSettings] = useState({
		notifications: true,
		analytics: false,
		newsletter: false,
	})

	const handleToggle =
		(key: keyof typeof settings) => (e: ChangeEvent<HTMLInputElement>) => {
			setSettings((prev) => ({ ...prev, [key]: e.target.checked }))
		}

	return (
		<VStack gap="4">
			<Switch
				checked={settings.notifications}
				onChange={handleToggle('notifications')}
				position="right"
				description="Få varsler om viktige oppdateringer"
			>
				Varslinger
			</Switch>
			<Switch
				checked={settings.analytics}
				onChange={handleToggle('analytics')}
				position="right"
				description="Hjelp oss forbedre tjenesten"
			>
				Analyseinformasjon
			</Switch>
			<Switch
				checked={settings.newsletter}
				onChange={handleToggle('newsletter')}
				position="right"
				description="Motta månedlige nyheter"
			>
				Nyhetsbrev
			</Switch>
		</VStack>
	)
}
```

## Styling

Switch uses standard Aksel design tokens and cannot be customized beyond the `size`, `position`, and `className` props. To style the wrapper:

```scss
.customSwitch {
	margin-bottom: var(--a-spacing-4);
}
```

```tsx
<Switch className={styles.customSwitch}>Label</Switch>
```

## Integration with Forms

While Switch can be used in forms, it's primarily designed for settings that take effect immediately. If you need form validation or submission handling, consider using `Checkbox` instead:

```tsx
// ❌ Avoid this pattern (Switch in a form that requires submission)
<form onSubmit={handleSubmit}>
  <Switch checked={agreed} onChange={e => setAgreed(e.target.checked)}>
    I agree to terms
  </Switch>
  <Button type="submit">Submit</Button>
</form>

// ✅ Use Checkbox for form submissions
<form onSubmit={handleSubmit}>
  <Checkbox checked={agreed} onChange={e => setAgreed(e.target.checked)}>
    I agree to terms
  </Checkbox>
  <Button type="submit">Submit</Button>
</form>

// ✅ Or use Switch for immediate effect (no form submission)
<Switch checked={notifications} onChange={e => updateNotifications(e.target.checked)}>
  Enable notifications
</Switch>
```

## Technical Notes

- Switch internally uses `<input type="checkbox">` but with proper ARIA attributes to announce as a switch.
- The component supports both **controlled** (via `checked` + `onChange`) and **uncontrolled** (via `defaultChecked`) modes.
- When `loading={true}`, the component is automatically disabled to prevent interaction during async operations.
- The `position` prop only affects visual layout — it doesn't change the underlying DOM order or accessibility tree.
- Setting `readOnly={true}` adds a read-only icon and prevents interaction, but the toggle visually reflects the current state.

## Browser Support

Switch is supported in all modern browsers. The component uses CSS custom properties and modern JavaScript features that are polyfilled by the build process.

## See Also

- [Checkbox](/komponenter/core/checkbox) — for form selections that require submission
- [ToggleGroup](/komponenter/core/togglegroup) — for switching between views or modes
- [RadioGroup](/komponenter/core/radiogroup) — for mutually exclusive single selections
- [Button](/komponenter/core/button) — for actions that require explicit confirmation
