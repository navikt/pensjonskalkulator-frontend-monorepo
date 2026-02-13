import type { Page } from '@playwright/test'
import { fillOutStegvisning } from 'utils/navigation'

import { expect, test } from '../../../base'
import { authenticate } from '../../../utils/auth'
import {
  alderspensjon,
  offentligTpFoer1963,
  pensjonsavtaler,
  person,
} from '../../../utils/mocks'

async function clickNeste(page: Page) {
  await page.getByTestId('stegvisning-neste-button').click()
}

async function personFoedtFoer1963() {
  return person({
    fornavn: 'Aprikos',
    sivilstand: 'UGIFT',
    foedselsdato: '1962-04-30',
    pensjoneringAldre: {
      normertPensjoneringsalder: { aar: 67, maaneder: 0 },
      nedreAldersgrense: { aar: 62, maaneder: 0 },
      oevreAldersgrense: { aar: 75, maaneder: 0 },
    },
  })
}

async function navigerTilAfpSteg(page: Page) {
  await fillOutStegvisning(page, {
    navigateTo: 'afp',
  })
  await page.getByRole('radio').first().waitFor({ state: 'visible' })
}

async function velgAfpEtterfulgtAvAlderspensjon(page: Page) {
  await page.getByTestId('afp-radio-ja-offentlig').check()
  await page
    .locator('input[type="radio"][value="AFP_ETTERFULGT_AV_ALDERSPENSJON"]')
    .check()
  await clickNeste(page)
}

async function velgKunAlderspensjon(page: Page) {
  await page.getByTestId('afp-radio-ja-offentlig').check()
  await page.locator('input[type="radio"][value="KUN_ALDERSPENSJON"]').check()
  await clickNeste(page)
}

async function samtykk(page: Page) {
  await expect(
    page.getByTestId('stegvisning.samtykke_pensjonsavtaler.title')
  ).toBeVisible()
  await page.getByRole('radio').first().check()
  await clickNeste(page)
}

async function ikkeSamtykk(page: Page) {
  await expect(
    page.getByTestId('stegvisning.samtykke_pensjonsavtaler.title')
  ).toBeVisible()
  await page.getByRole('radio').last().check()
  await clickNeste(page)
}

test.describe('AFP offentlig - født før 1963 uten vedtak', () => {
  test.describe('Som bruker som svarer "Ja, i offentlig sektor" og velger "AFP etterfulgt av alderspensjon fra 67 år", og som ikke har samtykket,', () => {
    test.use({ autoAuth: false })

    test.beforeEach(async ({ page }) => {
      await authenticate(page, [await personFoedtFoer1963()])

      await navigerTilAfpSteg(page)
      await velgAfpEtterfulgtAvAlderspensjon(page)
    })

    test('forventer jeg en info-alert om at jeg kan få en mer fullstendig beregning fra SPK hvis jeg samtykker.', async ({
      page,
    }) => {
      await page.getByRole('radio').last().check()
      await expect(
        page.getByTestId('samtykke-pensjonsavtaler-alert')
      ).toBeVisible()
    })
  })

  test.describe('Som bruker som svarer AFP offentlig, velger "AFP etterfulgt av alderspensjon fra 67 år", og samtykker,', () => {
    test.describe('Når bruker har TPO-forhold hos SPK,', () => {
      test.use({ autoAuth: false })

      test.beforeEach(async ({ page }) => {
        await authenticate(page, [
          await personFoedtFoer1963(),
          offentligTpFoer1963('spk_foer1963'),
          await alderspensjon({
            preset: 'med_afp_offentlig',
            pre2025OffentligAfp: {
              alderAar: 62,
              totaltAfpBeloep: 5000,
            },
          }),
          await pensjonsavtaler({ avtaler: [], utilgjengeligeSelskap: [] }),
        ])

        await navigerTilAfpSteg(page)
        await velgAfpEtterfulgtAvAlderspensjon(page)
        await samtykk(page)

        await page.waitForURL(/\/beregning-detaljert/)
      })

      test('forventer jeg å komme til avansert beregning med spørsmål om inntekt ved siden av AFP.', async ({
        page,
      }) => {
        await expect(page).toHaveURL(/\/beregning-detaljert/)

        await expect(
          page.locator(
            '[data-intl="beregning.avansert.rediger.afp_etterfulgt_av_ap.title"]'
          )
        ).toBeVisible()
      })

      test('forventer jeg å se stillingsprosent-feltet når jeg svarer ja på inntekt ved siden av AFP.', async ({
        page,
      }) => {
        await page.getByTestId('afp-inntekt-maaned-foer-uttak-radio-ja').check()

        await page.getByTestId('inntekt-vsa-afp-radio-ja').check()

        await expect(page.getByTestId('stillingsprosent-vsa-afp')).toBeVisible()
      })

      test.describe('Når jeg har valgt uttaksalder mellom 65 og 67 år,', () => {
        test.beforeEach(async ({ page }) => {
          await page
            .getByTestId('agepicker-helt-uttaksalder')
            .locator('select[name*="aar"]')
            .selectOption('65')

          await page
            .getByTestId('agepicker-helt-uttaksalder')
            .locator('select[name*="maaned"]')
            .selectOption('0')

          await page
            .getByTestId('afp-inntekt-maaned-foer-uttak-radio-ja')
            .check()

          await page.getByTestId('inntekt-vsa-afp-radio-nei').check()

          await page.getByTestId('beregn-pensjon').click()
        })

        test('forventer jeg informasjon i grunnlaget om at AFP mellom 65 og 67 år er hentet fra SPK.', async ({
          page,
        }) => {
          await page
            .getByRole('button', { name: /Vis detaljer om din AFP/i })
            .click()
          await expect(
            page.getByText(/Vi har hentet AFP mellom 65 og 67 år fra SPK/i)
          ).toBeVisible()
        })
      })

      test.describe('Når jeg har valgt uttaksalder mellom 62 og 65 år,', () => {
        test.beforeEach(async ({ page }) => {
          await authenticate(page, [
            await personFoedtFoer1963(),
            offentligTpFoer1963('spk_foer1963_nav_afp'),
            await alderspensjon({
              preset: 'med_afp_offentlig',
              pre2025OffentligAfp: {
                alderAar: 62,
                totaltAfpBeloep: 5000,
              },
            }),
            await pensjonsavtaler({
              avtaler: [],
              utilgjengeligeSelskap: [],
            }),
          ])

          await navigerTilAfpSteg(page)
          await velgAfpEtterfulgtAvAlderspensjon(page)
          await samtykk(page)
          await page.waitForURL(/\/beregning-detaljert/)

          await page
            .getByTestId('agepicker-helt-uttaksalder')
            .locator('select[name*="aar"]')
            .selectOption('64')

          await page
            .getByTestId('agepicker-helt-uttaksalder')
            .locator('select[name*="maaned"]')
            .selectOption('0')

          await page
            .getByTestId('afp-inntekt-maaned-foer-uttak-radio-ja')
            .check()

          await page.getByTestId('inntekt-vsa-afp-radio-nei').check()

          await page.getByTestId('beregn-pensjon').click()
        })

        test('forventer jeg å se AFP i grafen og tabellen.', async ({
          page,
        }) => {
          const chart = page.getByTestId('highcharts-aria-wrapper')
          await expect(
            chart.getByText(/AFP \(avtalefestet pensjon\)/)
          ).toBeVisible()

          await page.getByRole('button', { name: /Vis tabell/i }).click()

          await expect(
            page.getByRole('columnheader', {
              name: /AFP \(avtalefestet pensjon\)/i,
            })
          ).toBeVisible()
        })
      })

      test('forventer jeg en lenke fra pensjonsavtaler til AFP-seksjonen.', async ({
        page,
      }) => {
        await page
          .getByTestId('agepicker-helt-uttaksalder')
          .locator('select[name*="aar"]')
          .selectOption('65')

        await page
          .getByTestId('agepicker-helt-uttaksalder')
          .locator('select[name*="maaned"]')
          .selectOption('0')

        await page.getByTestId('afp-inntekt-maaned-foer-uttak-radio-ja').check()

        await page.getByTestId('inntekt-vsa-afp-radio-nei').check()

        await page.getByTestId('beregn-pensjon').click()

        await expect(
          page.getByRole('heading', { name: /Offentlig tjenestepensjon/i })
        ).toBeVisible()

        await expect(page.getByTestId('afp-offentlig-alert-link')).toBeVisible()
      })

      test('forventer jeg forbeholdstekst om at Nav ikke er ansvarlig for beløpene fra andre.', async ({
        page,
      }) => {
        await page
          .getByTestId('agepicker-helt-uttaksalder')
          .locator('select[name*="aar"]')
          .selectOption('65')

        await page
          .getByTestId('agepicker-helt-uttaksalder')
          .locator('select[name*="maaned"]')
          .selectOption('0')

        await page.getByTestId('afp-inntekt-maaned-foer-uttak-radio-ja').check()

        await page.getByTestId('inntekt-vsa-afp-radio-nei').check()

        await page.getByTestId('beregn-pensjon').click()

        await expect(
          page
            .getByText(
              /Nav er ikke ansvarlig for beløpene som er hentet inn fra andre/i
            )
            .first()
        ).toBeVisible()
      })
    })
  })

  test.describe('Som bruker som svarer AFP offentlig, velger "AFP etterfulgt av alderspensjon fra 67 år", og ikke samtykker,', () => {
    test.use({ autoAuth: false })

    test.beforeEach(async ({ page }) => {
      await authenticate(page, [await personFoedtFoer1963()])

      await navigerTilAfpSteg(page)
      await velgAfpEtterfulgtAvAlderspensjon(page)
      await ikkeSamtykk(page)

      await page.waitForURL(/\/beregning-detaljert/)
    })

    test('forventer jeg vanlig avansert beregning uten stillingsprosent-feltet.', async ({
      page,
    }) => {
      await expect(page).toHaveURL(/\/beregning-detaljert/)

      await page.getByTestId('afp-inntekt-maaned-foer-uttak-radio-ja').check()

      await page.getByTestId('inntekt-vsa-afp-radio-ja').check()

      await expect(
        page.getByTestId('stillingsprosent-vsa-afp')
      ).not.toBeVisible()
    })
  })

  test.describe('Som bruker som svarer AFP offentlig og velger "Kun alderspensjon",', () => {
    test.use({ autoAuth: false })

    test.beforeEach(async ({ page }) => {
      await authenticate(page, [await personFoedtFoer1963()])

      await navigerTilAfpSteg(page)
      await velgKunAlderspensjon(page)
      await samtykk(page)

      await page.waitForURL(/\/beregning/)
    })

    test('forventer jeg vanlig enkel beregning.', async ({ page }) => {
      await expect(page).toHaveURL(/\/beregning/)
    })
  })

  test.describe('Som bruker som svarer AFP privat,', () => {
    test.use({ autoAuth: false })

    test.beforeEach(async ({ page }) => {
      await authenticate(page, [await personFoedtFoer1963()])

      await fillOutStegvisning(page, {
        afp: 'ja_privat',
        samtykke: true,
        navigateTo: 'beregning',
      })
    })

    test('forventer jeg vanlig enkel beregning uten AFP offentlig.', async ({
      page,
    }) => {
      await expect(page).toHaveURL(/\/beregning/)
    })
  })

  test.describe('Som bruker som svarer "vet ikke" på AFP,', () => {
    test.use({ autoAuth: false })

    test.beforeEach(async ({ page }) => {
      await authenticate(page, [await personFoedtFoer1963()])

      await fillOutStegvisning(page, {
        afp: 'vet_ikke',
        samtykke: true,
        navigateTo: 'beregning',
      })
    })

    test('forventer jeg vanlig enkel beregning uten AFP offentlig.', async ({
      page,
    }) => {
      await expect(page).toHaveURL(/\/beregning/)
    })
  })

  test.describe('Som bruker som svarer "nei" på AFP,', () => {
    test.use({ autoAuth: false })

    test.beforeEach(async ({ page }) => {
      await authenticate(page, [await personFoedtFoer1963()])

      await fillOutStegvisning(page, {
        afp: 'nei',
        samtykke: true,
        navigateTo: 'beregning',
      })
    })

    test('forventer jeg vanlig enkel beregning uten AFP offentlig.', async ({
      page,
    }) => {
      await expect(page).toHaveURL(/\/beregning/)
    })
  })

  test.describe('Feilscenarioer for simuler-oftp/foer-1963', () => {
    test.describe('Når beregning gir 0 kr utbetaling,', () => {
      test.use({ autoAuth: false })

      test.beforeEach(async ({ page }) => {
        await authenticate(page, [
          await personFoedtFoer1963(),
          offentligTpFoer1963('spk_foer1963_null_utbetaling'),
          await alderspensjon({
            preset: 'med_afp_offentlig',
            pre2025OffentligAfp: {
              alderAar: 62,
              totaltAfpBeloep: 5000,
            },
          }),
          await pensjonsavtaler({ avtaler: [], utilgjengeligeSelskap: [] }),
        ])

        await navigerTilAfpSteg(page)
        await velgAfpEtterfulgtAvAlderspensjon(page)
        await samtykk(page)
        await page.waitForURL(/\/beregning-detaljert/)
      })

      test('forventer jeg at offentlig tjenestepensjon viser 0 kr.', async ({
        page,
      }) => {
        await page
          .getByTestId('agepicker-helt-uttaksalder')
          .locator('select[name*="aar"]')
          .selectOption('66')

        await page
          .getByTestId('agepicker-helt-uttaksalder')
          .locator('select[name*="maaned"]')
          .selectOption('0')

        await page.getByTestId('afp-inntekt-maaned-foer-uttak-radio-ja').check()

        await page.getByTestId('inntekt-vsa-afp-radio-nei').check()

        await page.getByTestId('beregn-pensjon').click()

        await expect(
          page.getByRole('heading', { name: /Offentlig tjenestepensjon/i })
        ).toBeVisible()
      })
    })

    test.describe('Når bruker ikke oppfyller inngangsvilkår,', () => {
      test.use({ autoAuth: false })

      test.beforeEach(async ({ page }) => {
        await authenticate(page, [
          await personFoedtFoer1963(),
          offentligTpFoer1963('spk_foer1963_oppfyller_ikke_inngangsvilkaar'),
          await alderspensjon({ preset: 'med_afp_offentlig' }),
          await pensjonsavtaler({ avtaler: [], utilgjengeligeSelskap: [] }),
        ])

        await navigerTilAfpSteg(page)
        await velgAfpEtterfulgtAvAlderspensjon(page)
        await samtykk(page)
        await page.waitForURL(/\/beregning-detaljert/)

        await page
          .getByTestId('agepicker-helt-uttaksalder')
          .locator('select[name*="aar"]')
          .selectOption('66')

        await page
          .getByTestId('agepicker-helt-uttaksalder')
          .locator('select[name*="maaned"]')
          .selectOption('0')

        await page.getByTestId('afp-inntekt-maaned-foer-uttak-radio-ja').check()

        await page.getByTestId('inntekt-vsa-afp-radio-nei').check()

        await page.getByTestId('beregn-pensjon').click()
      })

      test('forventer jeg en warning-alert om at vi fikk ikke hentet beregning av AFP fra SPK.', async ({
        page,
      }) => {
        await expect(
          page.getByText(
            /Du har fått en foreløpig beregning av AFP fra Nav. Vi fikk ikke hentet beregning av AFP fra Statens pensjonskasse/i
          )
        ).toBeVisible()
      })
    })

    test.describe('Når det er teknisk feil fra SPK,', () => {
      test.use({ autoAuth: false })

      test.beforeEach(async ({ page }) => {
        await authenticate(page, [
          await personFoedtFoer1963(),
          offentligTpFoer1963('spk_foer1963_teknisk_feil'),
          await alderspensjon({ preset: 'med_afp_offentlig' }),
          await pensjonsavtaler({ avtaler: [], utilgjengeligeSelskap: [] }),
        ])

        await navigerTilAfpSteg(page)
        await velgAfpEtterfulgtAvAlderspensjon(page)
        await samtykk(page)
        await page.waitForURL(/\/beregning-detaljert/)

        await page
          .getByTestId('agepicker-helt-uttaksalder')
          .locator('select[name*="aar"]')
          .selectOption('66')

        await page
          .getByTestId('agepicker-helt-uttaksalder')
          .locator('select[name*="maaned"]')
          .selectOption('0')

        await page.getByTestId('afp-inntekt-maaned-foer-uttak-radio-ja').check()

        await page.getByTestId('inntekt-vsa-afp-radio-nei').check()

        await page.getByTestId('beregn-pensjon').click()
      })

      test('forventer jeg at beregningen vises uten feilmelding om AFP.', async ({
        page,
      }) => {
        await expect(
          page.getByText(
            /Du har fått en foreløpig beregning av AFP fra Nav. Vi fikk ikke hentet beregning av AFP fra Statens pensjonskasse/i
          )
        ).not.toBeVisible()
      })
    })

    test.describe('Når simuler-oftp/foer-1963 svarer med serverfeil,', () => {
      test.use({ autoAuth: false })

      test.beforeEach(async ({ page }) => {
        await authenticate(page, [
          await personFoedtFoer1963(),
          offentligTpFoer1963('foer1963_server_error'),
          await alderspensjon({ preset: 'med_afp_offentlig' }),
          await pensjonsavtaler({ avtaler: [], utilgjengeligeSelskap: [] }),
        ])

        await navigerTilAfpSteg(page)
        await velgAfpEtterfulgtAvAlderspensjon(page)
        await samtykk(page)
        await page.waitForURL(/\/beregning-detaljert/)

        await page
          .getByTestId('agepicker-helt-uttaksalder')
          .locator('select[name*="aar"]')
          .selectOption('66')

        await page
          .getByTestId('agepicker-helt-uttaksalder')
          .locator('select[name*="maaned"]')
          .selectOption('0')

        await page.getByTestId('afp-inntekt-maaned-foer-uttak-radio-ja').check()

        await page.getByTestId('inntekt-vsa-afp-radio-nei').check()

        await page.getByTestId('beregn-pensjon').click()
      })

      test('forventer jeg en warning-alert om at vi ikke klarte å sjekke offentlige pensjonsavtaler.', async ({
        page,
      }) => {
        await expect(
          page.getByText(
            /Noe gikk galt ved henting av pensjonsavtaler i offentlig sektor/i
          )
        ).toBeVisible()
      })
    })
  })
})
