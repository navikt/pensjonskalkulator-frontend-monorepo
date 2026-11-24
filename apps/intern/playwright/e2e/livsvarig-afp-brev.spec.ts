import { expect, test } from '@playwright/test'

import { mockApi } from '../utils/mock'
import {
	API_URLS,
	MOCK_FILES,
	fillMainFormFields,
	setupDefaultMocks,
} from '../utils/test-helpers'

const estimertBeskrivelse =
	'AFP-beløpet er estimert av Nav og er ikke en bekreftelse av rett til AFP. I beregningen av alderspensjon er livsvarig AFP tatt med fordi den kan ha betydning for når og hvordan alderspensjonen tas ut. Det er tjenestepensjonsordningen din som beregner og vurderer retten til AFP.'
const hentetBeskrivelse =
	'AFP-beløpet er hentet fra <Statens pensjonskasse>. I beregningen av alderspensjon er livsvarig AFP tatt med fordi den kan ha betydning for når og hvordan alderspensjonen tas ut. Nav er ikke ansvarlig for beløpene som er hentet fra andre.'
const beggeVedtakBeskrivelse =
	'I beregningen av alderspensjon er livsvarig AFP tatt med fordi den kan ha betydning for når og hvordan alderspensjonen tas ut. AFP-beløpet ble hentet fra tjenestepensjonsordningen din ved saksbehandling av alderspensjonen din.'
const foersteUtbetaling = {
	alderAar: 62,
	maanedligBeloep: 8347,
	aarligBeloep: 100164,
}

test.describe('Livsvarig AFP i brev', () => {
	for (const scenario of [
		{
			navn: 'ingen vedtak',
			harVedtakAP: false,
			harVedtakLivsvarigAFP: false,
			beskrivelse: estimertBeskrivelse,
		},
		{
			navn: 'kun AP-vedtak',
			harVedtakAP: true,
			harVedtakLivsvarigAFP: false,
			beskrivelse: estimertBeskrivelse,
		},
		{
			navn: 'kun AFP-vedtak',
			harVedtakAP: false,
			harVedtakLivsvarigAFP: true,
			beskrivelse: hentetBeskrivelse,
		},
		{
			navn: 'AP- og AFP-vedtak',
			harVedtakAP: true,
			harVedtakLivsvarigAFP: true,
			beskrivelse: beggeVedtakBeskrivelse,
		},
	]) {
		test(`sender riktig brevtekst og første AFP-beløp ved ${scenario.navn}`, async ({
			page,
		}) => {
			await setupDefaultMocks(page)
			await page.route(
				'**/api/feature/internsimulator.lagre-brev-button',
				(route) => route.fulfill({ json: { enabled: true } })
			)
			await page.route('**/api/intern/v1/enheter', (route) =>
				route.fulfill({
					json: { enhetListe: [{ id: '1234', navn: 'Testenhet' }] },
				})
			)
			await page.route('**/api/v2/tpo-livsvarig-offentlig-afp', (route) =>
				route.fulfill({
					json: {
						afpStatus: scenario.harVedtakLivsvarigAFP,
						maanedligBeloep: scenario.harVedtakLivsvarigAFP ? 8347 : null,
					},
				})
			)
			if (scenario.harVedtakAP) {
				await mockApi(page, API_URLS.VEDTAK, MOCK_FILES.VEDTAK_UTEN_VEDTAK, {
					harVedtak: true,
					fremtidigAlderspensjon: { grad: 100, fom: '2031-05-01' },
				})
			}
			await mockApi(page, API_URLS.SIMULERING, MOCK_FILES.SIMULERING_V1, {
				livsvarigOffentligAfpListe: [
					foersteUtbetaling,
					{ alderAar: 67, maanedligBeloep: 8500, aarligBeloep: 102000 },
				],
				maanedligAlderspensjonForKnekkpunkter: {
					vedGradertUttak: { beloep: 10000, inntektspensjonBeloep: 10000 },
					vedHeltUttak: { beloep: 23333, inntektspensjonBeloep: 23333 },
				},
			})
			const lagreUrl = '**/api/intern/v1/lagre-simulering'
			await page.route(lagreUrl, (route) =>
				route.fulfill({ json: { url: 'about:blank' } })
			)
			await page.goto(
				'/?pid=encrypted-default-pid&saksbehandlerValgtEnhet=1234'
			)
			await fillMainFormFields({
				page,
				withDefaults: false,
				fields: {
					...(scenario.harVedtakLivsvarigAFP ? {} : { afp: 'Ja, offentlig' }),
					'eps-har-pensjon': 'Nei',
					'eps-har-inntekt-over-2g': 'Ja',
					'har-opphold-utenfor-norge': 'Nei',
					'inntekt-foer-uttak': '500000',
					'alder-uttak-aar': '65',
					'alder-uttak-md': '0',
					uttaksgrad: '50',
				},
			})
			await page.getByTestId('inntekt-vsa-gradert-uttak').fill('0')
			await page.getByTestId('alder-helt-uttak-aar').selectOption('67')
			await page.getByTestId('alder-helt-uttak-md').selectOption('0')
			await page
				.getByTestId('har-inntekt-vsa-helt-uttak')
				.getByLabel('Nei')
				.check()
			await page.getByTestId('beregn-button').click()
			await expect(
				page
					.getByTestId('beregning-section-gradert')
					.getByRole('row', { name: /Livsvarig AFP/ })
			).toContainText('8 347')

			const request = page.waitForRequest(lagreUrl)
			await page
				.getByRole('button', { name: 'Opprett brev', exact: true })
				.click()
			const kunBeskrivelse =
				scenario.harVedtakAP && scenario.harVedtakLivsvarigAFP
			const payload: unknown = (await request).postDataJSON()
			expect(payload).toEqual(
				expect.objectContaining({
					navEnhetId: '1234',
					simuleringsinformasjon: expect.objectContaining({
						gradertUttakInformasjon: {
							alder: { aar: 65, maaneder: 0 },
							uttaksdato: '01.05.2029',
							grad: 50,
						},
						heltUttakInformasjon: {
							alder: { aar: 67, maaneder: 0 },
							uttaksdato: '01.05.2031',
							grad: 100,
						},
					}),
					maanedligAlderspensjonForKnekkpunkter: expect.objectContaining({
						vedGradertUttak: expect.objectContaining({ beloep: 10000 }),
						vedHeltUttak: expect.objectContaining({ beloep: 23333 }),
					}),
					afpOffentligLivsvarig: {
						beskrivelse: scenario.beskrivelse,
						vedGradertUttak: kunBeskrivelse ? null : foersteUtbetaling,
						vedHeltUttak: kunBeskrivelse ? null : foersteUtbetaling,
					},
				})
			)
		})
	}
})
