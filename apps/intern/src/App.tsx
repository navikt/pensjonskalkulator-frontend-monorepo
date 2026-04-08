import { useState } from 'react'

import {
	BodyLong,
	Box,
	GlobalAlert,
	HStack,
	Heading,
	Loader,
	Theme,
} from '@navikt/ds-react'

import { PersonInfo } from './PersonInfo.tsx'
import { PesysHeader } from './PesysHeader.tsx'
import { SanityProvider } from './SanityProvider.tsx'
import {
	useDecryptPidQuery,
	useInntektQuery,
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

import styles from './styles/global.module.css'

const BeregningLayout = () => {
	const { isDirty } = useBeregningContext()

	return (
		<Box
			style={{
				display: 'flex',
				flexDirection: 'column',
				flex: 1,
				overflow: 'hidden',
			}}
		>
			<Box borderColor="neutral-subtle" borderWidth="0 0 1 0">
				<HStack align="center" wrap={false}>
					<Box
						className={styles.headerBox}
						paddingInline="space-48"
						paddingBlock="space-8"
					>
						<Heading level="2" size="xsmall" className={styles.heading}>
							Pensjonskalkulator
						</Heading>
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
			<HStack style={{ flex: 1, overflow: 'hidden' }} wrap={false}>
				<BeregningForm />
				<Beregning />
			</HStack>
		</Box>
	)
}

const AppContent = () => {
	const [pid, setPid] = useState(getPidFromUrl)
	const {
		data: fnr,
		isLoading: isDecrypting,
		error: decryptError,
	} = useDecryptPidQuery(pid)

	const { isLoading: isLoadingPerson, error: personError } = usePersonQuery(fnr)

	const { isLoading: isLoadingVedtak, error: vedtakError } =
		useLoependeVedtakQuery(fnr)

	const {
		data: inntekt,
		isLoading: isLoadingInntekt,
		error: inntektError,
	} = useInntektQuery(fnr)

	const handlePidChange = (encryptedPid: string) => {
		const url = new URL(window.location.href)
		url.searchParams.set('pid', encryptedPid)
		window.history.pushState({}, '', url.toString())
		setPid(encryptedPid)
	}

	if (!pid) {
		return <PersonInfo onPidChange={handlePidChange} />
	}

	const error = decryptError || personError || vedtakError || inntektError
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

	if (isDecrypting || isLoadingPerson || isLoadingVedtak || isLoadingInntekt) {
		return <Loader size="xlarge" title="Henter brukerdata..." />
	}

	return (
		<>
			<PersonInfo onPidChange={handlePidChange} />
			<BeregningProvider initialInntekt={inntekt?.beloep}>
				<BeregningLayout />
			</BeregningProvider>
		</>
	)
}

export const App = () => (
	<SanityProvider>
		<div className={styles.appContainer}>
			<PesysHeader />
			<Theme className="app-content">
				<AppContent />
			</Theme>
		</div>
	</SanityProvider>
)
