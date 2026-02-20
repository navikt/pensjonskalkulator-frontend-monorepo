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
import { mapPersonSivilstand } from './api/beregningTypes.ts'
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
	const { data: fnr, isLoading: isDecrypting } = useDecryptPidQuery(pid)
	const { data: person, isLoading: isLoadingPerson } = usePersonQuery(fnr)
	const { isLoading: isLoadingVedtak } = useLoependeVedtakQuery(fnr)

	if (!pid) {
		return <PersonInfo />
	}

	if (isDecrypting || isLoadingPerson || isLoadingVedtak) {
		return <Loader size="xlarge" title="Henter brukerdata..." />
	}

	return (
		<>
			<PersonInfo />
			<BeregningProvider
				initialSivilstand={
					person ? mapPersonSivilstand(person.sivilstand) : undefined
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
