import { type Ref } from 'react'
import { type FieldPath, useController, useFormContext } from 'react-hook-form'

import { UNSAFE_Combobox as Combobox } from '@navikt/ds-react'

import type { BeregningFormData } from '../../../api/beregningTypes'
import { getNestedError } from './utils'

type RHFComboboxOption = { label: string; value: string }

interface RHFComboboxProps {
	name: FieldPath<BeregningFormData>
	label: string
	options: RHFComboboxOption[]
	className?: string
	testId?: string
	inputRef?: Ref<HTMLInputElement>
}

export function RHFCombobox({
	name,
	label,
	options,
	className,
	testId,
	inputRef,
}: RHFComboboxProps) {
	const {
		control,
		formState: { errors },
	} = useFormContext<BeregningFormData>()
	const { field } = useController({ name, control })

	const selectedOptions = options.filter(
		(option) => option.value === field.value
	)

	return (
		<Combobox
			label={label}
			size="small"
			className={className}
			data-testid={testId}
			ref={inputRef}
			options={options}
			selectedOptions={selectedOptions}
			onToggleSelected={(value, isSelected) =>
				field.onChange(isSelected ? value : '')
			}
			error={getNestedError(errors, name)}
		/>
	)
}
