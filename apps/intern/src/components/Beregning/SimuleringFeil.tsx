import { Alert, BodyLong, BodyShort, Button } from '@navikt/ds-react'

interface SimuleringFeilProps {
	message?: string
	onRetry: () => void
}

export const SimuleringFeil = ({ message, onRetry }: SimuleringFeilProps) => {
	return (
		<Alert variant="error" data-testid="simulering-feil">
			<BodyLong weight="semibold" spacing>
				Noe gikk galt med beregningen
			</BodyLong>
			<BodyLong spacing>
				Vi klarte dessverre ikke å beregne pensjon akkurat nå.
			</BodyLong>
			{message && <BodyShort size="small">{message}</BodyShort>}
			<Button
				variant="secondary"
				size="small"
				onClick={onRetry}
				style={{ marginTop: '1rem' }}
				data-testid="simulering-feil-retry"
			>
				Prøv på nytt
			</Button>
		</Alert>
	)
}
