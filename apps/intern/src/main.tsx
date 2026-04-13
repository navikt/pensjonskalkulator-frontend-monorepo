import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'

import { App } from './App.tsx'
import { enableMocking } from './mocks/enableMocking.ts'

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: (failureCount, error) => {
				if (error instanceof Error && error.message.includes('401')) {
					return false
				}
				if (error instanceof Error && error.message.includes('403')) {
					return false
				}
				return failureCount < 1
			},
			staleTime: Infinity,
		},
	},
})

enableMocking().then(() => {
	createRoot(document.getElementById('root')!).render(
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<App />
			</QueryClientProvider>
		</StrictMode>
	)
})
