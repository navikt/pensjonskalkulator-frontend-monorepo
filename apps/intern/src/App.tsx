import { useState } from 'react'

import {
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
	useEnheterQuery,
	useFeatureToggleQuery,
	useInntektQuery,
	useInternsimulatorLagreBrevButtonQuery,
	useOmstillingsstoenadQuery,
	usePersonQuery,
	useVedtakQuery,
} from './api/queries.ts'
import { Beregning } from './components/Beregning/Beregning.tsx'
import {
	BeregningProvider,
	useBeregningContext,
} from './components/BeregningContext.tsx'
import { BeregningForm } from './components/BeregningForm/BeregningForm.tsx'
import {
	ErrorPage4xx,
	ErrorPage5xx,
	ErrorPage400,
} from './components/ErrorPages/index.ts'
import { getEnhetsidFromUrl, getPidFromUrl } from './utils.ts'

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

	const {
		isLoading: isLoadingPerson,
		error: personError,
		data: person,
	} = usePersonQuery(fnr)

	const { data: showHentPersonButton } = useFeatureToggleQuery(
		'internsimulator.hent-person-button'
	)
	const { data: lagreBrevButtonToggle } =
		useInternsimulatorLagreBrevButtonQuery()
	const visLagreBrevButton = lagreBrevButtonToggle?.enabled === true

	const { isLoading: isLoadingVedtak, error: vedtakError } = useVedtakQuery(fnr)

	const { isLoading: isLoadingOmstilling, error: omstillingError } =
		useOmstillingsstoenadQuery(fnr)

	const { isLoading: isLoadingEnheter, error: enheterError } =
		useEnheterQuery(visLagreBrevButton)

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
	const error =
		decryptError ||
		personError ||
		vedtakError ||
		inntektError ||
		omstillingError ||
		(visLagreBrevButton ? enheterError : undefined)

	if (error) {
		const statusMatch = error.message.match(/(\d{3})/)
		const status = statusMatch ? parseInt(statusMatch[1], 10) : undefined

		if (status === 400) {
			return <ErrorPage400 />
		}
		if (status && status >= 401 && status <= 499) {
			return <ErrorPage4xx status={status} message={error.message} />
		}
		return <ErrorPage5xx message={error.message} />
	}

	if (
		isDecrypting ||
		isLoadingPerson ||
		isLoadingVedtak ||
		isLoadingInntekt ||
		isLoadingOmstilling ||
		(visLagreBrevButton ? isLoadingEnheter : false)
	) {
		return <Loader size="xlarge" title="Henter brukerdata..." />
	}

	return (
		<>
			{showHentPersonButton?.enabled === false && (
				<GlobalAlert status="announcement" size="small" centered={false}>
					<GlobalAlert.Header className={styles.pilotGlobalAlert}>
						<GlobalAlert.Title>
							Denne pensjonskalkulatoren er under utvikling. Er du ikke med i
							piloten, skal du fortsatt bruke gammel pensjonskalkulator.
						</GlobalAlert.Title>
					</GlobalAlert.Header>
				</GlobalAlert>
			)}
			<PersonInfo onPidChange={handlePidChange} />
			<BeregningProvider
				initialSivilstatus={person?.sivilstatus}
				initialInntekt={inntekt?.beloep}
				initialInntektAar={inntekt?.aar}
			>
				<BeregningLayout />
			</BeregningProvider>
		</>
	)
}

export const App = () => {
	const { data: lagreBrevButtonToggle } =
		useInternsimulatorLagreBrevButtonQuery()
	const visLagreBrevButton = lagreBrevButtonToggle?.enabled === true
	const { data: enheterData } = useEnheterQuery(visLagreBrevButton)
	const enheter = visLagreBrevButton ? enheterData : undefined

	const enhet = enheter?.enhetListe?.find((e) => e.id === getEnhetsidFromUrl())

	return (
		<SanityProvider>
			<div className={styles.appContainer}>
				<PesysHeader enhet={enhet} />
				<Theme className="app-content">
					<AppContent />
				</Theme>
			</div>
		</SanityProvider>
	)
}
