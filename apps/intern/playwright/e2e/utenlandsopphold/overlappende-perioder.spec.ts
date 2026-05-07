import { expect, test } from '@playwright/test'

import {
	LAND,
	OVERLAP_MESSAGES,
	addOpphold,
	clickLeggTil,
	clickLeggTilNyttOpphold,
	expectNoValidationMessage,
	expectValidationMessage,
	fillSluttdato,
	fillStartdato,
	jobbetGroup,
	oppholdListItems,
	selectLand,
	setupWithEditorOpen,
} from './helpers'

test.describe('Utenlandsopphold - Overlappende perioder', () => {
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

	test('Tillater ikke-overlappende opphold i samme land', async ({ page }) => {
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
