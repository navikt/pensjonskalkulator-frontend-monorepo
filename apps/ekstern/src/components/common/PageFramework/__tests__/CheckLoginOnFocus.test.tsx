import { render as cleanRender, waitFor } from '@testing-library/react'
import { describe, it, vi } from 'vitest'

import { mockErrorResponse } from '@/mocks/server'
import { HOST_BASEURL } from '@/paths'

import { CheckLoginOnFocus } from '../CheckLoginOnFocus'

function TestComponent() {
  return <button>Klikk</button>
}

describe('CheckLoginOnFocus', () => {
  describe('sjekker igjen om brukeren er authenticated ved focus', () => {
    it('kaller /oauth2/session', async () => {
      const fetchMock = vi.spyOn(global, 'fetch')
      cleanRender(
        <CheckLoginOnFocus shouldRedirectNonAuthenticated={false}>
          <TestComponent />
        </CheckLoginOnFocus>
      )

      expect(fetchMock).toHaveBeenCalledTimes(0)

      window.dispatchEvent(new Event('focus'))

      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:8088/pensjon/kalkulator/oauth2/session'
      )
    })

    it('redirigerer til id-porten hvis shouldRedirectNonAuthenticated prop er satt og at brukeren ikke er authenticated', async () => {
      mockErrorResponse('/oauth2/session', {
        baseUrl: `${HOST_BASEURL}`,
      })

      const open = vi.fn()
      vi.stubGlobal('open', open)

      cleanRender(
        <CheckLoginOnFocus shouldRedirectNonAuthenticated>
          <TestComponent />
        </CheckLoginOnFocus>
      )

      window.dispatchEvent(new Event('focus'))
      await Promise.resolve()

      await waitFor(() => {
        expect(open).toHaveBeenCalledWith(
          'http://localhost:8088/pensjon/kalkulator/oauth2/login?redirect=%2F',
          '_self'
        )
      })
    })
  })
})
