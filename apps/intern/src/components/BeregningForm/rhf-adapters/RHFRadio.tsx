import { type ReactNode } from 'react'
import {
	type FieldError,
	type FieldErrors,
	type FieldPath,
	useController,
	useFormContext,
} from 'react-hook-form'

import { HStack, Radio, RadioGroup } from '@navikt/ds-react'

import type { BeregningFormData } from '../../../api/beregningTypes'

interface RadioOption {
	value: string
	label: string
}

const defaultOptions: RadioOption[] = [
	{ value: 'ja', label: 'Ja' },
	{ value: 'nei', label: 'Nei' },
]

interface RHFRadioProps {
	name: FieldPath<BeregningFormData>
	legend: string
	className?: string
	children?: ReactNode
	testid?: string
	options?: RadioOption[]
}

type NestedFormError =
	| FieldError
	| FieldErrors<BeregningFormData>
	| NestedFormError[]
	| undefined

const isFieldError = (error: NestedFormError): error is FieldError =>
	Boolean(error && typeof error === 'object' && 'message' in error)

function getNestedError(
	errors: FieldErrors<BeregningFormData>,
	name: string
): string | undefined {
	let error: NestedFormError = errors

	for (const segment of name.split('.')) {
		if (Array.isArray(error)) {
			error = error[Number(segment)]
			continue
		}

		if (!error || isFieldError(error) || !(segment in error)) {
			return undefined
		}

		error = error[segment as keyof typeof error] as NestedFormError
	}

	return isFieldError(error) ? error.message : undefined
}

export function RHFRadio({
	name,
	legend,
	className,
	children,
	options,
	testid,
}: RHFRadioProps) {
	const {
		control,
		formState: { errors },
	} = useFormContext<BeregningFormData>()
	const { field } = useController({ name, control })

	const isJaNei = !options
	const resolvedOptions = options ?? defaultOptions

	const toDisplayValue = (value: unknown) => {
		if (!isJaNei) return value ?? ''
		if (value == null) return ''
		return value ? 'ja' : 'nei'
	}

	const fromDisplayValue = (val: string) => (isJaNei ? val === 'ja' : val)

	const error = getNestedError(errors, name)

	return (
		<RadioGroup
			legend={legend}
			size="small"
			className={className}
			value={toDisplayValue(field.value)}
			error={error}
			onChange={(val: string) => field.onChange(fromDisplayValue(val))}
			data-testid={testid}
			data-feil={error ? true : false}
		>
			<HStack gap="space-32" className="horizontalRadio">
				{children ??
					resolvedOptions.map((option) => (
						<Radio key={option.value} value={option.value}>
							{option.label}
						</Radio>
					))}
			</HStack>
		</RadioGroup>
	)
}
