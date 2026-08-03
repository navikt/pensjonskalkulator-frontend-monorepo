import { InternalHeader, Spacer } from '@navikt/ds-react'

import styles from './PesysHeader.module.css'

interface PesysHeaderProps {
	enhet?: Enhet
}

export const PesysHeader = (props: PesysHeaderProps) => {
	const { enhet } = props
	return (
		<InternalHeader className={styles.pesysHeader}>
			<InternalHeader.Title as="h1" className={styles.title}>
				Pesys
			</InternalHeader.Title>
			<Spacer />
			{enhet && (
				<InternalHeader.Button
					as="div"
					style={{ fontSize: '1rem', fontWeight: 'normal' }}
				>
					{enhet?.id} {enhet?.navn}
				</InternalHeader.Button>
			)}
		</InternalHeader>
	)
}
