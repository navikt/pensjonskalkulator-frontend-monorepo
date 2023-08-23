import { Sivilstand } from '../Sivilstand'
import { mockErrorResponse, mockResponse } from '@/mocks/server'
import { render, screen, waitFor } from '@/test-utils'

describe('Sivilstand', () => {
  it('viser riktig tekst og lenke når henting av sivilstand er vellykket', async () => {
    mockResponse('/person', {
      status: 200,
      json: { fornavn: 'Ola', sivilstand: 'GIFT', foedselsdato: '1963-04-30' },
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
      json: { fornavn: 'Ola', sivilstand: null, foedselsdato: '1963-04-30' },
    })
    render(<Sivilstand />)

    await waitFor(() => {
      expect(screen.getByText('Kunne ikke hentes')).toBeVisible()
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
      json: { fornavn: 'Ola', sivilstand: a, foedselsdato: '1963-04-30' },
    })
    render(<Sivilstand />)
    await waitFor(() => {
      expect(screen.getByText(expected)).toBeVisible()
    })
  })
})
