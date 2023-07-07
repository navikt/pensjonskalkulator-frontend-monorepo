import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { TilbakeEllerAvslutt } from '..'
import { paths } from '@/routes'
import { RootState } from '@/state/store'
import { render, screen, userEvent } from '@/test-utils'

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

  it('nullstiller input fra brukeren og redirigerer til første steg av stegvisning når brukeren klikker på Start ny beregning', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const { store } = render(<TilbakeEllerAvslutt />, {
      preloadedState: { userInput: { samtykke: true } } as RootState,
    })

    await user.click(screen.getByText('Start ny beregning'))
    expect(navigateMock).toHaveBeenCalledWith(paths.start)
    expect(store.getState().userInput.samtykke).toBe(null)
  })

  it('redirigerer til Din Pensjon når brukeren klikker på Avslutt', async () => {
    const user = userEvent.setup()
    global.window = Object.create(window)
    const url = 'http://dummy.com'
    Object.defineProperty(window, 'location', {
      value: {
        href: url,
      },
      writable: true,
    })

    render(<TilbakeEllerAvslutt />)

    await user.click(screen.getByText('Avslutt og gå til Din Pensjon'))
    expect(window.location.href).toBe('http://www.nav.no/pensjon')
  })
})
