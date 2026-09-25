import { type Locator, type Page, expect, test } from '@playwright/test'

import { mockApi } from '../utils/mock'
import {
	API_URLS,
	fillMainFormFields,
	navigateToApp,
	setupDefaultMocks,
} from '../utils/test-helpers'

const FEATURE_TOGGLE_URL = '**/api/feature/internsimulator.vis-formler'

async function enableFormlerToggle(page: Page) {
	await page.route(FEATURE_TOGGLE_URL, (route) =>
		route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify({ enabled: true }),
		})
	)
}

async function disableFormlerToggle(page: Page) {
	await page.route(FEATURE_TOGGLE_URL, (route) =>
		route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify({ enabled: false }),
		})
	)
}

async function fillFormAndSubmit(page: Page) {
	await fillMainFormFields({
		page,
		fields: {
			'eps-har-pensjon': 'Nei',
			'eps-har-inntekt-over-2g': 'Nei',
		},
	})
	await page.getByTestId('beregn-button').click()
}

const FORMULA_KEY = 'formler.inntektspensjon_2'
const SECTION = 'beregning-section-helt'

async function openFormulaPopover(page: Page): Promise<{
	button: Locator
	mathContent: Locator
}> {
	const section = page.getByTestId(SECTION)
	const button = section.getByTestId(`formula-button-${FORMULA_KEY}`)
	await button.click()
	const mathContent = section.getByTestId(`formula-content-${FORMULA_KEY}`)
	await expect(mathContent).toBeVisible()
	return { button, mathContent }
}

test.describe('Formler', () => {
	test('viser ikke formelknapper uten Vis årsbeløp', async ({ page }) => {
		await setupDefaultMocks(page)
		await enableFormlerToggle(page)
		await mockApi(page, API_URLS.SIMULERING, 'simulering-v1.json')
		await navigateToApp(page)

		await fillFormAndSubmit(page)
		const section = page.getByTestId(SECTION)
		await expect(section).toBeVisible()

		await expect(
			section.getByTestId(`formula-button-${FORMULA_KEY}`)
		).not.toBeVisible()
	})

	test('viser formelknapper når Vis årsbeløp er avkrysset og toggle er på', async ({
		page,
	}) => {
		await setupDefaultMocks(page)
		await enableFormlerToggle(page)
		await mockApi(page, API_URLS.SIMULERING, 'simulering-v1.json')
		await navigateToApp(page)

		await fillFormAndSubmit(page)
		const section = page.getByTestId(SECTION)
		await expect(section).toBeVisible()

		await page.getByLabel('Vis årsbeløp').check()

		await expect(
			section.getByTestId(`formula-button-${FORMULA_KEY}`)
		).toBeVisible()
	})

	test('viser ikke formelknapper når toggle er av', async ({ page }) => {
		await setupDefaultMocks(page)
		await disableFormlerToggle(page)
		await mockApi(page, API_URLS.SIMULERING, 'simulering-v1.json')
		await navigateToApp(page)

		await fillFormAndSubmit(page)
		const section = page.getByTestId(SECTION)
		await expect(section).toBeVisible()

		await page.getByLabel('Vis årsbeløp').check()

		await expect(
			section.getByTestId(`formula-button-${FORMULA_KEY}`)
		).not.toBeVisible()
	})

	test('klikk på formelknapp åpner popover med formel', async ({ page }) => {
		await setupDefaultMocks(page)
		await enableFormlerToggle(page)
		await mockApi(page, API_URLS.SIMULERING, 'simulering-v1.json')
		await navigateToApp(page)

		await fillFormAndSubmit(page)
		const section = page.getByTestId(SECTION)
		await expect(section).toBeVisible()
		await page.getByLabel('Vis årsbeløp').check()

		const { button, mathContent } = await openFormulaPopover(page)

		await expect(button).toHaveAttribute('aria-expanded', 'true')
		await expect(mathContent).toBeVisible()
	})
})
