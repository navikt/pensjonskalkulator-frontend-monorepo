import {
	type AlertQueryResult,
	SanityContext,
	createSanityAppClient,
} from '@pensjonskalkulator-frontend-monorepo/sanity'
import { type ReactNode, useEffect, useState } from 'react'
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

interface Props {
	children: ReactNode
}

export function SanityProvider({ children }: Props) {
	const [alertData, setAlertData] = useState<
		Record<string, AlertQueryResult[number]>
	>({})

	useEffect(() => {
		sanityClient
			.fetch<AlertQueryResult>(alertQuery)
			.then((response) => {
				const data = Object.fromEntries(
					(response || []).map((alert) => [alert.name, alert])
				)
				setAlertData(data)
			})
			.catch(() => {
				setAlertData({})
			})
	}, [])

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
