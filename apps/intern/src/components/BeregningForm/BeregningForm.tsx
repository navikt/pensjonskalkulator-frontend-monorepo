import { useWatch } from 'react-hook-form'

import { Box, HStack, Radio } from '@navikt/ds-react'

import type { BeregningFormData } from '../../api/beregningTypes'
import {
	getPartnerBetegnelse,
	shouldShowEpsHarInntektOver2G,
	shouldShowEpsHarPensjon,
	shouldShowHeltUttakAlder,
	shouldShowInntektGradertFields,
	shouldShowInntektHeltFields,
} from '../../api/formConditions'
import { useGrunnbeloepQuery } from '../../api/queries'
import { useBeregningContext } from '../BeregningContext'
import { ButtonBar } from './ButtonBar'
import {
	RHFAlderVelger,
	RHFRadioBoolean,
	RHFSelect,
	RHFTextField,
} from './rhf-adapters'
import { useFormValidation } from './useFormValidation'

import styles from './BeregningForm.module.css'

const sivilstandOptions = [
	{ value: 'GIFT', label: 'Gift' },
	{ value: 'UGIFT', label: 'Ugift' },
	{ value: 'SAMBOER', label: 'Samboer' },
	{ value: 'REGISTRERT_PARTNER', label: 'Registrert partner' },
]

export const BeregningForm = () => {
	const { form, aktivBeregning, isDirty, submitBeregning, resetForm, person } =
		useBeregningContext()
	const { data: grunnbeloep } = useGrunnbeloepQuery()
	const { validate } = useFormValidation()

	const { control } = form

	const [sivilstand, epsHarPensjon, uttaksgrad, harInntektVedSidenAvUttak] =
		useWatch({
			control,
			name: [
				'sivilstand',
				'epsHarPensjon',
				'uttaksgrad',
				'harInntektVedSidenAvUttak',
			] as const,
		})

	const handleSubmit = (e?: React.BaseSyntheticEvent) => {
		e?.preventDefault()
		form.clearErrors()

		const formData = form.getValues()
		const errors = validate(formData)

		if (Object.keys(errors).length > 0) {
			for (const key of Object.keys(errors) as (keyof BeregningFormData)[]) {
				form.setError(key, { message: errors[key] })
			}
			return
		}

		submitBeregning()
	}

	const partnerBetegnelse = getPartnerBetegnelse(sivilstand)

	return (
		<Box className={styles.beregningForm}>
			<hr className={styles.divider} />
			<div className={styles.section}>
				<RHFSelect
					name="sivilstand"
					label="Hva er sivilstanden til bruker ved uttak av pensjon?"
					className={styles.selectWrapper}
				>
					<option value="">Velg</option>
					{sivilstandOptions.map(({ value, label }) => (
						<option key={value} value={value}>
							{label}
						</option>
					))}
				</RHFSelect>

				{shouldShowEpsHarPensjon(sivilstand) && (
					<RHFRadioBoolean
						name="epsHarPensjon"
						legend={`Vil brukers ${partnerBetegnelse} motta pensjon, uføretrygd eller AFP?`}
						className={styles.horizontalRadioGroup}
					/>
				)}

				{shouldShowEpsHarInntektOver2G(sivilstand, epsHarPensjon) && (
					<RHFRadioBoolean
						name="epsHarInntektOver2G"
						legend={`Vil brukers ${partnerBetegnelse} ha inntekt over 2G${grunnbeloep ? ` (${2 * grunnbeloep.grunnbeløp} kr)` : ''}?`}
						className={styles.horizontalRadioGroup}
					/>
				)}

				<RHFTextField
					name="aarligInntektFoerUttakBeloep"
					label="Pensjonsgivende inntekt frem til uttak"
					style={{ width: '184px' }}
				/>

				<RHFAlderVelger
					aarName="alderAarUttak"
					mdName="alderMdUttak"
					foedselsdato={person?.foedselsdato}
				/>

				<RHFSelect
					name="uttaksgrad"
					label="Uttaksgrad"
					className={styles.selectWrapper}
					numeric
				>
					<option value="">Velg</option>
					{[20, 40, 50, 60, 80, 100].map((grad) => (
						<option key={grad} value={String(grad)}>
							{grad} %
						</option>
					))}
				</RHFSelect>

				{shouldShowInntektGradertFields(uttaksgrad) && (
					<RHFTextField
						name="pensjonsgivendeInntektVedSidenAvGradertUttak"
						label={`Pensjonsgivende inntekt ved siden av ${uttaksgrad} % uttak`}
						style={{ width: '184px' }}
					/>
				)}

				{shouldShowHeltUttakAlder(uttaksgrad) && (
					<RHFAlderVelger
						aarName="alderAarHeltUttak"
						mdName="alderMdHeltUttak"
						aarLabel="Alder (år) for 100 % uttak"
						mdLabel="Alder (md.) for 100 % uttak"
						foedselsdato={person?.foedselsdato}
					/>
				)}

				<RHFRadioBoolean
					name="harInntektVedSidenAvUttak"
					legend="Har bruker inntekt ved siden av 100 % uttak?"
					className={styles.horizontalRadioGroup}
				>
					<HStack gap="space-0 space-24" wrap={false}>
						<Radio value="ja">Ja</Radio>
						<Radio value="nei">Nei</Radio>
					</HStack>
				</RHFRadioBoolean>

				{shouldShowInntektHeltFields(harInntektVedSidenAvUttak) && (
					<>
						<RHFTextField
							name="pensjonsgivendeInntektVedSidenAvUttak"
							label="Pensjonsgivende inntekt ved siden av 100 % uttak"
							style={{ width: '184px' }}
						/>

						<RHFAlderVelger
							aarName="alderAarInntektSlutter"
							mdName="alderMdInntektSlutter"
							aarLabel="Alder (år) inntekt slutter"
							mdLabel="Alder (md.) inntekt slutter"
							foedselsdato={person?.foedselsdato}
						/>
					</>
				)}
			</div>
			<hr className={styles.divider} />
			<ButtonBar
				onSubmit={handleSubmit}
				onReset={resetForm}
				isDirty={isDirty}
				harAktivBeregning={!!aktivBeregning}
			/>
		</Box>
	)
}
