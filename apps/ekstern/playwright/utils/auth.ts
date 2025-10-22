import { Page } from '@playwright/test'

import { type RouteDefinition, setupInterceptions } from '../base'

export const authenticate = async (
  page: Page,
  overwrites: RouteDefinition[] = []
) => {
  await setupInterceptions(page, overwrites)
  await page.goto('/pensjon/kalkulator/', { waitUntil: 'load' })

  const btn = page.getByTestId('landingside-enkel-kalkulator-button')
  await btn.waitFor({ state: 'visible' })

  await btn.click()

  await page.waitForURL(/\/start/)
}
