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

    await waitFor(() => {
      const el = screen.getByTestId('accordion-sivilstand')
      expect(el).toMatchSnapshot()
    })
  })

  test.each([
    ['UOPPGITT', 'Ugift'],
    ['UGIFT', 'Ugift'],
    ['GIFT', 'Gift'],
    ['ENKE_ELLER_ENKEMANN', 'Enke / Enkemann'],
    ['SKILT', 'Skilt'],
    ['SEPARERT', 'Separert'],
    ['REGISTRERT_PARTNER', 'Registrert partner'],
    ['SEPARERT_PARTNER', 'Separert partner'],
    ['SKILT_PARTNER', 'Skilt partner'],
    ['GJENLEVENDE_PARTNER', 'Gjenlevende partner'],
  ])('viser riktig tekst når sivilstand er: %s', async (a, expected) => {
    mockResponse('/person', {
      status: 200,
      json: { fornavn: 'Ola', sivilstand: a },
    })
    render(<Sivilstand />)
    await waitFor(() => {
      expect(screen.getByText(expected)).toBeVisible()
    })
  })

  it('viser feilmelding når henting av sivilstand feiler', async () => {
    mockErrorResponse('/person')
    render(<Sivilstand />)

    await waitFor(() => {
      expect(screen.getByText('Kunne ikke hente sivilstand')).toBeVisible()
    })
  })
})
