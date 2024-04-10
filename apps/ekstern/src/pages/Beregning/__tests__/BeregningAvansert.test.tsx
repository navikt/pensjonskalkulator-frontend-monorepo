import { createMemoryRouter, RouterProvider } from 'react-router-dom'

import { describe, expect, it, vi } from 'vitest'

import { BeregningAvansert } from '../BeregningAvansert'
import { FORM_NAMES } from '@/components/RedigerAvansertBeregning/utils'
import { mockResponse, mockErrorResponse } from '@/mocks/server'
import {
  BeregningContext,
  AvansertBeregningModus,
} from '@/pages/Beregning/context'
import { RouteErrorBoundary } from '@/router/RouteErrorBoundary'
import * as apiSliceUtils from '@/state/api/apiSlice'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { UserInputState } from '@/state/userInput/userInputReducer'
import { fireEvent, render, screen, userEvent, waitFor } from '@/test-utils'
import * as loggerUtils from '@/utils/logging'

describe('BeregningAvansert', () => {
  const fakeApiCalls = {
    queries: {
      ['getPerson(undefined)']: {
        status: 'fulfilled',
        endpointName: 'getPerson',
        requestId: 'xTaE6mOydr5ZI75UXq4Wi',
        startedTimeStamp: 1688046411971,
        data: {
          fornavn: 'Aprikos',
          sivilstand: 'UGIFT',
          foedselsdato: '1963-04-30',
        },
        fulfilledTimeStamp: 1688046412103,
      },
      ['getInntekt(undefined)']: {
        status: 'fulfilled',
        endpointName: 'getInntekt',
        requestId: 'xTaE6mOydr5ZI75UXq4Wi',
        startedTimeStamp: 1688046411971,
        data: {
          beloep: 500000,
          aar: 2021,
        },
        fulfilledTimeStamp: 1688046412103,
      },
    },
  }

  const contextMockedValues = {
    avansertSkjemaModus: 'resultat' as AvansertBeregningModus,
    setAvansertSkjemaModus: vi.fn(),
    harAvansertSkjemaUnsavedChanges: false,
    setHarAvansertSkjemaUnsavedChanges: () => {},
  }

  describe('Gitt at brukeren har fylt ut stegvisningen og er kommet til beregningssiden for avansert', () => {
    const preloadedState = {
      api: { ...fakeApiCalls },
      userInput: {
        ...userInputInitialState,
        samtykke: true,
        samboer: false,
        afp: 'ja_privat',
        currentSimulation: {
          formatertUttaksalderReadOnly: null,
          uttaksalder: null,
          aarligInntektFoerUttakBeloep: null,
          gradertUttaksperiode: null,
        },
      } as UserInputState,
    }

    it('scroller på toppen av siden når en route endrer seg', async () => {
      const scrollToMock = vi.fn()
      Object.defineProperty(global.window, 'scrollTo', {
        value: scrollToMock,
        writable: true,
      })
      render(<BeregningAvansert />)
      expect(scrollToMock).toHaveBeenCalledWith(0, 0)
    })

    it('vises avansert fanen i redigeringsmodus', async () => {
      render(<BeregningAvansert />, {
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        // @ts-ignore
        preloadedState: {
          ...preloadedState,
        },
      })
      expect(
        screen.getByText(
          'beregning.avansert.rediger.inntekt_frem_til_uttak.label'
        )
      ).toBeVisible()
    })

    it('Når brukeren velger en uttaksalder og klikker på beregn, kalles alderspensjon endepunktet med riktig request body og skjemaet settes i resultatmodus', async () => {
      const user = userEvent.setup()
      const initiateMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.alderspensjon,
        'initiate'
      )
      const setAvansertSkjemaModusMock = vi.fn()

      render(
        <BeregningContext.Provider
          value={{
            ...contextMockedValues,
            avansertSkjemaModus: 'redigering' as AvansertBeregningModus,
            setAvansertSkjemaModus: setAvansertSkjemaModusMock,
          }}
        >
          <BeregningAvansert />
        </BeregningContext.Provider>,
        {
          /* eslint-disable @typescript-eslint/ban-ts-comment */
          // @ts-ignore
          preloadedState: {
            ...preloadedState,
          },
        }
      )
      // Fyller ut feltene for 100 % uttak
      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-aar`
        ),
        {
          target: { value: '67' },
        }
      )
      fireEvent.change(
        await screen.findByTestId(
          `age-picker-${FORM_NAMES.uttaksalderHeltUttak}-maaneder`
        ),
        {
          target: { value: '6' },
        }
      )
      fireEvent.change(await screen.findByTestId(FORM_NAMES.uttaksgrad), {
        target: { value: '100 %' },
      })
      await user.click(
        screen.getByTestId(`${FORM_NAMES.inntektVsaHeltUttakRadio}-nei`)
      )

      await user.click(screen.getByText('beregning.avansert.button.beregn'))
      expect(setAvansertSkjemaModusMock).toHaveBeenCalledWith('resultat')

      expect(initiateMock).toHaveBeenCalledWith(
        {
          aarligInntektFoerUttakBeloep: 500000,
          epsHarInntektOver2G: true,
          foedselsdato: '1963-04-30',
          gradertUttak: undefined,
          heltUttak: {
            aarligInntektVsaPensjon: undefined,
            uttaksalder: {
              aar: 67,
              maaneder: 6,
            },
          },
          simuleringstype: 'ALDERSPENSJON_MED_AFP_PRIVAT',
          sivilstand: 'UGIFT',
        },
        {
          forceRefetch: undefined,
          subscriptionOptions: {
            pollingInterval: 0,
            refetchOnFocus: undefined,
            refetchOnReconnect: undefined,
            skipPollingIfUnfocused: false,
          },
        }
      )
    })

    it('Når brukeren har valgt en uttaksalder og at simulering svarer med en beregning, vises det resultatkort og simulering', async () => {
      const user = userEvent.setup()
      const initiateMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.alderspensjon,
        'initiate'
      )

      const { container } = render(
        <BeregningContext.Provider
          value={{
            ...contextMockedValues,
          }}
        >
          <BeregningAvansert />
        </BeregningContext.Provider>,
        {
          preloadedState: {
            /* eslint-disable @typescript-eslint/ban-ts-comment */
            // @ts-ignore
            api: { ...fakeApiCalls },
            userInput: {
              ...preloadedState.userInput,
              currentSimulation: {
                formatertUttaksalderReadOnly: '67 år string.og 6 alder.maaned',
                uttaksalder: { aar: 67, maaneder: 6 },
                aarligInntektFoerUttakBeloep: null,
                gradertUttaksperiode: {
                  uttaksalder: { aar: 62, maaneder: 6 },
                  grad: 60,
                },
              },
            },
          },
        }
      )

      await waitFor(() => {
        expect(initiateMock).toHaveBeenCalledTimes(1)
      })
      expect(
        screen.getByText('beregning.avansert.resultatkort.tittel')
      ).toBeVisible()

      expect(
        container.getElementsByClassName('highcharts-loading')
      ).toHaveLength(1)
      await waitFor(() => {
        expect(
          screen.queryByTestId('uttaksalder-loader')
        ).not.toBeInTheDocument()
      })
      expect(await screen.findByTestId('highcharts-done-drawing')).toBeVisible()

      expect(
        await screen.findByText('beregning.tabell.vis')
      ).toBeInTheDocument()
      await user.click(
        screen.getByText('beregning.avansert.resultatkort.button')
      )
    })

    it('Når brukeren har valgt en uttaksalder og at simulering svarer med vilkaarIkkeOppfylt, logges det alert og skjemaet settes i redigeringsmodus', async () => {
      const loggerSpy = vi.spyOn(loggerUtils, 'logger')
      mockResponse('/v3/alderspensjon/simulering', {
        status: 200,
        method: 'post',
        json: {
          alderspensjon: [],
          afpPrivat: [],
          vilkaarsproeving: {
            vilkaarErOppfylt: false,
            alternativ: {
              heltUttaksalder: { aar: 67, maaneder: 0 },
              uttaksgrad: 100,
            },
          },
        },
      })

      const initiateMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.alderspensjon,
        'initiate'
      )

      const setAvansertSkjemaModusMock = vi.fn()
      render(
        <BeregningContext.Provider
          value={{
            ...contextMockedValues,
            setAvansertSkjemaModus: setAvansertSkjemaModusMock,
          }}
        >
          <BeregningAvansert />
        </BeregningContext.Provider>,
        {
          preloadedState: {
            /* eslint-disable @typescript-eslint/ban-ts-comment */
            // @ts-ignore
            api: { ...fakeApiCalls },
            userInput: {
              ...preloadedState.userInput,

              currentSimulation: {
                formatertUttaksalderReadOnly: '67 år string.og 6 alder.maaned',
                uttaksalder: { aar: 67, maaneder: 6 },
                aarligInntektFoerUttakBeloep: null,
                gradertUttaksperiode: null,
              },
            },
          },
        }
      )

      await waitFor(() => {
        expect(initiateMock).toHaveBeenCalledTimes(1)
        expect(setAvansertSkjemaModusMock).toHaveBeenCalledTimes(1)
        expect(setAvansertSkjemaModusMock).toHaveBeenCalledWith('redigering')
      })
      expect(loggerSpy).toHaveBeenCalledWith('alert', {
        tekst: 'Beregning avansert: Ikke høy nok opptjening',
      })
    })

    it('Når brukeren har valgt en uttaksalder og at simulering feiler, logges det alert og vises resultatkort med informasjon om feilen og mulighet til å prøve på nytt', async () => {
      const user = userEvent.setup()
      const loggerSpy = vi.spyOn(loggerUtils, 'logger')
      mockErrorResponse('/v3/alderspensjon/simulering', {
        method: 'post',
      })

      const initiateMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.alderspensjon,
        'initiate'
      )

      const setAvansertSkjemaModusMock = vi.fn()

      render(
        <BeregningContext.Provider
          value={{
            ...contextMockedValues,
            setAvansertSkjemaModus: setAvansertSkjemaModusMock,
          }}
        >
          <BeregningAvansert />
        </BeregningContext.Provider>,
        {
          preloadedState: {
            /* eslint-disable @typescript-eslint/ban-ts-comment */
            // @ts-ignore
            api: { ...fakeApiCalls },
            userInput: {
              ...preloadedState.userInput,
              currentSimulation: {
                formatertUttaksalderReadOnly: '67 år string.og 6 alder.maaned',
                uttaksalder: { aar: 67, maaneder: 6 },
                aarligInntektFoerUttakBeloep: null,
                gradertUttaksperiode: null,
              },
            },
          },
        }
      )

      await waitFor(() => {
        expect(initiateMock).toHaveBeenCalledTimes(1)
        expect(
          screen.getByText('beregning.avansert.resultatkort.tittel')
        ).toBeVisible()
        expect(screen.getByText('beregning.error')).toBeVisible()
      })
      expect(loggerSpy).toHaveBeenCalledWith('alert', {
        tekst: 'Beregning avansert: Klarte ikke beregne pensjon',
      })
      await user.click(await screen.findByText('application.global.retry'))
      expect(initiateMock).toHaveBeenCalledTimes(2)
      await user.click(
        screen.getByText('beregning.avansert.resultatkort.button')
      )
    })

    it('viser ErrorPageUnexpected når simulering svarer med errorcode 503', async () => {
      mockErrorResponse('/v3/alderspensjon/simulering', {
        method: 'post',
      })

      const cache = console.error
      console.error = () => {}
      // Må bruke mockResponse for å få riktig status (mockErrorResponse returnerer "originalStatus")
      mockResponse('/v3/alderspensjon/simulering', {
        status: 503,
        method: 'post',
      })

      const router = createMemoryRouter([
        {
          path: '/',
          element: (
            <BeregningContext.Provider
              value={{
                ...contextMockedValues,
              }}
            >
              <BeregningAvansert />
            </BeregningContext.Provider>
          ),
          ErrorBoundary: RouteErrorBoundary,
        },
      ])
      render(<RouterProvider router={router} />, {
        hasRouter: false,

        preloadedState: {
          /* eslint-disable @typescript-eslint/ban-ts-comment */
          // @ts-ignore
          api: { ...fakeApiCalls },
          userInput: {
            ...preloadedState.userInput,
            currentSimulation: {
              formatertUttaksalderReadOnly: '67 år string.og 6 alder.maaned',
              uttaksalder: { aar: 67, maaneder: 6 },
              aarligInntektFoerUttakBeloep: null,
              gradertUttaksperiode: null,
            },
          },
        },
      })

      expect(await screen.findByText('error.global.title')).toBeVisible()
      expect(await screen.findByText('error.global.ingress')).toBeVisible()

      console.error = cache
    })
  })
})
