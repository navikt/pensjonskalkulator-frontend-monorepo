import {
	type AlertQueryResult,
	SanityContext,
	createSanityAppClient,
} from '@pensjonskalkulator-frontend-monorepo/sanity'
import { useQuery } from '@tanstack/react-query'
import { type ReactNode, useMemo } from 'react'
import { IntlProvider } from 'react-intl'

const dataset =
	window.location.href.includes('.dev') ||
	window.location.href.includes('localhost')
		? 'development'
		: 'production'

const sanityClient = createSanityAppClient({
	projectId: 'g2by7q6m',
	dataset,
})

const alertQuery = `*[_type == "alert"]{name,type,status,overskrift,innhold}`

async function fetchSanityAlerts(): Promise<AlertQueryResult> {
	return sanityClient.fetch<AlertQueryResult>(alertQuery)
}

interface Props {
	children: ReactNode
}

export function SanityProvider({ children }: Props) {
	const { data: alertsData } = useQuery({
		queryKey: ['sanityAlerts'],
		queryFn: fetchSanityAlerts,
		staleTime: Infinity,
	})

	const alertData = useMemo(
		() => Object.fromEntries((alertsData ?? []).map((alert) => [alert.name, alert])),
		[alertsData]
	)

	return (
		<IntlProvider locale="nb" messages={{}}>
			<SanityContext.Provider
				value={{
					alertData,
					forbeholdAvsnittData: [],
					guidePanelData: {},
					readMoreData: {},
					isSanityLoading: false,
				}}
			>
				{children}
			</SanityContext.Provider>
		</IntlProvider>
	)
}
