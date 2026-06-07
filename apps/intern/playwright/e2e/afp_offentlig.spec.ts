import type { SimuleringRequestBody } from '@pensjonskalkulator-frontend-monorepo/types'
import { type Page, expect, test } from '@playwright/test'

import { loadJSONMock } from '../utils/mock'
import {
	API_URLS,
	navigateToApp,
	setupDefaultMocks,
} from '../utils/test-helpers'

const PERSON_FOEDT_FOER_1963 = {
	foedselsdato: '1960-04-30',
}

async function setupSimuleringMockWithCapture(
	page: Page,
	overrides: Record<string, unknown>
) {
	let capturedBody: SimuleringRequestBody | undefined
	const baseMock = (await loadJSONMock('simulering-v1.json')) as Record<
		string,
		unknown
	>

	const body = JSON.stringify({
		...baseMock,
		...overrides,
	})

	await page.route(API_URLS.SIMULERING, (route) => {
		capturedBody = route.request().postDataJSON() as SimuleringRequestBody
		return route.fulfill({
			status: 200,
			contentType: 'application/json',
			body,
		})
	})

	return {
		getCapturedBody: () => capturedBody,
	}
}

async function setupSimuleringMockWithAfpOffentlig(page: Page) {
	return setupSimuleringMockWithCapture(page, {
		tidsbegrensetOffentligAfp: {
			alderAar: 65,
			totaltAfpBeloep: 183420,
			tidligereArbeidsinntekt: 550000,
			grunnbeloep: 124028,
			sluttpoengtall: 4.12,
			trygdetid: 40,
			poengaarTom1991: 12,
			poengaarFom1992: 28,
			grunnpensjon: 6600,
			tilleggspensjon: 5200,
			afpTillegg: 3100,
			saertillegg: 385,
			afpGrad: 100,
			erAvkortet: false,
		},
	})
}

async function setupSimuleringMockWithServiceberegning(page: Page) {
	return setupSimuleringMockWithCapture(page, {
		serviceberegnetAfp: {
			beregnetAfp: {
				totalbelopAfp: 185820,
				virkFom: '2026-01-01',
				tidligereArbeidsinntekt: 550000,
				grunnbelop: 124028,
				sluttpoengtall: 4.12,
				trygdetid: 40,
				poengar: 40,
				poeangarF92: 28,
				poeangarE91: 12,
				grunnpensjon: 6600,
				tilleggspensjon: 5200,
				afpTillegg: 3100,
				saertillegg: 585,
				afpGrad: 100,
				erAvkortet: false,
			},
		},
	})
}

async function selectFirstAvailableUttaksalder(page: Page) {
	const alderAar = page.getByTestId('alder-uttak-aar')
	const alderMd = page.getByTestId('alder-uttak-md')

	const firstAvailableAar = await alderAar.evaluate((element) => {
		const select = element as HTMLSelectElement
		return Array.from(select.options)
			.map((option) => option.value)
			.find((value) => value !== '')
	})

	if (!firstAvailableAar) {
		throw new Error('Fant ingen tilgjengelig alder (år) for uttak.')
	}

	await alderAar.selectOption(firstAvailableAar)

	const firstAvailableMd = await alderMd.evaluate((element) => {
		const select = element as HTMLSelectElement
		return Array.from(select.options)
			.map((option) => option.value)
			.find((value) => value !== '')
	})

	if (!firstAvailableMd) {
		throw new Error('Fant ingen tilgjengelig alder (måned) for uttak.')
	}

	await alderMd.selectOption(firstAvailableMd)
}

async function fillFormWithAfpOffentlig(page: Page) {
	await page.getByTestId('eps-har-pensjon').getByLabel('Nei').check()
	await page.getByTestId('eps-har-inntekt-over-2g').getByLabel('Ja').check()
	await page.getByTestId('har-opphold-utenfor-norge').getByLabel('Nei').check()
	await page.getByTestId('afp').getByLabel('Ja, offentlig').check()
	await page.getByTestId('inntekt-foer-uttak').fill('500000')
	await selectFirstAvailableUttaksalder(page)
	await page.getByTestId('inntekt-siste-maaned-foer-uttak').fill('45000')
	await page.getByTestId('aarsinntekt-samtidig-med-afp').fill('120000')
}

async function fillFormWithServiceberegning(page: Page) {
	await page.getByTestId('eps-har-pensjon').getByLabel('Nei').check()
	await page.getByTestId('eps-har-inntekt-over-2g').getByLabel('Ja').check()
	await page.getByTestId('har-opphold-utenfor-norge').getByLabel('Nei').check()
	await page
		.getByTestId('afp')
		.getByLabel('Serviceberegning AFP for saksbehandler')
		.check()
	await selectFirstAvailableUttaksalder(page)
	await page.getByTestId('inntekt-siste-maaned-foer-uttak').fill('45000')
	await page.getByTestId('aarsinntekt-samtidig-med-afp').fill('120000')
}

test.describe('AFP Offentlig', () => {
	test.describe('Ja, offentlig', () => {
		test.describe('Skjema', () => {
			test('viser AFP-valg med Ja, offentlig alternativ', async ({ page }) => {
				await setupDefaultMocks(page, PERSON_FOEDT_FOER_1963)
				await navigateToApp(page)

				await expect(
					page.getByTestId('afp').getByLabel('Ja, offentlig')
				).toBeVisible()
			})

			test('viser offentlig AFP-felter når Ja, offentlig er valgt', async ({
				page,
			}) => {
				await setupDefaultMocks(page, PERSON_FOEDT_FOER_1963)
				await navigateToApp(page)

				await page.getByTestId('afp').getByLabel('Ja, offentlig').check()

				await expect(page.getByTestId('inntekt-foer-uttak')).toBeVisible()
				await expect(
					page.getByTestId('inntekt-siste-maaned-foer-uttak')
				).toBeVisible()
				await expect(
					page.getByTestId('aarsinntekt-samtidig-med-afp')
				).toBeVisible()
			})
		})

		test.describe('Beregning', () => {
			test('viser AFP-tabell i beregningsresultat for offentlig AFP', async ({
				page,
			}) => {
				await setupDefaultMocks(page, PERSON_FOEDT_FOER_1963)
				const capture = await setupSimuleringMockWithAfpOffentlig(page)
				await navigateToApp(page)

				await fillFormWithAfpOffentlig(page)
				await page.getByTestId('beregn-button').click()

				await expect.poll(() => capture.getCapturedBody()).toBeDefined()
				expect(capture.getCapturedBody()).toMatchObject({
					simuleringstype: 'ALDERSPENSJON_MED_TIDSBEGRENSET_OFFENTLIG_AFP',
					aarligInntektFoerUttakBeloep: 500000,
					gradertUttak: {
						grad: 100,
						aarligInntektVsaPensjonBeloep: 120000,
					},
					offentligAfp: {
						harInntektMaanedenFoerUttak: null,
						afpOrdning: 'STATLIG',
					},
				})

				await expect(
					page.getByTestId('beregning-section-helt-afp-offentlig')
				).toBeVisible()
			})
		})
	})

	test.describe('Serviceberegning AFP', () => {
		test.describe('Skjema', () => {
			test('viser Serviceberegning AFP for saksbehandler alternativ', async ({
				page,
			}) => {
				await setupDefaultMocks(page, PERSON_FOEDT_FOER_1963)
				await navigateToApp(page)

				await expect(
					page
						.getByTestId('afp')
						.getByLabel('Serviceberegning AFP for saksbehandler')
				).toBeVisible()
			})

			test('viser serviceberegning-felter når serviceberegning er valgt', async ({
				page,
			}) => {
				await setupDefaultMocks(page, PERSON_FOEDT_FOER_1963)
				await navigateToApp(page)

				await page
					.getByTestId('afp')
					.getByLabel('Serviceberegning AFP for saksbehandler')
					.check()

				await expect(page.getByTestId('inntekt-foer-uttak')).not.toBeVisible()
				await selectFirstAvailableUttaksalder(page)

				await expect(
					page.getByTestId('inntekt-siste-maaned-foer-uttak')
				).toBeVisible()
				await expect(
					page.getByTestId('aarsinntekt-samtidig-med-afp')
				).toBeVisible()
			})
		})

		test.describe('Beregning', () => {
			test('viser AFP-tabell i beregningsresultat for serviceberegning', async ({
				page,
			}) => {
				await setupDefaultMocks(page, PERSON_FOEDT_FOER_1963)
				const capture = await setupSimuleringMockWithServiceberegning(page)
				await navigateToApp(page)

				await fillFormWithServiceberegning(page)
				await page.getByTestId('beregn-button').click()

				await expect.poll(() => capture.getCapturedBody()).toBeDefined()
				expect(capture.getCapturedBody()).toMatchObject({
					simuleringstype: 'SERVICEBEREGN_AFP',
					gradertUttak: {
						grad: 100,
						aarligInntektVsaPensjonBeloep: 120000,
					},
					offentligAfp: {
						inntektMaanedFoerAfp: 45000,
						afpOrdning: 'STATLIG',
					},
				})

				await expect(
					page.getByTestId('beregning-section-helt-afp-serviceberegning')
				).toBeVisible()
			})
		})
	})
})
