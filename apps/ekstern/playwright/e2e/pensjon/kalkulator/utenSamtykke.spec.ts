import { Page } from '@playwright/test'

import { expect, test } from '../../../base'
import { fillOutStegvisning } from '../../../utils/navigation'

async function selectUttaksalder(page: Page, label: string) {
  const button = page.getByRole('button', { name: label })
  await button.waitFor({ state: 'visible' })
  await button.click()
}

test.describe('Uten samtykke', () => {
  test.describe('Som bruker som har logget inn på kalkulatoren,', () => {
    test.describe('Gitt at jeg ikke samtykker til innhenting av avtaler,', () => {
      test.describe('Når jeg er kommet til beregningssiden og velger hvilken alder jeg ønsker beregning fra,', () => {
        test.beforeEach(async ({ page }) => {
          await fillOutStegvisning(page, {
            afp: 'ja_privat',
            samtykke: false,
            navigateTo: 'beregning',
          })
        })

        // 1
        test('ønsker jeg en graf som viser utviklingen av total pensjon (Inntekt, AFP, alderspensjon) fra uttaksalderen jeg har valgt. Jeg forventer at resultatet ikke viser tjenestepensjon og pensjonsavtaler siden jeg ikke har gitt samtykke til innhenting av opplysninger fra Norsk pensjon og offentlige tjenestepensjonsordninger.', async ({
          page,
        }) => {
          await selectUttaksalder(page, '62 år og 10 md.')

          await expect(
            page.getByRole('heading', { name: 'Årlig inntekt og pensjon' })
          ).toBeVisible()

          await expect(
            page.getByRole('button', { name: 'Vis tabell av beregningen' })
          ).toBeVisible()

          await page.getByRole('button', { name: '70 år' }).click()

          await page
            .getByRole('button', { name: 'Vis tabell av beregningen' })
            .click()
          await expect(
            page.getByRole('button', { name: 'Lukk tabell av beregningen' })
          ).toBeVisible()

          await expect(
            page.getByRole('columnheader', { name: 'Pensjonsgivende inntekt' })
          ).toBeVisible()
          await expect(
            page.getByRole('columnheader', {
              name: 'AFP (avtalefestet pensjon)',
            })
          ).toBeVisible()
          await expect(
            page.getByRole('columnheader', {
              name: 'Pensjonsavtaler (arbeidsgivere m.m.)',
            })
          ).not.toBeVisible()
          await expect(
            page.getByRole('columnheader', { name: 'Alderspensjon (Nav)' })
          ).toBeVisible()
        })

        // 2
        test('forventer jeg å få informasjon om inntekten og pensjonen min for beregningen. Jeg må kunne trykke på de ulike faktorene for å få opp mer informasjon.', async ({
          page,
        }) => {
          await page.getByRole('button', { name: '70 år' }).click()

          await expect(
            page.getByRole('heading', { name: 'Om inntekten og pensjonen din' })
          ).toBeVisible()
          await expect(
            page.getByRole('heading', { name: /Årlig inntekt frem til uttak:/ })
          ).toBeVisible()
          await expect(
            page.getByRole('heading', { name: /AFP: Privat/ })
          ).toBeVisible()

          await page.getByRole('button', { name: /Sivilstand/ }).click()
          await page
            .getByRole('button', { name: /Opphold utenfor Norge/ })
            .click()
        })

        // 3
        test('forventer informasjon om at pensjonsavtaler ikke er hentet. Jeg må kunne trykke på "start en ny beregning" hvis jeg ønsker ny beregning med samtykke til pensjonsavtaler.', async ({
          page,
        }) => {
          await selectUttaksalder(page, '62 år og 10 md.')

          await expect(
            page.getByTestId('pensjonsavtaler-heading')
          ).toBeVisible()

          await page.getByRole('button', { name: 'Tilbake til start' }).click()

          await page
            .getByRole('button', { name: 'Gå tilbake til start' })
            .click()

          await expect(page).toHaveURL(/\/pensjon\/kalkulator\/start/)
        })
      })
    })
  })
})
