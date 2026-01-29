import { expect, test } from 'base'
import { authenticate } from 'utils/auth'
import { person } from 'utils/mocks'
import { fillOutStegvisning } from 'utils/navigation'

const MOCK_DATE = new Date(2024, 0, 1, 12, 0, 0) // January 1, 2024

test.describe('Avansert', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install({ time: MOCK_DATE })
  })

  test.describe('Gitt at jeg som bruker har gjort en enkel beregning,', () => {
    test.describe('Når jeg ønsker en avansert beregning,', () => {
      test.use({ autoAuth: false })

      test.beforeEach(async ({ page }) => {
        await authenticate(page, [
          await person({
            fornavn: 'Aprikos',
            sivilstand: 'UGIFT',
            foedselsdato: '1963-04-30',
            pensjoneringAldre: {
              normertPensjoneringsalder: { aar: 67, maaneder: 0 },
              nedreAldersgrense: { aar: 62, maaneder: 0 },
              oevreAldersgrense: { aar: 75, maaneder: 0 },
            },
          }),
        ])
        await fillOutStegvisning(page, {
          sivilstand: 'UGIFT',
          samtykke: false,
          afp: 'vet_ikke',
          navigateTo: 'beregning',
        })
        // Wait for the toggle to be visible (indicates page has loaded)
        await page.getByTestId('toggle-avansert').waitFor({ state: 'visible' })
      })

      // 1
      test('forventer jeg å kunne velge «Avansert fane» for å få flere valgmuligheter.', async ({
        page,
      }) => {
        const toggleAvansert = page.getByTestId('toggle-avansert')
        await toggleAvansert.getByRole('radio', { name: 'Avansert' }).click()

        await expect(
          page.getByTestId(
            'beregning.avansert.rediger.inntekt_frem_til_endring.label'
          )
        ).toBeVisible()
      })

      // 2
      test('forventer også å kunne gå til Avansert fra «Alderspensjon (Nav)» og «Pensjonsgivende inntekt frem til uttak» i Grunnlaget.', async ({
        page,
      }) => {
        // Click on age button "70" to trigger beregning
        await page.getByRole('button', { name: '70' }).click()

        // Click on "avansert kalkulator" link in Alderspensjon section
        await page
          .getByRole('link', { name: /avansert kalkulator/i })
          .first()
          .click()
        await expect(
          page.getByTestId(
            'beregning.avansert.rediger.inntekt_frem_til_endring.label'
          )
        ).toBeVisible()

        // Go back to Enkel
        const toggleAvansert = page.getByTestId('toggle-avansert')
        await toggleAvansert.getByRole('radio', { name: 'Enkel' }).click()

        // Click on age button "70" again
        await page.getByRole('button', { name: '70' }).click()

        // Wait for "Årlig inntekt frem til uttak:" to be visible
        await expect(
          page.getByTestId('grunnlag2.endre_inntekt.title')
        ).toBeVisible()

        // Click on "avansert kalkulator" link in Inntekt section
        await page
          .getByRole('link', { name: /avansert kalkulator/i })
          .first()
          .click()
        await expect(
          page.getByTestId(
            'beregning.avansert.rediger.inntekt_frem_til_endring.label'
          )
        ).toBeVisible()
      })

      // 3
      test('ønsker jeg å kunne starte ny beregning.', async ({ page }) => {
        const toggleAvansert = page.getByTestId('toggle-avansert')
        await toggleAvansert.getByRole('radio', { name: 'Avansert' }).click()

        await expect(
          page.getByTestId(
            'beregning.avansert.rediger.inntekt_frem_til_endring.label'
          )
        ).toBeVisible()

        // Click "Tilbake til start" button
        await page.getByTestId('stegvisning.tilbake_start').click()

        // Click confirm button in modal
        await page
          .getByTestId('stegvisning.tilbake_start.modal.bekreft')
          .click()

        await expect(page).toHaveURL(/\/pensjon\/kalkulator\/start$/)
      })
    })
  })

  test.describe('Gitt at jeg som bruker har valgt "Avansert",', () => {
    test.describe('Når jeg er kommet inn i avansert,', () => {
      test.use({ autoAuth: false })

      test.beforeEach(async ({ page }) => {
        await authenticate(page, [
          await person({
            fornavn: 'Aprikos',
            sivilstand: 'UGIFT',
            foedselsdato: '1963-04-30',
            pensjoneringAldre: {
              normertPensjoneringsalder: { aar: 67, maaneder: 0 },
              nedreAldersgrense: { aar: 62, maaneder: 0 },
              oevreAldersgrense: { aar: 75, maaneder: 0 },
            },
          }),
        ])
        await fillOutStegvisning(page, {
          sivilstand: 'UGIFT',
          samtykke: false,
          afp: 'vet_ikke',
          navigateTo: 'beregning',
        })
        // Wait for the toggle to be visible and click Avansert
        const toggleAvansert = page.getByTestId('toggle-avansert')
        await toggleAvansert.waitFor({ state: 'visible' })
        await toggleAvansert.getByRole('radio', { name: 'Avansert' }).click()
      })

      // 4
      test('forventer jeg å se, og kunne endre inntekt frem til pensjon.', async ({
        page,
      }) => {
        await expect(
          page.getByTestId(
            'beregning.avansert.rediger.inntekt_frem_til_endring.label'
          )
        ).toBeVisible()
        // The formatert-inntekt element only contains the number, the description text is separate
        await expect(
          page.getByTestId('formatert-inntekt-frem-til-uttak')
        ).toContainText('521 338')

        // Click "Endre inntekt" button
        await page
          .getByTestId('beregning.avansert.rediger.inntekt.button')
          .click()

        // Change the income to 0
        await page.getByTestId('inntekt-textfield').fill('0')
        await page.getByTestId('inntekt.endre_inntekt_modal.button').click()

        await expect(
          page.getByTestId('formatert-inntekt-frem-til-uttak')
        ).toContainText('0')
      })

      // 5
      test('forventer jeg å kunne velge pensjonsalder mellom 62 år + 0 md og 75 år og 0 md.', async ({
        page,
      }) => {
        // Check that the age picker wrapper contains the label
        await expect(
          page.getByTestId('velguttaksalder.endring.title')
        ).toBeVisible()
        await expect(
          page.getByTestId('age-picker-uttaksalder-helt-uttak-aar')
        ).toBeVisible()

        // Check year options
        const yearSelect = page.getByTestId(
          'age-picker-uttaksalder-helt-uttak-aar'
        )
        const yearOptions = yearSelect.locator('option')
        await expect(yearOptions).toHaveCount(15) // 1 placeholder + 14 years (62-75)
        await expect(yearOptions.nth(1)).toHaveText('62 år')
        await expect(yearOptions.nth(14)).toHaveText('75 år')

        // Select 62 and check month options - all 12 months should be available
        await yearSelect.selectOption('62')
        const monthSelect = page.getByTestId(
          'age-picker-uttaksalder-helt-uttak-maaneder'
        )
        const monthOptions = monthSelect.locator('option')
        await expect(monthOptions).toHaveCount(12)
        await expect(monthOptions.nth(0)).toHaveText('0 md. (mai)')
        await expect(monthOptions.nth(11)).toHaveText('11 md. (apr.)')

        // Select 75 and check month options (only 0 should be available)
        await yearSelect.selectOption('75')
        const monthOptionsAt75 = monthSelect.locator('option')
        await expect(monthOptionsAt75).toHaveCount(1)
        await expect(monthOptionsAt75.nth(0)).toHaveText('0 md. (mai)')
      })

      // 6
      test('forventer jeg å kunne velge mellom 20, 40, 50, 60, 80 og 100% uttaksgrad.', async ({
        page,
      }) => {
        // Check that uttaksgrad section is visible with label
        await expect(
          page.getByTestId('beregning.avansert.rediger.uttaksgrad.label')
        ).toBeVisible()
        await expect(page.getByTestId('uttaksgrad')).toBeVisible()

        // Check uttaksgrad options
        const uttaksgradSelect = page.getByTestId('uttaksgrad')
        const options = uttaksgradSelect.locator('option')
        await expect(options).toHaveCount(7) // 1 placeholder + 6 options
        await expect(options.nth(1)).toHaveText('20 %')
        await expect(options.nth(2)).toHaveText('40 %')
        await expect(options.nth(3)).toHaveText('50 %')
        await expect(options.nth(4)).toHaveText('60 %')
        await expect(options.nth(5)).toHaveText('80 %')
        await expect(options.nth(6)).toHaveText('100 %')
      })

      // 7
      test('forventer jeg å kunne nullstille mine valg.', async ({ page }) => {
        // Fill out the form
        await page
          .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
          .selectOption('65')
        await page
          .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
          .selectOption('3')
        await page.getByTestId('uttaksgrad').selectOption('40 %')
        await page.getByTestId('inntekt-vsa-gradert-uttak-radio-ja').check()
        await page.getByTestId('inntekt-vsa-gradert-uttak').fill('300000')
        await page
          .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
          .selectOption('67')
        await page
          .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
          .selectOption('0')
        await page.getByTestId('inntekt-vsa-helt-uttak-radio-ja').check()
        await page.getByTestId('inntekt-vsa-helt-uttak').fill('100000')
        await page
          .getByTestId('age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar')
          .selectOption('75')
        await page
          .getByTestId('age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder')
          .selectOption('0')

        // Click "Nullstill valg" - button has no data-testid, use role selector
        await page.getByRole('button', { name: /Nullstill/i }).click()

        // Verify fields are reset
        await expect(
          page.getByTestId('age-picker-uttaksalder-helt-uttak-aar')
        ).toHaveValue('')
        await expect(
          page.getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
        ).toHaveValue('')
        await expect(page.getByTestId('uttaksgrad')).toHaveValue('')
        await expect(
          page.getByTestId('inntekt-vsa-gradert-uttak-radio-ja')
        ).not.toBeVisible()
        await expect(
          page.getByTestId('inntekt-vsa-gradert-uttak-radio-nei')
        ).not.toBeVisible()
        await expect(
          page.getByTestId('inntekt-vsa-gradert-uttak')
        ).not.toBeVisible()
        await expect(
          page.getByTestId('age-picker-uttaksalder-gradert-uttak-aar')
        ).not.toBeVisible()
        await expect(
          page.getByTestId('age-picker-uttaksalder-gradert-uttak-maaneder')
        ).not.toBeVisible()
        await expect(
          page.getByTestId('inntekt-vsa-helt-uttak-radio-ja')
        ).not.toBeVisible()
        await expect(
          page.getByTestId('inntekt-vsa-helt-uttak-radio-nei')
        ).not.toBeVisible()
        await expect(
          page.getByTestId('inntekt-vsa-helt-uttak')
        ).not.toBeVisible()
        await expect(
          page.getByTestId('age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar')
        ).not.toBeVisible()
        await expect(
          page.getByTestId(
            'age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder'
          )
        ).not.toBeVisible()
      })

      // 8
      test('forventer jeg kunne forlate siden med tilbakeknapp og gå tilbake til Enkel.', async ({
        page,
      }) => {
        await page.goBack()
        await expect(
          page.getByTestId('tidligst-mulig-uttak-result')
        ).toContainText(
          'Beregningen din viser at du kan ta ut 100 % alderspensjon fra du er'
        )
      })
    })

    test.describe('Når jeg har valgt ut pensjonsalder og ønsker 100 % alderspensjon,', () => {
      test.use({ autoAuth: false })

      test.beforeEach(async ({ page }) => {
        await authenticate(page, [
          await person({
            fornavn: 'Aprikos',
            sivilstand: 'UGIFT',
            foedselsdato: '1963-04-30',
            pensjoneringAldre: {
              normertPensjoneringsalder: { aar: 67, maaneder: 0 },
              nedreAldersgrense: { aar: 62, maaneder: 0 },
              oevreAldersgrense: { aar: 75, maaneder: 0 },
            },
          }),
        ])
        await fillOutStegvisning(page, {
          sivilstand: 'UGIFT',
          samtykke: false,
          afp: 'vet_ikke',
          navigateTo: 'beregning',
        })
        // Wait for the toggle to be visible and click Avansert
        const toggleAvansert = page.getByTestId('toggle-avansert')
        await toggleAvansert.waitFor({ state: 'visible' })
        await toggleAvansert.getByRole('radio', { name: 'Avansert' }).click()

        // Select age 65 år 3 md and 100%
        await page
          .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
          .selectOption('65')
        await page
          .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
          .selectOption('3')
        await page.getByTestId('uttaksgrad').selectOption('100 %')
      })

      // 9
      test('forventer jeg å kunne oppgi inntekt ved siden av 100% alderspensjon. Jeg forventer å kunne legge inn til hvilken alder jeg vil ha inntekt, men ikke lenger enn 75 år + 11 md.', async ({
        page,
      }) => {
        await page.getByTestId('inntekt-vsa-helt-uttak-radio-ja').check()
        await page.getByTestId('inntekt-vsa-helt-uttak').fill('100000')
        // Check the age picker for inntekt slutt alder is visible
        await expect(
          page.getByTestId('age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar')
        ).toBeVisible()

        // Check year options
        const yearSelect = page.getByTestId(
          'age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar'
        )
        const yearOptions = yearSelect.locator('option')
        await expect(yearOptions).toHaveCount(12) // 1 placeholder + 11 years (65-75)
        await expect(yearOptions.nth(1)).toHaveText('65 år')
        await expect(yearOptions.nth(11)).toHaveText('75 år')

        // Select 65 and check month options
        await yearSelect.selectOption('65')
        const monthSelect = page.getByTestId(
          'age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder'
        )
        const monthOptions = monthSelect.locator('option')
        await expect(monthOptions).toHaveCount(8)
        await expect(monthOptions.nth(0)).toHaveText('4 md. (sep.)')
        await expect(monthOptions.nth(7)).toHaveText('11 md. (apr.)')

        // Select 75 and check month options
        await yearSelect.selectOption('75')
        const monthOptionsAt75 = monthSelect.locator('option')
        await expect(monthOptionsAt75).toHaveCount(12)
        await expect(monthOptionsAt75.nth(0)).toHaveText('0 md. (mai)')
        await expect(monthOptionsAt75.nth(11)).toHaveText('11 md. (apr.)')

        // Select month and submit
        await monthSelect.selectOption('3')
        await page.getByTestId('beregn-pensjon').click()
        await expect(page.getByTestId('beregning-heading')).toBeVisible()
      })

      // 10
      test('forventer jeg å kunne svare nei på spørsmål om inntekt vsa. 100 % alderspensjon og beregne pensjon.', async ({
        page,
      }) => {
        await page.getByTestId('inntekt-vsa-helt-uttak-radio-nei').check()
        await page.getByTestId('beregn-pensjon').click()
        await expect(page.getByTestId('beregning-heading')).toBeVisible()
      })

      // 11
      test('forventer jeg å få varsel om at min beregning ikke blir lagret dersom jeg forlater siden med tilbakeknapp etter å ha begynt utfyllingen.', async ({
        page,
      }) => {
        await page.goBack()
        // Modal appears - check for the dialog with the warning heading
        const modal = page.getByRole('dialog')
        await expect(modal).toBeVisible()
        await expect(modal).toContainText(
          'Hvis du går ut av Avansert, mister du alle valgene dine.'
        )
        // Click the confirm button in modal
        await modal.getByRole('button', { name: /Gå ut av Avansert/i }).click()
        await expect(
          page.getByTestId('tidligst-mulig-uttak-result')
        ).toContainText(
          'Beregningen din viser at du kan ta ut 100 % alderspensjon fra du er'
        )
      })
    })

    test.describe('Når jeg har valgt ut pensjonsalder og ønsker en annen uttaksgrad enn 100% alderspensjon,', () => {
      test.use({ autoAuth: false })

      test.beforeEach(async ({ page }) => {
        await authenticate(page, [
          await person({
            fornavn: 'Aprikos',
            sivilstand: 'UGIFT',
            foedselsdato: '1963-04-30',
            pensjoneringAldre: {
              normertPensjoneringsalder: { aar: 67, maaneder: 0 },
              nedreAldersgrense: { aar: 62, maaneder: 0 },
              oevreAldersgrense: { aar: 75, maaneder: 0 },
            },
          }),
        ])
        await fillOutStegvisning(page, {
          sivilstand: 'UGIFT',
          samtykke: false,
          afp: 'vet_ikke',
          navigateTo: 'beregning',
        })
        // Wait for the toggle to be visible and click Avansert
        const toggleAvansert = page.getByTestId('toggle-avansert')
        await toggleAvansert.waitFor({ state: 'visible' })
        await toggleAvansert.getByRole('radio', { name: 'Avansert' }).click()

        // Select age 65 år 3 md and 40%
        await page
          .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
          .selectOption('65')
        await page
          .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
          .selectOption('3')
        await page.getByTestId('uttaksgrad').selectOption('40 %')
      })

      // 12
      test('forventer jeg å kunne oppgi alder for når jeg ønsker å øke til 100% alderspensjon. Jeg forventer å kunne velge pensjonsalder mellom alder for gradert uttak + 1md og 75 år og 0 md.', async ({
        page,
      }) => {
        // Check that the label for helt uttak is visible
        await expect(
          page.getByText('Når vil du ta ut 100 % alderspensjon?')
        ).toBeVisible()

        // Check year options for helt uttak - all years 62-75 are available (14 years + 1 placeholder = 15)
        const yearSelect = page.getByTestId(
          'age-picker-uttaksalder-helt-uttak-aar'
        )
        const yearOptions = yearSelect.locator('option')
        await expect(yearOptions).toHaveCount(15) // 1 placeholder + 14 years (62-75)
        await expect(yearOptions.nth(1)).toHaveText('62 år')
        await expect(yearOptions.nth(14)).toHaveText('75 år')

        // All 12 months should be available at year 62
        await yearSelect.selectOption('62')
        const monthSelect = page.getByTestId(
          'age-picker-uttaksalder-helt-uttak-maaneder'
        )
        const monthOptions = monthSelect.locator('option')
        await expect(monthOptions).toHaveCount(12)
        await expect(monthOptions.nth(0)).toHaveText('0 md. (mai)')
        await expect(monthOptions.nth(11)).toHaveText('11 md. (apr.)')

        // Select 75 and check month options (only month 0, no placeholder after year change)
        await yearSelect.selectOption('75')
        const monthOptionsAt75 = monthSelect.locator('option')
        await expect(monthOptionsAt75).toHaveCount(1)
        await expect(monthOptionsAt75.nth(0)).toHaveText('0 md. (mai)')
      })

      // 13
      test('forventer jeg å kunne oppgi inntekt ved siden av gradert alderspensjon og 100 % alderspensjon og beregne pensjon.', async ({
        page,
      }) => {
        await page.getByTestId('inntekt-vsa-gradert-uttak-radio-ja').check()
        await page.getByTestId('inntekt-vsa-gradert-uttak').fill('300000')
        await page
          .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
          .selectOption('67')
        await page
          .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
          .selectOption('0')
        await page.getByTestId('inntekt-vsa-helt-uttak-radio-ja').check()
        await page.getByTestId('inntekt-vsa-helt-uttak').fill('100000')

        await page
          .getByTestId('age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar')
          .selectOption('75')
        await page
          .getByTestId('age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder')
          .selectOption('0')

        await page.getByTestId('beregn-pensjon').click()
        await expect(page.getByTestId('beregning-heading')).toBeVisible()
      })

      // 14
      test('forventer jeg å kunne svare nei på spørsmål om inntekt vsa. gradert alderspensjon og beregne pensjon.', async ({
        page,
      }) => {
        await page.getByTestId('inntekt-vsa-gradert-uttak-radio-nei').check()
        await page
          .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
          .selectOption('67')
        await page
          .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
          .selectOption('0')
        await page.getByTestId('inntekt-vsa-helt-uttak-radio-nei').check()
        await page.getByTestId('beregn-pensjon').click()
        await expect(page.getByTestId('beregning-heading')).toBeVisible()
      })
    })

    test.describe('Når jeg har for lav opptjening til valgt pensjonsalder og/eller uttaksgrad,', () => {
      test.use({ autoAuth: false })

      test.beforeEach(async ({ page }) => {
        await authenticate(page, [
          await person({
            fornavn: 'Aprikos',
            sivilstand: 'UGIFT',
            foedselsdato: '1963-04-30',
            pensjoneringAldre: {
              normertPensjoneringsalder: { aar: 67, maaneder: 0 },
              nedreAldersgrense: { aar: 62, maaneder: 0 },
              oevreAldersgrense: { aar: 75, maaneder: 0 },
            },
          }),
        ])
        await fillOutStegvisning(page, {
          sivilstand: 'UGIFT',
          samtykke: false,
          afp: 'vet_ikke',
          navigateTo: 'beregning',
        })
        // Wait for the toggle to be visible and click Avansert
        const toggleAvansert = page.getByTestId('toggle-avansert')
        await toggleAvansert.waitFor({ state: 'visible' })
        await toggleAvansert.getByRole('radio', { name: 'Avansert' }).click()

        // Select age 65 år 1 md and 100%
        await page
          .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
          .selectOption('65')
        await page
          .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
          .selectOption('1')
        await page.getByTestId('uttaksgrad').selectOption('100 %')
        await page.getByTestId('inntekt-vsa-helt-uttak-radio-nei').check()
      })

      // 15
      test('forventer jeg informasjon om at jeg ikke har høy nok opptjening, og at jeg må øke alderen eller sette ned uttaksgraden.', async ({
        page,
      }) => {
        // Override the alderspensjon mock to return vilkaarErOppfylt: false
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
                    heltUttaksalder: { aar: 65, maaneder: 3 },
                  },
                },
              }),
            })
          }
        )

        await page.getByTestId('beregn-pensjon').click()

        await expect(page.getByTestId('beregning-heading')).not.toBeVisible()
        await expect(
          page.getByTestId(
            'beregning.avansert.rediger.inntekt_frem_til_endring.label'
          )
        ).toBeVisible()
        await expect(page.getByRole('alert')).toContainText(
          'Opptjeningen din er ikke høy nok til ønsket uttak. Du må øke alderen eller sette ned uttaksgraden.'
        )
      })

      // 16
      test('forventer jeg informasjon, dersom jeg ikke har nok opptjening for uttak før 67 år.', async ({
        page,
      }) => {
        // Override the alderspensjon mock to return vilkaarErOppfylt: false with 67 år
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
                  },
                },
              }),
            })
          }
        )

        await page.getByTestId('beregn-pensjon').click()

        await expect(page.getByRole('alert')).toContainText(
          'Du kan tidligst ta ut alderspensjon ved 67 år.'
        )
      })

      // 17
      test('forventer jeg informasjon om et alternativt uttak, dersom jeg oppfyller vilkårene til et annet helt uttak.', async ({
        page,
      }) => {
        // Override the alderspensjon mock
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
                    heltUttaksalder: { aar: 65, maaneder: 3 },
                  },
                },
              }),
            })
          }
        )

        await page.getByTestId('beregn-pensjon').click()

        await expect(page.getByRole('alert')).toContainText(
          'Et alternativ er at du ved 65 år og 3 måneder kan ta ut 100 % alderspensjon. Prøv gjerne andre kombinasjoner.'
        )
      })

      // 18
      test('forventer jeg informasjon om et alternativt uttak, dersom jeg oppfyller vilkårene til et annet gradert uttak.', async ({
        page,
      }) => {
        // Override the alderspensjon mock
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
                    heltUttaksalder: { aar: 65, maaneder: 1 },
                    gradertUttaksalder: { aar: 65, maaneder: 3 },
                    uttaksgrad: 40,
                  },
                },
              }),
            })
          }
        )

        await page.getByTestId('beregn-pensjon').click()

        await expect(page.getByRole('alert')).toContainText(
          'Et alternativ er at du ved 65 år og 3 måneder kan ta ut 40 % alderspensjon. Prøv gjerne andre kombinasjoner.'
        )
      })

      // 19
      test('forventer jeg informasjon om et alternativt uttak, dersom jeg oppfyller vilkårene til et annet gradert uttak med helt uttak.', async ({
        page,
      }) => {
        // Override the alderspensjon mock
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
                    gradertUttaksalder: { aar: 65, maaneder: 1 },
                    uttaksgrad: 20,
                  },
                },
              }),
            })
          }
        )

        await page.getByTestId('beregn-pensjon').click()

        await expect(page.getByRole('alert')).toContainText(
          'Et alternativ er at du ved 65 år og 1 måneder kan ta ut 20 % alderspensjon hvis du tar ut 100 % alderspensjon ved 67 år og 0 måneder eller senere. Prøv gjerne andre kombinasjoner.'
        )
      })

      // 20
      test('forventer jeg å kunne endre på inntekt, pensjonsalder og uttaksgrad, og å kunne beregne pensjon.', async ({
        page,
      }) => {
        await expect(page.getByTestId('beregning-heading')).not.toBeVisible()
        await expect(
          page.getByTestId(
            'beregning.avansert.rediger.inntekt_frem_til_endring.label'
          )
        ).toBeVisible()
        await expect(
          page.getByTestId('beregning.avansert.rediger.inntekt.button')
        ).toBeVisible()
        await expect(
          page.getByTestId('velguttaksalder.endring.title')
        ).toBeVisible()

        // Change to a valid age
        await page
          .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
          .selectOption('65')
        await page
          .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
          .selectOption('3')
        await expect(
          page.getByTestId('beregning.avansert.rediger.uttaksgrad.label')
        ).toBeVisible()
        await expect(page.getByTestId('uttaksgrad')).toBeVisible()

        await page.getByTestId('beregn-pensjon').click()
        await expect(page.getByTestId('beregning-heading')).toBeVisible()
      })

      // 21
      test('ønsker jeg å kunne starte ny beregning.', async ({ page }) => {
        await expect(page.getByTestId('beregning-heading')).not.toBeVisible()
        await page.getByTestId('stegvisning.tilbake_start').click()
        await page
          .getByTestId('stegvisning.tilbake_start.modal.bekreft')
          .click()
        await expect(page).toHaveURL(/\/pensjon\/kalkulator\/start$/)
      })
    })
  })

  test.describe('Gitt at jeg som bruker har valgt "Avansert", fylt ut skjemaet og klikket på "Beregn Pensjon",', () => {
    test.describe('Når jeg er kommet til beregningssiden i resultatmodus,', () => {
      test.use({ autoAuth: false })

      test.beforeEach(async ({ page }) => {
        await authenticate(page, [
          await person({
            fornavn: 'Aprikos',
            sivilstand: 'UGIFT',
            foedselsdato: '1963-04-30',
            pensjoneringAldre: {
              normertPensjoneringsalder: { aar: 67, maaneder: 0 },
              nedreAldersgrense: { aar: 62, maaneder: 0 },
              oevreAldersgrense: { aar: 75, maaneder: 0 },
            },
          }),
        ])
        await fillOutStegvisning(page, {
          sivilstand: 'UGIFT',
          samtykke: true,
          afp: 'ja_privat',
          navigateTo: 'beregning',
        })
        // Wait for the toggle to be visible and click Avansert
        const toggleAvansert = page.getByTestId('toggle-avansert')
        await toggleAvansert.waitFor({ state: 'visible' })
        await toggleAvansert.getByRole('radio', { name: 'Avansert' }).click()

        // Fill out the form with gradert uttak
        await page
          .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
          .selectOption('62')
        await page
          .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
          .selectOption('3')
        await page.getByTestId('uttaksgrad').selectOption('40 %')
        await page.getByTestId('inntekt-vsa-gradert-uttak-radio-ja').check()
        await page.getByTestId('inntekt-vsa-gradert-uttak').fill('300000')
        await page
          .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
          .selectOption('67')
        await page
          .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
          .selectOption('0')
        await page.getByTestId('inntekt-vsa-helt-uttak-radio-ja').check()
        await page.getByTestId('inntekt-vsa-helt-uttak').fill('100000')
        await page
          .getByTestId('age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar')
          .selectOption('75')
        await page
          .getByTestId('age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder')
          .selectOption('0')

        await page.getByTestId('beregn-pensjon').click()
        await expect(page.getByTestId('beregning-heading')).toBeVisible()
      })

      // 22
      test('forventer jeg samme visninger av graf og tabell som i enkel.', async ({
        page,
      }) => {
        await expect(page.getByTestId('highcharts-aria-wrapper')).toContainText(
          'Pensjonsgivende inntekt'
        )
        await expect(page.getByTestId('highcharts-aria-wrapper')).toContainText(
          'AFP (avtalefestet pensjon)'
        )
        await expect(page.getByTestId('highcharts-aria-wrapper')).toContainText(
          'Pensjonsavtaler (arbeidsgivere m.m.)'
        )
        await expect(page.getByTestId('highcharts-aria-wrapper')).toContainText(
          'Alderspensjon (Nav)'
        )
        await expect(page.getByTestId('highcharts-aria-wrapper')).toContainText(
          'Kroner'
        )
        await expect(page.getByTestId('highcharts-aria-wrapper')).toContainText(
          '61'
        )
        await expect(page.getByTestId('highcharts-aria-wrapper')).toContainText(
          '87+'
        )

        await expect(
          page.getByRole('heading', { name: 'Pensjonsavtaler' })
        ).toBeVisible()
        await page.getByTestId('showmore-button').click()
        await expect(
          page.getByRole('heading', { name: 'Andre avtaler' })
        ).toBeVisible()
        await expect(page.getByText('Privat tjenestepensjon')).toBeVisible()
        await expect(page.getByText('Individuelle ordninger')).toBeVisible()
        await expect(page.getByTestId('showmore-button')).toContainText(
          'Vis mindre'
        )
      })

      // 23
      test('forventer jeg å få informasjon om pensjonen min for beregningen uten "Inntekt".', async ({
        page,
      }) => {
        await expect(page.getByTestId('beregning-heading')).toBeVisible()
        await expect(page.getByText('Om pensjonen din')).toBeVisible()
        await expect(
          page.getByText('Inntekt frem til uttak:')
        ).not.toBeVisible()
        // Click on accordion items to expand - use first() to avoid strict mode violations
        await page.getByText('Sivilstand:').first().click()
        await page.getByText('Opphold utenfor Norge:').first().click()
        await page.getByText('AFP:').first().click()
      })

      // 24
      test('forventer jeg en månedlig oversikt over pensjon ved uttaksmåneden', async ({
        page,
      }) => {
        await expect(page.getByTestId('beregning-heading')).toBeVisible()
        await expect(
          page.getByRole('heading', { name: 'Månedlig pensjon' })
        ).toBeVisible()
        await expect(
          page.getByRole('heading', { name: 'Ved 62 år og 3 måneder' })
        ).toBeVisible()
        await expect(
          page.getByText('AFP (avtalefestet pensjon)').first()
        ).toBeVisible()
        await expect(
          page.getByText('Alderspensjon (Nav) 40 %').first()
        ).toBeVisible()
        await expect(page.getByText('Sum pensjon').first()).toBeVisible()
      })

      // 25
      test('ved gradert uttak forventer jeg en månedlig oversikt over pensjon både ved gradert uttak og helt uttak', async ({
        page,
      }) => {
        await expect(page.getByTestId('beregning-heading')).toBeVisible()
        await expect(
          page.getByRole('heading', { name: 'Månedlig pensjon' })
        ).toBeVisible()
        await expect(
          page.getByRole('heading', { name: 'Ved 67 år' })
        ).toBeVisible()
        await expect(
          page.getByText('AFP (avtalefestet pensjon)').first()
        ).toBeVisible()
        await expect(
          page.getByText('Alderspensjon (Nav) 100 %').first()
        ).toBeVisible()
        await expect(page.getByText('Sum pensjon').first()).toBeVisible()
      })

      // 26
      test('forventer jeg en lenke for å "endre avanserte valg"', async ({
        page,
      }) => {
        const endreValgLink = page.getByRole('link', {
          name: 'Endre avanserte valg',
        })
        await expect(endreValgLink).toBeVisible()
        await endreValgLink.click()
        await expect(
          page.getByText('Pensjonsgivende årsinntekt frem til pensjon')
        ).toBeVisible()
        // inntekt-textfield exists but may be in a modal - check it's attached to DOM
        await expect(page.getByTestId('inntekt-textfield')).toBeAttached()
        await expect(
          page.getByTestId('age-picker-uttaksalder-helt-uttak-aar')
        ).toBeVisible()
        await expect(
          page.getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
        ).toBeVisible()
        await expect(page.getByTestId('uttaksgrad')).toBeVisible()
      })
    })

    test.describe('Når jeg ønsker å endre mine valg,', () => {
      test.use({ autoAuth: false })

      test.beforeEach(async ({ page }) => {
        await authenticate(page, [
          await person({
            fornavn: 'Aprikos',
            sivilstand: 'UGIFT',
            foedselsdato: '1963-04-30',
            pensjoneringAldre: {
              normertPensjoneringsalder: { aar: 67, maaneder: 0 },
              nedreAldersgrense: { aar: 62, maaneder: 0 },
              oevreAldersgrense: { aar: 75, maaneder: 0 },
            },
          }),
        ])
        await fillOutStegvisning(page, {
          sivilstand: 'UGIFT',
          samtykke: true,
          afp: 'ja_privat',
          navigateTo: 'beregning',
        })
        // Wait for the toggle to be visible and click Avansert
        const toggleAvansert = page.getByTestId('toggle-avansert')
        await toggleAvansert.waitFor({ state: 'visible' })
        await toggleAvansert.getByRole('radio', { name: 'Avansert' }).click()

        // Change income first
        await page
          .getByTestId('beregning.avansert.rediger.inntekt.button')
          .click()
        await page.getByTestId('inntekt-textfield').fill('500000')
        await page.getByTestId('inntekt.endre_inntekt_modal.button').click()

        // Fill out the form with gradert uttak
        await page
          .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
          .selectOption('62')
        await page
          .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
          .selectOption('3')
        await page.getByTestId('uttaksgrad').selectOption('40 %')
        await page.getByTestId('inntekt-vsa-gradert-uttak-radio-ja').check()
        await page.getByTestId('inntekt-vsa-gradert-uttak').fill('300000')
        await page
          .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
          .selectOption('67')
        await page
          .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
          .selectOption('0')
        await page.getByTestId('inntekt-vsa-helt-uttak-radio-ja').check()
        await page.getByTestId('inntekt-vsa-helt-uttak').fill('100000')
        await page
          .getByTestId('age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar')
          .selectOption('75')
        await page
          .getByTestId('age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder')
          .selectOption('0')

        await page.getByTestId('beregn-pensjon').click()
        await expect(page.getByTestId('beregning-heading')).toBeVisible()
        await page.getByRole('link', { name: 'Endre avanserte valg' }).click()
      })

      // 27
      test('forventer jeg at mine tidligere valg er lagret.', async ({
        page,
      }) => {
        await expect(
          page.getByTestId('formatert-inntekt-frem-til-uttak')
        ).toHaveText('500 000')
        await expect(
          page.getByTestId('age-picker-uttaksalder-gradert-uttak-aar')
        ).toHaveValue('62')
        await expect(
          page.getByTestId('age-picker-uttaksalder-gradert-uttak-maaneder')
        ).toHaveValue('3')
        await expect(page.getByTestId('uttaksgrad')).toHaveValue('40')
        await expect(
          page.getByTestId('inntekt-vsa-gradert-uttak-radio-ja')
        ).toBeChecked()
        // Use regex to handle different whitespace characters
        await expect(page.getByTestId('inntekt-vsa-gradert-uttak')).toHaveValue(
          /300.000/
        )
        await expect(
          page.getByTestId('age-picker-uttaksalder-helt-uttak-aar')
        ).toHaveValue('67')
        await expect(
          page.getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
        ).toHaveValue('0')
        await expect(
          page.getByTestId('inntekt-vsa-helt-uttak-radio-ja')
        ).toBeChecked()
        // Use regex to handle different whitespace characters
        await expect(page.getByTestId('inntekt-vsa-helt-uttak')).toHaveValue(
          /100.000/
        )
      })

      // 28
      test('forventer jeg å kunne endre inntekt, pensjonsalder og uttaksgrad, og oppdatere min beregning.', async ({
        page,
      }) => {
        // Change income
        await page
          .getByTestId('beregning.avansert.rediger.inntekt.button')
          .click()
        await page.getByTestId('inntekt-textfield').fill('550000')
        await page.getByTestId('inntekt.endre_inntekt_modal.button').click()

        // Change gradert uttak age
        await page
          .getByTestId('age-picker-uttaksalder-gradert-uttak-aar')
          .selectOption('65')
        await page
          .getByTestId('age-picker-uttaksalder-gradert-uttak-maaneder')
          .selectOption('5')

        // Change uttaksgrad
        await page.getByTestId('uttaksgrad').selectOption('20 %')

        // Change income vsa gradert uttak
        await page.getByTestId('inntekt-vsa-gradert-uttak-radio-nei').check()

        // Change helt uttak age
        await page
          .getByTestId('age-picker-uttaksalder-helt-uttak-aar')
          .selectOption('68')
        await page
          .getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
          .selectOption('8')

        // Change income vsa helt uttak
        await page.getByTestId('inntekt-vsa-helt-uttak').fill('150000')
        await page
          .getByTestId('age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar')
          .selectOption('70')
        await page
          .getByTestId('age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder')
          .selectOption('6')

        await page.getByTestId('beregn-pensjon').click()
      })

      // 29
      test('forventer jeg å kunne nullstille mine valg.', async ({ page }) => {
        await page.getByRole('button', { name: /Nullstill/i }).click()

        await expect(
          page.getByTestId('age-picker-uttaksalder-helt-uttak-aar')
        ).toHaveValue('')
        await expect(
          page.getByTestId('age-picker-uttaksalder-helt-uttak-maaneder')
        ).toHaveValue('')
        await expect(page.getByTestId('uttaksgrad')).toHaveValue('')
        await expect(
          page.getByTestId('inntekt-vsa-gradert-uttak-radio-ja')
        ).not.toBeVisible()
        await expect(
          page.getByTestId('inntekt-vsa-gradert-uttak-radio-nei')
        ).not.toBeVisible()
        await expect(
          page.getByTestId('inntekt-vsa-gradert-uttak')
        ).not.toBeVisible()
        await expect(
          page.getByTestId('age-picker-uttaksalder-gradert-uttak-aar')
        ).not.toBeVisible()
        await expect(
          page.getByTestId('age-picker-uttaksalder-gradert-uttak-maaneder')
        ).not.toBeVisible()
        await expect(
          page.getByTestId('inntekt-vsa-helt-uttak-radio-ja')
        ).not.toBeVisible()
        await expect(
          page.getByTestId('inntekt-vsa-helt-uttak-radio-nei')
        ).not.toBeVisible()
        await expect(
          page.getByTestId('inntekt-vsa-helt-uttak')
        ).not.toBeVisible()
        await expect(
          page.getByTestId('age-picker-inntekt-vsa-helt-uttak-slutt-alder-aar')
        ).not.toBeVisible()
        await expect(
          page.getByTestId(
            'age-picker-inntekt-vsa-helt-uttak-slutt-alder-maaneder'
          )
        ).not.toBeVisible()
      })

      // 30
      test('forventer jeg å kunne avbryte og komme tilbake til beregningen.', async ({
        page,
      }) => {
        await page.getByRole('button', { name: /Avbryt endring/i }).click()
        await expect(
          page.getByRole('link', { name: 'Endre avanserte valg' })
        ).toBeVisible()
      })

      // 31
      test('forventer jeg å få varsel om at min beregning ikke blir lagret dersom jeg forlater siden med tilbakeknapp.', async ({
        page,
      }) => {
        await page.goBack()
        // Modal appears - check for the dialog with the warning heading
        const modal = page.getByRole('dialog')
        await expect(modal).toBeVisible()
        await expect(modal).toContainText(
          'Hvis du går ut av Avansert, mister du alle valgene dine.'
        )
        // Click the confirm button in modal
        await modal.getByRole('button', { name: /Gå ut av Avansert/i }).click()
        await expect(
          page.getByTestId('tidligst-mulig-uttak-result')
        ).toContainText(
          'Beregningen din viser at du kan ta ut 100 % alderspensjon fra du er'
        )
      })
    })
  })
})
