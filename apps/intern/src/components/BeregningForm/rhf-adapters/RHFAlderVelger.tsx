import { useController, useFormContext } from 'react-hook-form'

import type { BeregningFormData } from '../../../api/beregningTypes'
import { AlderVelger } from '../AlderVelger'
import { toRawValue } from './utils'

interface RHFAlderVelgerProps {
	aarName: keyof BeregningFormData
	mdName: keyof BeregningFormData
	aarLabel?: string
	mdLabel?: string
	foedselsdato?: string
	minAlder?: { aar: number; maaneder: number }
}

export function RHFAlderVelger({
	aarName,
	mdName,
	aarLabel,
	mdLabel,
	foedselsdato,
	minAlder,
}: RHFAlderVelgerProps) {
	const {
		control,
		clearErrors,
		formState: { errors },
	} = useFormContext<BeregningFormData>()
	const { field: aarField } = useController({ name: aarName, control })
	const { field: mdField } = useController({ name: mdName, control })

	return (
		<AlderVelger
			alderAar={toRawValue(aarField.value)}
			alderMd={toRawValue(mdField.value)}
			onAlderAarChange={(value) => {
				clearErrors(aarName)
				aarField.onChange(value ? Number(value) : null)
			}}
			onAlderMdChange={(value) => {
				clearErrors(aarName)
				mdField.onChange(value ? Number(value) : null)
			}}
			aarLabel={aarLabel}
			mdLabel={mdLabel}
			foedselsdato={foedselsdato}
			{...(minAlder ? { minAlder } : {})}
			aarError={errors[aarName]?.message}
			mdError={errors[mdName]?.message}
		/>
	)
}
