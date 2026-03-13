import { expect, test } from '@playwright/test'
import { mockApi, mockApiError } from 'utils/mock'

const PERSON_API_URL = '**/api/intern/v1/person'
const DECRYPT_API_URL = '**/api/v1/decrypt'
const LOEPENDE_VEDTAK_API_URL = '**/api/v4/vedtak/loepende-vedtak'
const GRUNNBELOEP_API_URL = '**/api/v1/grunnbel*'
const INNTEKT_API_URL = '**/api/inntekt'
const SIMULERING_API_URL = '**/api/v9/alderspensjon/simulering'
const EPS_API_URL = '**/api/intern/v1/eps'

const PERSON_MOCK_FILE = 'person-intern.json'
const LOEPENDE_VEDTAK_MOCK_FILE = 'loepende-vedtak.json'
const INNTEKT_MOCK_FILE = 'inntekt.json'
const ALDERSPENSJON_MOCK_FILE = 'alderspensjon.json'
const EPS_OPPLYSNING_MOCK_FILE = 'eps-opplysning.json'

const GJENLEVENDERETT_FOEDSELSDATO = '1962-04-30'

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
	await mockApi(page, INNTEKT_API_URL, INNTEKT_MOCK_FILE)
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

async function checkGjenlevenderett(page: import('@playwright/test').Page) {
	const checkbox = page.getByTestId('beregn-med-gjenlevenderett')
	await expect(checkbox).toBeVisible()
	await checkbox.check()
	return checkbox
}

async function selectBakgrunnAndFetch(
	page: import('@playwright/test').Page,
	label = 'Henvendelse fra begge parter foreligger'
) {
	const radioGroup = page.getByTestId('bakgrunn-for-bruk-EPS')
	await radioGroup.getByLabel(label).check()
	await page.getByTestId('EPS-hent-opplysninger-button').click()
}

async function fillMainFormFields(page: import('@playwright/test').Page) {
	await page
		.getByRole('textbox', {
			name: 'Pensjonsgivende inntekt frem til uttak',
		})
		.fill('500000')
	await page
		.getByRole('combobox', { name: 'Alder (år) for uttak' })
		.selectOption('67')
	await page.getByRole('combobox', { name: 'Uttaksgrad' }).selectOption('100')
	await page
		.getByRole('group', {
			name: 'Har bruker inntekt ved siden av 100 % uttak?',
		})
		.getByLabel('Nei')
		.check()
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
					foedselsdato: GJENLEVENDERETT_FOEDSELSDATO,
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
			await setupDefaultMocks(page, {
				foedselsdato: GJENLEVENDERETT_FOEDSELSDATO,
			})
			await navigateToApp(page)
		})

		test('Viser EPS-seksjon når checkbox er avkrysset', async ({ page }) => {
			await checkGjenlevenderett(page)

			await expect(page.getByTestId('EPS-samtykke-tekst')).toBeVisible()
			await expect(page.getByTestId('bakgrunn-for-bruk-EPS')).toBeVisible()
			await expect(
				page.getByTestId('EPS-hent-opplysninger-button')
			).toBeVisible()
		})

		test('Skjuler EPS-seksjon når checkbox er avkrysset bort', async ({
			page,
		}) => {
			const checkbox = await checkGjenlevenderett(page)

			await expect(page.getByTestId('EPS-samtykke-tekst')).toBeVisible()

			await checkbox.uncheck()

			await expect(page.getByTestId('EPS-samtykke-tekst')).not.toBeVisible()
		})

		test('Viser radio-valg for bakgrunn', async ({ page }) => {
			await checkGjenlevenderett(page)

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
			await setupDefaultMocks(page, {
				foedselsdato: GJENLEVENDERETT_FOEDSELSDATO,
			})
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

			await checkGjenlevenderett(page)

			await expect(
				page.getByRole('combobox', {
					name: 'Hva er sivilstanden til bruker ved uttak av pensjon?',
				})
			).not.toBeVisible()
		})

		test('Viser sivilstands-velger igjen når gjenlevenderett er avkrysset bort', async ({
			page,
		}) => {
			const checkbox = await checkGjenlevenderett(page)

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
			await setupDefaultMocks(page, {
				foedselsdato: GJENLEVENDERETT_FOEDSELSDATO,
			})
			await navigateToApp(page)
		})

		test('Viser feilmelding når grunnlag ikke er valgt og Hent opplysninger klikkes', async ({
			page,
		}) => {
			await checkGjenlevenderett(page)

			await page.getByTestId('EPS-hent-opplysninger-button').click()

			await expect(
				page.getByText('Velg bakgrunn for bruk av opplysninger om EPS.')
			).toBeVisible()
		})

		test('Fjerner feilmelding når grunnlag velges og knapp klikkes på nytt', async ({
			page,
		}) => {
			await checkGjenlevenderett(page)

			await page.getByTestId('EPS-hent-opplysninger-button').click()

			await expect(
				page.getByText('Velg bakgrunn for bruk av opplysninger om EPS.')
			).toBeVisible()

			await selectBakgrunnAndFetch(page)

			await expect(
				page.getByText('Velg bakgrunn for bruk av opplysninger om EPS.')
			).not.toBeVisible()
		})
	})

	test.describe('Gjenlevenderett med skjema', () => {
		test.beforeEach(async ({ page }) => {
			await setupDefaultMocks(page, {
				foedselsdato: GJENLEVENDERETT_FOEDSELSDATO,
			})
			await navigateToApp(page)
		})

		test('Skjema-felter er synlige når gjenlevenderett er valgt', async ({
			page,
		}) => {
			await checkGjenlevenderett(page)

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

		test('Nullstill gjenlevenderett-felter', async ({ page }) => {
			const checkbox = await checkGjenlevenderett(page)

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
			await setupDefaultMocks(page, {
				foedselsdato: GJENLEVENDERETT_FOEDSELSDATO,
			})
			await mockApi(page, EPS_API_URL, EPS_OPPLYSNING_MOCK_FILE)
			await mockApi(page, SIMULERING_API_URL, ALDERSPENSJON_MOCK_FILE)
			await navigateToApp(page)
		})

		test('Sender inn skjema med gjenlevenderett valgt', async ({ page }) => {
			await checkGjenlevenderett(page)
			await selectBakgrunnAndFetch(page)

			await expect(page.getByTestId('EPS-opplysninger-info')).toBeVisible()

			await page
				.getByRole('textbox', {
					name: 'Antall år bodd/jobbet i utlandet etter fylte 16 år',
				})
				.fill('5')
			await page
				.getByRole('textbox', {
					name: 'Pensjonsgivende inntekt året før dødsdato',
				})
				.fill('400000')
			const minstInntektGroup = page.getByRole('group', {
				name: /Minst 1G.*i pensjonsgivende inntekt ved dødsdato/,
			})
			await expect(minstInntektGroup).not.toBeVisible()
			await page
				.getByRole('group', {
					name: 'Medlem av folketrygden de 5 siste årene før dødsdato',
				})
				.getByLabel('Ja')
				.check()
			await page
				.getByRole('group', { name: 'Registrert som flyktning' })
				.getByLabel('Nei')
				.check()

			await fillMainFormFields(page)

			await page.getByRole('button', { name: 'Beregn pensjon' }).click()

			await expect(
				page.getByText('Velg bakgrunn for bruk av opplysninger om EPS.')
			).not.toBeVisible()
			await expect(
				page.getByText(
					'Hent opplysninger om EPS eller beregn alderspensjon uten gjenlevenderett.'
				)
			).not.toBeVisible()
			await expect(
				page.getByText('Pensjonsgivende inntekt frem til uttak er påkrevd')
			).not.toBeVisible()
		})
	})

	test.describe('Aldersgrense for gjenlevenderett', () => {
		test('Viser ikke checkbox for person født etter 1962', async ({ page }) => {
			await setupDefaultMocks(page, { foedselsdato: '1963-01-01' })
			await navigateToApp(page)

			await expect(
				page.getByTestId('beregn-med-gjenlevenderett')
			).not.toBeVisible()
		})

		test('Viser checkbox for person født siste dag i 1962', async ({
			page,
		}) => {
			await setupDefaultMocks(page, { foedselsdato: '1962-12-31' })
			await navigateToApp(page)

			await expect(page.getByTestId('beregn-med-gjenlevenderett')).toBeVisible()
		})

		test('Viser ikke checkbox for person født etter 1962 med partner-sivilstatus', async ({
			page,
		}) => {
			await setupDefaultMocks(page, {
				foedselsdato: '1964-04-30',
				sivilstatus: 'GIFT',
			})
			await navigateToApp(page)

			await expect(
				page.getByTestId('beregn-med-gjenlevenderett')
			).not.toBeVisible()
		})
	})

	test.describe('Henting av EPS-opplysninger', () => {
		test.beforeEach(async ({ page }) => {
			await setupDefaultMocks(page, {
				foedselsdato: GJENLEVENDERETT_FOEDSELSDATO,
			})
			await navigateToApp(page)
		})

		test('Viser opplysninger om avdøde etter vellykket henting', async ({
			page,
		}) => {
			await mockApi(page, EPS_API_URL, EPS_OPPLYSNING_MOCK_FILE)

			await checkGjenlevenderett(page)
			await selectBakgrunnAndFetch(page)

			await expect(page.getByTestId('EPS-opplysninger-info')).toBeVisible()
		})

		test('Viser EPS-felter etter vellykket henting', async ({ page }) => {
			await mockApi(page, EPS_API_URL, EPS_OPPLYSNING_MOCK_FILE)

			await checkGjenlevenderett(page)
			await selectBakgrunnAndFetch(page, 'Bruker opplyser at EPS er død')

			await expect(page.getByTestId('EPS-opplysninger-info')).toBeVisible()

			await expect(
				page.getByRole('textbox', {
					name: 'Antall år bodd/jobbet i utlandet etter fylte 16 år',
				})
			).toBeVisible()
			await expect(
				page.getByRole('textbox', {
					name: 'Pensjonsgivende inntekt året før dødsdato',
				})
			).toBeVisible()
		})

		test('Skjuler radiogruppe og hent-knapp etter vellykket henting', async ({
			page,
		}) => {
			await mockApi(page, EPS_API_URL, EPS_OPPLYSNING_MOCK_FILE)

			await checkGjenlevenderett(page)
			await selectBakgrunnAndFetch(page)

			await expect(page.getByTestId('EPS-opplysninger-info')).toBeVisible()

			await expect(page.getByTestId('bakgrunn-for-bruk-EPS')).not.toBeVisible()
			await expect(
				page.getByTestId('EPS-hent-opplysninger-button')
			).not.toBeVisible()
		})
	})

	test.describe('EPS-henting med feil', () => {
		test('Viser feilmelding og retry-knapp når EPS-henting feiler', async ({
			page,
		}) => {
			await setupDefaultMocks(page, {
				foedselsdato: GJENLEVENDERETT_FOEDSELSDATO,
			})
			await mockApiError(page, EPS_API_URL)
			await navigateToApp(page)

			await checkGjenlevenderett(page)
			await selectBakgrunnAndFetch(page)

			await expect(page.getByTestId('EPS-henting-feil')).toBeVisible()
			await expect(
				page.getByRole('button', {
					name: 'Hent opplysninger om EPS på nytt',
				})
			).toBeVisible()
		})

		test('Radiogruppe er skjult etter feil — kan ikke endre bakgrunn uten å nullstille', async ({
			page,
		}) => {
			await setupDefaultMocks(page, {
				foedselsdato: GJENLEVENDERETT_FOEDSELSDATO,
			})
			await mockApiError(page, EPS_API_URL)
			await navigateToApp(page)

			await checkGjenlevenderett(page)
			await selectBakgrunnAndFetch(page)

			await expect(page.getByTestId('EPS-henting-feil')).toBeVisible()
			await expect(page.getByTestId('bakgrunn-for-bruk-EPS')).not.toBeVisible()
		})
	})

	test.describe('EPS-opplysninger ikke funnet', () => {
		test('Viser advarsel når EPS-opplysninger returnerer tomt', async ({
			page,
		}) => {
			await setupDefaultMocks(page, {
				foedselsdato: GJENLEVENDERETT_FOEDSELSDATO,
			})
			await mockApi(page, EPS_API_URL, undefined, {
				pid: null,
				fom: null,
				relasjonstype: null,
				relasjonPersondata: null,
			})
			await navigateToApp(page)

			await checkGjenlevenderett(page)
			await selectBakgrunnAndFetch(page)

			await expect(page.getByTestId('EPS-ikke-funnet')).toBeVisible()
		})
	})

	test.describe('Validering ved innsending med gjenlevenderett', () => {
		test.beforeEach(async ({ page }) => {
			await setupDefaultMocks(page, {
				foedselsdato: GJENLEVENDERETT_FOEDSELSDATO,
			})
			await navigateToApp(page)
		})

		test('Viser feil ved innsending når EPS-opplysninger ikke er hentet', async ({
			page,
		}) => {
			await checkGjenlevenderett(page)

			const radioGroup = page.getByTestId('bakgrunn-for-bruk-EPS')
			await radioGroup
				.getByLabel('Henvendelse fra begge parter foreligger')
				.check()

			await fillMainFormFields(page)

			await page.getByRole('button', { name: 'Beregn pensjon' }).click()

			await expect(
				page.getByText(
					'Hent opplysninger om EPS eller beregn alderspensjon uten gjenlevenderett.'
				)
			).toBeVisible()
		})

		test('Viser feil ved innsending når bakgrunn ikke er valgt', async ({
			page,
		}) => {
			await checkGjenlevenderett(page)

			await fillMainFormFields(page)

			await page.getByRole('button', { name: 'Beregn pensjon' }).click()

			await expect(
				page.getByText('Velg bakgrunn for bruk av opplysninger om EPS.')
			).toBeVisible()
		})
	})

	test.describe('Validering av EPS-skjemafelter ved innsending', () => {
		test('Viser valideringsfeil for EPS-felter som ikke er fylt ut', async ({
			page,
		}) => {
			await setupDefaultMocks(page, {
				foedselsdato: GJENLEVENDERETT_FOEDSELSDATO,
			})
			await mockApi(page, EPS_API_URL, EPS_OPPLYSNING_MOCK_FILE)
			await navigateToApp(page)

			await checkGjenlevenderett(page)
			await selectBakgrunnAndFetch(page)

			await expect(page.getByTestId('EPS-opplysninger-info')).toBeVisible()

			await fillMainFormFields(page)

			await page.getByRole('button', { name: 'Beregn pensjon' }).click()

			await expect(
				page.getByText('Fyll ut år bodd/jobbet i utlandet etter fylte 16 år.')
			).toBeVisible()
			await expect(
				page.getByText('Fyll ut inntekt året før dødsdato.')
			).toBeVisible()
		})

		test('Vellykket innsending når alle EPS-felter er fylt ut', async ({
			page,
		}) => {
			await setupDefaultMocks(page, {
				foedselsdato: GJENLEVENDERETT_FOEDSELSDATO,
			})
			await mockApi(page, EPS_API_URL, EPS_OPPLYSNING_MOCK_FILE)
			await mockApi(page, SIMULERING_API_URL, ALDERSPENSJON_MOCK_FILE)
			await navigateToApp(page)

			await checkGjenlevenderett(page)
			await selectBakgrunnAndFetch(page)

			await expect(page.getByTestId('EPS-opplysninger-info')).toBeVisible()

			await page
				.getByRole('textbox', {
					name: 'Antall år bodd/jobbet i utlandet etter fylte 16 år',
				})
				.fill('5')
			await page
				.getByRole('textbox', {
					name: 'Pensjonsgivende inntekt året før dødsdato',
				})
				.fill('400000')

			const minstInntektGroup = page.getByRole('group', {
				name: /Minst 1G.*i pensjonsgivende inntekt ved dødsdato/,
			})
			await expect(minstInntektGroup).not.toBeVisible()

			const medlemGroup = page.getByRole('group', {
				name: 'Medlem av folketrygden de 5 siste årene før dødsdato',
			})
			await expect(medlemGroup).toBeVisible()
			await medlemGroup.getByLabel('Ja').check()

			const flyktningGroup = page.getByRole('group', {
				name: 'Registrert som flyktning',
			})
			await expect(flyktningGroup).toBeVisible()
			await flyktningGroup.getByLabel('Nei').check()

			await fillMainFormFields(page)

			await page.getByRole('button', { name: 'Beregn pensjon' }).click()

			await expect(
				page.getByText('Fyll ut år bodd/jobbet i utlandet etter fylte 16 år.')
			).not.toBeVisible()
			await expect(
				page.getByText('Fyll ut inntekt året før dødsdato.')
			).not.toBeVisible()
		})

		test('Viser feil for EPS utenlandsopphold over 39 år', async ({ page }) => {
			await setupDefaultMocks(page, {
				foedselsdato: GJENLEVENDERETT_FOEDSELSDATO,
			})
			await mockApi(page, EPS_API_URL, EPS_OPPLYSNING_MOCK_FILE)
			await navigateToApp(page)

			await checkGjenlevenderett(page)
			await selectBakgrunnAndFetch(page)

			await expect(page.getByTestId('EPS-opplysninger-info')).toBeVisible()

			await page
				.getByRole('textbox', {
					name: 'Antall år bodd/jobbet i utlandet etter fylte 16 år',
				})
				.fill('40')

			await fillMainFormFields(page)

			await page.getByRole('button', { name: 'Beregn pensjon' }).click()

			await expect(
				page.getByText('Antall år i utlandet kan ikke være større enn 39 år.')
			).toBeVisible()
		})
	})
})
