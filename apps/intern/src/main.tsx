import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { Theme } from '@navikt/ds-react'

import './index.css'

import { PersonInfo } from './PersonInfo.tsx'
import { PesysHeader } from './PesysHeader.tsx'
import { Beregning } from './components/Beregning/Beregning.tsx'
import { BeregningProvider } from './components/BeregningContext.tsx'
import { BeregningForm } from './components/BeregningForm/BeregningForm.tsx'

if (import.meta.env.MODE === 'development') {
	const { worker } = await import('./mocks/browser')
	await worker.start({
		serviceWorker: {
			url: '/mockServiceWorker.js',
		},
		onUnhandledRequest: 'bypass',
	})
	console.log('[MSW] Ready')
} else if (import.meta.env.MODE === 'backend') {
	// Unregister MSW service worker when using real backend
	const registrations = await navigator.serviceWorker.getRegistrations()
	for (const registration of registrations) {
		if (registration.active?.scriptURL.includes('mockServiceWorker')) {
			await registration.unregister()
			console.log('[MSW] Service worker unregistered for backend mode')
		}
	}
}

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 1,
		},
	},
})

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<PesysHeader />
			<Theme>
				<PersonInfo />
				<BeregningProvider>
					<div style={{ display: 'flex', height: 'calc(100vh - 96px)' }}>
						<BeregningForm />
						<Beregning />
					</div>
				</BeregningProvider>
			</Theme>
		</QueryClientProvider>
	</StrictMode>
)
