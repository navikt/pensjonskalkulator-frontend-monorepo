import { expect, test } from '../../../base'
import { authenticate } from '../../../utils/auth'
import { expectElementVisible } from '../../../utils/form'
import { loependeVedtak, person } from '../../../utils/mocks'
import { fillOutStegvisning } from '../../../utils/navigation'

test.use({ autoAuth: false })

test.beforeEach(async ({ page }) => {
  await authenticate(page, [
    await person({ foedselsdato: '1960-01-01' }),
    await loependeVedtak({ pre2025OffentligAfp: { fom: '2024-08-01' } }),
  ])
})

test.describe('AFP offentlig etterfulgt av AP', () => {
  test.describe('Gitt at bruker er innlogget og har vedtak om pre2025AfpOffentlig', () => {
    test.describe('Start side med vedtak om AFP offentlig', () => {
      test('forventer riktig ingress i start side med vedtak om AFP offentlig', async ({
        page,
      }) => {
        await expectElementVisible(
          page,
          'stegvisning-start-ingress-pre2025-offentlig-afp'
        )
      })
    })

    test.describe('Når jeg fullfører de første stegene', () => {
      test('forventer jeg å komme til beregningsside', async ({ page }) => {
        await fillOutStegvisning(page, {
          samtykke: true,
          sivilstand: 'UGIFT',
          epsHarPensjon: null,
          epsHarInntektOver2G: null,
          afp: 'vet_ikke',
          navigateTo: 'beregning',
        })

        await expect(page).toHaveURL(/\/pensjon\/kalkulator\/beregning/)
      })
    })
  })
})
