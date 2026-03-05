import { type ReactNode } from 'react'
import { useController, useFormContext } from 'react-hook-form'

import { Radio, RadioGroup } from '@navikt/ds-react'

import type { BeregningFormData } from '../../../api/beregningTypes'

interface radioOption {
	value: string
	label: string
}

interface RHFRadioBooleanValg {
	name: keyof BeregningFormData
	legend: string
	className?: string
	children?: ReactNode
	valg: radioOption[]
	testid?: string
}

export function RHFRadioValg({
	name,
	legend,
	className,
	children,
	valg,
	testid,
}: RHFRadioBooleanValg) {
	const {
		control,
		formState: { errors },
	} = useFormContext<BeregningFormData>()
	const { field } = useController({
		name,
		control,
	})

	const displayValue = field.value ?? null
	const error = errors[name]?.message

	return (
		<RadioGroup
			legend={legend}
			size="small"
			className={className}
			value={displayValue}
			error={error}
			onChange={(val: string) => field.onChange(val)}
			data-testid={testid}
		>
			{children ?? (
				<>
					{valg.map((option: radioOption) => (
						<Radio key={option.value} value={option.value}>
							{option.label}
						</Radio>
					))}
				</>
			)}
		</RadioGroup>
	)
}
