import { type ChangeEvent, type FocusEvent, useEffect, useRef } from 'react'
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
	const previousFieldValueRef = useRef(field.value)

	const { datepickerProps, inputProps, setSelected } = useDatepicker({
		defaultSelected: parseStrictEndUserDate(field.value),
		onDateChange: (date) => {
			field.onChange(date ? formatEndUserDate(date) : '')
		},
		allowTwoDigitYear: false,
		fromDate,
		toDate,
		disabled,
	})

	// Keep the Aksel datepicker's internal state aligned when RHF updates the value externally.
	useEffect(() => {
		if (previousFieldValueRef.current === field.value) return
		previousFieldValueRef.current = field.value

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
				onChange={(event: ChangeEvent<HTMLInputElement>) => {
					inputProps.onChange?.(event)
					field.onChange(event.target.value)
				}}
				onBlur={(event: FocusEvent<HTMLInputElement>) => {
					inputProps.onBlur?.(event)
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
