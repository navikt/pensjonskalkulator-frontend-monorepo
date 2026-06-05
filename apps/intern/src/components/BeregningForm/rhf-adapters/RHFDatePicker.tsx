import { type FocusEvent, useEffect, useRef } from 'react'
import { type FieldPath, useController, useFormContext } from 'react-hook-form'

import { DatePicker, useDatepicker } from '@navikt/ds-react'

import type { BeregningFormData } from '../../../api/beregningTypes'
import { formatEndUserDate, parseStrictEndUserDate } from '../../../utils/dates'
import { getNestedError } from './utils'

interface RHFDatePickerProps {
	name: FieldPath<BeregningFormData>
	label: string
	className?: string
	fromDate?: Date
	toDate?: Date
	disabled?: NonNullable<Parameters<typeof useDatepicker>[0]>['disabled']
}

export function RHFDatePicker({
	name,
	label,
	className,
	fromDate,
	toDate,
	disabled,
}: RHFDatePickerProps) {
	const {
		control,
		formState: { errors },
	} = useFormContext<BeregningFormData>()
	const { field } = useController({ name, control })
	const lastKnownValueRef = useRef(field.value)

	const { datepickerProps, inputProps, setSelected } = useDatepicker({
		defaultSelected: parseStrictEndUserDate(field.value),
		onDateChange: (date) => {
			const formatted = date ? formatEndUserDate(date) : ''
			lastKnownValueRef.current = formatted
			if (date) {
				field.onChange(formatted)
			}
		},
		allowTwoDigitYear: false,
		fromDate,
		toDate,
		disabled,
	})

	useEffect(() => {
		if (lastKnownValueRef.current === field.value) return
		lastKnownValueRef.current = field.value

		const selectedDate = parseStrictEndUserDate(field.value)
		if (field.value === '' || selectedDate) {
			setSelected(selectedDate)
		}
	}, [field.value, setSelected])

	const errorMessage = getNestedError(errors, name)

	return (
		<DatePicker {...datepickerProps} dropdownCaption>
			<DatePicker.Input
				{...inputProps}
				onBlur={(event: FocusEvent<HTMLInputElement>) => {
					const rawInput = event.target.value
					// inputProps.onBlur triggers Aksel's internal date parsing, which
					// calls onDateChange and updates lastKnownValueRef with the formatted value.
					// Use the formatted value if available, else preserve the raw input
					const value = lastKnownValueRef.current || rawInput
					field.onChange(value)
					field.onBlur()
				}}
				label={label}
				size="small"
				className={className}
				error={errorMessage}
			/>
		</DatePicker>
	)
}
