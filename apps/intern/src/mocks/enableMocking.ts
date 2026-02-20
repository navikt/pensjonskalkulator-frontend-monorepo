export async function enableMocking() {
	if (import.meta.env.MODE === 'development') {
		const { worker } = await import('./browser')
		await worker.start({
			serviceWorker: {
				url: '/mockServiceWorker.js',
			},
			onUnhandledRequest: 'bypass',
		})
		console.log('[MSW] Ready')
	} else if (import.meta.env.MODE === 'backend') {
		const registrations = await navigator.serviceWorker.getRegistrations()
		for (const registration of registrations) {
			if (registration.active?.scriptURL.includes('mockServiceWorker')) {
				await registration.unregister()
				console.log('[MSW] Service worker unregistered for backend mode')
			}
		}
	}
}
