import type { Page } from '@playwright/test'
import { fillOutStegvisning } from 'utils/navigation'

import { expect, test } from '../../../base'
import { authenticate } from '../../../utils/auth'
import {
  alderspensjon,
  offentligTp,
  pensjonsavtaler,
  person,
} from '../../../utils/mocks'

async function expectAfpOgPensjonsavtalerIGrafOgTabell(page: Page) {
  await test.step('Verify AFP and pensjonsavtaler in graph and table', async () => {
    const chart = page.getByTestId('highcharts-aria-wrapper')
    await expect(chart.getByText('Pensjonsgivende inntekt')).toBeVisible()
    await expect(chart.getByText(/AFP \(avtalefestet pensjon\)/)).toBeVisible()
    await expect(
      chart.getByText('Pensjonsavtaler (arbeidsgivere m.m.)')
    ).toBeVisible()
    await expect(chart.getByText('Alderspensjon (Nav)').first()).toBeVisible()

    await page.getByRole('button', { name: /Vis tabell/i }).click()

    await expect(
      page.getByRole('columnheader', { name: /Pensjonsgivende inntekt/i })
    ).toBeVisible()
    await expect(
      page.getByRole('columnheader', { name: /AFP \(avtalefestet pensjon\)/i })
    ).toBeVisible()
    await expect(
      page.getByRole('columnheader', {
        name: /Pensjonsavtaler \(arbeidsgivere m\.m\.\)/i,
      })
    ).toBeVisible()
    await expect(
      page.getByRole('columnheader', { name: /Alderspensjon \(Nav\)/i })
    ).toBeVisible()
  })
}

async function expectPensjonsavtalerIGrafOgTabell(page: Page) {
  await test.step('Verify pensjonsavtaler in graph and table (without AFP)', async () => {
    const chart = page.getByTestId('highcharts-aria-wrapper')
    await expect(chart.getByText('Pensjonsgivende inntekt')).toBeVisible()
    await expect(
      chart.getByText('Pensjonsavtaler (arbeidsgivere m.m.)')
    ).toBeVisible()
    await expect(chart.getByText('Alderspensjon (Nav)').first()).toBeVisible()

    await page.getByRole('button', { name: /Vis tabell/i }).click()

    await expect(
      page.getByRole('columnheader', { name: /Pensjonsgivende inntekt/i })
    ).toBeVisible()
    await expect(
      page.getByRole('columnheader', {
        name: /Pensjonsavtaler \(arbeidsgivere m\.m\.\)/i,
      })
    ).toBeVisible()
    await expect(
      page.getByRole('columnheader', { name: /Alderspensjon \(Nav\)/i })
    ).toBeVisible()
  })
}

async function expectIkkePensjonsavtalerIGrafOgTabell(page: Page) {
  await test.step('Verify pensjonsavtaler NOT in graph or table', async () => {
    const chart = page.getByTestId('highcharts-aria-wrapper')
    await expect(chart.getByText('Pensjonsgivende inntekt')).toBeVisible()
    await expect(
      chart.getByText('Pensjonsavtaler (arbeidsgivere m.m.)')
    ).not.toBeVisible()
    await expect(chart.getByText('Alderspensjon (Nav)').first()).toBeVisible()

    await page.getByRole('button', { name: /Vis tabell/i }).click()

    await expect(
      page.getByRole('columnheader', { name: /Pensjonsgivende inntekt/i })
    ).toBeVisible()
    await expect(
      page.getByRole('columnheader', {
        name: /Pensjonsavtaler \(arbeidsgivere m\.m\.\)/i,
      })
    ).toHaveCount(0)
    await expect(
      page.getByRole('columnheader', { name: /Alderspensjon \(Nav\)/i })
    ).toBeVisible()
  })
}

async function clickUttaksalderAndWait(page: Page, buttonText: string) {
  await test.step(`Click uttaksalder: ${buttonText}`, async () => {
    await page.getByRole('button', { name: buttonText }).click()
    await expect(page.getByTestId('pensjonsavtaler-heading')).toBeVisible()
  })
}

test.describe('Med samtykke - Offentlig tjenestepensjon', () => {
  test.describe('Som bruker som er født etter 1963 og har samtykket til innhenting av avtaler,', () => {
    test.describe('Som bruker som har TPO forhold hos SPK,', () => {
      // 1
      test.describe('Som bruker som har svart "ja" på Livsvarig AFP offentlig,', () => {
        test.use({ autoAuth: false })

        test.beforeEach(async ({ page }) => {
          await authenticate(page, [
            await offentligTp({ preset: 'spk' }),
            await alderspensjon({ preset: 'med_afp_offentlig' }),
          ])
          await fillOutStegvisning(page, {
            afp: 'ja_offentlig',
            samtykkeAfpOffentlig: true,
            samtykke: true,
            navigateTo: 'beregning',
          })
        })

        test.describe('Når jeg er kommet til beregningssiden og har valgt alder jeg ønsker beregning fra,', () => {
          test.beforeEach(async ({ page }) => {
            await clickUttaksalderAndWait(page, '62 år og 10 md.')
          })

          // 1
          test('forventer jeg at AFP og pensjonsavtaler vises i graf og tabell.', async ({
            page,
          }) => {
            await expectAfpOgPensjonsavtalerIGrafOgTabell(page)
          })

          // 2
          test('forventer jeg informasjon i «Pensjonsavtaler - Offentlig tjenestepensjon» om hva jeg får i alderspensjon fra Statens Pensjonskasse.', async ({
            page,
          }) => {
            await expect(
              page.getByRole('heading', { name: /Offentlig tjenestepensjon/i })
            ).toBeVisible()
            const spkRow = page.getByRole('rowheader', {
              name: /Statens pensjonskasse/i,
            })
            await expect(spkRow).toBeVisible()
            const offtpTable = page.locator('table').filter({ has: spkRow })
            await expect(
              offtpTable.getByRole('cell', { name: /Fra 67 år til 69 år/i })
            ).toBeVisible()
            await expect(
              offtpTable.getByRole('cell', { name: /Fra 70 år til 74 år/i })
            ).toBeVisible()
            await expect(
              offtpTable.getByRole('cell', { name: /Livsvarig fra 75 år/i })
            ).toBeVisible()
          })

          // 3
          test('forventer jeg informasjon om at Livsvarig AFP ikke er inkludert.', async ({
            page,
          }) => {
            await expect(
              page.getByText(/Livsvarig AFP er ikke inkludert i dette beløpet/i)
            ).toBeVisible()
          })
        })
      })

      // 2
      test.describe('Som bruker som har svart "ja" på AFP privat,', () => {
        test.use({ autoAuth: false })

        test.beforeEach(async ({ page }) => {
          await authenticate(page, [await offentligTp({ preset: 'spk' })])
          await fillOutStegvisning(page, {
            afp: 'ja_privat',
            samtykke: true,
            navigateTo: 'beregning',
          })
        })

        test.describe('Når jeg er kommet til beregningssiden og har valgt alder jeg ønsker beregning fra,', () => {
          test.beforeEach(async ({ page }) => {
            await clickUttaksalderAndWait(page, '62 år og 10 md.')
          })

          // 4
          test('forventer jeg at AFP og pensjonsavtaler vises i graf og tabell.', async ({
            page,
          }) => {
            await expectAfpOgPensjonsavtalerIGrafOgTabell(page)
          })

          // 5
          test('forventer jeg informasjon i «Pensjonsavtaler - Offentlig tjenestepensjon» om hva jeg får i alderspensjon fra Statens Pensjonskasse.', async ({
            page,
          }) => {
            await expect(
              page.getByRole('heading', { name: /Offentlig tjenestepensjon/i })
            ).toBeVisible()
            const spkRow = page.getByRole('rowheader', {
              name: /Statens pensjonskasse/i,
            })
            await expect(spkRow).toBeVisible()
            const offtpTable = page.locator('table').filter({ has: spkRow })
            await expect(
              offtpTable.getByRole('cell', { name: /Fra 67 år til 69 år/i })
            ).toBeVisible()
            await expect(
              offtpTable.getByRole('cell', { name: /Fra 70 år til 74 år/i })
            ).toBeVisible()
            await expect(
              offtpTable.getByRole('cell', { name: /Livsvarig fra 75 år/i })
            ).toBeVisible()
          })

          // 6
          test('forventer jeg informasjon om at Livsvarig AFP ikke er inkludert.', async ({
            page,
          }) => {
            await expect(
              page.getByText(/Livsvarig AFP er ikke inkludert i dette beløpet/i)
            ).toBeVisible()
          })
        })
      })

      test.describe('Som bruker som har svart "nei" på AFP,', () => {
        // 3
        test.describe('Som bruker som har rett til Betinget tjenestepensjon,', () => {
          test.use({ autoAuth: false })

          test.beforeEach(async ({ page }) => {
            await authenticate(page, [await offentligTp({ preset: 'spk' })])
            await fillOutStegvisning(page, {
              afp: 'nei',
              samtykke: true,
              navigateTo: 'beregning',
            })
          })

          test.describe('Når jeg er kommet til beregningssiden og har valgt alder jeg ønsker beregning fra,', () => {
            test.beforeEach(async ({ page }) => {
              await clickUttaksalderAndWait(page, '62 år og 10 md.')
            })

            // 7
            test('forventer jeg at pensjonsavtaler vises i graf og tabell.', async ({
              page,
            }) => {
              await expectPensjonsavtalerIGrafOgTabell(page)
            })

            // 8
            test('forventer jeg at AFP ikke vises i graf og tabell.', async ({
              page,
            }) => {
              await page.getByRole('button', { name: /Vis tabell/i }).click()
              await expect(
                page.getByRole('columnheader', {
                  name: /AFP \(avtalefestet pensjon\)/i,
                })
              ).toHaveCount(0)
            })

            // 9
            test('forventer jeg informasjon i «Pensjonsavtaler - Offentlig tjenestepensjon» om hva jeg får i alderspensjon fra Statens Pensjonskasse.', async ({
              page,
            }) => {
              await expect(
                page.getByRole('heading', {
                  name: /Offentlig tjenestepensjon/i,
                })
              ).toBeVisible()
              const spkRow = page.getByRole('rowheader', {
                name: /Statens pensjonskasse/i,
              })
              await expect(spkRow).toBeVisible()
              const offtpTable = page.locator('table').filter({ has: spkRow })
              await expect(
                offtpTable.getByRole('cell', { name: /Fra 67 år til 69 år/i })
              ).toBeVisible()
              await expect(
                offtpTable.getByRole('cell', { name: /Fra 70 år til 74 år/i })
              ).toBeVisible()
              await expect(
                offtpTable.getByRole('cell', { name: /Livsvarig fra 75 år/i })
              ).toBeVisible()
            })

            // 10
            test('forventer jeg informasjon om at Betinget tjenestepensjon er inkludert.', async ({
              page,
            }) => {
              await expect(
                page.getByText(
                  /Du har oppgitt at du ikke har rett til livsvarig AFP.*Betinget tjenestepensjon er derfor inkludert/i
                )
              ).toBeVisible()
            })
          })
        })

        // 4
        test.describe('Som bruker som ikke har rett til Betinget tjenestepensjon,', () => {
          test.use({ autoAuth: false })

          test.beforeEach(async ({ page }) => {
            await authenticate(page, [
              await offentligTp({ preset: 'spk_uten_betinget' }),
            ])
            await fillOutStegvisning(page, {
              afp: 'nei',
              samtykke: true,
              navigateTo: 'beregning',
            })
          })

          test.describe('Når jeg er kommet til beregningssiden og har valgt alder jeg ønsker beregning fra,', () => {
            test.beforeEach(async ({ page }) => {
              await clickUttaksalderAndWait(page, '62 år og 10 md.')
            })

            // 11
            test('forventer jeg at pensjonsavtaler vises i graf og tabell.', async ({
              page,
            }) => {
              await expectPensjonsavtalerIGrafOgTabell(page)
            })

            // 12
            test('forventer jeg at AFP ikke vises i graf og tabell.', async ({
              page,
            }) => {
              await page.getByRole('button', { name: /Vis tabell/i }).click()
              await expect(
                page.getByRole('columnheader', {
                  name: /AFP \(avtalefestet pensjon\)/i,
                })
              ).toHaveCount(0)
            })

            // 13
            test('forventer jeg informasjon i «Pensjonsavtaler - Offentlig tjenestepensjon» om hva jeg får i alderspensjon fra Statens Pensjonskasse.', async ({
              page,
            }) => {
              await expect(
                page.getByRole('heading', {
                  name: /Offentlig tjenestepensjon/i,
                })
              ).toBeVisible()
              const spkRow = page.getByRole('rowheader', {
                name: /Statens pensjonskasse/i,
              })
              await expect(spkRow).toBeVisible()
              const offtpTable = page.locator('table').filter({ has: spkRow })
              await expect(
                offtpTable.getByRole('cell', { name: /Fra 67 år til 69 år/i })
              ).toBeVisible()
              await expect(
                offtpTable.getByRole('cell', { name: /Fra 70 år til 74 år/i })
              ).toBeVisible()
              await expect(
                offtpTable.getByRole('cell', { name: /Livsvarig fra 75 år/i })
              ).toBeVisible()
            })

            // 14
            test('forventer jeg informasjon om at jeg ikke har rett til livsvarig AFP.', async ({
              page,
            }) => {
              await expect(
                page.getByText(
                  /Du har oppgitt at du ikke har rett til livsvarig AFP\./i
                )
              ).toBeVisible()
            })
          })
        })
      })

      test.describe('Som bruker som har svart "vet_ikke" på AFP,', () => {
        // 5
        test.describe('Som bruker som har rett til Betinget tjenestepensjon,', () => {
          test.use({ autoAuth: false })

          test.beforeEach(async ({ page }) => {
            await authenticate(page, [await offentligTp({ preset: 'spk' })])
            await fillOutStegvisning(page, {
              afp: 'vet_ikke',
              samtykke: true,
              navigateTo: 'beregning',
            })
          })

          test.describe('Når jeg er kommet til beregningssiden og har valgt alder jeg ønsker beregning fra,', () => {
            test.beforeEach(async ({ page }) => {
              await clickUttaksalderAndWait(page, '62 år og 10 md.')
            })

            // 15
            test('forventer jeg at pensjonsavtaler vises i graf og tabell.', async ({
              page,
            }) => {
              await expectPensjonsavtalerIGrafOgTabell(page)
            })

            // 16
            test('forventer jeg at AFP ikke vises i graf og tabell.', async ({
              page,
            }) => {
              await page.getByRole('button', { name: /Vis tabell/i }).click()
              await expect(
                page.getByRole('columnheader', {
                  name: /AFP \(avtalefestet pensjon\)/i,
                })
              ).toHaveCount(0)
            })

            // 17
            test('forventer jeg informasjon i «Pensjonsavtaler - Offentlig tjenestepensjon» om hva jeg får i alderspensjon fra Statens Pensjonskasse.', async ({
              page,
            }) => {
              await expect(
                page.getByRole('heading', {
                  name: /Offentlig tjenestepensjon/i,
                })
              ).toBeVisible()
              const spkRow = page.getByRole('rowheader', {
                name: /Statens pensjonskasse/i,
              })
              await expect(spkRow).toBeVisible()
              const offtpTable = page.locator('table').filter({ has: spkRow })
              await expect(
                offtpTable.getByRole('cell', { name: /Fra 67 år til 69 år/i })
              ).toBeVisible()
              await expect(
                offtpTable.getByRole('cell', { name: /Fra 70 år til 74 år/i })
              ).toBeVisible()
              await expect(
                offtpTable.getByRole('cell', { name: /Livsvarig fra 75 år/i })
              ).toBeVisible()
            })

            // 18
            test('forventer jeg informasjon om at Betinget tjenestepensjon kan være inkludert.', async ({
              page,
            }) => {
              await expect(
                page.getByText(
                  /Du har oppgitt at du ikke vet om du har rett til livsvarig AFP.*Beløpet kan derfor inkludere betinget tjenestepensjon/i
                )
              ).toBeVisible()
            })
          })
        })

        // 6
        test.describe('Som bruker som ikke har rett til Betinget tjenestepensjon,', () => {
          test.use({ autoAuth: false })

          test.beforeEach(async ({ page }) => {
            await authenticate(page, [
              await offentligTp({ preset: 'spk_uten_betinget' }),
            ])
            await fillOutStegvisning(page, {
              afp: 'vet_ikke',
              samtykke: true,
              navigateTo: 'beregning',
            })
          })

          test.describe('Når jeg er kommet til beregningssiden og har valgt alder jeg ønsker beregning fra,', () => {
            test.beforeEach(async ({ page }) => {
              await clickUttaksalderAndWait(page, '62 år og 10 md.')
            })

            // 19
            test('forventer jeg at pensjonsavtaler vises i graf og tabell.', async ({
              page,
            }) => {
              await expectPensjonsavtalerIGrafOgTabell(page)
            })

            // 20
            test('forventer jeg at AFP ikke vises i graf og tabell.', async ({
              page,
            }) => {
              await page.getByRole('button', { name: /Vis tabell/i }).click()
              await expect(
                page.getByRole('columnheader', {
                  name: /AFP \(avtalefestet pensjon\)/i,
                })
              ).toHaveCount(0)
            })

            // 21
            test('forventer jeg informasjon i «Pensjonsavtaler - Offentlig tjenestepensjon» om hva jeg får i alderspensjon fra Statens Pensjonskasse.', async ({
              page,
            }) => {
              await expect(
                page.getByRole('heading', {
                  name: /Offentlig tjenestepensjon/i,
                })
              ).toBeVisible()
              const spkRow = page.getByRole('rowheader', {
                name: /Statens pensjonskasse/i,
              })
              await expect(spkRow).toBeVisible()
              const offtpTable = page.locator('table').filter({ has: spkRow })
              await expect(
                offtpTable.getByRole('cell', { name: /Fra 67 år til 69 år/i })
              ).toBeVisible()
              await expect(
                offtpTable.getByRole('cell', { name: /Fra 70 år til 74 år/i })
              ).toBeVisible()
              await expect(
                offtpTable.getByRole('cell', { name: /Livsvarig fra 75 år/i })
              ).toBeVisible()
            })

            // 22
            test('forventer jeg informasjon om at jeg ikke har rett til livsvarig AFP.', async ({
              page,
            }) => {
              await expect(
                page.getByText(
                  /Du har oppgitt at du ikke vet om du har rett til livsvarig AFP.*Beløpet kan derfor inkludere betinget tjenestepensjon\./i
                )
              ).toBeVisible()
            })
          })
        })
      })
    })

    test.describe('Som bruker som har TPO forhold hos KLP,', () => {
      // 8
      test.describe('Som bruker som har svart "ja" på Livsvarig AFP offentlig,', () => {
        test.use({ autoAuth: false })

        test.beforeEach(async ({ page }) => {
          await authenticate(page, [
            await offentligTp({ preset: 'klp' }),
            await alderspensjon({ preset: 'med_afp_offentlig' }),
          ])
          await fillOutStegvisning(page, {
            afp: 'ja_offentlig',
            samtykkeAfpOffentlig: true,
            samtykke: true,
            navigateTo: 'beregning',
          })
        })

        test.describe('Når jeg er kommet til beregningssiden og har valgt alder jeg ønsker beregning fra,', () => {
          test.beforeEach(async ({ page }) => {
            await clickUttaksalderAndWait(page, '62 år og 10 md.')
          })

          // 23
          test('forventer jeg at AFP og pensjonsavtaler vises i graf og tabell.', async ({
            page,
          }) => {
            await expectAfpOgPensjonsavtalerIGrafOgTabell(page)
          })

          // 24
          test('forventer jeg informasjon i «Pensjonsavtaler - Offentlig tjenestepensjon» om hva jeg får i alderspensjon fra Kommunal Landspensjonskasse.', async ({
            page,
          }) => {
            await expect(
              page.getByRole('heading', { name: /Offentlig tjenestepensjon/i })
            ).toBeVisible()
            const klpRow = page.getByRole('rowheader', {
              name: /Kommunal Landspensjonskasse/i,
            })
            await expect(klpRow).toBeVisible()
            const offtpTable = page.locator('table').filter({ has: klpRow })
            await expect(
              offtpTable.getByRole('cell', { name: /Fra 67 år til 71 år/i })
            ).toBeVisible()
            await expect(
              offtpTable.getByRole('cell', { name: /Livsvarig fra 72 år/i })
            ).toBeVisible()
          })

          // 25
          test('forventer jeg informasjon om at Livsvarig AFP eller eventuell betinget tjenestepensjon ikke er inkludert.', async ({
            page,
          }) => {
            await expect(
              page.getByText(
                /Livsvarig AFP eller eventuell betinget tjenestepensjon er ikke inkludert i dette beløpet/i
              )
            ).toBeVisible()
          })
        })
      })

      // 9
      test.describe('Som bruker som har svart "ja" på AFP privat,', () => {
        test.use({ autoAuth: false })

        test.beforeEach(async ({ page }) => {
          await authenticate(page, [await offentligTp({ preset: 'klp' })])
          await fillOutStegvisning(page, {
            afp: 'ja_privat',
            samtykke: true,
            navigateTo: 'beregning',
          })
        })

        test.describe('Når jeg er kommet til beregningssiden og har valgt alder jeg ønsker beregning fra,', () => {
          test.beforeEach(async ({ page }) => {
            await clickUttaksalderAndWait(page, '62 år og 10 md.')
          })

          // 26
          test('forventer jeg at AFP og pensjonsavtaler vises i graf og tabell.', async ({
            page,
          }) => {
            await expectAfpOgPensjonsavtalerIGrafOgTabell(page)
          })

          // 27
          test('forventer jeg informasjon i «Pensjonsavtaler - Offentlig tjenestepensjon» om hva jeg får i alderspensjon fra Kommunal Landspensjonskasse.', async ({
            page,
          }) => {
            await expect(
              page.getByRole('heading', { name: /Offentlig tjenestepensjon/i })
            ).toBeVisible()
            const klpRow = page.getByRole('rowheader', {
              name: /Kommunal Landspensjonskasse/i,
            })
            await expect(klpRow).toBeVisible()
            const offtpTable = page.locator('table').filter({ has: klpRow })
            await expect(
              offtpTable.getByRole('cell', { name: /Fra 67 år til 71 år/i })
            ).toBeVisible()
            await expect(
              offtpTable.getByRole('cell', { name: /Livsvarig fra 72 år/i })
            ).toBeVisible()
          })

          // 28
          test('forventer jeg informasjon om at Livsvarig AFP eller eventuell betinget tjenestepensjon ikke er inkludert.', async ({
            page,
          }) => {
            await expect(
              page.getByText(
                /Livsvarig AFP eller eventuell betinget tjenestepensjon er ikke inkludert i dette beløpet/i
              )
            ).toBeVisible()
          })
        })
      })

      // 10
      test.describe('Som bruker som har svart "nei" på AFP,', () => {
        test.use({ autoAuth: false })

        test.beforeEach(async ({ page }) => {
          await authenticate(page, [await offentligTp({ preset: 'klp' })])
          await fillOutStegvisning(page, {
            afp: 'nei',
            samtykke: true,
            navigateTo: 'beregning',
          })
        })

        test.describe('Når jeg er kommet til beregningssiden og har valgt alder jeg ønsker beregning fra,', () => {
          test.beforeEach(async ({ page }) => {
            await clickUttaksalderAndWait(page, '62 år og 10 md.')
          })

          // 29
          test('forventer jeg at pensjonsavtaler vises i graf og tabell.', async ({
            page,
          }) => {
            await expectPensjonsavtalerIGrafOgTabell(page)
          })

          // 30
          test('forventer jeg at AFP ikke vises i graf og tabell.', async ({
            page,
          }) => {
            await page.getByRole('button', { name: /Vis tabell/i }).click()
            await expect(
              page.getByRole('columnheader', {
                name: /AFP \(avtalefestet pensjon\)/i,
              })
            ).toHaveCount(0)
          })

          // 31
          test('forventer jeg informasjon i «Pensjonsavtaler - Offentlig tjenestepensjon» om hva jeg får i alderspensjon fra Kommunal Landspensjonskasse.', async ({
            page,
          }) => {
            await expect(
              page.getByRole('heading', { name: /Offentlig tjenestepensjon/i })
            ).toBeVisible()
            const klpRow = page.getByRole('rowheader', {
              name: /Kommunal Landspensjonskasse/i,
            })
            await expect(klpRow).toBeVisible()
            const offtpTable = page.locator('table').filter({ has: klpRow })
            await expect(
              offtpTable.getByRole('cell', { name: /Fra 67 år til 71 år/i })
            ).toBeVisible()
            await expect(
              offtpTable.getByRole('cell', { name: /Livsvarig fra 72 år/i })
            ).toBeVisible()
          })

          // 32
          test('forventer jeg informasjon om at jeg ikke har oppgitt å ha rett til livsvarig AFP.', async ({
            page,
          }) => {
            await expect(
              page.getByText(
                /Du har ikke oppgitt at du har rett til livsvarig AFP/i
              )
            ).toBeVisible()
          })
        })
      })

      // 11
      test.describe('Som bruker som har svart "vet_ikke" på AFP,', () => {
        test.use({ autoAuth: false })

        test.beforeEach(async ({ page }) => {
          await authenticate(page, [await offentligTp({ preset: 'klp' })])
          await fillOutStegvisning(page, {
            afp: 'vet_ikke',
            samtykke: true,
            navigateTo: 'beregning',
          })
        })

        test.describe('Når jeg er kommet til beregningssiden og har valgt alder jeg ønsker beregning fra,', () => {
          test.beforeEach(async ({ page }) => {
            await clickUttaksalderAndWait(page, '62 år og 10 md.')
          })

          // 33
          test('forventer jeg at pensjonsavtaler vises i graf og tabell.', async ({
            page,
          }) => {
            await expectPensjonsavtalerIGrafOgTabell(page)
          })

          // 34
          test('forventer jeg at AFP ikke vises i graf og tabell.', async ({
            page,
          }) => {
            await page.getByRole('button', { name: /Vis tabell/i }).click()
            await expect(
              page.getByRole('columnheader', {
                name: /AFP \(avtalefestet pensjon\)/i,
              })
            ).toHaveCount(0)
          })

          // 35
          test('forventer jeg informasjon i «Pensjonsavtaler - Offentlig tjenestepensjon» om hva jeg får i alderspensjon fra Kommunal Landspensjonskasse.', async ({
            page,
          }) => {
            await expect(
              page.getByRole('heading', { name: /Offentlig tjenestepensjon/i })
            ).toBeVisible()
            const klpRow = page.getByRole('rowheader', {
              name: /Kommunal Landspensjonskasse/i,
            })
            await expect(klpRow).toBeVisible()
            const offtpTable = page.locator('table').filter({ has: klpRow })
            await expect(
              offtpTable.getByRole('cell', { name: /Fra 67 år til 71 år/i })
            ).toBeVisible()
            await expect(
              offtpTable.getByRole('cell', { name: /Livsvarig fra 72 år/i })
            ).toBeVisible()
          })

          // 36
          test('forventer jeg informasjon om at jeg ikke har oppgitt å ha rett til livsvarig AFP.', async ({
            page,
          }) => {
            await expect(
              page.getByText(
                /Du har ikke oppgitt at du har rett til livsvarig AFP/i
              )
            ).toBeVisible()
          })
        })
      })
    })

    // 13
    test.describe('Som bruker som har TPO forhold hos en ikke støttet ordning', () => {
      test.use({ autoAuth: false })

      test.beforeEach(async ({ page }) => {
        await authenticate(page, [
          await pensjonsavtaler({ avtaler: [], utilgjengeligeSelskap: [] }),
          await offentligTp({
            preset: 'unsupported',
            unsupportedProviders: ['Oslo Pensjonsforsikring'],
          }),
        ])
        await fillOutStegvisning(page, {
          afp: 'vet_ikke',
          samtykke: true,
          navigateTo: 'beregning',
        })
      })

      test.describe('Når jeg er kommet til beregningssiden og har valgt alder jeg ønsker beregning fra,', () => {
        test.beforeEach(async ({ page }) => {
          await clickUttaksalderAndWait(page, '62 år og 10 md.')
        })

        // 37
        test('forventer jeg at pensjonsavtaler ikke vises i graf eller tabell.', async ({
          page,
        }) => {
          await expectIkkePensjonsavtalerIGrafOgTabell(page)
        })

        // 38
        test('forventer jeg en informasjonsmelding om at beregningen kanskje ikke viser alt.', async ({
          page,
        }) => {
          await expect(
            page.getByText(
              /Beregningen viser kanskje ikke alt.*Du kan ha rett til offentlig tjenestepensjon/i
            )
          ).toBeVisible()
        })

        // 39
        test('forventer jeg informasjon i «Pensjonsavtaler - Offentlig tjenestepensjon» om at jeg er eller har vært ansatt i offentlig sektor, men at avtalene ikke er hentet.', async ({
          page,
        }) => {
          await expect(
            page.getByRole('heading', { name: /Offentlig tjenestepensjon/i })
          ).toBeVisible()
          await expect(
            page.getByText(
              /Du er eller har vært ansatt i offentlig sektor.*kan dessverre ikke hente inn offentlige pensjonsavtaler.*Oslo Pensjonsforsikring/i
            )
          ).toBeVisible()
        })
      })
    })

    // 14
    test.describe('Som bruker som ikke har noe TPO forhold', () => {
      test.use({ autoAuth: false })

      test.beforeEach(async ({ page }) => {
        await authenticate(page, [
          await pensjonsavtaler({ avtaler: [], utilgjengeligeSelskap: [] }),
          await offentligTp({ preset: 'no_membership' }),
        ])
        await fillOutStegvisning(page, {
          afp: 'vet_ikke',
          samtykke: true,
          navigateTo: 'beregning',
        })
      })

      test.describe('Når jeg er kommet til beregningssiden og har valgt alder jeg ønsker beregning fra,', () => {
        test.beforeEach(async ({ page }) => {
          await clickUttaksalderAndWait(page, '62 år og 10 md.')
        })

        // 40
        test('forventer jeg at pensjonsavtaler ikke vises i graf eller tabell.', async ({
          page,
        }) => {
          await expectIkkePensjonsavtalerIGrafOgTabell(page)
        })

        // 41
        test('forventer jeg informasjon i «Pensjonsavtaler - Offentlig tjenestepensjon» om at ingen pensjonsavtale ble funnet.', async ({
          page,
        }) => {
          await expect(
            page.getByRole('heading', { name: /Offentlig tjenestepensjon/i })
          ).toBeVisible()
          await expect(
            page.getByTestId('ingen-pensjonsavtaler-alert')
          ).toBeVisible()
        })
      })
    })

    // 16
    test.describe('Når kall til TP-registret feiler', () => {
      test.use({ autoAuth: false })

      test.beforeEach(async ({ page }) => {
        await authenticate(page, [
          await pensjonsavtaler({ avtaler: [], utilgjengeligeSelskap: [] }),
          await offentligTp({ preset: 'server_error' }),
        ])
        await fillOutStegvisning(page, {
          afp: 'vet_ikke',
          samtykke: true,
          navigateTo: 'beregning',
        })
      })

      test.describe('Når jeg er kommet til beregningssiden og har valgt alder jeg ønsker beregning fra,', () => {
        test.beforeEach(async ({ page }) => {
          await clickUttaksalderAndWait(page, '62 år og 10 md.')
        })

        // 42
        test('forventer jeg at pensjonsavtaler ikke vises i graf eller tabell.', async ({
          page,
        }) => {
          await expectIkkePensjonsavtalerIGrafOgTabell(page)
        })

        // 43
        test('forventer jeg en alert om at noe gikk galt ved henting av pensjonsavtaler i offentlig sektor.', async ({
          page,
        }) => {
          await expect(
            page.getByText(
              /Beregningen viser kanskje ikke alt.*Noe gikk galt ved henting av pensjonsavtaler i offentlig sektor/i
            )
          ).toBeVisible()
        })

        // 44
        test('forventer jeg informasjon i «Pensjonsavtaler - Offentlig tjenestepensjon» om at Nav ikke klarte å hente min offentlige tjenestepensjon.', async ({
          page,
        }) => {
          await expect(
            page.getByRole('heading', { name: /Offentlig tjenestepensjon/i })
          ).toBeVisible()
          await expect(
            page.getByText(
              /Vi klarte ikke å sjekke om du har offentlige pensjonsavtaler/i
            )
          ).toBeVisible()
        })
      })
    })

    // 17
    test.describe('Som bruker som har TPO forhold hos en støttet ordning som svarer med teknisk feil', () => {
      test.use({ autoAuth: false })

      test.beforeEach(async ({ page }) => {
        await authenticate(page, [
          await pensjonsavtaler({ avtaler: [], utilgjengeligeSelskap: [] }),
          await offentligTp({ preset: 'technical_error' }),
        ])
        await fillOutStegvisning(page, {
          afp: 'vet_ikke',
          samtykke: true,
          navigateTo: 'beregning',
        })
      })

      test.describe('Når jeg er kommet til beregningssiden og har valgt alder jeg ønsker beregning fra,', () => {
        test.beforeEach(async ({ page }) => {
          await clickUttaksalderAndWait(page, '62 år og 10 md.')
        })

        // 45
        test('forventer jeg at pensjonsavtaler ikke vises i graf eller tabell.', async ({
          page,
        }) => {
          await expectIkkePensjonsavtalerIGrafOgTabell(page)
        })

        // 46
        test('forventer jeg en alert om at noe gikk galt ved henting av pensjonsavtaler i offentlig sektor.', async ({
          page,
        }) => {
          await expect(page.getByTestId('pensjonsavtaler-alert')).toBeVisible()
        })

        // 47
        test('forventer jeg informasjon i «Pensjonsavtaler - Offentlig tjenestepensjon» om at Nav ikke klarte å hente min offentlige tjenestepensjon.', async ({
          page,
        }) => {
          await expect(
            page.getByRole('heading', { name: /Offentlig tjenestepensjon/i })
          ).toBeVisible()
          await expect(
            page.getByText(
              /Vi klarte ikke å hente din offentlige tjenestepensjon.*Prøv igjen senere/i
            )
          ).toBeVisible()
        })
      })
    })

    test.describe('Som bruker som har TPO forhold hos en støttet ordning som svarer med tom respons feil', () => {
      test.use({ autoAuth: false })

      test.beforeEach(async ({ page }) => {
        await authenticate(page, [
          await pensjonsavtaler({ avtaler: [], utilgjengeligeSelskap: [] }),
          await offentligTp({ preset: 'empty_response' }),
        ])
        await fillOutStegvisning(page, {
          afp: 'vet_ikke',
          samtykke: true,
          navigateTo: 'beregning',
        })
      })

      test.describe('Når jeg er kommet til beregningssiden og har valgt alder jeg ønsker beregning fra,', () => {
        test.beforeEach(async ({ page }) => {
          await clickUttaksalderAndWait(page, '62 år og 10 md.')
        })

        // 48
        test('forventer jeg at pensjonsavtaler ikke vises i graf eller tabell.', async ({
          page,
        }) => {
          await expectIkkePensjonsavtalerIGrafOgTabell(page)
        })

        // 49
        test('forventer jeg en alert om at noe gikk galt ved henting av pensjonsavtaler i offentlig sektor.', async ({
          page,
        }) => {
          await expect(page.getByTestId('pensjonsavtaler-alert')).toBeVisible()
        })

        // 50
        test('forventer jeg informasjon i «Pensjonsavtaler - Offentlig tjenestepensjon» om at Nav ikke fikk svar fra min offentlige tjenestepensjonsordning.', async ({
          page,
        }) => {
          await expect(
            page.getByRole('heading', { name: /Offentlig tjenestepensjon/i })
          ).toBeVisible()
          await expect(
            page.getByText(
              /Vi fikk ikke svar fra din offentlige tjenestepensjonsordning/i
            )
          ).toBeVisible()
        })
      })
    })
  })

  test.describe('Som bruker som er født før 1963 og har samtykket til innhenting av avtaler,', () => {
    test.describe('Som bruker som har TPO-forhold', () => {
      test.use({ autoAuth: false })

      test.beforeEach(async ({ page }) => {
        await authenticate(page, [
          await person({ alder: { aar: 65 } }),
          await offentligTp({
            preset: 'unsupported',
            unsupportedProviders: [
              'Statens pensjonskasse',
              'Kommunal Landspensjonskasse',
            ],
          }),
          await pensjonsavtaler({ avtaler: [], utilgjengeligeSelskap: [] }),
        ])
        await fillOutStegvisning(page, {
          afp: 'vet_ikke',
          samtykke: true,
          navigateTo: 'beregning',
        })
        await clickUttaksalderAndWait(page, '67 år')
      })

      // 51
      test('forventer jeg informasjon i alert under Pensjonsavtaler om hvilke TP-ordninger jeg er medlem av.', async ({
        page,
      }) => {
        await expect(page.getByTestId('pensjonsavtaler-alert')).toBeVisible()
      })
    })

    test.describe('Som bruker som ikke har TPO-forhold', () => {
      test.use({ autoAuth: false })

      test.beforeEach(async ({ page }) => {
        await authenticate(page, [
          await person({ alder: { aar: 65 } }),
          await offentligTp({ preset: 'no_membership' }),
          await pensjonsavtaler({ avtaler: [], utilgjengeligeSelskap: [] }),
        ])
        await fillOutStegvisning(page, {
          afp: 'vet_ikke',
          samtykke: true,
          navigateTo: 'beregning',
        })
        await clickUttaksalderAndWait(page, '67 år')
      })

      // 52
      test('forventer jeg informasjon i alert under Pensjonsavtaler om at ingen avtaler ble funnet.', async ({
        page,
      }) => {
        await expect(
          page.getByTestId('ingen-pensjonsavtaler-alert')
        ).toBeVisible()
      })
    })
  })
})
