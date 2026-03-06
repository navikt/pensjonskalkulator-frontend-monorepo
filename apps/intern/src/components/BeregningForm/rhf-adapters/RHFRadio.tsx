import { type ReactNode } from 'react'
import { useController, useFormContext } from 'react-hook-form'

import { Radio, RadioGroup } from '@navikt/ds-react'

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
	name: keyof BeregningFormData
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
		if (value === null) return ''
		return value ? 'ja' : 'nei'
	}

	const fromDisplayValue = (val: string) => (isJaNei ? val === 'ja' : val)

	const error = errors[name]?.message

	return (
		<RadioGroup
			legend={legend}
			size="small"
			className={className}
			value={toDisplayValue(field.value)}
			error={error}
			onChange={(val: string) => field.onChange(fromDisplayValue(val))}
			data-testid={testid}
		>
			{children ??
				resolvedOptions.map((option) => (
					<Radio key={option.value} value={option.value}>
						{option.label}
					</Radio>
				))}
		</RadioGroup>
	)
}
