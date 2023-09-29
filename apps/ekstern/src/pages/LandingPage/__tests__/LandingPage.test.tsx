import { describe, it, vi } from 'vitest'

import { LandingPage } from '..'
import { mockErrorResponse, mockResponse } from '@/mocks/server'
import { HOST_BASEURL } from '@/paths'
import { externalUrls } from '@/router'
import { render, screen, userEvent, waitFor } from '@/test-utils'

describe('LandingPage', () => {
  it('har riktig sidetittel', () => {
    render(<LandingPage />)
    expect(document.title).toBe('application.title')
  })

  it('rendrer innlogget side', async () => {
    mockResponse('/oauth2/session', {
      baseUrl: `${HOST_BASEURL}`,
    })
    const result = render(<LandingPage />)

    await waitFor(() => {
      expect(
        screen.getByTestId('landingside-detaljert-kalkulator-button')
          .textContent
      ).toBe('landingsside.button.detaljert_kalkulator')
      expect(result.asFragment()).toMatchSnapshot()
    })
  })

  it('rendrer utlogget side', async () => {
    mockErrorResponse('/oauth2/session', {
      baseUrl: `${HOST_BASEURL}`,
    })
    const result = render(<LandingPage />)

    await waitFor(() => {
      expect(screen.getByTestId('uinlogget-kalkulator').textContent).toBe(
        'landingsside.text.uinnlogget_kalkulator'
      )
      expect(result.asFragment()).toMatchSnapshot()
    })
  })

  it('gå til detaljert kalkulator', async () => {
    const user = userEvent.setup()
    mockResponse('/oauth2/session', {
      baseUrl: `${HOST_BASEURL}`,
    })

    const open = vi.fn()
    vi.stubGlobal('open', open)

    render(<LandingPage />)
    await waitFor(() => {
      expect(
        screen.getByTestId('landingside-detaljert-kalkulator-button')
      ).toBeDefined()
    })

    await user.click(
      screen.getByTestId('landingside-detaljert-kalkulator-button')
    )

    expect(open).toHaveBeenCalledWith(externalUrls.detaljertKalkulator, '_self')
  })
})
