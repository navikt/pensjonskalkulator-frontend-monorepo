import { expect, test } from '@playwright/test'

import { mockApiError } from '../../utils/mock'
import {
	API_URLS,
	navigateToApp,
	setupDefaultMocks,
} from '../../utils/test-helpers'
import {
	LAND,
	POLL_TIMEOUT,
	addOpphold,
	beregnPensjonButton,
	completeRemainingSimulationFields,
	expectNoOppholdInList,
	expectOppholdInList,
	selectHarOppholdUtenforNorge,
	setupWithEditorOpen,
} from './helpers'

test.describe('Utenlandsopphold - API-feil, tilstand og knappetilstander', () => {
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
})
