import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { Theme } from '@navikt/ds-react'

import './index.css'

import { PersonInfo } from './PersonInfo.tsx'
import { PesysHeader } from './PesysHeader.tsx'

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // 5 minutes
			retry: 1,
		},
	},
})

async function startApp() {
	const useMocks =
		import.meta.env.DEV && !window.location.search.includes('nomsw')

	if (useMocks) {
		const { worker } = await import('./mocks/browser')
		await worker.start({
			onUnhandledRequest: 'bypass',
		})
		console.log('[MSW] Ready')
	}

	createRoot(document.getElementById('root')!).render(
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<PesysHeader />
				<Theme>
					<PersonInfo />
				</Theme>
			</QueryClientProvider>
		</StrictMode>
	)
}

startApp()
