import { InternalHeader, Spacer } from '@navikt/ds-react'

import styles from './PesysHeader.module.css'

export const PesysHeader = () => {
	return (
		<InternalHeader className={styles.pesysHeader}>
			<InternalHeader.Title as="h1">Pesys</InternalHeader.Title>
			<Spacer />
		</InternalHeader>
	)
}
