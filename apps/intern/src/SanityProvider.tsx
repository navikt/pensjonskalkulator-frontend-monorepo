import {
	type AlertQueryResult,
	type ForbeholdAvsnittQueryResult,
	type KortforbeholdQueryResult,
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
const forbeholdAvsnittQuery = `*[_type == "forbeholdAvsnitt" && language == "nb" && visIntern == true] | order(order asc) | {_id,overskrift,"innhold":innholdIntern,alltidSynlig,vilkaar}`
const kortforbeholdQuery = `*[_type == "kortforbehold" && language == "nb"]{name,innhold}`

async function fetchSanityAlerts(): Promise<AlertQueryResult> {
	return sanityClient.fetch<AlertQueryResult>(alertQuery)
}

async function fetchSanityForbehold(): Promise<ForbeholdAvsnittQueryResult> {
	return sanityClient.fetch<ForbeholdAvsnittQueryResult>(forbeholdAvsnittQuery)
}

async function fetchSanityKortforbehold(): Promise<KortforbeholdQueryResult> {
	return sanityClient.fetch<KortforbeholdQueryResult>(kortforbeholdQuery)
}

interface Props {
	children: ReactNode
}

export function SanityProvider({ children }: Props) {
	const { data: alertsData } = useQuery({
		queryKey: ['sanityAlerts'],
		queryFn: fetchSanityAlerts,
	})

	const { data: forbeholdData } = useQuery({
		queryKey: ['sanityForbehold'],
		queryFn: fetchSanityForbehold,
	})

	const { data: kortforbeholdResult } = useQuery({
		queryKey: ['sanityKortforbehold'],
		queryFn: fetchSanityKortforbehold,
	})

	const alertData = useMemo(
		() =>
			Object.fromEntries(
				(alertsData ?? []).map((alert) => [alert.name, alert])
			),
		[alertsData]
	)

	const kortforbeholdData = useMemo(
		() =>
			Object.fromEntries(
				(kortforbeholdResult ?? []).map((kortforbehold) => [
					kortforbehold.name,
					kortforbehold,
				])
			),
		[kortforbeholdResult]
	)

	return (
		<IntlProvider locale="nb" messages={{}}>
			<SanityContext.Provider
				value={{
					alertData,
					forbeholdAvsnittData: forbeholdData ?? [],
					kortforbeholdData,
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
