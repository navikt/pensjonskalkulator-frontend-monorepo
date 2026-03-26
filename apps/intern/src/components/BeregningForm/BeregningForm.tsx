import type { Sivilstatus } from '@pensjonskalkulator-frontend-monorepo/types'
import { formaterAlderString } from '@pensjonskalkulator-frontend-monorepo/utils'
import { isAlderLikAnnenAlder } from '@pensjonskalkulator-frontend-monorepo/utils/alder'
import { useCallback, useEffect, useState } from 'react'
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
import { getUttakInfo } from '../../utils/getUttakInfo'
import { SanityAlert } from '../Alerts/SanityAlert'
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

	const [alertDismissed, setAlertDismissed] = useState(false)

	useEffect(() => {
		console.log('aktivBeregning changed, resetting alertDismissed to false')

		setAlertDismissed(false)
	}, [aktivBeregning])

	const handleReset = useCallback(() => {
		console.log('Resetting form and dismissing alert')
		setAlertDismissed(true)
		resetForm()
	}, [resetForm])

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

	const { heltUttakAlder } = getUttakInfo(aktivBeregning)

	const vilkaarAlternativGradert =
		beregning?.vilkaarsproeving.alternativ?.gradertUttaksalder
	const vilkaarAlternativHelt =
		beregning?.vilkaarsproeving.alternativ?.heltUttaksalder
	const partnerBetegnelse = getPartnerBetegnelse(sivilstatus)
	const initialSivilstatus = person && person.sivilstatus
	const sanityTextGradert =
		beregning?.vilkaarsproeving.alternativ?.gradertUttaksalder &&
		beregning?.vilkaarsproeving.alternativ?.heltUttaksalder &&
		!isAlderLikAnnenAlder(
			beregning?.vilkaarsproeving.alternativ?.heltUttaksalder,
			heltUttakAlder
		)

	const visGradert =
		beregning?.vilkaarsproeving.alternativ?.heltUttaksalder &&
		isAlderLikAnnenAlder(
			beregning?.vilkaarsproeving.alternativ?.heltUttaksalder,
			heltUttakAlder
		)

	console.log('alertDismissed', alertDismissed)

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
						label="Hva er sivilstanden til bruker ved uttak av pensjon?"
						className={styles.selectWrapper}
					>
						{initialSivilstatus === 'UOPPGITT' &&
							sivilstatus === 'UOPPGITT' && <option value="" />}
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
						legend={`Vil brukers ${partnerBetegnelse} motta pensjon, uføretrygd eller AFP?`}
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
						legend={`Vil brukers ${partnerBetegnelse} ha inntekt over 2G${grunnbeloep ? ` (${2 * grunnbeloep.grunnbeløp} kr)` : ''}?`}
						className={styles.horizontalRadioGroup}
					/>
				)}
				<Divider noMargin />
				{!alertDismissed &&
					beregning?.vilkaarsproeving.vilkaarErOppfylt === false &&
					vilkaarAlternativHelt && (
						<SanityAlert
							id={
								sanityTextGradert
									? 'beregning.vilkaarsproeving.ikke_nok_opptjening_gradert'
									: 'beregning.vilkaarsproeving.ikke_nok_opptjening'
							}
							className={styles.sanityAlert}
							dynamicValues={{
								grad: visGradert
									? String(
											beregning.vilkaarsproeving.alternativ?.uttaksgrad ?? 100
										)
									: '100',
								alder:
									visGradert && vilkaarAlternativGradert
										? formaterAlderString(
												vilkaarAlternativGradert.aar,
												vilkaarAlternativGradert.maaneder
											)
										: formaterAlderString(
												vilkaarAlternativHelt.aar,
												vilkaarAlternativHelt.maaneder
											),
								grad_gradert: String(
									beregning.vilkaarsproeving.alternativ?.uttaksgrad ?? 100
								),
								gradert_alder: vilkaarAlternativGradert
									? formaterAlderString(
											vilkaarAlternativGradert.aar,
											vilkaarAlternativGradert.maaneder
										)
									: '',
							}}
						/>
					)}
				<RHFTextField
					name="aarligInntektFoerUttakBeloep"
					label="Pensjonsgivende inntekt frem til uttak"
					formatError="Du må skrive hele tall for å oppgi inntekt."
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
						formatError="Du må skrive hele tall for å oppgi inntekt."
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
							formatError="Du må skrive hele tall for å oppgi inntekt."
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
				onReset={handleReset}
				isDirty={isDirty}
				harAktivBeregning={!!aktivBeregning}
			/>
		</Box>
	)
}
