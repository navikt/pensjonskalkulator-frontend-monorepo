import { expect, test } from '../../../base'
import { authenticate } from '../../../utils/auth'
import {
  loependeVedtak,
  omstillingsstoenadOgGjenlevende,
} from '../../../utils/mocks'
import { fillOutStegvisning } from '../../../utils/navigation'

test.use({ autoAuth: false })

test.describe('med omstillingsstønad og gjenlevende', () => {
  test.describe('Som bruker som har logget inn på kalkulatoren,', () => {
    test.describe('Som bruker som mottar omstillingsstønad eller gjenlevendepensjon,', () => {
      test.beforeEach(async ({ page }) => {
        await authenticate(page, [
          await omstillingsstoenadOgGjenlevende({ harLoependeSak: true }),
        ])
      })

      // 1
      test('ønsker jeg informasjon om når jeg tidligst kan starte uttak av pensjon.', async ({
        page,
      }) => {
        await fillOutStegvisning(page, {
          afp: 'vet_ikke',
          samtykke: false,
          sivilstand: 'UGIFT',
          epsHarPensjon: null,
          epsHarInntektOver2G: null,
          navigateTo: 'beregning',
        })
        await expect(page.getByTestId('tidligst-mulig-uttak')).toBeVisible()
      })

      // 2
      test('forventer jeg å få informasjon om at alderspensjon ikke kan kombineres med omstillingsstønad eller gjenlevendepensjon.', async ({
        page,
      }) => {
        await fillOutStegvisning(page, {
          afp: 'vet_ikke',
          samtykke: false,
          sivilstand: 'UGIFT',
          epsHarPensjon: null,
          epsHarInntektOver2G: null,
          navigateTo: 'beregning',
        })
        await expect(
          page.getByText(
            'Alderspensjon kan ikke kombineres med gjenlevendepensjon eller omstillingsstønad'
          )
        ).toBeVisible()
      })

      // 3
      test('må jeg kunne trykke på Readmore for informasjon om tidspunktet for tidligst uttak.', async ({
        page,
      }) => {
        await fillOutStegvisning(page, {
          afp: 'vet_ikke',
          samtykke: false,
          sivilstand: 'UGIFT',
          epsHarPensjon: null,
          epsHarInntektOver2G: null,
          navigateTo: 'beregning',
        })
        await expect(page.getByTestId('om_TMU')).toBeVisible()
      })
    })

    test.describe('Som bruker som mottar uføretrygd, og omstillingsstønad eller gjenlevendepensjon,', () => {
      test.beforeEach(async ({ page }) => {
        await authenticate(page, [
          await omstillingsstoenadOgGjenlevende({ harLoependeSak: true }),
          await loependeVedtak({ ufoeretrygd: { grad: 75 } }),
        ])
      })

      // 4
      test('forventer jeg informasjon om hvilken grad uføretrygd jeg har.', async ({
        page,
      }) => {
        await fillOutStegvisning(page, {
          afp: 'vet_ikke',
          samtykke: false,
          sivilstand: 'UGIFT',
          epsHarPensjon: null,
          epsHarInntektOver2G: null,
          navigateTo: 'beregning',
        })
        await expect(
          page.getByTestId('tidligst-mulig-uttak-result')
        ).toBeVisible()
      })

      // 5
      test('forventer jeg å få informasjon om at alderspensjon ikke kan kombineres med omstillingsstønad eller gjenlevendepensjon.', async ({
        page,
      }) => {
        await fillOutStegvisning(page, {
          afp: 'vet_ikke',
          samtykke: false,
          sivilstand: 'UGIFT',
          epsHarPensjon: null,
          epsHarInntektOver2G: null,
          navigateTo: 'beregning',
        })
        await expect(
          page.getByText(
            'Alderspensjon kan ikke kombineres med gjenlevendepensjon eller omstillingsstønad'
          )
        ).toBeVisible()
      })

      // 6
      test('forventer jeg tilpasset informasjon i Readmore til gradert alderspensjon.', async ({
        page,
      }) => {
        await fillOutStegvisning(page, {
          afp: 'vet_ikke',
          samtykke: false,
          sivilstand: 'UGIFT',
          epsHarPensjon: null,
          epsHarInntektOver2G: null,
          navigateTo: 'beregning',
        })
        await expect(
          page.getByTestId('om_pensjonsalder_UT_gradert_enkel')
        ).toBeVisible()
      })
    })
  })
})
