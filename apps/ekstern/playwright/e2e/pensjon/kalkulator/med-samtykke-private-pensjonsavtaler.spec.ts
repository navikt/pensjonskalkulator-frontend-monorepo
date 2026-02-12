import { expect, test } from 'base'
import { authenticate } from 'utils/auth'
import { offentligTp, pensjonsavtaler, person } from 'utils/mocks'
import { fillOutStegvisning } from 'utils/navigation'
import { presetStates } from 'utils/presetStates'

test.use({ autoAuth: false })

async function defaultPersonMock() {
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

test.describe('Med samtykke private pensjonsavtaler', () => {
  test.describe('Som bruker som har samtykket til innhenting av avtaler', () => {
    test.describe('Som bruker som ikke har pensjonsavtaler hos Norsk Pensjon', () => {
      test.beforeEach(async ({ page }) => {
        await authenticate(page, [
          await defaultPersonMock(),
          ...(await presetStates.medTidligsteUttaksalder(62, 10)),
          await offentligTp({
            simuleringsresultatStatus: 'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING',
            simulertTjenestepensjon: undefined,
          }),
          await pensjonsavtaler({
            avtaler: [],
            utilgjengeligeSelskap: [],
          }),
        ])
        await fillOutStegvisning(page, {
          afp: 'ja_privat',
          samtykke: true,
          navigateTo: 'beregning',
        })
        // Click age button and wait for pensjonsavtaler response
        const responsePromise = page.waitForResponse(
          (resp) =>
            resp.url().includes('/api/v3/pensjonsavtaler') &&
            resp.status() === 200
        )
        await page.getByRole('button', { name: '67' }).click()
        await responsePromise
        await expect(page.getByTestId('highcharts-aria-wrapper')).toBeVisible()
      })

      // 1
      test('forventer jeg at pensjonsavtaler ikke vises i graf eller tabell.', async ({
        page,
      }) => {
        // Verify pensjonsavtaler is not in chart legend
        await expect(
          page.getByText('Pensjonsavtaler (arbeidsgivere m.m.)').first()
        ).not.toBeVisible()
      })

      // 2
      test('forventer jeg informasjon i «Pensjonsavtaler - Private pensjonsavtaler» om at det ikke er funnet private pensjonsavtaler.', async ({
        page,
      }) => {
        await expect(
          page.getByRole('heading', { name: 'Pensjonsavtaler', level: 3 })
        ).toBeVisible()
        await expect(
          page.getByText(/Vi fant ingen pensjonsavtaler/i).first()
        ).toBeVisible()
      })
    })

    test.describe('Som bruker som har pensjonsavtaler hos Norsk Pensjon', () => {
      test.beforeEach(async ({ page }) => {
        await authenticate(page, [
          await defaultPersonMock(),
          ...(await presetStates.medTidligsteUttaksalder(62, 10)),
          await offentligTp({
            simuleringsresultatStatus: 'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING',
          }),
          await pensjonsavtaler(), // Default has avtaler
        ])
        await fillOutStegvisning(page, {
          afp: 'ja_privat',
          samtykke: true,
          navigateTo: 'beregning',
        })
        // Click age button and wait for pensjonsavtaler response
        const responsePromise = page.waitForResponse(
          (resp) =>
            resp.url().includes('/api/v3/pensjonsavtaler') &&
            resp.status() === 200
        )
        await page.getByRole('button', { name: '67' }).click()
        await responsePromise
        await expect(page.getByTestId('highcharts-aria-wrapper')).toBeVisible()
      })

      // 3
      test('forventer jeg at pensjonsavtaler vises i graf og tabell.', async ({
        page,
      }) => {
        // Verify pensjonsavtaler is in chart legend
        await expect(
          page.getByText('Pensjonsavtaler (arbeidsgivere m.m.)').first()
        ).toBeVisible()
      })

      // 4
      test('forventer jeg at pensjonsavtalene listes opp under "Pensjonsavtaler - Private pensjonsavtaler".', async ({
        page,
      }) => {
        await page.getByRole('button', { name: 'Vis mer' }).click()
        await expect(page.getByText(/Privat tjenestepensjon/i)).toBeVisible()
      })
    })

    test.describe('Som bruker som har pensjonsavtaler hos Norsk Pensjon som svarer delvis', () => {
      test.beforeEach(async ({ page }) => {
        await authenticate(page, [
          await defaultPersonMock(),
          ...(await presetStates.medTidligsteUttaksalder(62, 10)),
          await offentligTp({
            simuleringsresultatStatus: 'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING',
          }),
          await pensjonsavtaler({ delvisSvar: false }), // delvisSvar=false loads delvis-svar.json
        ])
        await fillOutStegvisning(page, {
          afp: 'ja_privat',
          samtykke: true,
          navigateTo: 'beregning',
        })
        // Click age button and wait for pensjonsavtaler response
        const responsePromise = page.waitForResponse(
          (resp) =>
            resp.url().includes('/api/v3/pensjonsavtaler') &&
            resp.status() === 200
        )
        await page.getByRole('button', { name: '67' }).click()
        await responsePromise
        await expect(page.getByTestId('highcharts-aria-wrapper')).toBeVisible()
      })

      // 5
      test('forventer jeg at pensjonsavtaler vises i graf og tabell.', async ({
        page,
      }) => {
        // Verify pensjonsavtaler is in chart legend
        await expect(
          page.getByText('Pensjonsavtaler (arbeidsgivere m.m.)').first()
        ).toBeVisible()
      })

      // 6
      test('forventer jeg informasjon i "Pensjonsavtaler - Private pensjonsavtaler" om at ikke alle avtaler er hentet.', async ({
        page,
      }) => {
        await page.getByRole('button', { name: 'Vis mer' }).click()
        await expect(
          page.getByText(
            /Vi klarte ikke å hente alle dine private pensjonsavtaler/i
          )
        ).toBeVisible()
      })

      // 7
      test('forventer jeg at pensjonsavtalene som er hentet listes opp under "Pensjonsavtaler - Private pensjonsavtaler".', async ({
        page,
      }) => {
        await page.getByRole('button', { name: 'Vis mer' }).click()
        await expect(page.getByText(/Privat tjenestepensjon/i)).toBeVisible()
      })
    })

    test.describe('Som bruker som ikke har pensjonsavtaler hos Norsk Pensjon som svarer delvis, med 0 avtaler', () => {
      test.beforeEach(async ({ page }) => {
        await authenticate(page, [
          await defaultPersonMock(),
          ...(await presetStates.medTidligsteUttaksalder(62, 10)),
          await offentligTp({
            simuleringsresultatStatus: 'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING',
            simulertTjenestepensjon: undefined,
          }),
          await pensjonsavtaler({
            avtaler: [],
            utilgjengeligeSelskap: [
              { navn: 'Something', heltUtilgjengelig: true },
            ],
          }),
        ])
        await fillOutStegvisning(page, {
          afp: 'ja_privat',
          samtykke: true,
          navigateTo: 'beregning',
        })
        // Click age button and wait for pensjonsavtaler response
        const responsePromise = page.waitForResponse(
          (resp) =>
            resp.url().includes('/api/v3/pensjonsavtaler') &&
            resp.status() === 200
        )
        await page.getByRole('button', { name: '67' }).click()
        await responsePromise
        await expect(page.getByTestId('highcharts-aria-wrapper')).toBeVisible()
      })

      // 8
      test('forventer jeg at pensjonsavtaler ikke vises i graf eller tabell.', async ({
        page,
      }) => {
        // Verify pensjonsavtaler is not in chart legend
        await expect(
          page.getByText('Pensjonsavtaler (arbeidsgivere m.m.)').first()
        ).not.toBeVisible()
      })

      // 9
      test('forventer jeg en alert med informasjon om at beregningen kanskje ikke viser alt.', async ({
        page,
      }) => {
        await expect(
          page.getByText(
            /Beregningen viser kanskje ikke alt. Noe gikk galt ved henting av pensjonsavtaler/i
          )
        ).toBeVisible()
      })

      // 10
      test('forventer jeg informasjon i "Pensjonsavtaler - Private pensjonsavtaler" om at Nav ikke klarte å hente mine private pensjonsavtaler.', async ({
        page,
      }) => {
        await page.getByRole('button', { name: 'Vis mer' }).click()
        await expect(
          page.getByText(/Vi klarte ikke å hente dine private pensjonsavtaler/i)
        ).toBeVisible()
      })
    })

    test.describe('Når kall til Norsk pensjon feiler', () => {
      test.beforeEach(async ({ page }) => {
        await authenticate(page, [
          await defaultPersonMock(),
          ...(await presetStates.medTidligsteUttaksalder(62, 10)),
          await offentligTp({
            simuleringsresultatStatus: 'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING',
            simulertTjenestepensjon: undefined,
          }),
          {
            url: /\/pensjon\/kalkulator\/api\/v3\/pensjonsavtaler/,
            method: 'POST',
            status: 503,
          },
        ])
        await fillOutStegvisning(page, {
          afp: 'ja_privat',
          samtykke: true,
          navigateTo: 'beregning',
        })
        // Click age button and wait for pensjonsavtaler error response
        const responsePromise = page.waitForResponse((resp) =>
          resp.url().includes('/api/v3/pensjonsavtaler')
        )
        await page.getByRole('button', { name: '67' }).click()
        await responsePromise
        await expect(page.getByTestId('highcharts-aria-wrapper')).toBeVisible()
      })

      // 11
      test('forventer jeg at pensjonsavtaler ikke vises i graf eller tabell.', async ({
        page,
      }) => {
        // Verify pensjonsavtaler is not in chart legend
        await expect(
          page.getByText('Pensjonsavtaler (arbeidsgivere m.m.)').first()
        ).not.toBeVisible()
      })

      // 12
      test('forventer jeg en alert med informasjon om at beregningen kanskje ikke viser alt.', async ({
        page,
      }) => {
        await expect(
          page.getByText(
            /Beregningen viser kanskje ikke alt. Noe gikk galt ved henting av pensjonsavtaler/i
          )
        ).toBeVisible()
      })

      // 13
      test('forventer jeg informasjon i "Pensjonsavtaler - Private pensjonsavtaler" om at Nav ikke klarte å hente mine private pensjonsavtaler.', async ({
        page,
      }) => {
        await page.getByRole('button', { name: 'Vis mer' }).click()
        await expect(
          page.getByText(/Vi klarte ikke å hente dine private pensjonsavtaler/i)
        ).toBeVisible()
      })
    })

    test.describe('Som bruker som har en pensjonsavtale som begynner før valgt alder', () => {
      test.beforeEach(async ({ page }) => {
        await authenticate(page, [
          await defaultPersonMock(),
          ...(await presetStates.medTidligsteUttaksalder(62, 10)),
          await offentligTp({
            simuleringsresultatStatus: 'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING',
          }),
          await pensjonsavtaler({
            avtaler: [
              {
                produktbetegnelse: 'Egen pensjonskonto',
                kategori: 'PRIVAT_TJENESTEPENSJON',
                startAar: 62, // Before default 67
                sluttAar: 77,
                utbetalingsperioder: [
                  {
                    startAlder: { aar: 62, maaneder: 0 },
                    sluttAlder: { aar: 77, maaneder: 0 },
                    aarligUtbetaling: 41802,
                    grad: 100,
                  },
                ],
              },
            ],
            utilgjengeligeSelskap: [],
          }),
        ])
        await fillOutStegvisning(page, {
          afp: 'ja_privat',
          samtykke: true,
          navigateTo: 'beregning',
        })
        // Click age button and wait for pensjonsavtaler response
        const responsePromise = page.waitForResponse(
          (resp) =>
            resp.url().includes('/api/v3/pensjonsavtaler') &&
            resp.status() === 200
        )
        await page.getByRole('button', { name: '70' }).click()
        await responsePromise
        await expect(page.getByTestId('highcharts-aria-wrapper')).toBeVisible()
      })

      // 14
      test('forventer jeg at pensjonsavtaler vises i graf og tabell.', async ({
        page,
      }) => {
        // Verify pensjonsavtaler is in chart legend (use first match since there can be multiple)
        await expect(
          page.getByText('Pensjonsavtaler (arbeidsgivere m.m.)').first()
        ).toBeVisible()
      })

      // 15
      test('forventer jeg at pensjonsavtalene listes opp under "Pensjonsavtaler - Private pensjonsavtaler".', async ({
        page,
      }) => {
        await page.getByRole('button', { name: 'Vis mer' }).click()
        await expect(page.getByText(/Privat tjenestepensjon/i)).toBeVisible()
      })

      // 16
      test('forventer jeg informasjon om at jeg har pensjonsavtaler som starter før valgt alder.', async ({
        page,
      }) => {
        await expect(
          page.getByText(/Du har pensjonsavtaler som starter før valgt alder/i)
        ).toBeVisible()
      })
    })
  })
})
