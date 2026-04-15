import {
	formatInntekt,
	updateAndFormatInntektFromInputField,
} from '@pensjonskalkulator-frontend-monorepo/utils'
import { useEffect, useRef, useState } from 'react'
import { useController, useFormContext } from 'react-hook-form'

import { TextField } from '@navikt/ds-react'

import type { BeregningFormData } from '../../../api/beregningTypes'
import { toRawValue } from './utils'

interface RHFTextFieldProps {
	name: keyof BeregningFormData
	label: string
	style?: React.CSSProperties
	formatError?: string
	testId?: string
}

export function RHFTextField({
	name,
	label,
	style,
	formatError,
	testId,
}: RHFTextFieldProps) {
	const {
		control,
		formState: { errors },
	} = useFormContext<BeregningFormData>()

	const hasFormatErrorRef = useRef(false)
	const isUserInputRef = useRef(false)

	const { field } = useController({
		name,
		control,
		rules: {
			validate: () => (hasFormatErrorRef.current ? formatError : true),
		},
	})

	const [rawValue, setRawValue] = useState(
		formatInntekt(toRawValue(field.value))
	)

	useEffect(() => {
		if (!isUserInputRef.current) {
			setRawValue(formatInntekt(toRawValue(field.value)))
		}
		isUserInputRef.current = false
	}, [field.value])

	const error = errors[name]?.message

	return (
		<TextField
			label={label}
			size="small"
			type="text"
			inputMode="numeric"
			style={style}
			data-testid={testId}
			value={rawValue}
			error={error}
			onChange={(e) => {
				const raw = e.target.value
				isUserInputRef.current = true

				updateAndFormatInntektFromInputField(
					e.target,
					raw,
					setRawValue,
					() => {}
				)

				const stripped = raw.replace(/\s/g, '')
				if (stripped === '') {
					hasFormatErrorRef.current = false
					field.onChange(null)
				} else if (/^\d+$/.test(stripped)) {
					hasFormatErrorRef.current = false
					field.onChange(Number(stripped))
				} else {
					hasFormatErrorRef.current = true
					field.onChange(stripped)
				}
			}}
		/>
	)
}
