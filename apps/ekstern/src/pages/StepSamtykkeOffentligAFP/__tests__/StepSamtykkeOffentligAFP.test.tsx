import { describe, it, vi } from 'vitest'

import { loependeVedtak0UfoeregradMock } from '@/mocks'
import { paths } from '@/router/constants'
import * as userInputReducerUtils from '@/state/userInput/userInputSlice'
import { userInputInitialState } from '@/state/userInput/userInputSlice'
import { render, screen, userEvent } from '@/test-utils'

import { StepSamtykkeOffentligAFP } from '..'

const navigateMock = vi.fn()
vi.mock(import('react-router'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('StepSamtykkeOffentligAFP', () => {
  it('har riktig sidetittel', () => {
    render(<StepSamtykkeOffentligAFP />)
    expect(document.title).toBe(
      'application.title.stegvisning.samtykke_offentlig_AFP'
    )
  })

  describe('Gitt at brukeren svarer Ja på spørsmål om samtykke til beregning av offentlig AFP', async () => {
    it('registrerer samtykke og navigerer videre til riktig side når brukeren klikker på Neste', async () => {
      const user = userEvent.setup()

      const { store } = render(<StepSamtykkeOffentligAFP />, {
        preloadedApiState: { getLoependeVedtak: loependeVedtak0UfoeregradMock },
      })
      const radioButtons = screen.getAllByRole('radio')

      await user.click(radioButtons[0])
      await user.click(screen.getByText('stegvisning.neste'))

      expect(store.getState().userInput.samtykkeOffentligAFP).toBe(true)
      expect(navigateMock).toHaveBeenCalledWith(paths.samtykke)
    })
  })

  describe('Gitt at brukeren svarer Nei på spørsmål om samtykke til beregning av offentlig AFP', async () => {
    it('registrerer samtykke og navigerer videre til riktig side når brukeren klikker på Neste', async () => {
      const user = userEvent.setup()

      const { store } = render(<StepSamtykkeOffentligAFP />, {
        preloadedApiState: { getLoependeVedtak: loependeVedtak0UfoeregradMock },
      })
      const radioButtons = screen.getAllByRole('radio')

      await user.click(radioButtons[1])
      await user.click(screen.getByText('stegvisning.neste'))

      expect(store.getState().userInput.samtykkeOffentligAFP).toBe(false)
      expect(navigateMock).toHaveBeenCalledWith(paths.samtykke)
    })
  })

  it('navigerer tilbake når brukeren klikker på Tilbake', async () => {
    const user = userEvent.setup()

    render(<StepSamtykkeOffentligAFP />, {
      preloadedState: {
        userInput: {
          ...userInputInitialState,
          afp: 'ja_offentlig',
        },
      },
    })

    await user.click(screen.getByText('stegvisning.tilbake'))

    expect(navigateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        search: expect.stringContaining('back=true') as string,
      })
    )
  })

  describe('Gitt at brukeren er logget på som veileder', async () => {
    it('vises ikke Avbryt knapp', async () => {
      render(<StepSamtykkeOffentligAFP />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            veilederBorgerFnr: '81549300',
          },
        },
      })
      expect(await screen.findAllByRole('button')).toHaveLength(4)
    })
  })

  describe('Gitt at brukeren endrer samtykke for offentlig AFP', async () => {
    it('nullstiller beregning (currentSimulation) når samtykke endres fra Ja til Nei', async () => {
      const flushCurrentSimulationMock = vi.spyOn(
        userInputReducerUtils.userInputActions,
        'flushCurrentSimulation'
      )
      const user = userEvent.setup()

      render(<StepSamtykkeOffentligAFP />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            samtykkeOffentligAFP: true,
            currentSimulation: {
              ...userInputInitialState.currentSimulation,
              uttaksalder: { aar: 67, maaneder: 0 },
            },
          },
        },
        preloadedApiState: { getLoependeVedtak: loependeVedtak0UfoeregradMock },
      })

      const radioButtons = screen.getAllByRole('radio')
      await user.click(radioButtons[1])
      await user.click(screen.getByText('stegvisning.neste'))

      expect(flushCurrentSimulationMock).toHaveBeenCalled()
    })

    it('nullstiller beregning (currentSimulation) når samtykke endres fra Nei til Ja', async () => {
      const flushCurrentSimulationMock = vi.spyOn(
        userInputReducerUtils.userInputActions,
        'flushCurrentSimulation'
      )
      const user = userEvent.setup()

      render(<StepSamtykkeOffentligAFP />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            samtykkeOffentligAFP: false,
            currentSimulation: {
              ...userInputInitialState.currentSimulation,
              uttaksalder: { aar: 67, maaneder: 0 },
            },
          },
        },
        preloadedApiState: { getLoependeVedtak: loependeVedtak0UfoeregradMock },
      })

      const radioButtons = screen.getAllByRole('radio')
      await user.click(radioButtons[0])
      await user.click(screen.getByText('stegvisning.neste'))

      expect(flushCurrentSimulationMock).toHaveBeenCalled()
    })

    it('nullstiller ikke beregning når samtykke ikke endres', async () => {
      const flushCurrentSimulationMock = vi.spyOn(
        userInputReducerUtils.userInputActions,
        'flushCurrentSimulation'
      )
      const user = userEvent.setup()

      render(<StepSamtykkeOffentligAFP />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            samtykkeOffentligAFP: true,
            currentSimulation: {
              ...userInputInitialState.currentSimulation,
              uttaksalder: { aar: 67, maaneder: 0 },
            },
          },
        },
        preloadedApiState: { getLoependeVedtak: loependeVedtak0UfoeregradMock },
      })

      const radioButtons = screen.getAllByRole('radio')
      await user.click(radioButtons[0])
      await user.click(screen.getByText('stegvisning.neste'))

      expect(flushCurrentSimulationMock).not.toHaveBeenCalled()
    })
  })
})
