import { type Page, expect, test } from '@playwright/test'

import { loadJSONMock, mockApiError } from '../utils/mock'
import {
	API_URLS,
	MOCK_FILES,
	navigateToApp,
	setupDefaultMocks,
} from '../utils/test-helpers'

const HAR_OPPHOLD_UTENFOR_NORGE = 'Har bruker opphold utenfor Norge?'
const JOBBET_I_LANDET = 'Jobbet bruker i landet?'

const TEST_FOEDSELSDATO_ISO = '1964-04-30'
const TEST_FOEDSELSDATO_DISPLAY = '30.04.1964'
const POLL_TIMEOUT = 5000

const LAND = {
	AFG: { kode: 'AFG', navn: 'Afghanistan' },
	AUS: { kode: 'AUS', navn: 'Australia' },
	CAN: { kode: 'CAN', navn: 'Canada' },
	DNK: { kode: 'DNK', navn: 'Danmark' },
} as const

const afterMaxMessage = (felt: 'Startdato' | 'Sluttdato') =>
	`${felt} kan ikke være senere enn 100 år etter fødselsdatoen din.`

const VALIDATION_MESSAGES = {
	landRequired: 'Du må velge land for oppholdet ditt.',
	startdatoRequired: 'Du må oppgi startdato for oppholdet ditt.',
	dateFormat: 'Oppgi dag, måned og år som DD.MM.ÅÅÅÅ.',
	startdatoBeforeFoedselsdato: 'Startdato kan ikke være før fødselsdatoen din.',
	sluttdatoBeforeStartdato: 'Sluttdato kan ikke være før startdato.',
	arbeidetUtenlandsRequired:
		'Du må svare «Ja» eller «Nei» på om du jobbet under oppholdet.',
	startdatoAfterMax: afterMaxMessage('Startdato'),
	sluttdatoAfterMax: afterMaxMessage('Sluttdato'),
} as const

const OVERLAP_MESSAGES = {
	sameCountry: /Du kan ikke ha overlappende opphold med landet \S+\.$/,
	differentCountries: /Du kan ikke ha overlappende opphold i to ulike land\.$/,
	boopphold: /Du kan ikke ha overlappende boopphold\.$/,
	jobbperioder: /Du kan ikke ha overlappende jobbperioder\.$/,
} as const

type SimuleringUtenlandsperiodePayload = {
	landkode: string
	arbeidetUtenlands: boolean
	fom: string
	tom?: string
}

type SimuleringPayload = {
	utenlandsperiodeListe?: SimuleringUtenlandsperiodePayload[]
}

async function setupWithEditorOpen(
	page: Page,
	personOverrides?: Record<string, unknown>
) {
	await setupDefaultMocks(page, {
		foedselsdato: TEST_FOEDSELSDATO_ISO,
		...personOverrides,
	})
	await navigateToApp(page)
	await selectHarOppholdUtenforNorge(page, 'Ja')
}

async function selectHarOppholdUtenforNorge(page: Page, value: 'Ja' | 'Nei') {
	const radioGroup = page.getByRole('group', {
		name: HAR_OPPHOLD_UTENFOR_NORGE,
	})
	await radioGroup.getByLabel(value).check()
}

function jobbetGroup(page: Page) {
	return page.getByRole('group', { name: JOBBET_I_LANDET })
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

async function clickLeggTilNyttOpphold(page: Page) {
	await page.getByRole('button', { name: 'Legg til nytt opphold' }).click()
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
		await jobbetGroup(page)
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

function oppholdListItems(page: Page, landNavn?: string) {
	const items = page.getByTestId('opphold-list-item')
	return landNavn ? items.filter({ hasText: landNavn }) : items
}

async function expectOppholdInList(
	page: Page,
	landNavn: string,
	dateText?: string
) {
	await expect(oppholdListItems(page, landNavn)).toBeVisible()
	if (dateText) {
		await expect(page.getByText(dateText, { exact: true })).toBeVisible()
	}
}

async function expectNoOppholdInList(page: Page, landNavn: string) {
	await expect(oppholdListItems(page, landNavn)).toHaveCount(0)
}

function beregnPensjonButton(page: Page) {
	return page.getByRole('button', {
		name: /^(Beregn|Oppdater) pensjon$/,
	})
}

function validationAlert(page: Page, message: string | RegExp) {
	return page.getByText(message)
}

async function expectValidationMessage(page: Page, message: string | RegExp) {
	await expect(validationAlert(page, message)).toBeVisible()
}

async function expectNoValidationMessage(page: Page, message: string | RegExp) {
	await expect(validationAlert(page, message)).toHaveCount(0)
}

async function completeRemainingSimulationFields(page: Page) {
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
}

async function setupSimulationCapture(page: Page) {
	let capturedBody: SimuleringPayload | undefined

	await page.route(API_URLS.SIMULERING, async (route) => {
		capturedBody = route.request().postDataJSON() as SimuleringPayload
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(await loadJSONMock(MOCK_FILES.ALDERSPENSJON)),
		})
	})

	return {
		getCapturedBody: () => capturedBody,
	}
}

async function expectSimulationPeriods(
	getCapturedBody: () => SimuleringPayload | undefined,
	expectedPeriods: SimuleringUtenlandsperiodePayload[]
) {
	await expect
		.poll(() => getCapturedBody()?.utenlandsperiodeListe, {
			timeout: POLL_TIMEOUT,
		})
		.toEqual(expectedPeriods)
}

async function readClipboardText(page: Page) {
	return page.evaluate(async () => navigator.clipboard.readText())
}

async function setupForSimulation(page: Page) {
	await setupDefaultMocks(page)
	const capture = await setupSimulationCapture(page)
	await navigateToApp(page)
	await selectHarOppholdUtenforNorge(page, 'Ja')
	return capture
}

test.describe('Utenlandsopphold', () => {
	test.describe('Visning av radio-spørsmål', () => {
		test('Viser radio-spørsmål for utenlandsopphold', async ({ page }) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)

			await expect(
				page.getByRole('group', {
					name: 'Har bruker opphold utenfor Norge?',
				})
			).toBeVisible()
		})
	})

	test.describe('Åpning og lukking av editor', () => {
		test.beforeEach(async ({ page }) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)
		})

		test('Åpner editor når Ja velges', async ({ page }) => {
			await selectHarOppholdUtenforNorge(page, 'Ja')

			await expect(page.getByRole('combobox', { name: 'Land' })).toBeVisible()
		})

		test('Skjuler editor når Nei velges etter Ja', async ({ page }) => {
			await selectHarOppholdUtenforNorge(page, 'Ja')
			await expect(page.getByRole('combobox', { name: 'Land' })).toBeVisible()

			await selectHarOppholdUtenforNorge(page, 'Nei')
			await expect(
				page.getByRole('combobox', { name: 'Land' })
			).not.toBeVisible()
		})

		test('Viser datofelter etter valg av land', async ({ page }) => {
			await selectHarOppholdUtenforNorge(page, 'Ja')
			await selectLand(page, LAND.AFG.kode)

			await expect(page.getByLabel('Startdato')).toBeVisible()
			await expect(page.getByLabel('Sluttdato (valgfritt)')).toBeVisible()
		})

		test('Viser Bruk fødselsdato-checkbox etter valg av land', async ({
			page,
		}) => {
			await selectHarOppholdUtenforNorge(page, 'Ja')
			await selectLand(page, LAND.AFG.kode)

			await expect(page.getByLabel('Bruk fødselsdato')).toBeVisible()
		})
	})

	test.describe('Avtaleland og ikke-avtaleland', () => {
		test.beforeEach(async ({ page }) => {
			await setupWithEditorOpen(page)
		})

		test('Viser Jobbet-spørsmål for avtaleland', async ({ page }) => {
			await selectLand(page, LAND.AUS.kode)

			await expect(jobbetGroup(page)).toBeVisible()
		})

		test('Viser ikke Jobbet-spørsmål for ikke-avtaleland', async ({ page }) => {
			await selectLand(page, LAND.AFG.kode)

			await expect(jobbetGroup(page)).not.toBeVisible()
		})

		test('Viser ikke Jobbet-spørsmål for avtaleland med kravOmArbeid=false', async ({
			page,
		}) => {
			await selectLand(page, LAND.DNK.kode)

			await expect(jobbetGroup(page)).not.toBeVisible()
		})

		test('Skjuler Jobbet-spørsmål ved bytte fra avtaleland til ikke-avtaleland', async ({
			page,
		}) => {
			await selectLand(page, LAND.AUS.kode)
			await expect(jobbetGroup(page)).toBeVisible()

			await selectLand(page, LAND.AFG.kode)
			await expect(jobbetGroup(page)).not.toBeVisible()
		})

		test('Bytte av land nullstiller arbeidetUtenlands-svar', async ({
			page,
		}) => {
			await selectLand(page, LAND.AUS.kode)
			await jobbetGroup(page).getByLabel('Ja').check()
			await expect(jobbetGroup(page).getByLabel('Ja')).toBeChecked()

			await selectLand(page, LAND.CAN.kode)
			await expect(jobbetGroup(page).getByLabel('Ja')).not.toBeChecked()
			await expect(jobbetGroup(page).getByLabel('Nei')).not.toBeChecked()
		})
	})

	test.describe('Legg til opphold', () => {
		test.beforeEach(async ({ page }) => {
			await setupWithEditorOpen(page)
		})

		test('Legger til opphold for ikke-avtaleland', async ({ page }) => {
			await addOpphold(page, {
				landkode: LAND.AFG.kode,
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await expectOppholdInList(page, LAND.AFG.navn, '01.01.2000-31.12.2005')
		})

		test('Legger til opphold for avtaleland med jobbet', async ({ page }) => {
			await addOpphold(page, {
				landkode: LAND.AUS.kode,
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
				arbeidetUtenlands: true,
			})

			await expectOppholdInList(page, LAND.AUS.navn)
		})

		test('Legger til varig opphold uten sluttdato', async ({ page }) => {
			await addOpphold(page, {
				landkode: LAND.AFG.kode,
				startdato: '01.01.2000',
			})

			await expectOppholdInList(page, LAND.AFG.navn)
			await expect(page.getByText('Varig opphold')).toBeVisible()
		})

		test('Viser Legg til nytt opphold-knapp etter opphold er lagt til', async ({
			page,
		}) => {
			await addOpphold(page, {
				landkode: LAND.AFG.kode,
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await expect(
				page.getByRole('button', { name: 'Legg til nytt opphold' })
			).toBeVisible()
		})

		test('Åpner ny editor ved klikk på Legg til nytt opphold', async ({
			page,
		}) => {
			await addOpphold(page, {
				landkode: LAND.AFG.kode,
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await clickLeggTilNyttOpphold(page)

			await expect(page.getByRole('combobox', { name: 'Land' })).toBeVisible()
		})

		test('Legger til flere opphold', async ({ page }) => {
			await addOpphold(page, {
				landkode: LAND.AFG.kode,
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await clickLeggTilNyttOpphold(page)

			await addOpphold(page, {
				landkode: LAND.AUS.kode,
				startdato: '01.01.2010',
				sluttdato: '31.12.2015',
				arbeidetUtenlands: false,
			})

			await expectOppholdInList(page, LAND.AFG.navn)
			await expectOppholdInList(page, LAND.AUS.navn)
		})
	})

	test.describe('Bruk fødselsdato', () => {
		test.beforeEach(async ({ page }) => {
			await setupWithEditorOpen(page)
		})

		test('Fyller inn fødselsdato som startdato ved avkrysning', async ({
			page,
		}) => {
			await selectLand(page, LAND.AFG.kode)

			await page.getByLabel('Bruk fødselsdato').check()

			await expect(page.getByLabel('Startdato')).toHaveValue(
				TEST_FOEDSELSDATO_DISPLAY
			)
		})

		test('Manuell endring av startdato fjerner avkrysning av Bruk fødselsdato', async ({
			page,
		}) => {
			await selectLand(page, LAND.AFG.kode)
			await page.getByLabel('Bruk fødselsdato').check()
			await expect(page.getByLabel('Startdato')).toHaveValue(
				TEST_FOEDSELSDATO_DISPLAY
			)
			await expect(page.getByLabel('Bruk fødselsdato')).toBeChecked()

			await fillStartdato(page, '01.01.2000')

			await expect(page.getByLabel('Bruk fødselsdato')).not.toBeChecked()
		})

		test('Overskriver manuelt utfylt startdato når Bruk fødselsdato krysses av etterpå', async ({
			page,
		}) => {
			await selectLand(page, LAND.AFG.kode)
			await fillStartdato(page, '01.01.2000')

			await page.getByLabel('Bruk fødselsdato').check()

			await expect(page.getByLabel('Startdato')).toHaveValue(
				TEST_FOEDSELSDATO_DISPLAY
			)
		})

		test('Lar Bruk fødselsdato være uavkrysset når startdato allerede er lik fødselsdato', async ({
			page,
		}) => {
			await selectLand(page, LAND.AFG.kode)
			await fillStartdato(page, TEST_FOEDSELSDATO_DISPLAY)

			await expect(page.getByLabel('Bruk fødselsdato')).not.toBeChecked()
		})
	})

	test.describe('Rediger opphold', () => {
		test.beforeEach(async ({ page }) => {
			await setupWithEditorOpen(page)
		})

		test('Åpner editor med eksisterende verdier ved klikk på Endre', async ({
			page,
		}) => {
			await addOpphold(page, {
				landkode: LAND.AFG.kode,
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await page.getByRole('button', { name: 'Endre' }).click()

			await expect(page.getByRole('combobox', { name: 'Land' })).toHaveValue(
				LAND.AFG.kode
			)
			await expect(page.getByLabel('Startdato')).toHaveValue('01.01.2000')
			await expect(page.getByLabel('Sluttdato (valgfritt)')).toHaveValue(
				'31.12.2005'
			)
		})

		test('Viser Oppdater-knapp i redigeringsmodus', async ({ page }) => {
			await addOpphold(page, {
				landkode: LAND.AFG.kode,
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await page.getByRole('button', { name: 'Endre' }).click()

			await expect(page.getByRole('button', { name: 'Oppdater' })).toBeVisible()
		})

		test('Oppdaterer opphold etter redigering', async ({ page }) => {
			await addOpphold(page, {
				landkode: LAND.AFG.kode,
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await page.getByRole('button', { name: 'Endre' }).click()
			await fillSluttdato(page, '31.12.2010')
			await page.getByRole('button', { name: 'Oppdater' }).click()

			await expectOppholdInList(page, LAND.AFG.navn, '01.01.2000-31.12.2010')
		})

		test('Oppdater uten endringer utløser ikke overlapp-feil for samme opphold', async ({
			page,
		}) => {
			await addOpphold(page, {
				landkode: LAND.AUS.kode,
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
				arbeidetUtenlands: false,
			})

			await page.getByRole('button', { name: 'Endre' }).click()
			await page.getByRole('button', { name: 'Oppdater' }).click()

			await expectNoValidationMessage(page, OVERLAP_MESSAGES.sameCountry)
			await expectOppholdInList(page, LAND.AUS.navn)
		})
	})

	test.describe('Slett opphold', () => {
		test.beforeEach(async ({ page }) => {
			await setupWithEditorOpen(page)
		})

		test('Sletter opphold ved klikk på Slett', async ({ page }) => {
			await addOpphold(page, {
				landkode: LAND.AFG.kode,
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await expectOppholdInList(page, LAND.AFG.navn)

			await page.getByRole('button', { name: 'Slett' }).click()

			await expectNoOppholdInList(page, LAND.AFG.navn)
		})

		test('Åpner ny editor etter sletting av siste opphold', async ({
			page,
		}) => {
			await addOpphold(page, {
				landkode: LAND.AFG.kode,
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

		test('Avbryter redigering og beholder opprinnelige verdier', async ({
			page,
		}) => {
			await addOpphold(page, {
				landkode: LAND.AFG.kode,
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await page.getByRole('button', { name: 'Endre' }).click()
			await fillSluttdato(page, '31.12.2020')
			await page.getByRole('button', { name: 'Avbryt' }).click()

			await expectOppholdInList(page, LAND.AFG.navn, '01.01.2000-31.12.2005')
		})

		test('Avbryter nytt opphold når det finnes eksisterende opphold', async ({
			page,
		}) => {
			await addOpphold(page, {
				landkode: LAND.AFG.kode,
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await clickLeggTilNyttOpphold(page)
			await page.getByRole('button', { name: 'Avbryt' }).click()

			await expect(
				page.getByRole('combobox', { name: 'Land' })
			).not.toBeVisible()
			await expect(
				page.getByRole('button', { name: 'Legg til nytt opphold' })
			).toBeVisible()
		})

		test('Avbryt er skjult på første tomme editor (ingen eksisterende opphold)', async ({
			page,
		}) => {
			await expect(page.getByRole('combobox', { name: 'Land' })).toBeVisible()
			await expect(
				page.getByRole('button', { name: 'Avbryt' })
			).not.toBeVisible()
		})

		test('Avbryt er synlig når det finnes eksisterende opphold', async ({
			page,
		}) => {
			await addOpphold(page, {
				landkode: LAND.AFG.kode,
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await clickLeggTilNyttOpphold(page)

			await expect(page.getByRole('button', { name: 'Avbryt' })).toBeVisible()
		})
	})

	test.describe('Validering av opphold', () => {
		test.beforeEach(async ({ page }) => {
			await setupWithEditorOpen(page)
		})

		const validationCases = [
			{
				name: 'Viser feil når land ikke er valgt',
				setup: async (page: Page) => {
					await clickLeggTil(page)
				},
				expectedMessage: VALIDATION_MESSAGES.landRequired,
			},
			{
				name: 'Viser feil når startdato mangler',
				setup: async (page: Page) => {
					await selectLand(page, LAND.AFG.kode)
					await clickLeggTil(page)
				},
				expectedMessage: VALIDATION_MESSAGES.startdatoRequired,
			},
			{
				name: 'Viser feil for ugyldig datoformat i startdato',
				setup: async (page: Page) => {
					await selectLand(page, LAND.AFG.kode)
					await fillStartdato(page, '2000-01-01')
					await clickLeggTil(page)
				},
				expectedMessage: VALIDATION_MESSAGES.dateFormat,
			},
			{
				name: 'Viser feil for ugyldig datoformat i sluttdato',
				setup: async (page: Page) => {
					await selectLand(page, LAND.AFG.kode)
					await fillStartdato(page, '01.01.2000')
					await fillSluttdato(page, '2005-12-31')
					await clickLeggTil(page)
				},
				expectedMessage: VALIDATION_MESSAGES.dateFormat,
			},
			{
				name: 'Viser feil når startdato er før fødselsdato',
				setup: async (page: Page) => {
					await selectLand(page, LAND.AFG.kode)
					await fillStartdato(page, '01.01.1960')
					await clickLeggTil(page)
				},
				expectedMessage: VALIDATION_MESSAGES.startdatoBeforeFoedselsdato,
			},
			{
				name: 'Viser feil når sluttdato er før startdato',
				setup: async (page: Page) => {
					await selectLand(page, LAND.AFG.kode)
					await fillStartdato(page, '01.01.2000')
					await fillSluttdato(page, '01.01.1999')
					await clickLeggTil(page)
				},
				expectedMessage: VALIDATION_MESSAGES.sluttdatoBeforeStartdato,
			},
			{
				name: 'Viser feil når arbeidet utenlands ikke er besvart for avtaleland',
				setup: async (page: Page) => {
					await selectLand(page, LAND.AUS.kode)
					await fillStartdato(page, '01.01.2000')
					await clickLeggTil(page)
				},
				expectedMessage: VALIDATION_MESSAGES.arbeidetUtenlandsRequired,
			},
		] as const

		for (const validationCase of validationCases) {
			test(validationCase.name, async ({ page }) => {
				await validationCase.setup(page)

				await expectValidationMessage(page, validationCase.expectedMessage)
			})
		}

		test('Fjerner feilmelding når felt korrigeres', async ({ page }) => {
			await clickLeggTil(page)
			await expectValidationMessage(page, VALIDATION_MESSAGES.landRequired)

			await selectLand(page, LAND.AFG.kode)
			await expectNoValidationMessage(page, VALIDATION_MESSAGES.landRequired)
		})

		test('Viser feil når startdato er etter maks-dato (fødselsdato + 100 år)', async ({
			page,
		}) => {
			await selectLand(page, LAND.AFG.kode)
			await fillStartdato(page, '01.05.2064')
			await clickLeggTil(page)

			// Datepickeren tillater i dag datoer opptil 120 år etter fødselsdato,
			// men valideringen stopper fortsatt ved 100 år. Dokumenterer nåværende oppførsel.
			await expectValidationMessage(page, VALIDATION_MESSAGES.startdatoAfterMax)
		})

		test('Viser feil når sluttdato er etter maks-dato (fødselsdato + 100 år)', async ({
			page,
		}) => {
			await selectLand(page, LAND.AFG.kode)
			await fillStartdato(page, '01.01.2060')
			await fillSluttdato(page, '01.05.2064')
			await clickLeggTil(page)

			await expectValidationMessage(page, VALIDATION_MESSAGES.sluttdatoAfterMax)
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
				landkode: LAND.AFG.kode,
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await clickLeggTilNyttOpphold(page)

			await selectLand(page, LAND.AFG.kode)
			await fillStartdato(page, '01.06.2003')
			await fillSluttdato(page, '31.12.2008')
			await clickLeggTil(page)

			await expectValidationMessage(page, OVERLAP_MESSAGES.sameCountry)
		})

		test('Tillater ikke-overlappende opphold i samme land', async ({
			page,
		}) => {
			await addOpphold(page, {
				landkode: LAND.AFG.kode,
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await clickLeggTilNyttOpphold(page)

			await addOpphold(page, {
				landkode: LAND.AFG.kode,
				startdato: '01.01.2006',
				sluttdato: '31.12.2010',
			})

			await expect(oppholdListItems(page, LAND.AFG.navn)).toHaveCount(2)
		})

		test('Viser feil for overlappende opphold i to ulike avtaleland', async ({
			page,
		}) => {
			await addOpphold(page, {
				landkode: LAND.AUS.kode,
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
				arbeidetUtenlands: true,
			})

			await clickLeggTilNyttOpphold(page)

			await selectLand(page, LAND.CAN.kode)
			await jobbetGroup(page).getByLabel('Ja').check()
			await fillStartdato(page, '01.06.2003')
			await fillSluttdato(page, '31.12.2008')
			await clickLeggTil(page)

			await expectValidationMessage(page, OVERLAP_MESSAGES.differentCountries)
		})

		test('Viser ikke-avtaleland-feil når eksisterende ikke-avtaleland overlapper nytt avtaleland', async ({
			page,
		}) => {
			await addOpphold(page, {
				landkode: LAND.AFG.kode,
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await clickLeggTilNyttOpphold(page)

			await addOpphold(page, {
				landkode: LAND.AUS.kode,
				startdato: '01.06.2003',
				sluttdato: '31.12.2008',
				arbeidetUtenlands: true,
			})

			await expectValidationMessage(page, OVERLAP_MESSAGES.sameCountry)
		})

		test('Viser ulikt-land-feil når eksisterende avtaleland overlapper nytt ikke-avtaleland', async ({
			page,
		}) => {
			await addOpphold(page, {
				landkode: LAND.AUS.kode,
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
				arbeidetUtenlands: true,
			})

			await clickLeggTilNyttOpphold(page)

			await addOpphold(page, {
				landkode: LAND.AFG.kode,
				startdato: '01.06.2003',
				sluttdato: '31.12.2008',
			})

			await expectValidationMessage(page, OVERLAP_MESSAGES.differentCountries)
		})

		test('Viser feil for overlappende boopphold i samme avtaleland', async ({
			page,
		}) => {
			await addOpphold(page, {
				landkode: LAND.AUS.kode,
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
				arbeidetUtenlands: false,
			})

			await clickLeggTilNyttOpphold(page)

			await selectLand(page, LAND.AUS.kode)
			await jobbetGroup(page).getByLabel('Nei').check()
			await fillStartdato(page, '01.06.2003')
			await fillSluttdato(page, '31.12.2008')
			await clickLeggTil(page)

			await expectValidationMessage(page, OVERLAP_MESSAGES.boopphold)
		})

		test('Viser feil for overlappende jobbperioder i samme avtaleland', async ({
			page,
		}) => {
			await addOpphold(page, {
				landkode: LAND.AUS.kode,
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
				arbeidetUtenlands: true,
			})

			await clickLeggTilNyttOpphold(page)

			await selectLand(page, LAND.AUS.kode)
			await jobbetGroup(page).getByLabel('Ja').check()
			await fillStartdato(page, '01.06.2003')
			await fillSluttdato(page, '31.12.2008')
			await clickLeggTil(page)

			await expectValidationMessage(page, OVERLAP_MESSAGES.jobbperioder)
		})

		test('Tillater overlapp i samme avtaleland når arbeidet utenlands er ulikt', async ({
			page,
		}) => {
			await addOpphold(page, {
				landkode: LAND.AUS.kode,
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
				arbeidetUtenlands: true,
			})

			await clickLeggTilNyttOpphold(page)

			await addOpphold(page, {
				landkode: LAND.AUS.kode,
				startdato: '01.06.2003',
				sluttdato: '31.12.2008',
				arbeidetUtenlands: false,
			})

			await expectNoValidationMessage(page, OVERLAP_MESSAGES.boopphold)
			await expectNoValidationMessage(page, OVERLAP_MESSAGES.jobbperioder)
			await expect(oppholdListItems(page, LAND.AUS.navn)).toHaveCount(2)
		})

		test('Viser feil for overlapp med varig opphold (uten sluttdato)', async ({
			page,
		}) => {
			await addOpphold(page, {
				landkode: LAND.AFG.kode,
				startdato: '01.01.2000',
			})

			await clickLeggTilNyttOpphold(page)

			await selectLand(page, LAND.AFG.kode)
			await fillStartdato(page, '01.01.2010')
			await fillSluttdato(page, '31.12.2015')
			await clickLeggTil(page)

			await expectValidationMessage(page, OVERLAP_MESSAGES.sameCountry)
		})

		test('Viser feil når nytt varig opphold overlapper et eksisterende fremtidig opphold', async ({
			page,
		}) => {
			await addOpphold(page, {
				landkode: LAND.AFG.kode,
				startdato: '01.01.2050',
				sluttdato: '31.12.2055',
			})

			await clickLeggTilNyttOpphold(page)

			await addOpphold(page, {
				landkode: LAND.AFG.kode,
				startdato: '01.01.2040',
			})

			await expectValidationMessage(page, OVERLAP_MESSAGES.sameCountry)
		})

		test('Tillater nytt opphold som starter samme dag som forrige slutter i samme land', async ({
			page,
		}) => {
			await addOpphold(page, {
				landkode: LAND.AFG.kode,
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await clickLeggTilNyttOpphold(page)

			await addOpphold(page, {
				landkode: LAND.AFG.kode,
				startdato: '31.12.2005',
				sluttdato: '31.12.2010',
			})

			await expect(oppholdListItems(page, LAND.AFG.navn)).toHaveCount(2)
		})
	})

	test.describe('Datotilfeller', () => {
		test.beforeEach(async ({ page }) => {
			await setupWithEditorOpen(page)
		})

		test('Tillater skuddårsdatoer når datoene er gyldige', async ({ page }) => {
			await addOpphold(page, {
				landkode: LAND.AFG.kode,
				startdato: '29.02.2004',
				sluttdato: '29.02.2008',
			})

			await expectOppholdInList(page, LAND.AFG.navn, '29.02.2004-29.02.2008')
		})

		test('Tillater opphold over årsskiftet', async ({ page }) => {
			await addOpphold(page, {
				landkode: LAND.AFG.kode,
				startdato: '31.12.2005',
				sluttdato: '01.01.2006',
			})

			await expectOppholdInList(page, LAND.AFG.navn, '31.12.2005-01.01.2006')
		})
	})

	test.describe('Endre/Slett-knapper skjules under redigering', () => {
		test('Skjuler Endre/Slett på andre opphold når editor er åpen', async ({
			page,
		}) => {
			await setupWithEditorOpen(page)

			await addOpphold(page, {
				landkode: LAND.AFG.kode,
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await clickLeggTilNyttOpphold(page)

			await addOpphold(page, {
				landkode: LAND.AUS.kode,
				startdato: '01.01.2010',
				sluttdato: '31.12.2015',
				arbeidetUtenlands: false,
			})

			await expect(page.getByRole('button', { name: 'Endre' })).toHaveCount(2)
			await expect(page.getByRole('button', { name: 'Slett' })).toHaveCount(2)

			await page.getByRole('button', { name: 'Endre' }).first().click()

			await expect(page.getByRole('button', { name: 'Endre' })).toHaveCount(0)
			await expect(page.getByRole('button', { name: 'Slett' })).toHaveCount(0)
		})
	})

	test.describe('Kopieringsknapp for opphold', () => {
		test('Kopieringsknappen er skjult før opphold er lagt til', async ({
			page,
		}) => {
			await setupWithEditorOpen(page)

			await expect(
				page.getByRole('button', { name: 'Kopier opphold' })
			).not.toBeVisible()
		})

		test('Kopieringsknappen er synlig etter opphold er lagt til', async ({
			page,
		}) => {
			await setupWithEditorOpen(page)

			await addOpphold(page, {
				landkode: LAND.AFG.kode,
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await expect(
				page.getByRole('button', { name: 'Kopier opphold' })
			).toBeVisible()
		})

		test('Kopierer faktisk land, datoer og etiketter til utklippstavlen', async ({
			page,
		}) => {
			await setupWithEditorOpen(page)
			await page
				.context()
				.grantPermissions(['clipboard-read', 'clipboard-write'])

			await addOpphold(page, {
				landkode: LAND.AUS.kode,
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
				arbeidetUtenlands: false,
			})
			await clickLeggTilNyttOpphold(page)
			await addOpphold(page, {
				landkode: LAND.CAN.kode,
				startdato: '01.01.2010',
				sluttdato: '31.12.2015',
				arbeidetUtenlands: true,
			})

			await page.getByRole('button', { name: 'Kopier opphold' }).click()

			await expect
				.poll(() => readClipboardText(page), { timeout: POLL_TIMEOUT })
				.toContain('Australia, 01.01.2000-31.12.2005 (Botid)')
			expect(await readClipboardText(page)).toContain(
				'Canada, 01.01.2010-31.12.2015 (Jobbet)'
			)
		})
	})

	test.describe('API-feil og manglende data', () => {
		test('Når fødselsdato mangler i persondata, oppstår det en sidefeil og kalkulatoren vises ikke', async ({
			page,
		}) => {
			const pageErrors: string[] = []
			page.on('pageerror', (error) => {
				pageErrors.push(error.message)
			})

			await setupDefaultMocks(page, { foedselsdato: null })
			await page.goto('/?pid=encrypted-default-pid')

			await expect
				.poll(() => pageErrors.length, { timeout: POLL_TIMEOUT })
				.toBeGreaterThan(0)
			await expect(
				page.getByRole('heading', { name: 'Pensjonskalkulator' })
			).toHaveCount(0)
		})

		test('Bevarer utenlandsopphold når simulering-API-et feiler', async ({
			page,
		}) => {
			await setupDefaultMocks(page)
			await mockApiError(page, API_URLS.SIMULERING)
			await navigateToApp(page)
			await selectHarOppholdUtenforNorge(page, 'Ja')
			await addOpphold(page, {
				landkode: LAND.AFG.kode,
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await completeRemainingSimulationFields(page)

			const responsePromise = page.waitForResponse(
				(response) =>
					response.url().includes('/api/intern/v1/pensjon/simulering') &&
					response.status() === 500
			)
			await beregnPensjonButton(page).click()
			await responsePromise

			await expectOppholdInList(page, LAND.AFG.navn, '01.01.2000-31.12.2005')
		})
	})

	test.describe('Tastaturnavigasjon', () => {
		test('Tab-rekkefølgen i oppholdsskjemaet er logisk', async ({ page }) => {
			await setupWithEditorOpen(page)
			await selectLand(page, LAND.AUS.kode)

			await page.getByRole('combobox', { name: 'Land' }).focus()
			await expect(page.getByRole('combobox', { name: 'Land' })).toBeFocused()

			await page.keyboard.press('Tab')
			await expect(jobbetGroup(page).getByLabel('Ja')).toBeFocused()

			await page.keyboard.press('Tab')
			await expect(page.getByLabel('Startdato')).toBeFocused()

			for (let i = 0; i < 2; i++) {
				await page.keyboard.press('Tab')
			}
			await expect(page.getByLabel('Sluttdato (valgfritt)')).toBeFocused()

			for (let i = 0; i < 2; i++) {
				await page.keyboard.press('Tab')
			}
			await expect(page.getByLabel('Bruk fødselsdato')).toBeFocused()

			await page.keyboard.press('Tab')
			await expect(page.getByRole('button', { name: 'Legg til' })).toBeFocused()
		})
	})

	test.describe('Ja-Nei-Ja tilstandshåndtering', () => {
		test('Opphold er bevart når bruker bytter til Nei og tilbake til Ja', async ({
			page,
		}) => {
			await setupWithEditorOpen(page)

			await addOpphold(page, {
				landkode: LAND.AFG.kode,
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await expectOppholdInList(page, LAND.AFG.navn)

			await selectHarOppholdUtenforNorge(page, 'Nei')
			await expectNoOppholdInList(page, LAND.AFG.navn)

			await selectHarOppholdUtenforNorge(page, 'Ja')

			await expectOppholdInList(page, LAND.AFG.navn)
		})
	})

	test.describe('Nullstilling', () => {
		test('Nullstiller utenlandsopphold ved klikk på Nullstill', async ({
			page,
		}) => {
			await setupDefaultMocks(page)
			await navigateToApp(page)

			await selectHarOppholdUtenforNorge(page, 'Ja')
			await addOpphold(page, {
				landkode: LAND.AFG.kode,
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await expectOppholdInList(page, LAND.AFG.navn)

			await page.getByRole('button', { name: 'Nullstill' }).click()

			await expectNoOppholdInList(page, LAND.AFG.navn)
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

		test('Beregn pensjon er deaktivert når Ja er valgt men ingen opphold er lagret', async ({
			page,
		}) => {
			await selectHarOppholdUtenforNorge(page, 'Ja')

			await expect(beregnPensjonButton(page)).toBeDisabled()
		})

		test('Beregn pensjon er deaktivert når editor er åpen (redigering)', async ({
			page,
		}) => {
			await selectHarOppholdUtenforNorge(page, 'Ja')
			await addOpphold(page, {
				landkode: LAND.AFG.kode,
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await expect(beregnPensjonButton(page)).toBeEnabled()

			await page.getByRole('button', { name: 'Endre' }).click()
			await expect(beregnPensjonButton(page)).toBeDisabled()
		})

		test('Beregn pensjon er aktivert når Ja er valgt og opphold er lagret og editor er lukket', async ({
			page,
		}) => {
			await selectHarOppholdUtenforNorge(page, 'Ja')
			await addOpphold(page, {
				landkode: LAND.AFG.kode,
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})

			await expect(beregnPensjonButton(page)).toBeEnabled()
		})

		test('Beregn pensjon er aktivert når Nei er valgt', async ({ page }) => {
			await selectHarOppholdUtenforNorge(page, 'Nei')

			await expect(beregnPensjonButton(page)).toBeEnabled()
		})
	})

	test.describe('Innsending med utenlandsopphold', () => {
		test('Sender inn skjema med utenlandsopphold og verifiserer request', async ({
			page,
		}) => {
			const { getCapturedBody } = await setupForSimulation(page)

			await addOpphold(page, {
				landkode: LAND.AUS.kode,
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
				arbeidetUtenlands: true,
			})

			await completeRemainingSimulationFields(page)
			await beregnPensjonButton(page).click()

			await expectSimulationPeriods(getCapturedBody, [
				{
					landkode: LAND.AUS.kode,
					arbeidetUtenlands: true,
					fom: '2000-01-01',
					tom: '2005-12-31',
				},
			])
		})

		test('Sender inn skjema med varig opphold i ikke-avtaleland', async ({
			page,
		}) => {
			const { getCapturedBody } = await setupForSimulation(page)

			await addOpphold(page, {
				landkode: LAND.AFG.kode,
				startdato: '01.01.2000',
			})

			await completeRemainingSimulationFields(page)
			await beregnPensjonButton(page).click()

			await expectSimulationPeriods(getCapturedBody, [
				{
					landkode: LAND.AFG.kode,
					arbeidetUtenlands: false,
					fom: '2000-01-01',
				},
			])
		})

		test('Sender inn skjema med flere utenlandsopphold og beholder rekkefølgen', async ({
			page,
		}) => {
			const { getCapturedBody } = await setupForSimulation(page)

			await addOpphold(page, {
				landkode: LAND.AFG.kode,
				startdato: '01.01.2000',
				sluttdato: '31.12.2005',
			})
			await clickLeggTilNyttOpphold(page)
			await addOpphold(page, {
				landkode: LAND.AUS.kode,
				startdato: '01.01.2010',
				sluttdato: '31.12.2015',
				arbeidetUtenlands: false,
			})

			await completeRemainingSimulationFields(page)
			await beregnPensjonButton(page).click()

			await expectSimulationPeriods(getCapturedBody, [
				{
					landkode: LAND.AFG.kode,
					arbeidetUtenlands: false,
					fom: '2000-01-01',
					tom: '2005-12-31',
				},
				{
					landkode: LAND.AUS.kode,
					arbeidetUtenlands: false,
					fom: '2010-01-01',
					tom: '2015-12-31',
				},
			])
		})

		test('Sender inn skjema med Nei på utenlandsopphold', async ({ page }) => {
			await setupDefaultMocks(page)
			const { getCapturedBody } = await setupSimulationCapture(page)

			await navigateToApp(page)
			await selectHarOppholdUtenforNorge(page, 'Nei')

			await completeRemainingSimulationFields(page)
			await beregnPensjonButton(page).click()

			await expect
				.poll(() => getCapturedBody(), { timeout: POLL_TIMEOUT })
				.toBeDefined()

			const body = getCapturedBody()
			expect(body?.utenlandsperiodeListe ?? []).toEqual([])

			await expect(
				page.getByRole('combobox', { name: 'Land' })
			).not.toBeVisible()
		})
	})
})
