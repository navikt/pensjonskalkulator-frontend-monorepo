import { vi } from 'vitest'

import { TidligstMuligUttak } from '../TidligstMuligUttak'
import * as velgUttaksalderUtils from '@/components/VelgUttaksalder/utils'
import { render, screen, userEvent } from '@/test-utils'

describe('TidligstMuligUttak', () => {
  it('rendrer riktig tittel med formatert uttaksalder og tekst', async () => {
    const user = userEvent.setup()
    const formatMock = vi.spyOn(velgUttaksalderUtils, 'formatUttaksalder')
    const { asFragment } = render(
      <TidligstMuligUttak
        uttaksalder={{ aar: 62, maaned: 10, uttaksdato: '2031-11-01' }}
      />
    )
    expect(screen.getByText('Tidligst mulig uttak:')).toBeVisible()
    expect(formatMock).toHaveBeenCalled()
    await user.click(screen.getByRole('button'))
    expect(asFragment()).toMatchSnapshot()
  })
})
