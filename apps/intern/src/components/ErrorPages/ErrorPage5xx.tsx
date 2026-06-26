import {
	BodyLong,
	BodyShort,
	Heading,
	Link,
	List,
	VStack,
} from '@navikt/ds-react'

import { getPesysBrukeroversiktUrl } from '../../utils.ts'

import styles from './ErrorPages.module.css'

interface ErrorPage5xxProps {
	status?: number
	message?: string
}

export const ErrorPage5xx = ({ status, message }: ErrorPage5xxProps) => {
	return (
		<VStack
			align="center"
			justify="center"
			data-testid="error-page-5xx"
			className={styles.container}
		>
			<VStack gap="space-4" className={styles.content}>
				<BodyShort size="small">Statuskode {status ?? '5XX'}</BodyShort>
				<Heading level="3" size="medium">
					Beklager, noe gikk galt
				</Heading>
				<BodyLong size="medium" spacing>
					En teknisk feil gjør at siden ikke er tilgjengelig. Dette skyldes ikke
					noe du gjorde.
				</BodyLong>
				<BodyLong size="medium" spacing>
					Du kan prøve å
				</BodyLong>
				<List>
					<List.Item>
						<Link
							href={window.location.href}
							data-testid="error-page-5xx-reload"
						>
							laste siden på nytt
						</Link>
					</List.Item>
					<List.Item>
						<Link
							href={getPesysBrukeroversiktUrl()}
							data-testid="error-page-5xx-brukeroversikt"
						>
							gå til brukeroversikt i Pesys
						</Link>
					</List.Item>
				</List>
				{message && (
					<BodyShort
						size="small"
						style={{ marginTop: '3rem' }}
						data-testid="error-page-5xx-feil-id"
					>
						Feil-id: {message}
					</BodyShort>
				)}
			</VStack>
		</VStack>
	)
}
