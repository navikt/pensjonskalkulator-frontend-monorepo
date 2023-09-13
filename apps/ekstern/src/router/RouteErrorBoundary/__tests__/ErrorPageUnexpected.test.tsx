import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { ErrorPageUnexpected } from '../ErrorPageUnexpected'
import { externalUrls, paths } from '@/router'
import { render, screen, userEvent } from '@/test-utils'

const realLocation = window.location

describe('ErrorPageUnexpected', () => {
  afterEach(() => {
    window.location = realLocation
  })

  it('rendrer med riktig tekst og knapper', () => {
    const { asFragment } = render(<ErrorPageUnexpected />)
    expect(screen.getAllByRole('button')).toHaveLength(2)
    expect(asFragment()).toMatchSnapshot()
  })

  it('laster siden på nytt når brukeren klikker på første knapp', async () => {
    const user = userEvent.setup()
    global.window = Object.create(window)
    const reloadMock = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
    })
    render(<ErrorPageUnexpected />)
    await user.click(screen.getByText('error.global.button.primary'))
    expect(reloadMock).toHaveBeenCalled()
  })

  it('sender brukeren til landingside når brukeren klikker på andre knapp', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<ErrorPageUnexpected />)
    await user.click(screen.getByText('error.global.button.secondary'))
    expect(navigateMock.mock.lastCall?.[0]).toBe(paths.login)
  })
})
