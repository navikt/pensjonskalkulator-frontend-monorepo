import { type Page, expect, test } from '@playwright/test'

import { loadJSONMock, mockApi } from '../utils/mock'
import {
	API_URLS,
	MOCK_FILES,
	navigateToApp,
	setupDefaultMocks,
} from '../utils/test-helpers'

function createSanityAlertResponse(alertName: string) {
	return {
		result: [
			{
				name: alertName,
				type: 'local-alert',
				status: 'warning',
				overskrift: 'Ikke nok opptjening',
				innhold: [
					{
						_type: 'block',
						style: 'normal',
						children: [
							{
								_type: 'span',
								text: 'Du har ikke nok opptjening til å ta ut ',
							},
							{
								_type: 'dynamicValue',
								key: 'grad',
							},
							{
								_type: 'span',
								text: ' % alderspensjon fra ',
							},
							{
								_type: 'dynamicValue',
								key: 'alder',
							},
						],
					},
				],
			},
			{
				name: 'beregning.vilkaarsproeving.ikke_nok_opptjening_gradert',
				type: 'local-alert',
				status: 'warning',
				overskrift: 'Ikke nok opptjening',
				innhold: [
					{
						_type: 'block',
						style: 'normal',
						children: [
							{
								_type: 'span',
								text: 'Tidligste mulige uttak er ',
							},
							{
								_type: 'dynamicValue',
								key: 'grad_gradert',
							},
							{
								_type: 'span',
								text: ' % fra ',
							},
							{
								_type: 'dynamicValue',
								key: 'gradert_alder',
							},
							{
								_type: 'span',
								text: ' og 100 % fra ',
							},
							{
								_type: 'dynamicValue',
								key: 'alder',
							},
						],
					},
				],
			},
		],
	}
}

async function setupSanityMock(page: Page) {
	await page.route(API_URLS.SANITY, (route) =>
		route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(
				createSanityAlertResponse(
					'beregning.vilkaarsproeving.ikke_nok_opptjening'
				)
			),
		})
	)
}

async function setupSimuleringMockWithNau(
	page: Page,
	options: {
		heltUttakAlder: { aar: number; maaneder: number }
		gradertUttakAlder?: { aar: number; maaneder: number }
		uttaksgrad?: number
	}
) {
	const baseMock = (await loadJSONMock(MOCK_FILES.SIMULERING_V1)) as Record<
		string,
		unknown
	>

	const body = JSON.stringify({
		...baseMock,
		vilkaarsproevingsresultat: {
			erInnvilget: false,
			alternativ: {
				heltUttakAlder: options.heltUttakAlder,
				...(options.gradertUttakAlder
					? {
							gradertUttakAlder: options.gradertUttakAlder,
							uttaksgrad: options.uttaksgrad ?? 60,
						}
					: {}),
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

async function setupSimuleringMockInnvilget(page: Page) {
	await mockApi(page, API_URLS.SIMULERING, MOCK_FILES.SIMULERING_V1)
}

async function fillForm(
	page: Page,
	options?: {
		uttaksgrad?: string
		alderAar?: string
		alderMd?: string
		heltUttakAar?: string
		heltUttakMd?: string
	}
) {
	const { uttaksgrad = '100', alderAar = '62', alderMd = '3' } = options ?? {}

	await page.getByTestId('eps-har-pensjon').getByLabel('Nei').check()
	await page.getByTestId('eps-har-inntekt-over-2g').getByLabel('Ja').check()
	await page.getByTestId('har-opphold-utenfor-norge').getByLabel('Nei').check()
	await page.getByTestId('afp').getByLabel('Nei').check()
	await page.getByTestId('inntekt-foer-uttak').fill('500000')
	await page.getByTestId('alder-uttak-aar').selectOption(alderAar)
	await page.getByTestId('alder-uttak-md').selectOption(alderMd)
	await page.getByTestId('uttaksgrad').selectOption(uttaksgrad)
	await page.getByTestId('har-inntekt-vsa-helt-uttak').getByLabel('Nei').check()

	if (options?.heltUttakAar) {
		await page
			.getByTestId('alder-helt-uttak-aar')
			.selectOption(options.heltUttakAar)
		await page
			.getByTestId('alder-helt-uttak-md')
			.selectOption(options.heltUttakMd ?? '0')
	}
}

test.describe('Ikke nok opptjening (NAU)', () => {
	test.describe('100 % uttak', () => {
		test('viser vilkårsprøving-alert når erInnvilget er false', async ({
			page,
		}) => {
			await setupDefaultMocks(page)
			await setupSanityMock(page)
			await setupSimuleringMockWithNau(page, {
				heltUttakAlder: { aar: 67, maaneder: 0 },
			})
			await navigateToApp(page)

			await fillForm(page)
			await page.getByTestId('beregn-button').click()

			await expect(page.getByTestId('vilkaarsproeving-alert')).toBeVisible()
		})

		test('viser alternativ alder i alert', async ({ page }) => {
			await setupDefaultMocks(page)
			await setupSanityMock(page)
			await setupSimuleringMockWithNau(page, {
				heltUttakAlder: { aar: 67, maaneder: 3 },
			})
			await navigateToApp(page)

			await fillForm(page)
			await page.getByTestId('beregn-button').click()

			const alert = page.getByTestId('vilkaarsproeving-alert')
			await expect(alert).toBeVisible()
			await expect(alert).toContainText('67')
		})

		test('viser ikke alert når vilkårsprøving er innvilget', async ({
			page,
		}) => {
			await setupDefaultMocks(page)
			await setupSanityMock(page)
			await setupSimuleringMockInnvilget(page)
			await navigateToApp(page)

			await fillForm(page, { alderAar: '67', alderMd: '3' })
			await page.getByTestId('beregn-button').click()

			await expect(page.getByTestId('vilkaarsproeving-alert')).not.toBeVisible()
		})
	})

	test.describe('Gradert uttak', () => {
		test('viser vilkårsprøving-alert med gradert alternativ', async ({
			page,
		}) => {
			await setupDefaultMocks(page)
			await setupSanityMock(page)
			await setupSimuleringMockWithNau(page, {
				heltUttakAlder: { aar: 70, maaneder: 0 },
				gradertUttakAlder: { aar: 67, maaneder: 0 },
				uttaksgrad: 60,
			})
			await navigateToApp(page)

			await fillForm(page, {
				uttaksgrad: '60',
				alderAar: '62',
				alderMd: '3',
				heltUttakAar: '67',
				heltUttakMd: '0',
			})
			await page.getByTestId('inntekt-vsa-gradert-uttak').fill('300000')
			await page.getByTestId('beregn-button').click()

			await expect(page.getByTestId('vilkaarsproeving-alert')).toBeVisible()
		})

		test('viser gradert-spesifikk alert når alternativ heltUttakAlder avviker fra valgt', async ({
			page,
		}) => {
			await setupDefaultMocks(page)
			await setupSanityMock(page)
			await setupSimuleringMockWithNau(page, {
				heltUttakAlder: { aar: 70, maaneder: 0 },
				gradertUttakAlder: { aar: 67, maaneder: 0 },
				uttaksgrad: 60,
			})
			await navigateToApp(page)

			await fillForm(page, {
				uttaksgrad: '60',
				alderAar: '62',
				alderMd: '3',
				heltUttakAar: '65',
				heltUttakMd: '0',
			})
			await page.getByTestId('inntekt-vsa-gradert-uttak').fill('300000')
			await page.getByTestId('beregn-button').click()

			const alert = page.getByTestId('vilkaarsproeving-alert')
			await expect(alert).toBeVisible()
			await expect(alert).toContainText('67')
			await expect(alert).toContainText('70')
		})
	})

	test.describe('Alert-oppførsel', () => {
		test('alert forsvinner når bruker trykker Nullstill', async ({ page }) => {
			await setupDefaultMocks(page)
			await setupSanityMock(page)
			await setupSimuleringMockWithNau(page, {
				heltUttakAlder: { aar: 67, maaneder: 0 },
			})
			await navigateToApp(page)

			await fillForm(page)
			await page.getByTestId('beregn-button').click()

			await expect(page.getByTestId('vilkaarsproeving-alert')).toBeVisible()

			await page.getByTestId('nullstill-button').click()

			await expect(page.getByTestId('vilkaarsproeving-alert')).not.toBeVisible()
		})

		test('alert vises ikke uten beregning', async ({ page }) => {
			await setupDefaultMocks(page)
			await setupSanityMock(page)
			await navigateToApp(page)

			await expect(page.getByTestId('vilkaarsproeving-alert')).not.toBeVisible()
		})
	})
})
