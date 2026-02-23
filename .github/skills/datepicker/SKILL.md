# DatePicker — Aksel Design System

> **Package:** `@navikt/ds-react`
> **Documentation:** https://aksel.nav.no/komponenter/core/datepicker

DatePicker lets the user pick dates or date ranges. It can be tied to an input field or embedded directly on the page (standalone). Internally uses [react-day-picker](https://daypicker.dev/) and [date-fns](https://date-fns.org/) v4 for date parsing.

---

## Import

```tsx
import { DatePicker, useDatepicker, useRangeDatepicker } from '@navikt/ds-react'
```

## Sub-components & Hooks

| Export                  | Description                                                                        |
| ----------------------- | ---------------------------------------------------------------------------------- |
| `DatePicker`            | Popover wrapper — renders the calendar panel                                       |
| `DatePicker.Input`      | Built-in input field with calendar toggle button                                   |
| `DatePicker.Standalone` | Inline calendar (no popover, no input) — embed directly on page                    |
| `useDatepicker`         | Hook for single-date selection; returns `datepickerProps` + `inputProps` + helpers |
| `useRangeDatepicker`    | Hook for range (from–to) selection; returns props for two inputs                   |

---

## Key Props

### DatePicker (popover)

| Prop              | Type                                | Default       | Description                                                        |
| ----------------- | ----------------------------------- | ------------- | ------------------------------------------------------------------ |
| `mode`            | `"single" \| "multiple" \| "range"` | —             | Selection mode                                                     |
| `selected`        | `Date \| Date[] \| DateRange`       | —             | Controlled selected value                                          |
| `defaultSelected` | `Date \| Date[] \| DateRange`       | —             | Uncontrolled initial value                                         |
| `onSelect`        | `(val) => void`                     | —             | Callback when selection changes                                    |
| `fromDate`        | `Date`                              | —             | Earliest navigable/selectable date                                 |
| `toDate`          | `Date`                              | —             | Latest navigable/selectable date                                   |
| `disabled`        | `Matcher[]`                         | —             | Dates to disable (day-picker Matcher syntax)                       |
| `disableWeekends` | `boolean`                           | `false`       | Disable Saturdays and Sundays                                      |
| `dropdownCaption` | `boolean`                           | `false`       | Show month/year dropdowns. **Requires** `fromDate` + `toDate`.     |
| `defaultMonth`    | `Date`                              | current month | Initial visible month                                              |
| `showWeekNumber`  | `boolean`                           | `false`       | Show week numbers in left column                                   |
| `fixedWeeks`      | `boolean`                           | `false`       | Always render 6 weeks                                              |
| `open`            | `boolean`                           | —             | Controlled open state                                              |
| `onClose`         | `() => void`                        | —             | Close callback (controlled)                                        |
| `strategy`        | `"absolute" \| "fixed"`             | (see Popover) | CSS position strategy — avoid unless parent is `position:relative` |
| `min`             | `number`                            | —             | Minimum number of selected dates (mode `"multiple"`)               |
| `max`             | `number`                            | —             | Maximum number of selected dates (mode `"multiple"`)               |
| `translations`    | `RecursivePartial<{...}>`           | —             | i18n overrides. Prefer `<Provider>` for language changes.          |

### DatePicker.Input

| Prop          | Type                  | Default      | Description                              |
| ------------- | --------------------- | ------------ | ---------------------------------------- |
| `label`       | `ReactNode`           | **required** | Input label                              |
| `description` | `ReactNode`           | —            | Extra labelling text                     |
| `hideLabel`   | `boolean`             | `false`      | Visually hide label (still in a11y tree) |
| `size`        | `"medium" \| "small"` | `"medium"`   | Size variant                             |
| `error`       | `ReactNode`           | —            | Error message                            |
| `disabled`    | `boolean`             | —            | Disable the input                        |
| `readOnly`    | `boolean`             | —            | Read-only state                          |

### useDatepicker options

| Option              | Type                             | Default        | Description                          |
| ------------------- | -------------------------------- | -------------- | ------------------------------------ |
| `fromDate`          | `Date`                           | —              | Earliest selectable date             |
| `toDate`            | `Date`                           | —              | Latest selectable date               |
| `defaultSelected`   | `Date`                           | —              | Initial date                         |
| `defaultMonth`      | `Date`                           | —              | Initial visible month                |
| `required`          | `boolean`                        | —              | Make selection required              |
| `onDateChange`      | `(val?: Date) => void`           | —              | Called when date changes             |
| `onValidate`        | `(val: DateValidationT) => void` | —              | Validation callback                  |
| `inputFormat`       | `string`                         | `"dd.MM.yyyy"` | date-fns format string for the input |
| `allowTwoDigitYear` | `boolean`                        | `true`         | Accept `yy` year input               |
| `disabled`          | `Matcher[]`                      | —              | Dates to disable                     |
| `disableWeekends`   | `boolean`                        | `false`        | Disable weekends                     |

**Return value:**

```ts
const { datepickerProps, inputProps, selectedDay, setSelected, reset } =
	useDatepicker(options)
```

### useRangeDatepicker options

| Option              | Type                              | Default        | Description                     |
| ------------------- | --------------------------------- | -------------- | ------------------------------- |
| `fromDate`          | `Date`                            | —              | Earliest selectable date        |
| `toDate`            | `Date`                            | —              | Latest selectable date          |
| `defaultSelected`   | `DateRange`                       | —              | Initial range `{ from, to }`    |
| `defaultMonth`      | `Date`                            | —              | Initial visible month           |
| `required`          | `boolean`                         | —              | Make selection required         |
| `onRangeChange`     | `(val?: DateRange) => void`       | —              | Called when range changes       |
| `onValidate`        | `(val: RangeValidationT) => void` | —              | Validation callback             |
| `inputFormat`       | `string`                          | `"dd.MM.yyyy"` | date-fns format for both inputs |
| `allowTwoDigitYear` | `boolean`                         | `true`         | Accept `yy` year input          |
| `disabled`          | `Matcher[]`                       | —              | Dates to disable                |
| `disableWeekends`   | `boolean`                         | `false`        | Disable weekends                |

**Return value:**

```ts
const {
	datepickerProps,
	fromInputProps,
	toInputProps,
	selectedRange,
	setSelected,
	reset,
} = useRangeDatepicker(options)
```

---

## Usage Examples

### Basic single date with useDatepicker

```tsx
import { DatePicker, useDatepicker } from '@navikt/ds-react'

function MyDateField() {
	const { datepickerProps, inputProps } = useDatepicker({
		onDateChange: (date) => console.log(date),
	})

	return (
		<DatePicker {...datepickerProps}>
			<DatePicker.Input {...inputProps} label="Velg dato" />
		</DatePicker>
	)
}
```

### With min/max dates and dropdown caption

```tsx
import { DatePicker, useDatepicker } from '@navikt/ds-react'

function BoundedDateField() {
	const { datepickerProps, inputProps } = useDatepicker({
		fromDate: new Date('2020-01-01'),
		toDate: new Date('2030-12-31'),
		onDateChange: (date) => console.log(date),
	})

	return (
		<DatePicker {...datepickerProps} dropdownCaption>
			<DatePicker.Input {...inputProps} label="Velg dato" />
		</DatePicker>
	)
}
```

### With disabled dates

```tsx
import { DatePicker, useDatepicker } from '@navikt/ds-react'

function NoWeekendsDateField() {
	const { datepickerProps, inputProps } = useDatepicker({
		fromDate: new Date('2024-01-01'),
		toDate: new Date('2024-12-31'),
		disableWeekends: true,
		disabled: [
			new Date('2024-05-17'), // Specific date
			{ dayOfWeek: [0] }, // All Sundays (Matcher syntax)
			{ from: new Date('2024-07-01'), to: new Date('2024-07-31') }, // Date range
		],
		onDateChange: (date) => console.log(date),
	})

	return (
		<DatePicker {...datepickerProps}>
			<DatePicker.Input {...inputProps} label="Velg arbeidsdag" />
		</DatePicker>
	)
}
```

### Range picker (from–to)

```tsx
import { DatePicker, useRangeDatepicker } from '@navikt/ds-react'

function MyRangePicker() {
	const { datepickerProps, fromInputProps, toInputProps } = useRangeDatepicker({
		fromDate: new Date('2024-01-01'),
		toDate: new Date('2025-12-31'),
		onRangeChange: (range) => console.log(range),
	})

	return (
		<DatePicker {...datepickerProps}>
			<DatePicker.Input {...fromInputProps} label="Fra dato" />
			<DatePicker.Input {...toInputProps} label="Til dato" />
		</DatePicker>
	)
}
```

### Standalone (inline, no popover)

```tsx
import { DatePicker } from '@navikt/ds-react'

function InlineCalendar() {
	return (
		<DatePicker.Standalone
			mode="single"
			onSelect={(date) => console.log(date)}
			fromDate={new Date('2024-01-01')}
			toDate={new Date('2024-12-31')}
		/>
	)
}
```

### With validation and error display

```tsx
import { useState } from 'react'

import { DatePicker, useDatepicker } from '@navikt/ds-react'

function ValidatedDateField() {
	const [error, setError] = useState<string>('')

	const { datepickerProps, inputProps } = useDatepicker({
		required: true,
		fromDate: new Date('2024-01-01'),
		toDate: new Date('2024-12-31'),
		onDateChange: (date) => {
			setError('')
			console.log(date)
		},
		onValidate: (validation) => {
			if (validation.isBefore) setError('Datoen er før tidligste dato')
			else if (validation.isAfter) setError('Datoen er etter seneste dato')
			else if (validation.isInvalid) setError('Ugyldig dato')
			else setError('')
		},
	})

	return (
		<DatePicker {...datepickerProps}>
			<DatePicker.Input {...inputProps} label="Velg dato" error={error} />
		</DatePicker>
	)
}
```

### Real-world pattern from this project

This project spreads hook return values onto DatePicker and DatePicker.Input. See `UtenlandsoppholdModal` for a production example:

```tsx
const datepicker = useDatepicker({
	fromDate: minDate,
	toDate: maxDate,
	defaultSelected: existingDate,
	onDateChange: (value) => {
		setState((prev) => ({
			...prev,
			dato: value ? format(value, 'dd.MM.yyyy') : undefined,
		}))
	},
	onValidate: () => {
		clearValidationError('dato')
	},
})

// In JSX:
;<DatePicker {...datepicker.datepickerProps} dropdownCaption>
	<DatePicker.Input
		{...datepicker.inputProps}
		label="Startdato"
		description="dd.mm.åååå"
		error={
			validationErrors.dato
				? intl.formatMessage({ id: validationErrors.dato })
				: ''
		}
	/>
</DatePicker>
```

---

## Accessibility

- **Always use `DatePicker.Input`** with `useDatepicker` or `useRangeDatepicker` — focus management and open/close behavior are handled automatically.
- The `label` prop on `DatePicker.Input` is **required**. Use `hideLabel` only when the label is visually redundant (e.g., in a table cell), not to skip labelling.
- The calendar is keyboard-navigable: arrow keys move between days, Enter selects, Escape closes.
- For locale/language, wrap the app with `<Provider>` instead of using the deprecated `locale` prop.
- Set `TZ=UTC` in your test environment (e.g., Vitest) to get consistent date behavior.

---

## Do's and Don'ts

### ✅ Do

- Use `useDatepicker` / `useRangeDatepicker` hooks — they handle parsing, validation, focus, and open/close state.
- Use `dropdownCaption` with `fromDate` + `toDate` when the user needs to navigate far from the current month.
- Use `defaultMonth` to open the calendar on the most relevant month.
- Set `fromDate` and `toDate` to constrain the navigable date range.
- Use `onValidate` to capture validation state (`isBefore`, `isAfter`, `isInvalid`, `isEmpty`) and show error messages.
- Return dates as JS `Date` objects and convert to strings only at the boundary (API calls, display).
- Use `format` from `date-fns` for formatting; the component uses date-fns v4 internally.
- Use `setSelected(undefined)` to programmatically clear the selection.

### 🚫 Don't

- Don't use DatePicker for well-known dates like birthdays — a simple `TextField` is better.
- Don't use DatePicker for dates very far in the past/future — the calendar navigation is cumbersome. Consider a plain text input instead.
- Don't set the `locale` prop directly — use `<Provider>` at app level.
- Don't use `strategy="fixed"` unless you have a specific overflow/positioning issue.
- Don't use `showWeekNumber` on small screens — it consumes too much horizontal space.
- Don't use `disabled` on `DatePicker.Input` unless absolutely necessary (accessibility concern).
- Don't forget to handle timezones when converting `Date` objects to ISO strings.

---

## Common Patterns & Tips

1. **Spread pattern:** `useDatepicker` returns `{ datepickerProps, inputProps, ... }`. Spread `datepickerProps` onto `<DatePicker>` and `inputProps` onto `<DatePicker.Input>`.
2. **Multiple date pickers:** Call `useDatepicker` once per field. Each hook instance is independent.
3. **Clearing dates programmatically:** Call `setSelected(undefined)` from the hook return value.
4. **Dependent date pickers (start/end):** Use the selected start date as the `fromDate` for the end date picker.
5. **Formatting:** The default input format is `"dd.MM.yyyy"` (Norwegian style). Override with `inputFormat` if needed.
6. **Testing dates:** Set `TZ=UTC` environment variable for consistent test results across environments.
7. **DateRange type:** `{ from: Date; to: Date }` — used by `useRangeDatepicker` and `mode="range"`.
