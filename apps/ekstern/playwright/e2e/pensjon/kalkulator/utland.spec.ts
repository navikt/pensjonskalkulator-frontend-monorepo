import type { Page } from '@playwright/test'
import { expect, test } from 'base'
import { authenticate } from 'utils/auth'
import { alderspensjon } from 'utils/mocks'
import { fillOutStegvisning } from 'utils/navigation'

async function checkForErrorPage(page: Page): Promise<string | null> {
  const errorHeading = page.getByTestId('error.global.title')
  const errorExists = await errorHeading.isVisible().catch(() => false)
  if (errorExists) {
    const errorText = await errorHeading.textContent().catch(() => null)
    return errorText || 'Error page detected'
  }
  return null
}

async function selectHarUtenlandsoppholdRadio(page: Page, value: 'ja' | 'nei') {
  await test.step(`Select har utenlandsopphold: ${value}`, async () => {
    const radio = page.locator(
      `input[type="radio"][name="har-utenlandsopphold-radio"][value="${value}"]`
    )
    await radio.check()
    await expect(radio).toBeChecked()
  })
}

async function openAddUtenlandsoppholdModal(page: Page) {
  await test.step('Open add utenlandsopphold modal', async () => {
    await page.getByTestId('legg-til-utenlandsopphold').click()
    await expect(
      page.getByRole('dialog', { name: 'Om oppholdet ditt' })
    ).toBeVisible()
  })
}

async function selectLand(page: Page, landkode: string) {
  await test.step(`Select land: ${landkode}`, async () => {
    const landSelect = page.getByTestId('utenlandsopphold-land')
    await landSelect.selectOption(landkode)
    await expect(landSelect).toHaveValue(landkode)
  })
}

async function selectArbeidetUtenlands(page: Page, value: 'ja' | 'nei') {
  await test.step(`Select arbeidet utenlands: ${value}`, async () => {
    const radio = page.getByTestId(
      `utenlandsopphold-arbeidet-utenlands-${value}`
    )
    await radio.check()
    await expect(radio).toBeChecked()
  })
}

async function fillStartdato(page: Page, dato: string) {
  await test.step(`Fill startdato: ${dato}`, async () => {
    const input = page.getByTestId('utenlandsopphold-startdato')
    await input.fill(dato)
  })
}

async function fillSluttdato(page: Page, dato: string) {
  await test.step(`Fill sluttdato: ${dato}`, async () => {
    const input = page.getByTestId('utenlandsopphold-sluttdato')
    await input.fill(dato)
  })
}

async function submitUtenlandsopphold(page: Page) {
  await test.step('Submit utenlandsopphold', async () => {
    await page.getByTestId('legg-til-utenlandsopphold-submit').click()
  })
}

async function cancelUtenlandsopphold(page: Page) {
  await test.step('Cancel utenlandsopphold', async () => {
    await page.getByTestId('legg-til-utenlandsopphold-avbryt').click()
  })
}

async function addUtenlandsopphold(
  page: Page,
  options: {
    landkode: string
    arbeidetUtenlands?: 'ja' | 'nei'
    startdato: string
    sluttdato?: string
  }
) {
  await test.step(`Add utenlandsopphold: ${options.landkode}`, async () => {
    await openAddUtenlandsoppholdModal(page)
    await selectLand(page, options.landkode)
    if (options.arbeidetUtenlands) {
      await selectArbeidetUtenlands(page, options.arbeidetUtenlands)
    }
    await fillStartdato(page, options.startdato)
    if (options.sluttdato) {
      await fillSluttdato(page, options.sluttdato)
    }
    await submitUtenlandsopphold(page)
    await expect(
      page.getByRole('dialog', { name: 'Om oppholdet ditt' })
    ).toBeHidden()
  })
}

async function clickNeste(page: Page, expectedUrl?: RegExp) {
  await test.step('Click "Neste" button', async () => {
    const button = page.getByTestId('stegvisning-neste-button')
    const errorBeforeClick = await checkForErrorPage(page)
    if (errorBeforeClick) {
      throw new Error(
        `Error page detected before clicking next: ${errorBeforeClick}`
      )
    }
    await button.click()
    if (expectedUrl) {
      await expect(page).toHaveURL(expectedUrl)
      const errorAfterNav = await checkForErrorPage(page)
      if (errorAfterNav) {
        throw new Error(
          `Error page detected after navigation: ${errorAfterNav}`
        )
      }
    }
  })
}

async function selectUttaksalder(page: Page, alder: number) {
  await test.step(`Select uttaksalder: ${alder} år`, async () => {
    const alderButton = page.getByRole('button', { name: `${alder} år` })
    await alderButton.click()
    await expect(page.getByTestId('highcharts-done-drawing')).toBeVisible()
  })
}

async function selectAfpRadio(
  page: Page,
  value: 'ja_privat' | 'ja_offentlig' | 'nei' | 'vet_ikke'
) {
  await test.step(`Select AFP: ${value}`, async () => {
    const radioValue = {
      ja_privat: 'ja_privat',
      ja_offentlig: 'ja_offentlig',
      nei: 'nei',
      vet_ikke: 'vet_ikke',
    }[value]
    await page.locator(`input[name="afp"][value="${radioValue}"]`).check()
  })
}

async function selectSamtykkeRadio(page: Page, value: 'ja' | 'nei') {
  await test.step(`Select samtykke: ${value}`, async () => {
    await page.locator(`input[name="samtykke"][value="${value}"]`).check()
  })
}

async function navigateFromUtenlandsoppholdToBeregning(
  page: Page,
  options: {
    afp: 'nei' | 'ja_privat' | 'ja_offentlig' | 'vet_ikke'
    samtykke: boolean
  }
) {
  await test.step('Navigate from utenlandsopphold to beregning', async () => {
    await page.getByTestId('stegvisning-neste-button').click()
    await page.waitForURL(/\/afp/)

    await page.locator(`input[name="afp"][value="${options.afp}"]`).check()
    await page.getByTestId('stegvisning-neste-button').click()
    await page.waitForURL(/\/samtykke/)

    const samtykkeValue = options.samtykke ? 'ja' : 'nei'
    await page
      .locator(`input[name="samtykke"][value="${samtykkeValue}"]`)
      .check()
    await page.getByTestId('stegvisning-neste-button').click()
    await page.waitForURL(/\/beregning/)

    const errorPage = await checkForErrorPage(page)
    if (errorPage) {
      throw new Error(
        `Error page detected after navigating to beregning: ${errorPage}`
      )
    }
  })
}

test.describe('Utland', () => {
  test.describe('Som bruker som har logget inn på kalkulatoren,', () => {
    test.beforeEach(async ({ page }) => {
      await fillOutStegvisning(page, { navigateTo: 'utenlandsopphold' })
    })

    test.describe('Når jeg har navigert til steget for utenlandsopphold,', () => {
      // 1
      test('forventer jeg å bli spurt om jeg har bodd/jobbet mer enn 5 år utenfor Norge.', async ({
        page,
      }) => {
        await expect(
          page.getByTestId('stegvisning.utenlandsopphold.title')
        ).toBeVisible()
        await expect(
          page.getByTestId('stegvisning.utenlandsopphold.radio_label')
        ).toBeVisible()
      })

      // 2
      test('forventer jeg ikke å få en knapp for å legge til opphold.', async ({
        page,
      }) => {
        await expect(
          page.getByTestId('legg-til-utenlandsopphold')
        ).not.toBeVisible()
      })
    })

    test.describe('Når jeg har svart "ja" på spørsmål om jeg har bodd eller jobbet mer enn 5 år utenfor Norge,', () => {
      // 3
      test('forventer jeg å få en knapp for å legge til opphold.', async ({
        page,
      }) => {
        await selectHarUtenlandsoppholdRadio(page, 'ja')
        await expect(
          page.getByTestId('legg-til-utenlandsopphold')
        ).toBeVisible()
      })
    })

    test.describe('Som bruker som svarer "ja" på mer enn 5 år i utlandet,', () => {
      test.beforeEach(async ({ page }) => {
        await selectHarUtenlandsoppholdRadio(page, 'ja')
      })

      test.describe('Når jeg trykker «neste» uten å legge til opphold,', () => {
        // 4
        test('forventer jeg beskjed om at jeg må legge til minst ett opphold, eller svare nei.', async ({
          page,
        }) => {
          await clickNeste(page)
          await expect(page.getByRole('alert')).toBeVisible()
        })
      })

      test.describe('Når jeg trykker på "legg til opphold",', () => {
        test.beforeEach(async ({ page }) => {
          await openAddUtenlandsoppholdModal(page)
        })

        // 5
        test('forventer jeg å kunne velge land fra liste/nedtrekksmeny.', async ({
          page,
        }) => {
          const landSelect = page.getByTestId('utenlandsopphold-land')
          await expect(landSelect).toBeVisible()
          const options = landSelect.locator('option')
          await expect(options).toHaveCount(257)
        })

        test.describe('Når jeg har valgt land jeg har bodd eller jobbet i, og landet er ett avtaleland, unntatt nordiske land og Nederland,', () => {
          test.beforeEach(async ({ page }) => {
            await selectLand(page, 'FRA')
          })

          // 6
          test('forventer jeg å kunne velge om jeg jobbet i landet eller ikke.', async ({
            page,
          }) => {
            await expect(
              page.getByTestId('utenlandsopphold-arbeidet-utenlands')
            ).toBeVisible()
          })

          // 7
          test('forventer jeg å kunne oppgi startdato og sluttdato for oppholdet.', async ({
            page,
          }) => {
            await expect(
              page.getByTestId('utenlandsopphold-startdato')
            ).toBeVisible()
            await fillStartdato(page, '12.01.1990')
            await expect(
              page.getByTestId('utenlandsopphold-sluttdato')
            ).toBeVisible()
          })

          // 8
          test('forventer jeg å kunne trykke på «legg til opphold» og registrere opphold med eller uten sluttdato.', async ({
            page,
          }) => {
            await selectArbeidetUtenlands(page, 'ja')
            await fillStartdato(page, '12.01.1990')
            await fillSluttdato(page, '31.12.1992')
            // Clear sluttdato to test without it
            await page.getByTestId('utenlandsopphold-sluttdato').clear()
            await submitUtenlandsopphold(page)
            await expect(
              page.getByRole('dialog', { name: 'Om oppholdet ditt' })
            ).toBeHidden()
          })
        })

        test.describe('Når jeg har valgt land jeg har bodd eller jobbet i, og landet er ett ikke avtaleland, unntatt nordiske land og Nederland,', () => {
          test.beforeEach(async ({ page }) => {
            await selectLand(page, 'AFG')
          })

          // 9
          test('forventer jeg å ikke få spørsmål om jeg har jobbet i landet.', async ({
            page,
          }) => {
            await expect(
              page.getByTestId('utenlandsopphold-arbeidet-utenlands')
            ).not.toBeVisible()
          })

          // 10
          test('forventer jeg å kunne oppgi startdato og sluttdato for oppholdet.', async ({
            page,
          }) => {
            await expect(
              page.getByTestId('utenlandsopphold-startdato')
            ).toBeVisible()
            await fillStartdato(page, '12.01.1990')
            await expect(
              page.getByTestId('utenlandsopphold-sluttdato')
            ).toBeVisible()
          })

          // 11
          test('forventer jeg å kunne trykke på «legg til opphold» og registrere opphold med eller uten sluttdato.', async ({
            page,
          }) => {
            await fillStartdato(page, '12.01.1990')
            await fillSluttdato(page, '31.12.1992')
            await page.getByTestId('utenlandsopphold-sluttdato').clear()
            await submitUtenlandsopphold(page)
            await expect(
              page.getByRole('dialog', { name: 'Om oppholdet ditt' })
            ).toBeHidden()
          })
        })
      })

      test.describe('Når jeg har lagt til utenlandsopphold,', () => {
        test.beforeEach(async ({ page }) => {
          await addUtenlandsopphold(page, {
            landkode: 'FRA',
            arbeidetUtenlands: 'nei',
            startdato: '01.06.1980',
            sluttdato: '31.12.1982',
          })
        })

        // 12
        test('forventer jeg å få en tabell/liste over utenlandsopphold jeg har lagt til.', async ({
          page,
        }) => {
          await expect(page.getByTestId('utenlandsperiode-liste')).toBeVisible()
          await expect(
            page.getByRole('definition').filter({ hasText: 'Frankrike' })
          ).toBeVisible()
          await expect(
            page
              .getByRole('definition')
              .filter({ hasText: '01.06.1980–31.12.1982' })
          ).toBeVisible()
        })

        // 13
        test('forventer jeg å kunne endre eller slette oppholdet.', async ({
          page,
        }) => {
          await expect(page.getByTestId('endre-utenlandsopphold')).toBeVisible()
          await expect(page.getByTestId('slett-utenlandsopphold')).toBeVisible()
        })

        // 14
        test('forventer jeg at knappen har endret seg fra "legg til opphold" til "legg til nytt opphold".', async ({
          page,
        }) => {
          const leggTilButton = page.getByTestId('legg-til-utenlandsopphold')
          await expect(leggTilButton).toBeVisible()
          await expect(leggTilButton).toHaveText(/Legg til nytt opphold/i)
        })

        // 15
        test('forventer jeg å kunne gå videre til neste steg.', async ({
          page,
        }) => {
          await clickNeste(page, /\/afp$/)
          await expect(page.getByTestId('stegvisning.afp.title')).toBeVisible()
        })
      })

      test.describe('Som bruker som har allerede lagt til et utenlandsopphold,', () => {
        test.beforeEach(async ({ page }) => {
          await addUtenlandsopphold(page, {
            landkode: 'FRA',
            arbeidetUtenlands: 'nei',
            startdato: '10.06.1980',
            sluttdato: '16.12.1982',
          })
        })

        test.describe('Når jeg legger til et overlappende utenlandsopphold i et annet land,', () => {
          // 16
          test('forventer jeg feilmelding om at jeg ikke kan ha overlappende opphold med to ulike land.', async ({
            page,
          }) => {
            await openAddUtenlandsoppholdModal(page)
            await selectLand(page, 'ATA')
            await fillStartdato(page, '20.04.1981')
            await submitUtenlandsopphold(page)
            await expect(
              page.getByText(
                'Du har allerede registrert at du har bodd i Frankrike'
              )
            ).toBeVisible()
            await cancelUtenlandsopphold(page)
          })
        })

        test.describe('Når jeg ønsker å endre ett utenlandsopphold jeg har lagt inn,', () => {
          // 17
          test('forventer jeg å kunne endre land, jobb status, tidspunkt for oppholdet og oppdatere oppholdet.', async ({
            page,
          }) => {
            await page.getByTestId('endre-utenlandsopphold').click()
            await expect(
              page.getByRole('dialog', { name: 'Om oppholdet ditt' })
            ).toBeVisible()

            await selectLand(page, 'ESP')
            await selectArbeidetUtenlands(page, 'ja')
            await page.getByTestId('utenlandsopphold-startdato').clear()
            await fillStartdato(page, '20.04.1981')
            await page.getByTestId('utenlandsopphold-sluttdato').clear()
            await fillSluttdato(page, '16.12.2020')
            await submitUtenlandsopphold(page)

            await expect(
              page.getByTestId('utenlandsperiode-liste')
            ).toBeVisible()
            await expect(
              page.getByRole('definition').filter({ hasText: 'Frankrike' })
            ).not.toBeVisible()
            await expect(
              page.getByRole('definition').filter({ hasText: 'Spania' })
            ).toBeVisible()
            await expect(
              page
                .getByRole('definition')
                .filter({ hasText: '20.04.1981–16.12.2020' })
            ).toBeVisible()
          })

          // 18
          test('forventer jeg å kunne avbryte endringen.', async ({ page }) => {
            await page.getByTestId('endre-utenlandsopphold').click()
            await expect(
              page.getByRole('dialog', { name: 'Om oppholdet ditt' })
            ).toBeVisible()

            await page.getByRole('button', { name: /Avbryt endring/i }).click()

            await expect(
              page.getByTestId('utenlandsperiode-liste')
            ).toBeVisible()
            await expect(
              page.getByRole('definition').filter({ hasText: 'Frankrike' })
            ).toBeVisible()
            await expect(
              page
                .getByRole('definition')
                .filter({ hasText: '10.06.1980–16.12.1982' })
            ).toBeVisible()
          })
        })

        test.describe('Når jeg ønsker å slette ett utenlandsopphold jeg har lagt til,', () => {
          // 19
          test('forventer jeg spørsmål på om jeg er sikker på at jeg ønsker å slette oppholdet og jeg kan avbryte.', async ({
            page,
          }) => {
            await page.getByTestId('slett-utenlandsopphold').click()
            const deleteDialog = page.getByRole('dialog', {
              name: 'Er du sikker på at du vil slette oppholdet ditt?',
            })
            await expect(deleteDialog).toBeVisible()
            await deleteDialog.getByRole('button', { name: 'Avbryt' }).click()
            await expect(
              page.getByTestId('utenlandsperiode-liste')
            ).toBeVisible()
            await expect(
              page.getByRole('definition').filter({ hasText: 'Frankrike' })
            ).toBeVisible()
          })

          // 20
          test('forventer jeg at oppholdet slettes fra listen av opphold.', async ({
            page,
          }) => {
            await page.getByTestId('slett-utenlandsopphold').click()
            const deleteDialog = page.getByRole('dialog', {
              name: 'Er du sikker på at du vil slette oppholdet ditt?',
            })
            await expect(deleteDialog).toBeVisible()
            await deleteDialog
              .getByRole('button', { name: 'Slett opphold' })
              .click()
            await expect(
              page.getByRole('definition').filter({ hasText: 'Frankrike' })
            ).not.toBeVisible()
          })
        })

        test.describe('Som bruker som navigerer til resultatsiden,', () => {
          test.beforeEach(async ({ page }) => {
            await navigateFromUtenlandsoppholdToBeregning(page, {
              afp: 'nei',
              samtykke: false,
            })
          })

          test.describe('Når har valgt alder jeg ønsker beregning fra,', () => {
            test.beforeEach(async ({ page }) => {
              await selectUttaksalder(page, 70)
            })

            // 21
            test('forventer jeg at det i grunnlaget står at jeg har opphold utenfor Norge på "mer enn 5 år".', async ({
              page,
            }) => {
              await expect(
                page.getByRole('button', { name: 'Opphold utenfor Norge' })
              ).toBeVisible()
              await expect(
                page.getByTestId('grunnlag.opphold.value.mer_enn_5_aar')
              ).toBeVisible()
            })

            // 22
            test('forventer å kunne trykke i grunnlaget for å se listen over mine opphold.', async ({
              page,
            }) => {
              await page
                .getByRole('button', { name: 'Opphold utenfor Norge' })
                .click()
              await expect(
                page.getByTestId('utenlandsperiode-liste')
              ).toBeVisible()
              await expect(
                page.getByRole('definition').filter({ hasText: 'Frankrike' })
              ).toBeVisible()
            })

            // 23
            test('forventer å kunne gå tilbake til "opphold utenfor Norge".', async ({
              page,
            }) => {
              await page
                .getByRole('button', { name: 'Opphold utenfor Norge' })
                .click()
              await page
                .getByRole('link', { name: 'Opphold utenfor Norge' })
                .click()
              await expect(
                page.getByRole('dialog', {
                  name: 'Hvis du går tilbake for å endre oppholdene dine, mister du alle valgene dine i beregningen.',
                })
              ).toBeVisible()
              await page
                .getByRole('button', { name: 'Gå tilbake til opphold' })
                .click()
              await expect(page).toHaveURL(/\/utenlandsopphold$/)
              await expect(
                page.getByTestId('stegvisning.utenlandsopphold.title')
              ).toBeVisible()
            })
          })
        })
      })
    })

    test.describe('Som bruker som svarer "nei" på mer enn 5 år i utlandet,', () => {
      test.beforeEach(async ({ page }) => {
        await selectHarUtenlandsoppholdRadio(page, 'nei')
      })

      test.describe('Som bruker som navigerer til resultatsiden,', () => {
        test.beforeEach(async ({ page }) => {
          await navigateFromUtenlandsoppholdToBeregning(page, {
            afp: 'nei',
            samtykke: false,
          })
        })

        test.describe('Når har valgt alder jeg ønsker beregning fra,', () => {
          test.beforeEach(async ({ page }) => {
            await selectUttaksalder(page, 70)
          })

          // 28
          test('forventer jeg at det i grunnlaget står at jeg har opphold utenfor Norge på "5 år eller mindre".', async ({
            page,
          }) => {
            await expect(
              page.getByRole('button', { name: 'Opphold utenfor Norge' })
            ).toBeVisible()
            await expect(
              page.getByTestId('grunnlag.opphold.value.mindre_enn_5_aar')
            ).toBeVisible()
          })

          // 29
          test('forventer å kunne gå tilbake til "opphold utenfor Norge".', async ({
            page,
          }) => {
            await page
              .getByRole('button', { name: 'Opphold utenfor Norge' })
              .click()
            await page
              .getByRole('link', { name: 'Opphold utenfor Norge' })
              .click()
            await expect(
              page.getByRole('dialog', {
                name: 'Hvis du går tilbake for å endre oppholdene dine, mister du alle valgene dine i beregningen.',
              })
            ).toBeVisible()
            await page
              .getByRole('button', { name: 'Gå tilbake til opphold' })
              .click()
            await expect(page).toHaveURL(/\/utenlandsopphold$/)
            await expect(
              page.getByTestId('stegvisning.utenlandsopphold.title')
            ).toBeVisible()
          })
        })
      })
    })
  })
  test.describe('Som bruker med for lite trygdetid (mindre enn 5 år i Norge),', () => {
    test.use({ autoAuth: false })

    test.beforeEach(async ({ page }) => {
      await authenticate(page, [
        await alderspensjon({ preset: 'for_lite_trygdetid' }),
      ])
      await fillOutStegvisning(page, { navigateTo: 'utenlandsopphold' })
      await selectHarUtenlandsoppholdRadio(page, 'ja')
      await addUtenlandsopphold(page, {
        landkode: 'AFG',
        startdato: '01.06.1964',
      })
      await navigateFromUtenlandsoppholdToBeregning(page, {
        afp: 'nei',
        samtykke: false,
      })
    })

    test.describe('Når har valgt alder jeg ønsker beregning fra,', () => {
      test.beforeEach(async ({ page }) => {
        await selectUttaksalder(page, 70)
      })

      // 24
      test('forventer jeg at det i grunnlaget står at jeg har opphold i Norge på "mindre enn 5 år".', async ({
        page,
      }) => {
        await expect(
          page.getByRole('button', { name: 'Opphold i Norge' })
        ).toBeVisible()
        await expect(
          page.getByTestId('grunnlag.opphold.value.for_lite_trygdetid')
        ).toBeVisible()
      })

      // 25
      test('forventer informasjon om at beregningen kan være mangelfull.', async ({
        page,
      }) => {
        await expect(
          page.getByText(
            'Du har bodd mindre enn 5 år i Norge. Beregningen din kan være mangelfull.'
          )
        ).toBeAttached()
      })

      // 26
      test('forventer å kunne trykke i grunnlaget for å se listen over mine opphold.', async ({
        page,
      }) => {
        await page.getByRole('button', { name: 'Opphold i Norge' }).click()
        await expect(page.getByTestId('utenlandsperiode-liste')).toBeVisible()
        await expect(
          page.getByRole('definition').filter({ hasText: 'Afghanistan' })
        ).toBeVisible()
      })

      // 27
      test('forventer å kunne gå tilbake til "opphold utenfor Norge".', async ({
        page,
      }) => {
        await page.getByRole('button', { name: 'Opphold i Norge' }).click()
        await page.getByRole('link', { name: 'Opphold utenfor Norge' }).click()
        await expect(
          page.getByRole('dialog', {
            name: 'Hvis du går tilbake for å endre oppholdene dine, mister du alle valgene dine i beregningen.',
          })
        ).toBeVisible()
        await page
          .getByRole('button', { name: 'Gå tilbake til opphold' })
          .click()
        await expect(page).toHaveURL(/\/utenlandsopphold$/)
        await expect(
          page.getByTestId('stegvisning.utenlandsopphold.title')
        ).toBeVisible()
      })
    })
  })
})
