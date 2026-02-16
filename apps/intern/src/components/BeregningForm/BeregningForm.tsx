import { Heading, Radio, RadioGroup, Select } from '@navikt/ds-react'

import type { JaNei, Sivilstand } from '../../api/beregningTypes'
import { useGrunnbeloepQuery } from '../../api/queries'
import { useBeregningContext } from '../BeregningContext'

import styles from './BeregningForm.module.css'

export const BeregningForm = () => {
	const { formData, updateFormField } = useBeregningContext()
	const { data: grunnbeloep } = useGrunnbeloepQuery()

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
			</div>
			<hr className={styles.divider} />
		</div>
	)
}
