import AxeBuilder from '@axe-core/playwright'
import { Page } from '@playwright/test'
import { expect, setupInterceptions, test } from 'base'
import { authenticate } from 'utils/auth'
import { fillOutStegvisning } from 'utils/navigation'

const MOCK_DATE = new Date(2024, 0, 1, 12, 0, 0)

async function checkA11y(page: Page) {
  const accessibilityScanResults = await new AxeBuilder({ page })
    .include('main')
    .disableRules(['color-contrast'])
    .analyze()

  expect(accessibilityScanResults.violations).toEqual([])
}

test.describe('Pensjonskalkulator a11y', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install({ time: MOCK_DATE })
  })

  test('rendrer stegsvisning.', async ({ page }) => {
    await authenticate(page)

    await expect(page.getByText('Hei Aprikos!')).toBeVisible()
    await checkA11y(page)
    await page.getByRole('button', { name: 'Kom i gang' }).click()

    await expect(page.getByTestId('stegvisning.sivilstand.title')).toBeVisible()
    await checkA11y(page)
    await page.locator('select[name="sivilstand"]').selectOption({ index: 1 })
    await page.locator('input[name="epsHarPensjon"][value="nei"]').check()
    await page.locator('input[name="epsHarInntektOver2G"][value="nei"]').check()
    await page.getByRole('button', { name: 'Neste' }).click()

    await expect(
      page.getByTestId('stegvisning.utenlandsopphold.title')
    ).toBeVisible()
    await checkA11y(page)
    await page.locator('[type="radio"]').first().check()
    await page.getByTestId('legg-til-utenlandsopphold').click({ force: true })
    await page.getByTestId('utenlandsopphold-land').selectOption('Spania')
    await page
      .getByTestId('utenlandsopphold-arbeidet-utenlands-ja')
      .check({ force: true })
    await page.getByTestId('utenlandsopphold-startdato').clear()
    await page.getByTestId('utenlandsopphold-startdato').fill('30.04.1981')
    await checkA11y(page)
    await page.getByTestId('legg-til-utenlandsopphold-submit').click({
      force: true,
    })
    await page.getByRole('button', { name: 'Neste' }).click({
      force: true,
    })

    await expect(page.getByText('AFP (avtalefestet pensjon)')).toBeVisible()
    await page.getByTestId('om_livsvarig_AFP_i_offentlig_sektor').click()
    await page.locator('[type="radio"]').first().check()
    await checkA11y(page)
    await page.getByRole('button', { name: 'Neste' }).click()

    await expect(page.getByTestId('samtykke-offentlig-afp-title')).toBeVisible()
    await checkA11y(page)
    await page.locator('[type="radio"]').first().check()
    await page.getByRole('button', { name: 'Neste' }).click()

    await expect(
      page.getByTestId('stegvisning.samtykke_pensjonsavtaler.title')
    ).toBeVisible()
    await checkA11y(page)
    await page.locator('[type="radio"]').first().check()
    await page.getByTestId('stegvisning-neste-button').click()
  })

  test('rendrer resultatsside for enkel uten a11y-feil.', async ({ page }) => {
    await authenticate(page)
    await fillOutStegvisning(page, {
      samtykke: false,
      afp: 'vet_ikke',
      navigateTo: 'beregning',
    })

    await expect(
      page.getByText(
        'Beregningen din viser at du kan ta ut 100 % alderspensjon fra du er'
      )
    ).toBeVisible()
    await page.getByRole('button', { name: '70 år' }).click()

    await expect(page.getByText('Årlig inntekt frem til uttak:')).toBeVisible()
    await expect(page.getByText('Alderspensjon').first()).toBeVisible()
    await expect(page.getByTestId('grunnlag.afp.title')).toBeVisible()
    await page
      .getByRole('button', { name: 'Sivilstand' })
      .click({ force: true })
    await page
      .getByRole('button', { name: 'Opphold utenfor Norge' })
      .click({ force: true })
    await checkA11y(page)
  })

  test('rendrer skjemaet og resultatsside for avansert uten a11y-feil.', async ({
    page,
  }) => {
    await authenticate(page)
    await fillOutStegvisning(page, {
      samtykke: false,
      afp: 'vet_ikke',
      navigateTo: 'beregning',
    })

    await page.getByTestId('toggle-avansert').waitFor({ state: 'visible' })
    const toggleAvansert = page.getByTestId('toggle-avansert')
    await toggleAvansert.getByText('Avansert').click()

    await expect(
      page.getByText('Pensjonsgivende årsinntekt frem til pensjon')
    ).toBeVisible()

    await checkA11y(page)

    await page
      .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
      .selectOption('65')
    await page
      .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
      .selectOption('3')
    await page.getByTestId('uttaksgrad').selectOption('40 %')
    await page.getByTestId('inntekt-vsa-gradert-uttak-radio-ja').check()
    await page.getByTestId('inntekt-vsa-gradert-uttak').fill('300000')
    await page
      .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
      .selectOption('67')
    await page
      .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
      .selectOption('0')
    await page.getByTestId('inntekt-vsa-helt-uttak-radio-ja').check()
    await page.getByTestId('inntekt-vsa-helt-uttak').fill('100000')

    await page
      .getByTestId('age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar')
      .selectOption('75')
    await page
      .getByTestId('age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder')
      .selectOption('0')

    await page.getByRole('button', { name: 'Beregn pensjon' }).click()
    await expect(
      page.getByRole('heading', { name: 'Alderspensjon (Nav)' })
    ).toBeVisible()
    await checkA11y(page)
  })

  test('Når brukeren ikke oppfyller vilkaar for valgt uttaksalder, rendrer skjemaet med forslag om annet uttak uten a11y-feil.', async ({
    page,
  }) => {
    await authenticate(page)
    await fillOutStegvisning(page, {
      samtykke: false,
      afp: 'vet_ikke',
      navigateTo: 'beregning',
    })

    await page.getByTestId('toggle-avansert').waitFor({ state: 'visible' })
    const toggleAvansert = page.getByTestId('toggle-avansert')
    await toggleAvansert.getByText('Avansert').click()

    await page
      .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
      .selectOption('65')
    await page
      .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
      .selectOption('1')
    await page.getByTestId('uttaksgrad').selectOption('100 %')
    await page.getByTestId('inntekt-vsa-helt-uttak-radio-nei').check()

    await page.route(
      /\/pensjon\/kalkulator\/api\/v9\/alderspensjon\/simulering/,
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            alderspensjon: [],
            vilkaarsproeving: {
              vilkaarErOppfylt: false,
              alternativ: {
                heltUttaksalder: { aar: 65, maaneder: 3 },
              },
            },
          }),
        })
      }
    )

    await page.getByRole('button', { name: 'Beregn pensjon' }).click()

    await expect(
      page.getByRole('heading', { name: 'Alderspensjon (Nav)' })
    ).not.toBeVisible()
    await expect(
      page.getByText('Pensjonsgivende årsinntekt frem til pensjon')
    ).toBeVisible()
    await expect(
      page.getByText(
        'Opptjeningen din er ikke høy nok til ønsket uttak. Du må øke alderen eller sette ned uttaksgraden.'
      )
    ).toBeVisible()
    await checkA11y(page)
  })

  test.describe('Vedlikeholdsmodus', () => {
    test.use({ autoAuth: false })

    test('rendrer informasjonsside når vedlikeholdsmodus er på uten a11y-feil', async ({
      page,
    }) => {
      await setupInterceptions(page, [
        {
          url: /\/pensjon\/kalkulator\/api\/feature\//,
          overrideJsonResponse: { enabled: true },
        },
      ])

      await page.goto('/pensjon/kalkulator/')
      await page.getByRole('button', { name: 'Pensjonskalkulator' }).click()

      await checkA11y(page)
    })
  })

  test.describe('Andre sider', () => {
    test.use({ autoAuth: false })

    test('rendrer andre sider uten a11y-feil.', async ({ page }) => {
      await setupInterceptions(page)

      await page.goto('/pensjon/kalkulator/forbehold')
      await checkA11y(page)

      await page.goto('/pensjon/kalkulator/personopplysninger')
      await checkA11y(page)

      await page.goto('/pensjon/kalkulator/tulleside')
      await checkA11y(page)
    })
  })
})
