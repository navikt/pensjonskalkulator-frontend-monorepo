import { Controller } from 'react-hook-form'

import {
	Box,
	HStack,
	Radio,
	RadioGroup,
	Select,
	TextField,
} from '@navikt/ds-react'

import type { Sivilstand } from '../../api/beregningTypes'
import {
	getPartnerBetegnelse,
	shouldShowEpsHarInntektOver2G,
	shouldShowEpsHarPensjon,
	shouldShowGradertUttakFields,
	shouldShowHeltUttakAlder,
	shouldShowInntektGradertFields,
	shouldShowInntektHeltFields,
} from '../../api/formConditions'
import {
	useDecryptPidQuery,
	useGrunnbeloepQuery,
	usePersonQuery,
} from '../../api/queries'
import { getPidFromUrl } from '../../utils'
import { useBeregningContext } from '../BeregningContext'
import { AlderVelger } from './AlderVelger'
import { ButtonBar } from './ButtonBar'

import styles from './BeregningForm.module.css'

export const BeregningForm = () => {
	const { form, aktivBeregning, isDirty, submitBeregning, resetForm } =
		useBeregningContext()
	const { data: grunnbeloep } = useGrunnbeloepQuery()
	const pid = getPidFromUrl()
	const { data: fnr } = useDecryptPidQuery(pid)
	const { data: person } = usePersonQuery(fnr)

	const {
		control,
		watch,
		formState: { errors },
	} = form

	const formData = watch()

	const handleSubmit = () => {
		void submitBeregning()
	}

	const partnerBetegnelse = getPartnerBetegnelse(formData.sivilstand)

	return (
		<Box className={styles.beregningForm}>
			<hr className={styles.divider} />
			<div className={styles.section}>
				<Controller
					name="sivilstand"
					control={control}
					render={({ field }) => (
						<Select
							label="Hva er sivilstanden til bruker ved uttak av pensjon?"
							size="small"
							className={styles.selectWrapper}
							value={field.value ?? ''}
							onChange={(e) =>
								field.onChange((e.target.value || null) as Sivilstand | null)
							}
						>
							<option value="">Velg</option>
							<option value="GIFT">Gift</option>
							<option value="UGIFT">Ugift</option>
							<option value="SAMBOER">Samboer</option>
							<option value="REGISTRERT_PARTNER">Registrert partner</option>
						</Select>
					)}
				/>
				{shouldShowEpsHarPensjon(formData.sivilstand) && (
					<Controller
						name="epsHarPensjon"
						control={control}
						render={({ field }) => (
							<RadioGroup
								legend={`Vil brukers ${partnerBetegnelse} motta pensjon, uføretrygd eller AFP?`}
								size="small"
								className={styles.horizontalRadioGroup}
								value={field.value === null ? '' : field.value ? 'ja' : 'nei'}
								error={errors.epsHarPensjon?.message}
								onChange={(val: string) => field.onChange(val === 'ja')}
							>
								<Radio value="ja">Ja</Radio>
								<Radio value="nei">Nei</Radio>
							</RadioGroup>
						)}
					/>
				)}
				{shouldShowEpsHarInntektOver2G(
					formData.sivilstand,
					formData.epsHarPensjon
				) && (
					<Controller
						name="epsHarInntektOver2G"
						control={control}
						render={({ field }) => (
							<RadioGroup
								legend={`Vil brukers ${partnerBetegnelse} ha inntekt over 2G${grunnbeloep ? ` (${2 * grunnbeloep.grunnbeløp} kr)` : ''}?`}
								size="small"
								className={styles.horizontalRadioGroup}
								value={field.value === null ? '' : field.value ? 'ja' : 'nei'}
								error={errors.epsHarInntektOver2G?.message}
								onChange={(val: string) => field.onChange(val === 'ja')}
							>
								<Radio value="ja">Ja</Radio>
								<Radio value="nei">Nei</Radio>
							</RadioGroup>
						)}
					/>
				)}
				<Controller
					name="aarligInntektFoerUttakBeloep"
					control={control}
					render={({ field }) => (
						<TextField
							label="Pensjonsgivende inntekt frem til uttak"
							size="small"
							type="text"
							inputMode="numeric"
							style={{ width: '184px' }}
							value={field.value?.toString() ?? ''}
							error={errors.aarligInntektFoerUttakBeloep?.message}
							onChange={(e) =>
								field.onChange(e.target.value ? Number(e.target.value) : null)
							}
						/>
					)}
				/>
				<Controller
					name="alderAarUttak"
					control={control}
					render={({ field: aarField }) => (
						<Controller
							name="alderMdUttak"
							control={control}
							render={({ field: mdField }) => (
								<AlderVelger
									alderAar={formData.alderAarUttak?.toString() ?? ''}
									alderMd={formData.alderMdUttak?.toString() ?? ''}
									onAlderAarChange={(value) => {
										aarField.onChange(value ? Number(value) : null)
									}}
									onAlderMdChange={(value) => {
										mdField.onChange(value ? Number(value) : null)
									}}
									foedselsdato={person?.foedselsdato}
									aarError={errors.alderAarUttak?.message}
									mdError={errors.alderMdUttak?.message}
								/>
							)}
						/>
					)}
				/>
				<Controller
					name="uttaksgrad"
					control={control}
					render={({ field }) => (
						<Select
							label="Uttaksgrad"
							size="small"
							className={styles.selectWrapper}
							value={field.value?.toString() ?? ''}
							onChange={(e) =>
								field.onChange(e.target.value ? Number(e.target.value) : null)
							}
						>
							<option value="">Velg</option>
							{[20, 40, 50, 60, 80, 100].map((grad) => (
								<option key={grad} value={String(grad)}>
									{grad} %
								</option>
							))}
						</Select>
					)}
				/>
				{shouldShowGradertUttakFields(formData.uttaksgrad) && (
					<>
						<Controller
							name="harInntektVedSidenAvGradertUttak"
							control={control}
							render={({ field }) => (
								<RadioGroup
									legend={`Har bruker inntekt ved siden av ${formData.uttaksgrad} % uttak?`}
									size="small"
									className={styles.horizontalRadioGroup}
									value={field.value === null ? '' : field.value ? 'ja' : 'nei'}
									onChange={(val: string) => field.onChange(val === 'ja')}
								>
									<HStack gap="space-0 space-24" wrap={false}>
										<Radio value="ja">Ja</Radio>
										<Radio value="nei">Nei</Radio>
									</HStack>
								</RadioGroup>
							)}
						/>
						{shouldShowInntektGradertFields(
							formData.uttaksgrad,
							formData.harInntektVedSidenAvGradertUttak
						) && (
							<Controller
								name="pensjonsgivendeInntektVedSidenAvGradertUttak"
								control={control}
								render={({ field }) => (
									<TextField
										label={`Pensjonsgivende inntekt ved siden av ${formData.uttaksgrad} % uttak`}
										size="small"
										type="text"
										inputMode="numeric"
										style={{ width: '184px' }}
										value={field.value?.toString() ?? ''}
										error={
											errors.pensjonsgivendeInntektVedSidenAvGradertUttak
												?.message
										}
										onChange={(e) =>
											field.onChange(
												e.target.value ? Number(e.target.value) : null
											)
										}
									/>
								)}
							/>
						)}
					</>
				)}
				{shouldShowHeltUttakAlder(formData.uttaksgrad) && (
					<Controller
						name="alderAarHeltUttak"
						control={control}
						render={({ field: aarField }) => (
							<Controller
								name="alderMdHeltUttak"
								control={control}
								render={({ field: mdField }) => (
									<AlderVelger
										alderAar={formData.alderAarHeltUttak?.toString() ?? ''}
										alderMd={formData.alderMdHeltUttak?.toString() ?? ''}
										aarLabel="Alder (år) for 100 % uttak"
										mdLabel="Alder (md.) for 100 % uttak"
										onAlderAarChange={(value) => {
											aarField.onChange(value ? Number(value) : null)
										}}
										onAlderMdChange={(value) => {
											mdField.onChange(value ? Number(value) : null)
										}}
										foedselsdato={person?.foedselsdato}
										aarError={errors.alderAarHeltUttak?.message}
										mdError={errors.alderMdHeltUttak?.message}
									/>
								)}
							/>
						)}
					/>
				)}
				<Controller
					name="harInntektVedSidenAvUttak"
					control={control}
					render={({ field }) => (
						<RadioGroup
							legend="Har bruker inntekt ved siden av 100 % uttak?"
							size="small"
							className={styles.horizontalRadioGroup}
							value={field.value === null ? '' : field.value ? 'ja' : 'nei'}
							error={errors.harInntektVedSidenAvUttak?.message}
							onChange={(val: string) => field.onChange(val === 'ja')}
						>
							<HStack gap="space-0 space-24" wrap={false}>
								<Radio value="ja">Ja</Radio>
								<Radio value="nei">Nei</Radio>
							</HStack>
						</RadioGroup>
					)}
				/>
				{shouldShowInntektHeltFields(formData.harInntektVedSidenAvUttak) && (
					<>
						<Controller
							name="pensjonsgivendeInntektVedSidenAvUttak"
							control={control}
							render={({ field }) => (
								<TextField
									label="Pensjonsgivende inntekt ved siden av 100 % uttak"
									size="small"
									type="text"
									inputMode="numeric"
									style={{ width: '184px' }}
									value={field.value?.toString() ?? ''}
									error={errors.pensjonsgivendeInntektVedSidenAvUttak?.message}
									onChange={(e) =>
										field.onChange(
											e.target.value ? Number(e.target.value) : null
										)
									}
								/>
							)}
						/>
						<Controller
							name="alderAarInntektSlutter"
							control={control}
							render={({ field: aarField }) => (
								<Controller
									name="alderMdInntektSlutter"
									control={control}
									render={({ field: mdField }) => (
										<AlderVelger
											alderAar={
												formData.alderAarInntektSlutter?.toString() ?? ''
											}
											alderMd={formData.alderMdInntektSlutter?.toString() ?? ''}
											aarLabel="Alder (år) inntekt slutter"
											mdLabel="Alder (md.) inntekt slutter"
											onAlderAarChange={(value) => {
												aarField.onChange(value ? Number(value) : null)
											}}
											onAlderMdChange={(value) => {
												mdField.onChange(value ? Number(value) : null)
											}}
											foedselsdato={person?.foedselsdato}
											aarError={errors.alderAarInntektSlutter?.message}
											mdError={errors.alderMdInntektSlutter?.message}
										/>
									)}
								/>
							)}
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
