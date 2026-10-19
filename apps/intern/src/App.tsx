import { useEffect, useState } from 'react'

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
	useErApotekerQuery,
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
	ErrorPage404,
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

	const { data: lagreBrevButtonToggle } =
		useInternsimulatorLagreBrevButtonQuery()
	const visLagreBrevButton = lagreBrevButtonToggle?.enabled === true

	const { isLoading: isLoadingVedtak, error: vedtakError } = useVedtakQuery(fnr)

	const { isLoading: isLoadingOmstilling, error: omstillingError } =
		useOmstillingsstoenadQuery(fnr)

	const { isLoading: isLoadingErApoteker } = useErApotekerQuery(fnr)

	const {
		data: enheterData,
		isLoading: isLoadingEnheter,
		error: enheterError,
	} = useEnheterQuery(visLagreBrevButton)

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

	const isAppLoading =
		isDecrypting ||
		isLoadingPerson ||
		isLoadingVedtak ||
		isLoadingInntekt ||
		isLoadingOmstilling ||
		isLoadingErApoteker ||
		(visLagreBrevButton ? isLoadingEnheter : false)

	if (isAppLoading) {
		return (
			<Box
				role="status"
				aria-live="polite"
				height="100%"
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignContent: 'center',
				}}
			>
				<Loader size="3xlarge" title="Vent litt mens vi henter informasjon." />
			</Box>
		)
	}

	const error =
		decryptError ||
		personError ||
		vedtakError ||
		inntektError ||
		omstillingError ||
		(visLagreBrevButton ? enheterError : null)

	if (error) {
		if (decryptError) {
			return <ErrorPage404 />
		}

		const status = error.status

		if (status === 404) {
			return <ErrorPage404 />
		}

		if (status && status >= 401 && status <= 499) {
			return (
				<ErrorPage4xx
					status={status}
					message={error.message}
					tilgangsnekt={error?.tilgangsnekt?.detail}
				/>
			)
		}

		return <ErrorPage5xx status={status} message={error.message} />
	}

	if (visLagreBrevButton) {
		const enhetsid = getEnhetsidFromUrl()
		const harTilgangTilEnhet = enheterData?.enhetListe?.some(
			(e) => e.id === enhetsid
		)

		if (!enhetsid || !harTilgangTilEnhet) {
			return <ErrorPage404 />
		}
	}

	return (
		<>
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
	const { data: darkModeToggle } = useFeatureToggleQuery(
		'internsimulator.dark-mode'
	)
	const darkModeEnabled = darkModeToggle?.enabled === true
	const [selectedMode, setSelectedMode] = useState<'light' | 'dark'>(() => {
		const systemMode = window.matchMedia?.('(prefers-color-scheme: dark)')
			.matches
			? 'dark'
			: 'light'
		try {
			const savedMode = localStorage.getItem('intern-color-theme')
			return savedMode === 'light' || savedMode === 'dark'
				? savedMode
				: systemMode
		} catch {
			return systemMode
		}
	})
	const mode = darkModeEnabled ? selectedMode : 'light'

	useEffect(() => {
		document.documentElement.classList.toggle('dark', mode === 'dark')
		document.documentElement.classList.toggle('light', mode === 'light')
		if (!darkModeEnabled) return

		try {
			localStorage.setItem('intern-color-theme', selectedMode)
		} catch {
			return
		}
	}, [darkModeEnabled, mode, selectedMode])

	const { data: lagreBrevButtonToggle } =
		useInternsimulatorLagreBrevButtonQuery()
	const visLagreBrevButton = lagreBrevButtonToggle?.enabled === true
	const { data: enheterData } = useEnheterQuery(visLagreBrevButton)
	const enheter = visLagreBrevButton ? enheterData : undefined

	const enhet = enheter?.enhetListe?.find((e) => e.id === getEnhetsidFromUrl())

	return (
		<SanityProvider>
			<Theme theme={mode} hasBackground className={styles.appContainer}>
				<PesysHeader
					enhet={enhet}
					mode={mode}
					onModeChange={setSelectedMode}
					showThemeToggle={darkModeEnabled}
				/>
				<div className="app-content">
					<AppContent />
				</div>
			</Theme>
		</SanityProvider>
	)
}
