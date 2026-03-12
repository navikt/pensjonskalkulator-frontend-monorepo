import { useEffect, useRef, useState } from 'react'
import { useController, useFormContext } from 'react-hook-form'

import { TextField } from '@navikt/ds-react'

import type { BeregningFormData } from '../../../api/beregningTypes'

interface RHFTextFieldProps {
	name: keyof BeregningFormData
	label: string
	style?: React.CSSProperties
	number?: boolean
}

export function RHFTextField({
	name,
	label,
	style,
	number = true,
}: Readonly<RHFTextFieldProps>) {
	const {
		control,
		formState: { errors },
	} = useFormContext<BeregningFormData>()

	const { field } = useController({
		name,
		control,
	})

	const [rawValue, setRawValue] = useState(
		field.value !== null && field.value !== undefined ? String(field.value) : ''
	)

	const isUserInputRef = useRef(false)

	useEffect(() => {
		if (!isUserInputRef.current) {
			const val = field.value
			setRawValue(
				val !== null &&
					val !== undefined &&
					!(typeof val === 'number' && Number.isNaN(val))
					? String(val)
					: ''
			)
		}
		isUserInputRef.current = false
	}, [field.value])

	const error = errors[name]?.message

	return (
		<TextField
			label={label}
			size="small"
			type="text"
			inputMode={number ? 'numeric' : undefined}
			style={style}
			value={rawValue}
			error={error}
			onChange={(e) => {
				const raw = e.target.value
				setRawValue(raw)
				isUserInputRef.current = true

				if (!number) {
					field.onChange(raw)
					return
				}

				if (raw === '') {
					field.onChange(null)
				} else if (/^\d+$/.test(raw)) {
					field.onChange(Number(raw))
				} else {
					field.onChange(NaN)
				}
			}}
		/>
	)
}
