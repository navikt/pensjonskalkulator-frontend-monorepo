import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { Step5Feil } from '..'
import * as Step4Utils from '../../Step4/utils'
import { mockResponse, mockErrorResponse } from '@/mocks/server'
import { paths } from '@/router'
import { externalUrls } from '@/router/routes'
import { screen, render, userEvent, waitFor } from '@/test-utils'
import * as sivilstandUtils from '@/utils/sivilstand'
const realLocation = window.location
describe('Step 5 Feil', () => {
  afterEach(() => {
    window.location = realLocation
  })

  it('rendrer Step 5 Feil slik den skal når brukeren har svart på spørsmålet om samtykke,', async () => {
    render(<Step5Feil />)
    expect(screen.getByTestId('loader')).toBeVisible()
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'error.global.title'
      )
    })
  })

  it('kaller /person på nytt (gitt at nytt kall fremdeles feiler), og blir værende på siden', async () => {
    const user = userEvent.setup()
    mockErrorResponse('/person')
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<Step5Feil />)
    user.click(await screen.findByText('error.global.button.primary'))
    await waitFor(() => {
      expect(navigateMock).not.toHaveBeenCalled()
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'error.global.title'
      )
    })
  })

  it('kaller /person på nytt (gitt at nytt kall er vellykket), registrerer riktig samboerskap og navigerer videre til beregning når brukeren klikker på reload knappen', async () => {
    const user = userEvent.setup()
    mockErrorResponse('/person')
    const checkHarSamboerMock = vi.spyOn(sivilstandUtils, 'checkHarSamboer')
    const nesteSideMock = vi.spyOn(Step4Utils, 'getNesteSide')
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const { store } = render(<Step5Feil />)
    mockResponse('/person', {
      status: 200,
      json: { fornavn: 'Ola', sivilstand: 'GIFT', foedselsdato: '1963-04-30' },
    })
    await user.click(await screen.findByText('error.global.button.primary'))
    await waitFor(() => {
      expect(checkHarSamboerMock).toHaveBeenCalledWith('GIFT')
      expect(nesteSideMock).toHaveBeenCalledWith(true)
      expect(navigateMock).toHaveBeenCalledWith(paths.beregning)
      expect(store.getState().userInput.samboer).toBe(true)
    })
  })

  it('redirigerer til Din Pensjon når brukeren klikker på secondary knappen', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<Step5Feil />)
    await user.click(await screen.findByText('error.global.button.secondary'))
    expect(navigateMock.mock.lastCall?.[0]).toBe(paths.login)
  })
})
