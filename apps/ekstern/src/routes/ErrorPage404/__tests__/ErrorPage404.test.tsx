import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { ErrorPage404 } from '..'
import { externalUrls } from '@/routes'
import { render, screen, userEvent } from '@/test-utils'

const realLocation = window.location

describe('ErrorPage404', () => {
  afterEach(() => {
    window.location = realLocation
  })

  it('rendrer med riktig tekst og knapper', () => {
    const { asFragment } = render(<ErrorPage404 />)
    expect(screen.getAllByRole('button')).toHaveLength(2)
    expect(asFragment()).toMatchSnapshot()
  })

  it('sender brukeren til forrige siden når brukeren klikker på første knapp', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<ErrorPage404 />)

    await user.click(screen.getByText('errorpage.404.button.primary'))
    expect(navigateMock).toHaveBeenCalledWith(-1)
  })

  it('sender brukeren til Din Pensjon når brukeren klikker på andre knapp', async () => {
    const user = userEvent.setup()
    global.window = Object.create(window)
    const url = 'http://dummy.com'
    Object.defineProperty(window, 'location', {
      value: {
        href: url,
      },
      writable: true,
    })

    render(<ErrorPage404 />)

    await user.click(screen.getByText('errorpage.404.button.secondary'))
    expect(window.location.href).toBe(externalUrls.dinPensjon)
  })
})
