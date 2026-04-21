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
import { OpplysningerFraVedtak } from '../OpplysningerFraVedtak/OpplysningerFraVedtak'
import { UtenlandsOpphold } from '../UtenlandsOpphold/UtenlandsOpphold'
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
		loependeVedtak,
	} = useBeregningContext()
	const { data: grunnbeloep } = useGrunnbeloepQuery()
	const { validate } = useFormValidation()
	const [isSubmitDisabled, setIsSubmitDisabled] = useState(false)

	const erEndring = Boolean(loependeVedtak?.harLoependeVedtak)
	const harVedtakPrivatAFP = erEndring && Boolean(loependeVedtak?.afpPrivat)

	useEffect(() => {
		if (erEndring) {
			form.setValue('endringAfpPrivat', harVedtakPrivatAFP)
			form.setValue('endringAP', !harVedtakPrivatAFP)
		}
	}, [erEndring, harVedtakPrivatAFP, form])

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
		setAlertDismissed(false)
	}, [aktivBeregning])

	const handleReset = useCallback(() => {
		setAlertDismissed(true)
		resetForm()
	}, [resetForm])

	const handleSubmit = () => {
		form.clearErrors()
		const formData = form.getValues()
		const normalizedFormData =
			formData.harOppholdUtenforNorge === true
				? formData
				: { ...formData, utenlandsOpphold: [] }

		if (normalizedFormData !== formData) {
			form.setValue('utenlandsOpphold', [], { shouldDirty: false })
		}
		const errors = validate(normalizedFormData, {
			erEndring,
			hideAfpSporsmaal,
		})

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
		beregning?.vilkaarsproevingsresultat?.alternativ?.gradertUttakAlder
	const vilkaarAlternativHelt =
		beregning?.vilkaarsproevingsresultat?.alternativ?.heltUttakAlder
	const partnerBetegnelse = getPartnerBetegnelse(sivilstatus)
	const initialSivilstatus = person && person.sivilstatus
	const sanityTextGradert =
		beregning?.vilkaarsproevingsresultat?.alternativ?.gradertUttakAlder &&
		beregning?.vilkaarsproevingsresultat?.alternativ?.heltUttakAlder &&
		!isAlderLikAnnenAlder(
			beregning?.vilkaarsproevingsresultat?.alternativ?.heltUttakAlder,
			heltUttakAlder
		)

	const visGradert =
		beregning?.vilkaarsproevingsresultat?.alternativ?.heltUttakAlder &&
		isAlderLikAnnenAlder(
			beregning?.vilkaarsproevingsresultat?.alternativ?.heltUttakAlder,
			heltUttakAlder
		)

	const uttaksGradArray = erEndring
		? [0, 20, 40, 50, 60, 80, 100]
		: [20, 40, 50, 60, 80, 100]

	const hideAfpSporsmaal = beregnMedGjenlevenderett || harVedtakPrivatAFP
	return (
		<Box className={styles.beregningForm}>
			<Box className={styles.section}>
				{erEndring && <OpplysningerFraVedtak loependeVedtak={loependeVedtak} />}
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
					erEndring,
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

				{showEpsHarPensjon({
					sivilstatus,
					beregnMedGjenlevenderett,
					erEndring,
				}) && (
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
					erEndring,
				}) && (
					<>
						<RHFRadio
							name="epsHarInntektOver2G"
							data-testid="eps-inntekt-over-2G"
							legend={`Vil ${partnerBetegnelse} ha inntekt over 2G ${grunnbeloep ? ` (${2 * grunnbeloep.grunnbeløp} kr)` : ''} ved uttak?`}
							className={styles.horizontalRadioGroup}
						/>
						<Divider noMargin />
					</>
				)}
				{!erEndring && (
					<>
						<UtenlandsOpphold onSubmitDisabledChange={setIsSubmitDisabled} />
						<Divider noMargin />
					</>
				)}

				{!hideAfpSporsmaal && (
					<>
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
					</>
				)}
				{beregning?.vilkaarsproevingsresultat?.erInnvilget === false &&
					vilkaarAlternativHelt &&
					!alertDismissed && (
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
											beregning.vilkaarsproevingsresultat?.alternativ
												?.uttaksgrad ?? 100
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
									beregning.vilkaarsproevingsresultat?.alternativ?.uttaksgrad ??
										100
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
					{uttaksgrad == null && <option value="" />}
					{uttaksGradArray.map((grad) => (
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
				onReset={handleReset}
				isDirty={isDirty}
				harAktivBeregning={!!aktivBeregning}
				isSubmitDisabled={isSubmitDisabled}
			/>
		</Box>
	)
}
