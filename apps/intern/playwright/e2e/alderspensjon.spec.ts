import { type Page, expect, test } from '@playwright/test'

import { mockApi } from '../utils/mock'
import {
	API_URLS,
	MOCK_FILES,
	fillMainFormFields,
	navigateToApp,
	setupDefaultMocks,
} from '../utils/test-helpers'

async function submitAndExpectSimulering(page: Page) {
	const simuleringResponse = page.waitForResponse(
		(response) =>
			response.url().includes('/api/intern/v1/pensjon/simulering') &&
			response.request().method() === 'POST'
	)

	await page.getByTestId('beregn-button').click()

	const response = await simuleringResponse
	expect(response.ok()).toBeTruthy()
}

async function setupLoependeAlderspensjonFoerEndringsfrist(page: Page) {
	await setupDefaultMocks(page)
	await mockApi(page, API_URLS.VEDTAK, MOCK_FILES.VEDTAK, {
		loependeAlderspensjon: {
			grad: 100,
			uttaksgradFom: '2031-01-01',
		},
	})
}

async function fillEndringAvUttaksgradFoerEndringsfrist(page: Page) {
	await fillMainFormFields({
		page,
		withDefaults: false,
		fields: {
			afp: 'Nei',
			'inntekt-foer-uttak': '500000',
			'alder-uttak-aar': '67',
			'alder-uttak-md': '3',
			uttaksgrad: '60',
			'inntekt-vsa-gradert-uttak': '300000',
			'alder-helt-uttak-aar': '70',
			'alder-helt-uttak-md': '0',
			'har-inntekt-vsa-helt-uttak': 'Nei',
		},
	})
}

function trackSimuleringRequests(page: Page) {
	let simuleringRequests = 0
	page.on('request', (request) => {
		if (
			request.method() === 'POST' &&
			request.url().includes('/api/intern/v1/pensjon/simulering')
		) {
			simuleringRequests += 1
		}
	})
	return () => simuleringRequests
}

test.describe('Alderspensjon beregning', () => {
	test.describe('Skjema visning', () => {
		test('viser beregningsskjema med alle hovedfelter', async ({ page }) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)

			await expect(page.getByTestId('sivilstatus-select')).toBeVisible()
			await expect(page.getByTestId('afp')).toBeVisible()
			await page.getByTestId('afp').getByLabel('Nei').check()
			await expect(page.getByTestId('inntekt-foer-uttak')).toBeVisible()
			await expect(page.getByTestId('alder-uttak-aar')).toBeVisible()
			await expect(page.getByTestId('alder-uttak-md')).toBeVisible()
			await expect(page.getByTestId('uttaksgrad')).toBeVisible()
			await expect(page.getByTestId('beregn-button')).toBeVisible()
			await expect(page.getByTestId('nullstill-button')).toBeVisible()
		})

		test('forhåndsutfyller sivilstatus fra persondata', async ({ page }) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)

			await expect(page.getByTestId('sivilstatus-select')).toHaveValue('GIFT')
		})

		test('forhåndsutfyller inntekt fra inntektsdata', async ({ page }) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)

			await page.getByTestId('afp').getByLabel('Nei').check()
			await expect(page.getByTestId('inntekt-foer-uttak')).toHaveValue(
				'521\u00A0338'
			)
		})
	})

	test.describe('Sivilstand og EPS-felter', () => {
		test('viser EPS-felter når sivilstatus er GIFT', async ({ page }) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)

			await expect(page.getByTestId('eps-har-pensjon')).toBeVisible()
		})

		test('skjuler EPS-felter når sivilstatus er UGIFT', async ({ page }) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)

			await page.getByTestId('sivilstatus-select').selectOption('UGIFT')

			await expect(page.getByTestId('eps-har-pensjon')).not.toBeVisible()
		})

		test('viser EPS inntekt-felt når partner har pensjon', async ({ page }) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)

			await page.getByTestId('eps-har-pensjon').getByLabel('Nei').check()

			await expect(page.getByTestId('eps-har-inntekt-over-2g')).toBeVisible()
		})

		test('skjuler EPS inntekt-felt når partner ikke har pensjon', async ({
			page,
		}) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)

			await page.getByTestId('eps-har-pensjon').getByLabel('Ja').check()

			await expect(
				page.getByTestId('eps-har-inntekt-over-2g')
			).not.toBeVisible()
		})
	})

	test.describe('Uttaksgrad og gradert uttak', () => {
		test('viser gradert uttak-felter ved 60 % uttaksgrad', async ({ page }) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)

			await page.getByTestId('afp').getByLabel('Nei').check()
			await page.getByTestId('uttaksgrad').selectOption('60')

			await expect(page.getByTestId('inntekt-vsa-gradert-uttak')).toBeVisible()
			await expect(page.getByTestId('alder-helt-uttak-aar')).toBeVisible()
			await expect(page.getByTestId('alder-helt-uttak-md')).toBeVisible()
		})

		test('skjuler gradert uttak-felter ved 100 % uttaksgrad', async ({
			page,
		}) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)

			await page.getByTestId('afp').getByLabel('Nei').check()
			await page.getByTestId('uttaksgrad').selectOption('100')

			await expect(
				page.getByTestId('inntekt-vsa-gradert-uttak')
			).not.toBeVisible()
			await expect(page.getByTestId('alder-helt-uttak-aar')).not.toBeVisible()
		})

		test('viser inntekt ved siden av 100 % uttak når valgt', async ({
			page,
		}) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)

			await page.getByTestId('afp').getByLabel('Nei').check()
			await page.getByTestId('uttaksgrad').selectOption('100')
			await page
				.getByTestId('har-inntekt-vsa-helt-uttak')
				.getByLabel('Ja')
				.check()

			await expect(page.getByTestId('inntekt-vsa-helt-uttak')).toBeVisible()
			await expect(page.getByTestId('alder-inntekt-slutter-aar')).toBeVisible()
			await expect(page.getByTestId('alder-inntekt-slutter-md')).toBeVisible()
		})

		test('skjuler inntekt-felter når bruker ikke har inntekt ved 100 %', async ({
			page,
		}) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)

			await page.getByTestId('afp').getByLabel('Nei').check()
			await page.getByTestId('uttaksgrad').selectOption('100')
			await page
				.getByTestId('har-inntekt-vsa-helt-uttak')
				.getByLabel('Nei')
				.check()

			await expect(page.getByTestId('inntekt-vsa-helt-uttak')).not.toBeVisible()
			await expect(
				page.getByTestId('alder-inntekt-slutter-aar')
			).not.toBeVisible()
		})
	})

	test.describe('Validering', () => {
		test('viser feilmelding når alder for uttak mangler', async ({ page }) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)

			await page.getByTestId('afp').getByLabel('Nei').check()
			await page.getByTestId('uttaksgrad').selectOption('100')
			await page.getByTestId('beregn-button').click()

			await expect(page.getByText('Velg år og måned for uttak.')).toBeVisible()
		})

		test('viser feilmelding når uttaksgrad mangler', async ({ page }) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)

			await page.getByTestId('afp').getByLabel('Nei').check()
			await page
				.getByTestId('alder-uttak-aar')

				.selectOption('67')
			await page
				.getByTestId('alder-uttak-md')

				.selectOption('3')
			await page.getByTestId('beregn-button').click()

			await expect(page.getByText('Velg uttaksgrad.')).toBeVisible()
		})

		test('viser feilmelding når AFP mangler', async ({ page }) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)

			await page.getByTestId('beregn-button').click()

			await expect(page.getByText('Velg om AFP skal inkluderes.')).toBeVisible()
		})

		test('viser feilmelding når EPS pensjon mangler for gift person', async ({
			page,
		}) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)

			await fillMainFormFields({ page })
			await page.getByTestId('beregn-button').click()

			await expect(
				page.getByText(/fyll ut om .* mottar pensjon/i)
			).toBeVisible()
		})

		test('viser feilmelding når gradert uttak mangler alder for 100 %', async ({
			page,
		}) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)

			await page.getByTestId('eps-har-pensjon').getByLabel('Nei').check()
			await page.getByTestId('afp').getByLabel('Nei').check()
			await page
				.getByTestId('inntekt-foer-uttak')

				.fill('500000')
			await page
				.getByTestId('alder-uttak-aar')

				.selectOption('67')
			await page
				.getByTestId('alder-uttak-md')

				.selectOption('3')
			await page.getByTestId('uttaksgrad').selectOption('60')
			await page.getByTestId('beregn-button').click()

			await expect(
				page.getByText('Velg år og måned for 100 % uttak.')
			).toBeVisible()
		})

		test('viser feilmelding når helt uttak alder er før gradert uttak alder', async ({
			page,
		}) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)

			await page.getByTestId('eps-har-pensjon').getByLabel('Nei').check()
			await page.getByTestId('afp').getByLabel('Nei').check()
			await page
				.getByTestId('inntekt-foer-uttak')

				.fill('500000')
			await page
				.getByTestId('alder-uttak-aar')

				.selectOption('63')
			await page
				.getByTestId('alder-uttak-md')

				.selectOption('3')
			await page.getByTestId('uttaksgrad').selectOption('60')
			await page
				.getByTestId('inntekt-vsa-gradert-uttak')

				.fill('300000')
			await page
				.getByTestId('alder-helt-uttak-aar')

				.selectOption('64')
			await page.getByTestId('alder-helt-uttak-md').selectOption('0')
			await page
				.getByTestId('alder-uttak-aar')

				.selectOption('68')
			await page.getByTestId('beregn-button').click()

			await expect(
				page.getByText(
					/uttaksalder for 100 % alderspensjon må være senere enn alder for gradert pensjon/i
				)
			).toBeVisible()
		})

		test('viser Sanity-varsel når løpende alderspensjon endres til annen grad før 12 måneder', async ({
			page,
		}) => {
			await setupLoependeAlderspensjonFoerEndringsfrist(page)
			await navigateToApp(page)
			await fillEndringAvUttaksgradFoerEndringsfrist(page)
			const getSimuleringRequestCount = trackSimuleringRequests(page)

			await page.getByTestId('beregn-button').click()

			await expect(page.getByText('Ugyldig uttaksgrad')).toBeVisible()
			await expect(
				page.getByText(
					'Uttaksgrad kan tidligst endres til 20, 40, 50, 60 eller 80 % fra 01.01.2032.'
				)
			).toBeVisible()
			expect(getSimuleringRequestCount()).toBe(0)
		})

		test('viser feilmelding når inntekt mangler', async ({ page }) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)

			await page.getByTestId('eps-har-pensjon').getByLabel('Nei').check()
			await page.getByTestId('afp').getByLabel('Nei').check()
			await page.getByTestId('inntekt-foer-uttak').clear()
			await page
				.getByTestId('alder-uttak-aar')

				.selectOption('67')
			await page
				.getByTestId('alder-uttak-md')

				.selectOption('3')
			await page.getByTestId('uttaksgrad').selectOption('100')
			await page.getByTestId('beregn-button').click()

			await expect(page.getByText('Fyll ut inntekt.')).toBeVisible()
		})

		test('viser feilmelding når inntekt-slutter alder mangler', async ({
			page,
		}) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)

			await page.getByTestId('eps-har-pensjon').getByLabel('Nei').check()
			await page.getByTestId('afp').getByLabel('Nei').check()
			await page
				.getByTestId('inntekt-foer-uttak')

				.fill('500000')
			await page
				.getByTestId('alder-uttak-aar')

				.selectOption('67')
			await page
				.getByTestId('alder-uttak-md')

				.selectOption('3')
			await page.getByTestId('uttaksgrad').selectOption('100')
			await page
				.getByTestId('har-inntekt-vsa-helt-uttak')
				.getByLabel('Ja')
				.check()
			await page
				.getByTestId('inntekt-vsa-helt-uttak')

				.fill('300000')
			await page.getByTestId('beregn-button').click()

			await expect(
				page.getByText('Velg år og måned for når inntekt slutter.')
			).toBeVisible()
		})
	})

	test.describe('Innsending', () => {
		test('sender beregning med 100 % uttak', async ({ page }) => {
			await setupDefaultMocks(page)
			await mockApi(page, API_URLS.SIMULERING, 'alderspensjon.json')
			await navigateToApp(page)

			await fillMainFormFields({
				page,
				fields: {
					'eps-har-pensjon': 'Nei',
					'eps-har-inntekt-over-2g': 'Nei',
				},
			})
			await submitAndExpectSimulering(page)
		})

		test('sender beregning med gradert uttak', async ({ page }) => {
			await setupDefaultMocks(page)
			await mockApi(page, API_URLS.SIMULERING, 'alderspensjon.json')
			await navigateToApp(page)

			await fillMainFormFields({
				page,
				fields: {
					'eps-har-pensjon': 'Nei',
					'eps-har-inntekt-over-2g': 'Nei',
					uttaksgrad: '60',
					'inntekt-vsa-gradert-uttak': '300000',
					'alder-helt-uttak-aar': '70',
					'alder-helt-uttak-md': '0',
				},
			})
			await submitAndExpectSimulering(page)
		})

		test('sender beregning med partner uten pensjon og inntekt over 2G', async ({
			page,
		}) => {
			await setupDefaultMocks(page)
			await mockApi(page, API_URLS.SIMULERING, 'alderspensjon.json')
			await navigateToApp(page)

			await fillMainFormFields({
				page,
				fields: {
					'eps-har-pensjon': 'Nei',
					'eps-har-inntekt-over-2g': 'Ja',
				},
			})
			await submitAndExpectSimulering(page)
		})

		test('sender beregning med inntekt ved siden av 100 % uttak', async ({
			page,
		}) => {
			await setupDefaultMocks(page)
			await mockApi(page, API_URLS.SIMULERING, 'alderspensjon.json')
			await navigateToApp(page)

			await fillMainFormFields({
				page,
				fields: {
					'eps-har-pensjon': 'Nei',
					'eps-har-inntekt-over-2g': 'Nei',
					'har-inntekt-vsa-helt-uttak': 'Ja',
					'inntekt-vsa-helt-uttak': '200000',
					'alder-inntekt-slutter-aar': '72',
					'alder-inntekt-slutter-md': '0',
				},
			})
			await submitAndExpectSimulering(page)
		})

		test('sender beregning med AFP privat', async ({ page }) => {
			await setupDefaultMocks(page)
			await mockApi(page, API_URLS.SIMULERING, 'alderspensjon.json')
			await navigateToApp(page)

			await fillMainFormFields({
				page,
				fields: {
					'eps-har-pensjon': 'Nei',
					'eps-har-inntekt-over-2g': 'Nei',
					afp: 'Ja, privat',
				},
			})
			await submitAndExpectSimulering(page)
		})
	})

	test.describe('Nullstilling', () => {
		test('nullstiller skjemaet når nullstill-knappen trykkes', async ({
			page,
		}) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)

			await page.getByTestId('afp').getByLabel('Nei').check()
			await page
				.getByTestId('inntekt-foer-uttak')

				.fill('600000')
			await page
				.getByTestId('alder-uttak-aar')

				.selectOption('67')
			await page
				.getByTestId('alder-uttak-md')

				.selectOption('3')
			await page.getByTestId('uttaksgrad').selectOption('100')

			await page.getByTestId('nullstill-button').click()

			await expect(page.getByTestId('uttaksgrad')).not.toBeVisible()
			await expect(page.getByTestId('alder-uttak-aar')).not.toBeVisible()
			await expect(page.getByTestId('alder-uttak-md')).not.toBeVisible()
		})

		test('tømmer inntekt-feltet etter nullstilling', async ({ page }) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)

			await page.getByTestId('afp').getByLabel('Nei').check()
			await page
				.getByTestId('inntekt-foer-uttak')

				.fill('600000')
			await page.getByTestId('nullstill-button').click()

			await expect(page.getByTestId('inntekt-foer-uttak')).not.toBeVisible()
		})

		test('nullstiller sivilstatus til opprinnelig verdi', async ({ page }) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)

			await page
				.getByTestId('sivilstatus-select')

				.selectOption('UGIFT')
			await page.getByTestId('nullstill-button').click()

			await expect(page.getByTestId('sivilstatus-select')).toHaveValue('GIFT')
		})
	})

	test.describe('Alder-velger', () => {
		test('har riktige aldersalternativer basert på person', async ({
			page,
		}) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)

			await page.getByTestId('afp').getByLabel('Nei').check()
			const aarSelect = page.getByTestId('alder-uttak-aar')
			const options = aarSelect.locator('option')

			const allOptions = await options.allTextContents()
			const numericOptions = allOptions.filter((o) => o !== '')

			expect(numericOptions.length).toBeGreaterThan(0)
			expect(numericOptions).toContain('62 år')
			expect(numericOptions).toContain('75 år')
		})

		test('måned-velger har 12 alternativer pluss tom', async ({ page }) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)

			await page.getByTestId('afp').getByLabel('Nei').check()
			await page.getByTestId('alder-uttak-aar').selectOption('67')

			const mdSelect = page.getByTestId('alder-uttak-md')
			const options = mdSelect.locator('option')

			const allOptions = await options.allTextContents()
			expect(allOptions).toHaveLength(12)
		})
	})

	test.describe('Partner-betegnelse', () => {
		test('viser ektefelle for GIFT sivilstatus', async ({ page }) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)

			await expect(
				page.getByTestId('eps-har-pensjon').locator('legend')
			).toContainText(/ektefelle/i)
		})

		test('viser samboer for SAMBOER sivilstatus', async ({ page }) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)

			await page
				.getByTestId('sivilstatus-select')

				.selectOption('SAMBOER')

			await expect(
				page.getByTestId('eps-har-pensjon').locator('legend')
			).toContainText(/samboer/i)
		})

		test('viser partner for REGISTRERT_PARTNER sivilstatus', async ({
			page,
		}) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)

			await page
				.getByTestId('sivilstatus-select')

				.selectOption('REGISTRERT_PARTNER')

			await expect(
				page.getByTestId('eps-har-pensjon').locator('legend')
			).toContainText(/partner/i)
		})
	})

	test.describe('Fremtidig alderspensjon alert', () => {
		async function setupFremtidigVedtak(page: Page, grad: number) {
			await setupDefaultMocks(page)
			await mockApi(page, API_URLS.VEDTAK, MOCK_FILES.VEDTAK, {
				loependeAlderspensjon: {
					grad: 100,
					fom: '2025-05-01',
					uttaksgradFom: '2025-05-01',
					sivilstatus: 'ENKE_ELLER_ENKEMANN',
				},
				fremtidigAlderspensjon: {
					grad,
					fom: '2031-05-01',
				},
			})
		}

		test('viser alert med vedtakdato og tidligst endring en måned etter for grad > 0', async ({
			page,
		}) => {
			await setupFremtidigVedtak(page, 100)
			await navigateToApp(page)

			await page.getByTestId('afp').getByLabel('Nei').check()
			await page.getByTestId('alder-uttak-aar').selectOption('67')
			await page.getByTestId('alder-uttak-md').selectOption('0')

			const alert = page.getByTestId('beregning.fremtidigAlderspensjon')
			await expect(alert).toBeVisible()
			await expect(alert).toContainText('01.05.2031')
			await expect(alert).toContainText('01.06.2031')
		})

		test('viser alert med tidligst endring en måned etter for grad 0 uten AFP offentlig', async ({
			page,
		}) => {
			await setupFremtidigVedtak(page, 0)
			await navigateToApp(page)

			await page.getByTestId('afp').getByLabel('Nei').check()
			await page.getByTestId('alder-uttak-aar').selectOption('66')
			await page.getByTestId('alder-uttak-md').selectOption('11')

			const alert = page.getByTestId('beregning.fremtidigAlderspensjon')
			await expect(alert).toBeVisible()
			await expect(alert).toContainText('01.05.2031')
			await expect(alert).toContainText('01.06.2031')
		})

		test('viser alert med begge datoer lik vedtakdato for grad 0 med AFP offentlig', async ({
			page,
		}) => {
			await setupFremtidigVedtak(page, 0)
			await mockApi(page, API_URLS.PERSON, MOCK_FILES.PERSON, {
				foedselsdato: '1960-04-30',
			})
			await navigateToApp(page)

			await page.getByTestId('afp').getByLabel('Ja, offentlig').check()
			await page.getByTestId('alder-uttak-aar').selectOption('66')
			await page.getByTestId('alder-uttak-md').selectOption('11')

			const alert = page.getByTestId('beregning.fremtidigAlderspensjon')
			await expect(alert).toBeVisible()
			const vedtakDatoCount = await alert.getByText('01.05.2031').count()
			expect(vedtakDatoCount).toBe(2)
		})

		test('viser ikke alert ved serviceberegning', async ({ page }) => {
			await setupFremtidigVedtak(page, 100)
			await mockApi(page, API_URLS.PERSON, MOCK_FILES.PERSON, {
				foedselsdato: '1960-04-30',
			})
			await navigateToApp(page)

			await page
				.getByTestId('afp')
				.getByLabel('Serviceberegning AFP for saksbehandler')
				.check()
			await page.getByTestId('alder-uttak-aar').selectOption('63')
			await page.getByTestId('alder-uttak-md').selectOption('0')

			await expect(
				page.getByTestId('beregning.fremtidigAlderspensjon')
			).not.toBeVisible()
		})
	})
})
