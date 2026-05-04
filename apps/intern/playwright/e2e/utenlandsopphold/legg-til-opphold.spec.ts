import { expect, test } from '@playwright/test'

import {
	LAND,
	addOpphold,
	clickLeggTilNyttOpphold,
	expectOppholdInList,
	setupWithEditorOpen,
} from './helpers'

test.describe('Utenlandsopphold - Legg til opphold', () => {
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
