import { describe, it, vi } from 'vitest'

import { StepSamtykkePensjonsavtaler } from '..'
import {
  fulfilledGetPerson,
  fulfilledsimulerOffentligTp,
  fulfilledGetLoependeVedtak0Ufoeregrad,
  fulfilledGetLoependeVedtak75Ufoeregrad,
  fulfilledPensjonsavtaler,
} from '@/mocks/mockedRTKQueryApiCalls'
import { paths } from '@/router/constants'
import * as apiSliceUtils from '@/state/api/apiSlice'
import { selectHarHentetOffentligTp } from '@/state/userInput/selectors'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { screen, render, userEvent, waitFor } from '@/test-utils'

const navigateMock = vi.fn()
vi.mock(import('react-router'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('StepSamtykkePensjonsavtaler', () => {
  it('har riktig sidetittel', async () => {
    render(<StepSamtykkePensjonsavtaler />)
    expect(document.title).toBe('application.title.stegvisning.samtykke')
  })

  describe('Gitt at brukeren svarer Ja på spørsmål om samtykke', async () => {
    it('registrerer samtykke og navigerer videre til riktig side når brukeren klikker på Neste', async () => {
      const user = userEvent.setup()

      const { store } = render(<StepSamtykkePensjonsavtaler />, {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: {
              ...fulfilledGetPerson,
              ...fulfilledGetLoependeVedtak0Ufoeregrad,
            },
          },
        },
      })
      const radioButtons = screen.getAllByRole('radio')

      await user.click(radioButtons[0])
      await user.click(screen.getByText('stegvisning.neste'))

      expect(store.getState().userInput.samtykke).toBe(true)
      expect(navigateMock).toHaveBeenCalledWith(paths.beregningEnkel)
    })
  })

  describe('Gitt at brukeren svarer Nei på spørsmål om samtykke', async () => {
    it('invaliderer cache for offentlig-tp og pensjonsavtaler i storen (for å fjerne evt. data som ble hentet pga en tidligere samtykke). Navigerer videre til riktig side når brukeren klikker på Neste', async () => {
      const invalidateMock = vi.spyOn(
        apiSliceUtils.apiSlice.util.invalidateTags,
        'match'
      )

      const user = userEvent.setup()

      const { store } = render(<StepSamtykkePensjonsavtaler />, {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: {
              ...fulfilledGetPerson,
              ...fulfilledsimulerOffentligTp,
              ...fulfilledPensjonsavtaler,
              ...fulfilledGetLoependeVedtak75Ufoeregrad,
            },
          },
          userInput: {
            ...userInputInitialState,
            samtykke: true,
          },
        },
      })
      await store.dispatch(
        apiSliceUtils.apiSlice.endpoints.offentligTp.initiate()
      )
      expect(Object.keys(store.getState().api.queries).length).toEqual(4)

      expect(selectHarHentetOffentligTp(store.getState())).toBe(true)

      const radioButtons = screen.getAllByRole('radio')

      await user.click(radioButtons[1])
      await user.click(screen.getByText('stegvisning.neste'))

      expect(store.getState().userInput.samtykke).toBe(false)
      expect(invalidateMock).toHaveBeenCalledTimes(2)

      expect(navigateMock).toHaveBeenCalledWith(paths.beregningEnkel)
    })
  })

  describe('Når brukeren klikker på Tilbake, ', async () => {
    it('nullstiller input fra brukeren og navigerer et hakk tilbake.', async () => {
      const user = userEvent.setup()

      const { store } = render(<StepSamtykkePensjonsavtaler />, {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: {
              ...fulfilledGetPerson,
              ...fulfilledGetLoependeVedtak0Ufoeregrad,
            },
          },
          userInput: { ...userInputInitialState, afp: 'ja_offentlig' },
        },
        hasRouter: false,
      })
      await store.dispatch(
        apiSliceUtils.apiSlice.endpoints.getLoependeVedtak.initiate()
      )
      await waitFor(async () => {
        await user.click(screen.getByText('stegvisning.tilbake'))
        expect(navigateMock).toHaveBeenCalledWith(-1)
      })
    })

    it('nullstiller input fra brukeren og navigerer to hakk tilbake dersom brukeren har uføretrygd og er fylt minimum uttaksalder', async () => {
      const user = userEvent.setup()

      const { store } = render(<StepSamtykkePensjonsavtaler />, {
        preloadedState: {
          api: {
            queries: {
              ...fulfilledGetLoependeVedtak75Ufoeregrad,
              ['getPerson(undefined)']: {
                // @ts-ignore
                status: 'fulfilled',
                endpointName: 'getPerson',
                requestId: 'xTaE6mOydr5ZI75UXq4Wi',
                startedTimeStamp: 1688046411971,
                data: {
                  navn: 'Aprikos',
                  sivilstand: 'UGIFT',
                  foedselsdato: '1960-04-30',
                  pensjoneringAldre: {
                    normertPensjoneringsalder: {
                      aar: 67,
                      maaneder: 0,
                    },
                    nedreAldersgrense: {
                      aar: 62,
                      maaneder: 0,
                    },
                  },
                },
                fulfilledTimeStamp: 1688046412103,
              },
            },
          },
          userInput: { ...userInputInitialState, afp: 'ja_offentlig' },
        },
        hasRouter: false,
      })
      await store.dispatch(
        apiSliceUtils.apiSlice.endpoints.getLoependeVedtak.initiate()
      )
      await waitFor(async () => {
        await user.click(screen.getByText('stegvisning.tilbake'))
        expect(navigateMock).toHaveBeenCalledWith(-2)
      })
    })
  })

  describe('Gitt at brukeren er logget på som veileder', async () => {
    it('vises ikke Avbryt knapp', async () => {
      render(<StepSamtykkePensjonsavtaler />, {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: {
              ...fulfilledGetPerson,
              ...fulfilledGetLoependeVedtak0Ufoeregrad,
            },
          },
          userInput: {
            ...userInputInitialState,
            veilederBorgerFnr: '81549300',
          },
        },
      })
      expect(await screen.findAllByRole('button')).toHaveLength(4)
    })
  })
})
