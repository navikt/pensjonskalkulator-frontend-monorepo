import { Page } from '@playwright/test'

export async function selectDropdown(
  page: Page,
  testId: string,
  value: string | number
) {
  const select = page.getByTestId(testId)
  await select.waitFor({ state: 'visible' })
  await select.selectOption(
    typeof value === 'number' ? { index: value } : value
  )
}

export async function checkRadio(page: Page, testId: string) {
  const radio = page.getByTestId(testId)
  await radio.waitFor({ state: 'visible' })
  await radio.check({ force: true })
}

export async function fillAgePicker(
  page: Page,
  baseName: string,
  age: { aar: string; maaneder: string }
) {
  const yearSelect = page.getByTestId(`age-picker-${baseName}-aar`)
  const monthSelect = page.getByTestId(`age-picker-${baseName}-maaneder`)

  await yearSelect.waitFor({ state: 'visible' })
  await yearSelect.selectOption(age.aar)

  await monthSelect.waitFor({ state: 'visible' })
  await monthSelect.selectOption(age.maaneder)
}

export async function expectElementVisible(page: Page, testId: string) {
  const element = page.getByTestId(testId)
  await element.waitFor({ state: 'visible' })
  return element
}
