import type { Sivilstatus } from '@pensjonskalkulator-frontend-monorepo/types'
import {
	formatInntekt,
	formaterAlderString,
} from '@pensjonskalkulator-frontend-monorepo/utils'
import {
	calculateUttaksalderAsDate,
	isAlderLikAnnenAlder,
	isFoedtFoer1963,
} from '@pensjonskalkulator-frontend-monorepo/utils/alder'
import { useCallback, useEffect, useState } from 'react'
import { useWatch } from 'react-hook-form'

import { BodyShort, Box, HStack } from '@navikt/ds-react'

import type { BeregningFormData } from '../../api/beregningTypes'
import {
	getPartnerBetegnelse,
	isUttakNesteKalenderaar,
	showAfpOffentligFields,
	showAlderspensjonFields,
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
import {
	getUttaksGradArray,
	showBeregnMedGjenlevenderett,
	showSivilstatus,
} from './utils'

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
		vedtak,
		initialInntektAar,
	} = useBeregningContext()
	const { data: grunnbeloep } = useGrunnbeloepQuery()
	const { validate } = useFormValidation()
	const [isSubmitDisabled, setIsSubmitDisabled] = useState(false)

	const erEndring = Boolean(vedtak?.harVedtak && vedtak.loependeAlderspensjon)
	const harVedtakPrivatAFP = erEndring && Boolean(vedtak?.privatAfpFom)
	const harVedtakTidsbegrensetOffentligAFP =
		!erEndring && Boolean(vedtak?.tidsbegrensetOffentligAfpFom)

	useEffect(() => {
		if (erEndring) {
			form.setValue('endringAP', true)
			form.setValue('endringAfpPrivat', harVedtakPrivatAFP)
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
		afp,
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
			'afp',
		] as const,
	})

	const [alertDismissed, setAlertDismissed] = useState(false)

	const { initialInntekt } = useBeregningContext()

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
			foedselsdato: person?.foedselsdato,
			erEndring,
			hideAfpSporsmaal,
			initialInntektAar,
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

	const erAfpOffentlig = showAfpOffentligFields({
		afp,
		foedselsdato: person?.foedselsdato,
	})

	const hideAfpSporsmaal =
		beregnMedGjenlevenderett ||
		harVedtakPrivatAFP ||
		harVedtakTidsbegrensetOffentligAFP

	const uttaksGradArray = getUttaksGradArray({
		skalBeregneAFPPrivat: afp === 'ja_privat',
		erEndring,
		ufoeretrygdgrad: vedtak?.ufoeretrygdgrad,
		alderAarUttak,
	})

	const showAPOgUTOver100Alert =
		!erEndring && vedtak?.ufoeretrygdgrad && uttaksgrad === 100 && afp === 'nei'

	const showUTOgAFPAlert =
		!erEndring && afp === 'ja_privat' && vedtak?.ufoeretrygdgrad

	const showUTOgFolketrygdBeregnetAFPAlert =
		!erEndring &&
		(afp === 'ja_offentlig' || afp === 'serviceberegning') &&
		vedtak?.ufoeretrygdgrad

	const kanVelgeServiceberegning = person?.foedselsdato
		? isFoedtFoer1963(person.foedselsdato)
		: false

	const afpOptions = [
		{ value: 'ja_privat', label: 'Ja, privat' },
		{ value: 'ja_offentlig', label: 'Ja, offentlig' },
		{ value: 'nei', label: 'Nei' },
		...(kanVelgeServiceberegning
			? [
					{
						value: 'serviceberegning',
						label: 'Serviceberegning AFP for saksbehandler',
					},
				]
			: []),
	]

	const pensjonsgivendeInntektLabel = `Pensjonsgivende årsinntekt ${initialInntektAar}:`
	const pensjonsgivendeInntektValue = `${formatInntekt(initialInntekt)} kr`
	const forrigeAar = new Date().getFullYear() - 1
	const uttaksAar =
		person?.foedselsdato && alderAarUttak !== null && alderMdUttak !== null
			? calculateUttaksalderAsDate(
					{ aar: alderAarUttak, maaneder: alderMdUttak },
					person.foedselsdato
				).getFullYear()
			: null
	const harUttakIForrigeAarEllerTidligere =
		uttaksAar !== null && uttaksAar <= forrigeAar
	const harIkkeForrigeAarsInntekt =
		initialInntektAar !== forrigeAar && !harUttakIForrigeAarEllerTidligere

	const harAlderUttak = alderAarUttak !== null && alderMdUttak !== null

	useEffect(() => {
		if (!harAlderUttak) {
			form.setValue('pensjonsgivendeInntektForrigeAar', null, {
				shouldDirty: false,
				shouldValidate: false,
			})
			form.setValue('pensjonsgivendeInntektFremTilUttak', null, {
				shouldDirty: false,
				shouldValidate: false,
			})
			form.setValue('inntektSisteMaanedFoerUttak', null, {
				shouldDirty: false,
				shouldValidate: false,
			})
			form.setValue('aarsinntektSamtidigMedAfp', null, {
				shouldDirty: false,
				shouldValidate: false,
			})
		}
	}, [harAlderUttak, form])

	useEffect(() => {
		if (!harIkkeForrigeAarsInntekt) {
			form.setValue('pensjonsgivendeInntektForrigeAar', null, {
				shouldDirty: false,
				shouldValidate: false,
			})
		}
	}, [harIkkeForrigeAarsInntekt, form])

	return (
		<Box className={styles.beregningForm}>
			<Box className={styles.section}>
				{erEndring && <OpplysningerFraVedtak vedtak={vedtak} />}
				{initialSivilstatus &&
					showBeregnMedGjenlevenderett({
						initialSivilstatus,
						person,
						erEndring,
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
						testid="eps-har-pensjon"
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
							testid="eps-har-inntekt-over-2g"
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
							options={afpOptions}
							className={styles.horizontalRadioGroup}
							testid="afp"
						/>
						{showUTOgAFPAlert && (
							<SanityAlert
								id="beregning.ufoeretrygd-med-sim-ap-og-afp-privat"
								className={styles.sanityAlert}
							/>
						)}
						{showUTOgFolketrygdBeregnetAFPAlert && (
							<SanityAlert
								id="beregning.ufoeretrygd-med-sim-ap-og-afp-offentlig-eller-service-beregning"
								className={styles.sanityAlert}
							/>
						)}
						<Divider noMargin />
					</>
				)}
				{beregning?.vilkaarsproevingsresultat?.erInnvilget === false &&
					vilkaarAlternativHelt &&
					!alertDismissed && (
						<div data-testid="vilkaarsproeving-alert">
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
										beregning.vilkaarsproevingsresultat?.alternativ
											?.uttaksgrad ?? 100
									),
									gradert_alder: vilkaarAlternativGradert
										? formaterAlderString(
												vilkaarAlternativGradert.aar,
												vilkaarAlternativGradert.maaneder
											)
										: '',
								}}
							/>
						</div>
					)}
				{(showAlderspensjonFields(afp) || hideAfpSporsmaal) && (
					<>
						{(afp === 'serviceberegning' || afp === 'ja_offentlig') &&
							beregning?.vilkaarsproevingsresultat.erInnvilget === false &&
							!alertDismissed && (
								<SanityAlert
									id="afp.vilkaarsproeving.vilkaar-ikke-oppfylt"
									className={styles.sanityAlert}
								/>
							)}
						{afp !== 'serviceberegning' && (
							<RHFTextField
								name="aarligInntektFoerUttakBeloep"
								testId="inntekt-foer-uttak"
								label="Pensjonsgivende årsinntekt frem til uttak"
								description={
									afp === 'ja_offentlig' && initialInntektAar
										? `Forhåndsutfylt med inntekt for ${initialInntektAar}`
										: undefined
								}
							/>
						)}

						<RHFAlderVelger
							aarName="alderAarUttak"
							mdName="alderMdUttak"
							aarTestId="alder-uttak-aar"
							mdTestId="alder-uttak-md"
							foedselsdato={person?.foedselsdato}
							erServiceberegning={afp === 'serviceberegning'}
							{...(afp === 'serviceberegning'
								? {
										minAlder: { aar: 62, maaneder: 0 },
										maxAlder: { aar: 66, maaneder: 11 },
									}
								: {
										...(erAfpOffentlig
											? { maxAlder: { aar: 66, maaneder: 11 } }
											: {}),
									})}
						/>

						{erAfpOffentlig && (
							<>
								{afp === 'serviceberegning' &&
									alderAarUttak !== null &&
									alderMdUttak !== null && (
										<>
											{!harUttakIForrigeAarEllerTidligere && (
												<HStack gap="space-4">
													<BodyShort size="small" weight="semibold">
														{pensjonsgivendeInntektLabel}
													</BodyShort>
													<BodyShort size="small">
														{pensjonsgivendeInntektValue}
													</BodyShort>
												</HStack>
											)}
											{harIkkeForrigeAarsInntekt && (
												<RHFTextField
													name="pensjonsgivendeInntektForrigeAar"
													label={`Pensjonsgivende årsinntekt ${forrigeAar}`}
												/>
											)}
											{isUttakNesteKalenderaar({
												foedselsdato: person?.foedselsdato,
												alderAarUttak,
												alderMdUttak,
											}) && (
												<RHFTextField
													name="pensjonsgivendeInntektFremTilUttak"
													label="Pensjonsgivende årsinntekt frem til uttak"
												/>
											)}
										</>
									)}

								{(afp !== 'serviceberegning' || harAlderUttak) && (
									<>
										<RHFTextField
											name="inntektSisteMaanedFoerUttak"
											label="Inntekt siste måned før uttak"
										/>
										<RHFTextField
											name="aarsinntektSamtidigMedAfp"
											label="Årsinntekt samtidig med AFP"
										/>
									</>
								)}
							</>
						)}

						{!erAfpOffentlig && (
							<>
								<RHFSelect
									name="uttaksgrad"
									testId="uttaksgrad"
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
								{showAPOgUTOver100Alert && (
									<SanityAlert
										id="beregning.ufoeretrygd-og-sim-AP-med-uttaksgrad-100"
										className={styles.sanityAlert}
									/>
								)}

								{showGradertUttakFields(uttaksgrad) && (
									<RHFTextField
										name="pensjonsgivendeInntektVedSidenAvGradertUttak"
										testId="inntekt-vsa-gradert-uttak"
										label={`Pensjonsgivende inntekt ved siden av ${uttaksgrad} % uttak`}
									/>
								)}

								{showHeltUttakAlder(uttaksgrad) && (
									<RHFAlderVelger
										aarName="alderAarHeltUttak"
										mdName="alderMdHeltUttak"
										aarTestId="alder-helt-uttak-aar"
										mdTestId="alder-helt-uttak-md"
										aarLabel="Alder (år) for 100 % uttak"
										mdLabel="Alder (md.) for 100 % uttak"
										foedselsdato={person?.foedselsdato}
										{...(alderAarUttak !== null && alderMdUttak !== null
											? {
													minAlder: {
														aar:
															alderMdUttak >= 11
																? alderAarUttak + 1
																: alderAarUttak,
														maaneder: (alderMdUttak + 1) % 12,
													},
												}
											: {})}
									/>
								)}
								{showHarInntektVedSidenAvUttak(uttaksgrad) && (
									<RHFRadio
										name="harInntektVedSidenAvUttak"
										testid="har-inntekt-vsa-helt-uttak"
										legend="Har bruker inntekt ved siden av 100 % uttak?"
										className={styles.horizontalRadioGroup}
									/>
								)}

								{showInntektHeltFields(harInntektVedSidenAvUttak) && (
									<>
										<RHFTextField
											name="pensjonsgivendeInntektVedSidenAvUttak"
											testId="inntekt-vsa-helt-uttak"
											label="Pensjonsgivende inntekt ved siden av 100 % uttak"
										/>

										<RHFAlderVelger
											aarName="alderAarInntektSlutter"
											mdName="alderMdInntektSlutter"
											aarTestId="alder-inntekt-slutter-aar"
											mdTestId="alder-inntekt-slutter-md"
											aarLabel="Alder (år) inntekt slutter"
											mdLabel="Alder (md.) inntekt slutter"
											foedselsdato={person?.foedselsdato}
										/>
									</>
								)}
							</>
						)}
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
