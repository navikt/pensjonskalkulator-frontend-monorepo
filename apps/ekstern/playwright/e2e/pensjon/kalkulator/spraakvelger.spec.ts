import { expect, test } from '../../../base'

test.describe('Språkvelger', () => {
  test('setter Norsk Bokmål som default språk i løsningen for innhold styrt av react-intl og Sanity', async ({
    page,
  }) => {
    await expect(page.getByTestId('stegvisning-start-button')).toBeVisible()
    await page.getByTestId('stegvisning-start-button').click()

    await expect(page.getByTestId('sivilstand-heading')).toBeVisible()
    await page.getByTestId('stegvisning-neste-button').click()

    await expect(page.getByTestId('utenlandsopphold-heading')).toBeVisible()
    await expect(page.getByTestId('hva_er_opphold_utenfor_norge')).toBeVisible()
  })
})
