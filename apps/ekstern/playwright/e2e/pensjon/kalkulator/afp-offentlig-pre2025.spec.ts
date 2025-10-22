import { expect, test } from '../../../base'
import { loadJSONMock } from '../../../utils/mock'
import { fillOutStegvisning } from '../../../utils/navigation'

type PersonMock = { foedselsdato?: string } & Record<string, unknown>
type LoependeVedtakMock = {
  pre2025OffentligAfp?: { fom: string }
} & Record<string, unknown>

// Disable auto-auth for this test file since we need custom mocks
test.use({ autoAuth: false })

test.beforeEach(async ({ page }) => {
  const person = (await loadJSONMock('person.json')) as PersonMock
  person.foedselsdato = '1960-01-01'

  const loependeVedtak = (await loadJSONMock(
    'loepende-vedtak.json'
  )) as LoependeVedtakMock
  loependeVedtak.pre2025OffentligAfp = { fom: '2024-08-01' }

  // Manually set up mocks and auth
  const { authenticate } = await import('../../../utils/auth')
  await authenticate(page, [
    {
      url: /\/pensjon\/kalkulator\/api\/v5\/person/,
      jsonResponse: person,
    },
    {
      url: /\/pensjon\/kalkulator\/api\/v4\/vedtak\/loepende-vedtak/,
      jsonResponse: loependeVedtak,
    },
  ])
})

test.describe('AFP offentlig etterfulgt av AP', () => {
  test.describe('Gitt at bruker er innlogget og har vedtak om pre2025AfpOffentlig', () => {
    test.describe('Start side med vedtak om AFP offentlig', () => {
      test('forventer riktig ingress i start side med vedtak om AFP offentlig', async ({
        page,
      }) => {
        await expect(
          page.getByTestId('stegvisning-start-ingress-pre2025-offentlig-afp')
        ).toBeVisible()
      })
    })

    test.describe('Når jeg fullfører de første stegene', () => {
      test('forventer jeg å komme til beregningsside', async ({ page }) => {
        await fillOutStegvisning(page, {
          samtykke: true,
          sivilstand: 'UGIFT',
          afp: 'vet_ikke',
        })

        await expect(page).toHaveURL(/\/pensjon\/kalkulator\/beregning/)
      })
    })
  })
})
