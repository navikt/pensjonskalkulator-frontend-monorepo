import { describe, it, vi } from 'vitest'

import { mockErrorResponse } from '@/mocks'
import { HOST_BASEURL } from '@/paths'
import { render, waitFor } from '@/test-utils'

import { CheckLoginOnFocus } from '../CheckLoginOnFocus'

function TestComponent() {
  return <button>Klikk</button>
}

describe('CheckLoginOnFocus', () => {
  describe('sjekker igjen om brukeren er authenticated ved focus', () => {
    it('kaller /oauth2/session', async () => {
      const fetchMock = vi.spyOn(global, 'fetch')
      render(
        <CheckLoginOnFocus shouldRedirectNonAuthenticated={false}>
          <TestComponent />
        </CheckLoginOnFocus>,
        { hasRouter: false }
      )

      const initialCalls = fetchMock.mock.calls.length

      window.dispatchEvent(new Event('focus'))

      expect(fetchMock).toHaveBeenCalledTimes(initialCalls + 1)
      expect(fetchMock).toHaveBeenLastCalledWith(
        'http://localhost:8088/pensjon/kalkulator/oauth2/session'
      )
    })

    it('redirigerer til id-porten hvis shouldRedirectNonAuthenticated prop er satt og at brukeren ikke er authenticated', async () => {
      mockErrorResponse('/oauth2/session', {
        baseUrl: `${HOST_BASEURL}`,
      })

      const open = vi.fn()
      vi.stubGlobal('open', open)

      render(
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
