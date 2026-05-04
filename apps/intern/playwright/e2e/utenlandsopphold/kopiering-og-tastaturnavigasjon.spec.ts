import { expect, test } from '@playwright/test'

import {
	LAND,
	POLL_TIMEOUT,
	addOpphold,
	clickLeggTilNyttOpphold,
	jobbetGroup,
	readClipboardText,
	selectLand,
	setupWithEditorOpen,
} from './helpers'

test.describe('Utenlandsopphold - Kopiering og tastaturnavigasjon', () => {
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
})
