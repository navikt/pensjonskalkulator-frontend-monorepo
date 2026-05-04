import type { Page } from '@playwright/test'

import { mockApi } from './mock'

export const API_URLS = {
	DECRYPT: '**/api/v1/decrypt',
	PERSON: '**/api/intern/v1/person',
	LOEPENDE_VEDTAK: '**/api/v4/vedtak/loepende-vedtak',
	INNTEKT: '**/api/inntekt',
	GRUNNBELOEP: '**/api/v1/grunnbel*',
	SIMULERING: '**/api/intern/v1/pensjon/simulering',
	EPS: '**/api/intern/v1/eps',
	SANITY: '**/g2by7q6m**/data/query/**',
} as const

export const MOCK_FILES = {
	PERSON: 'person-intern.json',
	LOEPENDE_VEDTAK: 'loepende-vedtak.json',
	INNTEKT: 'inntekt.json',
	ALDERSPENSJON: 'alderspensjon.json',
	EPS_OPPLYSNING: 'eps-opplysning.json',
	SIMULERING_V1: 'simulering-v1.json',
	SIMULERING_V1_AFP_PRIVAT: 'simulering-v1-afp-privat.json',
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
	await mockApi(page, API_URLS.LOEPENDE_VEDTAK, MOCK_FILES.LOEPENDE_VEDTAK)
	await mockApi(page, API_URLS.INNTEKT, MOCK_FILES.INNTEKT)
	await mockApi(page, API_URLS.GRUNNBELOEP, undefined, DEFAULT_GRUNNBELOEP)
}

export async function navigateToApp(page: Page) {
	await page.goto('/?pid=encrypted-default-pid')
	await page.waitForSelector('text=Pensjonskalkulator')
}
