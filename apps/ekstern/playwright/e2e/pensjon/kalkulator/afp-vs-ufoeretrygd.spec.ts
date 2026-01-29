import type { Page } from '@playwright/test'
import { expect, test } from 'base'
import { authenticate } from 'utils/auth'
import { loependeVedtak, person, tidligsteUttaksalder } from 'utils/mocks'
import { fillOutStegvisning } from 'utils/navigation'

async function clickAvansert(page: Page) {
  await test.step('Click Avansert toggle', async () => {
    await page
      .getByTestId('toggle-avansert')
      .getByRole('radio', { name: 'Avansert' })
      .click()
  })
}

async function clickNesteButton(page: Page) {
  await test.step('Click Neste button', async () => {
    await page.getByTestId('stegvisning-neste-button').click()
  })
}

async function clickBeregnPensjon(page: Page) {
  await test.step('Click Beregn pensjon button', async () => {
    await page.getByRole('button', { name: 'Beregn pensjon' }).click()
  })
}

async function selectUttaksgrad(page: Page, value: string) {
  await test.step(`Select uttaksgrad: ${value}`, async () => {
    await page.getByTestId('uttaksgrad').selectOption(value)
  })
}

async function selectHeltUttakAar(page: Page, value: string) {
  await test.step(`Select helt uttak år: ${value}`, async () => {
    await page
      .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
      .selectOption(value)
  })
}

async function selectHeltUttakMaaneder(page: Page, value: string) {
  await test.step(`Select helt uttak måneder: ${value}`, async () => {
    await page
      .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
      .selectOption(value)
  })
}

async function checkInntektVsaGradertUttakNei(page: Page) {
  await test.step('Check inntekt vsa gradert uttak nei', async () => {
    await page.getByTestId('inntekt-vsa-gradert-uttak-radio-nei').check()
  })
}

async function checkInntektVsaHeltUttakNei(page: Page) {
  await test.step('Check inntekt vsa helt uttak nei', async () => {
    await page.getByTestId('inntekt-vsa-helt-uttak-radio-nei').check()
  })
}

test.describe('AFP vs uføretrygd', () => {
  test.describe('Som bruker som har logget inn i kalkulatoren, har gradert uføretrygd og er mindre enn 62 år,', () => {
    test.use({ autoAuth: false })

    test.describe('Når jeg svarer "Ja" på AFP offentlig,', () => {
      test.beforeEach(async ({ page }) => {
        await authenticate(page, [
          await person({ alder: { aar: 61, maaneder: 1, dager: 5 } }),
          await loependeVedtak({ ufoeretrygd: { grad: 40 } }),
          await tidligsteUttaksalder({ aar: 67, maaneder: 0 }),
        ])
        await fillOutStegvisning(page, {
          afp: 'ja_offentlig',
          navigateTo: 'ufoeretrygd-afp',
        })
      })

      // 1
      test('forventer jeg informasjon om at AFP og uføretrygd ikke kan kombineres.', async ({
        page,
      }) => {
        await expect(page.getByTestId('ufoere-info')).toBeVisible()
        await expect(page.getByTestId('ufoere-info')).toContainText(
          'AFP og uføretrygd kan ikke kombineres'
        )
      })

      // 2
      test('forventer jeg å må samtykke til å beregne AFP.', async ({
        page,
      }) => {
        await clickNesteButton(page)
        await expect(page).toHaveURL(/\/samtykke-offentlig-afp$/)
        await expect(
          page.getByTestId('samtykke-offentlig-afp-title')
        ).toBeVisible()
      })

      // 3
      test('forventer jeg å kunne gå videre til beregningssiden', async ({
        page,
      }) => {
        await clickNesteButton(page)
        await expect(page).toHaveURL(/\/samtykke-offentlig-afp$/)

        await fillOutStegvisning(page, {
          afp: 'ja_offentlig',
          samtykkeAfpOffentlig: true,
          samtykke: true,
          navigateTo: 'beregning',
        })
        await clickAvansert(page)
        await expect(page.getByTestId('beregnings-type-radio')).toBeVisible()
      })
    })

    test.describe('Når jeg svarer "Ja" på AFP privat,', () => {
      test.beforeEach(async ({ page }) => {
        await authenticate(page, [
          await person({ alder: { aar: 61, maaneder: 1, dager: 5 } }),
          await loependeVedtak({ ufoeretrygd: { grad: 40 } }),
          await tidligsteUttaksalder({ aar: 67, maaneder: 0 }),
        ])
        await fillOutStegvisning(page, {
          afp: 'ja_privat',
          navigateTo: 'ufoeretrygd-afp',
        })
      })

      // 4
      test('forventer jeg informasjon om at AFP og uføretrygd ikke kan kombineres.', async ({
        page,
      }) => {
        await expect(page.getByTestId('ufoere-info')).toBeVisible()
        await expect(page.getByTestId('ufoere-info')).toContainText(
          'AFP og uføretrygd kan ikke kombineres'
        )
      })

      // 5
      test('forventer jeg å kunne gå videre til beregningssiden.', async ({
        page,
      }) => {
        await clickNesteButton(page)
        await expect(page).toHaveURL(/\/samtykke$/)

        await fillOutStegvisning(page, {
          afp: 'ja_privat',
          samtykke: true,
          navigateTo: 'beregning',
        })
        await clickAvansert(page)
        await expect(page.getByTestId('beregnings-type-radio')).toBeVisible()
      })
    })

    test.describe('Når jeg er kommet til beregningssiden,', () => {
      test.describe('Som bruker som har samtykket til å beregne AFP offentlig', () => {
        test.beforeEach(async ({ page }) => {
          await authenticate(page, [
            await person({ alder: { aar: 61, maaneder: 1, dager: 5 } }),
            await loependeVedtak({ ufoeretrygd: { grad: 40 } }),
            await tidligsteUttaksalder({ aar: 67, maaneder: 0 }),
          ])
          await fillOutStegvisning(page, {
            afp: 'ja_offentlig',
            samtykkeAfpOffentlig: true,
            navigateTo: 'beregning',
          })
        })

        // 6
        test('forventer jeg informasjon om at jeg har x-prosent uføretrygd.', async ({
          page,
        }) => {
          await expect(page.getByText('Du har 40 % uføretrygd.')).toBeVisible()
        })

        // 7
        test('forventer jeg å kunne beregne 100% alderspensjon fra 67 år og senere.', async ({
          page,
        }) => {
          await expect(
            page.getByText(
              'Her kan du beregne 100 % alderspensjon og pensjonsavtaler fra 67 år.'
            )
          ).toBeVisible()
        })

        // 8
        test('forventer jeg å kunne velge "avansert".', async ({ page }) => {
          await expect(page.getByTestId('toggle-avansert')).toBeVisible()
        })
      })

      test.describe('Som bruker som ikke har samtykket til å beregne AFP offentlig,', () => {
        test.beforeEach(async ({ page }) => {
          await authenticate(page, [
            await person({ alder: { aar: 61, maaneder: 1, dager: 5 } }),
            await loependeVedtak({ ufoeretrygd: { grad: 40 } }),
            await tidligsteUttaksalder({ aar: 67, maaneder: 0 }),
          ])
          await fillOutStegvisning(page, {
            afp: 'ja_offentlig',
            samtykkeAfpOffentlig: false,
            navigateTo: 'beregning',
          })
          await clickAvansert(page)
        })

        // 9
        test('forventer jeg å ikke få mulighet til å beregne AFP.', async ({
          page,
        }) => {
          await expect(
            page.getByTestId('beregnings-type-radio')
          ).not.toBeVisible()
          await expect(page.getByTestId('uttaksgrad')).toBeVisible()
        })

        // 10
        test('forventer jeg informasjon i grunnlag om at "AFP ikke er beregnet grunnet ikke samtykket".', async ({
          page,
        }) => {
          await selectHeltUttakAar(page, '67')
          await selectHeltUttakMaaneder(page, '3')
          await selectUttaksgrad(page, '100 %')
          await checkInntektVsaHeltUttakNei(page)

          await clickBeregnPensjon(page)

          await expect(
            page.getByText('AFP: Offentlig (ikke beregnet)')
          ).toBeVisible()
          await expect(
            page.getByText(
              'Du har oppgitt AFP i offentlig sektor, men du har ikke samtykket til at Nav beregner den.'
            )
          ).toBeVisible()
          await expect(
            page.getByText('Derfor vises ikke AFP i beregningen.')
          ).toBeVisible()
        })
      })

      test.describe('Som bruker som har rett til AFP privat,', () => {
        test.beforeEach(async ({ page }) => {
          await authenticate(page, [
            await person({ alder: { aar: 61, maaneder: 1, dager: 5 } }),
            await loependeVedtak({ ufoeretrygd: { grad: 40 } }),
            await tidligsteUttaksalder({ aar: 67, maaneder: 0 }),
          ])
          await fillOutStegvisning(page, {
            afp: 'ja_privat',
            navigateTo: 'beregning',
          })
        })

        // 11
        test('forventer jeg informasjon om at jeg har x-prosent uføretrygd.', async ({
          page,
        }) => {
          await expect(page.getByText('Du har 40 % uføretrygd.')).toBeVisible()
        })

        // 12
        test('forventer jeg å kunne beregne 100% alderspensjon fra 67 år og senere.', async ({
          page,
        }) => {
          await expect(
            page.getByText(
              'Her kan du beregne 100 % alderspensjon og pensjonsavtaler fra 67 år.'
            )
          ).toBeVisible()
        })

        // 13
        test('forventer jeg å kunne velge "avansert".', async ({ page }) => {
          await expect(page.getByTestId('toggle-avansert')).toBeVisible()
        })
      })
    })

    test.describe('Som bruker som har rett til Livsvarig AFP eller AFP Privat, Når jeg ønsker en avansert beregning,', () => {
      test.beforeEach(async ({ page }) => {
        await authenticate(page, [
          await person({ alder: { aar: 61, maaneder: 1, dager: 5 } }),
          await loependeVedtak({ ufoeretrygd: { grad: 40 } }),
          await tidligsteUttaksalder({ aar: 67, maaneder: 0 }),
        ])
        await fillOutStegvisning(page, {
          afp: 'ja_privat',
          navigateTo: 'beregning',
        })
        await clickAvansert(page)
      })

      // 14
      test('forventer jeg informasjon om at jeg har uføretrygd, og må velge mellom uføretrygd og alderspensjon før 62 år.', async ({
        page,
      }) => {
        await expect(
          page.getByText(
            'Du har 40 % uføretrygd. Før du blir 62 år må du velge enten uføretrygd eller AFP.'
          )
        ).toBeVisible()
      })

      // 15
      test('forventer jeg å kunne velge å beregne Alderspensjon og uføretrygd, uten AFP.', async ({
        page,
      }) => {
        await page.getByTestId('uten_afp').check()
        await expect(page.getByTestId('uten_afp')).toBeChecked()
      })

      // 16
      test('forventer jeg å kunne velge å beregne Alderspensjon og AFP, uten uføretrygd fra 62 år.', async ({
        page,
      }) => {
        await page.getByTestId('med_afp').check()
        await expect(page.getByTestId('med_afp')).toBeChecked()
      })
    })

    test.describe('Som bruker som har valgt å beregne Alderspensjon og AFP, uten uføretrygd fra 62 år,', () => {
      test.beforeEach(async ({ page }) => {
        await authenticate(page, [
          await person({ alder: { aar: 61, maaneder: 1, dager: 5 } }),
          await loependeVedtak({ ufoeretrygd: { grad: 40 } }),
          await tidligsteUttaksalder({ aar: 67, maaneder: 0 }),
        ])
        await fillOutStegvisning(page, {
          afp: 'ja_privat',
          samtykke: true,
          navigateTo: 'beregning',
        })
        await clickAvansert(page)
        await page.getByTestId('med_afp').check()
      })

      test.describe('Når jeg velger å beregne Alderspensjon og AFP, uten uføretrygd fra 62 år,', () => {
        // 17
        test('forventer jeg at 62 år (nedre pensjonsalder) er fast laveste uttaksalder.', async ({
          page,
        }) => {
          await expect(
            page.locator('input[name="uttaksalder-helt-uttak-aar"]')
          ).toHaveValue('62')
        })

        // 18
        test('forventer jeg å kunne endre inntekt frem til pensjon.', async ({
          page,
        }) => {
          await expect(
            page.getByText('Pensjonsgivende årsinntekt frem til pensjon')
          ).toBeVisible()
          await expect(
            page.getByText(/521\s*338 kr per år før skatt/)
          ).toBeVisible()
          await page.getByRole('button', { name: 'Endre inntekt' }).click()
          await page.getByTestId('inntekt-textfield').fill('0')
          await page.getByRole('button', { name: 'Oppdater inntekt' }).click()
          await expect(page.getByText('0 kr per år før skatt')).toBeVisible()
        })

        // 19
        test('forventer jeg å kunne velge uttaksgrad fra 20 - 100 %.', async ({
          page,
        }) => {
          await expect(
            page.getByText('Hvor mye alderspensjon vil du ta ut?')
          ).toBeVisible()
          await expect(page.getByText('Velg uttaksgrad')).toBeVisible()
          const uttaksgradSelect = page.getByTestId('uttaksgrad')
          const options = await uttaksgradSelect.locator('option').all()
          expect(options.length).toBe(7)
          expect(await options[1].textContent()).toBe('20 %')
          expect(await options[2].textContent()).toBe('40 %')
          expect(await options[3].textContent()).toBe('50 %')
          expect(await options[4].textContent()).toBe('60 %')
          expect(await options[5].textContent()).toBe('80 %')
          expect(await options[6].textContent()).toBe('100 %')
        })

        // 20
        test('forventer jeg å kunne velge uttaksalder for 100% fra 62 år (nedre pensjonsalder) + 1 md.', async ({
          page,
        }) => {
          await selectUttaksgrad(page, '40 %')
          await checkInntektVsaGradertUttakNei(page)
          await selectHeltUttakAar(page, '62')
          await selectHeltUttakMaaneder(page, '1')
          await checkInntektVsaHeltUttakNei(page)
        })

        // 21
        test('forventer jeg å kunne legge til inntekt samtidig som pensjon.', async ({
          page,
        }) => {
          await selectUttaksgrad(page, '40 %')
          await page.getByTestId('inntekt-vsa-gradert-uttak-radio-ja').check()
          await page.getByTestId('inntekt-vsa-gradert-uttak').fill('100000')
          await selectHeltUttakAar(page, '62')
          await selectHeltUttakMaaneder(page, '1')
          await page.getByTestId('inntekt-vsa-helt-uttak-radio-ja').check()
          await page.getByTestId('inntekt-vsa-helt-uttak').fill('100000')
          await page
            .getByTestId('age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar')
            .selectOption('75')
          await page
            .getByTestId(
              'age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder'
            )
            .selectOption('0')
        })

        // 22
        test('forventer jeg å kunne beregne pensjon.', async ({ page }) => {
          await selectUttaksgrad(page, '40 %')
          await page.getByTestId('inntekt-vsa-gradert-uttak-radio-ja').check()
          await page.getByTestId('inntekt-vsa-gradert-uttak').fill('100000')
          await selectHeltUttakAar(page, '62')
          await selectHeltUttakMaaneder(page, '1')
          await page.getByTestId('inntekt-vsa-helt-uttak-radio-ja').check()
          await page.getByTestId('inntekt-vsa-helt-uttak').fill('100000')
          await page
            .getByTestId('age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar')
            .selectOption('75')
          await page
            .getByTestId(
              'age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder'
            )
            .selectOption('0')
          await clickBeregnPensjon(page)
          await expect(
            page.getByText('Alle beløp vises i dagens verdi før skatt.')
          ).toBeVisible()
        })
      })

      test.describe('Når jeg har for lav opptjening til valgt uttak, med bruker som har valgt å beregne gradert alderspensjon og AFP ved 62 år, og 100% fra 67 år,', () => {
        // 23
        test('forventer jeg informasjon om at jeg ikke har høy nok opptjening, og at jeg må endre valgene mine. Jeg forventer å få ett forslag om hvilken grad jeg kan ta ved 62 år.', async ({
          page,
        }) => {
          await selectUttaksgrad(page, '80 %')
          await checkInntektVsaGradertUttakNei(page)
          await selectHeltUttakAar(page, '67')
          await selectHeltUttakMaaneder(page, '0')
          await checkInntektVsaHeltUttakNei(page)

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
                      heltUttaksalder: { aar: 67, maaneder: 0 },
                      gradertUttaksalder: { aar: 62, maaneder: 0 },
                      uttaksgrad: 80,
                    },
                  },
                }),
              })
            }
          )

          await clickBeregnPensjon(page)

          await expect(
            page.getByText('Pensjonsgivende årsinntekt frem til pensjon')
          ).toBeVisible()
          await expect(
            page.getByText(
              'Opptjeningen din er ikke høy nok til ønsket uttak. Du må endre valgene dine.'
            )
          ).toBeVisible()

          await expect(
            page.getByText(
              'Et alternativ er at du ved 62 år kan ta ut 80 % alderspensjon. Prøv gjerne andre kombinasjoner.'
            )
          ).toBeVisible()
        })
      })

      test.describe('Når jeg har for lav opptjening til valgt uttak, med bruker som har valgt gradert uttak fra 62 år (nedre pensjonsalder) og 100 % tidligere enn 67 år (normert pensjonsalder),', () => {
        // 24
        test('forventer jeg informasjon om at jeg ikke har høy nok opptjening, og at jeg må endre valgene mine. Jeg forventer å få ett ett alternativt forslag om hvilken grad jeg kan ta ved 62 år, og hvilken alder jeg kan ta 100%.', async ({
          page,
        }) => {
          await selectUttaksgrad(page, '80 %')
          await checkInntektVsaGradertUttakNei(page)
          await selectHeltUttakAar(page, '65')
          await selectHeltUttakMaaneder(page, '0')
          await checkInntektVsaHeltUttakNei(page)

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
                      heltUttaksalder: { aar: 66, maaneder: 2 },
                      gradertUttaksalder: { aar: 62, maaneder: 0 },
                      uttaksgrad: 60,
                    },
                  },
                }),
              })
            }
          )

          await clickBeregnPensjon(page)

          await expect(
            page.getByText('Pensjonsgivende årsinntekt frem til pensjon')
          ).toBeVisible()

          await expect(
            page.getByText(
              'Opptjeningen din er ikke høy nok til ønsket uttak. Du må endre valgene dine.'
            )
          ).toBeVisible()

          await expect(
            page.getByText(
              'Et alternativ er at du ved 62 år kan ta ut 60 % alderspensjon hvis du tar ut 100 % alderspensjon ved 66 år og 2 måneder eller senere. Prøv gjerne andre kombinasjoner.'
            )
          ).toBeVisible()
        })
      })

      test.describe('Når jeg har for lav opptjening til å gjøre noe uttak fra 62 år,', () => {
        // 25
        test('forventer jeg informasjon om at opptjeningen ikke er høy nok til uttak av alderspensjon ved 62 år (nedre pensjonsalder), og at kalkulatoren ikke kan beregne uttak etter nedre alder.', async ({
          page,
        }) => {
          await selectUttaksgrad(page, '20 %')
          await checkInntektVsaGradertUttakNei(page)
          await selectHeltUttakAar(page, '67')
          await selectHeltUttakMaaneder(page, '0')
          await checkInntektVsaHeltUttakNei(page)

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
                    alternativ: null,
                  },
                }),
              })
            }
          )

          await clickBeregnPensjon(page)

          await expect(
            page.getByText('Pensjonsgivende årsinntekt frem til pensjon')
          ).toBeVisible()
          await expect(
            page.getByText(
              'Opptjeningen din er ikke høy nok til uttak av alderspensjon ved 62 år.'
            )
          ).toBeVisible()
          await expect(
            page.getByText('Kalkulatoren kan ikke beregne uttak etter 62 år.')
          ).toBeVisible()
          await expect(
            page.getByText(
              'Hvis du tar ut alderspensjon og AFP senere enn dette, vil du i perioden fra du er 62 år frem til uttak ikke få uføretrygd. Kontakt Nav for veiledning hvis du vurderer å si fra deg uføretrygden.'
            )
          ).toBeVisible()
          await expect(
            page.getByText(
              'Har du rett til livsvarig AFP i offentlig sektor kan du ta ut AFP før alderspensjon. Kontakt tjenestepensjonsordningen din for veiledning.'
            )
          ).toBeVisible()
        })
      })

      test.describe('Når jeg er kommet til beregningssiden - detaljert,', () => {
        test.beforeEach(async ({ page }) => {
          await selectUttaksgrad(page, '40 %')
          await page.getByTestId('inntekt-vsa-gradert-uttak-radio-ja').check()
          await page.getByTestId('inntekt-vsa-gradert-uttak').fill('100000')
          await selectHeltUttakAar(page, '62')
          await selectHeltUttakMaaneder(page, '1')
          await page.getByTestId('inntekt-vsa-helt-uttak-radio-ja').check()
          await page.getByTestId('inntekt-vsa-helt-uttak').fill('100000')
          await page
            .getByTestId('age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar')
            .selectOption('75')
          await page
            .getByTestId(
              'age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder'
            )
            .selectOption('0')
          await clickBeregnPensjon(page)
        })

        // 26
        test('forventer jeg en ingress med informasjon om at "hvis du velger AFP, får du ikke uføretrygd etter at du 62 år. Uføretrygd vises ikke i beregningen"', async ({
          page,
        }) => {
          await expect(
            page.getByText(
              'Hvis du velger AFP, får du ikke uføretrygd etter at du blir 62 år. Uføretrygd vises ikke i beregningen.'
            )
          ).toBeVisible()
        })

        // 27
        test('forventer jeg at graf og tabell viser alderspensjon og AFP.', async ({
          page,
        }) => {
          await expect(
            page.getByText('Pensjonsgivende inntekt').first()
          ).toBeVisible()
          await expect(
            page.getByText('AFP (avtalefestet pensjon)').first()
          ).toBeVisible()
          await expect(
            page.getByText('Pensjonsavtaler (arbeidsgivere m.m.)').first()
          ).toBeVisible()
          await expect(
            page.getByText('Alderspensjon (Nav)').first()
          ).toBeVisible()
        })

        // 28
        test('forventer jeg ett veilederpanel som anbefaler å ta kontakt for hjelp.', async ({
          page,
        }) => {
          await expect(
            page.getByTestId('vurderer_du_a_velge_afp')
          ).toBeVisible()
        })

        // 29
        test('forventer jeg informasjon i grunnlag om hvilken AFP som er beregnet.', async ({
          page,
        }) => {
          await expect(page.getByText('Om pensjonen din')).toBeVisible()
          await expect(page.getByText('AFP: Privat')).toBeVisible()
        })

        // 30
        test('forventer jeg å kunne endre avanserte valg.', async ({
          page,
        }) => {
          await page.getByTestId('endre-valg').click()
          await selectUttaksgrad(page, '50 %')
          await page.getByRole('button', { name: 'Oppdater pensjon' }).click()
          await expect(page.getByText('Estimert pensjon')).toBeVisible()
        })
      })
    })

    test.describe('Som bruker som har rett til AFP, men beregner uten AFP,', () => {
      test.beforeEach(async ({ page }) => {
        await authenticate(page, [
          await person({ alder: { aar: 61, maaneder: 1, dager: 5 } }),
          await loependeVedtak({ ufoeretrygd: { grad: 40 } }),
          await tidligsteUttaksalder({ aar: 67, maaneder: 0 }),
        ])
        await fillOutStegvisning(page, {
          afp: 'ja_privat',
          samtykke: true,
          navigateTo: 'beregning',
        })
        await clickAvansert(page)
        await page.getByTestId('uten_afp').check()
      })

      test.describe('Når jeg velger å beregne Alderspensjon og uføretrygd, uten AFP,', () => {
        // 31
        test('forventer jeg å kunne velge pensjonsalder mellom 62 år + 0 md og 75 år og 0 md, og jeg kan velge pensjonsalder mellom 67 år + 0 md og 75 år og 0 md for når jeg ønsker øke til hel alderspensjon.', async ({
          page,
        }) => {
          await expect(
            page.getByText('Når vil du ta ut alderspensjon?')
          ).toBeVisible()
          await expect(page.getByText('Velg år')).toBeVisible()
          const heltUttakAarSelect = page.getByTestId(
            'age-picker-uttaksalder-helt-uttak-aar'
          )
          const options = await heltUttakAarSelect.locator('option').all()
          expect(options.length).toBe(15)
          expect(await options[1].textContent()).toBe('62 år')
          expect(await options[14].textContent()).toBe('75 år')

          await selectHeltUttakAar(page, '67')
          const maanederSelect = page.getByTestId(
            'age-picker-uttaksalder-helt-uttak-maaneder'
          )
          const maanederOptions = await maanederSelect.locator('option').all()
          expect(maanederOptions.length).toBe(12)
          expect(await maanederOptions[0].textContent()).toContain('0 md.')
          expect(await maanederOptions[11].textContent()).toContain('11 md.')

          await selectHeltUttakMaaneder(page, '0')
          await selectUttaksgrad(page, '50 %')
          await checkInntektVsaGradertUttakNei(page)

          await expect(
            page.getByText('Når vil du ta ut 100 % alderspensjon?')
          ).toBeVisible()

          const heltUttakAarSelect2 = page.getByTestId(
            'age-picker-uttaksalder-helt-uttak-aar'
          )
          const options2 = await heltUttakAarSelect2.locator('option').all()
          expect(options2.length).toBe(10)
          expect(await options2[1].textContent()).toBe('67 år')
          expect(await options2[9].textContent()).toBe('75 år')
        })

        // 32
        test('forventer jeg å få tilpasset informasjon i read more «Om pensjonsalder og uføretrygd».', async ({
          page,
        }) => {
          await expect(
            page.getByText('Om pensjonsalder og uføretrygd')
          ).toBeVisible()
        })
      })

      test.describe('Når jeg har valgt pensjonsalder mellom 62 år og 0 md og 66 år og 11 md,', () => {
        // 33
        test('forventer jeg at mulige uttaksgrader begrenses til uttaksgradene som er mulig å kombinere med uføretrygd.', async ({
          page,
        }) => {
          await selectHeltUttakAar(page, '66')
          await selectHeltUttakMaaneder(page, '0')

          const uttaksgradSelect = page.getByTestId('uttaksgrad')
          const options = await uttaksgradSelect.locator('option').all()
          expect(options.length).toBe(5)
          expect(await options[1].textContent()).toBe('20 %')
          expect(await options[2].textContent()).toBe('40 %')
          expect(await options[3].textContent()).toBe('50 %')
          expect(await options[4].textContent()).toBe('60 %')
        })

        // 34
        test('forventer jeg å få tilpasset informasjon i read more "Om uttaksgrad og uføretrygd".', async ({
          page,
        }) => {
          await expect(
            page.getByText('Om uttaksgrad og uføretrygd')
          ).toBeVisible()
        })

        // 35
        test('forventer jeg tilpasset informasjon om inntekt samtidig som uttak av pensjon.', async ({
          page,
        }) => {
          await selectHeltUttakAar(page, '66')
          await selectHeltUttakMaaneder(page, '0')
          await selectUttaksgrad(page, '50 %')
          await expect(
            page.getByText('Om alderspensjon og inntektsgrensen for uføretrygd')
          ).toBeVisible()
        })
      })

      test.describe('Når jeg har valgt pensjonsalder 67 år og 0 md eller senere,', () => {
        test.beforeEach(async ({ page }) => {
          await selectHeltUttakAar(page, '67')
          await selectHeltUttakMaaneder(page, '0')
        })

        // 36
        test('forventer jeg å kunne velge alle uttaksgrader.', async ({
          page,
        }) => {
          const uttaksgradSelect = page.getByTestId('uttaksgrad')
          const options = await uttaksgradSelect.locator('option').all()
          expect(options.length).toBe(7)
          expect(await options[1].textContent()).toBe('20 %')
          expect(await options[2].textContent()).toBe('40 %')
          expect(await options[3].textContent()).toBe('50 %')
          expect(await options[4].textContent()).toBe('60 %')
          expect(await options[5].textContent()).toBe('80 %')
          expect(await options[6].textContent()).toBe('100 %')
        })

        // 37
        test('forventer jeg å få tilpasset informasjon i read more "Om uttaksgrad og uføretrygd"', async ({
          page,
        }) => {
          await expect(
            page.getByText('Om uttaksgrad og uføretrygd')
          ).toBeVisible()
        })

        // 38
        test('forventer jeg vanlig informasjon om inntekt samtidig som uttak av pensjon.', async ({
          page,
        }) => {
          await selectUttaksgrad(page, '50 %')
          await expect(
            page.getByText(
              'Du kan tjene så mye du vil samtidig som du tar ut pensjon.'
            )
          ).toBeVisible()
        })
      })

      test.describe('​Når jeg er kommet til beregningssiden - detaljert,', () => {
        test.beforeEach(async ({ page }) => {
          await selectHeltUttakAar(page, '67')
          await selectHeltUttakMaaneder(page, '0')
          await selectUttaksgrad(page, '40 %')
          await checkInntektVsaGradertUttakNei(page)
          await selectHeltUttakAar(page, '75')
          await selectHeltUttakMaaneder(page, '0')
          await checkInntektVsaHeltUttakNei(page)
          await clickBeregnPensjon(page)
        })

        // 39
        test('forventer jeg en ingress med informasjon om at jeg har uføretrygd, men at den ikke vises i bergningen.', async ({
          page,
        }) => {
          await expect(
            page.getByText(
              'Du har 40 % uføretrygd. Den kommer i tillegg til inntekt og pensjon frem til du blir 67 år. Uføretrygd vises ikke i beregningen.'
            )
          ).toBeVisible()
        })

        // 40
        test('forventer jeg at graf og tabell viser alderspensjon.', async ({
          page,
        }) => {
          await expect(
            page.getByText('Pensjonsgivende inntekt').first()
          ).toBeVisible()
          await expect(
            page.getByText('Alderspensjon (Nav)').first()
          ).toBeVisible()
        })

        // 41
        test('forventer jeg informasjon i grunnlag om at AFP ikke er beregnet.', async ({
          page,
        }) => {
          await expect(
            page.getByText('AFP: Privat (ikke beregnet)')
          ).toBeVisible()
        })

        // 42
        test('forventer jeg å kunne endre avanserte valg.', async ({
          page,
        }) => {
          await page.getByTestId('endre-valg').click()
          await selectUttaksgrad(page, '50 %')
          await page.getByRole('button', { name: 'Oppdater pensjon' }).click()
          await expect(page.getByText('Estimert pensjon')).toBeVisible()
        })
      })
    })
  })
})
