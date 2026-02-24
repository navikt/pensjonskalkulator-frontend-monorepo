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
		aktivBeregning,
		isDirty,
		validationErrors,
		submitBeregning,
		resetForm,
	} = useBeregningContext()
	const { data: grunnbeloep } = useGrunnbeloepQuery()
	const pid = getPidFromUrl()
	const { data: fnr } = useDecryptPidQuery(pid)
	const { data: person } = usePersonQuery(fnr)

	const harPartner =
		formData.sivilstand !== null &&
		['GIFT', 'REGISTRERT_PARTNER', 'SAMBOER'].includes(formData.sivilstand)

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
					value={formData.sivilstand ?? ''}
					onChange={(e) =>
						updateFormField(
							'sivilstand',
							(e.target.value || null) as Sivilstand | null
						)
					}
				>
					<option value="">Velg</option>
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
						value={
							formData.epsHarPensjon === null
								? ''
								: formData.epsHarPensjon
									? 'ja'
									: 'nei'
						}
						error={validationErrors.epsHarPensjon}
						onChange={(val: string) =>
							updateFormField('epsHarPensjon', val === 'ja')
						}
					>
						<Radio value="ja">Ja</Radio>
						<Radio value="nei">Nei</Radio>
					</RadioGroup>
				)}
				{harPartner && formData.epsHarPensjon === false && (
					<RadioGroup
						legend={`Vil brukers ${partnerBetegnelse} ha inntekt over 2G${grunnbeloep ? ` (${2 * grunnbeloep.grunnbeløp} kr)` : ''}?`}
						size="small"
						className={styles.horizontalRadioGroup}
						value={
							formData.epsHarInntektOver2G === null
								? ''
								: formData.epsHarInntektOver2G
									? 'ja'
									: 'nei'
						}
						error={validationErrors.epsHarInntektOver2G}
						onChange={(val: string) =>
							updateFormField('epsHarInntektOver2G', val === 'ja')
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
					value={formData.aarligInntektFoerUttakBeloep?.toString() ?? ''}
					error={validationErrors.aarligInntektFoerUttakBeloep}
					onChange={(e) =>
						updateFormField(
							'aarligInntektFoerUttakBeloep',
							e.target.value ? Number(e.target.value) : null
						)
					}
				/>
				<AlderVelger
					alderAar={formData.alderAarUttak?.toString() ?? ''}
					alderMd={formData.alderMdUttak?.toString() ?? ''}
					onAlderAarChange={(value) =>
						updateFormField('alderAarUttak', value ? Number(value) : null)
					}
					onAlderMdChange={(value) =>
						updateFormField('alderMdUttak', value ? Number(value) : null)
					}
					foedselsdato={person?.foedselsdato}
					aarError={validationErrors.alderAarUttak}
					mdError={validationErrors.alderMdUttak}
				/>
				<Select
					label="Uttaksgrad"
					size="small"
					className={styles.selectWrapper}
					value={formData.uttaksgrad?.toString() ?? ''}
					onChange={(e) =>
						updateFormField(
							'uttaksgrad',
							e.target.value ? Number(e.target.value) : null
						)
					}
				>
					<option value="">Velg</option>
					{[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((grad) => (
						<option key={grad} value={String(grad)}>
							{grad} %
						</option>
					))}
				</Select>
				{formData.uttaksgrad !== null && formData.uttaksgrad !== 100 && (
					<>
						<RadioGroup
							legend={`Har bruker inntekt ved siden av ${formData.uttaksgrad} % uttak?`}
							size="small"
							className={styles.horizontalRadioGroup}
							value={
								formData.harInntektVedSidenAvGradertUttak === null
									? ''
									: formData.harInntektVedSidenAvGradertUttak
										? 'ja'
										: 'nei'
							}
							onChange={(val: string) =>
								updateFormField(
									'harInntektVedSidenAvGradertUttak',
									val === 'ja'
								)
							}
						>
							<HStack gap="space-0 space-24" wrap={false}>
								<Radio value="ja">Ja</Radio>
								<Radio value="nei">Nei</Radio>
							</HStack>
						</RadioGroup>
						{formData.harInntektVedSidenAvGradertUttak === true && (
							<TextField
								label={`Pensjonsgivende inntekt ved siden av ${formData.uttaksgrad} % uttak`}
								size="small"
								type="text"
								inputMode="numeric"
								style={{ width: '184px' }}
								value={
									formData.pensjonsgivendeInntektVedSidenAvGradertUttak?.toString() ??
									''
								}
								error={
									validationErrors.pensjonsgivendeInntektVedSidenAvGradertUttak
								}
								onChange={(e) =>
									updateFormField(
										'pensjonsgivendeInntektVedSidenAvGradertUttak',
										e.target.value ? Number(e.target.value) : null
									)
								}
							/>
						)}
					</>
				)}
				{formData.uttaksgrad !== null && formData.uttaksgrad !== 100 && (
					<AlderVelger
						alderAar={formData.alderAarHeltUttak?.toString() ?? ''}
						alderMd={formData.alderMdHeltUttak?.toString() ?? ''}
						aarLabel="Alder (år) for 100 % uttak"
						mdLabel="Alder (md.) for 100 % uttak"
						onAlderAarChange={(value) =>
							updateFormField('alderAarHeltUttak', value ? Number(value) : null)
						}
						onAlderMdChange={(value) =>
							updateFormField('alderMdHeltUttak', value ? Number(value) : null)
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
					value={
						formData.harInntektVedSidenAvUttak === null
							? ''
							: formData.harInntektVedSidenAvUttak
								? 'ja'
								: 'nei'
					}
					error={validationErrors.harInntektVedSidenAvUttak}
					onChange={(val: string) =>
						updateFormField('harInntektVedSidenAvUttak', val === 'ja')
					}
				>
					<HStack gap="space-0 space-24" wrap={false}>
						<Radio value="ja">Ja</Radio>
						<Radio value="nei">Nei</Radio>
					</HStack>
				</RadioGroup>
				{formData.harInntektVedSidenAvUttak === true && (
					<>
						<TextField
							label="Pensjonsgivende inntekt ved siden av 100 % uttak"
							size="small"
							type="text"
							inputMode="numeric"
							style={{ width: '184px' }}
							value={
								formData.pensjonsgivendeInntektVedSidenAvUttak?.toString() ?? ''
							}
							error={validationErrors.pensjonsgivendeInntektVedSidenAvUttak}
							onChange={(e) =>
								updateFormField(
									'pensjonsgivendeInntektVedSidenAvUttak',
									e.target.value ? Number(e.target.value) : null
								)
							}
						/>
						<AlderVelger
							alderAar={formData.alderAarInntektSlutter?.toString() ?? ''}
							alderMd={formData.alderMdInntektSlutter?.toString() ?? ''}
							aarLabel="Alder (år) inntekt slutter"
							mdLabel="Alder (md.) inntekt slutter"
							onAlderAarChange={(value) =>
								updateFormField(
									'alderAarInntektSlutter',
									value ? Number(value) : null
								)
							}
							onAlderMdChange={(value) =>
								updateFormField(
									'alderMdInntektSlutter',
									value ? Number(value) : null
								)
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
				harAktivBeregning={!!aktivBeregning}
			/>
		</Box>
	)
}
