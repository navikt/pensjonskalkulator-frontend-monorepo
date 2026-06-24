import {
	BodyLong,
	BodyShort,
	Heading,
	Link,
	List,
	VStack,
} from '@navikt/ds-react'

import { getPesysBrukeroversiktUrl } from '../../utils.ts'

interface ErrorPage5xxProps {
	message?: string
}

export const ErrorPage5xx = ({ message }: ErrorPage5xxProps) => {
	return (
		<VStack
			align="center"
			justify="center"
			data-testid="error-page-5xx"
			// style={{ flex: 1, padding: '2rem' }}
		>
			<VStack gap="space-4" style={{ maxWidth: '600px' }}>
				<BodyShort size="small">Statuskode 5XX</BodyShort>
				<Heading level="2" size="medium">
					Beklager, noe gikk galt
				</Heading>
				<BodyLong>
					En teknisk feil gjør at siden ikke er tilgjengelig. Dette skyldes ikke
					noe du gjorde.
				</BodyLong>
				<BodyLong>Du kan prøve å</BodyLong>
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
						style={{ marginTop: '2rem' }}
						data-testid="error-page-5xx-feil-id"
					>
						Feil-id: {message}
					</BodyShort>
				)}
			</VStack>
		</VStack>
	)
}
