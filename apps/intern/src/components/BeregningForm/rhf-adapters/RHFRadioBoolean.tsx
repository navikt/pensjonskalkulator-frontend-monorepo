import { type ReactNode } from 'react'
import { useController, useFormContext } from 'react-hook-form'

import { Radio, RadioGroup } from '@navikt/ds-react'

import type { BeregningFormData } from '../../../api/beregningTypes'

interface RHFRadioBooleanProps {
	name: keyof BeregningFormData
	legend: string
	className?: string
	children?: ReactNode
}

export function RHFRadioBoolean({
	name,
	legend,
	className,
	children,
}: RHFRadioBooleanProps) {
	const {
		control,
		formState: { errors },
	} = useFormContext<BeregningFormData>()
	const { field } = useController({ name, control })

	const displayValue = field.value === null ? '' : field.value ? 'ja' : 'nei'
	const error = errors[name]?.message

	return (
		<RadioGroup
			legend={legend}
			size="small"
			className={className}
			value={displayValue}
			error={error}
			onChange={(val: string) => field.onChange(val === 'ja')}
		>
			{children ?? (
				<>
					<Radio value="ja">Ja</Radio>
					<Radio value="nei">Nei</Radio>
				</>
			)}
		</RadioGroup>
	)
}
