import { createSanityAppClient } from '@pensjonskalkulator-frontend-monorepo/sanity'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock(
	'@pensjonskalkulator-frontend-monorepo/sanity',
	async (importOriginal) => ({
		...(await importOriginal<
			typeof import('@pensjonskalkulator-frontend-monorepo/sanity')
		>()),
		createSanityAppClient: vi.fn(() => ({ fetch: vi.fn() })),
	})
)

describe('SanityProvider dataset', () => {
	beforeEach(() => vi.resetModules())
	afterEach(() => {
		vi.unstubAllGlobals()
		vi.clearAllMocks()
	})

	it.each([
		{
			hostname: 'staging-intern-pensjonskalkulator.ansatt.dev.nav.no',
			dataset: 'production',
		},
		{
			hostname: 'staging-pensjonskalkulator-frontend-intern.ansatt.dev.nav.no',
			dataset: 'production',
		},
		{
			hostname: 'pensjonskalkulator.ansatt.nav.no',
			dataset: 'production',
		},
		{
			hostname: 'pensjonskalkulator.intern.nav.no',
			dataset: 'production',
		},
		{
			hostname: 'test-intern-pensjonskalkulator.ansatt.dev.nav.no',
			dataset: 'development',
		},
		{ hostname: 'localhost', dataset: 'development' },
	])('uses $dataset for $hostname', async ({ hostname, dataset }) => {
		vi.stubGlobal('window', { location: { hostname } })

		await import('./SanityProvider')

		expect(createSanityAppClient).toHaveBeenCalledExactlyOnceWith({
			projectId: 'g2by7q6m',
			dataset,
		})
	})
})
