import * as ReactRouterUtils from 'react-router'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'

import { describe, expect, it, vi } from 'vitest'

import { BeregningAvansert } from '../BeregningAvansert'
import { AVANSERT_FORM_NAMES } from '@/components/RedigerAvansertBeregning/utils'
import {
  fulfilledGetInntekt,
  fulfilledGetPerson,
  fulfilledGetLoependeVedtak0Ufoeregrad,
  fulfilledGetLoependeVedtak75Ufoeregrad,
  fulfilledGetLoependeVedtakLoependeAlderspensjonMedSisteUtbetaling,
} from '@/mocks/mockedRTKQueryApiCalls'
import { mockResponse, mockErrorResponse } from '@/mocks/server'
import {
  BeregningContext,
  AvansertBeregningModus,
} from '@/pages/Beregning/context'
import { paths } from '@/router/constants'
import { RouteErrorBoundary } from '@/router/RouteErrorBoundary'
import * as apiSliceUtils from '@/state/api/apiSlice'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { UserInputState } from '@/state/userInput/userInputReducer'
import { fireEvent, render, screen, userEvent, waitFor } from '@/test-utils'
import * as loggerUtils from '@/utils/logging'

describe('BeregningAvansert', () => {
  const contextMockedValues = {
    avansertSkjemaModus: 'resultat' as AvansertBeregningModus,
    setAvansertSkjemaModus: vi.fn(),
    harAvansertSkjemaUnsavedChanges: false,
    setHarAvansertSkjemaUnsavedChanges: () => {},
  }

  describe('Gitt at brukeren har fylt ut stegvisningen og er kommet til beregningssiden for avansert', () => {
    const preloadedState = {
      api: {
        queries: {
          ...fulfilledGetPerson,
          ...fulfilledGetInntekt,
          ...fulfilledGetLoependeVedtak0Ufoeregrad,
        },
      },
      userInput: {
        ...userInputInitialState,
        samtykke: true,
        samboer: false,
        afp: 'ja_privat',
        currentSimulation: {
          ...userInputInitialState.currentSimulation,
        },
      } as UserInputState,
    }

    it('scroller på toppen av siden når en route endrer seg', async () => {
      const scrollToMock = vi.fn()
      Object.defineProperty(global.window, 'scrollTo', {
        value: scrollToMock,
        writable: true,
      })
      render(<BeregningAvansert />, {
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        // @ts-ignore
        preloadedState: {
          ...preloadedState,
        },
      })
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

    describe('Gitt at brukeren har fylt ut skjemaet og valgt en uttaksalder,', () => {
      it('Når hen har valgt AFP-privat og klikker på beregn, kalles alderspensjon endepunktet med riktig request body og skjemaet settes i resultatmodus', async () => {
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
            `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
          ),
          {
            target: { value: '67' },
          }
        )
        fireEvent.change(
          await screen.findByTestId(
            `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
          ),
          {
            target: { value: '6' },
          }
        )
        fireEvent.change(
          await screen.findByTestId(AVANSERT_FORM_NAMES.uttaksgrad),
          {
            target: { value: '100 %' },
          }
        )
        await user.click(
          screen.getByTestId(
            `${AVANSERT_FORM_NAMES.inntektVsaHeltUttakRadio}-nei`
          )
        )

        await user.click(screen.getByText('beregning.avansert.button.beregn'))
        expect(setAvansertSkjemaModusMock).toHaveBeenCalledWith('resultat')

        expect(initiateMock).toHaveBeenCalledWith(
          {
            aarligInntektFoerUttakBeloep: 521338,
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
            utenlandsperiodeListe: [],
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

      it('Når hen mottar uføretrygd og har valgt AFP-privat og klikker på beregn, kalles alderspensjon endepunktet med riktig request body og skjemaet settes i resultatmodus', async () => {
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
            preloadedState: {
              ...preloadedState,
              api: {
                /* eslint-disable @typescript-eslint/ban-ts-comment */
                // @ts-ignore
                queries: {
                  ...fulfilledGetPerson,
                  ...fulfilledGetInntekt,
                  ...fulfilledGetLoependeVedtak75Ufoeregrad,
                },
              },
            },
          }
        )
        // Fyller ut feltene for 100 % uttak
        fireEvent.change(
          await screen.findByTestId(
            `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
          ),
          {
            target: { value: '67' },
          }
        )
        fireEvent.change(
          await screen.findByTestId(
            `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
          ),
          {
            target: { value: '6' },
          }
        )
        fireEvent.change(
          await screen.findByTestId(AVANSERT_FORM_NAMES.uttaksgrad),
          {
            target: { value: '100 %' },
          }
        )
        await user.click(
          screen.getByTestId(
            `${AVANSERT_FORM_NAMES.inntektVsaHeltUttakRadio}-nei`
          )
        )

        await user.click(screen.getByText('beregning.avansert.button.beregn'))
        expect(setAvansertSkjemaModusMock).toHaveBeenCalledWith('resultat')

        expect(initiateMock).toHaveBeenCalledWith(
          {
            aarligInntektFoerUttakBeloep: 521338,
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
            simuleringstype: 'ALDERSPENSJON',
            sivilstand: 'UGIFT',
            utenlandsperiodeListe: [],
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

      it('Når hen har valgt AFP-offentlig og har samtykket til beregning og klikker på beregn, kalles alderspensjon endepunktet med riktig request body og skjemaet settes i resultatmodus', async () => {
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
              userInput: {
                ...preloadedState.userInput,
                afp: 'ja_offentlig',
                samtykkeOffentligAFP: true,
              },
            },
          }
        )
        // Fyller ut feltene for 100 % uttak
        fireEvent.change(
          await screen.findByTestId(
            `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
          ),
          {
            target: { value: '67' },
          }
        )
        fireEvent.change(
          await screen.findByTestId(
            `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
          ),
          {
            target: { value: '6' },
          }
        )
        fireEvent.change(
          await screen.findByTestId(AVANSERT_FORM_NAMES.uttaksgrad),
          {
            target: { value: '100 %' },
          }
        )
        await user.click(
          screen.getByTestId(
            `${AVANSERT_FORM_NAMES.inntektVsaHeltUttakRadio}-nei`
          )
        )

        await user.click(screen.getByText('beregning.avansert.button.beregn'))
        expect(setAvansertSkjemaModusMock).toHaveBeenCalledWith('resultat')

        expect(initiateMock).toHaveBeenCalledWith(
          {
            aarligInntektFoerUttakBeloep: 521338,
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
            simuleringstype: 'ALDERSPENSJON_MED_AFP_OFFENTLIG_LIVSVARIG',
            sivilstand: 'UGIFT',
            utenlandsperiodeListe: [],
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

      it('Når hen har valgt AFP-offentlig uten å ha samtykket til beregning og klikker på beregn, kalles alderspensjon endepunktet med riktig request body og skjemaet settes i resultatmodus', async () => {
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
              userInput: {
                ...preloadedState.userInput,
                afp: 'ja_offentlig',
                samtykkeOffentligAFP: false,
              },
            },
          }
        )
        // Fyller ut feltene for 100 % uttak
        fireEvent.change(
          await screen.findByTestId(
            `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-aar`
          ),
          {
            target: { value: '67' },
          }
        )
        fireEvent.change(
          await screen.findByTestId(
            `age-picker-${AVANSERT_FORM_NAMES.uttaksalderHeltUttak}-maaneder`
          ),
          {
            target: { value: '6' },
          }
        )
        fireEvent.change(
          await screen.findByTestId(AVANSERT_FORM_NAMES.uttaksgrad),
          {
            target: { value: '100 %' },
          }
        )
        await user.click(
          screen.getByTestId(
            `${AVANSERT_FORM_NAMES.inntektVsaHeltUttakRadio}-nei`
          )
        )

        await user.click(screen.getByText('beregning.avansert.button.beregn'))
        expect(setAvansertSkjemaModusMock).toHaveBeenCalledWith('resultat')

        expect(initiateMock).toHaveBeenCalledWith(
          {
            aarligInntektFoerUttakBeloep: 521338,
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
            simuleringstype: 'ALDERSPENSJON',
            sivilstand: 'UGIFT',
            utenlandsperiodeListe: [],
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

      it('Når simuleringen svarer med en beregning, vises det resultatkort og simulering med tabell, Grunnlag og Forbehold', async () => {
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
              api: { ...preloadedState.api },
              userInput: {
                ...preloadedState.userInput,
                currentSimulation: {
                  utenlandsperioder: [],
                  formatertUttaksalderReadOnly:
                    '67 år string.og 6 alder.maaned',
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
        await waitFor(async () => {
          expect(
            screen.queryByTestId('uttaksalder-loader')
          ).not.toBeInTheDocument()
          expect(
            await screen.findByText('beregning.tabell.vis')
          ).toBeInTheDocument()
        })
        expect(
          await screen.findByTestId('highcharts-done-drawing')
        ).toBeVisible()

        await user.click(
          screen.getByText('beregning.avansert.resultatkort.button')
        )

        expect(await screen.findByText('grunnlag.title')).toBeInTheDocument()
        expect(
          await screen.findByText('grunnlag.forbehold.title')
        ).toBeInTheDocument()
        expect(await screen.findByText('savnerdunoe.title')).toBeInTheDocument()
        expect(
          screen.queryByText('savnerdunoe.ingress')
        ).not.toBeInTheDocument()
      })

      it('Når simuleringen svarer med en beregning og brukeren har loepende vedtak om alderspensjon vises det informasjon om det', async () => {
        const user = userEvent.setup()
        const initiateMock = vi.spyOn(
          apiSliceUtils.apiSlice.endpoints.alderspensjon,
          'initiate'
        )

        const { asFragment } = render(
          <BeregningContext.Provider
            value={{
              ...contextMockedValues,
            }}
          >
            <BeregningAvansert />
          </BeregningContext.Provider>,
          {
            preloadedState: {
              ...preloadedState,
              api: {
                /* eslint-disable @typescript-eslint/ban-ts-comment */
                // @ts-ignore
                queries: {
                  ...fulfilledGetPerson,
                  ...fulfilledGetInntekt,
                  ...fulfilledGetLoependeVedtakLoependeAlderspensjonMedSisteUtbetaling,
                },
              },
              userInput: {
                ...userInputInitialState,
                samtykke: false,
                samboer: false,
                afp: 'nei',
                currentSimulation: {
                  utenlandsperioder: [],
                  formatertUttaksalderReadOnly:
                    '67 år string.og 6 alder.maaned',
                  uttaksalder: { aar: 67, maaneder: 6 },
                  aarligInntektFoerUttakBeloep: null,
                  gradertUttaksperiode: {
                    uttaksalder: { aar: 62, maaneder: 6 },
                    grad: 60,
                  },
                },
              } as UserInputState,
            },
          }
        )

        await waitFor(() => {
          expect(initiateMock).toHaveBeenCalledTimes(1)
        })
        expect(
          screen.getByText('beregning.avansert.resultatkort.tittel')
        ).toBeVisible()

        expect(screen.getByText('Du har i dag', { exact: false })).toBeVisible()
        expect(screen.getByText('Du har i dag', { exact: false })).toBeVisible()
        expect(screen.getByText('var dette', { exact: false })).toBeVisible()
        expect(asFragment()).toMatchSnapshot()
      })

      it('Når simuleringen svarer med vilkaarIkkeOppfylt, logges det alert og skjemaet settes i redigeringsmodus', async () => {
        const loggerSpy = vi.spyOn(loggerUtils, 'logger')
        mockResponse('/v6/alderspensjon/simulering', {
          status: 200,
          method: 'post',
          json: {
            alderspensjon: [],
            vilkaarsproeving: {
              vilkaarErOppfylt: false,
              alternativ: {
                heltUttaksalder: { aar: 67, maaneder: 0 },
                uttaksgrad: 100,
              },
            },
            harForLiteTrygdetid: false,
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
              api: { ...preloadedState.api },
              userInput: {
                ...preloadedState.userInput,

                currentSimulation: {
                  utenlandsperioder: [],
                  formatertUttaksalderReadOnly:
                    '67 år string.og 6 alder.maaned',
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

      it('Når simuleringen feiler, logges det alert og vises resultatkort med informasjon om feilen og mulighet til å prøve på nytt', async () => {
        const user = userEvent.setup()
        const loggerSpy = vi.spyOn(loggerUtils, 'logger')
        mockErrorResponse('/v6/alderspensjon/simulering', {
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
              api: { ...preloadedState.api },
              userInput: {
                ...preloadedState.userInput,
                currentSimulation: {
                  utenlandsperioder: [],
                  formatertUttaksalderReadOnly:
                    '67 år string.og 6 alder.maaned',
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
        expect(initiateMock).toHaveBeenCalledTimes(3)
        await user.click(
          screen.getByText('beregning.avansert.resultatkort.button')
        )
      })

      it('Når simulering svarer med errorcode 503, vises ErrorPageUnexpected ', async () => {
        const navigateMock = vi.fn()
        vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
          () => navigateMock
        )

        // Må bruke mockResponse for å få riktig status (mockErrorResponse returnerer "originalStatus")
        mockResponse('/v6/alderspensjon/simulering', {
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
            api: { ...preloadedState.api },
            userInput: {
              ...preloadedState.userInput,
              currentSimulation: {
                utenlandsperioder: [],
                formatertUttaksalderReadOnly: '67 år string.og 6 alder.maaned',
                uttaksalder: { aar: 67, maaneder: 6 },
                aarligInntektFoerUttakBeloep: null,
                gradertUttaksperiode: null,
              },
            },
          },
        })

        await waitFor(() => {
          expect(navigateMock).toHaveBeenCalledWith(paths.uventetFeil)
        })
      })
    })
  })
})
