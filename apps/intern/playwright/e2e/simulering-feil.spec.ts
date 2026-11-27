import { expect, test } from '@playwright/test'

import { mockApi, mockApiError } from '../utils/mock'
import {
	API_URLS,
	MOCK_FILES,
	fillMainFormFields,
	navigateToApp,
	setupDefaultMocks,
} from '../utils/test-helpers'

test.describe('Simulering error', () => {
	test('viser avslag ved utilstrekkelig trygdetid over uttaksalder og fjerner varselet ved innvilgelse', async ({
		page,
	}) => {
		await setupDefaultMocks(page, { sivilstatus: 'UGIFT' })
		await mockApi(page, API_URLS.SANITY, MOCK_FILES.SANITY_ALERT, {
			result: [
				{
					name: 'beregning.vilkaarsproeving.kan-ikke-beregne',
					type: 'local-alert',
					status: 'warning',
					innhold: [
						{
							_type: 'block',
							_key: 'tekst',
							style: 'normal',
							markDefs: [],
							children: [
								{
									_type: 'span',
									_key: 'span',
									text: 'Kan ikke beregne alderspensjon.',
									marks: [],
								},
							],
						},
					],
				},
			],
		})
		await mockApi(page, API_URLS.SIMULERING, undefined, {
			alderspensjonListe: [],
			maanedligAlderspensjonVedUttaksendring: {
				heltUttakMaanedligBeloep: 0,
			},
			livsvarigOffentligAfpListe: [],
			privatAfpListe: [],
			vilkaarsproevingsresultat: { erInnvilget: false },
			trygdetid: { antallAar: 0, erUtilstrekkelig: false },
			opptjeningListe: [],
			problem: {
				kode: 'UTILSTREKKELIG_TRYGDETID',
				beskrivelse: 'UtilstrekkeligTrygdetidException',
			},
		})
		await navigateToApp(page)
		await fillMainFormFields({
			page,
			fields: { 'alder-uttak-aar': '74', 'alder-uttak-md': '0' },
		})

		const alert = page.getByTestId(
			'beregning.vilkaarsproeving.kan-ikke-beregne'
		)
		await expect(alert).not.toBeVisible()
		await page.getByTestId('beregn-button').click()

		await expect(alert).toContainText('Kan ikke beregne alderspensjon.')
		expect(
			await alert.evaluate(
				(element, uttaksalder) =>
					Boolean(
						element.compareDocumentPosition(uttaksalder) &
						Node.DOCUMENT_POSITION_FOLLOWING
					),
				await page.getByTestId('alder-uttak-aar').elementHandle()
			)
		).toBe(true)

		await page.getByTestId('nullstill-button').click()
		await expect(alert).not.toBeVisible()
		await fillMainFormFields({
			page,
			fields: { 'alder-uttak-aar': '74', 'alder-uttak-md': '0' },
		})
		await expect(alert).not.toBeVisible()
		await page.getByTestId('beregn-button').click()
		await expect(alert).toBeVisible()

		await mockApi(page, API_URLS.SIMULERING, MOCK_FILES.SIMULERING_V1)
		await page.getByTestId('beregn-button').click()
		await expect(
			page.getByRole('tab', { name: 'Beregning', exact: true })
		).toBeVisible()
		await expect(alert).not.toBeVisible()
	})

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
