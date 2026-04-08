import { SanityAlert } from '@pensjonskalkulator-frontend-monorepo/sanity'
import type { Sivilstatus } from '@pensjonskalkulator-frontend-monorepo/types'
import { formaterAlderString } from '@pensjonskalkulator-frontend-monorepo/utils'
import { useWatch } from 'react-hook-form'

import { Box } from '@navikt/ds-react'

import type { BeregningFormData } from '../../api/beregningTypes'
import {
	getPartnerBetegnelse,
	showEpsHarInntektOver2G,
	showEpsHarPensjon,
	showGradertUttakFields,
	showHarInntektVedSidenAvUttak,
	showHeltUttakAlder,
	showInntektHeltFields,
} from '../../api/formConditions'
import { useGrunnbeloepQuery } from '../../api/queries'
import { useBeregningContext } from '../BeregningContext'
import { Divider } from '../Divider/Divider'
import { Gjenlevenderett } from '../Gjenlevenderett/Gjenlevenderett'
import { ButtonBar } from './ButtonBar'
import {
	RHFAlderVelger,
	RHFRadio,
	RHFSelect,
	RHFTextField,
} from './rhf-adapters'
import { useFormValidation } from './useFormValidation'
import { showBeregnMedGjenlevenderett, showSivilstatus } from './utils'

import styles from './BeregningForm.module.css'

const sivilstandOptions: { value: Sivilstatus; label: string }[] = [
	{ value: 'ENKE_ELLER_ENKEMANN', label: 'Enke/enkemann' },
	{ value: 'GJENLEVENDE_PARTNER', label: 'Gjenlevende partner' },
	{ value: 'GIFT', label: 'Gift' },
	{ value: 'REGISTRERT_PARTNER', label: 'Registrert partner' },
	{ value: 'SAMBOER', label: 'Samboer' },
	{ value: 'SEPARERT_PARTNER', label: 'Separert partner' },
	{ value: 'SEPARERT', label: 'Separert' },
	{ value: 'SKILT', label: 'Skilt' },
	{ value: 'SKILT_PARTNER', label: 'Skilt partner' },
	{ value: 'UGIFT', label: 'Ugift' },
]

export const BeregningForm = () => {
	const {
		form,
		aktivBeregning,
		isDirty,
		submitBeregning,
		resetForm,
		person,
		beregning,
	} = useBeregningContext()
	const { data: grunnbeloep } = useGrunnbeloepQuery()
	const { validate } = useFormValidation()

	const { control } = form

	const [
		sivilstatus,
		beregnMedGjenlevenderett,
		epsHarPensjon,
		uttaksgrad,
		harInntektVedSidenAvUttak,
		alderAarUttak,
		alderMdUttak,
	] = useWatch({
		control,
		name: [
			'sivilstatus',
			'beregnMedGjenlevenderett',
			'epsHarPensjon',
			'uttaksgrad',
			'harInntektVedSidenAvUttak',
			'alderAarUttak',
			'alderMdUttak',
		] as const,
	})

	const handleSubmit = () => {
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

	const vilkaarAlternativ =
		beregning?.vilkaarsproevingsresultat?.alternativ?.gradertUttakAlder ??
		beregning?.vilkaarsproevingsresultat?.alternativ?.heltUttakAlder
	const partnerBetegnelse = getPartnerBetegnelse(sivilstatus)
	const initialSivilstatus = person && person.sivilstatus

	return (
		<Box className={styles.beregningForm}>
			<Box className={styles.section}>
				{initialSivilstatus &&
					showBeregnMedGjenlevenderett({
						initialSivilstatus,
						person,
					}) && (
						<>
							<Gjenlevenderett />
							{!beregnMedGjenlevenderett && <Divider noMargin />}
						</>
					)}
				{showSivilstatus({
					sivilstatus,
					beregnMedGjenlevenderett,
				}) && (
					<RHFSelect
						name="sivilstatus"
						testId="sivilstatus-select"
						label="Sivilstatus ved uttak"
						className={styles.selectWrapper}
					>
						{(initialSivilstatus === 'UOPPGITT' ||
							initialSivilstatus === 'UNKNOWN') && <option value="" />}
						{sivilstandOptions.map(({ value, label }) => {
							return (
								<option key={value} value={value ?? ''}>
									{label}
								</option>
							)
						})}
					</RHFSelect>
				)}

				{showEpsHarPensjon({ sivilstatus, beregnMedGjenlevenderett }) && (
					<RHFRadio
						name="epsHarPensjon"
						legend={`Mottar ${partnerBetegnelse} pensjon, uføretrygd eller AFP ved uttak?`}
						className={styles.horizontalRadioGroup}
					/>
				)}

				{showEpsHarInntektOver2G({
					sivilstatus,
					epsHarPensjon,
					beregnMedGjenlevenderett,
				}) && (
					<RHFRadio
						name="epsHarInntektOver2G"
						data-testid="eps-inntekt-over-2G"
						legend={`Vil ${partnerBetegnelse} ha inntekt over 2G ${grunnbeloep ? ` (${2 * grunnbeloep.grunnbeløp} kr)` : ''} ved uttak?`}
						className={styles.horizontalRadioGroup}
					/>
				)}
				<Divider noMargin />
				<RHFRadio
					name="afp"
					legend="Skal AFP inkluderes?"
					options={[
						{ value: 'ja_privat', label: 'Ja, privat' },
						{ value: 'nei', label: 'Nei' },
					]}
					className={styles.horizontalRadioGroup}
				/>
				<Divider noMargin />
				{beregning?.vilkaarsproevingsresultat?.erInnvilget === false &&
					vilkaarAlternativ && (
						<SanityAlert
							id="beregning.vilkaarsproeving.ikke_nok_opptjening"
							className={styles.sanityAlert}
							dynamicValues={{
								alder: formaterAlderString(
									vilkaarAlternativ?.aar,
									vilkaarAlternativ?.maaneder
								),
								grad: String(
									beregning.vilkaarsproevingsresultat.alternativ?.uttaksgrad ??
										100
								),
							}}
						/>
					)}
				<RHFTextField
					name="aarligInntektFoerUttakBeloep"
					label="Pensjonsgivende inntekt frem til uttak"
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

				{showGradertUttakFields(uttaksgrad) && (
					<RHFTextField
						name="pensjonsgivendeInntektVedSidenAvGradertUttak"
						label={`Pensjonsgivende inntekt ved siden av ${uttaksgrad} % uttak`}
					/>
				)}

				{showHeltUttakAlder(uttaksgrad) && (
					<RHFAlderVelger
						aarName="alderAarHeltUttak"
						mdName="alderMdHeltUttak"
						aarLabel="Alder (år) for 100 % uttak"
						mdLabel="Alder (md.) for 100 % uttak"
						foedselsdato={person?.foedselsdato}
						{...(alderAarUttak !== null && alderMdUttak !== null
							? {
									minAlder: {
										aar: alderMdUttak >= 11 ? alderAarUttak + 1 : alderAarUttak,
										maaneder: (alderMdUttak + 1) % 12,
									},
								}
							: {})}
					/>
				)}
				{showHarInntektVedSidenAvUttak(uttaksgrad) && (
					<RHFRadio
						name="harInntektVedSidenAvUttak"
						legend="Har bruker inntekt ved siden av 100 % uttak?"
						className={styles.horizontalRadioGroup}
					/>
				)}

				{showInntektHeltFields(harInntektVedSidenAvUttak) && (
					<>
						<RHFTextField
							name="pensjonsgivendeInntektVedSidenAvUttak"
							label="Pensjonsgivende inntekt ved siden av 100 % uttak"
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
			</Box>
			<ButtonBar
				onSubmit={handleSubmit}
				onReset={resetForm}
				isDirty={isDirty}
				harAktivBeregning={!!aktivBeregning}
			/>
		</Box>
	)
}
