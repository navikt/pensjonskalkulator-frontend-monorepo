import { BodyLong, Button, LocalAlert, VStack } from '@navikt/ds-react'

interface SimuleringFeilProps {
	message?: string
	onRetry: () => void
}

export const SimuleringFeil = ({ message, onRetry }: SimuleringFeilProps) => {
	console.log('Message', message)
	return (
		<VStack align="center" justify="center" style={{ height: '100%' }}>
			<LocalAlert
				status="error"
				size="small"
				data-testid="simulering-feil"
				style={{ width: 'fit-content' }}
			>
				<LocalAlert.Header>
					<LocalAlert.Title>Noe gikk galt med beregningen</LocalAlert.Title>
				</LocalAlert.Header>
				<LocalAlert.Content>
					<BodyLong>
						Vi klarte dessverre ikke å beregne pensjon akkurat nå.
					</BodyLong>
					{/* TODO: Replace with message from backend {message && <BodyLong>{message}</BodyLong>} */}
					<Button
						variant="secondary"
						size="small"
						onClick={onRetry}
						style={{ marginTop: '1rem' }}
						data-testid="simulering-feil-retry"
					>
						Prøv på nytt
					</Button>
				</LocalAlert.Content>
			</LocalAlert>
		</VStack>
	)
}
