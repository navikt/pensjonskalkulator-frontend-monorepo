import { expect, test } from 'base'
import { authenticate } from 'utils/auth'
import {
  offentligTpAnnenOrdning,
  offentligTpIkkeMedlem,
  offentligTpTekniskFeil,
  offentligTpTomSimulering,
  pensjonsavtalerDelvisSvarTom,
  pensjonsavtalerError,
} from 'utils/mocks'
import { fillOutStegvisning } from 'utils/navigation'

const alertTekstStart = 'Beregningen viser kanskje ikke alt.'
const alertTekstAnnenTPO = `${alertTekstStart} Du kan ha rett til offentlig tjenestepensjon. Les mer under pensjonsavtaler.`
const alertTekstNP = `${alertTekstStart} Noe gikk galt ved henting av pensjonsavtaler i privat sektor. Les mer under pensjonsavtaler.`
const alertTekstTPO = `${alertTekstStart} Noe gikk galt ved henting av pensjonsavtaler i offentlig sektor. Les mer under pensjonsavtaler.`
const alertTekstBegge = `${alertTekstStart} Noe gikk galt ved henting av pensjonsavtaler i offentlig og privat sektor. Les mer under pensjonsavtaler.`

test.describe('Med samtykke', () => {
  test.describe('Som bruker som har samtykket til innhenting av avtaler og har TPO-forhold hos SPK,', () => {
    test.describe('Når NP og TPO er vellykket,', () => {
      // 1
      test('forventer jeg ingen alert', async ({ page }) => {
        await fillOutStegvisning(page, {
          afp: 'nei',
          samtykke: true,
          navigateTo: 'beregning',
        })
        await page
          .getByRole('button', { name: '67' })
          .waitFor({ state: 'visible' })
        await page.getByRole('button', { name: '67' }).click()

        await expect(
          page.getByRole('button', { name: 'Vis tabell av beregningen' })
        ).toBeVisible()
        await expect(page.getByText(alertTekstStart)).not.toBeVisible()
      })
    })

    test.describe('Når NP har feilet og TPO er vellykket,', () => {
      test.use({ autoAuth: false })
      // 2
      test('forventer jeg alert om at noe gikk galt ved henting av pensjonsavtaler i privat sektor.', async ({
        page,
      }) => {
        await authenticate(page, [pensjonsavtalerError()])
        await fillOutStegvisning(page, {
          afp: 'nei',
          samtykke: true,
          navigateTo: 'beregning',
        })
        await page
          .getByRole('button', { name: '67' })
          .waitFor({ state: 'visible' })
        await page.getByRole('button', { name: '67' }).click()

        await expect(page.getByText(alertTekstNP)).toBeVisible()
      })
    })

    test.describe('Når NP gir delvis svar med 0 avtaler og TPO er vellykket,', () => {
      test.use({ autoAuth: false })
      // 3
      test('forventer jeg alert om at noe gikk galt ved henting av pensjonsavtaler i privat sektor.', async ({
        page,
      }) => {
        await authenticate(page, [pensjonsavtalerDelvisSvarTom()])
        await fillOutStegvisning(page, {
          afp: 'nei',
          samtykke: true,
          navigateTo: 'beregning',
        })
        await page
          .getByRole('button', { name: '67' })
          .waitFor({ state: 'visible' })
        await page.getByRole('button', { name: '67' }).click()

        await expect(page.getByText(alertTekstNP)).toBeVisible()
      })
    })

    test.describe('Når simulering av tjenestepensjon fra SPK svarer med Teknisk feil,', () => {
      test.use({ autoAuth: false })
      test.describe('Når NP er vellykket,', () => {
        // 5
        test('forventer jeg alert om at noe gikk galt ved henting av pensjonsavtaler i offentlig sektor.', async ({
          page,
        }) => {
          await authenticate(page, [offentligTpTekniskFeil()])
          await fillOutStegvisning(page, {
            afp: 'nei',
            samtykke: true,
            navigateTo: 'beregning',
          })
          await page
            .getByRole('button', { name: '67' })
            .waitFor({ state: 'visible' })
          await page.getByRole('button', { name: '67' }).click()

          await expect(page.getByText(alertTekstTPO)).toBeVisible()
        })
      })

      test.describe('Når NP feiler,', () => {
        // 6
        test('forventer jeg alert om at noe gikk galt ved henting av pensjonsavtaler i offentlig og privat sektor.', async ({
          page,
        }) => {
          await authenticate(page, [
            offentligTpTekniskFeil(),
            pensjonsavtalerError(),
          ])
          await fillOutStegvisning(page, {
            afp: 'nei',
            samtykke: true,
            navigateTo: 'beregning',
          })
          await page
            .getByRole('button', { name: '67' })
            .waitFor({ state: 'visible' })
          await page.getByRole('button', { name: '67' }).click()

          await expect(page.getByText(alertTekstBegge)).toBeVisible()
        })
      })

      test.describe('Når NP gir delvis svar med 0 avtaler,', () => {
        // 7
        test('forventer jeg alert om at noe gikk galt ved henting av pensjonsavtaler i offentlig og privat sektor.', async ({
          page,
        }) => {
          await authenticate(page, [
            offentligTpTekniskFeil(),
            pensjonsavtalerDelvisSvarTom(),
          ])
          await fillOutStegvisning(page, {
            afp: 'nei',
            samtykke: true,
            navigateTo: 'beregning',
          })
          await page
            .getByRole('button', { name: '67' })
            .waitFor({ state: 'visible' })
          await page.getByRole('button', { name: '67' }).click()

          await expect(page.getByText(alertTekstBegge)).toBeVisible()
        })
      })
    })

    test.describe('Når simulering av tjenestepensjon fra SPK svarer med tom simulering,', () => {
      test.use({ autoAuth: false })
      test.describe('Når NP er vellykket,', () => {
        // 8
        test('forventer jeg alert om at noe gikk galt ved henting av pensjonsavtaler i offentlig sektor.', async ({
          page,
        }) => {
          await authenticate(page, [offentligTpTomSimulering()])
          await fillOutStegvisning(page, {
            afp: 'nei',
            samtykke: true,
            navigateTo: 'beregning',
          })
          await page
            .getByRole('button', { name: '67' })
            .waitFor({ state: 'visible' })
          await page.getByRole('button', { name: '67' }).click()

          await expect(page.getByText(alertTekstTPO)).toBeVisible()
        })
      })

      test.describe('Når NP feiler,', () => {
        // 9
        test('forventer jeg alert om at noe gikk galt ved henting av pensjonsavtaler i offentlig og privat sektor.', async ({
          page,
        }) => {
          await authenticate(page, [
            offentligTpTomSimulering(),
            pensjonsavtalerError(),
          ])
          await fillOutStegvisning(page, {
            afp: 'nei',
            samtykke: true,
            navigateTo: 'beregning',
          })
          await page
            .getByRole('button', { name: '67' })
            .waitFor({ state: 'visible' })
          await page.getByRole('button', { name: '67' }).click()

          await expect(page.getByText(alertTekstBegge)).toBeVisible()
        })
      })

      test.describe('Når NP gir delvis svar med 0 avtaler,', () => {
        // 10
        test('forventer jeg alert om at noe gikk galt ved henting av pensjonsavtaler i offentlig og privat sektor.', async ({
          page,
        }) => {
          await authenticate(page, [
            offentligTpTomSimulering(),
            pensjonsavtalerDelvisSvarTom(),
          ])
          await fillOutStegvisning(page, {
            afp: 'nei',
            samtykke: true,
            navigateTo: 'beregning',
          })
          await page
            .getByRole('button', { name: '67' })
            .waitFor({ state: 'visible' })
          await page.getByRole('button', { name: '67' }).click()

          await expect(page.getByText(alertTekstBegge)).toBeVisible()
        })
      })
    })
  })

  test.describe('Som bruker som har samtykket til innhenting av avtaler og IKKE har TPO-forhold,', () => {
    test.use({ autoAuth: false })
    test.describe('Når NP og TPO er vellykket,', () => {
      // 12
      test('forventer jeg ingen alert', async ({ page }) => {
        await authenticate(page, [offentligTpIkkeMedlem()])
        await fillOutStegvisning(page, {
          afp: 'nei',
          samtykke: true,
          navigateTo: 'beregning',
        })
        await page
          .getByRole('button', { name: '67' })
          .waitFor({ state: 'visible' })
        await page.getByRole('button', { name: '67' }).click()

        await expect(
          page.getByRole('button', { name: 'Vis tabell av beregningen' })
        ).toBeVisible()
        await expect(page.getByText(alertTekstStart)).not.toBeVisible()
      })
    })

    test.describe('Når NP har feilet og TPO er vellykket,', () => {
      // 13
      test('forventer jeg alert om at noe gikk galt ved henting av pensjonsavtaler i privat sektor.', async ({
        page,
      }) => {
        await authenticate(page, [
          offentligTpIkkeMedlem(),
          pensjonsavtalerError(),
        ])
        await fillOutStegvisning(page, {
          afp: 'nei',
          samtykke: true,
          navigateTo: 'beregning',
        })
        await page
          .getByRole('button', { name: '67' })
          .waitFor({ state: 'visible' })
        await page.getByRole('button', { name: '67' }).click()

        await expect(page.getByText(alertTekstNP)).toBeVisible()
      })
    })

    test.describe('Når NP gir delvis svar med 0 avtaler og TPO er vellykket,', () => {
      // 14
      test('forventer jeg alert om at noe gikk galt ved henting av pensjonsavtaler i privat sektor.', async ({
        page,
      }) => {
        await authenticate(page, [
          offentligTpIkkeMedlem(),
          pensjonsavtalerDelvisSvarTom(),
        ])
        await fillOutStegvisning(page, {
          afp: 'nei',
          samtykke: true,
          navigateTo: 'beregning',
        })
        await page
          .getByRole('button', { name: '67' })
          .waitFor({ state: 'visible' })
        await page.getByRole('button', { name: '67' }).click()

        await expect(page.getByText(alertTekstNP)).toBeVisible()
      })
    })
  })

  test.describe('Som bruker som har samtykket til innhenting av avtaler og har TPO-forhold hos annen ordning enn SPK,', () => {
    test.use({ autoAuth: false })
    test.describe('Når NP og TPO er vellykket,', () => {
      // 16
      test('forventer jeg melding om at jeg kan ha rett til offentlig tjenestepensjon.', async ({
        page,
      }) => {
        await authenticate(page, [offentligTpAnnenOrdning()])
        await fillOutStegvisning(page, {
          afp: 'nei',
          samtykke: true,
          navigateTo: 'beregning',
        })
        await page
          .getByRole('button', { name: '67' })
          .waitFor({ state: 'visible' })
        await page.getByRole('button', { name: '67' }).click()

        await expect(page.getByText(alertTekstAnnenTPO)).toBeVisible()
      })
    })

    test.describe('Når NP har feilet og TPO er vellykket,', () => {
      // 17
      test('forventer jeg alert om at noe gikk galt ved henting av pensjonsavtaler i offentlig og privat sektor.', async ({
        page,
      }) => {
        await authenticate(page, [
          offentligTpAnnenOrdning(),
          pensjonsavtalerError(),
        ])
        await fillOutStegvisning(page, {
          afp: 'nei',
          samtykke: true,
          navigateTo: 'beregning',
        })
        await page
          .getByRole('button', { name: '67' })
          .waitFor({ state: 'visible' })
        await page.getByRole('button', { name: '67' }).click()

        await expect(page.getByText(alertTekstBegge)).toBeVisible()
      })
    })

    test.describe('Når NP gir delvis svar med 0 avtaler og TPO er vellykket,', () => {
      // 18
      test('forventer jeg alert om at noe gikk galt ved henting av pensjonsavtaler i offentlig og privat sektor.', async ({
        page,
      }) => {
        await authenticate(page, [
          offentligTpAnnenOrdning(),
          pensjonsavtalerDelvisSvarTom(),
        ])
        await fillOutStegvisning(page, {
          afp: 'nei',
          samtykke: true,
          navigateTo: 'beregning',
        })
        await page
          .getByRole('button', { name: '67' })
          .waitFor({ state: 'visible' })
        await page.getByRole('button', { name: '67' }).click()

        await expect(page.getByText(alertTekstBegge)).toBeVisible()
      })
    })
  })
})
