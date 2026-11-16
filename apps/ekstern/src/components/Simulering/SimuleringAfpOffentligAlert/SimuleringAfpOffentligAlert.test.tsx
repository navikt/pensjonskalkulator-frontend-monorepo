import { describe, expect, it, vi } from 'vitest'

import { render, screen } from '@/test-utils'

import { useAfpOffentligAlerts } from '../hooks'
import { SimuleringAfpOffentligAlert } from './SimuleringAfpOffentligAlert'

vi.mock('../hooks', () => ({
  useAfpOffentligAlerts: vi.fn(),
}))

describe('SimuleringAfpOffentligAlert', () => {
  it.each([
    {
      variant: 'info',
      text: 'beregning.alert.info.afp-offentlig-livsvarig',
      sanityId: 'afp.beloep-vises-ikke',
      expectedText: 'Vi har hentet din livsvarige AFP.',
    },
    {
      variant: 'warning',
      text: 'beregning.alert.feil.afp-offentlig-livsvarig',
      sanityId: 'afp.klarte-ikke-sjekke-livsvarig',
      expectedText: 'Vi klarte ikke å sjekke om du har AFP',
    },
    {
      variant: 'warning',
      text: 'beregning.alert.success.afp-offentlig-livsvarig',
      sanityId: 'afp.klarte-ikke-hente-beløp-livsvarig',
      expectedText: 'Vi klarte ikke å hente beløpet for din AFP',
    },
  ] as const)(
    'viser Sanity-varselet $sanityId',
    ({ variant, text, sanityId, expectedText }) => {
      vi.mocked(useAfpOffentligAlerts).mockReturnValue({
        variant,
        text,
        sanityId,
      })

      render(
        <SimuleringAfpOffentligAlert
          harSamtykketOffentligAFP
          isAfpOffentligLivsvarigSuccess
        />
      )

      const alert = screen.getByTestId(sanityId)
      expect(alert).toBeVisible()
      expect(alert).toHaveTextContent(expectedText)
    }
  )
})
