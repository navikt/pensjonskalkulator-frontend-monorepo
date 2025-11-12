import { expect, test } from '../../../base'

const totalTests = 12

for (let i = 1; i <= totalTests; i++) {
  test(`shard demo #${i} loads kalkulator shell`, async ({ page }) => {
    await expect(page.locator('body')).toBeVisible()
  })
}
