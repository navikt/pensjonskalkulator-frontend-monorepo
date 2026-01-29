import { describe, it, vi } from 'vitest'

import { externalUrls, paths } from '@/router/constants'
import { render, screen, userEvent } from '@/test-utils'
import {
  logOpenLinkSpy,
  loggerSpy,
  loggerTeardown,
} from '@/utils/__tests__/logging-stub'

import { ErrorPage404 } from '../ErrorPage404'

describe('ErrorPage404', () => {
  afterEach(() => {
    loggerTeardown()
  })
  it('rendrer med riktig tekst og knapper', () => {
    render(<ErrorPage404 />)
    expect(screen.getAllByRole('link')).toHaveLength(2)
  })

  it('sender brukeren til landingside når brukeren klikker på første lenke', async () => {
    render(<ErrorPage404 />)
    const btn = screen.getByText('error.404.button.link_1')

    expect(btn).toHaveAttribute('href', paths.login)
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

  it('logger når feilside åpnes', async () => {
    render(<ErrorPage404 />)
    expect(loggerSpy).toHaveBeenNthCalledWith(1, 'feilside', expect.any(Object))
  })

  it('logger når bruker går til Din pensjon', async () => {
    const windowOpenMock = vi.fn()
    vi.stubGlobal('open', windowOpenMock)

    render(<ErrorPage404 />)
    const user = userEvent.setup()
    const dinPensjonLink = screen.getByText('error.404.button.link_2')
    await user.click(dinPensjonLink)

    expect(logOpenLinkSpy).toHaveBeenCalledTimes(1)
    expect(windowOpenMock).toHaveBeenCalledTimes(1)
  })
})
