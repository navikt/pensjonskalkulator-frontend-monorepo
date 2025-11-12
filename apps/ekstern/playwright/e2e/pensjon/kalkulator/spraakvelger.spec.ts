import { test } from '../../../base'
import { expectElementVisible } from '../../../utils/form'

test.describe('Språkvelger', () => {
  test('setter Norsk Bokmål som default språk i løsningen for innhold styrt av react-intl og Sanity', async ({
    page,
  }) => {
    await expectElementVisible(page, 'stegvisning-start-button')
    await page.getByTestId('stegvisning-start-button').click()

    await expectElementVisible(page, 'sivilstand-heading')
    await page.getByTestId('stegvisning-neste-button').click()

    await expectElementVisible(page, 'utenlandsopphold-heading')
    await expectElementVisible(page, 'hva_er_opphold_utenfor_norge')
  })
})
