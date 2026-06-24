import { BodyLong, Button, Heading, VStack } from '@navikt/ds-react'

import { getPesysBrukeroversiktUrl } from '../../utils.ts'

export const ErrorPage400 = () => {
	return (
		<VStack
			align="center"
			justify="center"
			data-testid="error-page-400"
			// style={{ flex: 1, padding: '2rem' }}
		>
			<VStack gap="space-4" style={{ maxWidth: '600px' }}>
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
					>
						Gå til Pesys brukeroversikt
					</Button>
				</div>
			</VStack>
		</VStack>
	)
}
