import { expect, test } from '@playwright/test'

import { mockApiError } from '../utils/mock'
import { API_URLS, setupDefaultMocks } from '../utils/test-helpers'

test.describe('Error pages', () => {
	test.describe('400 - invalid URL / missing pid', () => {
		test('shows 400 error page when decrypt fails with 400', async ({
			page,
		}) => {
			await setupDefaultMocks(page)
			await mockApiError(page, API_URLS.DECRYPT, 400)

			await page.goto('/?pid=invalid-pid')

			await expect(page.getByTestId('error-page-400')).toBeVisible()
		})

		test('brukeroversikt button has correct href', async ({ page }) => {
			await setupDefaultMocks(page)
			await mockApiError(page, API_URLS.DECRYPT, 400)

			await page.goto('/?pid=invalid-pid')

			const link = page.getByTestId('error-page-400-link')
			await expect(link).toBeVisible()
			await expect(link).toHaveAttribute('href', /brukeroversikt/)
		})
	})

	test.describe('4xx - no access', () => {
		test('shows 4xx error page when person endpoint returns 401', async ({
			page,
		}) => {
			await setupDefaultMocks(page)
			await mockApiError(page, API_URLS.PERSON, 401)

			await page.goto('/?pid=encrypted-default-pid')

			await expect(page.getByTestId('error-page-4xx')).toBeVisible()
			await expect(page.getByTestId('error-page-4xx-status')).toContainText(
				'401'
			)
		})

		test('shows 4xx error page when person endpoint returns 403', async ({
			page,
		}) => {
			await setupDefaultMocks(page)
			await mockApiError(page, API_URLS.PERSON, 403)

			await page.goto('/?pid=encrypted-default-pid')

			await expect(page.getByTestId('error-page-4xx')).toBeVisible()
			await expect(page.getByTestId('error-page-4xx-status')).toContainText(
				'403'
			)
		})

		test.skip('shows feil-id from error message', async ({ page }) => {
			await setupDefaultMocks(page)
			await mockApiError(page, API_URLS.PERSON, 401)

			await page.goto('/?pid=encrypted-default-pid')

			await expect(page.getByTestId('error-page-4xx-feil-id')).toBeVisible()
		})
	})

	test.describe('5xx - server error', () => {
		test('shows 5xx error page when person endpoint returns 500', async ({
			page,
		}) => {
			await setupDefaultMocks(page)
			await mockApiError(page, API_URLS.PERSON, 500)

			await page.goto('/?pid=encrypted-default-pid')

			await expect(page.getByTestId('error-page-5xx')).toBeVisible()
		})

		test('shows action links', async ({ page }) => {
			await setupDefaultMocks(page)
			await mockApiError(page, API_URLS.PERSON, 500)

			await page.goto('/?pid=encrypted-default-pid')

			await expect(page.getByTestId('error-page-5xx-reload')).toBeVisible()
			await expect(
				page.getByTestId('error-page-5xx-brukeroversikt')
			).toBeVisible()
		})

		test.skip('shows feil-id from error message', async ({ page }) => {
			await setupDefaultMocks(page)
			await mockApiError(page, API_URLS.PERSON, 500)

			await page.goto('/?pid=encrypted-default-pid')

			await expect(page.getByTestId('error-page-5xx-feil-id')).toBeVisible()
		})
	})
})
