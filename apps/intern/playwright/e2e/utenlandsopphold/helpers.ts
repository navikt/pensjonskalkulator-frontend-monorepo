import type {
	SimuleringRequestBody,
	SimuleringUtenlandsperiode,
} from '@pensjonskalkulator-frontend-monorepo/types'
import { type Page, expect } from '@playwright/test'

import { loadJSONMock } from '../../utils/mock'
import {
	API_URLS,
	MOCK_FILES,
	navigateToApp,
	setupDefaultMocks,
} from '../../utils/test-helpers'

export const HAR_OPPHOLD_UTENFOR_NORGE = 'Har bruker opphold utenfor Norge?'
export const JOBBET_I_LANDET = 'Jobbet bruker i landet?'

export const TEST_FOEDSELSDATO_ISO = '1964-04-30'
export const TEST_FOEDSELSDATO_DISPLAY = '30.04.1964'
export const POLL_TIMEOUT = 5000

export const LAND = {
	AFG: { kode: 'AFG', navn: 'Afghanistan' },
	AUS: { kode: 'AUS', navn: 'Australia' },
	CAN: { kode: 'CAN', navn: 'Canada' },
	DNK: { kode: 'DNK', navn: 'Danmark' },
} as const

const afterMaxMessage = (felt: 'Startdato' | 'Sluttdato') =>
	`${felt} kan ikke være senere enn 100 år etter fødselsdatoen din.`

export const VALIDATION_MESSAGES = {
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

export const OVERLAP_MESSAGES = {
	sameCountry: /Du kan ikke ha overlappende opphold med landet \S+\.$/,
	differentCountries: /Du kan ikke ha overlappende opphold i to ulike land\.$/,
	boopphold: /Du kan ikke ha overlappende boopphold\.$/,
	jobbperioder: /Du kan ikke ha overlappende jobbperioder\.$/,
} as const

export type SimuleringPayload = SimuleringRequestBody

export async function setupWithEditorOpen(
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

export async function selectHarOppholdUtenforNorge(
	page: Page,
	value: 'Ja' | 'Nei'
) {
	const radioGroup = page.getByRole('group', {
		name: HAR_OPPHOLD_UTENFOR_NORGE,
	})
	await radioGroup.getByLabel(value).check()
}

export function jobbetGroup(page: Page) {
	return page.getByRole('group', { name: JOBBET_I_LANDET })
}

export async function selectLand(page: Page, landkode: string) {
	await page.getByRole('combobox', { name: 'Land' }).selectOption(landkode)
}

export async function fillStartdato(page: Page, date: string) {
	await page.getByLabel('Startdato').fill(date)
}

export async function fillSluttdato(page: Page, date: string) {
	await page.getByLabel('Sluttdato (valgfritt)').fill(date)
}

export async function clickLeggTil(page: Page) {
	await page.getByRole('button', { name: 'Legg til' }).click()
}

export async function clickLeggTilNyttOpphold(page: Page) {
	await page.getByRole('button', { name: 'Legg til nytt opphold' }).click()
}

export async function addOpphold(
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

export async function fillMainFormFields(page: Page) {
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

export function oppholdListItems(page: Page, landNavn?: string) {
	const items = page.getByTestId('opphold-list-item')
	return landNavn ? items.filter({ hasText: landNavn }) : items
}

export async function expectOppholdInList(
	page: Page,
	landNavn: string,
	dateText?: string
) {
	await expect(oppholdListItems(page, landNavn)).toBeVisible()
	if (dateText) {
		await expect(page.getByText(dateText, { exact: true })).toBeVisible()
	}
}

export async function expectNoOppholdInList(page: Page, landNavn: string) {
	await expect(oppholdListItems(page, landNavn)).toHaveCount(0)
}

export function beregnPensjonButton(page: Page) {
	return page.getByRole('button', {
		name: /^(Beregn|Oppdater) pensjon$/,
	})
}

function validationAlert(page: Page, message: string | RegExp) {
	return page.getByText(message)
}

export async function expectValidationMessage(
	page: Page,
	message: string | RegExp
) {
	await expect(validationAlert(page, message)).toBeVisible()
}

export async function expectNoValidationMessage(
	page: Page,
	message: string | RegExp
) {
	await expect(validationAlert(page, message)).toHaveCount(0)
}

export async function completeRemainingSimulationFields(page: Page) {
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

export async function setupSimulationCapture(page: Page) {
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

export async function expectSimulationPeriods(
	getCapturedBody: () => SimuleringPayload | undefined,
	expectedPeriods: SimuleringUtenlandsperiode[]
) {
	await expect
		.poll(() => getCapturedBody()?.utenlandsperiodeListe, {
			timeout: POLL_TIMEOUT,
		})
		.toEqual(expectedPeriods)
}

export async function readClipboardText(page: Page) {
	return page.evaluate(async () => navigator.clipboard.readText())
}

export async function setupForSimulation(page: Page) {
	await setupDefaultMocks(page)
	const capture = await setupSimulationCapture(page)
	await navigateToApp(page)
	await selectHarOppholdUtenforNorge(page, 'Ja')
	return capture
}
