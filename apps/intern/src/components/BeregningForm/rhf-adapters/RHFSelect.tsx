import { type ReactNode } from 'react'
import { useController, useFormContext } from 'react-hook-form'

import { Select } from '@navikt/ds-react'

import type { BeregningFormData } from '../../../api/beregningTypes'

interface RHFSelectProps {
	name: keyof BeregningFormData
	label: string
	children: ReactNode
	className?: string
	numeric?: boolean
}

export function RHFSelect({
	name,
	label,
	children,
	className,
	numeric,
}: RHFSelectProps) {
	const {
		control,
		formState: { errors },
	} = useFormContext<BeregningFormData>()
	const { field } = useController({ name, control })

	const toFormValue = (raw: string) =>
		raw ? (numeric ? Number(raw) : raw) : null

	return (
		<Select
			label={label}
			size="small"
			className={className}
			value={field.value?.toString() ?? ''}
			error={errors[name]?.message}
			onChange={(e) => field.onChange(toFormValue(e.target.value))}
		>
			{children}
		</Select>
	)
}
