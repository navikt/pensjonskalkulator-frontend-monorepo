import { type ReactNode } from 'react'
import { type FieldPath, useController, useFormContext } from 'react-hook-form'

import { Select } from '@navikt/ds-react'

import type { BeregningFormData } from '../../../api/beregningTypes'
import { getNestedError } from './utils'

interface RHFSelectProps {
	name: FieldPath<BeregningFormData>
	label: string
	children: ReactNode
	className?: string
	numeric?: boolean
	testId?: string
}

export function RHFSelect({
	name,
	label,
	children,
	className,
	numeric,
	testId,
}: RHFSelectProps) {
	const {
		control,
		formState: { errors },
	} = useFormContext<BeregningFormData>()
	const { field } = useController({ name, control })

	const toFormValue = (raw: string) =>
		raw ? (numeric ? Number(raw) : raw) : null

	const errorMessage = getNestedError(errors, name)

	return (
		<Select
			label={label}
			size="small"
			className={className}
			data-testid={testId}
			value={
				typeof field.value === 'string' || typeof field.value === 'number'
					? String(field.value)
					: ''
			}
			error={errorMessage}
			onChange={(e) => field.onChange(toFormValue(e.target.value))}
		>
			{children}
		</Select>
	)
}
