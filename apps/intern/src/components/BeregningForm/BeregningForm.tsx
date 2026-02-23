import {
	Box,
	HStack,
	Radio,
	RadioGroup,
	Select,
	TextField,
} from '@navikt/ds-react'

import type { JaNei, Sivilstand } from '../../api/beregningTypes'
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
	const {
		formData,
		updateFormField,
		committedParams,
		isDirty,
		validationErrors,
		submitBeregning,
		resetForm,
	} = useBeregningContext()
	const { data: grunnbeloep } = useGrunnbeloepQuery()
	const pid = getPidFromUrl()
	const { data: fnr } = useDecryptPidQuery(pid)
	const { data: person } = usePersonQuery(fnr)

	const harPartner = ['GIFT', 'REGISTRERT_PARTNER', 'SAMBOER'].includes(
		formData.sivilstand
	)

	const partnerBetegnelse =
		formData.sivilstand === 'SAMBOER'
			? 'samboer'
			: formData.sivilstand === 'REGISTRERT_PARTNER'
				? 'partner'
				: 'ektefelle'

	return (
		<Box className={styles.beregningForm}>
			<hr className={styles.divider} />
			<div className={styles.section}>
				<Select
					label="Hva er sivilstanden til bruker ved uttak av pensjon?"
					size="small"
					className={styles.selectWrapper}
					value={formData.sivilstand}
					onChange={(e) =>
						updateFormField('sivilstand', e.target.value as Sivilstand)
					}
				>
					<option value="GIFT">Gift</option>
					<option value="UGIFT">Ugift</option>
					<option value="SAMBOER">Samboer</option>
					<option value="REGISTRERT_PARTNER">Registrert partner</option>
				</Select>
				{harPartner && (
					<RadioGroup
						legend={`Vil brukers ${partnerBetegnelse} motta pensjon, uføretrygd eller AFP?`}
						size="small"
						className={styles.horizontalRadioGroup}
						value={formData.ektefelleMottarPensjon}
						error={validationErrors.ektefelleMottarPensjon}
						onChange={(val: JaNei) =>
							updateFormField('ektefelleMottarPensjon', val)
						}
					>
						<Radio value="ja">Ja</Radio>
						<Radio value="nei">Nei</Radio>
					</RadioGroup>
				)}
				{harPartner && formData.ektefelleMottarPensjon === 'nei' && (
					<RadioGroup
						legend={`Vil brukers ${partnerBetegnelse} ha inntekt over 2G${grunnbeloep ? ` (${2 * grunnbeloep.grunnbeløp} kr)` : ''}?`}
						size="small"
						className={styles.horizontalRadioGroup}
						value={formData.ektefelleInntektOver2G}
						error={validationErrors.ektefelleInntektOver2G}
						onChange={(val: JaNei) =>
							updateFormField('ektefelleInntektOver2G', val)
						}
					>
						<Radio value="ja">Ja</Radio>
						<Radio value="nei">Nei</Radio>
					</RadioGroup>
				)}
				<TextField
					label="Pensjonsgivende inntekt frem til uttak"
					size="small"
					type="text"
					inputMode="numeric"
					style={{ width: '184px' }}
					value={formData.pensjonsgivendeInntektFremTilUttak}
					error={validationErrors.pensjonsgivendeInntektFremTilUttak}
					onChange={(e) =>
						updateFormField(
							'pensjonsgivendeInntektFremTilUttak',
							e.target.value
						)
					}
				/>
				<AlderVelger
					alderAar={formData.alderAarUttak}
					alderMd={formData.alderMdUttak}
					onAlderAarChange={(value) => updateFormField('alderAarUttak', value)}
					onAlderMdChange={(value) => updateFormField('alderMdUttak', value)}
					foedselsdato={person?.foedselsdato}
					aarError={validationErrors.alderAarUttak}
					mdError={validationErrors.alderMdUttak}
				/>
				<Select
					label="Uttaksgrad"
					size="small"
					className={styles.selectWrapper}
					value={formData.uttaksgrad}
					onChange={(e) => updateFormField('uttaksgrad', e.target.value)}
				>
					{[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((grad) => (
						<option key={grad} value={String(grad)}>
							{grad} %
						</option>
					))}
				</Select>
				{formData.uttaksgrad !== '100' && (
					<>
						<RadioGroup
							legend={`Har bruker inntekt ved siden av ${formData.uttaksgrad} % uttak?`}
							size="small"
							className={styles.horizontalRadioGroup}
							value={formData.harInntektVedSidenAvGradertUttak}
							onChange={(val: JaNei) =>
								updateFormField('harInntektVedSidenAvGradertUttak', val)
							}
						>
							<HStack gap="space-0 space-24" wrap={false}>
								<Radio value="ja">Ja</Radio>
								<Radio value="nei">Nei</Radio>
							</HStack>
						</RadioGroup>
						{formData.harInntektVedSidenAvGradertUttak === 'ja' && (
							<TextField
								label={`Pensjonsgivende inntekt ved siden av ${formData.uttaksgrad} % uttak`}
								size="small"
								type="text"
								inputMode="numeric"
								style={{ width: '184px' }}
								value={formData.pensjonsgivendeInntektVedSidenAvGradertUttak}
								error={
									validationErrors.pensjonsgivendeInntektVedSidenAvGradertUttak
								}
								onChange={(e) =>
									updateFormField(
										'pensjonsgivendeInntektVedSidenAvGradertUttak',
										e.target.value
									)
								}
							/>
						)}
					</>
				)}
				{formData.uttaksgrad !== '100' && (
					<AlderVelger
						alderAar={formData.alderAarHeltUttak}
						alderMd={formData.alderMdHeltUttak}
						aarLabel="Alder (år) for 100 % uttak"
						mdLabel="Alder (md.) for 100 % uttak"
						onAlderAarChange={(value) =>
							updateFormField('alderAarHeltUttak', value)
						}
						onAlderMdChange={(value) =>
							updateFormField('alderMdHeltUttak', value)
						}
						foedselsdato={person?.foedselsdato}
						aarError={validationErrors.alderAarHeltUttak}
						mdError={validationErrors.alderMdHeltUttak}
					/>
				)}
				<RadioGroup
					legend="Har bruker inntekt ved siden av 100 % uttak?"
					size="small"
					className={styles.horizontalRadioGroup}
					value={formData.harInntektVedSidenAvUttak}
					error={validationErrors.harInntektVedSidenAvUttak}
					onChange={(val: JaNei) =>
						updateFormField('harInntektVedSidenAvUttak', val)
					}
				>
					<HStack gap="space-0 space-24" wrap={false}>
						<Radio value="ja">Ja</Radio>
						<Radio value="nei">Nei</Radio>
					</HStack>
				</RadioGroup>
				{formData.harInntektVedSidenAvUttak === 'ja' && (
					<>
						<TextField
							label="Pensjonsgivende inntekt ved siden av 100 % uttak"
							size="small"
							type="text"
							inputMode="numeric"
							style={{ width: '184px' }}
							value={formData.pensjonsgivendeInntektVedSidenAvUttak}
							error={validationErrors.pensjonsgivendeInntektVedSidenAvUttak}
							onChange={(e) =>
								updateFormField(
									'pensjonsgivendeInntektVedSidenAvUttak',
									e.target.value
								)
							}
						/>
						<AlderVelger
							alderAar={formData.alderAarInntektSlutter}
							alderMd={formData.alderMdInntektSlutter}
							aarLabel="Alder (år) inntekt slutter"
							mdLabel="Alder (md.) inntekt slutter"
							onAlderAarChange={(value) =>
								updateFormField('alderAarInntektSlutter', value)
							}
							onAlderMdChange={(value) =>
								updateFormField('alderMdInntektSlutter', value)
							}
							foedselsdato={person?.foedselsdato}
							aarError={validationErrors.alderAarInntektSlutter}
							mdError={validationErrors.alderMdInntektSlutter}
						/>
					</>
				)}
			</div>
			<hr className={styles.divider} />
			<ButtonBar
				onSubmit={submitBeregning}
				onReset={resetForm}
				isDirty={isDirty}
				hasCommittedParams={!!committedParams}
			/>
		</Box>
	)
}
