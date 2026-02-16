import { BodyLong, InternalHeader, Spacer } from '@navikt/ds-react'

import styles from './PesysHeader.module.css'

export const PesysHeader = () => {
	return (
		<InternalHeader className={styles.pesysHeader}>
			<InternalHeader.Title as="h1">Pesys</InternalHeader.Title>
			<InternalHeader.Button
				as="a"
				href="https://nav.no"
				className={styles.button}
			>
				<BodyLong size="small">Oppgavelisten</BodyLong>
			</InternalHeader.Button>
			<InternalHeader.Button
				as="a"
				href="https://nav.no"
				className={styles.button}
			>
				<BodyLong size="small">Pensjonsoversikt</BodyLong>
			</InternalHeader.Button>
			<InternalHeader.Button
				as="a"
				href="https://nav.no"
				className={styles.button}
			>
				<BodyLong size="small">Brukeroversikt</BodyLong>
			</InternalHeader.Button>
			<Spacer />
			<InternalHeader.User name="Ola Normann" />
		</InternalHeader>
	)
}
