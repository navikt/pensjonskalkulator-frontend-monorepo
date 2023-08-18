import { waitFor } from '@testing-library/react'

import { Grunnlag } from '@/components/Grunnlag'
import { render, screen } from '@/test-utils'

describe('Grunnlag', () => {
  const tidligstMuligUttak = { aar: 62, maaned: 10, uttaksdato: '2031-11-01' }

  it('viser alle seksjonene', async () => {
    const { asFragment } = render(
      <Grunnlag tidligstMuligUttak={tidligstMuligUttak} />
    )
    expect(await screen.findByText('Tidligst mulig uttak:')).toBeVisible()
    expect(screen.getByText('62 år, 10 md.')).toBeVisible()
    await waitFor(() => {
      expect(screen.getByTestId('pensjonsavtaler')).toBeInTheDocument()
      expect(asFragment()).toMatchSnapshot()
    })
  })
})
