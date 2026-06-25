import { expect, test } from '@playwright/test'

import { mockApi, mockApiError } from '../utils/mock'
import {
	API_URLS,
	MOCK_FILES,
	navigateToApp,
	setupDefaultMocks,
} from '../utils/test-helpers'

test.describe('Simulering error', () => {
	test('shows error alert when simulering fails', async ({ page }) => {
		await setupDefaultMocks(page)
		await mockApiError(page, API_URLS.SIMULERING, 500)

		await navigateToApp(page)

		await page.getByTestId('eps-har-pensjon').getByLabel('Nei').check()
		await page.getByTestId('eps-har-inntekt-over-2g').getByLabel('Nei').check()
		await page.getByTestId('afp').getByLabel('Nei').check()
		await page.getByTestId('inntekt-foer-uttak').fill('500000')
		await page.getByTestId('alder-uttak-aar').selectOption('67')
		await page.getByTestId('alder-uttak-md').selectOption('3')
		await page.getByTestId('uttaksgrad').selectOption('100')
		await page
			.getByTestId('har-opphold-utenfor-norge')
			.getByLabel('Nei')
			.check()
		await page
			.getByTestId('har-inntekt-vsa-helt-uttak')
			.getByLabel('Nei')
			.check()

		await page.getByTestId('beregn-button').click()

		await expect(page.getByTestId('simulering-feil')).toBeVisible({
			timeout: 15000,
		})
		await expect(page.getByTestId('simulering-feil-retry')).toBeVisible()
	})

	test('retry button re-triggers simulering', async ({ page }) => {
		await setupDefaultMocks(page)
		await mockApiError(page, API_URLS.SIMULERING, 500)

		await navigateToApp(page)

		await page.getByTestId('eps-har-pensjon').getByLabel('Nei').check()
		await page.getByTestId('eps-har-inntekt-over-2g').getByLabel('Nei').check()
		await page.getByTestId('afp').getByLabel('Nei').check()
		await page.getByTestId('inntekt-foer-uttak').fill('500000')
		await page.getByTestId('alder-uttak-aar').selectOption('67')
		await page.getByTestId('alder-uttak-md').selectOption('3')
		await page.getByTestId('uttaksgrad').selectOption('100')
		await page
			.getByTestId('har-opphold-utenfor-norge')
			.getByLabel('Nei')
			.check()
		await page
			.getByTestId('har-inntekt-vsa-helt-uttak')
			.getByLabel('Nei')
			.check()

		await page.getByTestId('beregn-button').click()
		await expect(page.getByTestId('simulering-feil')).toBeVisible({
			timeout: 15000,
		})

		// Fix the mock to succeed on retry
		await page.unroute(API_URLS.SIMULERING)
		await mockApi(page, API_URLS.SIMULERING, MOCK_FILES.SIMULERING_V1)

		await page.getByTestId('simulering-feil-retry').click()

		await expect(page.getByTestId('simulering-feil')).not.toBeVisible({
			timeout: 15000,
		})
	})
})
