import type { Page } from '@playwright/test'

import { mockApi } from './mock'

export const API_URLS = {
	DECRYPT: '**/api/v1/decrypt',
	PERSON: '**/api/intern/v1/person',
	VEDTAK: '**/api/v1/vedtak**',
	OMSTILLINGSSTOENAD:
		'**/api/v1/loepende-omstillingsstoenad-eller-gjenlevendeytelse',
	INNTEKT: '**/api/inntekt',
	GRUNNBELOEP: '**/api/v1/grunnbel*',
	SIMULERING: '**/api/intern/v1/pensjon/simulering',
	EPS: '**/api/intern/v1/eps',
	OPPTJENING: '**/api/intern/v1/opptjening',
	SANITY: '**/g2by7q6m**/data/query/**',
	ER_APOTEKER: '**/api/v1/er-apoteker',
} as const

export const MOCK_FILES = {
	PERSON: 'person-intern.json',
	VEDTAK: 'vedtak.json',
	VEDTAK_UTEN_VEDTAK: 'vedtak-uten-vedtak.json',
	OMSTILLINGSSTOENAD_FALSE: 'omstillingsstoenad-og-gjenlevende-false.json',
	OMSTILLINGSSTOENAD: 'omstillingsstoenad-og-gjenlevende.json',
	INNTEKT: 'inntekt.json',
	ALDERSPENSJON: 'alderspensjon.json',
	EPS_OPPLYSNING: 'eps-opplysning.json',
	SIMULERING_V1: 'simulering-v1.json',
	SIMULERING_V1_AFP_PRIVAT: 'simulering-v1-afp-privat.json',
	OPPTJENING: 'opptjening.json',
	SANITY_ALERT: 'sanity-alert-data.json',
	ER_APOTEKER: 'er-apoteker.json',
} as const

const DEFAULT_GRUNNBELOEP = {
	dato: '2024-05-01',
	grunnbeløp: 100000,
	grunnbeløpPerMaaned: 10000,
	gjennomsnittPerÅr: 99000,
	omregningsfaktor: 1.05,
	virkningstidspunktForMinsteinntekt: '2024-09-01',
} as const

export async function setupDefaultMocks(
	page: Page,
	personOverrides?: Record<string, unknown>
) {
	await page.route(API_URLS.DECRYPT, (route) =>
		route.fulfill({
			status: 200,
			contentType: 'text/plain',
			body: '04925398980',
		})
	)
	await mockApi(page, API_URLS.PERSON, MOCK_FILES.PERSON, personOverrides)
	await mockApi(page, API_URLS.VEDTAK, MOCK_FILES.VEDTAK_UTEN_VEDTAK)
	await mockApi(
		page,
		API_URLS.OMSTILLINGSSTOENAD,
		MOCK_FILES.OMSTILLINGSSTOENAD_FALSE
	)
	await mockApi(page, API_URLS.INNTEKT, MOCK_FILES.INNTEKT)
	await mockApi(page, API_URLS.GRUNNBELOEP, undefined, DEFAULT_GRUNNBELOEP)
	await mockApi(page, API_URLS.OPPTJENING, MOCK_FILES.OPPTJENING)
	await mockApi(page, API_URLS.ER_APOTEKER, MOCK_FILES.ER_APOTEKER)
	await setupSanityMocks(page)
}

export async function setupSanityMocks(page: Page) {
	await mockApi(page, API_URLS.SANITY, MOCK_FILES.SANITY_ALERT)
}

export async function navigateToApp(page: Page) {
	await page.goto('/?pid=encrypted-default-pid')
	await page.waitForSelector('text=Pensjonskalkulator')
}

const RADIO_FIELDS = new Set([
	'eps-har-pensjon',
	'eps-har-inntekt-over-2g',
	'afp',
	'har-opphold-utenfor-norge',
	'har-inntekt-vsa-helt-uttak',
])

const SELECT_FIELDS = new Set([
	'sivilstatus-select',
	'alder-uttak-aar',
	'alder-uttak-md',
	'uttaksgrad',
	'alder-helt-uttak-aar',
	'alder-helt-uttak-md',
	'alder-inntekt-slutter-aar',
	'alder-inntekt-slutter-md',
])

export type FormFields = Record<string, string>

export const DEFAULT_FORM_FIELDS: FormFields = {
	afp: 'Nei',
	'inntekt-foer-uttak': '500000',
	'alder-uttak-aar': '67',
	'alder-uttak-md': '3',
	uttaksgrad: '100',
	'har-opphold-utenfor-norge': 'Nei',
	'har-inntekt-vsa-helt-uttak': 'Nei',
}

export async function fillMainFormFields({
	page,
	fields = {},
	withDefaults = true,
}: {
	page: Page
	fields?: FormFields
	withDefaults?: boolean
}) {
	const allFields = withDefaults
		? { ...DEFAULT_FORM_FIELDS, ...fields }
		: fields

	for (const [testId, value] of Object.entries(allFields)) {
		if (RADIO_FIELDS.has(testId)) {
			await page.getByTestId(testId).getByLabel(value).check()
		} else if (SELECT_FIELDS.has(testId)) {
			await page.getByTestId(testId).selectOption(value)
		} else {
			await page.getByTestId(testId).fill(value)
		}
	}
}
