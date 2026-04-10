import { format as formatDateFns, isValid, parse } from 'date-fns'
import { type ChangeEvent, type FocusEvent, useEffect, useRef } from 'react'
import { type FieldPath, useController, useFormContext } from 'react-hook-form'

import { DatePicker, useDatepicker } from '@navikt/ds-react'

import type { BeregningFormData } from '../../../api/beregningTypes'

interface RHFDatePickerProps {
	name: FieldPath<BeregningFormData>
	label: string
	className?: string
	fromDate?: Date
	toDate?: Date
	disabled?: NonNullable<Parameters<typeof useDatepicker>[0]>['disabled']
}

function formatDate(date: Date): string {
	const dd = String(date.getDate()).padStart(2, '0')
	const mm = String(date.getMonth() + 1).padStart(2, '0')
	const yyyy = date.getFullYear()
	return `${dd}.${mm}.${yyyy}`
}

function parseDate(value: unknown): Date | undefined {
	if (!value || typeof value !== 'string') return undefined
	if (!/^\d{2}\.\d{2}\.\d{4}$/.test(value)) return undefined
	const date = parse(value, 'dd.MM.yyyy', new Date())
	return isValid(date) && formatDateFns(date, 'dd.MM.yyyy') === value
		? date
		: undefined
}

function getNestedError(
	errors: Record<string, unknown>,
	name: string
): string | undefined {
	let error: unknown = errors
	for (const segment of name.split('.')) {
		if (error && typeof error === 'object' && segment in error) {
			error = (error as Record<string, unknown>)[segment]
		} else {
			return undefined
		}
	}
	return error && typeof error === 'object' && 'message' in error
		? (error as { message?: string }).message
		: undefined
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

	const year = new Date().getFullYear()
	const defaultEarliestDate = new Date(`1 Jan ${year - 120}`)
	const defaultLatestDate = new Date(`31 Dec ${year + 30}`)

	const { datepickerProps, inputProps, setSelected } = useDatepicker({
		defaultSelected: parseDate(field.value),
		onDateChange: (date) => {
			field.onChange(date ? formatDate(date) : '')
		},
		allowTwoDigitYear: false,
		fromDate: fromDate ?? defaultEarliestDate,
		toDate: toDate ?? defaultLatestDate,
		disabled,
	})

	// Keep the Aksel datepicker's internal state aligned when RHF updates the value externally.
	useEffect(() => {
		if (previousFieldValueRef.current === field.value) return
		previousFieldValueRef.current = field.value

		const selectedDate = parseDate(field.value)
		if (field.value === '' || selectedDate) {
			setSelected(selectedDate)
		}
	}, [field.value, setSelected])

	const errorMessage = getNestedError(
		errors as unknown as Record<string, unknown>,
		name
	)

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
