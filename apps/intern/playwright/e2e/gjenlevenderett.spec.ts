import { expect, test } from '@playwright/test'
import { mockApi } from 'utils/mock'

const PERSON_API_URL = '**/api/intern/v1/person'
const DECRYPT_API_URL = '**/api/v1/decrypt'
const LOEPENDE_VEDTAK_API_URL = '**/api/v4/vedtak/loepende-vedtak'
const GRUNNBELOEP_API_URL = '**/api/v1/grunnbel*'
const SIMULERING_API_URL = '**/api/v9/alderspensjon/simulering'

const PERSON_MOCK_FILE = 'person-intern.json'
const LOEPENDE_VEDTAK_MOCK_FILE = 'loepende-vedtak.json'
const ALDERSPENSJON_MOCK_FILE = 'alderspensjon.json'

const sivilstatusMedGjenlevenderett = [
	'SAMBOER',
	'GIFT',
	'ENKE_ELLER_ENKEMANN',
	'REGISTRERT_PARTNER',
	'SKILT',
]

const sivilstatusUtenGjenlevenderett = [
	'UNKNOWN',
	'UOPPGITT',
	'UGIFT',
	'SEPARERT',
	'SEPARERT_PARTNER',
	'SKILT_PARTNER',
	'GJENLEVENDE_PARTNER',
]

async function setupDefaultMocks(
	page: import('@playwright/test').Page,
	personOverrides?: Record<string, unknown>
) {
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
}

async function navigateToApp(page: import('@playwright/test').Page) {
	await page.goto('/?pid=encrypted-default-pid')
	await page.waitForSelector('text=Pensjonskalkulator')
}

test.describe('Gjenlevenderett', () => {
	test.describe('Visning av checkbox', () => {
		for (const sivilstatus of sivilstatusUtenGjenlevenderett) {
			test(`Viser ikke checkbox for sivilstatus: ${sivilstatus}`, async ({
				page,
			}) => {
				await setupDefaultMocks(page, { sivilstatus })
				await navigateToApp(page)

				await expect(
					page.getByTestId('beregn-med-gjenlevenderett')
				).not.toBeVisible()
			})
		}

		for (const sivilstatus of sivilstatusMedGjenlevenderett) {
			test(`Viser checkbox for sivilstatus: ${sivilstatus}`, async ({
				page,
			}) => {
				await setupDefaultMocks(page, {
					sivilstatus,
					foedselsdato: '1962-04-30',
				})
				await navigateToApp(page)

				await expect(
					page.getByTestId('beregn-med-gjenlevenderett')
				).toBeVisible()
			})
		}
	})

	test.describe('Gjenlevenderett valgt', () => {
		test.beforeEach(async ({ page }) => {
			await setupDefaultMocks(page, { foedselsdato: '1962-04-30' })
			await navigateToApp(page)
		})

		test('Viser EPS-seksjon når checkbox er avkrysset', async ({ page }) => {
			const checkbox = page.getByTestId('beregn-med-gjenlevenderett')
			await checkbox.check()

			await expect(page.getByTestId('EPS-samtykke-tekst')).toBeVisible()

			await expect(page.getByTestId('bakgrunn-for-bruk-EPS')).toBeVisible()

			await expect(
				page.getByTestId('EPS-hent-opplysninger-button')
			).toBeVisible()
		})

		test('Skjuler EPS-seksjon når checkbox er avkrysset bort', async ({
			page,
		}) => {
			const checkbox = page.getByTestId('beregn-med-gjenlevenderett')
			await checkbox.check()

			await expect(page.getByTestId('EPS-samtykke-tekst')).toBeVisible()

			await checkbox.uncheck()

			await expect(page.getByTestId('EPS-samtykke-tekst')).not.toBeVisible()
		})

		test('Viser radio-valg for bakgrunn', async ({ page }) => {
			const checkbox = page.getByTestId('beregn-med-gjenlevenderett')
			await checkbox.check()

			const radioGroup = page.getByTestId('bakgrunn-for-bruk-EPS')

			await expect(
				radioGroup.getByLabel('Bruker opplyser at EPS er død')
			).toBeVisible()
			await expect(
				radioGroup.getByLabel('Henvendelse fra begge parter foreligger')
			).toBeVisible()
		})
	})

	test.describe('Gjenlevenderett og sivilstands-velger', () => {
		test.beforeEach(async ({ page }) => {
			await setupDefaultMocks(page, { foedselsdato: '1962-04-30' })
			await navigateToApp(page)
		})

		test('Skjuler sivilstands-velger når gjenlevenderett er valgt for partner-sivilstatus', async ({
			page,
		}) => {
			await expect(
				page.getByRole('combobox', {
					name: 'Hva er sivilstanden til bruker ved uttak av pensjon?',
				})
			).toBeVisible()

			const checkbox = page.getByTestId('beregn-med-gjenlevenderett')
			await checkbox.check()

			await expect(
				page.getByRole('combobox', {
					name: 'Hva er sivilstanden til bruker ved uttak av pensjon?',
				})
			).not.toBeVisible()
		})

		test('Viser sivilstands-velger igjen når gjenlevenderett er avkrysset bort', async ({
			page,
		}) => {
			const checkbox = page.getByTestId('beregn-med-gjenlevenderett')
			await checkbox.check()

			await expect(
				page.getByRole('combobox', {
					name: 'Hva er sivilstanden til bruker ved uttak av pensjon?',
				})
			).not.toBeVisible()

			await checkbox.uncheck()

			await expect(
				page.getByRole('combobox', {
					name: 'Hva er sivilstanden til bruker ved uttak av pensjon?',
				})
			).toBeVisible()
		})
	})

	test.describe('Validering av EPS-grunnlag', () => {
		test.beforeEach(async ({ page }) => {
			await setupDefaultMocks(page, { foedselsdato: '1962-04-30' })
			await navigateToApp(page)
		})

		test('Viser feilmelding når grunnlag ikke er valgt og Hent opplysninger klikkes', async ({
			page,
		}) => {
			const checkbox = page.getByTestId('beregn-med-gjenlevenderett')
			await checkbox.check()

			await page.getByTestId('EPS-hent-opplysninger-button').click()

			await expect(
				page.getByText('Velg bakgrunn for bruk av opplysninger om EPS.')
			).toBeVisible()
		})

		test('Fjerner feilmelding når grunnlag velges og knapp klikkes på nytt', async ({
			page,
		}) => {
			const checkbox = page.getByTestId('beregn-med-gjenlevenderett')
			await checkbox.check()

			await page.getByTestId('EPS-hent-opplysninger-button').click()

			await expect(
				page.getByText('Velg bakgrunn for bruk av opplysninger om EPS.')
			).toBeVisible()

			const radioGroup = page.getByTestId('bakgrunn-for-bruk-EPS')
			await radioGroup
				.getByLabel('Henvendelse fra begge parter foreligger')
				.check()

			await page.getByTestId('EPS-hent-opplysninger-button').click()

			await expect(
				page.getByText('Velg bakgrunn for bruk av opplysninger om EPS.')
			).not.toBeVisible()
		})
	})

	test.describe('Gjenlevenderett med skjema', () => {
		test.beforeEach(async ({ page }) => {
			await setupDefaultMocks(page, { foedselsdato: '1962-04-30' })
			await navigateToApp(page)
		})

		test('Skjema-felter er synlige når gjenlevenderett er valgt', async ({
			page,
		}) => {
			const checkbox = page.getByTestId('beregn-med-gjenlevenderett')
			await checkbox.check()

			await expect(
				page.getByRole('textbox', {
					name: 'Pensjonsgivende inntekt frem til uttak',
				})
			).toBeVisible()
			await expect(
				page.getByRole('combobox', { name: 'Alder (år) for uttak' })
			).toBeVisible()
			await expect(
				page.getByRole('combobox', { name: 'Uttaksgrad' })
			).toBeVisible()
			await expect(
				page.getByRole('button', { name: 'Beregn pensjon' })
			).toBeVisible()
		})

		test('Nullstill nullstiller gjenlevenderett-felter', async ({ page }) => {
			const checkbox = page.getByTestId('beregn-med-gjenlevenderett')
			await checkbox.check()

			const radioGroup = page.getByTestId('bakgrunn-for-bruk-EPS')
			await radioGroup
				.getByLabel('Henvendelse fra begge parter foreligger')
				.check()

			await page.getByRole('button', { name: 'Nullstill' }).click()

			await expect(checkbox).not.toBeChecked()
			await expect(page.getByTestId('bakgrunn-for-bruk-EPS')).not.toBeVisible()
		})
	})

	test.describe('Innsending med gjenlevenderett', () => {
		test.beforeEach(async ({ page }) => {
			await setupDefaultMocks(page, { foedselsdato: '1962-04-30' })
			await mockApi(page, SIMULERING_API_URL, ALDERSPENSJON_MOCK_FILE)
			await navigateToApp(page)
		})

		test('Sender inn skjema med gjenlevenderett valgt', async ({ page }) => {
			const checkbox = page.getByTestId('beregn-med-gjenlevenderett')
			await checkbox.check()

			const radioGroup = page.getByTestId('bakgrunn-for-bruk-EPS')
			await radioGroup
				.getByLabel('Henvendelse fra begge parter foreligger')
				.check()

			await page
				.getByRole('textbox', {
					name: 'Pensjonsgivende inntekt frem til uttak',
				})
				.fill('500000')
			await page
				.getByRole('combobox', { name: 'Alder (år) for uttak' })
				.selectOption('67')
			await page
				.getByRole('combobox', { name: 'Uttaksgrad' })
				.selectOption('100')
			await page
				.getByRole('group', {
					name: 'Har bruker inntekt ved siden av 100 % uttak?',
				})
				.getByLabel('Nei')
				.check()

			await page.getByRole('button', { name: 'Beregn pensjon' }).click()

			await expect(
				page.getByText('Velg bakgrunn for bruk av opplysninger om EPS.')
			).not.toBeVisible()
			await expect(
				page.getByText('Pensjonsgivende inntekt frem til uttak er påkrevd')
			).not.toBeVisible()
		})
	})
})
