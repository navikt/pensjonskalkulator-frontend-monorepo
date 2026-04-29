import { type Page, test } from '@playwright/test'

import {
	LAND,
	VALIDATION_MESSAGES,
	addOpphold,
	clickLeggTil,
	expectNoValidationMessage,
	expectOppholdInList,
	expectValidationMessage,
	fillSluttdato,
	fillStartdato,
	selectLand,
	setupWithEditorOpen,
} from './helpers'

test.describe('Utenlandsopphold - Validering og datotilfeller', () => {
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
})
