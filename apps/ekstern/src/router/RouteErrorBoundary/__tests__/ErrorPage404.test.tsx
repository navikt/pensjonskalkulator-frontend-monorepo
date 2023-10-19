import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { ErrorPage404 } from '../ErrorPage404'
import { externalUrls, paths } from '@/router'
import { render, screen, userEvent } from '@/test-utils'

describe('ErrorPage404', () => {
  it('rendrer med riktig tekst og knapper', () => {
    const { asFragment } = render(<ErrorPage404 />)
    expect(screen.getAllByRole('link')).toHaveLength(2)
    expect(asFragment()).toMatchSnapshot()
  })

  it('sender brukeren til landingside når brukeren klikker på første lenke', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<ErrorPage404 />)

    await user.click(screen.getByText('error.404.button.link_1'))

    expect(navigateMock.mock.lastCall?.[0]).toBe(paths.login)
  })

  it('sender brukeren til Din Pensjon når brukeren klikker på andre lenke', async () => {
    render(<ErrorPage404 />)
    const anchor = Array.from(document.querySelectorAll('a')).find(
      (el) => el.textContent === 'error.404.button.link_2'
    )
    expect((anchor as HTMLAnchorElement).getAttribute('href')).toBe(
      externalUrls.dinPensjon
    )
  })
})
