import * as ReactRouterUtils from 'react-router'

import { describe, it, vi } from 'vitest'

import { Step4 } from '..'
import * as Step4Utils from '../utils'
import { mockResponse, mockErrorResponse } from '@/mocks/server'
import { paths } from '@/router/constants'
import { apiSlice } from '@/state/api/apiSlice'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { screen, render, userEvent, waitFor } from '@/test-utils'

describe('Step 4', () => {
  it('har riktig sidetittel', () => {
    render(<Step4 />)
    expect(document.title).toBe('application.title.stegvisning.step4')
  })

  it('viser loader mens ekskludert, person og inntekt fetches', () => {
    render(<Step4 />)
    expect(screen.getByTestId('step4-loader')).toBeVisible()
  })

  it('rendrer Step 4 slik den skal når brukeren har svart nei på spørsmålet om samtykke,', async () => {
    render(<Step4 />, {
      preloadedState: {
        userInput: { ...userInputInitialState, samtykke: false },
      },
    })

    expect(await screen.findByRole('heading', { level: 2 })).toHaveTextContent(
      'stegvisning.afp.title'
    )
    expect(screen.getAllByRole('radio')).toHaveLength(4)
  })

  it('rendrer Step 4 slik den skal når brukeren har svart ja på spørsmålet om samtykke,', async () => {
    render(<Step4 />, {
      preloadedState: {
        userInput: { ...userInputInitialState, samtykke: true },
      },
    })

    expect(await screen.findByRole('heading', { level: 2 })).toHaveTextContent(
      'stegvisning.afp.title'
    )
    expect(screen.getAllByRole('radio')).toHaveLength(4)
  })

  describe('Gitt at brukeren er GIFT (og har dermed en samboer)', () => {
    it('Når brukeren velger afp og klikker på Beregn, registrerer afp, evaluerer samboerskapet og navigerer videre til beregning ', async () => {
      const user = userEvent.setup()
      mockResponse('/v2/person', {
        status: 200,
        json: {
          navn: 'Ola',
          sivilstand: 'GIFT',
          foedselsdato: '1963-04-30',
        },
      })

      const nesteSideMock = vi.spyOn(Step4Utils, 'getNesteSide')
      const navigateMock = vi.fn()
      vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
        () => navigateMock
      )
      const { store } = render(<Step4 />, {
        preloadedState: {
          userInput: { ...userInputInitialState, samtykke: true },
        },
      })
      // Simulerer at /person har vært kalt i et tidligere steg
      store.dispatch(apiSlice.endpoints.getPerson.initiate())

      const radioButtons = await screen.findAllByRole('radio')
      await user.click(radioButtons[0])

      expect(screen.queryByText('stegvisning.neste')).not.toBeInTheDocument()
      await user.click(screen.getByText('stegvisning.beregn'))

      expect(store.getState().userInput.afp).toBe('ja_offentlig')

      expect(nesteSideMock).toHaveBeenCalledWith(true, false)
      expect(navigateMock).toHaveBeenCalledWith(paths.beregningEnkel)
    })
  })

  describe('Gitt at brukeren er UGIFT (og har dermed muligens en samboer)', () => {
    it('Når brukeren velger afp og klikker på Neste, registrerer afp og navigerer videre til sivilstand steget', async () => {
      const user = userEvent.setup()
      mockResponse('/v2/person', {
        status: 200,
        json: {
          navn: 'Ola',
          sivilstand: 'UGIFT',
          foedselsdato: '1963-04-30',
        },
      })

      const nesteSideMock = vi.spyOn(Step4Utils, 'getNesteSide')
      const navigateMock = vi.fn()
      vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
        () => navigateMock
      )
      const { store } = render(<Step4 />, {
        preloadedState: {
          userInput: { ...userInputInitialState, samtykke: true },
        },
      })
      // Simulerer at /person har vært kalt i et tidligere steg
      store.dispatch(apiSlice.endpoints.getPerson.initiate())

      const radioButtons = await screen.findAllByRole('radio')
      await user.click(radioButtons[0])

      expect(screen.queryByText('stegvisning.beregn')).not.toBeInTheDocument()
      await user.click(screen.getByText('stegvisning.neste'))

      expect(store.getState().userInput.afp).toBe('ja_offentlig')
      expect(nesteSideMock).toHaveBeenCalledWith(false, false)
      expect(navigateMock).toHaveBeenCalledWith(paths.sivilstand)
    })
  })

  describe('Gitt at brukeren mottar uføretrygd', () => {
    it('Når brukeren velger afp = nei og klikker på Neste, registrerer afp og navigerer videre til neste steg', async () => {
      const user = userEvent.setup()
      mockResponse('/v1/ekskludert', {
        status: 200,
        json: {
          ekskludert: true,
          aarsak: 'HAR_LOEPENDE_UFOERETRYGD',
        },
      })
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
      const { store } = render(<Step4 />, {
        preloadedState: {
          userInput: { ...userInputInitialState, samtykke: true },
        },
      })
      // Simulerer at /ekskludert og /person har vært kalt i et tidligere steg
      store.dispatch(apiSlice.endpoints.getEkskludertStatus.initiate())
      store.dispatch(apiSlice.endpoints.getPerson.initiate())

      const radioButtons = await screen.findAllByRole('radio')
      await user.click(radioButtons[2])

      expect(screen.queryByText('stegvisning.beregn')).not.toBeInTheDocument()
      await user.click(screen.getByText('stegvisning.neste'))

      expect(store.getState().userInput.afp).toBe('nei')
      expect(nesteSideMock).toHaveBeenCalledWith(false, false)
      expect(navigateMock).toHaveBeenCalledWith(paths.sivilstand)
    })

    it('Når brukeren velger afp annet enn nei og klikker på Neste, registrerer afp og navigerer videre til Step 5', async () => {
      const user = userEvent.setup()
      mockResponse('/v1/ekskludert', {
        status: 200,
        json: {
          ekskludert: true,
          aarsak: 'HAR_LOEPENDE_UFOERETRYGD',
        },
      })
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
      const { store } = render(<Step4 />, {
        preloadedState: {
          userInput: { ...userInputInitialState, samtykke: true },
        },
      })
      // Simulerer at /ekskludert og /person har vært kalt i et tidligere steg
      store.dispatch(apiSlice.endpoints.getEkskludertStatus.initiate())
      store.dispatch(apiSlice.endpoints.getPerson.initiate())

      const radioButtons = await screen.findAllByRole('radio')
      await user.click(radioButtons[0])

      expect(screen.queryByText('stegvisning.beregn')).not.toBeInTheDocument()
      await user.click(screen.getByText('stegvisning.neste'))

      expect(store.getState().userInput.afp).toBe('ja_offentlig')
      expect(nesteSideMock).toHaveBeenCalledWith(false, false)
      expect(navigateMock).toHaveBeenCalledWith(paths.ufoeretrygd)
    })
  })

  describe('Gitt at kall til /person feiler og at sivilstand til brukeren er ukjent', () => {
    it('Når brukeren velger afp og klikker på Neste, registrerer afp og navigerer videre til uventet-feil side', async () => {
      const user = userEvent.setup()
      mockErrorResponse('/v2/person')
      const nesteSideMock = vi.spyOn(Step4Utils, 'getNesteSide')
      const navigateMock = vi.fn()
      vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
        () => navigateMock
      )
      const { store } = render(<Step4 />, {
        preloadedState: {
          userInput: { ...userInputInitialState, samtykke: true },
        },
      })

      const radioButtons = await screen.findAllByRole('radio')

      await user.click(radioButtons[0])
      await user.click(screen.getByText('stegvisning.neste'))

      expect(store.getState().userInput.afp).toBe('ja_offentlig')
      expect(nesteSideMock).toHaveBeenCalledWith(null, false)
      expect(navigateMock).toHaveBeenCalledWith(paths.uventetFeil)
    })
  })

  describe('Gitt at kall til /inntekt har feilet', () => {
    it('Når brukeren velger afp og klikker på Neste, registrerer afp og navigerer videre til uventet-feil side', async () => {
      const user = userEvent.setup()
      mockErrorResponse('/inntekt')
      const nesteSideMock = vi.spyOn(Step4Utils, 'getNesteSide')
      const navigateMock = vi.fn()
      vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
        () => navigateMock
      )
      const { store } = render(<Step4 />, {
        preloadedState: {
          userInput: { ...userInputInitialState, samtykke: true },
        },
      })
      // Simulerer at /person har vært kalt i et tidligere steg
      store.dispatch(apiSlice.endpoints.getPerson.initiate())

      const radioButtons = await screen.findAllByRole('radio')

      await user.click(radioButtons[0])
      await user.click(screen.getByText('stegvisning.neste'))

      expect(store.getState().userInput.afp).toBe('ja_offentlig')
      expect(nesteSideMock).toHaveBeenCalledWith(false, true)
      expect(navigateMock).toHaveBeenCalledWith(paths.uventetFeil)
    })
  })

  it('sender tilbake til steg 2 når brukeren ikke har tpo-medlemskap og klikker på Tilbake', async () => {
    const user = userEvent.setup()
    mockResponse('/tpo-medlemskap', {
      status: 200,
      json: { harTjenestepensjonsforhold: false },
    })
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<Step4 />)

    await waitFor(async () => {
      await user.click(await screen.findByText('stegvisning.tilbake'))
    })
    expect(navigateMock).toHaveBeenCalledWith(paths.samtykke)
  })

  it('sender tilbake til steg 3 når brukeren har tpo-medlemskap og klikker på Tilbake', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    render(<Step4 />, {
      preloadedState: {
        userInput: { ...userInputInitialState, samtykke: true },
      },
    })
    await waitFor(async () => {
      await user.click(await screen.findByText('stegvisning.tilbake'))
    })
    expect(navigateMock).toHaveBeenCalledWith(paths.offentligTp)
  })

  it('nullstiller input fra brukeren og redirigerer til landingssiden når brukeren klikker på Avbryt', async () => {
    const user = userEvent.setup()
    const navigateMock = vi.fn()
    vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
      () => navigateMock
    )
    const { store } = render(<Step4 />, {
      preloadedState: {
        userInput: { ...userInputInitialState, samtykke: true, afp: 'nei' },
      },
    })

    await waitFor(async () => {
      expect(screen.queryByTestId('step4-loader')).not.toBeInTheDocument()
    })

    await user.click(screen.getByText('stegvisning.avbryt'))

    expect(navigateMock).toHaveBeenCalledWith(paths.login)
    expect(store.getState().userInput.samtykke).toBe(null)
    expect(store.getState().userInput.afp).toBe(null)
  })
})
