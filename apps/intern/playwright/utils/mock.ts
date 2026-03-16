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

function deepMerge(
	target: Record<string, unknown>,
	source: Record<string, unknown>
): Record<string, unknown> {
	const result = { ...target }
	for (const key of Object.keys(source)) {
		const tVal = target[key]
		const sVal = source[key]
		if (
			tVal &&
			sVal &&
			typeof tVal === 'object' &&
			typeof sVal === 'object' &&
			!Array.isArray(tVal) &&
			!Array.isArray(sVal)
		) {
			result[key] = deepMerge(
				tVal as Record<string, unknown>,
				sVal as Record<string, unknown>
			)
		} else {
			result[key] = sVal
		}
	}
	return result
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
	const body = JSON.stringify(
		overrides ? deepMerge(baseMock, overrides) : baseMock
	)

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
