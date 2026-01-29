import { Page } from '@playwright/test'
import { expect, test } from 'base'
import { authenticate } from 'utils/auth'
import {
  alderspensjon,
  apotekerError,
  person,
  tidligsteUttaksalder,
} from 'utils/mocks'
import { fillOutStegvisning } from 'utils/navigation'

test.use({ autoAuth: false })

async function clickNeste(page: Page) {
  await page.getByTestId('stegvisning-neste-button').click()
}

async function setApotekerErrorState(page: Page) {
  await page.evaluate(() => {
    window.store.dispatch({
      type: 'sessionSlice/setErApotekerError',
      payload: true,
    })
  })
}

async function personFoedtEtter1963() {
  return person({
    fornavn: 'Aprikos',
    sivilstand: 'UGIFT',
    foedselsdato: '1964-04-30',
    pensjoneringAldre: {
      normertPensjoneringsalder: { aar: 67, maaneder: 0 },
      nedreAldersgrense: { aar: 62, maaneder: 0 },
      oevreAldersgrense: { aar: 75, maaneder: 0 },
    },
  })
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

test.describe('AFP', () => {
  test.describe('Som bruker som har logget inn på kalkulatoren og som har samtykket til innhenting av avtaler,', () => {
    test.beforeEach(async ({ page }) => {
      await authenticate(page, [
        await personFoedtEtter1963(),
        await tidligsteUttaksalder({ aar: 62, maaneder: 10 }),
      ])
      await fillOutStegvisning(page, {
        navigateTo: 'afp',
      })
      await page.getByRole('radio').first().waitFor({ state: 'visible' })
    })

    test.describe('Når jeg svarer "vet ikke" på spørsmål om AFP,', () => {
      // 1
      test('forventer jeg informasjon om at jeg bør sjekke med arbeidsgiver om jeg har rett til AFP.', async ({
        page,
      }) => {
        await expect(page.getByTestId('stegvisning.afp.title')).toBeVisible()
        await page.getByTestId('afp-radio-vet-ikke').check()
        await expect(
          page.getByText(/Er du usikker, bør du sjekke med arbeidsgiveren din/i)
        ).toBeVisible()
      })

      // 2
      test('forventer jeg å kunne gå videre til neste steg uten noe infosteg imellom.', async ({
        page,
      }) => {
        await page.getByTestId('afp-radio-vet-ikke').check()
        await clickNeste(page)
        await expect(
          page.getByTestId('samtykke-offentlig-afp-title')
        ).not.toBeVisible()
        await expect(
          page.getByTestId('stegvisning.samtykke_pensjonsavtaler.title')
        ).toBeVisible()
      })

      // 3
      test('ønsker jeg en graf som viser utviklingen av total pensjon (Inntekt,Pensjonsavtaler, alderspensjon) fra uttaksalderen jeg har valgt. AFP vises ikke.', async ({
        page,
      }) => {
        await fillOutStegvisning(page, {
          afp: 'vet_ikke',
          samtykke: true,
          navigateTo: 'beregning',
        })

        await page.getByRole('button', { name: '62 år og 10 md.' }).click()
        await expect(page).toHaveURL(/\/beregning/)
        await expect(page.getByTestId('highcharts-aria-wrapper')).toBeVisible()
      })

      // 4
      test('forventer jeg å få informasjon i grunnlaget om at AFP kan påvirke min uttaksalder.', async ({
        page,
      }) => {
        await fillOutStegvisning(page, {
          afp: 'vet_ikke',
          samtykke: true,
          navigateTo: 'beregning',
        })

        await page.getByRole('button', { name: '70' }).click()
        await expect(page.getByTestId('grunnlag.title')).toBeVisible()
        await page.getByTestId('grunnlag.afp.title').click()
        await expect(
          page.locator('[data-intl="grunnlag.afp.ingress.vet_ikke"]')
        ).toBeVisible()
      })
    })

    test.describe('Når jeg svarer "nei" på spørsmål om AFP,', () => {
      // 5
      test('forventer jeg å kunne gå videre til neste steg uten noe infosteg imellom.', async ({
        page,
      }) => {
        await expect(page.getByTestId('stegvisning.afp.title')).toBeVisible()
        await page.getByTestId('afp-radio-nei').check()
        await clickNeste(page)
        await expect(
          page.getByTestId('samtykke-offentlig-afp-title')
        ).not.toBeVisible()
        await expect(
          page.getByTestId('stegvisning.samtykke_pensjonsavtaler.title')
        ).toBeVisible()
      })

      // 6
      test('ønsker jeg en graf som viser utviklingen av total pensjon (Inntekt,Pensjonsavtaler, alderspensjon) fra uttaksalderen jeg har valgt. AFP vises ikke.', async ({
        page,
      }) => {
        await fillOutStegvisning(page, {
          afp: 'nei',
          samtykke: true,
          navigateTo: 'beregning',
        })

        await page.getByRole('button', { name: '62 år og 10 md.' }).click()
        await expect(page).toHaveURL(/\/beregning/)
        await expect(page.getByTestId('highcharts-aria-wrapper')).toBeVisible()
      })

      // 7
      test('forventer jeg å få informasjon i grunnlaget om at jeg ikke har rett til AFP og kan endre valgene mine for AFP', async ({
        page,
      }) => {
        await fillOutStegvisning(page, {
          afp: 'nei',
          samtykke: true,
          navigateTo: 'beregning',
        })

        await page.getByRole('button', { name: '70' }).click()
        await expect(page.getByTestId('grunnlag.title')).toBeVisible()
        await page.getByTestId('grunnlag.afp.title').click()
        await expect(
          page.locator('[data-intl="grunnlag.afp.ingress.nei"]')
        ).toBeVisible()
        const afpLink = page.getByTestId('grunnlag.afp.afp_link')
        await expect(afpLink).toBeVisible()
      })
    })

    test.describe('Når jeg svarer "ja, privat" på spørsmål om AFP,', () => {
      // 8
      test('forventer jeg å kunne gå videre til neste steg uten noe infosteg imellom.', async ({
        page,
      }) => {
        await expect(page.getByTestId('stegvisning.afp.title')).toBeVisible()
        await page.getByTestId('afp-radio-ja-privat').check()
        await clickNeste(page)
        await expect(
          page.getByTestId('samtykke-offentlig-afp-title')
        ).not.toBeVisible()
        await expect(
          page.getByTestId('stegvisning.samtykke_pensjonsavtaler.title')
        ).toBeVisible()
      })

      // 9
      test('ønsker jeg en graf som viser utviklingen av total pensjon (Inntekt, AFP, Pensjonsavtaler, alderspensjon) fra uttaksalderen jeg har valgt.', async ({
        page,
      }) => {
        await fillOutStegvisning(page, {
          afp: 'ja_privat',
          samtykke: true,
          navigateTo: 'beregning',
        })

        await page.getByRole('button', { name: '62 år og 10 md.' }).click()
        await expect(page).toHaveURL(/\/beregning/)
        await expect(page.getByTestId('highcharts-aria-wrapper')).toBeVisible()
      })

      // 10
      test('forventer jeg å få informasjon i grunnlaget om at vilkårene for AFP ikke vurderes av Nav, men av Fellesordningen.', async ({
        page,
      }) => {
        await fillOutStegvisning(page, {
          afp: 'ja_privat',
          samtykke: true,
          navigateTo: 'beregning',
        })

        await page.getByRole('button', { name: '70' }).click()
        await expect(page.getByTestId('grunnlag.title')).toBeVisible()
        await page.getByTestId('grunnlag.afp.title').click()
        await expect(
          page.locator('[data-intl="grunnlag.afp.ingress.ja_privat"]')
        ).toBeVisible()
      })
    })

    test.describe('Når jeg svarer "ja, offentlig" på spørsmål om AFP og samtykker til beregning av AFP-offentlig,', () => {
      // 11
      test('forventer jeg å bli spurt om samtykke før jeg kan gå videre til neste steg.', async ({
        page,
      }) => {
        await expect(page.getByTestId('stegvisning.afp.title')).toBeVisible()
        await page.getByTestId('afp-radio-ja-offentlig').check()
        await clickNeste(page)
        await expect(
          page.getByTestId('samtykke-offentlig-afp-title')
        ).toBeVisible()
      })

      // 12
      test('ønsker jeg en graf som viser utviklingen av total pensjon (Inntekt, AFP, Pensjonsavtaler, alderspensjon) fra uttaksalderen jeg har valgt.', async ({
        page,
      }) => {
        await authenticate(page, [
          await personFoedtEtter1963(),
          await tidligsteUttaksalder({ aar: 62, maaneder: 10 }),
          await alderspensjon({ preset: 'med_afp_offentlig' }),
        ])

        await fillOutStegvisning(page, {
          afp: 'ja_offentlig',
          samtykkeAfpOffentlig: true,
          samtykke: true,
          navigateTo: 'beregning',
        })

        await page.getByRole('button', { name: '62 år og 10 md.' }).click()
        await expect(page).toHaveURL(/\/beregning/)
        await expect(page.getByTestId('highcharts-aria-wrapper')).toBeVisible()
      })

      // 13
      test('forventer jeg å få informasjon i grunnlaget om at vilkårene for AFP ikke vurderes av Nav, og at det må sjekkes hos tjenestepensjonsordningen min.', async ({
        page,
      }) => {
        await fillOutStegvisning(page, {
          afp: 'ja_offentlig',
          samtykkeAfpOffentlig: true,
          samtykke: true,
          navigateTo: 'beregning',
        })

        await page.getByRole('button', { name: '70' }).click()
        await expect(page.getByTestId('grunnlag.title')).toBeVisible()
        await page.getByTestId('grunnlag.afp.title').click()
        await expect(
          page.locator('[data-intl="grunnlag.afp.ingress.ja_offentlig"]')
        ).toBeVisible()
      })
    })

    test.describe('Når jeg svarer "ja, offentlig" på spørsmål om AFP men samtykker ikke til beregning av AFP-offentlig', () => {
      // 14
      test('forventer jeg å bli spurt om samtykke før jeg kan gå videre til neste steg', async ({
        page,
      }) => {
        await expect(page.getByTestId('stegvisning.afp.title')).toBeVisible()
        await page.getByTestId('afp-radio-ja-offentlig').check()
        await clickNeste(page)
        await expect(
          page.getByTestId('samtykke-offentlig-afp-title')
        ).toBeVisible()
      })

      // 15
      test('ønsker jeg en graf som viser utviklingen av total pensjon (Inntekt, Pensjonsavtaler, alderspensjon) fra uttaksalderen jeg har valgt. AFP vises ikke.', async ({
        page,
      }) => {
        await fillOutStegvisning(page, {
          afp: 'ja_offentlig',
          samtykkeAfpOffentlig: false,
          samtykke: true,
          navigateTo: 'beregning',
        })

        await page.getByRole('button', { name: '62 år og 10 md.' }).click()
        await expect(page).toHaveURL(/\/beregning/)
        await expect(page.getByTestId('highcharts-aria-wrapper')).toBeVisible()
      })

      // 16
      test('forventer jeg å få informasjon i grunnlaget om at beregningen min ikke inkluderer AFP-offentlig pga. at jeg ikke samtykket til det.', async ({
        page,
      }) => {
        await fillOutStegvisning(page, {
          afp: 'ja_offentlig',
          samtykkeAfpOffentlig: false,
          samtykke: true,
          navigateTo: 'beregning',
        })

        await page.getByRole('button', { name: '70' }).click()
        await expect(page.getByTestId('grunnlag.title')).toBeVisible()
        await page.getByTestId('grunnlag.afp.title').click()
        await expect(
          page.locator(
            '[data-intl="grunnlag.afp.ingress.ja_offentlig_utilgjengelig"]'
          )
        ).toBeVisible()
      })
    })

    test.describe('Når jeg svarer "ja, offentlig" på spørsmål om AFP, er født 1963 eller senere, og kall til /er-apoteker feiler', () => {
      test.beforeEach(async ({ page }) => {
        await authenticate(page, [
          await personFoedtEtter1963(),
          await tidligsteUttaksalder({ aar: 62, maaneder: 10 }),
          apotekerError(),
        ])

        await setApotekerErrorState(page)

        await fillOutStegvisning(page, {
          navigateTo: 'afp',
        })
        await page.getByRole('radio').first().waitFor({ state: 'visible' })
        await page.getByTestId('afp-radio-ja-offentlig').check()
      })

      // 17
      test('forventer jeg apoteker-warning på AFP-steget', async ({ page }) => {
        await expect(page.getByTestId('apotekere-warning')).toBeVisible()
      })

      // 18
      test('forventer jeg apoteker-warning på samtykke AFP offentlig steget', async ({
        page,
      }) => {
        await clickNeste(page)
        await expect(page.getByTestId('apotekere-warning')).toBeVisible()
      })

      // 19
      test('forventer jeg apoteker-warning på pensjonsavtaler steget', async ({
        page,
      }) => {
        await clickNeste(page)
        await page.getByRole('radio').nth(0).check()
        await clickNeste(page)
        await expect(page.getByTestId('apotekere-warning')).toBeVisible()
      })

      // 20
      test('forventer jeg informasjon om at beregning med AFP kan bli feil hvis jeg er medlem av Pensjonsordningen for apotekvirksomhet og at jeg må prøve igjen senere', async ({
        page,
      }) => {
        await fillOutStegvisning(page, {
          afp: 'ja_offentlig',
          samtykkeAfpOffentlig: true,
          samtykke: true,
          navigateTo: 'beregning',
        })
        await page.getByRole('button', { name: '70' }).click()

        await expect(page).toHaveURL(/\/beregning/)
        await expect(page.getByTestId('apotekere-warning')).toBeVisible()
      })

      // 21
      test('forventer jeg ingen informasjon om AFP på beregningssiden', async ({
        page,
      }) => {
        await fillOutStegvisning(page, {
          afp: 'ja_offentlig',
          samtykkeAfpOffentlig: true,
          samtykke: true,
          navigateTo: 'beregning',
        })
        await page.getByRole('button', { name: '70' }).click()

        await expect(page).toHaveURL(/\/beregning/)
        await expect(page.getByTestId('grunnlag-afp')).not.toBeVisible()
      })
    })

    test.describe('Når jeg svarer "ja, offentlig" på spørsmål om AFP, er født før 1963, og velger "AFP etterfulgt av alderspensjon fra 67 år"', () => {
      test.beforeEach(async ({ page }) => {
        await authenticate(page, [await personFoedtFoer1963()])

        await fillOutStegvisning(page, {
          navigateTo: 'afp',
        })
        await page.getByRole('radio').first().waitFor({ state: 'visible' })

        await page.getByTestId('afp-radio-ja-offentlig').check()

        await page
          .locator(
            'input[type="radio"][value="AFP_ETTERFULGT_AV_ALDERSPENSJON"]'
          )
          .check()
        await clickNeste(page)

        await expect(
          page.getByTestId('stegvisning.samtykke_pensjonsavtaler.title')
        ).toBeVisible()
        await page.getByRole('radio').first().check()
        await clickNeste(page)

        await page.waitForURL(/\/beregning-detaljert/)
      })

      // 22
      test('forventer jeg å kunne gå videre til avansert skjema uten noe samtykke AFP infosteg imellom', async ({
        page,
      }) => {
        await expect(page).toHaveURL(/\/beregning-detaljert/)

        await expect(
          page.locator(
            '[data-intl="beregning.avansert.rediger.afp_etterfulgt_av_ap.title"]'
          )
        ).toBeVisible()
      })

      // 23
      test('forventer jeg å få informasjon i grunnlaget om at Nav ikke har vurdert om jeg fyller alle vilkår for AFP', async ({
        page,
      }) => {
        await expect(page).toHaveURL(/\/beregning-detaljert/)

        await page
          .getByTestId('agepicker-helt-uttaksalder')
          .locator('select[name*="aar"]')
          .selectOption('64')

        await page
          .getByTestId('agepicker-helt-uttaksalder')
          .locator('select[name*="maaned"]')
          .selectOption('0')

        await page.getByTestId('afp-inntekt-maaned-foer-uttak-radio-ja').check()

        await page.getByTestId('inntekt-vsa-afp-radio-nei').check()

        await page.getByTestId('beregn-pensjon').click()
        await page.getByTestId('grunnlag.afp.title').click()

        await expect(
          page.locator('[data-intl="grunnlag.afp.ingress.ja_offentlig"]')
        ).toBeVisible()
      })
    })

    test.describe('Når jeg svarer "ja, offentlig" på spørsmål om AFP, er født før 1963, og velger "Kun alderspensjon"', () => {
      test.beforeEach(async ({ page }) => {
        await authenticate(page, [await personFoedtFoer1963()])

        await fillOutStegvisning(page, {
          navigateTo: 'afp',
        })
        await page.getByRole('radio').first().waitFor({ state: 'visible' })

        await page.getByTestId('afp-radio-ja-offentlig').check()

        await page
          .locator('input[type="radio"][value="KUN_ALDERSPENSJON"]')
          .check()
        await clickNeste(page)

        await expect(
          page.getByTestId('stegvisning.samtykke_pensjonsavtaler.title')
        ).toBeVisible()
        await page.getByRole('radio').first().check()
        await clickNeste(page)

        await page.waitForURL(/\/beregning/)
      })

      // 24
      test('forventer jeg å kunne gå videre til enkel beregning uten noe infosteg imellom', async ({
        page,
      }) => {
        await expect(page).toHaveURL(/\/beregning/)
      })
    })
  })
})
