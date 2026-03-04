import type { Sivilstatus } from '@pensjonskalkulator-frontend-monorepo/types'

import {
	BodyLong,
	Box,
	GlobalAlert,
	HStack,
	Loader,
	Theme,
} from '@navikt/ds-react'

import { PersonInfo } from './PersonInfo.tsx'
import { PesysHeader } from './PesysHeader.tsx'
import { mapPersonSivilstatus } from './api/beregningTypes.ts'
import {
	useDecryptPidQuery,
	useLoependeVedtakQuery,
	usePersonQuery,
} from './api/queries.ts'
import { Beregning } from './components/Beregning/Beregning.tsx'
import {
	BeregningProvider,
	useBeregningContext,
} from './components/BeregningContext.tsx'
import { BeregningForm } from './components/BeregningForm/BeregningForm.tsx'
import { getPidFromUrl } from './utils.ts'

const BeregningLayout = () => {
	const { isDirty } = useBeregningContext()

	return (
		<>
			<Box borderColor="neutral-subtle" borderWidth="0 0 1 0">
				<HStack align="center" wrap={false}>
					<Box
						style={{ width: '496px', flexShrink: 0 }}
						paddingInline="space-48"
						paddingBlock="space-8"
					>
						<BodyLong>
							<span style={{ fontWeight: 'bold' }}>Pensjonskalkulator</span> –
							Beregn pensjon
						</BodyLong>
					</Box>
					<div style={{ flex: 1 }}>
						{isDirty && (
							<GlobalAlert status="warning" size="small">
								<GlobalAlert.Header>
									<GlobalAlert.Title>
										Du har gjort endringer i skjemaet. Oppdater beregningen.
									</GlobalAlert.Title>
								</GlobalAlert.Header>
							</GlobalAlert>
						)}
					</div>
				</HStack>
			</Box>
			<div style={{ display: 'flex', height: 'calc(100vh - 96px)' }}>
				<BeregningForm />
				<Beregning />
			</div>
		</>
	)
}

const AppContent = () => {
	const pid = getPidFromUrl()
	const {
		data: fnr,
		isLoading: isDecrypting,
		error: decryptError,
	} = useDecryptPidQuery(pid)
	const {
		data: person,
		isLoading: isLoadingPerson,
		error: personError,
	} = usePersonQuery(fnr)
	const { isLoading: isLoadingVedtak, error: vedtakError } =
		useLoependeVedtakQuery(fnr)

	if (!pid) {
		return <PersonInfo />
	}

	const error = decryptError || personError || vedtakError
	const isUnauthorized =
		error && (error.message.includes('401') || error.message.includes('403'))

	if (isUnauthorized) {
		return (
			<Box style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem' }}>
				<GlobalAlert status="error">
					<GlobalAlert.Header>
						<GlobalAlert.Title>Ikke autorisert</GlobalAlert.Title>
					</GlobalAlert.Header>
					<BodyLong spacing>
						Du har ikke tilgang til denne tjenesten. Vennligst kontakt
						systemadministrator hvis du mener du burde ha tilgang.
					</BodyLong>
					{error && (
						<BodyLong size="small" style={{ opacity: 0.8 }}>
							Feilmelding: {error.message}
						</BodyLong>
					)}
				</GlobalAlert>
			</Box>
		)
	}

	if (error) {
		return (
			<Box style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem' }}>
				<GlobalAlert status="error">
					<GlobalAlert.Header>
						<GlobalAlert.Title>Noe gikk galt</GlobalAlert.Title>
					</GlobalAlert.Header>
					<BodyLong spacing>
						Det oppstod en feil ved henting av brukerdata. Vennligst prøv igjen
						senere.
					</BodyLong>
					<BodyLong size="small" style={{ opacity: 0.8 }}>
						Feilmelding: {error.message}
					</BodyLong>
				</GlobalAlert>
			</Box>
		)
	}

	if (isDecrypting || isLoadingPerson || isLoadingVedtak) {
		return <Loader size="xlarge" title="Henter brukerdata..." />
	}

	return (
		<>
			<PersonInfo />
			<BeregningProvider
				initialSivilstatus={
					person
						? (mapPersonSivilstatus(
								person.sivilstand
							) as unknown as Sivilstatus)
						: null
				}
			>
				<BeregningLayout />
			</BeregningProvider>
		</>
	)
}

export const App = () => (
	<>
		<PesysHeader />
		<Theme>
			<AppContent />
		</Theme>
	</>
)
