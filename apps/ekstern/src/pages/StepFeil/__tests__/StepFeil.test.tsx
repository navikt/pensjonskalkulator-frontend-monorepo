import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { StepFeil } from '..'
import * as Step4Utils from '../../Step4/utils'
import { mockResponse, mockErrorResponse } from '@/mocks/server'
import { paths } from '@/router'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { screen, render, userEvent, waitFor } from '@/test-utils'
import * as sivilstandUtils from '@/utils/sivilstand'

describe('Step Feil', () => {
  it('rendrer Step Feil slik den skal når brukeren har svart på spørsmålet om samtykke,', async () => {
    render(<StepFeil />)
    expect(screen.getByTestId('loader')).toBeVisible()
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'error.global.title'
      )
    })
  })

  it('kaller /inntekt på nytt (gitt at nytt kall fremdeles feiler), og blir værende på siden', async () => {
    const user = userEvent.setup()
    mockErrorResponse('/inntekt')
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<StepFeil />)
    user.click(await screen.findByText('error.global.button'))
    await waitFor(() => {
      expect(navigateMock).not.toHaveBeenCalled()
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
    render(<StepFeil />)
    user.click(await screen.findByText('error.global.button'))
    await waitFor(() => {
      expect(navigateMock).not.toHaveBeenCalled()
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        'error.global.title'
      )
    })
  })

  it('kaller /inntekt på nytt (gitt at nytt kall er vellykket), evaluerer samboerskapet og navigerer videre til riktig side', async () => {
    mockResponse('/person', {
      status: 200,
      json: { fornavn: 'Ola', sivilstand: 'UGIFT', foedselsdato: '1963-04-30' },
    })
    const user = userEvent.setup()
    const nesteSideMock = vi.spyOn(Step4Utils, 'getNesteSide')
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<StepFeil />)
    user.click(await screen.findByText('error.global.button'))
    await waitFor(() => {
      expect(nesteSideMock).toHaveBeenCalledWith(false)
      expect(navigateMock).toHaveBeenCalledWith(paths.sivilstand)
    })
  })

  it('kaller /person på nytt (gitt at nytt kall er vellykket), evaluerer samboerskapet og navigerer videre til riktig side', async () => {
    mockResponse('/person', {
      status: 200,
      json: { fornavn: 'Ola', sivilstand: 'GIFT', foedselsdato: '1963-04-30' },
    })
    const checkHarSamboerMock = vi.spyOn(sivilstandUtils, 'checkHarSamboer')
    const nesteSideMock = vi.spyOn(Step4Utils, 'getNesteSide')
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<StepFeil />)
    await waitFor(() => {
      expect(checkHarSamboerMock).toHaveBeenCalledWith('GIFT')
      expect(nesteSideMock).toHaveBeenCalledWith(true)
      expect(navigateMock).toHaveBeenCalledWith(paths.beregning)
    })
  })

  it('redirigerer til landingssiden når brukeren klikker på knappen', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const { store } = render(<StepFeil />, {
      preloadedState: {
        userInput: {
          ...userInputInitialState,
          samtykke: true,
          afp: 'nei',
          samboer: true,
        },
      },
    })
    await user.click(await screen.findByText('error.global.button'))
    expect(navigateMock.mock.lastCall?.[0]).toBe(paths.login)
    expect(store.getState().userInput.samtykke).toBe(null)
    expect(store.getState().userInput.afp).toBe(null)
    expect(store.getState().userInput.samboer).toBe(null)
  })
})
