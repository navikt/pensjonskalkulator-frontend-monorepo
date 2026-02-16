import { useBeregningQuery } from '../../api/queries'
import { getFnrFromUrl } from '../../utils'
import { useBeregningContext } from '../BeregningContext'

import styles from './Beregning.module.css'

export const Beregning = () => {
	const fnr = getFnrFromUrl()
	const { committedParams } = useBeregningContext()
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const _beregning = useBeregningQuery(fnr, committedParams)

	return (
		<div className={styles.beregning}>
			{/* Query results will render here */}
		</div>
	)
}
