import { expect, test } from '@playwright/test'

import { navigateToApp, setupDefaultMocks } from '../../utils/test-helpers'
import {
	LAND,
	TEST_FOEDSELSDATO_DISPLAY,
	fillStartdato,
	jobbetGroup,
	selectHarOppholdUtenforNorge,
	selectLand,
	setupWithEditorOpen,
} from './helpers'

test.describe('Utenlandsopphold - Editor og land', () => {
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
})
