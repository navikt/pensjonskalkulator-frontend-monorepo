import { type Page, expect, test } from '@playwright/test'

import { mockApi } from '../utils/mock'

const DECRYPT_API_URL = '**/api/v1/decrypt'
const PERSON_API_URL = '**/api/intern/v1/person'
const LOEPENDE_VEDTAK_API_URL = '**/api/v4/vedtak/loepende-vedtak'
const INNTEKT_API_URL = '**/api/inntekt'
const GRUNNBELOEP_API_URL = '**/api/v1/grunnbel*'
const SIMULERING_API_URL = '**/api/intern/v1/pensjon/simulering'

async function setupDefaultMocks(page: Page) {
	await page.route(DECRYPT_API_URL, (route) =>
		route.fulfill({
			status: 200,
			contentType: 'text/plain',
			body: '04925398980',
		})
	)
	await mockApi(page, PERSON_API_URL, 'person-intern.json')
	await mockApi(page, LOEPENDE_VEDTAK_API_URL, 'loepende-vedtak.json')
	await mockApi(page, INNTEKT_API_URL, 'inntekt.json')
	await mockApi(page, GRUNNBELOEP_API_URL, undefined, {
		dato: '2024-05-01',
		grunnbeløp: 100000,
		grunnbeløpPerMaaned: 10000,
		gjennomsnittPerÅr: 99000,
		omregningsfaktor: 1.05,
		virkningstidspunktForMinsteinntekt: '2024-09-01',
	})
}

async function navigateToApp(page: Page) {
	await page.goto('/?pid=encrypted-default-pid')
	await page.waitForSelector('text=Pensjonskalkulator')
}

async function fillMainFormFields(page: Page) {
	await page.getByTestId('afp').getByLabel('Nei').check()
	await page.getByTestId('inntekt-foer-uttak').fill('500000')
	await page.getByTestId('alder-uttak-aar').selectOption('67')
	await page.getByTestId('alder-uttak-md').selectOption('3')
	await page.getByTestId('uttaksgrad').selectOption('100')
}

test.describe('Alderspensjon beregning', () => {
	test.describe('Skjema visning', () => {
		test('viser beregningsskjema med alle hovedfelter', async ({ page }) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)

			await expect(page.getByTestId('sivilstatus-select')).toBeVisible()
			await expect(page.getByTestId('afp')).toBeVisible()
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

			await page
				.getByTestId('alder-uttak-aar')

				.selectOption('67')
			await page
				.getByTestId('alder-uttak-md')

				.selectOption('3')
			await page.getByTestId('uttaksgrad').selectOption('100')
			await page.getByTestId('beregn-button').click()

			await expect(page.getByText('Velg om AFP skal inkluderes.')).toBeVisible()
		})

		test('viser feilmelding når EPS pensjon mangler for gift person', async ({
			page,
		}) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)

			await fillMainFormFields(page)
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

		test('viser feilmelding når inntekt mangler', async ({ page }) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)

			await page.getByTestId('inntekt-foer-uttak').clear()
			await page.getByTestId('eps-har-pensjon').getByLabel('Nei').check()
			await page.getByTestId('afp').getByLabel('Nei').check()
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
			await mockApi(page, SIMULERING_API_URL, 'alderspensjon.json')
			await navigateToApp(page)

			await page.getByTestId('eps-har-pensjon').getByLabel('Nei').check()
			await fillMainFormFields(page)
			await page.getByTestId('beregn-button').click()

			await expect(page.getByText('Beregning')).toBeVisible()
		})

		test('sender beregning med gradert uttak', async ({ page }) => {
			await setupDefaultMocks(page)
			await mockApi(page, SIMULERING_API_URL, 'alderspensjon.json')
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
			await page
				.getByTestId('inntekt-vsa-gradert-uttak')

				.fill('300000')
			await page
				.getByTestId('alder-helt-uttak-aar')

				.selectOption('70')
			await page
				.getByTestId('alder-helt-uttak-md')

				.selectOption('0')
			await page.getByTestId('beregn-button').click()

			await expect(page.getByText('Beregning')).toBeVisible()
		})

		test('sender beregning med partner som har pensjon og inntekt over 2G', async ({
			page,
		}) => {
			await setupDefaultMocks(page)
			await mockApi(page, SIMULERING_API_URL, 'alderspensjon.json')
			await navigateToApp(page)

			await page.getByTestId('eps-har-pensjon').getByLabel('Nei').check()
			await page.getByTestId('eps-har-inntekt-over-2g').getByLabel('Ja').check()
			await fillMainFormFields(page)
			await page.getByTestId('beregn-button').click()

			await expect(page.getByText('Beregning')).toBeVisible()
		})

		test('sender beregning med inntekt ved siden av 100 % uttak', async ({
			page,
		}) => {
			await setupDefaultMocks(page)
			await mockApi(page, SIMULERING_API_URL, 'alderspensjon.json')
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

				.fill('200000')
			await page
				.getByTestId('alder-inntekt-slutter-aar')

				.selectOption('72')
			await page
				.getByTestId('alder-inntekt-slutter-md')

				.selectOption('0')
			await page.getByTestId('beregn-button').click()

			await expect(page.getByText('Beregning')).toBeVisible()
		})

		test('sender beregning med AFP privat', async ({ page }) => {
			await setupDefaultMocks(page)
			await mockApi(page, SIMULERING_API_URL, 'alderspensjon.json')
			await navigateToApp(page)

			await page.getByTestId('eps-har-pensjon').getByLabel('Nei').check()
			await page.getByTestId('afp').getByLabel('Ja, privat').check()
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
			await page.getByTestId('beregn-button').click()

			await expect(page.getByText('Beregning')).toBeVisible()
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

			await expect(page.getByTestId('uttaksgrad')).toHaveValue('')
			await expect(page.getByTestId('alder-uttak-aar')).toHaveValue('')
			await expect(page.getByTestId('alder-uttak-md')).toHaveValue('')
		})

		test('tilbakestiller inntekt til opprinnelig verdi etter nullstilling', async ({
			page,
		}) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)

			await page
				.getByTestId('inntekt-foer-uttak')

				.fill('600000')
			await page.getByTestId('nullstill-button').click()

			await expect(page.getByTestId('inntekt-foer-uttak')).toBeEmpty()
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
})
