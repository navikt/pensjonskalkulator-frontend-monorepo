import { BodyLong, BodyShort, Heading, VStack } from '@navikt/ds-react'

interface ErrorPage4xxProps {
	status?: number
	message?: string
}

export const ErrorPage4xx = ({ status, message }: ErrorPage4xxProps) => {
	return (
		<VStack
			align="center"
			justify="center"
			data-testid="error-page-4xx"
			// style={{ flex: 1, padding: '2rem' }}
		>
			<VStack gap="space-4" style={{ maxWidth: '600px' }}>
				<BodyShort size="small" data-testid="error-page-4xx-status">
					Statuskode {status ?? '4XX'}
				</BodyShort>
				<Heading level="2" size="medium">
					Du har ikke tilgang til kalkulatoren eller brukeren
				</Heading>
				<BodyLong>
					Tilgangen din kan ha utløpt eller du har prøvd å slå opp en bruker du
					ikke har tilgang til. Sjekk at du er innlogget i Pesys eller kontakt
					din lokale IT-ansvarlig.
				</BodyLong>
				{message && (
					<BodyShort
						size="small"
						style={{ marginTop: '2rem' }}
						data-testid="error-page-4xx-feil-id"
					>
						Feil-id: {message}
					</BodyShort>
				)}
			</VStack>
		</VStack>
	)
}
