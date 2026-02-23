# MonthPicker — Aksel Design System

**Package:** `@navikt/ds-react`
**Documentation:** https://aksel.nav.no/komponenter/core/monthpicker

MonthPicker lets users select a specific month. It can be attached to an input field or embedded standalone on the page. Returns a JavaScript `Date` object. Uses `date-fns` v4 internally for date parsing.

---

## Import

```tsx
import { MonthPicker, useMonthpicker } from '@navikt/ds-react'
```

## Sub-components & Hook

| Export                   | Description                                                                      |
| ------------------------ | -------------------------------------------------------------------------------- |
| `MonthPicker`            | Root popover component. Wraps an anchor element (typically `MonthPicker.Input`). |
| `MonthPicker.Input`      | Built-in input field with toggle button for the picker popover.                  |
| `MonthPicker.Standalone` | Inline month picker without popover — renders directly in the page.              |
| `useMonthpicker`         | Hook that manages state, props wiring, validation, and focus automatically.      |

---

## Key Props

### MonthPicker (root)

| Prop               | Type                     | Default      | Description                                                             |
| ------------------ | ------------------------ | ------------ | ----------------------------------------------------------------------- |
| `children`         | `ReactNode`              | —            | Anchor element. Use `<MonthPicker.Input />` or a custom trigger.        |
| `fromDate`         | `Date`                   | —            | Earliest selectable month.                                              |
| `toDate`           | `Date`                   | —            | Latest selectable month.                                                |
| `dropdownCaption`  | `boolean`                | `false`      | Year dropdown for long ranges. **Requires** `fromDate` and `toDate`.    |
| `disabled`         | `Matcher[]`              | `[]`         | Array of matchers to disable specific months.                           |
| `selected`         | `Date`                   | —            | Controlled selected month.                                              |
| `defaultSelected`  | `Date`                   | —            | Uncontrolled default selected month.                                    |
| `open`             | `boolean`                | —            | Controlled open state.                                                  |
| `onClose`          | `() => void`             | —            | Called when popover closes.                                             |
| `onOpenToggle`     | `() => void`             | —            | Called when toggled via `MonthPicker.Input`.                            |
| `onMonthSelect`    | `(month?: Date) => void` | —            | Called when a month is selected.                                        |
| `year`             | `Date`                   | —            | Controlled visible year.                                                |
| `onYearChange`     | `(y?: Date) => void`     | —            | Called when user navigates between years.                               |
| `strategy`         | `"absolute" \| "fixed"`  | `"absolute"` | CSS position strategy. Use `"fixed"` to escape relative parents.        |
| `translations`     | `ComponentTranslation`   | —            | i18n text overrides. **Use `<Provider>` for language changes instead.** |
| `className`        | `string`                 | —            | Class for the popover.                                                  |
| `wrapperClassName` | `string`                 | —            | Class for the outer wrapper.                                            |

### MonthPicker.Input

| Prop          | Type                  | Default      | Description                                     |
| ------------- | --------------------- | ------------ | ----------------------------------------------- |
| `label`       | `ReactNode`           | **required** | Input label.                                    |
| `hideLabel`   | `boolean`             | `false`      | Visually hides label (still available to SR).   |
| `size`        | `"medium" \| "small"` | `"medium"`   | Size variant.                                   |
| `error`       | `ReactNode`           | —            | Error message shown below input.                |
| `description` | `ReactNode`           | —            | Helper text below the label.                    |
| `disabled`    | `boolean`             | —            | Disables the input. **Avoid for a11y reasons.** |
| `readOnly`    | `boolean`             | —            | Read-only state.                                |
| `required`    | `boolean`             | —            | Marks selection as required.                    |

### MonthPicker.Standalone

Same as root `MonthPicker` props, except **without** `open`, `onClose`, `onOpenToggle`, `wrapperClassName`, `strategy`.

### useMonthpicker Hook

```ts
const {
	monthpickerProps, // spread on <MonthPicker>
	inputProps, // spread on <MonthPicker.Input>
	selectedMonth, // currently selected Date | undefined
	setSelected, // manually set selected month
	reset, // reset all state
} = useMonthpicker(options)
```

**Options (`UseMonthPickerOptions`):**

| Option              | Type                              | Default       | Description                                   |
| ------------------- | --------------------------------- | ------------- | --------------------------------------------- |
| `fromDate`          | `Date`                            | —             | Earliest month.                               |
| `toDate`            | `Date`                            | —             | Latest month.                                 |
| `defaultSelected`   | `Date`                            | —             | Initially selected month.                     |
| `disabled`          | `Matcher[]`                       | —             | Disabled month matchers.                      |
| `required`          | `boolean`                         | —             | Selection required.                           |
| `onMonthChange`     | `(date?: Date) => void`           | —             | Called on month change.                       |
| `onValidate`        | `(val: MonthValidationT) => void` | —             | Called with validation state on input change. |
| `inputFormat`       | `string`                          | `"MMMM yyyy"` | Display format for the input.                 |
| `defaultYear`       | `Date`                            | —             | Initially visible year.                       |
| `allowTwoDigitYear` | `boolean`                         | `true`        | Allow `yy` year input (1944–2043 window).     |

**Validation type (`MonthValidationT`):**

```ts
type MonthValidationT = {
	isDisabled: boolean
	isEmpty: boolean
	isInvalid: boolean
	isValidMonth: boolean
	isBefore: boolean // before fromDate
	isAfter: boolean // after toDate
}
```

---

## Usage Examples

### Basic with hook (recommended)

```tsx
import { MonthPicker, useMonthpicker } from '@navikt/ds-react'

function VelgMåned() {
	const { monthpickerProps, inputProps, selectedMonth } = useMonthpicker({
		onMonthChange: (date) => console.log(date),
	})

	return (
		<MonthPicker {...monthpickerProps}>
			<MonthPicker.Input {...inputProps} label="Velg måned" />
		</MonthPicker>
	)
}
```

### With fromDate/toDate and dropdown caption

```tsx
const { monthpickerProps, inputProps } = useMonthpicker({
	fromDate: new Date('Jan 1 2020'),
	toDate: new Date('Dec 31 2030'),
	onMonthChange: handleMonthChange,
})

;<MonthPicker {...monthpickerProps} dropdownCaption>
	<MonthPicker.Input {...inputProps} label="Startmåned" />
</MonthPicker>
```

### Standalone (inline, no popover)

```tsx
<MonthPicker.Standalone
	fromDate={new Date('Jan 1 2022')}
	toDate={new Date('Dec 31 2026')}
	dropdownCaption
	onMonthSelect={(month) => console.log(month)}
/>
```

### With disabled months

```tsx
const { monthpickerProps, inputProps } = useMonthpicker({
	fromDate: new Date('Jan 1 2024'),
	toDate: new Date('Dec 31 2025'),
	disabled: [
		new Date('Jun 1 2024'), // disable single month
		{ from: new Date('Jan 1 2025'), to: new Date('Mar 31 2025') }, // disable range
	],
})

;<MonthPicker {...monthpickerProps}>
	<MonthPicker.Input {...inputProps} label="Tilgjengelig måned" />
</MonthPicker>
```

### With validation

```tsx
const [error, setError] = useState<string>()

const { monthpickerProps, inputProps } = useMonthpicker({
	required: true,
	fromDate: new Date('Jan 1 2024'),
	toDate: new Date('Dec 31 2025'),
	onValidate: (val) => {
		if (val.isEmpty) setError('Du må velge en måned')
		else if (val.isBefore) setError('Måned er for tidlig')
		else if (val.isAfter) setError('Måned er for sent')
		else if (val.isInvalid) setError('Ugyldig måned')
		else setError(undefined)
	},
})

;<MonthPicker {...monthpickerProps}>
	<MonthPicker.Input {...inputProps} label="Måned" error={error} />
</MonthPicker>
```

---

## Accessibility

- **Always use `<MonthPicker.Input>` with `useMonthpicker`** for popover-based pickers. The hook manages focus trapping, keyboard navigation, and open/close state automatically.
- Always provide a visible `label` on `MonthPicker.Input`. Use `hideLabel` only when the context makes the purpose obvious (e.g., a filter row with a visible heading).
- Avoid `disabled` on the input — use `readOnly` or explain constraints via `description` instead.
- Keyboard navigation: Arrow keys navigate months, Escape closes the popover.
- For language/locale, use the `<Provider>` component (not the deprecated `locale` prop).

---

## Testing

Set the timezone explicitly in your test runner to avoid flaky date tests:

```bash
# Vitest
TZ=UTC vitest
```

Or in `vite.config.ts`:

```ts
export default defineConfig({
	test: {
		env: { TZ: 'UTC' },
	},
})
```

---

## Do's and Don'ts

### ✅ Do

- Use `useMonthpicker` hook — it handles state, focus, and a11y automatically.
- Use `dropdownCaption` with `fromDate`/`toDate` for date ranges spanning many years.
- Use `defaultYear` when you have a reasonable assumption about which year the user needs.
- Handle timezones when converting the returned `Date` to ISO/string format.
- Use `onValidate` to provide user-friendly error messages.
- Use `<Provider>` for i18n/locale changes.

### ❌ Don't

- Don't manage open/close state manually unless you have a custom trigger (use the hook instead).
- Don't use the deprecated `locale` prop — use `<Provider>`.
- Don't forget `fromDate`/`toDate` when using `dropdownCaption` (it won't work without them).
- Don't use `strategy="fixed"` unless the popover is clipped by a relative parent.
- Don't disable the input element for accessibility reasons — prefer `readOnly` or constraints via `fromDate`/`toDate`.

---

## Common Patterns

### Extracting month/year from selection

```tsx
const { selectedMonth } = useMonthpicker({ onMonthChange: handleChange })

// selectedMonth is a Date — first day of the selected month
const month = selectedMonth?.getMonth() // 0-indexed
const year = selectedMonth?.getFullYear()
```

### Pre-selecting a month

```tsx
useMonthpicker({
	defaultSelected: new Date('Jun 1 2024'),
})
```

### Resetting the picker

```tsx
const { reset } = useMonthpicker({ ... });

<Button variant="tertiary" onClick={reset}>Nullstill</Button>
```
