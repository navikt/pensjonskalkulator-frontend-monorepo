import { describe, it } from 'vitest'

import { VeilederInput } from '../'
import { BASE_PATH, paths } from '@/router/constants'
import * as apiSliceUtils from '@/state/api/apiSlice'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import * as userInputReducerUtils from '@/state/userInput/userInputReducer'
import {
  render,
  screen,
  waitFor,
  userEvent,
  swallowErrorsAsync,
} from '@/test-utils'

const previousWindow = window

describe('VeilederInput', () => {
  afterEach(() => {
    vi.clearAllMocks()
    vi.resetAllMocks()
    global.window = previousWindow
  })

  describe('Gitt at veilederen besøker en side som er ekskludert', () => {
    it('Når veilederen klikker på tittelen, vises det ansattid med vanlig side under', async () => {
      const user = userEvent.setup()
      global.window = Object.create(window)
      Object.defineProperty(window, 'location', {
        value: {
          href: 'before',
          pathname: `/veileder${paths.forbehold}`,
        },
        writable: true,
      })
      render(<VeilederInput />, {
        hasRouter: false,
      })
      expect(window.location.href).toBe('before')

      await user.click(screen.getByText('Pensjonskalkulator', { exact: true }))
      expect(window.location.href).toBe(`${BASE_PATH}/veileder`)
      expect(screen.getByTestId('veileder-ekskludert-side')).toBeVisible()
      expect(screen.getByText('ABC123')).toBeVisible()
    })
  })

  describe('Gitt at borger ikke er valgt', () => {
    it('viser sjema med input og submit knapp', () => {
      render(<VeilederInput />, { hasRouter: false })
      expect(screen.getByTestId('borger-fnr-input')).toBeInTheDocument()
    })

    it('Når borger fnr tastes inn og submit knappen trykkes på, lagres fnr og encrypted fnr i store', async () => {
      const setVeilederBorgerFnrMock = vi.spyOn(
        userInputReducerUtils.userInputActions,
        'setVeilederBorgerFnr'
      )
      const invalidateMock = vi.spyOn(
        apiSliceUtils.apiSlice.util.invalidateTags,
        'match'
      )
      const user = userEvent.setup()
      render(<VeilederInput />, { hasRouter: false })
      expect(screen.getByText('Veiledertilgang')).toBeVisible()
      const submitButton = screen.getByTestId('veileder-submit')
      expect(submitButton).toHaveTextContent('Logg inn')

      const input = screen.getByTestId('borger-fnr-input')
      await user.clear(input)
      await user.type(input, '1')
      await user.type(input, '0')
      await user.type(input, '0')
      await user.type(input, '3')
      await user.type(input, '6')
      await user.type(input, '5')
      await user.type(input, '9')
      await user.type(input, '9')
      await user.type(input, '9')
      await user.type(input, '9')
      await user.type(input, '9')

      await user.click(submitButton)

      expect(setVeilederBorgerFnrMock).toHaveBeenCalledWith({
        encryptedFnr: 'this-is-just-jibbrish-encrypted-fnr',
        fnr: '10036599999',
      })
      expect(invalidateMock).toHaveBeenCalled()
    })

    it('Når en feil oppstår ved fnr encription, vises det riktig feilmelding', async () => {
      const fetchMock = vi
        .spyOn(global, 'fetch')
        .mockResolvedValueOnce({
          // headers: Headers,
          ok: true,
          status: 200,
          statusText: 'fullfilled',
          type: 'default',
          url: 'http://localhost:8088/pensjon/kalkulator/oauth2/session',
          redirected: false,
          // clone: () => Resp
          //  error (): Response
          // json(data: any, init?: ResponseInit): Response
          // redirect (url: string | URL, status: ResponseRedirectStatus): Response } as unknown as Response)
        } as Response)
        .mockResolvedValue({
          // headers: Headers,
          ok: false,
          status: 503,
          statusText: 'error',
          type: 'default',
          url: 'http://localhost:8088/pensjon/kalkulator/v1/encrypt',
          redirected: false,
          // clone: () => Resp
          //  error (): Response
          // json(data: any, init?: ResponseInit): Response
          // redirect (url: string | URL, status: ResponseRedirectStatus): Response } as unknown as Response)
        } as Response)

      const user = userEvent.setup()

      await swallowErrorsAsync(async () => {
        render(<VeilederInput />, { hasRouter: false })
        expect(screen.getByText('Veiledertilgang')).toBeVisible()
        const submitButton = screen.getByTestId('veileder-submit')
        expect(submitButton).toHaveTextContent('Logg inn')

        const input = screen.getByTestId('borger-fnr-input')
        await user.clear(input)
        await user.type(input, '1')
        await user.type(input, '0')
        await user.type(input, '0')
        await user.type(input, '3')
        await user.type(input, '6')
        await user.type(input, '5')
        await user.type(input, '9')
        await user.type(input, '9')
        await user.type(input, '9')
        await user.type(input, '9')
        await user.type(input, '9')

        await user.click(submitButton)
        expect(fetchMock).toHaveBeenCalledTimes(3)
        expect(fetchMock).toHaveBeenNthCalledWith(
          1,
          'http://localhost:8088/pensjon/kalkulator/oauth2/session'
        )
        expect(fetchMock).toHaveBeenNthCalledWith(
          3,
          'http://localhost:8088/pensjon/kalkulator/api/v1/encrypt',
          {
            body: '10036599999',
            method: 'POST',
          }
        )
      })
    })
  })

  describe('Gitt at borger er valgt', () => {
    it('viser kalkulatoren', async () => {
      render(<VeilederInput />, {
        hasRouter: false,
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            veilederBorgerFnr: '12345678901',
          },
        },
      })
      await waitFor(async () => {
        expect(screen.queryByTestId('borger-fnr-input')).not.toBeInTheDocument()
      })
    })

    it('Når veilederen klikker på tittelen', async () => {
      const user = userEvent.setup()
      global.window = Object.create(window)
      Object.defineProperty(window, 'location', {
        value: {
          href: 'before',
          pathname: 'before',
        },
        writable: true,
      })
      render(<VeilederInput />, {
        hasRouter: false,
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            veilederBorgerFnr: '12345678901',
          },
        },
      })
      expect(window.location.href).toBe('before')

      await user.click(screen.getByText('Pensjonskalkulator', { exact: true }))
      expect(window.location.href).toBe(`${BASE_PATH}/veileder`)
    })

    it('viser inaktivet alert', async () => {
      vi.spyOn(URLSearchParams.prototype, 'has').mockImplementation(() => true)
      render(<VeilederInput />, {
        hasRouter: false,
      })
      await waitFor(async () => {
        expect(screen.getByTestId('inaktiv-alert')).toBeInTheDocument()
      })
    })
  })
})
