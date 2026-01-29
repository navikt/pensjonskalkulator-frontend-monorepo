import { Page } from '@playwright/test'
import { expect, test } from 'base'
import { authenticate } from 'utils/auth'
import {
  apotekerError,
  loependeVedtak,
  person,
  tidligsteUttaksalder,
} from 'utils/mocks'
import { fillOutStegvisning } from 'utils/navigation'

test.use({ autoAuth: false })

async function personEldreEnn62() {
  return person({
    fornavn: 'Aprikos',
    sivilstand: 'UGIFT',
    alder: { aar: 62, maaneder: 1, dager: 5 },
    pensjoneringAldre: {
      normertPensjoneringsalder: { aar: 67, maaneder: 0 },
      nedreAldersgrense: { aar: 62, maaneder: 0 },
      oevreAldersgrense: { aar: 75, maaneder: 0 },
    },
  })
}

async function personYngreEnn62() {
  return person({
    fornavn: 'Aprikos',
    sivilstand: 'UGIFT',
    alder: { aar: 60 },
    pensjoneringAldre: {
      normertPensjoneringsalder: { aar: 67, maaneder: 0 },
      nedreAldersgrense: { aar: 62, maaneder: 0 },
      oevreAldersgrense: { aar: 75, maaneder: 0 },
    },
  })
}

async function ufoeretrygdMock(grad: number) {
  return loependeVedtak({
    harLoependeVedtak: true,
    ufoeretrygd: { grad },
  })
}

async function clickNeste(page: Page) {
  await page.getByTestId('stegvisning-neste-button').click()
}

async function clickStart(page: Page) {
  await page.getByTestId('stegvisning-start-button').click()
  await page.waitForURL(/\/sivilstand/)
}

async function navigateToAfpStep(page: Page) {
  await fillOutStegvisning(page, {
    navigateTo: 'afp',
  })
  await page.getByRole('radio').first().waitFor({ state: 'visible' })
}

async function navigateToBeregning(page: Page, afp: AfpRadio = 'nei') {
  await fillOutStegvisning(page, {
    afp,
    samtykke: false,
    navigateTo: 'beregning',
  })
}

async function navigateToAvansertBeregning(page: Page) {
  await navigateToBeregning(page, 'nei')
  await page.getByTestId('toggle-avansert').getByText('Avansert').click()
}

async function setApotekerErrorState(page: Page) {
  await page.evaluate(() => {
    window.store.dispatch({
      type: 'sessionSlice/setErApotekerError',
      payload: true,
    })
  })
}

test.describe('Med ufoeretrygd', () => {
  test.describe('Som bruker som har logget inn på kalkulatoren, mottar uføretrygd og er eldre enn 62 år', () => {
    test.beforeEach(async ({ page }) => {
      await authenticate(page, [
        await personEldreEnn62(),
        await ufoeretrygdMock(90),
      ])
    })

    test('forventer jeg å ikke få steget om AFP og at neste steg er "Pensjonsavtaler".', async ({
      page,
    }) => {
      await fillOutStegvisning(page, {
        navigateTo: 'samtykke',
      })

      await expect(
        page.getByTestId('stegvisning.samtykke_pensjonsavtaler.title')
      ).toBeVisible()
      await expect(
        page.getByTestId('stegvisning.samtykke_pensjonsavtaler.title')
      ).toHaveText('Pensjonsavtaler')
    })
  })

  test.describe('Som bruker som har logget inn på kalkulatoren og som mottar uføretrygd,', () => {
    test.beforeEach(async ({ page }) => {
      await authenticate(page, [
        await personYngreEnn62(),
        await ufoeretrygdMock(90),
      ])
      await navigateToAfpStep(page)
    })

    test.describe('Når jeg svarer "nei" på spørsmål om AFP,', () => {
      test('forventer jeg å kunne gå videre til neste steg.', async ({
        page,
      }) => {
        await expect(page.getByText('Har du rett til AFP?')).toBeVisible()
        await expect(page.getByText('Ja, i offentlig sektor')).toBeVisible()
        await expect(page.getByText('Ja, i privat sektor')).toBeVisible()
        await expect(page.getByText('Nei')).toBeVisible()
        await expect(page.getByText('Vet ikke')).toBeVisible()

        await page.getByRole('radio').nth(2).check()
        await clickNeste(page)
      })

      test('forventer jeg å få informasjon i grunnlaget tilpasset valgt svar på AFP steg.', async ({
        page,
      }) => {
        await page.getByRole('radio').nth(2).check()
        await clickNeste(page)
        await page.getByRole('radio').nth(1).check()
        await clickNeste(page)
        await page.getByRole('button', { name: '67' }).click()

        await page.getByText('AFP: Nei').click()
        await expect(
          page.getByText(
            'Du har svart at du ikke har rett til AFP. Derfor vises ikke AFP i beregningen. Du kan endre valgene dine for AFP ved å gå tilbake til AFP (avtalefestet pensjon).'
          )
        ).toBeVisible()
      })
    })

    test.describe('Når jeg svarer "vet ikke" på spørsmål om AFP,', () => {
      test('forventer jeg informasjon om at AFP og uføretrygd ikke kan kombineres, og at jeg må velge før fylte 62 år. Jeg kan gå videre til neste steg.', async ({
        page,
      }) => {
        await expect(page.getByText('Har du rett til AFP?')).toBeVisible()
        await expect(page.getByText('Ja, i offentlig sektor')).toBeVisible()
        await expect(page.getByText('Ja, i privat sektor')).toBeVisible()
        await expect(page.getByText('Nei')).toBeVisible()
        await expect(page.getByText('Vet ikke')).toBeVisible()

        await page.getByRole('radio').nth(3).check()
        await clickNeste(page)

        await expect(
          page.getByText('Uføretrygd og AFP (avtalefestet pensjon)')
        ).toBeVisible()
        await expect(
          page.getByText(
            'AFP og uføretrygd kan ikke kombineres. Hvis du ikke gir oss beskjed, mister du retten til AFP (men beholder uføretrygden).'
          )
        ).toBeVisible()
        await expect(
          page.getByText(
            'Før du fyller 62 år må du velge mellom å få AFP eller å beholde uføretrygden.'
          )
        ).toBeVisible()
        await clickNeste(page)
      })

      test('forventer jeg å få informasjon i grunnlaget tilpasset valgt svar på AFP steg.', async ({
        page,
      }) => {
        await page.getByRole('radio').nth(3).check()
        await clickNeste(page)
        await clickNeste(page)
        await page.getByRole('radio').nth(1).check()
        await clickNeste(page)
        await page.getByRole('button', { name: '67' }).click()

        await page.getByText('AFP: Vet ikke').click()
        await expect(
          page.getByText(
            'Hvis du er usikker på om du har AFP bør du spørre arbeidsgiveren din.'
          )
        ).toBeVisible()
      })
    })

    test.describe('Når jeg svarer "ja, offentlig" på spørsmål om AFP,', () => {
      test('forventer jeg informasjon om at AFP og uføretrygd ikke kan kombineres, og at jeg må velge før fylte 62 år. Jeg kan gå videre til neste steg.', async ({
        page,
      }) => {
        await expect(page.getByText('Har du rett til AFP?')).toBeVisible()
        await expect(page.getByText('Ja, i offentlig sektor')).toBeVisible()
        await expect(page.getByText('Ja, i privat sektor')).toBeVisible()
        await expect(page.getByText('Nei')).toBeVisible()
        await expect(page.getByText('Vet ikke')).toBeVisible()

        await page.getByRole('radio').nth(0).check()
        await clickNeste(page)

        await expect(
          page.getByText('Uføretrygd og AFP (avtalefestet pensjon)')
        ).toBeVisible()
        await expect(
          page.getByText(
            'AFP og uføretrygd kan ikke kombineres. Hvis du ikke gir oss beskjed, mister du retten til AFP (men beholder uføretrygden).'
          )
        ).toBeVisible()
        await expect(
          page.getByText(
            'Før du fyller 62 år må du velge mellom å få AFP eller å beholde uføretrygden.'
          )
        ).toBeVisible()
        await clickNeste(page)
      })

      test('forventer jeg å få informasjon i grunnlaget tilpasset valgt svar på AFP steg.', async ({
        page,
      }) => {
        await page.getByRole('radio').nth(0).check()
        await clickNeste(page)
        await clickNeste(page)
        await page.getByRole('radio').nth(1).check()
        await clickNeste(page)
        await page.getByRole('radio').nth(0).check()
        await clickNeste(page)
        await page.getByRole('button', { name: '67' }).click()

        await page.getByText('AFP: Offentlig (ikke beregnet)').click()
        await expect(
          page.getByText(
            'Du har oppgitt AFP i offentlig sektor, men du har ikke samtykket til at Nav beregner den. Derfor vises ikke AFP i beregningen.'
          )
        ).toBeVisible()
      })

      test.describe('Gitt at bruker er født 1963 eller senere, og kall til /er-apoteker feiler', () => {
        test.beforeEach(async ({ page }) => {
          await authenticate(page, [
            await person({
              fornavn: 'Aprikos',
              sivilstand: 'UGIFT',
              alder: { aar: 60 },
              pensjoneringAldre: {
                normertPensjoneringsalder: { aar: 67, maaneder: 0 },
                nedreAldersgrense: { aar: 62, maaneder: 0 },
                oevreAldersgrense: { aar: 75, maaneder: 0 },
              },
            }),
            await ufoeretrygdMock(90),
            apotekerError(),
          ])

          await setApotekerErrorState(page)

          await fillOutStegvisning(page, {
            afp: 'ja_offentlig',
            samtykkeAfpOffentlig: true,
            samtykke: true,
            navigateTo: 'beregning',
          })
          await page.getByRole('button', { name: '67' }).click()
        })

        test('forventer jeg informasjon om at beregning med AFP kan bli feil hvis jeg er medlem av Pensjonsordningen for apotekvirksomhet og at jeg må prøve igjen senere', async ({
          page,
        }) => {
          await expect(page).toHaveURL(/\/beregning/)
          await expect(page.getByTestId('apotekere-warning')).toBeVisible()
        })

        test('forventer jeg ingen informasjon om AFP på beregningssiden', async ({
          page,
        }) => {
          await expect(page).toHaveURL(/\/beregning/)
          await expect(page.getByTestId('grunnlag-afp')).not.toBeVisible()
        })
      })
    })

    test.describe('Når jeg svarer "ja, privat" på spørsmål om AFP,', () => {
      test('forventer jeg informasjon om at AFP og uføretrygd ikke kan kombineres, og at jeg må velge før fylte 62 år. Jeg kan gå videre til neste steg.', async ({
        page,
      }) => {
        await expect(page.getByText('Har du rett til AFP?')).toBeVisible()
        await expect(page.getByText('Ja, i offentlig sektor')).toBeVisible()
        await expect(page.getByText('Ja, i privat sektor')).toBeVisible()
        await expect(page.getByText('Nei')).toBeVisible()
        await expect(page.getByText('Vet ikke')).toBeVisible()

        await page.getByRole('radio').nth(1).check()
        await clickNeste(page)

        await expect(
          page.getByText('Uføretrygd og AFP (avtalefestet pensjon)')
        ).toBeVisible()
        await expect(
          page.getByText(
            'AFP og uføretrygd kan ikke kombineres. Hvis du ikke gir oss beskjed, mister du retten til AFP (men beholder uføretrygden).'
          )
        ).toBeVisible()
        await expect(
          page.getByText(
            'Før du fyller 62 år må du velge mellom å få AFP eller å beholde uføretrygden.'
          )
        ).toBeVisible()
        await clickNeste(page)
      })

      test('forventer jeg å få informasjon i grunnlaget tilpasset valgt svar på AFP steg.', async ({
        page,
      }) => {
        await page.getByRole('radio').nth(1).check()
        await clickNeste(page)
        await clickNeste(page)
        await page.getByRole('radio').nth(1).check()
        await clickNeste(page)
        await page.getByRole('button', { name: '67' }).click()

        await page.getByText('AFP: Privat (ikke beregnet)').click()
        await expect(
          page.getByText(
            'AFP og uføretrygd kan ikke kombineres, og får du utbetalt uføretrygd etter at du fyller 62 år mister du retten til AFP. Du må derfor velge mellom AFP og uføretrygd før du er 62 år.'
          )
        ).toBeVisible()
      })
    })
  })

  test.describe('Som bruker som har logget inn på kalkulatoren, mottar uføretrygd og er eldre enn 62 år', () => {
    test.beforeEach(async ({ page }) => {
      await authenticate(page, [
        await personEldreEnn62(),
        await ufoeretrygdMock(90),
        await tidligsteUttaksalder({ aar: 67, maaneder: 0 }),
      ])
    })

    test.describe('Når jeg er kommet til beregningssiden,', () => {
      test('forventer jeg at informasjon om AFP står i grunnlaget.', async ({
        page,
      }) => {
        await fillOutStegvisning(page, {
          afp: 'vet_ikke',
          samtykke: false,
          navigateTo: 'beregning',
        })
        await page
          .getByRole('button', { name: '67' })
          .waitFor({ state: 'visible' })
        await page.getByRole('button', { name: '67' }).click()

        const afpGrunnlag = page.getByTestId('grunnlag.afp.title')
        await expect(afpGrunnlag).toBeVisible()
      })
    })
  })

  test.describe('Som bruker som har logget inn på kalkulatoren, som mottar 100 % uføretrygd og som ikke har rett til AFP', () => {
    test.beforeEach(async ({ page }) => {
      await authenticate(page, [
        await personYngreEnn62(),
        await ufoeretrygdMock(100),
      ])
    })

    test.describe('Når jeg er kommet til beregningssiden,', () => {
      test('forventer jeg informasjon om hvilken grad uføretrygd jeg har.', async ({
        page,
      }) => {
        await navigateToBeregning(page)
        await expect(page.getByText('Du har 100 % uføretrygd.')).toBeVisible()
      })

      test('forventer jeg tilpasset informasjon i read more «om pensjonsalder og uføretrygd».', async ({
        page,
      }) => {
        await navigateToBeregning(page)
        await expect(page.getByTestId('om_pensjonsalder_UT_hel')).toBeVisible()
      })

      test('forventer jeg å kunne velge alder fra 67 år til 75 år.', async ({
        page,
      }) => {
        await navigateToBeregning(page)
        await expect(
          page.getByText('Når vil du ta ut alderspensjon?')
        ).toBeVisible()

        const agesInRange = [67, 68, 69, 70, 71, 72, 73, 74, 75]
        for (const age of agesInRange) {
          await expect(
            page.getByRole('button', { name: `${age}` })
          ).toBeVisible()
        }
        await expect(page.getByRole('button', { name: '66' })).not.toBeVisible()
        await expect(page.getByRole('button', { name: '76' })).not.toBeVisible()
      })
    })
  })

  test.describe('Som bruker som har logget inn på kalkulatoren, som mottar gradert uføretrygd og som ikke har rett til AFP,', () => {
    test.beforeEach(async ({ page }) => {
      await authenticate(page, [
        await personYngreEnn62(),
        await ufoeretrygdMock(75),
      ])
    })

    test.describe('Når jeg er kommet til beregningssiden,', () => {
      test('forventer jeg informasjon om hvilken grad uføretrygd jeg har.', async ({
        page,
      }) => {
        await navigateToBeregning(page)
        await expect(
          page.getByText(
            'Du har 75 % uføretrygd. Her kan du beregne 100 % alderspensjon fra 67 år.'
          )
        ).toBeVisible()
      })

      test('forventer jeg tilpasset informasjon i read more «om pensjonsalder og uføretrygd».', async ({
        page,
      }) => {
        await navigateToBeregning(page)
        await expect(
          page.getByTestId('om_pensjonsalder_UT_gradert_enkel')
        ).toBeVisible()
      })

      test('forventer jeg å kunne velge alder fra 67 år til 75 år.', async ({
        page,
      }) => {
        await navigateToBeregning(page)
        await expect(
          page.getByText('Når vil du ta ut alderspensjon?')
        ).toBeVisible()

        const agesInRange = [67, 68, 69, 70, 71, 72, 73, 74, 75]
        for (const age of agesInRange) {
          await expect(
            page.getByRole('button', { name: `${age}` })
          ).toBeVisible()
        }
        await expect(page.getByRole('button', { name: '66' })).not.toBeVisible()
        await expect(page.getByRole('button', { name: '76' })).not.toBeVisible()
      })
    })
  })

  test.describe('Som bruker som har logget inn på kalkulatoren, som mottar 100 % uføretrygd, som ikke har rett til AFP og som ønsker en avansert beregning,', () => {
    test.beforeEach(async ({ page }) => {
      await authenticate(page, [
        await personYngreEnn62(),
        await ufoeretrygdMock(100),
      ])
    })

    test.describe('Når jeg er kommet til avansert beregning,', () => {
      test('forventer jeg å kunne velge pensjonsalder mellom 67 år + 0 md og 75 år og 0 md.', async ({
        page,
      }) => {
        await navigateToAvansertBeregning(page)
        await expect(
          page.getByText('Når vil du ta ut alderspensjon?')
        ).toBeVisible()
        await expect(page.getByText('Velg år')).toBeVisible()

        const aarSelect = page.getByTestId(
          'age-picker-uttaksalder-helt-uttak-aar'
        )
        const options = await aarSelect.locator('option').allTextContents()
        expect(options.length).toBe(10)
        expect(options[1]).toBe('67 år')
        expect(options[9]).toBe('75 år')

        await aarSelect.selectOption('67')
        await page
          .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
          .selectOption('6')
        await page.getByTestId('uttaksgrad').selectOption('50 %')

        const gradertAarSelect = page.getByTestId(
          'age-picker-uttaksalder-gradert-uttak-aar'
        )
        const gradertOptions = await gradertAarSelect
          .locator('option')
          .allTextContents()
        expect(gradertOptions.length).toBe(10)
        expect(gradertOptions[1]).toBe('67 år')
        expect(gradertOptions[9]).toBe('75 år')

        const heltOptions2 = await aarSelect.locator('option').allTextContents()
        expect(heltOptions2.length).toBe(10)
        expect(heltOptions2[1]).toBe('67 år')
        expect(heltOptions2[9]).toBe('75 år')
      })

      test('forventer jeg å få tilpasset informasjon i read more «Om pensjonsalder og uføretrygd».', async ({
        page,
      }) => {
        await navigateToAvansertBeregning(page)
        await expect(page.getByTestId('om_pensjonsalder_UT_hel')).toBeVisible()
      })
    })
  })

  test.describe('Som bruker som har logget inn på kalkulatoren, som mottar gradert uføretrygd, som ikke har rett til AFP og som ønsker en avansert beregning,', () => {
    test.beforeEach(async ({ page }) => {
      await authenticate(page, [
        await personYngreEnn62(),
        await ufoeretrygdMock(40),
      ])
    })

    test.describe('Når jeg er kommet til avansert beregning,', () => {
      test('forventer jeg å kunne velge pensjonsalder mellom 62 år + 0 md og 75 år og 0 md, og jeg kan velge pensjonsalder mellom 67 år + 0 md og 75 år og 0 md for når jeg ønsker øke til hel alderspensjon.', async ({
        page,
      }) => {
        await navigateToAvansertBeregning(page)
        await expect(
          page.getByText('Når vil du ta ut alderspensjon?')
        ).toBeVisible()
        await expect(page.getByText('Velg år')).toBeVisible()

        const aarSelect = page.getByTestId(
          'age-picker-uttaksalder-helt-uttak-aar'
        )
        const options = await aarSelect.locator('option').allTextContents()
        expect(options.length).toBe(15)
        expect(options[1]).toBe('62 år')
        expect(options[14]).toBe('75 år')

        await aarSelect.selectOption('63')
        await page
          .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
          .selectOption('6')
        await page.getByTestId('uttaksgrad').selectOption('50 %')

        const gradertAarSelect = page.getByTestId(
          'age-picker-uttaksalder-gradert-uttak-aar'
        )
        const gradertOptions = await gradertAarSelect
          .locator('option')
          .allTextContents()
        expect(gradertOptions.length).toBe(15)
        expect(gradertOptions[1]).toBe('62 år')
        expect(gradertOptions[14]).toBe('75 år')

        const heltOptions2 = await aarSelect.locator('option').allTextContents()
        expect(heltOptions2.length).toBe(10)
        expect(heltOptions2[1]).toBe('67 år')
        expect(heltOptions2[9]).toBe('75 år')
      })

      test('forventer jeg å få tilpasset informasjon i read more «Om pensjonsalder og uføretrygd».', async ({
        page,
      }) => {
        await navigateToAvansertBeregning(page)
        await expect(
          page.getByTestId('om_pensjonsalder_UT_gradert_avansert')
        ).toBeVisible()
      })
    })

    test.describe('Når jeg har valgt pensjonsalder mellom 62 år og 0 md og 66 år og 11 md.,', () => {
      test('forventer jeg at mulige uttaksgrader begrenses til uttaksgradene som er mulig å kombinere med uføretrygd.', async ({
        page,
      }) => {
        await navigateToAvansertBeregning(page)
        await page
          .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
          .selectOption('63')
        await page
          .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
          .selectOption('6')

        const uttaksgradSelect = page.getByTestId('uttaksgrad')
        const options = await uttaksgradSelect
          .locator('option')
          .allTextContents()
        expect(options.length).toBe(5)
        expect(options[1]).toBe('20 %')
        expect(options[4]).toBe('60 %')
      })

      test('forventer jeg å få tilpasset informasjon i read more "om uttaksgrad og uføretrygd".', async ({
        page,
      }) => {
        await navigateToAvansertBeregning(page)
        await page
          .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
          .selectOption('63')
        await page
          .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
          .selectOption('6')

        await expect(page.getByTestId('om_uttaksgrad_UT_gradert')).toBeVisible()
      })

      test('forventer jeg tilpasset informasjon om inntekt samtidig som uttak av pensjon.', async ({
        page,
      }) => {
        await navigateToAvansertBeregning(page)
        await page
          .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
          .selectOption('63')
        await page
          .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
          .selectOption('6')
        await page.getByTestId('uttaksgrad').selectOption('50 %')

        await expect(
          page.getByText(
            'Forventer du å ha inntekt samtidig som du tar ut 50 % pensjon?'
          )
        ).toBeVisible()
        await expect(
          page.getByText(
            'Alderspensjonen påvirker ikke inntektsgrensen for uføretrygden din.'
          )
        ).toBeVisible()

        await page
          .getByRole('button', {
            name: 'Om alderspensjon og inntektsgrensen for uføretrygd',
          })
          .click()
        await expect(
          page.getByTestId('om_alderspensjon_inntektsgrense_UT')
        ).toBeVisible()
      })
    })

    test.describe('Når jeg har valgt pensjonsalder etter 67 år og 0 md.,', () => {
      test('forventer jeg å kunne velge alle uttaksgrader.', async ({
        page,
      }) => {
        await navigateToAvansertBeregning(page)
        await page
          .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
          .selectOption('69')
        await page
          .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
          .selectOption('3')

        const uttaksgradSelect = page.getByTestId('uttaksgrad')
        const options = await uttaksgradSelect
          .locator('option')
          .allTextContents()
        expect(options.length).toBe(7)
        expect(options[1]).toBe('20 %')
        expect(options[6]).toBe('100 %')
      })

      test('forventer jeg å få tilpasset informasjon i read more "om uttaksgrad og uføretrygd".', async ({
        page,
      }) => {
        await navigateToAvansertBeregning(page)
        await page
          .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
          .selectOption('69')
        await page
          .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
          .selectOption('3')

        await expect(page.getByTestId('om_uttaksgrad_UT_gradert')).toBeVisible()
      })

      test('forventer jeg vanlig informasjon om inntekt samtidig som uttak av pensjon.', async ({
        page,
      }) => {
        await navigateToAvansertBeregning(page)
        await page
          .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
          .selectOption('69')
        await page
          .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
          .selectOption('3')
        await page.getByTestId('uttaksgrad').selectOption('50 %')

        await expect(
          page.getByText(
            'Forventer du å ha inntekt samtidig som du tar ut 50 % pensjon?'
          )
        ).toBeVisible()
        await expect(
          page.getByText(
            'Du kan tjene så mye du vil samtidig som du tar ut pensjon.'
          )
        ).toBeVisible()
      })
    })
  })
})
