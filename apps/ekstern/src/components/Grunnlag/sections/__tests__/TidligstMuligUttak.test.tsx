import { vi } from 'vitest'

import { TidligstMuligUttak } from '../TidligstMuligUttak'
import * as velgUttaksalderUtils from '@/components/VelgUttaksalder/utils'
import { mockErrorResponse } from '@/mocks/server'
import { render, screen, userEvent, waitFor } from '@/test-utils'

describe('TidligstMuligUttak', () => {
  it('rendrer riktig tittel med formatert uttaksalder og tekst', async () => {
    const user = userEvent.setup()
    const formatMock = vi.spyOn(velgUttaksalderUtils, 'formatUttaksalder')
    const { asFragment } = render(<TidligstMuligUttak />)
    expect(screen.getByText('Tidligst mulig uttak:')).toBeVisible()
    await waitFor(async () => {
      expect(formatMock).toHaveBeenCalled()
      await user.click(screen.getByRole('button'))
      expect(asFragment()).toMatchSnapshot()
    })
  })

  it('rendrer riktig når tidligst mulig uttaksalder ikke kunne hentes', async () => {
    mockErrorResponse('/tidligste-uttaksalder', {
      status: 500,
      method: 'post',
    })
    const user = userEvent.setup()
    const formatMock = vi.spyOn(velgUttaksalderUtils, 'formatUttaksalder')
    const { asFragment } = render(<TidligstMuligUttak />)
    expect(screen.getByText('Tidligst mulig uttak:')).toBeVisible()
    expect(screen.getByText('Ikke funnet')).toBeVisible()
    expect(formatMock).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button'))
    expect(asFragment()).toMatchSnapshot()
  })
})
