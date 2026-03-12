import { useController, useFormContext } from 'react-hook-form'

import type { BeregningFormData } from '../../../api/beregningTypes'
import { AlderVelger } from '../AlderVelger'

interface RHFAlderVelgerProps {
	aarName: keyof BeregningFormData
	mdName: keyof BeregningFormData
	aarLabel?: string
	mdLabel?: string
	foedselsdato?: string
	minAlder?: { aar: number; maaneder: number }
	testid?: string
}

export function RHFAlderVelger({
	aarName,
	mdName,
	aarLabel,
	mdLabel,
	foedselsdato,
	minAlder,
	testid,
}: RHFAlderVelgerProps) {
	const {
		control,
		formState: { errors },
	} = useFormContext<BeregningFormData>()
	const { field: aarField } = useController({ name: aarName, control })
	const { field: mdField } = useController({ name: mdName, control })

	return (
		<AlderVelger
			alderAar={aarField.value?.toString() ?? ''}
			alderMd={mdField.value?.toString() ?? ''}
			testid={testid}
			onAlderAarChange={(value) =>
				aarField.onChange(value ? Number(value) : null)
			}
			onAlderMdChange={(value) =>
				mdField.onChange(value ? Number(value) : null)
			}
			aarLabel={aarLabel}
			mdLabel={mdLabel}
			foedselsdato={foedselsdato}
			{...(minAlder ? { minAlder } : {})}
			aarError={errors[aarName]?.message}
			mdError={errors[mdName]?.message}
		/>
	)
}
