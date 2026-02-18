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
		submitBeregning,
		resetForm,
	} = useBeregningContext()
	const { data: grunnbeloep } = useGrunnbeloepQuery()
	const { data: person } = usePersonQuery(getFnrFromUrl())

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
				</Select>
				<RadioGroup
					legend="Vil brukers ektefelle motta pensjon, uføretrygd eller AFP?"
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
				<RadioGroup
					legend={`Vil brukers ektefelle ha inntekt over 2G${grunnbeloep ? ` (${2 * grunnbeloep.grunnbeløp} kr)` : ''}?`}
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
				<TextField
					label="Pensjonsgivende inntekt frem til uttak"
					size="small"
					type="text"
					inputMode="numeric"
					style={{ width: '184px' }}
					value={formData.pensjonsgivendeInntektFremTilUttak}
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
				<TextField
					label="Pensjonsgivende inntekt ved siden av 100 % uttak"
					size="small"
					type="text"
					inputMode="numeric"
					style={{ width: '184px' }}
					value={formData.pensjonsgivendeInntektVedSidenAvUttak}
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
				/>
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
