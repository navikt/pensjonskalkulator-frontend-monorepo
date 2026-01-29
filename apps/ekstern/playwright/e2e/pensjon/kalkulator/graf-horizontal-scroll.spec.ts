import { expect, test } from 'base'
import { authenticate } from 'utils/auth'
import { person, tidligsteUttaksalder } from 'utils/mocks'
import { fillOutStegvisning } from 'utils/navigation'

test.describe('Graf Horizontal scroll', () => {
  test.describe('Gitt at grafen rendres på desktop,', () => {
    test.use({ autoAuth: false })

    test.beforeEach(async ({ page }) => {
      await authenticate(page, [
        await person({
          sivilstand: 'UGIFT',
          alder: { aar: 60 },
          pensjoneringAldre: {
            normertPensjoneringsalder: { aar: 67, maaneder: 0 },
            nedreAldersgrense: { aar: 62, maaneder: 0 },
            oevreAldersgrense: { aar: 75, maaneder: 0 },
          },
        }),
        await tidligsteUttaksalder({ aar: 62, maaneder: 10 }),
      ])
      await fillOutStegvisning(page, {
        sivilstand: 'UGIFT',
        epsHarPensjon: null,
        epsHarInntektOver2G: null,
        afp: 'nei',
        samtykke: true,
        navigateTo: 'beregning',
      })
    })

    test('brukeren kan se og bruke navigasjonsknappene når antall søyler passer i skjermens bredde.', async ({
      page,
    }) => {
      await page.getByRole('button', { name: '70' }).click()
      await expect(page.getByTestId('highcharts-aria-wrapper')).toBeVisible()
      await expect(
        page.getByRole('button', { name: 'Færre år' })
      ).not.toBeVisible()
      await expect(
        page.getByRole('button', { name: 'Flere år' })
      ).not.toBeVisible()
    })

    test('brukeren kan se og bruke navigasjonsknappene når det er flere søyler enn skjermens bredde.', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 414, height: 896 })

      const responsePromise = page.waitForResponse((response) =>
        response.url().includes('/api/v9/alderspensjon/simulering')
      )
      await page.getByRole('button', { name: /67.*år/i }).click()
      await responsePromise

      await expect(page.getByTestId('highcharts-aria-wrapper')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Færre år' })).toBeHidden()
      await expect(page.getByRole('button', { name: 'Flere år' })).toBeVisible()

      // Scroller til høyre slik at begge knappene blir synlige
      await page
        .getByRole('button', { name: 'Flere år' })
        .click({ force: true })
      await expect(page.getByRole('button', { name: 'Færre år' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Flere år' })).toBeVisible()

      // Scroller maksimalt til høyre slik at Flere år skjules
      await page.evaluate(() => {
        const el = document.querySelector('.highcharts-scrolling')
        if (el) {
          el.scrollLeft = el.scrollWidth
        }
      })
      await expect(page.getByRole('button', { name: 'Flere år' })).toBeHidden()

      // Scroller til venstre slik at begge knappene blir synlige igjen
      await page
        .getByRole('button', { name: 'Færre år' })
        .click({ force: true })
      await expect(page.getByRole('button', { name: 'Færre år' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Flere år' })).toBeVisible()

      // Scroller maksimalt til venstre slik at Færre år skjules
      await page.evaluate(() => {
        const el = document.querySelector('.highcharts-scrolling')
        if (el) {
          el.scrollLeft = 0
        }
      })
      await expect(page.getByRole('button', { name: 'Færre år' })).toBeHidden()
      await expect(page.getByRole('button', { name: 'Flere år' })).toBeVisible()
    })
  })
})
