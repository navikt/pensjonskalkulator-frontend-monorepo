import { useController, useFormContext } from 'react-hook-form'

import { Checkbox } from '@navikt/ds-react'

import type { BeregningFormData } from '../../../api/beregningTypes'

interface RHFCheckboxProps {
	name: keyof BeregningFormData
	label: string
	className?: string
	testid?: string
	disabled?: boolean
}

export function RHFCheckbox({
	name,
	label,
	className,
	testid,
	disabled,
}: RHFCheckboxProps) {
	const {
		control,
		formState: { errors },
	} = useFormContext<BeregningFormData>()

	const { field } = useController({ name, control })
	const error = errors[name]?.message

	return (
		<Checkbox
			className={className}
			checked={Boolean(field.value)}
			onChange={(e) => field.onChange(e.target.checked)}
			error={!!error}
			data-testid={testid}
			size="small"
			disabled={disabled}
		>
			{label}
		</Checkbox>
	)
}
