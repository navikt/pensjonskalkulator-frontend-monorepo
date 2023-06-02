import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { TilbakeEllerAvslutt } from '..'
import { render, screen, fireEvent } from '@/test-utils'
const realLocation = window.location

describe('TilbakeEllerAvslutt', () => {
  afterEach(() => {
    window.location = realLocation
  })

  it('rendrer med riktig tekst og knapper', () => {
    const { asFragment } = render(<TilbakeEllerAvslutt />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Vil du starte en ny beregning?'
    )
    expect(screen.getAllByRole('button')).toHaveLength(2)
    expect(asFragment()).toMatchSnapshot()
  })

  it('redirigerer til første steg av stegvisning når brukeren klikker på Start ny beregning', () => {
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<TilbakeEllerAvslutt />)
    fireEvent.click(screen.getByText('Start ny beregning'))
    expect(navigateMock).toHaveBeenCalledWith('/stegvisning/0')
  })

  it('redirigerer til Din Pensjon når brukeren klikker på Avslutt', () => {
    global.window = Object.create(window)
    const url = 'http://dummy.com'
    Object.defineProperty(window, 'location', {
      value: {
        href: url,
      },
      writable: true,
    })

    render(<TilbakeEllerAvslutt />)

    fireEvent.click(screen.getByText('Avslutt og gå til Din Pensjon'))
    expect(window.location.href).toBe('http://www.nav.no/pensjon')
  })
})
