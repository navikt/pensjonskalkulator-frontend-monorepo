import { expect, test } from '@playwright/test'
import { mockApi } from 'utils/mock'

const PERSON_API_URL = '**/api/intern/v1/person'
const DECRYPT_API_URL = '**/api/v1/decrypt'
const LOEPENDE_VEDTAK_API_URL = '**/api/v4/vedtak/loepende-vedtak'
const GRUNNBELOEP_API_URL = '**/api/v1/grunnbel*'
const SIMULERING_API_URL = '**/api/v9/alderspensjon/simulering'
const INNTEKT_API_URL = '**/api/inntekt'

const PERSON_MOCK_FILE = 'person.json'
const LOEPENDE_VEDTAK_MOCK_FILE = 'loepende-vedtak.json'
const ALDERSPENSJON_MOCK_FILE = 'alderspensjon.json'
const INNTEKT_MOCK_FILE = 'inntekt.json'

async function setupDefaultMocks(
	page: import('@playwright/test').Page,
	personOverrides?: Record<string, unknown>
) {
	await mockApi(page, DECRYPT_API_URL, undefined, undefined)
	await page.route(DECRYPT_API_URL, (route) =>
		route.fulfill({
			status: 200,
			contentType: 'text/plain',
			body: '04925398980',
		})
	)
	await mockApi(page, PERSON_API_URL, PERSON_MOCK_FILE, personOverrides)
	await mockApi(page, LOEPENDE_VEDTAK_API_URL, LOEPENDE_VEDTAK_MOCK_FILE)
	await mockApi(page, GRUNNBELOEP_API_URL, undefined, {
		dato: '2024-05-01',
		grunnbeløp: 100000,
		grunnbeløpPerMaaned: 10000,
		gjennomsnittPerÅr: 99000,
		omregningsfaktor: 1.05,
		virkningstidspunktForMinsteinntekt: '2024-09-01',
	})
	await mockApi(page, INNTEKT_API_URL, INNTEKT_MOCK_FILE)
}

async function navigateToApp(page: import('@playwright/test').Page) {
	await page.goto('/?pid=encrypted-default-pid')
	await page.waitForSelector('text=Pensjonskalkulator')
}

test.describe('Alderspensjon - BeregningForm', () => {
	test.describe('Skjema vises med riktige felter', () => {
		test.beforeEach(async ({ page }) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)
		})

		test('Viser sivilstand forhåndsutfylt fra persondata (sivilstatus)', async ({
			page,
		}) => {
			const sivilstandSelect = page.getByTestId('sivilstatus')
			await expect(sivilstandSelect).toBeVisible()
			await expect(sivilstandSelect).toHaveValue('UGIFT')
		})

		test('Viser inntektsfelt (inntekt-foer-uttak)', async ({ page }) => {
			await expect(page.getByTestId('inntekt-foer-uttak')).toBeVisible()
		})

		test('Viser alder-velger for uttak (alder-uttak-aar, alder-uttak-md)', async ({
			page,
		}) => {
			await expect(page.getByTestId('alder-uttak-aar')).toBeVisible()
			await expect(page.getByTestId('alder-uttak-md')).toBeVisible()
		})

		test('Viser uttaksgrad (uttaksgrad)', async ({ page }) => {
			await expect(page.getByTestId('uttaksgrad')).toBeVisible()
		})

		test('Viser spørsmål om inntekt ved siden av 100 % uttak (har-inntekt-vsa-helt-uttak)', async ({
			page,
		}) => {
			await page.getByTestId('uttaksgrad').selectOption('100')

			await expect(page.getByTestId('har-inntekt-vsa-helt-uttak')).toBeVisible()
		})

		test('Viser Beregn pensjon-knapp (beregn-button)', async ({ page }) => {
			await expect(page.getByTestId('beregn-button')).toBeVisible()
		})

		test('Viser Nullstill-knapp (nullstill-button)', async ({ page }) => {
			await expect(page.getByTestId('nullstill-button')).toBeVisible()
		})
	})

	test.describe('Sivilstand - Betinget visning av EPS-felter', () => {
		test.beforeEach(async ({ page }) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)
		})

		test('Viser ikke EPS-felter for sivilstand Ugift (eps-har-pensjon)', async ({
			page,
		}) => {
			await page.getByTestId('sivilstatus').selectOption('UGIFT')

			await expect(page.getByTestId('eps-har-pensjon')).not.toBeVisible()
		})

		for (const sivilstand of ['GIFT', 'SAMBOER', 'REGISTRERT_PARTNER']) {
			test(`Viser EPS pensjon-spørsmål for sivilstand: ${sivilstand} (eps-har-pensjon)`, async ({
				page,
			}) => {
				await page.getByTestId('sivilstatus').selectOption(sivilstand)

				await expect(page.getByTestId('eps-har-pensjon')).toBeVisible()
			})
		}

		test('Viser EPS inntekt over 2G-spørsmål når epsHarPensjon er Nei (eps-har-inntekt-over-2g)', async ({
			page,
		}) => {
			await page.getByTestId('sivilstatus').selectOption('GIFT')

			const epsHarPensjonGroup = page.getByTestId('eps-har-pensjon')
			await expect(epsHarPensjonGroup).toBeVisible()

			await epsHarPensjonGroup.getByLabel('Nei').check()

			await expect(page.getByTestId('eps-har-inntekt-over-2g')).toBeVisible()
		})

		test('Viser ikke EPS inntekt over 2G-spørsmål når epsHarPensjon er Ja (eps-har-inntekt-over-2g)', async ({
			page,
		}) => {
			await page.getByTestId('sivilstatus').selectOption('GIFT')

			const epsHarPensjonGroup = page.getByTestId('eps-har-pensjon')
			await epsHarPensjonGroup.getByLabel('Ja').check()

			await expect(
				page.getByTestId('eps-har-inntekt-over-2g')
			).not.toBeVisible()
		})

		test('Nullstiller EPS-felter når sivilstand endres tilbake til Ugift (eps-har-pensjon, eps-har-inntekt-over-2g)', async ({
			page,
		}) => {
			await page.getByTestId('sivilstatus').selectOption('GIFT')

			const epsHarPensjonGroup = page.getByTestId('eps-har-pensjon')
			await epsHarPensjonGroup.getByLabel('Nei').check()

			await expect(page.getByTestId('eps-har-inntekt-over-2g')).toBeVisible()

			await page.getByTestId('sivilstatus').selectOption('UGIFT')

			await expect(epsHarPensjonGroup).not.toBeVisible()
			await expect(
				page.getByTestId('eps-har-inntekt-over-2g')
			).not.toBeVisible()
		})
	})

	test.describe('Uttaksgrad - Betinget visning av gradert uttak-felter', () => {
		test.beforeEach(async ({ page }) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)
		})

		test('Viser ikke gradert uttak-felter for 100 % uttaksgrad (alder-helt-uttak-aar, alder-helt-uttak-md)', async ({
			page,
		}) => {
			await page.getByTestId('uttaksgrad').selectOption('100')

			await expect(page.getByTestId('alder-helt-uttak-aar')).not.toBeVisible()
			await expect(page.getByTestId('alder-helt-uttak-md')).not.toBeVisible()
		})

		for (const grad of [20, 40, 50, 60, 80]) {
			test(`Viser gradert uttak-felter for ${grad} % uttaksgrad (inntekt-vsa-gradert-uttak, alder-helt-uttak)`, async ({
				page,
			}) => {
				await page.getByTestId('uttaksgrad').selectOption(String(grad))

				await expect(
					page.getByTestId('inntekt-vsa-gradert-uttak')
				).toBeVisible()

				await expect(page.getByTestId('alder-helt-uttak-aar')).toBeVisible()

				await expect(page.getByTestId('alder-helt-uttak-md')).toBeVisible()
			})
		}

		test('Nullstiller gradert uttak-felter når uttaksgrad endres til 100 % (inntekt-vsa-gradert-uttak, alder-helt-uttak-aar)', async ({
			page,
		}) => {
			await page.getByTestId('uttaksgrad').selectOption('60')

			await expect(page.getByTestId('inntekt-vsa-gradert-uttak')).toBeVisible()

			await page.getByTestId('uttaksgrad').selectOption('100')

			await expect(
				page.getByTestId('inntekt-vsa-gradert-uttak')
			).not.toBeVisible()
			await expect(page.getByTestId('alder-helt-uttak-aar')).not.toBeVisible()
		})
	})

	test.describe('Validering', () => {
		test.beforeEach(async ({ page }) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)
		})

		test('Viser feilmeldinger ved tom innsending', async ({ page }) => {
			await page.getByTestId('beregn-button').click()

			await expect(page.getByText('Velg år og måned for uttak.')).toBeVisible()
			await expect(page.getByText('Velg uttaksgrad.')).toBeVisible()
		})

		test('Viser feilmelding for EPS-felt når partnersivilstand er valgt', async ({
			page,
		}) => {
			await page.getByTestId('sivilstatus').selectOption('GIFT')

			await page.getByTestId('beregn-button').click()

			await expect(
				page.getByText(
					'Fyll ut om ektefelle mottar pensjon, uføretrygd eller AFP.'
				)
			).toBeVisible()
		})

		test('Viser feilmelding for gradert uttak-felter', async ({ page }) => {
			await page.getByTestId('sivilstatus').selectOption('UGIFT')

			await page.getByTestId('inntekt-foer-uttak').fill('500000')

			await page.getByTestId('alder-uttak-aar').selectOption('67')

			await page.getByTestId('uttaksgrad').selectOption('60')

			await page
				.getByTestId('har-inntekt-vsa-helt-uttak')
				.getByLabel('Nei')
				.check()

			await page.getByTestId('beregn-button').click()

			await expect(
				page.getByText('Velg år og måned for 100 % uttak.')
			).toBeVisible()
		})

		test('Viser feilmelding når helt uttak alder er før gradert uttak alder', async ({
			page,
		}) => {
			await page.getByTestId('inntekt-foer-uttak').fill('500000')

			await page.getByTestId('alder-uttak-aar').selectOption('62')

			await page.getByTestId('uttaksgrad').selectOption('60')

			await page.getByTestId('alder-helt-uttak-aar').selectOption('63')

			await page
				.getByTestId('har-inntekt-vsa-helt-uttak')
				.getByLabel('Nei')
				.check()

			await page.getByTestId('alder-uttak-aar').selectOption('67')

			await page.getByTestId('beregn-button').click()

			await expect(
				page.getByText(
					'Uttaksalder for 100 % alderspensjon må være senere enn alder for gradert pensjon.'
				)
			).toBeVisible()
		})

		test('Viser feilmelding for inntekt ved siden av uttak-felter', async ({
			page,
		}) => {
			await page.getByTestId('sivilstatus').selectOption('UGIFT')

			await page.getByTestId('inntekt-foer-uttak').fill('500000')

			await page.getByTestId('alder-uttak-aar').selectOption('67')

			await page.getByTestId('uttaksgrad').selectOption('100')

			await page
				.getByTestId('har-inntekt-vsa-helt-uttak')
				.getByLabel('Ja')
				.check()

			await page.getByTestId('beregn-button').click()

			await expect(page.getByText('Fyll ut inntekt.')).toBeVisible()
			await expect(
				page.getByText('Velg år og måned for når inntekt slutter.')
			).toBeVisible()
		})
	})

	test.describe('Innsending - 100 % uttak', () => {
		test.beforeEach(async ({ page }) => {
			await setupDefaultMocks(page)
			await mockApi(page, SIMULERING_API_URL, ALDERSPENSJON_MOCK_FILE)
			await navigateToApp(page)
		})

		test('Sender inn skjema med 100 % uttak uten inntekt', async ({ page }) => {
			await page.getByTestId('inntekt-foer-uttak').fill('500000')
			await page.getByTestId('alder-uttak-aar').selectOption('67')
			await page.getByTestId('uttaksgrad').selectOption('100')
			await page
				.getByTestId('har-inntekt-vsa-helt-uttak')
				.getByLabel('Nei')
				.check()

			await page.getByTestId('beregn-button').click()

			await expect(page.getByText('Sivilstand er påkrevd')).not.toBeVisible()
		})

		test('Sender inn skjema med 100 % uttak med inntekt', async ({ page }) => {
			await page.getByTestId('inntekt-foer-uttak').fill('500000')
			await page.getByTestId('alder-uttak-aar').selectOption('67')
			await page.getByTestId('uttaksgrad').selectOption('100')
			await page
				.getByTestId('har-inntekt-vsa-helt-uttak')
				.getByLabel('Ja')
				.check()
			await page.getByTestId('inntekt-vsa-helt-uttak').fill('200000')
			await page.getByTestId('alder-inntekt-slutter-aar').selectOption('70')

			await page.getByTestId('beregn-button').click()

			await expect(page.getByText('Sivilstand er påkrevd')).not.toBeVisible()
		})
	})

	test.describe('Innsending - Gradert uttak', () => {
		test.beforeEach(async ({ page }) => {
			await setupDefaultMocks(page)
			await mockApi(page, SIMULERING_API_URL, ALDERSPENSJON_MOCK_FILE)
			await navigateToApp(page)
		})

		test('Sender inn skjema med gradert uttak uten inntekt', async ({
			page,
		}) => {
			await page.getByTestId('inntekt-foer-uttak').fill('500000')
			await page.getByTestId('alder-uttak-aar').selectOption('62')
			await page.getByTestId('uttaksgrad').selectOption('60')
			await page.getByTestId('alder-helt-uttak-aar').selectOption('67')
			await page
				.getByTestId('har-inntekt-vsa-helt-uttak')
				.getByLabel('Nei')
				.check()

			await page.getByTestId('beregn-button').click()

			await expect(page.getByText('Sivilstand er påkrevd')).not.toBeVisible()
			await expect(page.getByText('Uttaksgrad er påkrevd')).not.toBeVisible()
		})

		test('Sender inn skjema med gradert uttak med inntekt', async ({
			page,
		}) => {
			await page.getByTestId('inntekt-foer-uttak').fill('500000')
			await page.getByTestId('alder-uttak-aar').selectOption('62')
			await page.getByTestId('uttaksgrad').selectOption('60')
			await page.getByTestId('inntekt-vsa-gradert-uttak').fill('300000')
			await page.getByTestId('alder-helt-uttak-aar').selectOption('67')
			await page
				.getByTestId('har-inntekt-vsa-helt-uttak')
				.getByLabel('Ja')
				.check()
			await page.getByTestId('inntekt-vsa-helt-uttak').fill('200000')
			await page.getByTestId('alder-inntekt-slutter-aar').selectOption('70')

			await page.getByTestId('beregn-button').click()

			await expect(page.getByText('Sivilstand er påkrevd')).not.toBeVisible()
			await expect(page.getByText('Uttaksgrad er påkrevd')).not.toBeVisible()
		})
	})

	test.describe('Innsending - Med partner', () => {
		test.beforeEach(async ({ page }) => {
			await setupDefaultMocks(page, { sivilstatus: 'GIFT' })
			await mockApi(page, SIMULERING_API_URL, ALDERSPENSJON_MOCK_FILE)
			await navigateToApp(page)
		})

		test('Sender inn skjema med gift sivilstand og EPS har pensjon', async ({
			page,
		}) => {
			await page.getByTestId('eps-har-pensjon').getByLabel('Ja').check()

			await page.getByTestId('inntekt-foer-uttak').fill('500000')
			await page.getByTestId('alder-uttak-aar').selectOption('67')
			await page.getByTestId('uttaksgrad').selectOption('100')
			await page
				.getByTestId('har-inntekt-vsa-helt-uttak')
				.getByLabel('Nei')
				.check()

			await page.getByTestId('beregn-button').click()

			await expect(page.getByText('Sivilstand er påkrevd')).not.toBeVisible()
		})

		test('Sender inn skjema med gift sivilstand, EPS uten pensjon, med inntekt over 2G', async ({
			page,
		}) => {
			await page.getByTestId('eps-har-pensjon').getByLabel('Nei').check()

			await page.getByTestId('eps-har-inntekt-over-2g').getByLabel('Ja').check()

			await page.getByTestId('inntekt-foer-uttak').fill('500000')
			await page.getByTestId('alder-uttak-aar').selectOption('67')
			await page.getByTestId('uttaksgrad').selectOption('100')
			await page
				.getByTestId('har-inntekt-vsa-helt-uttak')
				.getByLabel('Nei')
				.check()

			await page.getByTestId('beregn-button').click()

			await expect(page.getByText('Sivilstand er påkrevd')).not.toBeVisible()
		})
	})

	test.describe('Nullstilling av skjema', () => {
		test.beforeEach(async ({ page }) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)
		})

		test('Nullstiller alle felter ved klikk på Nullstill', async ({ page }) => {
			await page.getByTestId('inntekt-foer-uttak').fill('500000')
			await page.getByTestId('alder-uttak-aar').selectOption('67')
			await page.getByTestId('uttaksgrad').selectOption('100')
			await page
				.getByTestId('har-inntekt-vsa-helt-uttak')
				.getByLabel('Ja')
				.check()
			await page.getByTestId('inntekt-vsa-helt-uttak').fill('200000')

			await page.getByTestId('nullstill-button').click()

			await expect(page.getByTestId('inntekt-foer-uttak')).toHaveValue('')
			await expect(page.getByTestId('alder-uttak-aar')).toHaveValue('')
			await expect(page.getByTestId('uttaksgrad')).toHaveValue('')

			await expect(page.getByTestId('inntekt-vsa-helt-uttak')).not.toBeVisible()
		})
	})

	test.describe('Alder-velger', () => {
		test.beforeEach(async ({ page }) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)
		})

		test('Måned-velger er deaktivert før år er valgt (alder-uttak-md)', async ({
			page,
		}) => {
			await expect(page.getByTestId('alder-uttak-md')).toBeDisabled()
		})

		test('Måned-velger aktiveres når år er valgt (alder-uttak-md)', async ({
			page,
		}) => {
			await page.getByTestId('alder-uttak-aar').selectOption('67')

			await expect(page.getByTestId('alder-uttak-md')).toBeEnabled()
		})

		test('Viser uttaksdato når både år og måned er valgt', async ({ page }) => {
			await page.getByTestId('alder-uttak-aar').selectOption('67')

			await expect(page.getByText(/\d{2}\.\d{2}\.\d{4}/)).toBeVisible()
		})
	})

	test.describe('Partner-betegnelse', () => {
		test('Viser "ektefelle" for Gift (eps-har-pensjon)', async ({ page }) => {
			await setupDefaultMocks(page, { sivilstatus: 'GIFT' })
			await navigateToApp(page)

			await expect(page.getByTestId('eps-har-pensjon')).toContainText(
				'ektefelle'
			)
		})

		test('Viser "samboer" for Samboer (eps-har-pensjon)', async ({ page }) => {
			await setupDefaultMocks(page, { sivilstatus: 'SAMBOER' })
			await navigateToApp(page)

			await expect(page.getByTestId('eps-har-pensjon')).toContainText('samboer')
		})

		test('Viser "partner" for Registrert partner (eps-har-pensjon)', async ({
			page,
		}) => {
			await setupDefaultMocks(page, {
				sivilstatus: 'REGISTRERT_PARTNER',
			})
			await navigateToApp(page)

			await expect(page.getByTestId('eps-har-pensjon')).toContainText('partner')
		})
	})
})
