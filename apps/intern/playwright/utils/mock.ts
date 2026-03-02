import type { Page } from '@playwright/test'
import fs from 'fs/promises'

const MOCKS_DATA_PKG = '@pensjonskalkulator-frontend-monorepo/mocks/data'

export async function loadJSONMock(name: string): Promise<unknown> {
	const filePath = import.meta.resolve(`${MOCKS_DATA_PKG}/${name}`)
	const data = await fs.readFile(new URL(filePath), 'utf-8')
	return JSON.parse(data)
}

export async function loadHTMLMock(name: string): Promise<string> {
	const filePath = import.meta.resolve(`${MOCKS_DATA_PKG}/${name}`)
	return fs.readFile(new URL(filePath), 'utf-8')
}

export async function mockApi(
	page: Page,
	url: string,
	mockFile?: string,
	overrides?: Record<string, unknown>
) {
	const baseMock = mockFile
		? ((await loadJSONMock(mockFile)) as Record<string, unknown>)
		: {}
	const body = JSON.stringify({ ...baseMock, ...overrides })

	await page.route(url, (route) =>
		route.fulfill({
			status: 200,
			contentType: 'application/json',
			body,
		})
	)
}

export async function mockApiError(page: Page, url: string, status = 500) {
	await page.route(url, (route) =>
		route.fulfill({
			status,
			contentType: 'application/json',
			body: JSON.stringify({ message: 'Error' }),
		})
	)
}
