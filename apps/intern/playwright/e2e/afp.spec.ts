import { type Page, expect, test } from '@playwright/test'

import { loadJSONMock, mockApi } from '../utils/mock'
import {
	API_URLS,
	navigateToApp,
	setupDefaultMocks,
} from '../utils/test-helpers'

async function setupSimuleringMockWithAfpPrivat(page: Page) {
	const baseMock = (await loadJSONMock('simulering-v1.json')) as Record<
		string,
		unknown
	>
	const afpMock = (await loadJSONMock(
		'simulering-v1-afp-privat.json'
	)) as Record<string, unknown>

	const body = JSON.stringify({ ...baseMock, ...afpMock })

	await page.route(API_URLS.SIMULERING, (route) =>
		route.fulfill({
			status: 200,
			contentType: 'application/json',
			body,
		})
	)
}

async function setupSimuleringMockWithAfpPrivatGradert(page: Page) {
	const baseMock = (await loadJSONMock('simulering-v1.json')) as Record<
		string,
		unknown
	>
	const afpMock = (await loadJSONMock(
		'simulering-v1-afp-privat.json'
	)) as Record<string, unknown>

	const body = JSON.stringify({
		...baseMock,
		...afpMock,
		maanedligAlderspensjonForKnekkpunkter: {
			vedGradertUttak: {
				beloep: 12342,
				inntektspensjonBeloep: 8000,
				garantipensjonBeloep: 4342,
			},
			vedHeltUttak: {
				beloep: 28513,
				inntektspensjonBeloep: 20000,
				garantipensjonBeloep: 8513,
			},
			vedNormertPensjonsalder: {
				beloep: 28513,
				inntektspensjonBeloep: 20000,
				garantipensjonBeloep: 8513,
			},
		},
	})

	await page.route(API_URLS.SIMULERING, (route) =>
		route.fulfill({
			status: 200,
			contentType: 'application/json',
			body,
		})
	)
}

async function setupSimuleringMockWithoutAfp(page: Page) {
	await mockApi(page, API_URLS.SIMULERING, 'simulering-v1.json')
}

async function fillFormWithAfpPrivat(
	page: Page,
	options?: { uttaksgrad?: string; alderAar?: string; alderMd?: string }
) {
	const { uttaksgrad = '100', alderAar = '67', alderMd = '3' } = options ?? {}

	await page.getByTestId('eps-har-pensjon').getByLabel('Nei').check()
	await page.getByTestId('eps-har-inntekt-over-2g').getByLabel('Ja').check()
	await page.getByTestId('har-opphold-utenfor-norge').getByLabel('Nei').check()
	await page.getByTestId('afp').getByLabel('Ja, privat').check()
	await page.getByTestId('inntekt-foer-uttak').fill('500000')
	await page.getByTestId('alder-uttak-aar').selectOption(alderAar)
	await page.getByTestId('alder-uttak-md').selectOption(alderMd)
	await page.getByTestId('uttaksgrad').selectOption(uttaksgrad)
	await page.getByTestId('har-inntekt-vsa-helt-uttak').getByLabel('Nei').check()
}

test.describe('AFP', () => {
	test.describe('AFP Privat', () => {
		test.describe('Skjema', () => {
			test('viser AFP-valg med Ja, privat alternativ', async ({ page }) => {
				await setupDefaultMocks(page)
				await navigateToApp(page)

				await expect(page.getByTestId('afp')).toBeVisible()
				await expect(
					page.getByTestId('afp').getByLabel('Ja, privat')
				).toBeVisible()
				await expect(page.getByTestId('afp').getByLabel('Nei')).toBeVisible()
			})

			test('kan velge AFP privat', async ({ page }) => {
				await setupDefaultMocks(page)
				await navigateToApp(page)

				await page.getByTestId('afp').getByLabel('Ja, privat').check()

				await expect(
					page.getByTestId('afp').getByLabel('Ja, privat')
				).toBeChecked()
			})

			test('kan velge Nei for AFP', async ({ page }) => {
				await setupDefaultMocks(page)
				await navigateToApp(page)

				await page.getByTestId('afp').getByLabel('Nei').check()

				await expect(page.getByTestId('afp').getByLabel('Nei')).toBeChecked()
			})
		})

		test.describe('Validering', () => {
			test('viser feilmelding når AFP ikke er valgt', async ({ page }) => {
				await setupDefaultMocks(page)
				await navigateToApp(page)

				await page.getByTestId('eps-har-pensjon').getByLabel('Nei').check()
				await page.getByTestId('inntekt-foer-uttak').fill('500000')
				await page.getByTestId('alder-uttak-aar').selectOption('67')
				await page.getByTestId('alder-uttak-md').selectOption('3')
				await page.getByTestId('uttaksgrad').selectOption('100')
				await page.getByTestId('beregn-button').click()

				await expect(
					page.getByText('Velg om AFP skal inkluderes.')
				).toBeVisible()
			})

			test('fjerner feilmelding når AFP velges', async ({ page }) => {
				await setupDefaultMocks(page)
				await navigateToApp(page)

				await page.getByTestId('eps-har-pensjon').getByLabel('Nei').check()
				await page.getByTestId('inntekt-foer-uttak').fill('500000')
				await page.getByTestId('alder-uttak-aar').selectOption('67')
				await page.getByTestId('alder-uttak-md').selectOption('3')
				await page.getByTestId('uttaksgrad').selectOption('100')
				await page.getByTestId('beregn-button').click()

				await expect(
					page.getByText('Velg om AFP skal inkluderes.')
				).toBeVisible()

				await page.getByTestId('afp').getByLabel('Ja, privat').check()
				await page.getByTestId('beregn-button').click()

				await expect(
					page.getByText('Velg om AFP skal inkluderes.')
				).not.toBeVisible()
			})
		})

		test.describe('Beregning med 100 % uttak', () => {
			test('viser beregningsresultat med AFP privat', async ({ page }) => {
				await setupDefaultMocks(page)
				await setupSimuleringMockWithAfpPrivat(page)
				await navigateToApp(page)

				await fillFormWithAfpPrivat(page)
				await page.getByTestId('beregn-button').click()

				await expect(page.getByTestId('beregning-section-helt')).toBeVisible()
			})

			test('viser AFP-tabell i beregningsresultat', async ({ page }) => {
				await setupDefaultMocks(page)
				await setupSimuleringMockWithAfpPrivat(page)
				await navigateToApp(page)

				await fillFormWithAfpPrivat(page)
				await page.getByTestId('beregn-button').click()

				await expect(
					page.getByTestId('beregning-section-helt-afp')
				).toBeVisible()
			})

			test('viser AFP i privat sektor i resultattabellen', async ({ page }) => {
				await setupDefaultMocks(page)
				await setupSimuleringMockWithAfpPrivat(page)
				await navigateToApp(page)

				await fillFormWithAfpPrivat(page)
				await page.getByTestId('beregn-button').click()

				await expect(
					page
						.getByTestId('beregning-section-helt-afp')
						.getByText('AFP i privat sektor')
				).toBeVisible()
			})

			test('viser Alderspensjon og AFP sum i resultattabellen', async ({
				page,
			}) => {
				await setupDefaultMocks(page)
				await setupSimuleringMockWithAfpPrivat(page)
				await navigateToApp(page)

				await fillFormWithAfpPrivat(page)
				await page.getByTestId('beregn-button').click()

				await expect(
					page
						.getByTestId('beregning-section-helt-afp')
						.getByText('Alderspensjon og AFP')
				).toBeVisible()
			})

			test('viser Livsvarig del i AFP-tabell', async ({ page }) => {
				await setupDefaultMocks(page)
				await setupSimuleringMockWithAfpPrivat(page)
				await navigateToApp(page)

				await fillFormWithAfpPrivat(page)
				await page.getByTestId('beregn-button').click()

				await expect(
					page
						.getByTestId('beregning-section-helt-afp')
						.getByText('Livsvarig del')
				).toBeVisible()
			})
		})

		test.describe('Beregning med gradert uttak', () => {
			test('viser AFP-tabell for gradert uttak', async ({ page }) => {
				await setupDefaultMocks(page)
				await setupSimuleringMockWithAfpPrivatGradert(page)
				await navigateToApp(page)

				await page.getByTestId('eps-har-pensjon').getByLabel('Nei').check()
				await page
					.getByTestId('eps-har-inntekt-over-2g')
					.getByLabel('Ja')
					.check()
				await page
					.getByTestId('har-opphold-utenfor-norge')
					.getByLabel('Nei')
					.check()
				await page.getByTestId('afp').getByLabel('Ja, privat').check()
				await page.getByTestId('inntekt-foer-uttak').fill('500000')
				await page.getByTestId('alder-uttak-aar').selectOption('67')
				await page.getByTestId('alder-uttak-md').selectOption('3')
				await page.getByTestId('uttaksgrad').selectOption('60')
				await page.getByTestId('inntekt-vsa-gradert-uttak').fill('300000')
				await page.getByTestId('alder-helt-uttak-aar').selectOption('70')
				await page.getByTestId('alder-helt-uttak-md').selectOption('0')
				await page
					.getByTestId('har-inntekt-vsa-helt-uttak')
					.getByLabel('Nei')
					.check()
				await page.getByTestId('beregn-button').click()

				await expect(
					page.getByTestId('beregning-section-gradert-afp')
				).toBeVisible()
			})

			test('viser AFP-tabell for helt uttak ved gradert beregning', async ({
				page,
			}) => {
				await setupDefaultMocks(page)
				await setupSimuleringMockWithAfpPrivatGradert(page)
				await navigateToApp(page)

				await page.getByTestId('eps-har-pensjon').getByLabel('Nei').check()
				await page
					.getByTestId('eps-har-inntekt-over-2g')
					.getByLabel('Ja')
					.check()
				await page
					.getByTestId('har-opphold-utenfor-norge')
					.getByLabel('Nei')
					.check()
				await page.getByTestId('afp').getByLabel('Ja, privat').check()
				await page.getByTestId('inntekt-foer-uttak').fill('500000')
				await page.getByTestId('alder-uttak-aar').selectOption('67')
				await page.getByTestId('alder-uttak-md').selectOption('3')
				await page.getByTestId('uttaksgrad').selectOption('60')
				await page.getByTestId('inntekt-vsa-gradert-uttak').fill('300000')
				await page.getByTestId('alder-helt-uttak-aar').selectOption('70')
				await page.getByTestId('alder-helt-uttak-md').selectOption('0')
				await page
					.getByTestId('har-inntekt-vsa-helt-uttak')
					.getByLabel('Nei')
					.check()
				await page.getByTestId('beregn-button').click()

				await expect(
					page.getByTestId('beregning-section-helt-afp')
				).toBeVisible()
			})
		})

		test.describe('Beregning uten AFP', () => {
			test('viser ikke AFP-tabell når AFP er Nei', async ({ page }) => {
				await setupDefaultMocks(page)
				await setupSimuleringMockWithoutAfp(page)
				await navigateToApp(page)

				await page.getByTestId('eps-har-pensjon').getByLabel('Nei').check()
				await page
					.getByTestId('eps-har-inntekt-over-2g')
					.getByLabel('Ja')
					.check()
				await page
					.getByTestId('har-opphold-utenfor-norge')
					.getByLabel('Nei')
					.check()
				await page.getByTestId('afp').getByLabel('Nei').check()
				await page.getByTestId('inntekt-foer-uttak').fill('500000')
				await page.getByTestId('alder-uttak-aar').selectOption('67')
				await page.getByTestId('alder-uttak-md').selectOption('3')
				await page.getByTestId('uttaksgrad').selectOption('100')
				await page
					.getByTestId('har-inntekt-vsa-helt-uttak')
					.getByLabel('Nei')
					.check()
				await page.getByTestId('beregn-button').click()

				await expect(page.getByTestId('beregning-section-helt')).toBeVisible()
				await expect(
					page.getByTestId('beregning-section-helt-afp')
				).not.toBeVisible()
			})
		})

		test.describe('Nullstilling', () => {
			test('nullstiller AFP-valg når nullstill-knappen trykkes', async ({
				page,
			}) => {
				await setupDefaultMocks(page)
				await navigateToApp(page)

				await page.getByTestId('afp').getByLabel('Ja, privat').check()

				await expect(
					page.getByTestId('afp').getByLabel('Ja, privat')
				).toBeChecked()

				await page.getByTestId('nullstill-button').click()

				await expect(
					page.getByTestId('afp').getByLabel('Ja, privat')
				).not.toBeChecked()
				await expect(
					page.getByTestId('afp').getByLabel('Nei')
				).not.toBeChecked()
			})
		})
	})
})
