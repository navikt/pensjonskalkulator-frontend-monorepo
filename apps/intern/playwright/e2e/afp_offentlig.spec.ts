import type { SimuleringRequestBody } from '@pensjonskalkulator-frontend-monorepo/types'
import { type Page, expect, test } from '@playwright/test'

import { loadJSONMock, mockApi } from '../utils/mock'
import {
	API_URLS,
	MOCK_FILES,
	fillMainFormFields,
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
	test.describe('Livsvarig AFP', () => {
		for (const { afpStatus, maanedligBeloep } of [
			{ afpStatus: true, maanedligBeloep: 8347 },
			{ afpStatus: true, maanedligBeloep: 0 },
			{ afpStatus: true, maanedligBeloep: null },
			{ afpStatus: true, maanedligBeloep: undefined },
			{ afpStatus: false, maanedligBeloep: undefined },
			{ afpStatus: null, maanedligBeloep: undefined },
			{ afpStatus: undefined, maanedligBeloep: undefined },
		]) {
			test(`viser AFP-felt ved afpStatus ${afpStatus} og månedsbeløp ${maanedligBeloep}`, async ({
				page,
			}) => {
				await setupDefaultMocks(page)
				await page.route('**/api/v2/tpo-livsvarig-offentlig-afp', (route) =>
					route.fulfill({
						status: 200,
						json: { afpStatus, maanedligBeloep },
					})
				)
				await page.route(API_URLS.SANITY, (route) =>
					route.fulfill({
						status: 200,
						json: {
							result: [
								{
									name: 'beregning.livsvarig-AFP-forvaltes-ikke',
									type: 'local-alert',
									status: 'info',
									overskrift:
										'Merk at livsvarig AFP ikke forvaltes av Nav og bare skal velges hvis det er relevant for veiledningen.',
									innhold: [],
								},
							],
						},
					})
				)
				const response = page.waitForResponse((apiResponse) =>
					apiResponse.url().includes('/v2/tpo-livsvarig-offentlig-afp')
				)

				await navigateToApp(page)
				await response
				const manglerBeloep = afpStatus === true && maanedligBeloep == null
				await expect(
					page.getByText(
						'Brukeren har livsvarig AFP i offentlig sektor fra tjenestepensjonsordning.',
						{ exact: true }
					)
				).toHaveCount(afpStatus === true ? 1 : 0)
				await expect(
					page.getByText(
						'Brukeren har livsvarig AFP i offentlig sektor. Beløpet vil inkluderes i vilkårsprøvingen av alderspensjon.',
						{ exact: true }
					)
				).toHaveCount(0)
				await expect(
					page.getByRole('heading', { name: 'AFP', exact: true })
				).toHaveCount(afpStatus === true ? 1 : 0)
				await expect(page.getByTestId('afp')).toHaveCount(
					afpStatus === true && !manglerBeloep ? 0 : 1
				)
				await expect(
					page.getByRole('radiogroup', {
						name: 'Skal AFP-beløp hentes i beregningen?',
					})
				).toHaveCount(manglerBeloep ? 1 : 0)
				const alert = page.getByTestId('beregning.livsvarig-AFP-forvaltes-ikke')
				await expect(alert).toHaveCount(manglerBeloep ? 1 : 0)

				if (afpStatus === true) {
					const heading = page.getByRole('heading', {
						name: 'AFP',
						exact: true,
					})
					await expect(heading).toBeVisible()
					expect(
						await heading.evaluate(
							(element) =>
								element.nextElementSibling!.getBoundingClientRect().top -
								element.getBoundingClientRect().bottom
						)
					).toBe(8)
				}

				if (manglerBeloep) {
					await expect
						.poll(() =>
							page
								.getByTestId('afp')
								.evaluate(
									(element) =>
										element.getBoundingClientRect().top -
										element.parentElement!.previousElementSibling!.getBoundingClientRect()
											.bottom
								)
						)
						.toBe(24)
					await expect
						.poll(() =>
							alert.evaluate(
								(element) =>
									element.getBoundingClientRect().top -
									element.previousElementSibling!.getBoundingClientRect().bottom
							)
						)
						.toBe(8)
				}

				if (afpStatus === false) {
					await page.getByTestId('beregn-button').click()
					await expect(
						page.getByTestId('afp').getByText('Velg om AFP skal inkluderes.')
					).toBeVisible()
				}

				if (afpStatus !== true) {
					for (const valg of ['Ja, offentlig', 'Ja, privat', 'Nei']) {
						await page.getByTestId('afp').getByLabel(valg).check()
						await expect(alert).toHaveCount(valg === 'Ja, offentlig' ? 1 : 0)
						if (valg === 'Ja, offentlig') {
							await expect
								.poll(() =>
									alert.evaluate(
										(element) =>
											element.getBoundingClientRect().top -
											element.previousElementSibling!.getBoundingClientRect()
												.bottom
									)
								)
								.toBe(8)
						}
					}
				}
			})
		}

		test('beholder teksten om vilkaarsproeving naar brukeren har baade AP-vedtak og livsvarig AFP', async ({
			page,
		}) => {
			await setupDefaultMocks(page)
			await mockApi(page, API_URLS.VEDTAK, MOCK_FILES.VEDTAK)
			await page.route('**/api/v2/tpo-livsvarig-offentlig-afp', (route) =>
				route.fulfill({
					status: 200,
					json: { afpStatus: true, maanedligBeloep: 8347 },
				})
			)

			await navigateToApp(page)

			await expect(
				page.getByText(
					'Brukeren har livsvarig AFP i offentlig sektor. Beløpet vil inkluderes i vilkårsprøvingen av alderspensjon.',
					{ exact: true }
				)
			).toBeVisible()
			await expect(
				page.getByText(
					'Brukeren har livsvarig AFP i offentlig sektor fra tjenestepensjonsordning.',
					{ exact: true }
				)
			).toHaveCount(0)
		})

		for (const { maanedligBeloep, forventetBeloep } of [
			{ maanedligBeloep: 8347, forventetBeloep: '8 347' },
			{ maanedligBeloep: 0, forventetBeloep: '0' },
		]) {
			test(`inkluderer eksisterende AFP med beløp ${maanedligBeloep} automatisk uten AP-vedtak, også etter nullstilling`, async ({
				page,
			}) => {
				await setupDefaultMocks(page)
				await page.route('**/api/v2/tpo-livsvarig-offentlig-afp', (route) =>
					route.fulfill({
						status: 200,
						json: { afpStatus: true, maanedligBeloep },
					})
				)
				await setupSimuleringMockWithCapture(page, {
					livsvarigOffentligAfpListe: [
						{
							alderAar: 62,
							maanedligBeloep,
							aarligBeloep: maanedligBeloep * 12,
						},
					],
					maanedligAlderspensjonForKnekkpunkter: {
						vedHeltUttak: { beloep: 23333, inntektspensjonBeloep: 23333 },
					},
				})
				await navigateToApp(page)
				await expect(
					page.getByRole('heading', { name: 'AFP', exact: true })
				).toBeVisible()

				for (const nullstill of [false, true]) {
					if (nullstill) {
						await page.getByTestId('nullstill-button').click()
					}
					await fillMainFormFields({
						page,
						withDefaults: false,
						fields: {
							'eps-har-pensjon': 'Nei',
							'eps-har-inntekt-over-2g': 'Ja',
							'har-opphold-utenfor-norge': 'Nei',
							'inntekt-foer-uttak': '500000',
							'alder-uttak-aar': '65',
							'alder-uttak-md': '0',
							uttaksgrad: '100',
							'har-inntekt-vsa-helt-uttak': 'Nei',
						},
					})
					await expect(page.getByTestId('afp')).toHaveCount(0)
					const request = page.waitForRequest(API_URLS.SIMULERING)
					await page.getByTestId('beregn-button').click()
					expect((await request).postDataJSON()).toMatchObject({
						simuleringstype: 'ALDERSPENSJON_MED_LIVSVARIG_OFFENTLIG_AFP',
					})
					await expect(
						page
							.getByTestId('beregning-section-helt')
							.getByRole('row', { name: /Livsvarig AFP/ })
							.getByRole('cell', { name: forventetBeloep, exact: true })
					).toBeVisible()
				}
			})
		}

		test('krever et valg og lar ja/nei styre om AFP-beløpet skal hentes', async ({
			page,
		}) => {
			await setupDefaultMocks(page)
			await page.route('**/api/v2/tpo-livsvarig-offentlig-afp', (route) =>
				route.fulfill({
					status: 200,
					json: { afpStatus: true, maanedligBeloep: null },
				})
			)
			const capture = await setupSimuleringMockWithCapture(page, {
				livsvarigOffentligAfpListe: [
					{ alderAar: 62, maanedligBeloep: 8347, aarligBeloep: 100164 },
				],
			})
			await navigateToApp(page)
			const sporsmaal = page.getByRole('radiogroup', {
				name: 'Skal AFP-beløp hentes i beregningen?',
			})
			await expect(sporsmaal).toBeVisible()
			await page.getByTestId('beregn-button').click()
			await expect(
				sporsmaal.getByText('Velg om AFP-beløp skal hentes i beregningen.')
			).toBeVisible()
			expect(capture.getCapturedBody()).toBeUndefined()

			await page.getByTestId('eps-har-pensjon').getByLabel('Nei').check()
			await page.getByTestId('eps-har-inntekt-over-2g').getByLabel('Ja').check()
			await fillMainFormFields({
				page,
				fields: {
					'alder-uttak-aar': '65',
					'alder-uttak-md': '0',
				},
			})
			await sporsmaal.getByRole('radio', { name: 'Ja', exact: true }).check()
			await page.getByTestId('beregn-button').click()
			await expect
				.poll(() => capture.getCapturedBody()?.simuleringstype)
				.toBe('ALDERSPENSJON_MED_LIVSVARIG_OFFENTLIG_AFP')
			await expect(
				page
					.getByTestId('beregning-section-helt')
					.getByRole('row', { name: /Livsvarig AFP/ })
			).toContainText('8 347')

			await sporsmaal.getByRole('radio', { name: 'Nei', exact: true }).check()
			await page.getByTestId('beregn-button').click()
			await expect
				.poll(() => capture.getCapturedBody()?.simuleringstype)
				.toBe('ALDERSPENSJON')
			await expect(
				page.getByRole('row', { name: /Livsvarig AFP/ })
			).toHaveCount(0)
		})

		test('bruker første AFP-beløp ved både gradert og helt uttak uavhengig av alder', async ({
			page,
		}) => {
			await setupDefaultMocks(page)
			const capture = await setupSimuleringMockWithCapture(page, {
				livsvarigOffentligAfpListe: [
					{ alderAar: 62, maanedligBeloep: 8347, aarligBeloep: 100164 },
					{ alderAar: 67, maanedligBeloep: 8500, aarligBeloep: 102000 },
				],
				maanedligAlderspensjonForKnekkpunkter: {
					vedGradertUttak: { beloep: 10000, inntektspensjonBeloep: 10000 },
					vedHeltUttak: { beloep: 23333, inntektspensjonBeloep: 23333 },
				},
			})
			await navigateToApp(page)
			await page.getByTestId('eps-har-pensjon').getByLabel('Nei').check()
			await page.getByTestId('eps-har-inntekt-over-2g').getByLabel('Ja').check()
			await fillMainFormFields({
				page,
				fields: {
					afp: 'Ja, offentlig',
					'alder-uttak-aar': '65',
					'alder-uttak-md': '0',
					uttaksgrad: '50',
				},
			})
			await page.getByTestId('inntekt-vsa-gradert-uttak').fill('0')
			await page.getByTestId('alder-helt-uttak-aar').selectOption('67')
			await page.getByTestId('alder-helt-uttak-md').selectOption('0')
			await page.getByTestId('beregn-button').click()

			await expect
				.poll(() => capture.getCapturedBody()?.simuleringstype)
				.toBe('ALDERSPENSJON_MED_LIVSVARIG_OFFENTLIG_AFP')
			const gradert = page.getByTestId('beregning-section-gradert')
			const helt = page.getByTestId('beregning-section-helt')
			await expect(gradert.getByText('50 % alderspensjon')).toBeVisible()
			await expect(helt.getByText('100 % alderspensjon')).toBeVisible()
			await expect(
				page.getByText('AFP i offentlig sektor', { exact: true })
			).toHaveCount(2)
			await expect(
				gradert.getByRole('row', { name: /Livsvarig AFP/ })
			).toContainText('8 347')
			await expect(
				helt.getByRole('row', { name: /Livsvarig AFP/ })
			).toContainText('8 347')
			await expect(
				gradert.getByRole('row', { name: /Sum pensjon/ })
			).toContainText('18 347')
			await expect(
				helt.getByRole('row', { name: /Sum pensjon/ })
			).toContainText('31 680')
			await expect(
				page.getByTestId('beregning-section-offentlig-afp')
			).toHaveCount(0)
			await expect(
				helt.getByText(
					'AFP-beløpet er estimert av Nav og innebærer ikke en vurdering eller bekreftelse av rett til AFP.'
				)
			).toBeVisible()
			await expect(
				page.getByText('Opptjening AFP i offentlig sektor')
			).toHaveCount(0)

			await page.getByRole('checkbox', { name: 'Vis årsbeløp' }).check()
			await expect(
				helt.getByRole('row', { name: /Livsvarig AFP/ })
			).toContainText('100 164')
			await expect(
				gradert.getByRole('row', { name: /Sum pensjon/ })
			).toContainText('220 164')
			await expect(
				helt.getByRole('row', { name: /Sum pensjon/ })
			).toContainText('380 160')

			await page.getByTestId('afp').getByLabel('Nei').check()
			await page.getByTestId('beregn-button').click()
			await expect(
				page.getByText('AFP i offentlig sektor', { exact: true })
			).toHaveCount(0)
			await expect(
				page.getByTestId('beregning-section-offentlig-afp')
			).toHaveCount(0)
		})

		for (const scenario of [
			{ uttaksgrad: '100', alder: '65', normert: 'helt', apGrad: 100 },
			{ uttaksgrad: '50', alder: '66', normert: 'helt', apGrad: 100 },
			{ uttaksgrad: '50', alder: '69', normert: 'gradert', apGrad: 50 },
			{ uttaksgrad: '100', alder: '67', normert: null, apGrad: 100 },
			{ uttaksgrad: '100', alder: '69', normert: null, apGrad: 100 },
			{ uttaksgrad: '50', alder: '67', normert: null, apGrad: 100 },
		]) {
			test(`viser normert AFP-seksjon ${scenario.normert} ved ${scenario.uttaksgrad} % og helt uttak ${scenario.alder} år`, async ({
				page,
			}) => {
				await setupDefaultMocks(page)
				await setupSimuleringMockWithCapture(page, {
					livsvarigOffentligAfpListe: [
						{ alderAar: 62, maanedligBeloep: 8347, aarligBeloep: 100164 },
						{ alderAar: 67, maanedligBeloep: 8500, aarligBeloep: 102000 },
					],
					maanedligAlderspensjonForKnekkpunkter: {
						...(scenario.uttaksgrad === '50'
							? {
									vedGradertUttak: {
										beloep: 10000,
										inntektspensjonBeloep: 10000,
									},
								}
							: {}),
						vedHeltUttak: { beloep: 23333, inntektspensjonBeloep: 23333 },
						vedNormertPensjonsalder: {
							beloep: 15000,
							inntektspensjonBeloep: 15000,
						},
					},
				})
				await navigateToApp(page)
				await page.getByTestId('eps-har-pensjon').getByLabel('Nei').check()
				await page
					.getByTestId('eps-har-inntekt-over-2g')
					.getByLabel('Ja')
					.check()
				await fillMainFormFields({
					page,
					fields: {
						afp: 'Ja, offentlig',
						'alder-uttak-aar':
							scenario.uttaksgrad === '100' ? scenario.alder : '65',
						'alder-uttak-md': '0',
						uttaksgrad: scenario.uttaksgrad,
					},
				})
				if (scenario.uttaksgrad !== '100') {
					await page.getByTestId('inntekt-vsa-gradert-uttak').fill('0')
					await page
						.getByTestId('alder-helt-uttak-aar')
						.selectOption(scenario.alder)
					await page.getByTestId('alder-helt-uttak-md').selectOption('0')
				}
				await page.getByTestId('beregn-button').click()
				await expect(page.getByTestId('beregning-section-helt')).toBeVisible()
				for (const plassering of ['gradert', 'helt']) {
					const section = page.getByTestId(`beregning-section-${plassering}-67`)
					await expect(section).toHaveCount(
						scenario.normert === plassering ? 1 : 0
					)
					if (scenario.normert !== plassering) continue
					expect(
						await section.evaluate((element) =>
							element.previousElementSibling?.getAttribute('data-testid')
						)
					).toBe(`beregning-section-${plassering}`)
					await expect(
						section.getByRole('heading', { name: /67 år/ })
					).toBeVisible()
					await expect(
						section.getByRole('row', { name: /Livsvarig AFP/ })
					).toContainText('8 347')
					await expect(section.getByText('AFP i privat sektor')).toHaveCount(0)
					await expect(
						section.getByText(`${scenario.apGrad} % alderspensjon`, {
							exact: true,
						})
					).toBeVisible()
					await expect(
						section.getByRole('row', { name: /Sum pensjon/ })
					).toContainText('23 347')
					await page.getByRole('checkbox', { name: 'Vis årsbeløp' }).check()
					await expect(
						section.getByRole('row', { name: /Livsvarig AFP/ })
					).toContainText('100 164')
				}
			})
		}

		test('viser livsvarig AFP én gang når AP-utbetalinger mangler', async ({
			page,
		}) => {
			await setupDefaultMocks(page)
			await setupSimuleringMockWithCapture(page, {
				alderspensjonListe: [],
				maanedligAlderspensjonForKnekkpunkter: {},
				livsvarigOffentligAfpListe: [
					{ alderAar: 64, maanedligBeloep: 8347, aarligBeloep: 100164 },
					{ alderAar: 65, maanedligBeloep: 8500, aarligBeloep: 102000 },
				],
			})
			await navigateToApp(page)
			await page.getByTestId('eps-har-pensjon').getByLabel('Nei').check()
			await page.getByTestId('eps-har-inntekt-over-2g').getByLabel('Ja').check()
			await fillMainFormFields({
				page,
				fields: {
					afp: 'Ja, offentlig',
					'alder-uttak-aar': '65',
					'alder-uttak-md': '0',
				},
			})
			await page.getByTestId('beregn-button').click()

			const section = page.getByTestId('beregning-section-offentlig-afp')
			await expect(
				section.getByRole('heading', { name: 'AFP ved 64 år' })
			).toBeVisible()
			await expect(section.getByRole('row', { name: /Sum AFP/ })).toContainText(
				'8 347'
			)
			await expect(section.getByText('Alderspensjon og AFP')).toHaveCount(0)
			await expect(section.getByText('100 % alderspensjon')).toHaveCount(0)
			await expect(
				page.getByRole('row', { name: /Livsvarig AFP/ })
			).toHaveCount(1)
		})
	})

	test.describe('Ja, offentlig', () => {
		test.describe('Skjema', () => {
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
						harInntektMaanedenFoerUttak: true,
						afpOrdning: 'STATLIG',
					},
				})

				await expect(page.getByTestId('beregning-section-helt')).toBeVisible()
			})
		})
	})

	test.describe('Serviceberegning AFP', () => {
		test.describe('Skjema', () => {
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
