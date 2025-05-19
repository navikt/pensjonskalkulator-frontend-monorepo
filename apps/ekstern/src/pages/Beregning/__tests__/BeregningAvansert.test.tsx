import { RouterProvider, createMemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'

import { AVANSERT_FORM_NAMES } from '@/components/AvansertSkjema/utils'
import { ShowMoreRef } from '@/components/common/ShowMore/ShowMore'
import {
  fulfilledGetInntekt,
  fulfilledGetLoependeVedtak0Ufoeregrad,
  fulfilledGetLoependeVedtak75Ufoeregrad,
  fulfilledGetLoependeVedtak100Ufoeregrad,
  fulfilledGetLoependeVedtakLoependeAFPprivat,
  fulfilledGetLoependeVedtakLoependeAlderspensjon,
  fulfilledGetPerson,
} from '@/mocks/mockedRTKQueryApiCalls'
import { mockErrorResponse, mockResponse } from '@/mocks/server'
import {
  AvansertBeregningModus,
  BeregningContext,
} from '@/pages/Beregning/context'
import { RouteErrorBoundary } from '@/router/RouteErrorBoundary'
import { paths } from '@/router/constants'
import * as apiSliceUtils from '@/state/api/apiSlice'
import {
  UserInputState,
  userInputInitialState,
} from '@/state/userInput/userInputSlice'
import { fireEvent, render, screen, userEvent, waitFor } from '@/test-utils'
import * as loggerUtils from '@/utils/logging'

import { BeregningAvansert } from '../BeregningAvansert'

const navigateMock = vi.fn()
vi.mock(import('react-router'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('BeregningAvansert', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  const contextMockedValues = {
    avansertSkjemaModus: 'resultat' as AvansertBeregningModus,
    setAvansertSkjemaModus: vi.fn(),
    harAvansertSkjemaUnsavedChanges: false,
    setHarAvansertSkjemaUnsavedChanges: () => {},
    pensjonsavtalerShowMoreRef: {
      current: { focus: vi.fn() },
    } as unknown as React.RefObject<ShowMoreRef>,
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
        // @ts-ignore
        preloadedState: {
          ...preloadedState,
        },
      })
      expect(scrollToMock).toHaveBeenCalledWith(0, 0)
    })

    it('vises avansert fanen i redigeringsmodus', async () => {
      render(<BeregningAvansert />, {
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
            epsHarInntektOver2G: false,
            epsHarPensjon: false,
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
            epsHarInntektOver2G: false,
            epsHarPensjon: false,
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
            epsHarInntektOver2G: false,
            epsHarPensjon: false,
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
            epsHarInntektOver2G: false,
            epsHarPensjon: false,
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

      it('Når simuleringen svarer med en beregning, vises det simulering med tabell, Pensjonsavtaler, Grunnlag og Forbehold', async () => {
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
              // @ts-ignore
              api: { ...preloadedState.api },
              userInput: {
                ...preloadedState.userInput,
                currentSimulation: {
                  beregningsvalg: null,
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
        expect(screen.getByText('beregning.intro.title')).toBeVisible()
        expect(screen.getByText('beregning.intro.description_1')).toBeVisible()
        expect(screen.getByText('pensjonsavtaler.title')).toBeVisible()
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

        expect(await screen.findByText('grunnlag.title')).toBeInTheDocument()
        expect(
          await screen.findByText('grunnlag.forbehold.title')
        ).toBeInTheDocument()
        expect(await screen.findByText('savnerdunoe.title')).toBeInTheDocument()
        expect(
          screen.queryByText('savnerdunoe.ingress')
        ).not.toBeInTheDocument()
      })

      it('Når simuleringen svarer med vilkaarIkkeOppfylt, logges det alert og skjemaet settes i redigeringsmodus', async () => {
        const loggerSpy = vi.spyOn(loggerUtils, 'logger')
        mockResponse('/v8/alderspensjon/simulering', {
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
              // @ts-ignore
              api: { ...preloadedState.api },
              userInput: {
                ...preloadedState.userInput,
                currentSimulation: {
                  beregningsvalg: null,
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
        expect(loggerSpy).toHaveBeenCalledWith('alert vist', {
          tekst: 'Beregning avansert: Ikke høy nok opptjening',
          variant: 'warning',
        })
      })

      it('Når simuleringen feiler, logges det alert og vises resultatkort med informasjon om feilen og mulighet til å prøve på nytt', async () => {
        const user = userEvent.setup()
        const loggerSpy = vi.spyOn(loggerUtils, 'logger')
        mockErrorResponse('/v8/alderspensjon/simulering', {
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
              // @ts-ignore
              api: { ...preloadedState.api },
              userInput: {
                ...preloadedState.userInput,
                currentSimulation: {
                  beregningsvalg: null,
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
            screen.getByText('beregning.avansert.link.endre_avanserte_valg')
          ).toBeVisible()
          expect(screen.getByText('beregning.error')).toBeVisible()
        })
        expect(loggerSpy).toHaveBeenCalledWith('alert vist', {
          tekst: 'Beregning avansert: Klarte ikke beregne pensjon',
          variant: 'error',
        })
        await user.click(await screen.findByText('application.global.retry'))
        expect(initiateMock).toHaveBeenCalledTimes(3)
      })

      it('Når simulering svarer med errorcode 503, vises ErrorPageUnexpected ', async () => {
        // Må bruke mockResponse for å få riktig status (mockErrorResponse returnerer "originalStatus")
        mockResponse('/v8/alderspensjon/simulering', {
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
            // @ts-ignore
            api: { ...preloadedState.api },
            userInput: {
              ...preloadedState.userInput,
              currentSimulation: {
                beregningsvalg: null,
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

  describe('Gitt at brukeren har vedtak om alderspensjon', () => {
    it('Når simuleringen svarer med en beregning, vises det og simulering med tabell, Grunnlag og Forbehold uten Pensjonsavtaler', async () => {
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
            api: {
              // @ts-ignore
              queries: {
                ...fulfilledGetPerson,
                ...fulfilledGetInntekt,
                ...fulfilledGetLoependeVedtakLoependeAlderspensjon,
              },
            },
            userInput: {
              ...userInputInitialState,
              currentSimulation: {
                ...userInputInitialState.currentSimulation,
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
      expect(screen.getByText('beregning.intro.title.endring')).toBeVisible()
      expect(
        screen.getByText('beregning.intro.description_1.endring')
      ).toBeVisible()
      expect(
        screen.queryByText('pensjonsavtaler.title')
      ).not.toBeInTheDocument()

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
      expect(await screen.findByTestId('highcharts-done-drawing')).toBeVisible()

      expect(await screen.findByText('grunnlag.title')).toBeInTheDocument()
      expect(
        await screen.findByText('grunnlag.forbehold.title')
      ).toBeInTheDocument()
      expect(
        await screen.findByText('savnerdunoe.title.endring')
      ).toBeInTheDocument()
      expect(screen.queryByText('savnerdunoe.ingress')).not.toBeInTheDocument()
    })

    it('Når brukeren har vedtak om AFP-privat vises det beregning med AFP-privat ', async () => {
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
            api: {
              // @ts-ignore
              queries: {
                ...fulfilledGetPerson,
                ...fulfilledGetInntekt,
                ...fulfilledGetLoependeVedtakLoependeAFPprivat,
              },
            },
            userInput: {
              ...userInputInitialState,
              currentSimulation: {
                ...userInputInitialState.currentSimulation,
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

      expect(initiateMock).toHaveBeenCalledWith(
        {
          aarligInntektFoerUttakBeloep: 521338,
          epsHarInntektOver2G: false,
          epsHarPensjon: false,
          foedselsdato: '1963-04-30',
          gradertUttak: {
            aarligInntektVsaPensjonBeloep: 0,
            grad: 60,
            uttaksalder: {
              aar: 62,
              maaneder: 6,
            },
          },
          heltUttak: {
            uttaksalder: {
              aar: 67,
              maaneder: 6,
            },
          },
          simuleringstype: 'ENDRING_ALDERSPENSJON_MED_AFP_PRIVAT',
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

      await user.click(await screen.findByText('beregning.tabell.vis'))

      expect(
        screen.getByRole('columnheader', {
          name: 'beregning.highcharts.serie.inntekt.name',
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('columnheader', {
          name: 'beregning.highcharts.serie.alderspensjon.name',
        })
      ).toBeInTheDocument()
      expect(
        screen.queryByRole('columnheader', {
          name: 'beregning.highcharts.serie.afp.name',
        })
      ).toBeInTheDocument()
    })
  })

  describe('Gitt at brukeren har gradert uføretrygd', () => {
    it('Når brukeren har valgt å beregne med AFP, vises riktig intro', async () => {
      render(
        <BeregningContext.Provider
          value={{
            ...contextMockedValues,
          }}
        >
          <BeregningAvansert />
        </BeregningContext.Provider>,
        {
          preloadedState: {
            api: {
              // @ts-ignore
              queries: {
                ...fulfilledGetPerson,
                ...fulfilledGetInntekt,
                ...fulfilledGetLoependeVedtak75Ufoeregrad,
              },
            },
            userInput: {
              ...userInputInitialState,
              currentSimulation: {
                ...userInputInitialState.currentSimulation,
                beregningsvalg: 'med_afp',
              },
            },
          },
        }
      )

      expect(
        screen.getByText('beregning.intro.description_2.gradert_UT.med_afp')
      ).toBeVisible()
    })

    it('Når AFP ikke er med i beregningen, vises riktig intro', async () => {
      render(
        <BeregningContext.Provider
          value={{
            ...contextMockedValues,
          }}
        >
          <BeregningAvansert />
        </BeregningContext.Provider>,
        {
          preloadedState: {
            api: {
              // @ts-ignore
              queries: {
                ...fulfilledGetPerson,
                ...fulfilledGetInntekt,
                ...fulfilledGetLoependeVedtak75Ufoeregrad,
              },
            },
            userInput: {
              ...userInputInitialState,
              currentSimulation: {
                ...userInputInitialState.currentSimulation,
                beregningsvalg: 'uten_afp',
              },
            },
          },
        }
      )
      // beregning.intro.description_2.gradert_UT.uten_afp
      expect(
        screen.getByText(
          'Du har 75 % uføretrygd. Den kommer i tillegg til inntekt og pensjon frem til du blir 67 alder.aar. Uføretrygd vises ikke i beregningen.',
          {
            exact: false,
          }
        )
      ).toBeVisible()
    })
  })

  it('Når brukeren har 100 % uføretrygd, vises riktig intro', async () => {
    render(
      <BeregningContext.Provider
        value={{
          ...contextMockedValues,
        }}
      >
        <BeregningAvansert />
      </BeregningContext.Provider>,
      {
        preloadedState: {
          api: {
            // @ts-ignore
            queries: {
              ...fulfilledGetPerson,
              ...fulfilledGetInntekt,
              ...fulfilledGetLoependeVedtak100Ufoeregrad,
            },
          },
          userInput: {
            ...userInputInitialState,
          },
        },
      }
    )
    expect(
      screen.getByText('beregning.intro.description_2.hel_UT')
    ).toBeVisible()
  })
})
