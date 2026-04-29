import { expect, test } from '@playwright/test'

import {
	LAND,
	OVERLAP_MESSAGES,
	addOpphold,
	clickLeggTilNyttOpphold,
	expectNoOppholdInList,
	expectNoValidationMessage,
	expectOppholdInList,
	fillSluttdato,
	setupWithEditorOpen,
} from './helpers'

test.describe('Utenlandsopphold - Rediger, slett og avbryt', () => {
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
})
