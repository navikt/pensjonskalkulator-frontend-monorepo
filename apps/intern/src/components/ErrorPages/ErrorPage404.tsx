import { BodyLong, Button, Heading, VStack } from '@navikt/ds-react'

import { getPesysBrukeroversiktUrl } from '../../utils.ts'

import styles from './ErrorPages.module.css'

export const ErrorPage404 = () => {
	return (
		<VStack
			align="center"
			justify="center"
			data-testid="error-page-400"
			className={styles.container}
		>
			<VStack gap="space-4" className={styles.content}>
				<Heading level="2" size="medium">
					Beklager, vi fant ikke siden
				</Heading>
				<BodyLong>
					Denne siden kan være slettet, flyttet eller det er en feil i lenken.
					For å bruke pensjonskalkulatoren, må du først hente en bruker fra
					Pesys brukeroversikt.
				</BodyLong>
				<div>
					<Button
						as="a"
						href={getPesysBrukeroversiktUrl()}
						size="small"
						data-testid="error-page-400-link"
						style={{ marginTop: '1rem' }}
					>
						Gå til Pesys brukeroversikt
					</Button>
				</div>
			</VStack>
		</VStack>
	)
}
