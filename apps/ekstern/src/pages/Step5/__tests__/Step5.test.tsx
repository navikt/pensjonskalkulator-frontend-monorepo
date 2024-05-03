import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { Step5 } from '..'
import * as Step4Utils from '../../Step4/utils'
import { mockResponse, mockErrorResponse } from '@/mocks/server'
import { paths } from '@/router/constants'
import { apiSlice } from '@/state/api/apiSlice'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { screen, render, userEvent, waitFor } from '@/test-utils'

describe('Step 5', () => {
  it('har riktig sidetittel', () => {
    render(<Step5 />)
    expect(document.title).toBe('application.title.stegvisning.step5')
  })

  it('viser loader mens person og inntekt fetches', () => {
    render(<Step5 />)
    expect(screen.getByTestId('step5-loader')).toBeVisible()
  })

  it('rendrer Step 5 slik den skal når afp er valgt', async () => {
    render(<Step5 />, {
      preloadedState: {
        userInput: {
          ...userInputInitialState,
          samtykke: false,
          afp: 'ja_privat',
        },
      },
    })

    expect(await screen.findByRole('heading', { level: 2 })).toHaveTextContent(
      'stegvisning.ufoere.title'
    )
  })

  describe('Gitt at brukeren er GIFT (og har dermed en samboer)', () => {
    it('Når brukeren klikker på Beregn, evaluerer samboerskapet og navigerer videre til beregning', async () => {
      const user = userEvent.setup()
      mockResponse('/v1/person', {
        status: 200,
        json: {
          fornavn: 'Ola',
          sivilstand: 'GIFT',
          foedselsdato: '1963-04-30',
        },
      })

      const nesteSideMock = vi.spyOn(Step4Utils, 'getNesteSide')
      const navigateMock = vi.fn()
      vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
        () => navigateMock
      )
      const { store } = render(<Step5 />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            afp: 'ja_privat',
          },
        },
      })
      // Simulerer at /person har vært kalt i et tidligere steg
      store.dispatch(apiSlice.endpoints.getPerson.initiate())

      expect(screen.queryByText('stegvisning.neste')).not.toBeInTheDocument()

      await user.click(await screen.findByText('stegvisning.beregn'))

      expect(nesteSideMock).toHaveBeenCalledWith(true, false)
      expect(navigateMock).toHaveBeenCalledWith(paths.beregningEnkel)
    })
  })

  describe('Gitt at brukeren er UGIFT (og har dermed muligens en samboer)', () => {
    it('Når brukeren klikker på Neste, navigerer videre til sivilstand steget', async () => {
      const user = userEvent.setup()
      mockResponse('/v1/person', {
        status: 200,
        json: {
          fornavn: 'Ola',
          sivilstand: 'UGIFT',
          foedselsdato: '1963-04-30',
        },
      })

      const nesteSideMock = vi.spyOn(Step4Utils, 'getNesteSide')
      const navigateMock = vi.fn()
      vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
        () => navigateMock
      )
      const { store } = render(<Step5 />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            afp: 'ja_privat',
          },
        },
      })
      // Simulerer at /person har vært kalt i et tidligere steg
      store.dispatch(apiSlice.endpoints.getPerson.initiate())
      await waitFor(async () => {
        expect(screen.queryByTestId('step5-loader')).not.toBeInTheDocument()
      })
      expect(screen.queryByText('stegvisning.beregn')).not.toBeInTheDocument()

      await user.click(screen.getByText('stegvisning.neste'))

      expect(nesteSideMock).toHaveBeenCalledWith(false, false)
      expect(navigateMock).toHaveBeenCalledWith(paths.sivilstand)
    })
  })

  describe('Gitt at kall til /person feiler og at sivilstand til brukeren er ukjent', () => {
    it('Når brukeren klikker på Neste, navigerer videre til uventet-feil side', async () => {
      const user = userEvent.setup()
      mockErrorResponse('/v1/person')
      const nesteSideMock = vi.spyOn(Step4Utils, 'getNesteSide')
      const navigateMock = vi.fn()
      vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
        () => navigateMock
      )
      const { store } = render(<Step5 />, {
        preloadedState: {
          userInput: { ...userInputInitialState, samtykke: true },
        },
      })
      // Simulerer at /person har vært kalt i et tidligere steg
      store.dispatch(apiSlice.endpoints.getPerson.initiate())

      await user.click(await screen.findByText('stegvisning.neste'))

      expect(nesteSideMock).toHaveBeenCalledWith(null, false)
      expect(navigateMock).toHaveBeenCalledWith(paths.uventetFeil)
    })
  })

  describe('Gitt at kall til /inntekt har feilet', () => {
    it('Når brukeren klikker på Neste, navigerer videre til uventet-feil side', async () => {
      const user = userEvent.setup()
      mockErrorResponse('/inntekt')
      const nesteSideMock = vi.spyOn(Step4Utils, 'getNesteSide')
      const navigateMock = vi.fn()
      vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
        () => navigateMock
      )
      const { store } = render(<Step5 />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            afp: 'ja_privat',
          },
        },
      })
      // Simulerer at /person og /inntekthar vært kalt i et tidligere steg
      store.dispatch(apiSlice.endpoints.getPerson.initiate())
      store.dispatch(apiSlice.endpoints.getInntekt.initiate())

      await user.click(await screen.findByText('stegvisning.neste'))

      expect(nesteSideMock).toHaveBeenCalledWith(false, true)
      expect(navigateMock).toHaveBeenCalledWith(paths.uventetFeil)
    })
  })

  it('sender tilbake til Steg 4 når brukeren klikker på Tilbake', async () => {
    const user = userEvent.setup()

    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<Step5 />)

    await waitFor(async () => {
      await user.click(await screen.findByText('stegvisning.tilbake'))
    })
    expect(navigateMock).toHaveBeenCalledWith(paths.afp)
  })

  it('nullstiller input fra brukeren og redirigerer til landingssiden når brukeren klikker på Avbryt', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const { store } = render(<Step5 />, {
      preloadedState: {
        userInput: {
          ...userInputInitialState,
          samtykke: true,
          afp: 'ja_privat',
        },
      },
    })

    await user.click(await screen.findByText('stegvisning.avbryt'))

    expect(navigateMock).toHaveBeenCalledWith(paths.login)
    expect(store.getState().userInput.samtykke).toBe(null)
    expect(store.getState().userInput.afp).toBe(null)
  })
})
