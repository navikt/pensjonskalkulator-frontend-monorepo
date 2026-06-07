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
	SANITY: '**/g2by7q6m**/data/query/**',
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
	SANITY_ALERT: 'sanity-alert-data.json',
} as const

const DEFAULT_GRUNNBELOEP = {
	dato: '2024-05-01',
	grunnbeløp: 100000,
	grunnbeløpPerMåned: 10000,
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
	await setupSanityMocks(page)
}

export async function setupSanityMocks(page: Page) {
	await mockApi(page, API_URLS.SANITY, MOCK_FILES.SANITY_ALERT)
}

export async function navigateToApp(page: Page) {
	await page.goto('/?pid=encrypted-default-pid')
	await page.waitForSelector('text=Pensjonskalkulator')
}
