import type { Page } from '@playwright/test'

import { type RouteDefinition, expect, test } from '../../../base'
import { authenticate } from '../../../utils/auth'
import {
  alderspensjon,
  loependeVedtak,
  pensjonsavtaler,
  person,
} from '../../../utils/mocks'
import { fillOutStegvisning } from '../../../utils/navigation'
import { presetStates } from '../../../utils/presetStates'

const defaultPersonOptions = {
  navn: 'Aprikos',
  sivilstand: 'UGIFT',
  foedselsdato: '1964-04-30',
  pensjoneringAldre: {
    normertPensjoneringsalder: { aar: 67, maaneder: 0 },
    nedreAldersgrense: { aar: 62, maaneder: 0 },
    oevreAldersgrense: { aar: 75, maaneder: 0 },
  },
}

const MOCK_DATE = new Date(2029, 7, 1, 12, 0, 0)

test.use({ autoAuth: false })

const authenticateEndring = async (
  page: Page,
  overwrites: Array<RouteDefinition | Promise<RouteDefinition>> = []
) => {
  const resolvedOverwrites = await Promise.all(overwrites)
  await authenticate(page, [
    await loependeVedtak({
      endring: true,
      harLoependeVedtak: true,
      alderspensjon: {
        grad: 100,
        fom: '2022-05-01',
        sivilstand: 'UGIFT',
        uttaksgradFom: '2010-10-10',
      },
    }),
    await alderspensjon({ preset: 'endring' }),

    await pensjonsavtaler({ avtaler: [], utilgjengeligeSelskap: [] }),
    ...resolvedOverwrites,
    await person(defaultPersonOptions),
  ])
}

const goToBeregn = async (
  page: Page,
  options: {
    afp?: AfpRadio
    samtykke?: boolean
    samtykkeAfpOffentlig?: boolean
  } = {}
) => {
  if (options.samtykke ?? true) {
    await page.route(
      /\/pensjon\/kalkulator\/api\/v3\/pensjonsavtaler/,
      async (route) => {
        await route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify({
            avtaler: [],
            utilgjengeligeSelskap: [],
          }),
        })
      }
    )
  }

  await fillOutStegvisning(page, {
    afp: options.afp ?? 'nei',
    samtykke: options.samtykke ?? true,
    samtykkeAfpOffentlig: options.samtykkeAfpOffentlig,
    navigateTo: 'beregning',
  })
}

test.describe('Endring av alderspensjon', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install({ time: MOCK_DATE })
  })

  test.describe('Som bruker som har logget inn på kalkulatoren,', () => {
    test.describe('Som bruker som har gjeldende vedtak på alderspensjon,', () => {
      test.beforeEach(async ({ page }) => {
        await authenticateEndring(page)
      })

      test('forventer jeg informasjon på startsiden om at jeg har alderspensjon og hvilken uttaksgrad.', async ({
        page,
      }) => {
        await expect(page.getByTestId('stegvisning.start.title')).toHaveText(
          'Hei Aprikos!'
        )
        await expect(
          page.getByTestId('stegvisning-start-ingress-endring')
        ).toContainText(/Du har nå 100\s?% alderspensjon/)
      })

      test('forventer jeg å kunne gå videre ved å trykke kom i gang ', async ({
        page,
      }) => {
        await page.getByTestId('stegvisning-start-button').click()
      })

      test.describe('Som bruker som har fremtidig vedtak om endring av alderspensjon,', () => {
        test.beforeEach(async ({ page }) => {
          await authenticate(page, [
            await loependeVedtak({
              endring: true,
              alderspensjon: {
                grad: 80,
                uttaksgradFom: '2010-10-10',
                fom: '2010-10-10',
                sivilstand: 'UGIFT',
              },
              ufoeretrygd: { grad: 0 },
              fremtidigAlderspensjon: {
                grad: 90,
                fom: '2099-01-01',
              },
            }),
            await alderspensjon({ preset: 'endring' }),
            await person(defaultPersonOptions),
          ])
        })

        test('forventer jeg informasjon om at jeg har 80 % alderspensjon, at jeg har endret til 90 % alderspensjon fra 01.01.2099 og at ny beregning ikke kan gjøres før den datoen.', async ({
          page,
        }) => {
          await expect(
            page.getByTestId('stegvisning-start-ingress-endring')
          ).toContainText(/Du har nå.*80\s?% alderspensjon/)
          await expect(
            page.getByTestId('stegvisning-start-ingress-endring')
          ).toContainText(
            /Du har endret til 90\s?% alderspensjon fra 01.01.2099\. Du kan ikke gjøre en ny beregning her før denne datoen\./
          )
        })

        test('forventer jeg å kunne avbryte kalkulatoren.', async ({
          page,
        }) => {
          await expect(
            page.getByTestId('stegvisning-avbryt-button')
          ).toBeVisible()
          await expect(
            page.getByTestId('stegvisning-start-button')
          ).not.toBeVisible()
        })
      })

      test.describe('Når jeg har trykt kom i gang,', () => {
        test.beforeEach(async ({ page }) => {
          await page.getByTestId('stegvisning-start-button').click()
        })

        test('forventer jeg at neste steg er AFP.', async ({ page }) => {
          await page.waitForURL(/\/afp/)
          await expect(page.getByTestId('stegvisning.afp.title')).toBeVisible()
        })
      })

      test.describe('Som bruker som har svart "ja, offentlig" på spørsmål om AFP, og navigerer hele veien til resultatssiden', () => {
        test.describe('Gitt at bruker er født 1963 eller senere, og kall til /er-apoteker feiler', () => {
          test.beforeEach(async ({ page }) => {
            await authenticateEndring(page, [
              {
                url: /\/pensjon\/kalkulator\/api\/v1\/er-apoteker/,
                status: 500,
              },
            ])
            await page.getByTestId('stegvisning-start-button').click()
            await page.waitForURL(/\/afp/)
            await page
              .getByRole('radio', { name: 'Ja, i offentlig sektor' })
              .check()
            await page.getByRole('button', { name: 'Neste' }).click()
            await page.waitForURL(/\/samtykke-offentlig-afp/)
            await page.locator('input[type="radio"][value="ja"]').check()
            await page.getByRole('button', { name: 'Neste' }).click()
            await page.waitForURL(/\/beregning/)

            await page
              .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
              .selectOption('65 år')
            await page
              .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
              .selectOption('4 md. (sep.)')
            await page.getByTestId('uttaksgrad').selectOption('100 %')
            await page.getByTestId('inntekt-vsa-helt-uttak-radio-nei').check()
            await page
              .getByRole('button', { name: 'Beregn ny pensjon' })
              .click()
          })

          test('forventer jeg informasjon om at beregning med AFP kan bli feil hvis jeg er medlem av Pensjonsordningen for apotekvirksomhet og at jeg må prøve igjen senere', async ({
            page,
          }) => {
            await expect(page).toHaveURL(/\/beregning/)
            await expect(page.getByTestId('apotekere-warning')).toBeVisible()
          })
        })

        test.describe('Gitt at kall til /er-apoteker går bra', () => {
          test.beforeEach(async ({ page }) => {
            await page.getByTestId('stegvisning-start-button').click()
            await page.waitForURL(/\/afp/)
            await page
              .getByRole('radio', { name: 'Ja, i offentlig sektor' })
              .check()
            await page.getByRole('button', { name: 'Neste' }).click()
            await page.waitForURL(/\/samtykke-offentlig-afp/)
            await page.locator('input[type="radio"][value="ja"]').check()
            await page.getByRole('button', { name: 'Neste' }).click()
            await page.waitForURL(/\/beregning/)

            await page
              .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
              .selectOption('65 år')
            await page
              .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
              .selectOption('4 md. (sep.)')
            await page.getByTestId('uttaksgrad').selectOption('100 %')
            await page.getByTestId('inntekt-vsa-helt-uttak-radio-nei').check()
            await page
              .getByRole('button', { name: 'Beregn ny pensjon' })
              .click()
          })

          test('forventer jeg å se resultatet for alderspensjon i graf og tabell med Livsvarig AFP (offentlig).', async ({
            page,
          }) => {
            await expect(page.getByTestId('beregning-heading')).toBeVisible()
            await expect(
              page
                .getByTestId('highcharts-aria-wrapper')
                .getByText('Pensjonsgivende inntekt')
            ).toBeVisible()
            await expect(
              page
                .getByTestId('highcharts-aria-wrapper')
                .getByText('Pensjonsavtaler (arbeidsgivere m.m.)')
            ).not.toBeVisible()
            await expect(
              page
                .getByTestId('highcharts-aria-wrapper')
                .getByText('Alderspensjon (Nav)')
                .first()
            ).toBeVisible()
            await expect(
              page
                .getByTestId('highcharts-aria-wrapper')
                .getByText('Kroner')
                .first()
            ).toBeVisible()
            await expect(
              page
                .getByTestId('highcharts-aria-wrapper')
                .getByText('65')
                .first()
            ).toBeVisible()
            await expect(
              page
                .getByTestId('highcharts-aria-wrapper')
                .getByText('77+')
                .first()
            ).toBeVisible()
          })

          test('forventer jeg tilpasset informasjon i grunnlag: at opphold utenfor Norge er hentet fra vedtak og at Livsvarig AFP (offentlig) er med.', async ({
            page,
          }) => {
            await expect(page.getByTestId('beregning-heading')).toBeVisible()
            await page.getByRole('button', { name: 'Sivilstand' }).click()
            await page
              .getByRole('button', { name: 'Opphold utenfor Norge' })
              .click()
            await expect(
              page.getByTestId('grunnlag.opphold.ingress.endring')
            ).toBeVisible()
            await expect(page.getByTestId('grunnlag.afp.title')).toContainText(
              'Offentlig'
            )
          })
        })
      })

      test.describe('Som bruker som har svart "ja, privat" på spørsmål om AFP, og navigerer hele veien til resultatssiden', () => {
        test.beforeEach(async ({ page }) => {
          await page.getByTestId('stegvisning-start-button').click()
          await page.waitForURL(/\/afp/)
          await page.getByRole('radio', { name: 'Ja, i privat sektor' }).check()
          await page.getByRole('button', { name: 'Neste' }).click()

          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
            .selectOption('65 år')
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
            .selectOption('4 md. (sep.)')
          await page.getByTestId('uttaksgrad').selectOption('100 %')
          await page.getByTestId('inntekt-vsa-helt-uttak-radio-nei').check()
          await page.getByRole('button', { name: 'Beregn ny pensjon' }).click()
        })

        test('forventer jeg å se resultatet for alderspensjon i graf og tabell med AFP privat.', async ({
          page,
        }) => {
          await expect(page.getByTestId('beregning-heading')).toBeVisible()
          await expect(
            page
              .getByTestId('highcharts-aria-wrapper')
              .getByText('Pensjonsgivende inntekt')
          ).toBeVisible()
          await expect(
            page.getByTestId('highcharts-aria-wrapper').getByText(/AFP/)
          ).toBeVisible()
          await expect(
            page
              .getByTestId('highcharts-aria-wrapper')
              .getByText('Pensjonsavtaler (arbeidsgivere m.m.)')
          ).not.toBeVisible()
          await expect(
            page
              .getByTestId('highcharts-aria-wrapper')
              .getByText('Alderspensjon (Nav)')
              .first()
          ).toBeVisible()
          await expect(
            page
              .getByTestId('highcharts-aria-wrapper')
              .getByText('Kroner')
              .first()
          ).toBeVisible()
          await expect(
            page.getByTestId('highcharts-aria-wrapper').getByText('65').first()
          ).toBeVisible()
          await expect(
            page.getByTestId('highcharts-aria-wrapper').getByText('77+').first()
          ).toBeVisible()
        })

        test('forventer jeg tilpasset informasjon i grunnlag: at opphold utenfor Norge er hentet fra vedtak og at AFP Privat er med.', async ({
          page,
        }) => {
          await expect(page.getByTestId('beregning-heading')).toBeVisible()
          await page.getByRole('button', { name: 'Sivilstand' }).click()
          await page
            .getByRole('button', { name: 'Opphold utenfor Norge' })
            .click()
          await expect(
            page.getByTestId('grunnlag.opphold.ingress.endring')
          ).toContainText(
            'Beregningen bruker trygdetiden du har i Norge fra vedtaket ditt om alderspensjon.'
          )
          await expect(page.getByTestId('grunnlag.afp.title')).toContainText(
            'Privat'
          )
        })
      })

      test.describe('Som bruker som har svart "vet ikke" på spørsmål om AFP, og navigerer hele veien til resultatssiden', () => {
        test.beforeEach(async ({ page }) => {
          await page.getByTestId('stegvisning-start-button').click()
          await page.waitForURL(/\/afp/)
          await page.getByRole('radio', { name: 'Vet ikke' }).check()
          await page.getByRole('button', { name: 'Neste' }).click()

          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
            .selectOption('65 år')
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
            .selectOption('4 md. (sep.)')
          await page.getByTestId('uttaksgrad').selectOption('100 %')
          await page.getByTestId('inntekt-vsa-helt-uttak-radio-nei').check()
          await page.getByRole('button', { name: 'Beregn ny pensjon' }).click()
        })

        test('forventer jeg å se resultatet for alderspensjon i graf og tabell uten AFP.', async ({
          page,
        }) => {
          await expect(page.getByTestId('beregning-heading')).toBeVisible()
          await expect(
            page
              .getByTestId('highcharts-aria-wrapper')
              .getByText('Pensjonsgivende inntekt')
          ).toBeVisible()
          await expect(
            page.getByTestId('highcharts-aria-wrapper').getByText(/AFP/)
          ).not.toBeVisible()
          await expect(
            page
              .getByTestId('highcharts-aria-wrapper')
              .getByText('Pensjonsavtaler (arbeidsgivere m.m.)')
          ).not.toBeVisible()
          await expect(
            page
              .getByTestId('highcharts-aria-wrapper')
              .getByText('Alderspensjon (Nav)')
              .first()
          ).toBeVisible()
          await expect(
            page
              .getByTestId('highcharts-aria-wrapper')
              .getByText('Kroner')
              .first()
          ).toBeVisible()
          await expect(
            page.getByTestId('highcharts-aria-wrapper').getByText('65').first()
          ).toBeVisible()
          await expect(
            page.getByTestId('highcharts-aria-wrapper').getByText('77+').first()
          ).toBeVisible()
        })

        test('forventer jeg tilpasset informasjon i grunnlag: at opphold utenfor Norge er hentet fra vedtak og at AFP vises iht. mitt valg.', async ({
          page,
        }) => {
          await expect(page.getByTestId('beregning-heading')).toBeVisible()
          await page.getByRole('button', { name: 'Sivilstand' }).click()
          await page
            .getByRole('button', { name: 'Opphold utenfor Norge' })
            .click()
          await expect(
            page.getByTestId('grunnlag.opphold.ingress.endring')
          ).toContainText(
            'Beregningen bruker trygdetiden du har i Norge fra vedtaket ditt om alderspensjon.'
          )
          await expect(page.getByTestId('grunnlag.afp.title')).toContainText(
            'Vet ikke'
          )
        })
      })

      test.describe('Som bruker som har svart "nei" på spørsmål om AFP,', () => {
        test.beforeEach(async ({ page }) => {
          await goToBeregn(page, { afp: 'nei', samtykke: true })
        })

        test.describe('Når jeg er kommet til beregningssiden i redigeringsmodus,', () => {
          test('forventer jeg informasjon om når jeg startet eller sist endret alderspensjon, og hvilken grad jeg har.', async ({
            page,
          }) => {
            await expect(
              page.getByTestId('beregning.endring.rediger.title')
            ).toBeVisible()
            await expect(
              page.getByTestId('beregning.endring.rediger.vedtak_status')
            ).toContainText(
              /Fra 01.05.2022 har du mottatt 100\s?% alderspensjon./
            )
          })

          test('forventer jeg å kunne endre inntekt frem til endring.', async ({
            page,
          }) => {
            await expect(
              page.getByTestId(
                'beregning.avansert.rediger.inntekt_frem_til_endring.label'
              )
            ).toBeVisible()
            await page
              .getByTestId('beregning.avansert.rediger.inntekt.button')
              .click()
            await page.getByTestId('inntekt-textfield').fill('550000')
            await page.getByTestId('inntekt.endre_inntekt_modal.button').click()
            await expect(
              page.getByTestId('formatert-inntekt-frem-til-uttak')
            ).toContainText('550 000')
          })

          test('forventer jeg å kunne velge pensjonsalder for endring mellom dagens alder + 1 md og 75 år + 0 md.', async ({
            page,
          }) => {
            await expect(
              page.getByTestId('velguttaksalder.endring.title')
            ).toBeVisible()

            const yearSelect = page.getByTestId(
              'age-picker-uttaksalder-helt-uttak-aar'
            )
            await expect(yearSelect.locator('option')).toHaveCount(12)
            await expect(yearSelect.locator('option').nth(1)).toHaveText(
              '65 år'
            )
            await expect(yearSelect.locator('option').nth(11)).toHaveText(
              '75 år'
            )

            await yearSelect.selectOption('65 år')

            const monthSelect = page.getByTestId(
              'age-picker-uttaksalder-helt-uttak-maaneder'
            )
            await expect(monthSelect.locator('option')).toHaveCount(8)
            await expect(monthSelect.locator('option').first()).toHaveText(
              '4 md. (sep.)'
            )
            await expect(monthSelect.locator('option').last()).toHaveText(
              '11 md. (apr.)'
            )

            await yearSelect.selectOption('75 år')
            await expect(monthSelect.locator('option')).toHaveCount(1)
            await expect(monthSelect.locator('option').first()).toHaveText(
              '0 md. (mai)'
            )
          })

          test('forventer jeg å kunne velge mellom 0, 20, 40, 50, 60, 80 og 100% uttaksgrad.', async ({
            page,
          }) => {
            await expect(
              page.getByTestId('beregning.avansert.rediger.uttaksgrad.label')
            ).toBeVisible()
            await expect(page.getByText('Velg ny uttaksgrad')).toBeVisible()

            const uttaksgradSelect = page.getByTestId('uttaksgrad')
            await expect(uttaksgradSelect.locator('option')).toHaveCount(8)
            await expect(uttaksgradSelect.locator('option').nth(1)).toHaveText(
              '0 %'
            )
            await expect(uttaksgradSelect.locator('option').nth(2)).toHaveText(
              '20 %'
            )
            await expect(uttaksgradSelect.locator('option').nth(3)).toHaveText(
              '40 %'
            )
            await expect(uttaksgradSelect.locator('option').nth(4)).toHaveText(
              '50 %'
            )
            await expect(uttaksgradSelect.locator('option').nth(5)).toHaveText(
              '60 %'
            )
            await expect(uttaksgradSelect.locator('option').nth(6)).toHaveText(
              '80 %'
            )
            await expect(uttaksgradSelect.locator('option').nth(7)).toHaveText(
              '100 %'
            )
          })

          test('forventer jeg å kunne oppgi inntekt ved siden av 100% alderspensjon og beregne ny pensjon.', async ({
            page,
          }) => {
            await page
              .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
              .selectOption('65 år')
            await page
              .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
              .selectOption('4 md. (sep.)')
            await page.getByTestId('uttaksgrad').selectOption('100 %')
            await page.getByTestId('inntekt-vsa-helt-uttak-radio-ja').check()
            await page.getByTestId('inntekt-vsa-helt-uttak').fill('100000')

            await expect(
              page.getByTestId('age-picker-inntekt-vsa-helt-uttak-slutt-alder')
            ).toBeVisible()

            const sluttAlderAarSelect = page.getByTestId(
              'age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar'
            )
            await expect(sluttAlderAarSelect.locator('option')).toHaveCount(12)
            await expect(
              sluttAlderAarSelect.locator('option').nth(1)
            ).toHaveText('65 år')
            await expect(
              sluttAlderAarSelect.locator('option').nth(11)
            ).toHaveText('75 år')

            await sluttAlderAarSelect.selectOption('70 år')
            await sluttAlderAarSelect.selectOption('75 år')
            await page
              .getByTestId(
                'age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder'
              )
              .selectOption('3')

            await page
              .getByRole('button', { name: 'Beregn ny pensjon' })
              .click()
            await expect(page.getByTestId('beregning-heading')).toBeVisible()
          })
        })

        test.describe('Når jeg velger å endre til en annen uttaksgrad enn 100%,', () => {
          test.beforeEach(async ({ page }) => {
            await page
              .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
              .selectOption('65 år')
            await page
              .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
              .selectOption('4 md. (sep.)')
            await page.getByTestId('uttaksgrad').selectOption('40 %')
          })

          test('forventer jeg å kunne oppgi inntekt ved siden av gradert alderspensjon og 100 % alderspensjon og beregne pensjon.', async ({
            page,
          }) => {
            await page.getByTestId('inntekt-vsa-gradert-uttak-radio-ja').check()
            await page.getByTestId('inntekt-vsa-gradert-uttak').fill('300000')
            await page
              .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
              .selectOption('67 år')
            await page
              .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
              .selectOption('0 md. (mai)')
            await page.getByTestId('inntekt-vsa-helt-uttak-radio-ja').check()
            await page.getByTestId('inntekt-vsa-helt-uttak').fill('100000')

            await page
              .getByTestId('age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar')
              .selectOption('75 år')
            await page
              .getByTestId(
                'age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder'
              )
              .selectOption('0')

            await page
              .getByRole('button', { name: 'Beregn ny pensjon' })
              .click()
            await expect(page.getByTestId('beregning-heading')).toBeVisible()
          })
        })

        test.describe('Som bruker som har valgt endringer,', () => {
          test.beforeEach(async ({ page }) => {
            await page
              .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
              .selectOption('65 år')
            await page
              .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
              .selectOption('4 md. (sep.)')
            await page.getByTestId('uttaksgrad').selectOption('40 %')
            await page.getByTestId('inntekt-vsa-gradert-uttak-radio-ja').check()
            await page.getByTestId('inntekt-vsa-gradert-uttak').fill('300000')
            await page
              .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
              .selectOption('67 år')
            await page
              .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
              .selectOption('0 md. (mai)')
            await page.getByTestId('inntekt-vsa-helt-uttak-radio-ja').check()
            await page.getByTestId('inntekt-vsa-helt-uttak').fill('100000')

            await page
              .getByTestId('age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar')
              .selectOption('75 år')
            await page
              .getByTestId(
                'age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder'
              )
              .selectOption('0')

            await page
              .getByRole('button', { name: 'Beregn ny pensjon' })
              .click()
          })

          test('forventer jeg informasjon om hvilken uttaksgrad på alderspensjon jeg har i dag.', async ({
            page,
          }) => {
            await expect(
              page.locator(
                '[data-intl="beregning.endring.rediger.vedtak_grad_status"]'
              )
            ).toContainText('Du har i dag 100 % alderspensjon.')
          })

          test('forventer jeg informasjon om hva siste månedlige utbetaling var og hva månedlig alderspensjon vil bli de månedene jeg har valgt å endre fra.', async ({
            page,
          }) => {
            await expect(
              page.getByText(/Alderspensjon når du er/)
            ).toBeVisible()
            await expect(
              page.getByText('65 år og 4 md. (40 %): 12 342 kr/md.')
            ).toBeVisible()
            await expect(
              page.getByText('67 år (100 %): 28 513 kr/md.')
            ).toBeVisible()
          })

          test('forventer jeg en lenke for å endre mine valg.', async ({
            page,
          }) => {
            await expect(page.getByTestId('endre-valg')).toBeVisible()
          })

          test('forventer jeg å se resultatet for alderspensjon i graf og tabell uten AFP.', async ({
            page,
          }) => {
            await expect(page.getByTestId('beregning-heading')).toBeVisible()
            await expect(
              page
                .getByTestId('highcharts-aria-wrapper')
                .getByText('Pensjonsgivende inntekt')
            ).toBeVisible()

            await expect(
              page
                .getByTestId('highcharts-aria-wrapper')
                .getByText(/AFP/)
                .first()
            ).not.toBeVisible()
            await expect(
              page
                .getByTestId('highcharts-aria-wrapper')
                .getByText('Alderspensjon (Nav)')
                .first()
            ).toBeVisible()
            await expect(
              page
                .getByTestId('highcharts-aria-wrapper')
                .getByText(/Tusen kroner|Kroner/)
                .first()
            ).toBeVisible()
            await expect(
              page
                .getByTestId('highcharts-aria-wrapper')
                .getByText('65')
                .first()
            ).toBeVisible()
            await expect(
              page
                .getByTestId('highcharts-aria-wrapper')
                .getByText('77+')
                .first()
            ).toBeVisible()
          })

          test('forventer jeg informasjon om at pensjonsavtaler ikke er med i beregningen.', async ({
            page,
          }) => {
            await expect(
              page.getByTestId('pensjonsavtaler-alert')
            ).toBeVisible()
          })

          test('forventer jeg tilpasset informasjon i grunnlag: at opphold utenfor Norge er hentet fra vedtak og at AFP vises ut fra hva jeg har svart. ', async ({
            page,
          }) => {
            await expect(page.getByTestId('beregning-heading')).toBeVisible()
            await expect(page.getByTestId('grunnlag.title')).toBeVisible()
            await page.getByRole('button', { name: 'Sivilstand' }).click()
            await page
              .getByRole('button', { name: 'Opphold utenfor Norge' })
              .click()
            await expect(
              page.getByTestId('grunnlag.opphold.value.endring').first()
            ).toBeVisible()
            await expect(
              page.getByTestId('grunnlag.opphold.ingress.endring')
            ).toBeVisible()
            await expect(page.getByTestId('grunnlag.afp.title')).toContainText(
              'Nei'
            )
          })

          test('forventer jeg lenke til søknad om endring av alderspensjon.', async ({
            page,
          }) => {
            await expect(
              page.getByRole('link', { name: 'Klar til å søke om endring?' })
            ).toBeVisible()
            await expect(
              page.locator('a[href*="/pensjon/opptjening/nb/"]').first()
            ).toBeAttached()
          })
        })
      })
    })

    test.describe('Som bruker som har gjeldende vedtak på alderspensjon og AFP privat', () => {
      test.beforeEach(async ({ page }) => {
        await authenticate(page, [
          await loependeVedtak({
            endring: true,
            alderspensjon: {
              grad: 80,
              uttaksgradFom: '2020-01-01',
              fom: '2010-10-10',
              sivilstand: 'UGIFT',
            },
            afpPrivat: { fom: '2010-10-10' },
            ufoeretrygd: { grad: 0 },
          }),
          await alderspensjon({ preset: 'endring' }),
          await person(defaultPersonOptions),
        ])
      })

      test('forventer jeg informasjon på startsiden om at jeg har alderspensjon og AFP privat og hvilken uttaksgrad.', async ({
        page,
      }) => {
        await expect(page.getByTestId('stegvisning.start.title')).toHaveText(
          'Hei Aprikos!'
        )
        await expect(
          page.getByTestId('stegvisning-start-ingress-endring')
        ).toContainText('Du har nå 80 % alderspensjon og AFP i privat sektor')
      })

      test('forventer jeg å kunne gå videre ved å trykke kom i gang ', async ({
        page,
      }) => {
        await page.getByTestId('stegvisning-start-button').click()
      })

      test.describe('Som bruker som har fremtidig vedtak om endring av alderspensjon,', () => {
        test.beforeEach(async ({ page }) => {
          await authenticate(page, [
            await loependeVedtak({
              endring: true,
              alderspensjon: {
                grad: 80,
                uttaksgradFom: '2010-10-10',
                fom: '2010-10-10',
                sivilstand: 'UGIFT',
              },
              afpPrivat: { fom: '2010-10-10' },
              ufoeretrygd: { grad: 0 },
              fremtidigAlderspensjon: {
                grad: 90,
                fom: '2099-01-01',
              },
            }),
            await alderspensjon({ preset: 'endring' }),
            await person(defaultPersonOptions),
          ])
        })

        test('forventer jeg informasjon om at jeg har 80 % alderspensjon og AFP, at jeg har endret til 90 % alderspensjon fra 01.01.2099 og at ny beregning ikke kan gjøres før den datoen.', async ({
          page,
        }) => {
          await expect(
            page.getByTestId('stegvisning-start-ingress-endring')
          ).toContainText(
            'Du har nå 80 % alderspensjon og AFP i privat sektor. Du har endret til 90 % alderspensjon fra 01.01.2099. Du kan ikke gjøre en ny beregning her før denne datoen.'
          )
        })
      })

      test.describe('Når jeg har trykt kom i gang og er kommet til beregningssiden i redigeringsmodus,', () => {
        test.beforeEach(async ({ page }) => {
          await page.getByTestId('stegvisning-start-button').click()
        })

        test('forventer jeg informasjon om når jeg startet eller sist endret alderspensjon, og hvilken grad jeg har.', async ({
          page,
        }) => {
          await expect(
            page.getByTestId('beregning.endring.rediger.title')
          ).toBeVisible()
          await expect(
            page.getByTestId('beregning.endring.rediger.vedtak_status')
          ).toContainText(/Fra 10.10.2010 har du mottatt 80 .?% alderspensjon./)
        })

        test('forventer jeg å kunne endre inntekt frem til endring.', async ({
          page,
        }) => {
          await expect(
            page.getByTestId(
              'beregning.avansert.rediger.inntekt_frem_til_endring.label'
            )
          ).toBeVisible()
          await page
            .getByTestId('beregning.avansert.rediger.inntekt.button')
            .click()
          await page.getByTestId('inntekt-textfield').fill('550000')
          await page.getByTestId('inntekt.endre_inntekt_modal.button').click()
          await expect(
            page.getByTestId('formatert-inntekt-frem-til-uttak')
          ).toContainText('550 000')
        })

        test('forventer jeg å kunne velge pensjonsalder for endring mellom dagens alder + 1 md og 75 år + 0 md.', async ({
          page,
        }) => {
          await expect(
            page.getByTestId('velguttaksalder.endring.title')
          ).toBeVisible()

          const yearSelect = page.getByTestId(
            'age-picker-uttaksalder-helt-uttak-aar'
          )
          await expect(yearSelect.locator('option')).toHaveCount(12)
          await expect(yearSelect.locator('option').nth(1)).toHaveText('65 år')
          await expect(yearSelect.locator('option').nth(11)).toHaveText('75 år')

          await yearSelect.selectOption('65 år')

          const monthSelect = page.getByTestId(
            'age-picker-uttaksalder-helt-uttak-maaneder'
          )
          await expect(monthSelect.locator('option')).toHaveCount(8)
          await expect(monthSelect.locator('option').first()).toHaveText(
            '4 md. (sep.)'
          )
          await expect(monthSelect.locator('option').last()).toHaveText(
            '11 md. (apr.)'
          )

          await yearSelect.selectOption('75 år')
          await expect(monthSelect.locator('option')).toHaveCount(1)
          await expect(monthSelect.locator('option').first()).toHaveText(
            '0 md. (mai)'
          )
        })

        test('forventer jeg å kunne velge mellom 0, 20, 40, 50, 60, 80 og 100% uttaksgrad.', async ({
          page,
        }) => {
          await expect(
            page.getByTestId('beregning.avansert.rediger.uttaksgrad.label')
          ).toBeVisible()
          await expect(page.getByText('Velg ny uttaksgrad')).toBeVisible()

          const uttaksgradSelect = page.getByTestId('uttaksgrad')
          await expect(uttaksgradSelect.locator('option')).toHaveCount(8)
          await expect(uttaksgradSelect.locator('option').nth(1)).toHaveText(
            '0 %'
          )
          await expect(uttaksgradSelect.locator('option').nth(2)).toHaveText(
            '20 %'
          )
          await expect(uttaksgradSelect.locator('option').nth(3)).toHaveText(
            '40 %'
          )
          await expect(uttaksgradSelect.locator('option').nth(4)).toHaveText(
            '50 %'
          )
          await expect(uttaksgradSelect.locator('option').nth(5)).toHaveText(
            '60 %'
          )
          await expect(uttaksgradSelect.locator('option').nth(6)).toHaveText(
            '80 %'
          )
          await expect(uttaksgradSelect.locator('option').nth(7)).toHaveText(
            '100 %'
          )
        })

        test('forventer jeg å kunne oppgi inntekt ved siden av 100% alderspensjon og beregne ny pensjon.', async ({
          page,
        }) => {
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
            .selectOption('65 år')
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
            .selectOption('4 md. (sep.)')
          await page.getByTestId('uttaksgrad').selectOption('100 %')
          await page.getByTestId('inntekt-vsa-helt-uttak-radio-ja').check()
          await page.getByTestId('inntekt-vsa-helt-uttak').fill('100000')

          await expect(
            page.getByTestId('age-picker-inntekt-vsa-helt-uttak-slutt-alder')
          ).toBeVisible()

          const sluttAlderAarSelect = page.getByTestId(
            'age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar'
          )
          await expect(sluttAlderAarSelect.locator('option')).toHaveCount(12)
          await expect(sluttAlderAarSelect.locator('option').nth(1)).toHaveText(
            '65 år'
          )
          await expect(
            sluttAlderAarSelect.locator('option').nth(11)
          ).toHaveText('75 år')

          await sluttAlderAarSelect.selectOption('70 år')
          await sluttAlderAarSelect.selectOption('75 år')
          await page
            .getByTestId(
              'age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder'
            )
            .selectOption('3')

          await page.getByRole('button', { name: 'Beregn ny pensjon' }).click()
          await expect(page.getByTestId('beregning-heading')).toBeVisible()
        })
      })

      test.describe('Når jeg velger å endre til en annen uttaksgrad enn 100%,', () => {
        test.beforeEach(async ({ page }) => {
          await page.getByTestId('stegvisning-start-button').click()
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
            .selectOption('65 år')
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
            .selectOption('4 md. (sep.)')
          await page.getByTestId('uttaksgrad').selectOption('40 %')
        })

        test('forventer jeg å kunne oppgi inntekt ved siden av gradert alderspensjon og 100 % alderspensjon og beregne pensjon.', async ({
          page,
        }) => {
          await page.getByTestId('inntekt-vsa-gradert-uttak-radio-ja').check()
          await page.getByTestId('inntekt-vsa-gradert-uttak').fill('300000')
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
            .selectOption('67 år')
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
            .selectOption('0 md. (mai)')
          await page.getByTestId('inntekt-vsa-helt-uttak-radio-ja').check()
          await page.getByTestId('inntekt-vsa-helt-uttak').fill('100000')

          await page
            .getByTestId('age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar')
            .selectOption('75 år')
          await page
            .getByTestId(
              'age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder'
            )
            .selectOption('0')

          await page.getByRole('button', { name: 'Beregn ny pensjon' }).click()
          await expect(page.getByTestId('beregning-heading')).toBeVisible()
        })
      })

      test.describe('Som bruker som har valgt endringer,', () => {
        test.beforeEach(async ({ page }) => {
          await page.getByTestId('stegvisning-start-button').click()
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
            .selectOption('65 år')
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
            .selectOption('4 md. (sep.)')
          await page.getByTestId('uttaksgrad').selectOption('40 %')
          await page.getByTestId('inntekt-vsa-gradert-uttak-radio-ja').check()
          await page.getByTestId('inntekt-vsa-gradert-uttak').fill('300000')
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
            .selectOption('67 år')
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
            .selectOption('0 md. (mai)')
          await page.getByTestId('inntekt-vsa-helt-uttak-radio-ja').check()
          await page.getByTestId('inntekt-vsa-helt-uttak').fill('100000')

          await page
            .getByTestId('age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar')
            .selectOption('75 år')
          await page
            .getByTestId(
              'age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder'
            )
            .selectOption('0')

          await page.getByRole('button', { name: 'Beregn ny pensjon' }).click()
          await expect(page.getByTestId('beregning-heading')).toBeVisible()
        })

        test('forventer jeg informasjon om hvilken uttaksgrad på alderspensjon jeg har i dag.', async ({
          page,
        }) => {
          await expect(
            page.locator(
              '[data-intl="beregning.endring.rediger.vedtak_grad_status"]'
            )
          ).toContainText('Du har i dag 80 % alderspensjon.')
        })

        test('forventer jeg informasjon om hva siste månedlige utbetaling var og hva månedlig alderspensjon vil bli de månedene jeg har valgt å endre fra.', async ({
          page,
        }) => {
          await expect(page.getByText('Alderspensjon når du er')).toBeVisible()
          await expect(
            page.getByText('65 år og 4 md. (40 %): 12 342 kr/md.')
          ).toBeVisible()
          await expect(
            page.getByText('67 år (100 %): 28 513 kr/md.')
          ).toBeVisible()
        })

        test('forventer jeg en lenke for å endre mine valg.', async ({
          page,
        }) => {
          await expect(page.getByTestId('endre-valg')).toBeVisible()
        })

        test('forventer jeg å se resultatet for alderspensjon i graf og tabell.', async ({
          page,
        }) => {
          await expect(page.getByTestId('beregning-heading')).toBeVisible()
          await expect(
            page
              .getByTestId('highcharts-aria-wrapper')
              .getByText('Pensjonsgivende inntekt')
              .first()
          ).toBeVisible()
          await expect(
            page.getByTestId('highcharts-aria-wrapper').getByText(/AFP/).first()
          ).toBeVisible()
          await expect(
            page
              .getByTestId('highcharts-aria-wrapper')
              .getByText('Pensjonsavtaler (arbeidsgivere m.m.)')
          ).not.toBeVisible()
          await expect(
            page
              .getByTestId('highcharts-aria-wrapper')
              .getByText('Alderspensjon (Nav)')
              .first()
          ).toBeVisible()
          await expect(
            page
              .getByTestId('highcharts-aria-wrapper')
              .getByText(/Tusen kroner|Kroner/)
              .first()
          ).toBeVisible()
          await expect(
            page.getByTestId('highcharts-aria-wrapper').getByText('65').first()
          ).toBeVisible()
          await expect(
            page.getByTestId('highcharts-aria-wrapper').getByText('77+').first()
          ).toBeVisible()
        })

        test('forventer jeg informasjon om at pensjonsavtaler ikke er med i beregningen.', async ({
          page,
        }) => {
          await expect(page.getByTestId('pensjonsavtaler-alert')).toContainText(
            'Pensjonsavtaler fra arbeidsgivere og egen sparing er ikke med i beregningen.'
          )
        })

        test('forventer jeg tilpasset informasjon i grunnlag: at opphold utenfor Norge er hentet fra vedtak og at AFP Privat er uendret ', async ({
          page,
        }) => {
          await expect(page.getByTestId('beregning-heading')).toBeVisible()
          await expect(page.getByTestId('grunnlag.title')).toBeVisible()
          await page.getByRole('button', { name: /Sivilstand/ }).click()
          await page
            .getByRole('button', { name: /Opphold utenfor Norge/ })
            .click()
          await expect(
            page.getByTestId('grunnlag.opphold.value.endring')
          ).toBeVisible()
          await expect(
            page.getByTestId('grunnlag.opphold.ingress.endring')
          ).toBeVisible()
          await expect(page.getByTestId('grunnlag.afp.title')).toContainText(
            'Privat (uendret)'
          )
        })

        test('forventer jeg lenke til søknad om endring av alderspensjon.', async ({
          page,
        }) => {
          await expect(
            page.getByRole('link', { name: 'Klar til å søke om endring?' })
          ).toBeVisible()
          await expect(
            page.locator('a[href*="/pensjon/opptjening/nb/"]').first()
          ).toBeAttached()
        })
      })
    })

    test.describe('Som bruker som har gjeldende vedtak på gammel AFP (offentlig)', () => {
      test.beforeEach(async ({ page }) => {
        await authenticate(page, [
          ...(await presetStates.medPre2025OffentligAfp('2025-04-30')),
          await person({ ...defaultPersonOptions, foedselsdato: '1960-01-01' }),
        ])
      })

      test('forventer jeg informasjon på startsiden om at jeg har gammel AFP og hvilken uttaksgrad.', async ({
        page,
      }) => {
        await expect(
          page.getByTestId('stegvisning-start-ingress-pre2025-offentlig-afp')
        ).toBeVisible()
      })

      test('forventer jeg å kunne gå videre ved å trykke kom i gang ', async ({
        page,
      }) => {
        await fillOutStegvisning(page, { navigateTo: 'beregning-detaljert' })
      })

      test.describe('Som bruker som har valgt uttaksalder som er 67 år eller senere,', () => {
        test('forventer jeg å kunne velge pensjonsalder for endring mellom dagens alder + 1 md og 75 år + 0 md', async ({
          page,
        }) => {
          await fillOutStegvisning(page, { navigateTo: 'beregning-detaljert' })

          await expect(
            page.getByTestId('age-picker-uttaksalder-helt-uttak-aar')
          ).toBeVisible()
          await expect(
            page.getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
          ).toBeVisible()

          const yearSelect = page.getByTestId(
            'age-picker-uttaksalder-helt-uttak-aar'
          )
          const yearOptions = yearSelect.locator('option')
          const firstSelectableYear = yearOptions.nth(1)
          const lastSelectableYear = yearOptions.last()

          await expect(lastSelectableYear).toHaveText('75 år')
          const firstYearValue =
            (await firstSelectableYear.getAttribute('value')) || ''
          await yearSelect.selectOption(firstYearValue)

          const monthSelect = page.getByTestId(
            'age-picker-uttaksalder-helt-uttak-maaneder'
          )
          await expect(monthSelect).toBeEnabled()
          await expect(monthSelect.locator('option').first()).toBeAttached()
        })

        test('forventer jeg å kunne oppgi inntekt ved siden av 100% alderspensjon og beregne ny pensjon', async ({
          page,
        }) => {
          await fillOutStegvisning(page, { navigateTo: 'beregning-detaljert' })

          const yearSelect = page.getByTestId(
            'age-picker-uttaksalder-helt-uttak-aar'
          )
          const firstYearValue =
            (await yearSelect.locator('option').nth(1).getAttribute('value')) ||
            ''
          await yearSelect.selectOption(firstYearValue)

          const monthSelect = page.getByTestId(
            'age-picker-uttaksalder-helt-uttak-maaneder'
          )
          const monthOptions = monthSelect.locator('option')
          const monthCount = await monthOptions.count()
          const firstSelectableMonth =
            monthCount > 1 ? monthOptions.nth(1) : monthOptions.first()
          const firstMonthValue =
            (await firstSelectableMonth.getAttribute('value')) || ''
          await monthSelect.selectOption(firstMonthValue)

          await page.getByTestId('uttaksgrad').selectOption('100 %')
          await page.getByTestId('inntekt-vsa-helt-uttak-radio-ja').check()
          await page.getByTestId('inntekt-vsa-helt-uttak').fill('100000')

          await expect(
            page.getByTestId(
              'age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar'
            )
          ).toBeVisible()
          await expect(
            page.getByTestId(
              'age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder'
            )
          ).toBeVisible()

          await page
            .getByTestId('age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar')
            .selectOption('70 år')
          await page
            .getByTestId('age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar')
            .selectOption('75 år')
          await page
            .getByTestId(
              'age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder'
            )
            .selectOption('3')

          await page.getByTestId('beregn-pensjon').click()

          await expect(page).toHaveURL(/\/beregning/)
        })
      })
    })

    test.describe('Som bruker som har om 0 % alderspensjon ', () => {
      test.beforeEach(async ({ page }) => {
        await authenticate(page, [
          await loependeVedtak({
            pre2025OffentligAfp: { fom: '2025-04-30' },
            alderspensjon: {
              grad: 0,
              uttaksgradFom: '2029-04-30',
              fom: '2029-04-30',
              sivilstand: 'UGIFT',
            },
          }),
          await person({ ...defaultPersonOptions, foedselsdato: '1960-01-01' }),
        ])
      })

      test('forventer jeg informasjon på startsiden om at jeg har 0 % alderspensjon og AFP i offentlig sektor', async ({
        page,
      }) => {
        await expect(
          page.getByTestId('stegvisning-start-ingress-pre2025-offentlig-afp')
        ).toBeVisible()
        await expect(
          page.getByTestId('stegvisning-start-ingress-pre2025-offentlig-afp')
        ).toContainText('0 %')
      })

      test('forventer jeg å kunne velge mellom 0, 20, 40, 50, 60, 80, 100 % uttaksgrad', async ({
        page,
      }) => {
        await fillOutStegvisning(page, { navigateTo: 'beregning-detaljert' })

        const uttaksgradSelect = page.getByTestId('uttaksgrad')
        await expect(uttaksgradSelect).toBeVisible()
        await expect(uttaksgradSelect.locator('option')).toHaveCount(8)
      })

      test.describe('Når jeg har trykket kom i gang og er kommet til beregningssiden i redigeringsmodus,', () => {
        test.beforeEach(async ({ page }) => {
          await fillOutStegvisning(page, { navigateTo: 'beregning-detaljert' })

          const yearSelect = page.getByTestId(
            'age-picker-uttaksalder-helt-uttak-aar'
          )
          const firstYearValue =
            (await yearSelect.locator('option').nth(1).getAttribute('value')) ||
            ''
          await yearSelect.selectOption(firstYearValue)

          const monthSelect = page.getByTestId(
            'age-picker-uttaksalder-helt-uttak-maaneder'
          )
          const monthOptions = monthSelect.locator('option')
          const monthCount = await monthOptions.count()
          const firstSelectableMonth =
            monthCount > 1 ? monthOptions.nth(1) : monthOptions.first()
          const firstMonthValue =
            (await firstSelectableMonth.getAttribute('value')) || ''
          await monthSelect.selectOption(firstMonthValue)

          await page.getByTestId('uttaksgrad').selectOption('100 %')
          await page.getByTestId('inntekt-vsa-helt-uttak-radio-ja').check()
          await page.getByTestId('inntekt-vsa-helt-uttak').fill('100000')

          await expect(
            page.getByTestId(
              'age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar'
            )
          ).toBeVisible()
          await expect(
            page.getByTestId(
              'age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder'
            )
          ).toBeVisible()

          await page
            .getByTestId('age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar')
            .selectOption('75 år')
          await page
            .getByTestId(
              'age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder'
            )
            .selectOption('3')

          await page.getByTestId('beregn-pensjon').click()
          await expect(page).toHaveURL(/\/beregning/)
        })

        test('forventer jeg informasjon om uttaksgrad,hva siste månedlige utbetaling var, og hva månedlig alderspensjon vil bli de månedene jeg har valgt å endre fra.', async ({
          page,
        }) => {
          await expect(
            page.locator(
              '[data-intl="beregning.endring.rediger.vedtak_grad_status"]'
            )
          ).toBeVisible()
        })

        test('forventer jeg en lenke for å endre mine valg.', async ({
          page,
        }) => {
          await expect(page.getByTestId('endre-valg')).toBeVisible()
        })

        test('forventer jeg informasjon om at pensjonsavtaler ikke er med i beregningen.', async ({
          page,
        }) => {
          await expect(page.getByTestId('pensjonsavtaler-alert')).toBeVisible()
        })

        test('forventer jeg tilpasset informasjon i grunnlag: beregningen av alderspensjon tar høyde for at jeg mottar AFP i offentlig sektor, men vises ikke i beregningen.', async ({
          page,
        }) => {
          await expect(
            page.locator('[data-intl="grunnlag.title"]')
          ).toBeVisible()
          await page
            .getByRole('button', { name: 'Vis detaljer om din AFP' })
            .click()
          await expect(
            page.locator('[data-intl="grunnlag.afp.ingress.overgangskull"]')
          ).toBeVisible()
        })
      })
    })

    test.describe('Som bruker som har gjeldende vedtak på alderspensjon og Livsvarig AFP (offentlig)', () => {
      test.beforeEach(async ({ page }) => {
        await authenticate(page, [
          await loependeVedtak({
            endring: true,
            alderspensjon: {
              grad: 80,
              uttaksgradFom: '2010-10-10',
              fom: '2010-10-10',
              sivilstand: 'UGIFT',
            },
            afpOffentlig: { fom: '2010-10-10' },
            ufoeretrygd: { grad: 0 },
          }),
          await alderspensjon({ preset: 'endring' }),
          await person(defaultPersonOptions),
        ])
      })

      test('forventer jeg informasjon på startsiden om at jeg har alderspensjon og AFP privat og hvilken uttaksgrad.', async ({
        page,
      }) => {
        await expect(page.getByTestId('stegvisning.start.title')).toHaveText(
          'Hei Aprikos!'
        )
        await expect(
          page.getByTestId('stegvisning-start-ingress-endring')
        ).toContainText(
          'Du har nå 80 % alderspensjon og AFP i offentlig sektor'
        )
      })

      test('forventer jeg å kunne gå videre ved å trykke kom i gang ', async ({
        page,
      }) => {
        await page.getByTestId('stegvisning-start-button').click()
      })

      test.describe('Som bruker som har fremtidig vedtak om endring av alderspensjon,', () => {
        test.beforeEach(async ({ page }) => {
          await authenticate(page, [
            await loependeVedtak({
              endring: true,
              alderspensjon: {
                grad: 80,
                uttaksgradFom: '2010-10-10',
                fom: '2010-10-10',
                sivilstand: 'UGIFT',
              },
              afpOffentlig: { fom: '2010-10-10' },
              fremtidigAlderspensjon: {
                grad: 90,
                fom: '2099-01-01',
              },
              ufoeretrygd: { grad: 0 },
            }),
            await alderspensjon({ preset: 'endring' }),
            await person(defaultPersonOptions),
          ])
        })

        test('forventer jeg informasjon om at jeg har 80 % alderspensjon og AFP, at jeg har endret til 90 % alderspensjon fra 01.01.2099 og at ny beregning ikke kan gjøres før den datoen.', async ({
          page,
        }) => {
          await expect(
            page.getByText(
              'Du har nå 80 % alderspensjon og AFP i offentlig sektor. Du har endret til 90 % alderspensjon fra 01.01.2099. Du kan ikke gjøre en ny beregning her før denne datoen.'
            )
          ).toBeVisible()
        })
      })

      test.describe('Når jeg har trykt kom i gang og er kommet til beregningssiden i redigeringsmodus,', () => {
        test.beforeEach(async ({ page }) => {
          await page.getByTestId('stegvisning-start-button').click()
        })

        test('forventer jeg informasjon om når jeg startet eller sist endret alderspensjon, og hvilken grad jeg har.', async ({
          page,
        }) => {
          await expect(
            page.getByTestId('beregning.endring.rediger.title')
          ).toBeVisible()
          await expect(
            page.getByTestId('beregning.endring.rediger.vedtak_status')
          ).toContainText(/Fra 10.10.2010 har du mottatt 80 .?% alderspensjon./)
        })

        test('forventer jeg å kunne endre inntekt frem til endring.', async ({
          page,
        }) => {
          await expect(
            page.getByTestId(
              'beregning.avansert.rediger.inntekt_frem_til_endring.label'
            )
          ).toContainText('Pensjonsgivende årsinntekt frem til endring')
          await page.getByRole('button', { name: 'Endre inntekt' }).click()
          await page.getByTestId('inntekt-textfield').fill('550000')
          await page.getByRole('button', { name: 'Oppdater inntekt' }).click()
          await expect(
            page.getByTestId('formatert-inntekt-frem-til-uttak')
          ).toContainText('550 000')
        })

        test('forventer jeg å kunne velge pensjonsalder for endring mellom dagens alder + 1 md og 75 år + 0 md.', async ({
          page,
        }) => {
          await expect(
            page.getByTestId('velguttaksalder.endring.title')
          ).toContainText('Når vil du endre alderspensjonen din?')

          const yearSelect = page.getByTestId(
            'age-picker-uttaksalder-helt-uttak-aar'
          )
          await expect(yearSelect.locator('option')).toHaveCount(12)
          await expect(yearSelect.locator('option').nth(1)).toHaveText('65 år')
          await expect(yearSelect.locator('option').nth(11)).toHaveText('75 år')

          await yearSelect.selectOption('65 år')

          const monthSelect = page.getByTestId(
            'age-picker-uttaksalder-helt-uttak-maaneder'
          )
          await expect(monthSelect.locator('option')).toHaveCount(8)
          await expect(monthSelect.locator('option').first()).toHaveText(
            '4 md. (sep.)'
          )
          await expect(monthSelect.locator('option').last()).toHaveText(
            '11 md. (apr.)'
          )

          await yearSelect.selectOption('75 år')
          await expect(monthSelect.locator('option')).toHaveCount(1)
          await expect(monthSelect.locator('option').first()).toHaveText(
            '0 md. (mai)'
          )
        })

        test('forventer jeg å kunne velge mellom 0, 20, 40, 50, 60, 80 og 100% uttaksgrad.', async ({
          page,
        }) => {
          await expect(
            page.getByTestId('beregning.avansert.rediger.uttaksgrad.label')
          ).toBeVisible()
          await expect(page.getByText('Velg ny uttaksgrad')).toBeVisible()

          const uttaksgradSelect = page.getByTestId('uttaksgrad')
          await expect(uttaksgradSelect.locator('option')).toHaveCount(8)
          await expect(uttaksgradSelect.locator('option').nth(1)).toHaveText(
            '0 %'
          )
          await expect(uttaksgradSelect.locator('option').nth(2)).toHaveText(
            '20 %'
          )
          await expect(uttaksgradSelect.locator('option').nth(3)).toHaveText(
            '40 %'
          )
          await expect(uttaksgradSelect.locator('option').nth(4)).toHaveText(
            '50 %'
          )
          await expect(uttaksgradSelect.locator('option').nth(5)).toHaveText(
            '60 %'
          )
          await expect(uttaksgradSelect.locator('option').nth(6)).toHaveText(
            '80 %'
          )
          await expect(uttaksgradSelect.locator('option').nth(7)).toHaveText(
            '100 %'
          )
        })

        test('forventer jeg å kunne oppgi inntekt ved siden av 100% alderspensjon og beregne ny pensjon.', async ({
          page,
        }) => {
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
            .selectOption('65 år')
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
            .selectOption('4 md. (sep.)')
          await page.getByTestId('uttaksgrad').selectOption('100 %')
          await page.getByTestId('inntekt-vsa-helt-uttak-radio-ja').check()
          await page.getByTestId('inntekt-vsa-helt-uttak').fill('100000')

          await expect(
            page.getByTestId('age-picker-inntekt-vsa-helt-uttak-slutt-alder')
          ).toBeVisible()

          const sluttAlderAarSelect = page.getByTestId(
            'age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar'
          )
          await expect(sluttAlderAarSelect.locator('option')).toHaveCount(12)
          await expect(sluttAlderAarSelect.locator('option').nth(1)).toHaveText(
            '65 år'
          )
          await expect(
            sluttAlderAarSelect.locator('option').nth(11)
          ).toHaveText('75 år')

          await sluttAlderAarSelect.selectOption('70 år')
          await sluttAlderAarSelect.selectOption('75 år')
          await page
            .getByTestId(
              'age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder'
            )
            .selectOption('3')

          await page.getByRole('button', { name: 'Beregn ny pensjon' }).click()
          await expect(page.getByTestId('beregning-heading')).toBeVisible()
        })
      })

      test.describe('Når jeg velger å endre til en annen uttaksgrad enn 100%,', () => {
        test.beforeEach(async ({ page }) => {
          await page.getByTestId('stegvisning-start-button').click()
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
            .selectOption('65 år')
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
            .selectOption('4 md. (sep.)')
          await page.getByTestId('uttaksgrad').selectOption('40 %')
        })

        test('forventer jeg å kunne oppgi inntekt ved siden av gradert alderspensjon og 100 % alderspensjon og beregne pensjon.', async ({
          page,
        }) => {
          await page.getByTestId('inntekt-vsa-gradert-uttak-radio-ja').check()
          await page.getByTestId('inntekt-vsa-gradert-uttak').fill('300000')
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
            .selectOption('67 år')
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
            .selectOption('0 md. (mai)')
          await page.getByTestId('inntekt-vsa-helt-uttak-radio-ja').check()
          await page.getByTestId('inntekt-vsa-helt-uttak').fill('100000')

          await page
            .getByTestId('age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar')
            .selectOption('75 år')
          await page
            .getByTestId(
              'age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder'
            )
            .selectOption('0')

          await page.getByRole('button', { name: 'Beregn ny pensjon' }).click()
          await expect(page.getByTestId('beregning-heading')).toBeVisible()
        })
      })

      test.describe('Som bruker som har valgt endringer,', () => {
        test.beforeEach(async ({ page }) => {
          await page.getByTestId('stegvisning-start-button').click()
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
            .selectOption('65 år')
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
            .selectOption('4 md. (sep.)')
          await page.getByTestId('uttaksgrad').selectOption('40 %')
          await page.getByTestId('inntekt-vsa-gradert-uttak-radio-ja').check()
          await page.getByTestId('inntekt-vsa-gradert-uttak').fill('300000')
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
            .selectOption('67 år')
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
            .selectOption('0 md. (mai)')
          await page.getByTestId('inntekt-vsa-helt-uttak-radio-ja').check()
          await page.getByTestId('inntekt-vsa-helt-uttak').fill('100000')

          await page
            .getByTestId('age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar')
            .selectOption('75 år')
          await page
            .getByTestId(
              'age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder'
            )
            .selectOption('0')

          await page.getByRole('button', { name: 'Beregn ny pensjon' }).click()
          await expect(page.getByTestId('beregning-heading')).toBeVisible()
        })

        test('forventer jeg informasjon om hvilken uttaksgrad på alderspensjon jeg har i dag.', async ({
          page,
        }) => {
          await expect(
            page.locator(
              '[data-intl="beregning.endring.rediger.vedtak_grad_status"]'
            )
          ).toContainText('Du har i dag 80 % alderspensjon.')
        })

        test('forventer jeg informasjon om hva siste månedlige utbetaling var og hva månedlig alderspensjon vil bli de månedene jeg har valgt å endre fra.', async ({
          page,
        }) => {
          await expect(page.getByText('Alderspensjon når du er')).toBeVisible()
          await expect(
            page.getByText('65 år og 4 md. (40 %): 12 342 kr/md.')
          ).toBeVisible()
          await expect(
            page.getByText('67 år (100 %): 28 513 kr/md.')
          ).toBeVisible()
        })

        test('forventer jeg en lenke for å endre mine valg.', async ({
          page,
        }) => {
          await expect(page.getByTestId('endre-valg')).toBeVisible()
        })

        test('forventer jeg å se resultatet for alderspensjon i graf og tabell med Livsvarig AFP (offentlig).', async ({
          page,
        }) => {
          await expect(page.getByTestId('beregning-heading')).toBeVisible()
          await expect(
            page
              .getByTestId('highcharts-aria-wrapper')
              .getByText('Pensjonsgivende inntekt')
              .first()
          ).toBeVisible()

          await expect(
            page
              .getByTestId('highcharts-aria-wrapper')
              .getByText('Pensjonsavtaler (arbeidsgivere m.m.)')
          ).not.toBeVisible()
          await expect(
            page
              .getByTestId('highcharts-aria-wrapper')
              .getByText('Alderspensjon (Nav)')
              .first()
          ).toBeVisible()
          await expect(
            page
              .getByTestId('highcharts-aria-wrapper')
              .getByText(/Tusen kroner|Kroner/)
              .first()
          ).toBeVisible()
          await expect(
            page.getByTestId('highcharts-aria-wrapper').getByText('65').first()
          ).toBeVisible()
          await expect(
            page.getByTestId('highcharts-aria-wrapper').getByText('77+').first()
          ).toBeVisible()
        })

        test('forventer jeg informasjon om at pensjonsavtaler ikke er med i beregningen.', async ({
          page,
        }) => {
          await expect(page.getByTestId('pensjonsavtaler-alert')).toContainText(
            'Pensjonsavtaler fra arbeidsgivere og egen sparing er ikke med i beregningen.'
          )
        })

        test('forventer jeg tilpasset informasjon i grunnlag: at opphold utenfor Norge er hentet fra vedtak og at AFP Offentlig er uendret.', async ({
          page,
        }) => {
          await expect(page.getByTestId('beregning-heading')).toBeVisible()
          await expect(page.getByTestId('grunnlag.title')).toBeVisible()
          await page.getByRole('button', { name: /Sivilstand/ }).click()
          await page
            .getByRole('button', { name: /Opphold utenfor Norge/ })
            .click()
          await expect(
            page.getByTestId('grunnlag.opphold.value.endring')
          ).toBeVisible()
          await expect(
            page.getByTestId('grunnlag.opphold.ingress.endring')
          ).toBeVisible()
          await expect(page.getByTestId('grunnlag.afp.title')).toContainText(
            'Offentlig'
          )
        })

        test('forventer jeg lenke til søknad om endring av alderspensjon.', async ({
          page,
        }) => {
          await expect(
            page.getByRole('link', { name: 'Klar til å søke om endring?' })
          ).toBeVisible()
          await expect(
            page.locator('a[href*="/pensjon/opptjening/nb/"]').first()
          ).toBeAttached()
        })
      })
    })

    test.describe('Som bruker som har gjeldende vedtak på alderspensjon og gradert uføretrygd', () => {
      test.beforeEach(async ({ page }) => {
        await authenticate(page, [
          await loependeVedtak({
            endring: true,
            alderspensjon: {
              grad: 50,
              uttaksgradFom: '2010-10-10',
              fom: '2010-10-10',
              sivilstand: 'UGIFT',
            },
            ufoeretrygd: { grad: 50 },
          }),
          await alderspensjon({ preset: 'endring' }),
          await person(defaultPersonOptions),
        ])
      })

      test('forventer jeg informasjon på startsiden om at jeg har alderspensjon og uføetrygd og hvilken uttaksgrad.', async ({
        page,
      }) => {
        await expect(page.getByTestId('stegvisning.start.title')).toHaveText(
          'Hei Aprikos!'
        )
        await expect(
          page.getByTestId('stegvisning-start-ingress-endring')
        ).toContainText('Du har nå 50 % alderspensjon og 50 % uføretrygd')
      })

      test('forventer jeg å kunne gå videre ved å trykke kom i gang ', async ({
        page,
      }) => {
        await page.getByTestId('stegvisning-start-button').click()
      })

      test.describe('Som bruker som har fremtidig vedtak om endring av alderspensjon,', () => {
        test.beforeEach(async ({ page }) => {
          await authenticate(page, [
            await loependeVedtak({
              endring: true,
              alderspensjon: {
                grad: 50,
                uttaksgradFom: '2010-10-10',
                fom: '2010-10-10',
                sivilstand: 'UGIFT',
              },
              ufoeretrygd: { grad: 40 },
              fremtidigAlderspensjon: {
                grad: 90,
                fom: '2099-01-01',
              },
            }),
            await alderspensjon({ preset: 'endring' }),
            await person(defaultPersonOptions),
          ])
        })

        test('forventer jeg informasjon om at jeg har 50 % alderspensjon og 40 % uføretrygd, at jeg har endret til 90 % alderspensjon fra 01.01.2099 og at ny beregning ikke kan gjøres før den datoen.', async ({
          page,
        }) => {
          await expect(
            page.getByText(
              'Du har nå 50 % alderspensjon og 40 % uføretrygd. Du har endret til 90 % alderspensjon fra 01.01.2099. Du kan ikke gjøre en ny beregning her før denne datoen.'
            )
          ).toBeVisible()
        })
      })

      test.describe('Når jeg har trykt kom i gang og er kommet til beregningssiden i redigeringsmodus,', () => {
        test.beforeEach(async ({ page }) => {
          await page.getByTestId('stegvisning-start-button').click()
        })

        test('forventer jeg informasjon om når jeg startet eller sist endret alderspensjon, og hvilken grad jeg har.', async ({
          page,
        }) => {
          await expect(
            page.getByTestId('beregning.endring.rediger.title')
          ).toBeVisible()
          await expect(
            page.getByTestId('beregning.endring.rediger.vedtak_status')
          ).toContainText(/Fra 10.10.2010 har du mottatt 50 .?% alderspensjon./)
        })

        test('forventer jeg å kunne endre inntekt frem til endring.', async ({
          page,
        }) => {
          await expect(
            page.getByTestId(
              'beregning.avansert.rediger.inntekt_frem_til_endring.label'
            )
          ).toContainText('Pensjonsgivende årsinntekt frem til endring')
          await page.getByRole('button', { name: 'Endre inntekt' }).click()
          await page.getByTestId('inntekt-textfield').fill('550000')
          await page.getByRole('button', { name: 'Oppdater inntekt' }).click()
          await expect(
            page.getByTestId('formatert-inntekt-frem-til-uttak')
          ).toContainText('550 000')
        })

        test('forventer jeg å kunne velge pensjonsalder for endring mellom dagens alder + 1 md og 75 år + 0 md.', async ({
          page,
        }) => {
          await expect(
            page.getByTestId('velguttaksalder.endring.title')
          ).toContainText('Når vil du endre alderspensjonen din?')

          const yearSelect = page.getByTestId(
            'age-picker-uttaksalder-helt-uttak-aar'
          )
          await expect(yearSelect.locator('option')).toHaveCount(12)
          await expect(yearSelect.locator('option').nth(1)).toHaveText('65 år')
          await expect(yearSelect.locator('option').nth(11)).toHaveText('75 år')

          await yearSelect.selectOption('65 år')

          const monthSelect = page.getByTestId(
            'age-picker-uttaksalder-helt-uttak-maaneder'
          )
          await expect(monthSelect.locator('option')).toHaveCount(8)
          await expect(monthSelect.locator('option').first()).toHaveText(
            '4 md. (sep.)'
          )
          await expect(monthSelect.locator('option').last()).toHaveText(
            '11 md. (apr.)'
          )

          await yearSelect.selectOption('75 år')
          await expect(monthSelect.locator('option')).toHaveCount(1)
          await expect(monthSelect.locator('option').first()).toHaveText(
            '0 md. (mai)'
          )
        })

        test('forventer jeg at mulige uttaksgrader begrenses til uttaksgradene som er mulig å kombinere med uføretrygd ved uttaksalder før ubetinget uttaksalder.', async ({
          page,
        }) => {
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
            .selectOption('66 år')
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
            .selectOption('6 md. (nov.)')

          const uttaksgradSelect = page.getByTestId('uttaksgrad')
          await expect(uttaksgradSelect.locator('option')).toHaveCount(5)
          await expect(uttaksgradSelect.locator('option').nth(1)).toHaveText(
            '0 %'
          )
          await expect(uttaksgradSelect.locator('option').nth(2)).toHaveText(
            '20 %'
          )
          await expect(uttaksgradSelect.locator('option').nth(3)).toHaveText(
            '40 %'
          )
          await expect(uttaksgradSelect.locator('option').nth(4)).toHaveText(
            '50 %'
          )
        })

        test('forventer jeg at mulige uttaksgrader ikke begrenses ved uttaksalder over ubetinget uttaksalder.', async ({
          page,
        }) => {
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
            .selectOption('67 år')
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
            .selectOption('0 md. (mai)')

          const uttaksgradSelect = page.getByTestId('uttaksgrad')
          await expect(uttaksgradSelect.locator('option')).toHaveCount(8)
          await expect(uttaksgradSelect.locator('option').nth(1)).toHaveText(
            '0 %'
          )
          await expect(uttaksgradSelect.locator('option').nth(2)).toHaveText(
            '20 %'
          )
          await expect(uttaksgradSelect.locator('option').nth(3)).toHaveText(
            '40 %'
          )
          await expect(uttaksgradSelect.locator('option').nth(4)).toHaveText(
            '50 %'
          )
          await expect(uttaksgradSelect.locator('option').nth(5)).toHaveText(
            '60 %'
          )
          await expect(uttaksgradSelect.locator('option').nth(6)).toHaveText(
            '80 %'
          )
          await expect(uttaksgradSelect.locator('option').nth(7)).toHaveText(
            '100 %'
          )
        })

        test('forventer jeg å kunne oppgi inntekt ved siden av gradert alderspensjon og 100 % alderspensjon og beregne pensjon.', async ({
          page,
        }) => {
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
            .selectOption('65 år')
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
            .selectOption('4 md. (sep.)')
          await page.getByTestId('uttaksgrad').selectOption('40 %')
          await page.getByTestId('inntekt-vsa-gradert-uttak-radio-ja').check()
          await page.getByTestId('inntekt-vsa-gradert-uttak').fill('300000')
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
            .selectOption('67 år')
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
            .selectOption('0 md. (mai)')
          await page.getByTestId('inntekt-vsa-helt-uttak-radio-ja').check()
          await page.getByTestId('inntekt-vsa-helt-uttak').fill('100000')

          await page
            .getByTestId('age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar')
            .selectOption('75 år')
          await page
            .getByTestId(
              'age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder'
            )
            .selectOption('0')

          await page.getByRole('button', { name: 'Beregn ny pensjon' }).click()
          await expect(page.getByTestId('beregning-heading')).toBeVisible()
        })
      })

      test.describe('Som bruker som har valgt endringer,', () => {
        test.beforeEach(async ({ page }) => {
          await page.getByTestId('stegvisning-start-button').click()
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
            .selectOption('65 år')
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
            .selectOption('4 md. (sep.)')
          await page.getByTestId('uttaksgrad').selectOption('40 %')
          await page.getByTestId('inntekt-vsa-gradert-uttak-radio-ja').check()
          await page.getByTestId('inntekt-vsa-gradert-uttak').fill('300000')
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
            .selectOption('67 år')
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
            .selectOption('0 md. (mai)')
          await page.getByTestId('inntekt-vsa-helt-uttak-radio-ja').check()
          await page.getByTestId('inntekt-vsa-helt-uttak').fill('100000')

          await page
            .getByTestId('age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar')
            .selectOption('75 år')
          await page
            .getByTestId(
              'age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder'
            )
            .selectOption('0')

          await page.getByRole('button', { name: 'Beregn ny pensjon' }).click()
        })

        test('forventer jeg informasjon om hvilken uttaksgrad på alderspensjon jeg har i dag.', async ({
          page,
        }) => {
          await expect(
            page.locator(
              '[data-intl="beregning.endring.rediger.vedtak_grad_status"]'
            )
          ).toContainText('Du har i dag 50 % alderspensjon.')
        })

        test('forventer jeg informasjon om hva siste månedlige utbetaling var og hva månedlig alderspensjon vil bli de månedene jeg har valgt å endre fra.', async ({
          page,
        }) => {
          await expect(page.getByText('Alderspensjon når du er')).toBeVisible()
          await expect(
            page.getByText('65 år og 4 md. (40 %): 12 342 kr/md.')
          ).toBeVisible()
          await expect(
            page.getByText('67 år (100 %): 28 513 kr/md.')
          ).toBeVisible()
        })

        test('forventer jeg en lenke for å endre mine valg.', async ({
          page,
        }) => {
          await expect(page.getByTestId('endre-valg')).toBeVisible()
        })

        test('forventer jeg å se resultatet for alderspensjon i graf og tabell.', async ({
          page,
        }) => {
          await expect(page.getByTestId('beregning-heading')).toBeVisible()
          await expect(
            page
              .getByTestId('highcharts-aria-wrapper')
              .getByText('Pensjonsgivende inntekt')
              .first()
          ).toBeVisible()
          await expect(
            page.getByTestId('highcharts-aria-wrapper').getByText(/AFP/).first()
          ).not.toBeVisible()
          await expect(
            page
              .getByTestId('highcharts-aria-wrapper')
              .getByText('Pensjonsavtaler (arbeidsgivere m.m.)')
          ).not.toBeVisible()
          await expect(
            page
              .getByTestId('highcharts-aria-wrapper')
              .getByText('Alderspensjon (Nav)')
              .first()
          ).toBeVisible()
          await expect(
            page
              .getByTestId('highcharts-aria-wrapper')
              .getByText(/Tusen kroner|Kroner/)
              .first()
          ).toBeVisible()
          await expect(
            page.getByTestId('highcharts-aria-wrapper').getByText('65').first()
          ).toBeVisible()
          await expect(
            page.getByTestId('highcharts-aria-wrapper').getByText('77+').first()
          ).toBeVisible()
        })

        test('forventer jeg informasjon om at pensjonsavtaler ikke er med i beregningen.', async ({
          page,
        }) => {
          await expect(page.getByTestId('pensjonsavtaler-alert')).toContainText(
            'Pensjonsavtaler fra arbeidsgivere og egen sparing er ikke med i beregningen.'
          )
        })

        test('forventer jeg tilpasset informasjon i grunnlag: at opphold utenfor Norge er hentet fra vedtak', async ({
          page,
        }) => {
          await expect(page.getByTestId('beregning-heading')).toBeVisible()
          await expect(page.getByTestId('grunnlag.title')).toBeVisible()
          await page.getByRole('button', { name: /Sivilstand/ }).click()
          await page
            .getByRole('button', { name: /Opphold utenfor Norge/ })
            .click()
          await expect(
            page.getByTestId('grunnlag.opphold.value.endring')
          ).toBeVisible()
          await expect(
            page.getByTestId('grunnlag.opphold.ingress.endring')
          ).toBeVisible()
          await expect(page.getByTestId('grunnlag.afp.title')).toContainText(
            'Nei'
          )
        })

        test('forventer jeg lenke til søknad om endring av alderspensjon.', async ({
          page,
        }) => {
          await expect(
            page.getByRole('link', { name: 'Klar til å søke om endring?' })
          ).toBeVisible()
          await expect(
            page.locator('a[href*="/pensjon/opptjening/nb/"]').first()
          ).toBeAttached()
        })
      })
    })

    test.describe('Som bruker som har gjeldende vedtak på alderspensjon med 0 % og 100 % uføretrygd', () => {
      test.beforeEach(async ({ page }) => {
        await authenticate(page, [
          await loependeVedtak({
            endring: true,
            alderspensjon: {
              grad: 0,
              uttaksgradFom: '2010-10-10',
              fom: '2010-10-10',
              sivilstand: 'UGIFT',
            },
            ufoeretrygd: { grad: 100 },
          }),
          await alderspensjon({ preset: 'endring' }),
          await person(defaultPersonOptions),
        ])
      })

      test('forventer jeg informasjon på startsiden om at jeg har 0% alderspensjon og 100 % uføretrygd.', async ({
        page,
      }) => {
        await expect(page.getByTestId('stegvisning.start.title')).toHaveText(
          'Hei Aprikos!'
        )
        await expect(
          page.getByTestId('stegvisning-start-ingress-endring')
        ).toContainText('Du har nå 0 % alderspensjon og 100 % uføretrygd')
      })

      test('forventer jeg å kunne gå videre ved å trykke kom i gang ', async ({
        page,
      }) => {
        await page.getByTestId('stegvisning-start-button').click()
      })

      test.describe('Som bruker som har fremtidig vedtak om endring av alderspensjon,', () => {
        test.beforeEach(async ({ page }) => {
          await authenticate(page, [
            await loependeVedtak({
              endring: true,
              alderspensjon: {
                grad: 0,
                uttaksgradFom: '2010-10-10',
                fom: '2010-10-10',
                sivilstand: 'UGIFT',
              },
              fremtidigAlderspensjon: {
                grad: 90,
                fom: '2099-01-01',
              },
              ufoeretrygd: { grad: 100 },
            }),
            await alderspensjon({ preset: 'endring' }),
            await person(defaultPersonOptions),
          ])
        })

        test('forventer jeg informasjon om at jeg har 0 % alderspensjon og 100 % uføretrygd, at jeg har endret til 90 % alderspensjon fra 01.01.2099 og at ny beregning ikke kan gjøres før den datoen.', async ({
          page,
        }) => {
          await expect(
            page.getByText(
              'Du har nå 0 % alderspensjon og 100 % uføretrygd. Du har endret til 90 % alderspensjon fra 01.01.2099. Du kan ikke gjøre en ny beregning her før denne datoen.'
            )
          ).toBeVisible()
        })
      })

      test.describe('Når jeg har trykt kom i gang og er kommet til beregningssiden i redigeringsmodus,', () => {
        test.beforeEach(async ({ page }) => {
          await page.getByTestId('stegvisning-start-button').click()
        })

        test('forventer jeg informasjon om når jeg startet eller sist endret alderspensjon, og hvilken grad jeg har.', async ({
          page,
        }) => {
          await expect(
            page.getByTestId('beregning.endring.rediger.title')
          ).toBeVisible()
          await expect(
            page.getByTestId('beregning.endring.rediger.vedtak_status')
          ).toContainText(/Fra 10.10.2010 har du mottatt 0 .?% alderspensjon./)
        })

        test('forventer jeg å kunne endre inntekt frem til endring.', async ({
          page,
        }) => {
          await expect(
            page.getByTestId(
              'beregning.avansert.rediger.inntekt_frem_til_endring.label'
            )
          ).toContainText('Pensjonsgivende årsinntekt frem til endring')
          await page.getByRole('button', { name: 'Endre inntekt' }).click()
          await page.getByTestId('inntekt-textfield').fill('550000')
          await page.getByRole('button', { name: 'Oppdater inntekt' }).click()
          await expect(
            page.getByTestId('formatert-inntekt-frem-til-uttak')
          ).toContainText('550 000')
        })

        test('forventer jeg å kunne velge pensjonsalder for endring mellom ubetinget uttaksalder og 75 år + 0 md.', async ({
          page,
        }) => {
          await expect(
            page.getByTestId('velguttaksalder.endring.title')
          ).toContainText('Når vil du endre alderspensjonen din?')

          const yearSelect = page.getByTestId(
            'age-picker-uttaksalder-helt-uttak-aar'
          )
          await expect(yearSelect.locator('option')).toHaveCount(10)
          await expect(yearSelect.locator('option').nth(1)).toHaveText('67 år')
          await expect(yearSelect.locator('option').nth(9)).toHaveText('75 år')

          await yearSelect.selectOption('67 år')

          const monthSelect = page.getByTestId(
            'age-picker-uttaksalder-helt-uttak-maaneder'
          )
          await expect(monthSelect.locator('option')).toHaveCount(12)
          await expect(monthSelect.locator('option').first()).toHaveText(
            '0 md. (mai)'
          )
          await expect(monthSelect.locator('option').last()).toHaveText(
            '11 md. (apr.)'
          )

          await yearSelect.selectOption('75 år')
          await expect(monthSelect.locator('option')).toHaveCount(1)
          await expect(monthSelect.locator('option').first()).toHaveText(
            '0 md. (mai)'
          )
        })

        test('forventer jeg å kunne velge mellom 0, 20, 40, 50, 60, 80 og 100% uttaksgrad.', async ({
          page,
        }) => {
          await expect(
            page.getByTestId('beregning.avansert.rediger.uttaksgrad.label')
          ).toBeVisible()
          await expect(page.getByText('Velg ny uttaksgrad')).toBeVisible()

          const uttaksgradSelect = page.getByTestId('uttaksgrad')
          await expect(uttaksgradSelect.locator('option')).toHaveCount(8)
          await expect(uttaksgradSelect.locator('option').nth(1)).toHaveText(
            '0 %'
          )
          await expect(uttaksgradSelect.locator('option').nth(2)).toHaveText(
            '20 %'
          )
          await expect(uttaksgradSelect.locator('option').nth(3)).toHaveText(
            '40 %'
          )
          await expect(uttaksgradSelect.locator('option').nth(4)).toHaveText(
            '50 %'
          )
          await expect(uttaksgradSelect.locator('option').nth(5)).toHaveText(
            '60 %'
          )
          await expect(uttaksgradSelect.locator('option').nth(6)).toHaveText(
            '80 %'
          )
          await expect(uttaksgradSelect.locator('option').nth(7)).toHaveText(
            '100 %'
          )
        })

        test('forventer jeg å kunne oppgi inntekt ved siden av 100% alderspensjon og beregne ny pensjon.', async ({
          page,
        }) => {
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
            .selectOption('67 år')
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
            .selectOption('4 md. (sep.)')
          await page.getByTestId('uttaksgrad').selectOption('100 %')
          await page.getByTestId('inntekt-vsa-helt-uttak-radio-ja').check()
          await page.getByTestId('inntekt-vsa-helt-uttak').fill('100000')

          await expect(
            page.getByTestId('age-picker-inntekt-vsa-helt-uttak-slutt-alder')
          ).toBeVisible()

          const sluttAlderAarSelect = page.getByTestId(
            'age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar'
          )
          await expect(sluttAlderAarSelect.locator('option')).toHaveCount(10)
          await expect(sluttAlderAarSelect.locator('option').nth(1)).toHaveText(
            '67 år'
          )
          await expect(sluttAlderAarSelect.locator('option').nth(9)).toHaveText(
            '75 år'
          )

          await sluttAlderAarSelect.selectOption('70 år')
          await sluttAlderAarSelect.selectOption('75 år')
          await page
            .getByTestId(
              'age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder'
            )
            .selectOption('3')

          await page.getByRole('button', { name: 'Beregn ny pensjon' }).click()
          await expect(page.getByTestId('beregning-heading')).toBeVisible()
        })
      })

      test.describe('Når jeg velger å endre til en annen uttaksgrad enn 100%,', () => {
        test.beforeEach(async ({ page }) => {
          await page.getByTestId('stegvisning-start-button').click()
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
            .selectOption('67 år')
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
            .selectOption('0 md. (mai)')
          await page.getByTestId('uttaksgrad').selectOption('40 %')
        })

        test('forventer jeg å kunne oppgi inntekt ved siden av gradert alderspensjon og 100 % alderspensjon og beregne pensjon.', async ({
          page,
        }) => {
          await page.getByTestId('inntekt-vsa-gradert-uttak-radio-ja').check()
          await page.getByTestId('inntekt-vsa-gradert-uttak').fill('300000')
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
            .selectOption('72 år')
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
            .selectOption('0 md. (mai)')
          await page.getByTestId('inntekt-vsa-helt-uttak-radio-ja').check()
          await page.getByTestId('inntekt-vsa-helt-uttak').fill('100000')

          await page
            .getByTestId('age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar')
            .selectOption('75 år')
          await page
            .getByTestId(
              'age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder'
            )
            .selectOption('0')

          await page.getByRole('button', { name: 'Beregn ny pensjon' }).click()
          await expect(page.getByTestId('beregning-heading')).toBeVisible()
        })
      })

      test.describe('Som bruker som har valgt endringer,', () => {
        test.beforeEach(async ({ page }) => {
          await page.getByTestId('stegvisning-start-button').click()
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
            .selectOption('67 år')
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
            .selectOption('4 md. (sep.)')
          await page.getByTestId('uttaksgrad').selectOption('40 %')
          await page.getByTestId('inntekt-vsa-gradert-uttak-radio-ja').check()
          await page.getByTestId('inntekt-vsa-gradert-uttak').fill('300000')
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
            .selectOption('70 år')
          await page
            .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
            .selectOption('0 md. (mai)')
          await page.getByTestId('inntekt-vsa-helt-uttak-radio-ja').check()
          await page.getByTestId('inntekt-vsa-helt-uttak').fill('100000')

          await page
            .getByTestId('age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar')
            .selectOption('75 år')
          await page
            .getByTestId(
              'age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder'
            )
            .selectOption('0')

          await page.getByRole('button', { name: 'Beregn ny pensjon' }).click()
          await expect(page.getByTestId('beregning-heading')).toBeVisible()
        })

        test('forventer jeg informasjon om hvilken uttaksgrad på alderspensjon jeg har i dag.', async ({
          page,
        }) => {
          await expect(
            page.locator(
              '[data-intl="beregning.endring.rediger.vedtak_grad_status"]'
            )
          ).toContainText('Du har i dag 0 % alderspensjon.')
        })

        test('forventer jeg informasjon om hva siste månedlige utbetaling var og hva månedlig alderspensjon vil bli de månedene jeg har valgt å endre fra.', async ({
          page,
        }) => {
          await expect(page.getByText('Alderspensjon når du er')).toBeVisible()
          await expect(
            page.getByText('67 år og 4 md. (40 %): 12 342 kr/md.')
          ).toBeVisible()
          await expect(
            page.getByText('70 år (100 %): 28 513 kr/md.')
          ).toBeVisible()
        })

        test('forventer jeg en lenke for å endre mine valg.', async ({
          page,
        }) => {
          await expect(page.getByTestId('endre-valg')).toBeVisible()
        })

        test('forventer jeg å se resultatet for alderspensjon i graf og tabell.', async ({
          page,
        }) => {
          await expect(page.getByTestId('beregning-heading')).toBeVisible()
          await expect(
            page
              .getByTestId('highcharts-aria-wrapper')
              .getByText('Pensjonsgivende inntekt')
              .first()
          ).toBeVisible()
          await expect(
            page.getByTestId('highcharts-aria-wrapper').getByText(/AFP/).first()
          ).not.toBeVisible()
          await expect(
            page
              .getByTestId('highcharts-aria-wrapper')
              .getByText('Pensjonsavtaler (arbeidsgivere m.m.)')
          ).not.toBeVisible()
          await expect(
            page
              .getByTestId('highcharts-aria-wrapper')
              .getByText('Alderspensjon (Nav)')
              .first()
          ).toBeVisible()
          await expect(
            page
              .getByTestId('highcharts-aria-wrapper')
              .getByText(/Tusen kroner|Kroner/)
              .first()
          ).toBeVisible()
          await expect(
            page.getByTestId('highcharts-aria-wrapper').getByText('65').first()
          ).toBeVisible()
          await expect(
            page.getByTestId('highcharts-aria-wrapper').getByText('77+').first()
          ).toBeVisible()
        })

        test('forventer jeg informasjon om at pensjonsavtaler ikke er med i beregningen.', async ({
          page,
        }) => {
          await expect(page.getByTestId('pensjonsavtaler-alert')).toContainText(
            'Pensjonsavtaler fra arbeidsgivere og egen sparing er ikke med i beregningen.'
          )
        })

        test('forventer jeg tilpasset informasjon i grunnlag: at opphold utenfor Norge er hentet fra vedtak og at AFP: Nei vises', async ({
          page,
        }) => {
          await expect(page.getByTestId('beregning-heading')).toBeVisible()
          await expect(page.getByTestId('grunnlag.title')).toBeVisible()
          await page.getByRole('button', { name: /Sivilstand/ }).click()
          await page
            .getByRole('button', { name: /Opphold utenfor Norge/ })
            .click()
          await expect(
            page.getByTestId('grunnlag.opphold.value.endring')
          ).toBeVisible()
          await expect(
            page.getByTestId('grunnlag.opphold.ingress.endring')
          ).toBeVisible()
          await expect(page.getByTestId('grunnlag.afp.title')).toContainText(
            'Nei'
          )
        })

        test('forventer jeg lenke til søknad om endring av alderspensjon.', async ({
          page,
        }) => {
          await expect(
            page.getByRole('link', { name: 'Klar til å søke om endring?' })
          ).toBeVisible()
          await expect(
            page.locator('a[href*="/pensjon/opptjening/nb/"]').first()
          ).toBeAttached()
        })
      })
    })
  })
})
