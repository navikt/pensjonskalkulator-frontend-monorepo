import { type ReactNode } from 'react'
import { type FieldPath, useController, useFormContext } from 'react-hook-form'

import { HStack, Radio, RadioGroup } from '@navikt/ds-react'

import type { BeregningFormData } from '../../../api/beregningTypes'
import { getNestedError } from './utils'

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
