import { type FocusEvent, useEffect, useRef } from 'react'
import { type FieldPath, useController, useFormContext } from 'react-hook-form'

import { DatePicker, useDatepicker } from '@navikt/ds-react'

import type { BeregningFormData } from '../../../api/beregningTypes'
import { formatEndUserDate, parseStrictEndUserDate } from '../../../utils/dates'
import { getNestedError } from './utils'

export function expandTwoDigitYear(year: number): number {
	const pivot = (new Date().getFullYear() - 75) % 100
	return year >= pivot ? 1900 + year : 2000 + year
}

export function normalizeDateInput(input: string): string {
	const match = input.match(/^(\d{2})\.?(\d{2})\.?(\d{2,4})$/)
	if (!match) return input
	const [, dd, mm, yy] = match
	const year = yy.length === 2 ? expandTwoDigitYear(parseInt(yy, 10)) : yy
	return `${dd}.${mm}.${year}`
}

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
	const lastFormattedRef = useRef(field.value)

	const { datepickerProps, inputProps, setSelected } = useDatepicker({
		defaultSelected: parseStrictEndUserDate(field.value),
		onDateChange: (date) => {
			const formatted = date ? formatEndUserDate(date) : ''
			lastFormattedRef.current = formatted
			if (date) {
				field.onChange(formatted)
			}
		},
		allowTwoDigitYear: true,
		fromDate,
		toDate,
		disabled,
	})

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
				onBlur={(event: FocusEvent<HTMLInputElement>) => {
					lastFormattedRef.current = ''
					inputProps.onBlur?.(event)
					const value =
						lastFormattedRef.current || normalizeDateInput(event.target.value)
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
