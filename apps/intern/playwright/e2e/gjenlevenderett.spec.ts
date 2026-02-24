import { expect, test } from '@playwright/test'
import { mockApi, mockApiError } from 'utils/mock'

const PERSON_API_URL = '**/api/v6/person'
const EPS_API_URL = '**/api/intern/v1/eps'
const PERSON_MOCK_FILE = 'person.json'
const EPS_MOCK_FILE = 'eps.json'

const sivilstandMedGjenlevenderett = [
	'SAMBOER',
	'GIFT',
	'ENKE_ELLER_ENKEMANN',
	'REGISTRERT_PARTNER',
	'SKILT',
]

const sivilstandUtenGjenlevenderett = [
	'UNKNOWN',
	'UOPPGITT',
	'UGIFT',
	'SEPARERT',
	'SEPARERT_PARTNER',
	'SKILT_PARTNER',
	'GJENLEVENDE_PARTNER',
]

test.describe('Gjenlevenderett', () => {
	test.describe('Visning av checkbox', () => {
		for (const sivilstand of sivilstandUtenGjenlevenderett) {
			test(`Viser ikke checkbox for sivilstand: ${sivilstand}`, async ({
				page,
			}) => {
				await mockApi(page, PERSON_API_URL, PERSON_MOCK_FILE, {
					sivilstand,
				})
				await page.goto('/?fnr=12345678901')

				await expect(
					page.getByTestId('beregn-med-gjenlevenderett')
				).not.toBeVisible()
			})
		}

		for (const sivilstand of sivilstandMedGjenlevenderett) {
			test(`Viser checkbox for sivilstand: ${sivilstand}`, async ({ page }) => {
				await mockApi(page, PERSON_API_URL, PERSON_MOCK_FILE, {
					sivilstand,
				})
				await page.goto('/?fnr=12345678901')

				await expect(
					page.getByTestId('beregn-med-gjenlevenderett')
				).toBeVisible()
			})
		}
	})

	// TODO: Vurder om vi skal ha for loop eller holder det med en sivilstand
	test.describe('Gjenlevenderett valgt', () => {
		test.beforeEach(async ({ page }) => {
			await mockApi(page, PERSON_API_URL, PERSON_MOCK_FILE, {
				sivilstand: 'GIFT',
			})
			await page.goto('/?fnr=12345678901')
		})

		test('Viser samtykke tekst og knapp for å hente EPS opplysninger', async ({
			page,
		}) => {
			const checkbox = page.getByTestId('beregn-med-gjenlevenderett')
			await expect(checkbox).toBeVisible()
			await checkbox.check()
			await expect(page.getByTestId('EPS-samtykke-tekst')).toBeVisible()
			await expect(page.getByTestId('EPS-samtykke-button')).toBeVisible()
		})
	})

	test.describe('Henting av EPS opplysninger', () => {
		test.beforeEach(async ({ page }) => {
			await mockApi(page, PERSON_API_URL, PERSON_MOCK_FILE, {
				sivilstand: 'GIFT',
			})
			await page.goto('/?fnr=12345678901')
			const checkbox = page.getByTestId('beregn-med-gjenlevenderett')
			await checkbox.check()
		})

		test.describe('Opplysninger om EPS er hentet', () => {
			test('Opplysninger med dødsdato', async ({ page }) => {
				await mockApi(page, EPS_API_URL, EPS_MOCK_FILE)
				await page.click('[data-testid="EPS-samtykke-button"]')

				await expect(page.getByTestId('EPS-opplysninger')).toBeVisible()
				await expect(page.getByTestId('EPS-navn')).toBeVisible()
				await expect(page.getByTestId('EPS-dodsfall')).toBeVisible()
			})

			test('Opplysninger uten dødsdato', async ({ page }) => {
				await mockApi(page, EPS_API_URL, EPS_MOCK_FILE, {
					doedsdato: null,
				})
				await page.click('[data-testid="EPS-samtykke-button"]')

				await expect(page.getByTestId('EPS-opplysninger')).toBeVisible()
				await expect(page.getByTestId('EPS-navn')).toBeVisible()
				await expect(
					page.getByTestId('EPS-dodsfall-ikke-registrert')
				).toBeVisible()
			})
		})

		test('EPS opplysninger finnes ikke', async ({ page }) => {
			await mockApi(page, EPS_API_URL, 'no-eps.json')
			await page.click('[data-testid="EPS-samtykke-button"]')

			await expect(
				page.getByTestId('EPS-opplysninger-ikke-funnet')
			).toBeVisible()
			await expect(page.getByRole('alert')).toContainText(
				'Fant ikke opplysninger'
			)
		})

		test('Henting av EPS feiler', async ({ page }) => {
			await mockApiError(page, EPS_API_URL, 500)
			await page.click('[data-testid="EPS-samtykke-button"]')

			await expect(page.getByTestId('EPS-opplysninger-feilet')).toBeVisible()
			await expect(page.getByRole('alert')).toContainText(
				'Kunne ikke hente EPS opplysninger'
			)
		})
	})
})
