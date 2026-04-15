import { type Page, expect, test } from '@playwright/test'
import { loadJSONMock, mockApi } from 'utils/mock'

const PERSON_API_URL = '**/api/intern/v1/person'
const DECRYPT_API_URL = '**/api/v1/decrypt'
const LOEPENDE_VEDTAK_API_URL = '**/api/v4/vedtak/loepende-vedtak'
const GRUNNBELOEP_API_URL = '**/api/v1/grunnbel*'
const INNTEKT_API_URL = '**/api/inntekt'
const SIMULERING_API_URL = '**/api/intern/v1/pensjon/simulering'

const PERSON_MOCK_FILE = 'person-intern.json'
const LOEPENDE_VEDTAK_MOCK_FILE = 'loepende-vedtak.json'
const INNTEKT_MOCK_FILE = 'inntekt.json'
const ALDERSPENSJON_MOCK_FILE = 'alderspensjon.json'

async function setupDefaultMocks(
	page: Page,
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

async function navigateToApp(page: Page) {
	await page.goto('/?pid=encrypted-default-pid')
	await expect(
		page.getByRole('group', {
			name: 'Har bruker opphold utenfor Norge?',
		})
	).toBeVisible()
}

/** setupDefaultMocks + navigateToApp + selectHarOppholdUtenforNorge('Ja') */
async function setupWithEditorOpen(
	page: Page,
	personOverrides?: Record<string, unknown>
) {
	await setupDefaultMocks(page, personOverrides)
	await navigateToApp(page)
	await selectHarOppholdUtenforNorge(page, 'Ja')
}

async function selectHarOppholdUtenforNorge(page: Page, value: 'Ja' | 'Nei') {
	const radioGroup = page.getByRole('group', {
		name: 'Har bruker opphold utenfor Norge?',
	})
	await radioGroup.getByLabel(value).check()
}

async function selectLand(page: Page, landkode: string) {
	await page.getByRole('combobox', { name: 'Land' }).selectOption(landkode)
}

async function fillStartdato(page: Page, date: string) {
	await page.getByLabel('Startdato').fill(date)
}

async function fillSluttdato(page: Page, date: string) {
	await page.getByLabel('Sluttdato (valgfritt)').fill(date)
}

async function clickLeggTil(page: Page) {
	await page.getByRole('button', { name: 'Legg til' }).click()
}

async function addOpphold(
	page: Page,
	options: {
		landkode: string
		startdato: string
		sluttdato?: string
		arbeidetUtenlands?: boolean
	}
) {
	await selectLand(page, options.landkode)
	if (options.arbeidetUtenlands !== undefined) {
		const jobbetGroup = page.getByRole('group', {
			name: 'Jobbet bruker i landet?',
		})
		await jobbetGroup
			.getByLabel(options.arbeidetUtenlands ? 'Ja' : 'Nei')
			.check()
	}
	await fillStartdato(page, options.startdato)
	if (options.sluttdato) {
		await fillSluttdato(page, options.sluttdato)
	}
	await clickLeggTil(page)
}

async function fillMainFormFields(page: Page) {
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

async function expectOppholdInList(
	page: Page,
	landNavn: string,
	dateText?: string
) {
	const listItem = page.locator('strong', { hasText: landNavn })
	await expect(listItem).toBeVisible()
	if (dateText) {
		const parent = listItem.locator('..').locator('..')
		await expect(parent.getByText(dateText)).toBeVisible()
	}
}

async function expectNoOppholdInList(page: Page, landNavn: string) {
	await expect(page.locator('strong', { hasText: landNavn })).not.toBeVisible()
}

function beregnPensjonButton(page: Page) {
	return page.getByRole('button', { name: /Beregn pensjon|Oppdater pensjon/ })
}

test.describe('Utenlandsopphold', () => {
	test.describe('Visning av radio-sporsmal', () => {
		test('Viser radio-sporsmal for utenlandsopphold', async ({ page }) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)

			await expect(
				page.getByRole('group', {
					name: 'Har bruker opphold utenfor Norge?',
				})
			).toBeVisible()
		})
	})

	test.describe('Apning og lukking av editor', () => {
		test.beforeEach(async ({ page }) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)
		})

		test('Apner editor nar Ja velges', async ({ page }) => {
			await selectHarOppholdUtenforNorge(page, 'Ja')

			await expect(page.getByRole('combobox', { name: 'Land' })).toBeVisible()
		})

		test('Skjuler editor nar Nei velges etter Ja', async ({ page }) => {
			await selectHarOppholdUtenforNorge(page, 'Ja')
			await expect(page.getByRole('combobox', { name: 'Land' })).toBeVisible()

			await selectHarOppholdUtenforNorge(page, 'Nei')
			await expect(
				page.getByRole('combobox', { name: 'Land' })
			).not.toBeVisible()
		})

		test('Viser datofelter etter valg av land', async ({ page }) => {
			await selectHarOppholdUtenforNorge(page, 'Ja')
			await selectLand(page, 'AFG')

			await expect(page.getByLabel('Startdato')).toBeVisible()
			await expect(page.getByLabel('Sluttdato (valgfritt)')).toBeVisible()
		})

		test('Viser Bruk fodselsdato-checkbox etter valg av land', async ({
			page,
		}) => {
			await selectHarOppholdUtenforNorge(page, 'Ja')
			await selectLand(page, 'AFG')

			await expect(page.getByLabel('Bruk fødselsdato')).toBeVisible()
		})
	})

	test.describe('Avtaleland og ikke-avtaleland', () => {
		test.beforeEach(async ({ page }) => {
			await setupWithEditorOpen(page)
		})

		test('Viser Jobbet-sporsmal for avtaleland', async ({ page }) => {
			await selectLand(page, 'AUS')

			await expect(
				page.getByRole('group', { name: 'Jobbet bruker i landet?' })
			).toBeVisible()
		})

		test('Viser ikke Jobbet-sporsmal for ikke-avtaleland', async ({ page }) => {
			await selectLand(page, 'AFG')

			await expect(
				page.getByRole('group', { name: 'Jobbet bruker i landet?' })
			).not.toBeVisible()
		})

		test('Viser ikke Jobbet-sporsmal for avtaleland med kravOmArbeid=false', async ({
			page,
		}) => {
			await selectLand(page, 'DNK')

			await expect(
				page.getByRole('group', { name: 'Jobbet bruker i landet?' })
			).not.toBeVisible()
		})

		test('Skjuler Jobbet-sporsmal ved bytte fra avtaleland til ikke-avtaleland', async ({
			page,
		}) => {
			await selectLand(page, 'AUS')
			await expect(
				page.getByRole('group', { name: 'Jobbet bruker i landet?' })
			).toBeVisible()

			await selectLand(page, 'AFG')
			await expect(
				page.getByRole('group', { name: 'Jobbet bruker i landet?' })
			).not.toBeVisible()
		})

		test('Bytte av land nullstiller arbeidetUtenlands-svar', async ({
			page,
		}) => {
			await selectLand(page, 'AUS')
			const jobbetGroup = page.getByRole('group', {
				name: 'Jobbet bruker i landet?',
			})
			await jobbetGroup.getByLabel('Ja').check()
			await expect(jobbetGroup.getByLabel('Ja')).toBeChecked()

			await selectLand(page, 'CAN')
			await expect(jobbetGroup.getByLabel('Ja')).not.toBeChecked()
			await expect(jobbetGroup.getByLabel('Nei')).not.toBeChecked()
		})
	})

	test.describe('Legg til opphold', () => {
		test.beforeEach(async ({ page }) => {
			await setupWithEditorOpen(page)
		})

		test('Legger til opphold for ikke-avtaleland', async ({ page }) => {
			await addOpphold(page, {
				landkode: 'AFG',
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await expectOppholdInList(page, 'Afghanistan', '01.01.2000-31.12.2005')
		})

		test('Legger til opphold for avtaleland med jobbet', async ({ page }) => {
			await addOpphold(page, {
				landkode: 'AUS',
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
				arbeidetUtenlands: true,
			})

			await expectOppholdInList(page, 'Australia')
		})

		test('Legger til varig opphold uten sluttdato', async ({ page }) => {
			await addOpphold(page, {
				landkode: 'AFG',
				startdato: '01.01.2000',
			})

			await expectOppholdInList(page, 'Afghanistan')
			await expect(page.getByText('Varig opphold')).toBeVisible()
		})

		test('Viser Legg til nytt opphold-knapp etter opphold er lagt til', async ({
			page,
		}) => {
			await addOpphold(page, {
				landkode: 'AFG',
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await expect(
				page.getByRole('button', { name: 'Legg til nytt opphold' })
			).toBeVisible()
		})

		test('Apner ny editor ved klikk pa Legg til nytt opphold', async ({
			page,
		}) => {
			await addOpphold(page, {
				landkode: 'AFG',
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await page.getByRole('button', { name: 'Legg til nytt opphold' }).click()

			await expect(page.getByRole('combobox', { name: 'Land' })).toBeVisible()
		})

		test('Legger til flere opphold', async ({ page }) => {
			await addOpphold(page, {
				landkode: 'AFG',
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await page.getByRole('button', { name: 'Legg til nytt opphold' }).click()

			await addOpphold(page, {
				landkode: 'AUS',
				startdato: '01.01.2010',
				sluttdato: '31.12.2015',
				arbeidetUtenlands: false,
			})

			await expectOppholdInList(page, 'Afghanistan')
			await expectOppholdInList(page, 'Australia')
		})
	})

	test.describe('Bruk fodselsdato', () => {
		test.beforeEach(async ({ page }) => {
			await setupWithEditorOpen(page)
		})

		test('Fyller inn fodselsdato som startdato ved avkrysning', async ({
			page,
		}) => {
			await selectLand(page, 'AFG')

			await page.getByLabel('Bruk fødselsdato').check()

			await expect(page.getByLabel('Startdato')).toHaveValue('30.04.1964')
		})

		test('Manuell endring av startdato fjerner avkrysning av Bruk fodselsdato', async ({
			page,
		}) => {
			await selectLand(page, 'AFG')
			await page.getByLabel('Bruk fødselsdato').check()
			await expect(page.getByLabel('Startdato')).toHaveValue('30.04.1964')
			await expect(page.getByLabel('Bruk fødselsdato')).toBeChecked()

			await fillStartdato(page, '01.01.2000')

			await expect(page.getByLabel('Bruk fødselsdato')).not.toBeChecked()
		})
	})

	test.describe('Rediger opphold', () => {
		test.beforeEach(async ({ page }) => {
			await setupWithEditorOpen(page)
		})

		test('Apner editor med eksisterende verdier ved klikk pa Endre', async ({
			page,
		}) => {
			await addOpphold(page, {
				landkode: 'AFG',
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await page.getByRole('button', { name: 'Endre' }).click()

			await expect(page.getByRole('combobox', { name: 'Land' })).toHaveValue(
				'AFG'
			)
			await expect(page.getByLabel('Startdato')).toHaveValue('01.01.2000')
			await expect(page.getByLabel('Sluttdato (valgfritt)')).toHaveValue(
				'31.12.2005'
			)
		})

		test('Viser Oppdater-knapp i redigeringsmodus', async ({ page }) => {
			await addOpphold(page, {
				landkode: 'AFG',
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await page.getByRole('button', { name: 'Endre' }).click()

			await expect(page.getByRole('button', { name: 'Oppdater' })).toBeVisible()
		})

		test('Oppdaterer opphold etter redigering', async ({ page }) => {
			await addOpphold(page, {
				landkode: 'AFG',
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await page.getByRole('button', { name: 'Endre' }).click()
			await fillSluttdato(page, '31.12.2010')
			await page.getByRole('button', { name: 'Oppdater' }).click()

			await expectOppholdInList(page, 'Afghanistan', '01.01.2000-31.12.2010')
		})

		test('Oppdater uten endringer utloser ikke overlapp-feil (self-overlap skip)', async ({
			page,
		}) => {
			await addOpphold(page, {
				landkode: 'AUS',
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
				arbeidetUtenlands: false,
			})

			await page.getByRole('button', { name: 'Endre' }).click()
			await page.getByRole('button', { name: 'Oppdater' }).click()

			await expect(
				page.getByText(/Du har allerede registrert/)
			).not.toBeVisible()
			await expectOppholdInList(page, 'Australia')
		})
	})

	test.describe('Slett opphold', () => {
		test.beforeEach(async ({ page }) => {
			await setupWithEditorOpen(page)
		})

		test('Sletter opphold ved klikk pa Slett', async ({ page }) => {
			await addOpphold(page, {
				landkode: 'AFG',
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await expectOppholdInList(page, 'Afghanistan')

			await page.getByRole('button', { name: 'Slett' }).click()

			await expectNoOppholdInList(page, 'Afghanistan')
		})

		test('Apner ny editor etter sletting av siste opphold', async ({
			page,
		}) => {
			await addOpphold(page, {
				landkode: 'AFG',
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await page.getByRole('button', { name: 'Slett' }).click()

			await expect(page.getByRole('combobox', { name: 'Land' })).toBeVisible()
		})
	})

	test.describe('Avbryt opphold', () => {
		test.beforeEach(async ({ page }) => {
			await setupWithEditorOpen(page)
		})

		test('Avbryter redigering og beholder original verdier', async ({
			page,
		}) => {
			await addOpphold(page, {
				landkode: 'AFG',
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await page.getByRole('button', { name: 'Endre' }).click()
			await fillSluttdato(page, '31.12.2020')
			await page.getByRole('button', { name: 'Avbryt' }).click()

			await expectOppholdInList(page, 'Afghanistan', '01.01.2000-31.12.2005')
		})

		test('Avbryter nytt opphold nar det finnes eksisterende opphold', async ({
			page,
		}) => {
			await addOpphold(page, {
				landkode: 'AFG',
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await page.getByRole('button', { name: 'Legg til nytt opphold' }).click()
			await page.getByRole('button', { name: 'Avbryt' }).click()

			await expect(
				page.getByRole('combobox', { name: 'Land' })
			).not.toBeVisible()
			await expect(
				page.getByRole('button', { name: 'Legg til nytt opphold' })
			).toBeVisible()
		})

		test('Avbryt er skjult pa forste tomme editor (ingen eksisterende opphold)', async ({
			page,
		}) => {
			await expect(page.getByRole('combobox', { name: 'Land' })).toBeVisible()
			await expect(
				page.getByRole('button', { name: 'Avbryt' })
			).not.toBeVisible()
		})

		test('Avbryt er synlig nar det finnes eksisterende opphold', async ({
			page,
		}) => {
			await addOpphold(page, {
				landkode: 'AFG',
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await page.getByRole('button', { name: 'Legg til nytt opphold' }).click()

			await expect(page.getByRole('button', { name: 'Avbryt' })).toBeVisible()
		})
	})

	test.describe('Validering av opphold', () => {
		test.beforeEach(async ({ page }) => {
			await setupWithEditorOpen(page)
		})

		test('Viser feil nar land ikke er valgt', async ({ page }) => {
			await clickLeggTil(page)

			await expect(
				page.getByText('Du må velge land for oppholdet ditt.')
			).toBeVisible()
		})

		test('Viser feil nar startdato mangler', async ({ page }) => {
			await selectLand(page, 'AFG')
			await clickLeggTil(page)

			await expect(
				page.getByText('Du må oppgi startdato for oppholdet ditt.')
			).toBeVisible()
		})

		test('Viser feil for ugyldig datoformat i startdato', async ({ page }) => {
			await selectLand(page, 'AFG')
			await fillStartdato(page, '2000-01-01')
			await clickLeggTil(page)

			await expect(
				page.getByText('Oppgi dag, måned og år som DD.MM.ÅÅÅÅ.')
			).toBeVisible()
		})

		test('Viser feil for ugyldig datoformat i sluttdato', async ({ page }) => {
			await selectLand(page, 'AFG')
			await fillStartdato(page, '01.01.2000')
			await fillSluttdato(page, '2005-12-31')
			await clickLeggTil(page)

			await expect(
				page.getByText('Oppgi dag, måned og år som DD.MM.ÅÅÅÅ.')
			).toBeVisible()
		})

		test('Viser feil nar startdato er for fodselsdato', async ({ page }) => {
			await selectLand(page, 'AFG')
			await fillStartdato(page, '01.01.1960')
			await clickLeggTil(page)

			await expect(
				page.getByText('Startdato kan ikke være før fødselsdatoen din.')
			).toBeVisible()
		})

		test('Viser feil nar sluttdato er for startdato', async ({ page }) => {
			await selectLand(page, 'AFG')
			await fillStartdato(page, '01.01.2000')
			await fillSluttdato(page, '01.01.1999')
			await clickLeggTil(page)

			await expect(
				page.getByText('Sluttdato kan ikke være før startdato.')
			).toBeVisible()
		})

		test('Viser feil nar arbeidet utenlands ikke er besvart for avtaleland', async ({
			page,
		}) => {
			await selectLand(page, 'AUS')
			await fillStartdato(page, '01.01.2000')
			await clickLeggTil(page)

			await expect(
				page.getByText(
					'Du må svare «Ja» eller «Nei» på om du jobbet under oppholdet.'
				)
			).toBeVisible()
		})

		test('Fjerner feilmelding nar felt korrigeres', async ({ page }) => {
			await clickLeggTil(page)
			await expect(
				page.getByText('Du må velge land for oppholdet ditt.')
			).toBeVisible()

			await selectLand(page, 'AFG')
			await expect(
				page.getByText('Du må velge land for oppholdet ditt.')
			).not.toBeVisible()
		})

		test('Viser feil nar startdato er etter maks-dato (fodselsdato + 100 ar)', async ({
			page,
		}) => {
			await selectLand(page, 'AFG')
			await fillStartdato(page, '01.05.2064')
			await clickLeggTil(page)

			await expect(
				page.getByText(
					'Startdato kan ikke være senere enn 100 år etter fødselsdatoen din.'
				)
			).toBeVisible()
		})

		test('Viser feil nar sluttdato er etter maks-dato (fodselsdato + 100 ar)', async ({
			page,
		}) => {
			await selectLand(page, 'AFG')
			await fillStartdato(page, '01.01.2060')
			await fillSluttdato(page, '01.05.2064')
			await clickLeggTil(page)

			await expect(
				page.getByText(
					'Sluttdato kan ikke være senere enn 100 år etter fødselsdatoen din.'
				)
			).toBeVisible()
		})
	})

	test.describe('Overlappende perioder', () => {
		test.beforeEach(async ({ page }) => {
			await setupWithEditorOpen(page)
		})

		test('Viser feil for overlappende opphold med ikke-avtaleland', async ({
			page,
		}) => {
			await addOpphold(page, {
				landkode: 'AFG',
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await page.getByRole('button', { name: 'Legg til nytt opphold' }).click()

			await selectLand(page, 'AFG')
			await fillStartdato(page, '01.06.2003')
			await fillSluttdato(page, '31.12.2008')
			await clickLeggTil(page)

			await expect(
				page.getByText(/Du har allerede registrert at du har bodd i/)
			).toBeVisible()
		})

		test('Tillater ikke-overlappende opphold i samme land', async ({
			page,
		}) => {
			await addOpphold(page, {
				landkode: 'AFG',
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await page.getByRole('button', { name: 'Legg til nytt opphold' }).click()

			await addOpphold(page, {
				landkode: 'AFG',
				startdato: '01.01.2006',
				sluttdato: '31.12.2010',
			})

			const afghanistanItems = page.locator('strong', {
				hasText: 'Afghanistan',
			})
			await expect(afghanistanItems).toHaveCount(2)
		})

		test('Viser feil for overlappende opphold i to ulike avtaleland', async ({
			page,
		}) => {
			await addOpphold(page, {
				landkode: 'AUS',
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
				arbeidetUtenlands: true,
			})

			await page.getByRole('button', { name: 'Legg til nytt opphold' }).click()

			await selectLand(page, 'CAN')
			const jobbetGroup = page.getByRole('group', {
				name: 'Jobbet bruker i landet?',
			})
			await jobbetGroup.getByLabel('Ja').check()
			await fillStartdato(page, '01.06.2003')
			await fillSluttdato(page, '31.12.2008')
			await clickLeggTil(page)

			await expect(
				page.getByText(/Du kan ikke ha overlappende opphold i to ulike land/)
			).toBeVisible()
		})

		test('Viser feil for overlappende boopphold i samme avtaleland', async ({
			page,
		}) => {
			await addOpphold(page, {
				landkode: 'AUS',
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
				arbeidetUtenlands: false,
			})

			await page.getByRole('button', { name: 'Legg til nytt opphold' }).click()

			await selectLand(page, 'AUS')
			const jobbetGroup = page.getByRole('group', {
				name: 'Jobbet bruker i landet?',
			})
			await jobbetGroup.getByLabel('Nei').check()
			await fillStartdato(page, '01.06.2003')
			await fillSluttdato(page, '31.12.2008')
			await clickLeggTil(page)

			await expect(
				page.getByText(/Du kan ikke ha overlappende boopphold/)
			).toBeVisible()
		})

		test('Viser feil for overlappende jobbperioder i samme avtaleland', async ({
			page,
		}) => {
			await addOpphold(page, {
				landkode: 'AUS',
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
				arbeidetUtenlands: true,
			})

			await page.getByRole('button', { name: 'Legg til nytt opphold' }).click()

			await selectLand(page, 'AUS')
			const jobbetGroup = page.getByRole('group', {
				name: 'Jobbet bruker i landet?',
			})
			await jobbetGroup.getByLabel('Ja').check()
			await fillStartdato(page, '01.06.2003')
			await fillSluttdato(page, '31.12.2008')
			await clickLeggTil(page)

			await expect(
				page.getByText(/Du kan ikke ha overlappende jobbperioder/)
			).toBeVisible()
		})

		test('Viser feil for overlapp med varig opphold (uten sluttdato)', async ({
			page,
		}) => {
			await addOpphold(page, {
				landkode: 'AFG',
				startdato: '01.01.2000',
			})

			await page.getByRole('button', { name: 'Legg til nytt opphold' }).click()

			await selectLand(page, 'AFG')
			await fillStartdato(page, '01.01.2010')
			await fillSluttdato(page, '31.12.2015')
			await clickLeggTil(page)

			await expect(
				page.getByText(/Du har allerede registrert at du har bodd i/)
			).toBeVisible()
		})
	})

	test.describe('Endre/Slett-knapper skjules under redigering', () => {
		test('Skjuler Endre/Slett pa andre opphold nar editor er apen', async ({
			page,
		}) => {
			await setupWithEditorOpen(page)

			await addOpphold(page, {
				landkode: 'AFG',
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await page.getByRole('button', { name: 'Legg til nytt opphold' }).click()

			await addOpphold(page, {
				landkode: 'AUS',
				startdato: '01.01.2010',
				sluttdato: '31.12.2015',
				arbeidetUtenlands: false,
			})

			await expect(page.getByRole('button', { name: 'Endre' })).toHaveCount(2)
			await expect(page.getByRole('button', { name: 'Slett' })).toHaveCount(2)

			await page.getByRole('button', { name: 'Endre' }).first().click()

			await expect(
				page.getByRole('button', { name: 'Endre' })
			).not.toBeVisible()
			await expect(
				page.getByRole('button', { name: 'Slett' })
			).not.toBeVisible()
		})
	})

	test.describe('CopyButton synlighet', () => {
		test('CopyButton er skjult for opphold er lagt til', async ({ page }) => {
			await setupWithEditorOpen(page)

			await expect(
				page.getByRole('button', { name: 'Kopier opphold' })
			).not.toBeVisible()
		})

		test('CopyButton er synlig etter opphold er lagt til', async ({ page }) => {
			await setupWithEditorOpen(page)

			await addOpphold(page, {
				landkode: 'AFG',
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await expect(
				page.getByRole('button', { name: 'Kopier opphold' })
			).toBeVisible()
		})
	})

	test.describe('Ja-Nei-Ja tilstandshandtering', () => {
		test('Opphold er bevart nar bruker bytter til Nei og tilbake til Ja', async ({
			page,
		}) => {
			await setupWithEditorOpen(page)

			await addOpphold(page, {
				landkode: 'AFG',
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await expectOppholdInList(page, 'Afghanistan')

			await selectHarOppholdUtenforNorge(page, 'Nei')
			await expectNoOppholdInList(page, 'Afghanistan')

			await selectHarOppholdUtenforNorge(page, 'Ja')

			await expectOppholdInList(page, 'Afghanistan')
		})
	})

	test.describe('Nullstilling', () => {
		test('Nullstiller utenlandsopphold ved klikk pa Nullstill', async ({
			page,
		}) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)

			await selectHarOppholdUtenforNorge(page, 'Ja')
			await addOpphold(page, {
				landkode: 'AFG',
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await expectOppholdInList(page, 'Afghanistan')

			await page.getByRole('button', { name: 'Nullstill' }).click()

			await expectNoOppholdInList(page, 'Afghanistan')
			await expect(
				page.getByRole('combobox', { name: 'Land' })
			).not.toBeVisible()
		})
	})

	test.describe('Beregn pensjon-knapp deaktivering', () => {
		test.beforeEach(async ({ page }) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)
		})

		test('Beregn pensjon er deaktivert nar Ja er valgt men ingen opphold er lagret', async ({
			page,
		}) => {
			await selectHarOppholdUtenforNorge(page, 'Ja')

			await expect(beregnPensjonButton(page)).toBeDisabled()
		})

		test('Beregn pensjon er deaktivert nar editor er apen (redigering)', async ({
			page,
		}) => {
			await selectHarOppholdUtenforNorge(page, 'Ja')
			await addOpphold(page, {
				landkode: 'AFG',
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await expect(beregnPensjonButton(page)).toBeEnabled()

			await page.getByRole('button', { name: 'Endre' }).click()
			await expect(beregnPensjonButton(page)).toBeDisabled()
		})

		test('Beregn pensjon er aktivert nar Ja er valgt og opphold er lagret og editor er lukket', async ({
			page,
		}) => {
			await selectHarOppholdUtenforNorge(page, 'Ja')
			await addOpphold(page, {
				landkode: 'AFG',
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await expect(beregnPensjonButton(page)).toBeEnabled()
		})

		test('Beregn pensjon er aktivert nar Nei er valgt', async ({ page }) => {
			await selectHarOppholdUtenforNorge(page, 'Nei')

			await expect(beregnPensjonButton(page)).toBeEnabled()
		})
	})

	test.describe('Innsending med utenlandsopphold', () => {
		test('Sender inn skjema med utenlandsopphold og verifiserer request', async ({
			page,
		}) => {
			await setupDefaultMocks(page)

			let capturedBody: Record<string, unknown> | undefined
			await page.route(SIMULERING_API_URL, async (route) => {
				capturedBody = route.request().postDataJSON() as Record<string, unknown>
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify(await loadJSONMock(ALDERSPENSJON_MOCK_FILE)),
				})
			})

			await navigateToApp(page)
			await selectHarOppholdUtenforNorge(page, 'Ja')

			await addOpphold(page, {
				landkode: 'AUS',
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
				arbeidetUtenlands: true,
			})

			await fillMainFormFields(page)

			await page
				.getByRole('group', {
					name: /Mottar .+ pensjon, uføretrygd eller AFP ved uttak/,
				})
				.getByLabel('Ja')
				.check()

			await page
				.getByRole('group', { name: 'Skal AFP inkluderes?' })
				.getByLabel('Nei')
				.check()

			await beregnPensjonButton(page).click()

			await expect(async () => {
				expect(capturedBody).toBeDefined()
			}).toPass({ timeout: 5000 })

			expect(capturedBody!.utenlandsperiodeListe).toBeDefined()
			const perioder = capturedBody!.utenlandsperiodeListe as Array<
				Record<string, unknown>
			>
			expect(perioder.length).toBe(1)
			expect(perioder[0].landkode).toBe('AUS')
			expect(perioder[0].arbeidetUtenlands).toBe(true)
		})

		test('Sender inn skjema med Nei pa utenlandsopphold', async ({ page }) => {
			await setupDefaultMocks(page)

			let requestReceived = false
			await page.route(SIMULERING_API_URL, async (route) => {
				requestReceived = true
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify(await loadJSONMock(ALDERSPENSJON_MOCK_FILE)),
				})
			})

			await navigateToApp(page)
			await selectHarOppholdUtenforNorge(page, 'Nei')

			await fillMainFormFields(page)

			await page
				.getByRole('group', {
					name: /Mottar .+ pensjon, uføretrygd eller AFP ved uttak/,
				})
				.getByLabel('Ja')
				.check()

			await page
				.getByRole('group', { name: 'Skal AFP inkluderes?' })
				.getByLabel('Nei')
				.check()

			await beregnPensjonButton(page).click()

			await expect(async () => {
				expect(requestReceived).toBe(true)
			}).toPass({ timeout: 5000 })

			await expect(
				page.getByRole('combobox', { name: 'Land' })
			).not.toBeVisible()
		})
	})
})
