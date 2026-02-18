import {
	HStack,
	Heading,
	Radio,
	RadioGroup,
	Select,
	TextField,
} from '@navikt/ds-react'

import type { JaNei, Sivilstand } from '../../api/beregningTypes'
import { useGrunnbeloepQuery, usePersonQuery } from '../../api/queries'
import { getFnrFromUrl } from '../../utils'
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
	const { data: person } = usePersonQuery(getFnrFromUrl())

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
		<div className={styles.beregningForm}>
			<Heading size="medium" level="2" spacing>
				Beregn pensjon
			</Heading>
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
				<RadioGroup
					legend="Har bruker inntekt ved siden av 100 % uttak?"
					size="small"
					className={styles.horizontalRadioGroup}
					value={formData.harInntektVedSidenAvUttak}
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
		</div>
	)
}
