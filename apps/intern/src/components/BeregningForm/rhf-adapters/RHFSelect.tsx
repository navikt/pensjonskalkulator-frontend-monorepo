import { type ReactNode } from 'react'
import { type FieldPath, useController, useFormContext } from 'react-hook-form'

import { Select } from '@navikt/ds-react'

import type { BeregningFormData } from '../../../api/beregningTypes'

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
		raw ? (numeric ? Number(raw) : raw) : ''

	const errorPath = name.split('.')
	let error: unknown = errors
	for (const segment of errorPath) {
		if (error && typeof error === 'object' && segment in error) {
			error = (error as Record<string, unknown>)[segment]
		} else {
			error = undefined
			break
		}
	}
	const errorMessage =
		error && typeof error === 'object' && 'message' in error
			? (error as { message?: string }).message
			: undefined

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
