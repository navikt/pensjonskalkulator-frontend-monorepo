import { expect, test } from '@playwright/test'

import { navigateToApp, setupDefaultMocks } from '../../utils/test-helpers'
import {
	LAND,
	POLL_TIMEOUT,
	addOpphold,
	beregnPensjonButton,
	clickLeggTilNyttOpphold,
	completeRemainingSimulationFields,
	expectSimulationPeriods,
	selectHarOppholdUtenforNorge,
	setupForSimulation,
	setupSimulationCapture,
} from './helpers'

test.describe('Utenlandsopphold - Innsending med utenlandsopphold', () => {
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

		await expect(page.getByRole('combobox', { name: 'Land' })).not.toBeVisible()
	})
})
