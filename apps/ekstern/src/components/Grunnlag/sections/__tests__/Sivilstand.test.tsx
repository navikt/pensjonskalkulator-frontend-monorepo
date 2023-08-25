import { Sivilstand } from '../Sivilstand'
import { mockErrorResponse, mockResponse } from '@/mocks/server'
import { render, screen, waitFor } from '@/test-utils'

describe('Sivilstand', () => {
  it('viser riktig tekst og lenke når henting av sivilstand er vellykket', async () => {
    mockResponse('/person', {
      status: 200,
      json: { fornavn: 'Ola', sivilstand: 'GIFT' },
    })
    render(<Sivilstand />)

    await waitFor(async () => {
      expect(screen.queryByText('Kunne ikke hentes')).not.toBeInTheDocument()
      expect(await screen.findByText('Gift')).toBeVisible()
    })
  })

  it('viser feilmelding når henting av personopplysninger feiler', async () => {
    mockErrorResponse('/person')
    render(<Sivilstand />)

    await waitFor(() => {
      expect(screen.getByText('Kunne ikke hentes')).toBeVisible()
    })
  })

  it('viser feilmelding når henting av personopplysninger er delvis vellykket (mangler sivilstand)', async () => {
    mockResponse('/person', {
      status: 200,
      json: { fornavn: 'Ola', sivilstand: null },
    })
    render(<Sivilstand />)

    await waitFor(() => {
      expect(screen.getByText('Kunne ikke hentes')).toBeVisible()
    })
  })
})
