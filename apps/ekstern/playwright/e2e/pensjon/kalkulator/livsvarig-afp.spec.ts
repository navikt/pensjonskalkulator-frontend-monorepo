import { Page } from '@playwright/test'
import { fillOutStegvisning } from 'utils/navigation'

import { expect, test } from '../../../base'
import { authenticate } from '../../../utils/auth'
import {
  afpOffentligLivsvarig,
  afpOffentligLivsvarigError,
  afpOffentligLivsvarigFlereTpOrdninger,
  person,
  tidligsteUttaksalder,
} from '../../../utils/mocks'

test.use({ autoAuth: false })

const personOver62 = () =>
  person({
    fornavn: 'Aprikos',
    sivilstand: 'UGIFT',
    alder: { aar: 63 },
    pensjoneringAldre: {
      normertPensjoneringsalder: { aar: 67, maaneder: 0 },
      nedreAldersgrense: { aar: 62, maaneder: 0 },
      oevreAldersgrense: { aar: 75, maaneder: 0 },
    },
  })

const navigateToBeregningWithOffentligAfp = async (page: Page) => {
  await fillOutStegvisning(page, {
    afp: 'ja_offentlig',
    samtykkeAfpOffentlig: true,
    samtykke: false,
    navigateTo: 'beregning',
  })
  await page.getByRole('button', { name: '67' }).waitFor({ state: 'visible' })
}

test.describe('Livsvarig AFP i offentlig sektor', () => {
  test.describe('Som bruker som er født 1963 eller senere med eller uten vedtak om AP OG som er fylt 62 år', () => {
    test.describe('Som har valgt AFP i offentlig sektor OG som har samtykket til å sjekke AFP', () => {
      test.describe('OG sjekk av vedtak viser at jeg har vedtak om AFP og henting av beløp er vellykket', () => {
        test.beforeEach(async ({ page }) => {
          await authenticate(page, [
            await personOver62(),
            await tidligsteUttaksalder({ aar: 62, maaneder: 0 }),
            afpOffentligLivsvarig({
              afpStatus: true,
              maanedligBeloep: 25000,
              virkningFom: '2025-01-01',
              sistBenyttetGrunnbeloep: 118620,
            }),
          ])
        })

        test('forventer et varsel på beregningssiden som sier at beløp er hentet, men at beløp ikke vises i graf og tabell', async ({
          page,
        }) => {
          await navigateToBeregningWithOffentligAfp(page)
          await page.getByRole('button', { name: '67' }).click()

          const alert = page.getByTestId('alert-afp-offentlig-livsvarig-info')
          await expect(alert).toBeVisible()
          await expect(alert).toContainText('Vi har hentet din livsvarige AFP')
          await expect(alert).toContainText(
            'Beløpet vises ikke i graf og tabell'
          )
        })

        test('forventer at AFP ikke vises i graf og tabell', async ({
          page,
        }) => {
          await navigateToBeregningWithOffentligAfp(page)
          await page.getByRole('button', { name: '67' }).click()

          await expect(
            page.getByTestId('highcharts-aria-wrapper')
          ).toBeVisible()
          await expect(
            page.getByTestId('highcharts-aria-wrapper').getByText(/AFP/)
          ).not.toBeVisible()
        })

        test('forventer at hentet beløp vises i detaljer om AFP uten uttakstidspunkt med informasjon om at AFP er hentet og at den fortsetter som før', async ({
          page,
        }) => {
          await navigateToBeregningWithOffentligAfp(page)
          await page.getByRole('button', { name: '67' }).click()

          const afpGrunnlagTitle = page.getByTestId('grunnlag.afp.title')
          await expect(afpGrunnlagTitle).toBeVisible()
          await expect(afpGrunnlagTitle).toContainText('Offentlig')

          const afpGrunnlagContent = page.getByTestId('grunnlag.afp.content')
          await expect(afpGrunnlagContent).toBeVisible()
          await expect(afpGrunnlagContent).toContainText('Vi har hentet')
          await expect(afpGrunnlagContent).toContainText('fortsetter som før')
          await expect(afpGrunnlagContent).not.toContainText(/fra \d/)
        })
      })

      test.describe('OG sjekk av vedtak er vellykket, men henting av beløp feiler (null)', () => {
        test.beforeEach(async ({ page }) => {
          await authenticate(page, [
            await personOver62(),
            await tidligsteUttaksalder({ aar: 62, maaneder: 0 }),
            afpOffentligLivsvarig({
              afpStatus: true,
              maanedligBeloep: null,
            }),
          ])
        })

        test('forventer et varsel om at beløpet ikke kunne hentes', async ({
          page,
        }) => {
          await navigateToBeregningWithOffentligAfp(page)
          await page.getByRole('button', { name: '67' }).click()

          const alert = page.getByTestId(
            'alert-afp-offentlig-livsvarig-success'
          )
          await expect(alert).toBeVisible()
          await expect(alert).toContainText(
            'Du har startet uttak av livsvarig AFP'
          )
        })

        test('forventer ingen beløp vises i detaljer om AFP', async ({
          page,
        }) => {
          await navigateToBeregningWithOffentligAfp(page)
          await page.getByRole('button', { name: '67' }).click()

          const afpGrunnlagContent = page.getByTestId('grunnlag.afp.content')
          await expect(afpGrunnlagContent).toBeVisible()
          await expect(afpGrunnlagContent).not.toContainText('kr')
        })
      })

      test.describe('OG både sjekk av vedtak og henting av beløp feiler (API error)', () => {
        test.beforeEach(async ({ page }) => {
          await authenticate(page, [
            await personOver62(),
            await tidligsteUttaksalder({ aar: 62, maaneder: 0 }),
            afpOffentligLivsvarigError(),
          ])
        })

        test('forventer et varsel om at vedtak ikke kunne sjekkes', async ({
          page,
        }) => {
          await navigateToBeregningWithOffentligAfp(page)
          await page.getByRole('button', { name: '67' }).click()

          const alert = page.getByTestId('alert-afp-offentlig-livsvarig-failed')
          await expect(alert).toBeVisible({ timeout: 10000 })
          await expect(alert).toContainText(
            'Vi klarte ikke å sjekke om du har vedtak om livsvarig AFP'
          )
        })

        test('forventer at simulert AFP-beløp fra Nav med uttakstidspunkt vises i detaljer om AFP', async ({
          page,
        }) => {
          await navigateToBeregningWithOffentligAfp(page)
          await page.getByRole('button', { name: '67' }).click()

          const afpGrunnlagContent = page.getByTestId('grunnlag.afp.content')
          await expect(afpGrunnlagContent).toBeVisible({ timeout: 15000 })
          await expect(afpGrunnlagContent).toContainText(
            'oppgitt AFP i offentlig sektor'
          )
        })
      })

      test.describe('OG vedtak om AFP finnes hos flere TP-ordninger', () => {
        test.beforeEach(async ({ page }) => {
          await authenticate(page, [
            await personOver62(),
            await tidligsteUttaksalder({ aar: 62, maaneder: 0 }),
            afpOffentligLivsvarigFlereTpOrdninger(),
          ])
        })

        test('forventer et varsel om at vedtak ikke kunne sjekkes (behandlet som feil)', async ({
          page,
        }) => {
          await navigateToBeregningWithOffentligAfp(page)
          await page.getByRole('button', { name: '67' }).click()

          const alert = page.getByTestId('alert-afp-offentlig-livsvarig-failed')
          await expect(alert).toBeVisible({ timeout: 10000 })
          await expect(alert).toContainText(
            'Vi klarte ikke å sjekke om du har vedtak om livsvarig AFP'
          )
        })

        test('forventer at simulert AFP-beløp fra Nav med uttakstidspunkt vises i detaljer om AFP', async ({
          page,
        }) => {
          await navigateToBeregningWithOffentligAfp(page)
          await page.getByRole('button', { name: '67' }).click()

          const afpGrunnlagContent = page.getByTestId('grunnlag.afp.content')
          await expect(afpGrunnlagContent).toBeVisible()
          await expect(afpGrunnlagContent).toContainText(
            'oppgitt AFP i offentlig sektor'
          )
        })
      })

      test.describe('OG vedtak om AFP finnes med 0 i beløp', () => {
        test.beforeEach(async ({ page }) => {
          await authenticate(page, [
            await personOver62(),
            await tidligsteUttaksalder({ aar: 62, maaneder: 0 }),
            afpOffentligLivsvarig({
              afpStatus: true,
              maanedligBeloep: 0,
            }),
          ])
        })

        test('forventer et varsel om at vedtak ikke kunne sjekkes (behandlet som feil)', async ({
          page,
        }) => {
          await navigateToBeregningWithOffentligAfp(page)
          await page.getByRole('button', { name: '67' }).click()

          const alert = page.getByTestId('alert-afp-offentlig-livsvarig-failed')
          await expect(alert).toBeVisible()
          await expect(alert).toContainText(
            'Vi klarte ikke å sjekke om du har vedtak om livsvarig AFP'
          )
        })

        test('forventer at simulert AFP-beløp fra Nav med uttakstidspunkt vises i detaljer om AFP', async ({
          page,
        }) => {
          await navigateToBeregningWithOffentligAfp(page)
          await page.getByRole('button', { name: '67' }).click()

          const afpGrunnlagContent = page.getByTestId('grunnlag.afp.content')
          await expect(afpGrunnlagContent).toBeVisible()
          await expect(afpGrunnlagContent).toContainText(
            'oppgitt AFP i offentlig sektor'
          )
        })
      })
    })

    test.describe('Som har valgt AFP i offentlig sektor OG som IKKE har samtykket til å sjekke AFP', () => {
      test.beforeEach(async ({ page }) => {
        await authenticate(page, [
          await personOver62(),
          await tidligsteUttaksalder({ aar: 62, maaneder: 0 }),
        ])
      })

      test('forventer informasjon på samtykke-steget om at Nav kan gjøre en mer presis beregning hvis jeg samtykker', async ({
        page,
      }) => {
        await fillOutStegvisning(page, {
          afp: 'ja_offentlig',
          navigateTo: 'samtykke-offentlig-afp',
        })

        await expect(page).toHaveURL(
          /\/pensjon\/kalkulator\/samtykke-offentlig-afp/
        )
        await expect(
          page.getByText('Opplysningene om AFP kan påvirke beregningen')
        ).toBeVisible()
      })
    })
  })
})
