import { useEffect, useRef, useState } from 'react'
import { useController, useFormContext } from 'react-hook-form'

import { TextField } from '@navikt/ds-react'

import type { BeregningFormData } from '../../../api/beregningTypes'

interface RHFTextFieldProps {
	name: keyof BeregningFormData
	label: string
	style?: React.CSSProperties
}

export function RHFTextField({ name, label, style }: RHFTextFieldProps) {
	const {
		control,
		formState: { errors },
	} = useFormContext<BeregningFormData>()

	const hasFormatErrorRef = useRef(false)

	const { field } = useController({
		name,
		control,
		rules: {
			validate: () =>
				hasFormatErrorRef.current
					? 'Du må skrive hele tall for å oppgi inntekt.'
					: true,
		},
	})

	const [rawValue, setRawValue] = useState(field.value?.toString() ?? '')

	useEffect(() => {
		setRawValue(field.value?.toString() ?? '')
	}, [field.value])

	const error = errors[name]?.message

	return (
		<TextField
			label={label}
			size="small"
			type="text"
			inputMode="numeric"
			style={style}
			value={rawValue}
			error={error}
			onChange={(e) => {
				const raw = e.target.value
				setRawValue(raw)

				if (raw === '') {
					hasFormatErrorRef.current = false
					field.onChange(null)
				} else if (/^\d+$/.test(raw)) {
					hasFormatErrorRef.current = false
					field.onChange(Number(raw))
				} else {
					hasFormatErrorRef.current = true
					field.onChange(null)
				}
			}}
		/>
	)
}
