import * as ReactRouterUtils from 'react-router'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'

import { describe, expect, it, vi } from 'vitest'

import { BeregningEnkel } from '../BeregningEnkel'
import {
  fulfilledGetInntekt,
  fulfilledGetPerson,
  fulfilledGetUfoeregrad,
} from '@/mocks/mockedRTKQueryApiCalls'
import { mockResponse, mockErrorResponse } from '@/mocks/server'
import { paths } from '@/router/constants'
import { RouteErrorBoundary } from '@/router/RouteErrorBoundary'
import * as apiSliceUtils from '@/state/api/apiSlice'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { render, screen, userEvent, waitFor } from '@/test-utils'

const alderspensjonResponse = require('../../../mocks/data/alderspensjon/68.json')

describe('BeregningEnkel', () => {
  describe('Når en bruker ikke mottar uføretrygd', () => {
    it('kalles endepunktet for tidligst mulig uttaksalder med riktig request body', async () => {
      const initiateMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.tidligstMuligHeltUttak,
        'initiate'
      )
      render(<BeregningEnkel />, {
        preloadedState: {
          api: {
            /* eslint-disable @typescript-eslint/ban-ts-comment */
            // @ts-ignore
            queries: {
              ...fulfilledGetPerson,
              ...fulfilledGetInntekt,
            },
          },
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            samboer: false,
            afp: 'ja_privat',
          },
        },
      })

      expect(initiateMock).toHaveBeenCalledWith(
        {
          aarligInntektFoerUttakBeloep: 521338,
          aarligInntektVsaPensjon: undefined,
          harEps: false,
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

    it('viser loading og deretter riktig header, tekst og alle knappene fra tidligst mulig uttaksalderen', async () => {
      render(<BeregningEnkel />)
      expect(screen.getByTestId('uttaksalder-loader')).toBeVisible()
      await waitFor(async () => {
        expect(
          screen.queryByTestId('uttaksalder-loader')
        ).not.toBeInTheDocument()
      })
      expect(await screen.findByTestId('tidligst-mulig-uttak')).toBeVisible()
      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1)
      expect(screen.getAllByRole('button')).toHaveLength(12)
      expect(screen.queryByTestId('om-ufoeretrygd')).not.toBeInTheDocument()
    })

    it('når kallet til TMU feiler, viser det feilmelding og alle knappene fra 62 år. Resten av siden er som vanlig', async () => {
      mockErrorResponse('/v1/tidligste-hel-uttaksalder', {
        method: 'post',
      })
      mockResponse('/v5/alderspensjon/simulering', {
        status: 200,
        method: 'post',
        json: {
          ...alderspensjonResponse,
        },
      })
      render(<BeregningEnkel />, {
        preloadedState: {
          api: {
            /* eslint-disable @typescript-eslint/ban-ts-comment */
            // @ts-ignore
            queries: {
              ...fulfilledGetPerson,
              ...fulfilledGetInntekt,
            },
          },
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            samboer: false,
          },
        },
      })

      expect(
        await screen.findByText('tidligstmuliguttak.error')
      ).toBeInTheDocument()

      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1)
      expect(screen.getAllByRole('button')).toHaveLength(15)
    })
  })

  describe('Når en bruker mottar uføretrygd', () => {
    it('hentes det ikke tidligst mulig uttaksalder', async () => {
      const initiateMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.tidligstMuligHeltUttak,
        'initiate'
      )

      render(<BeregningEnkel />, {
        preloadedState: {
          api: {
            /* eslint-disable @typescript-eslint/ban-ts-comment */
            // @ts-ignore
            queries: {
              ...fulfilledGetPerson,
              ...fulfilledGetInntekt,
              ...fulfilledGetUfoeregrad,
            },
          },
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            samboer: false,
            afp: 'ja_privat',
          },
        },
      })

      expect(initiateMock).not.toHaveBeenCalled()
      expect(screen.getAllByRole('button')).toHaveLength(10)
    })

    it('vises det riktig antall knapper fra default ubetinget uttaksalder', async () => {
      render(<BeregningEnkel />, {
        preloadedState: {
          api: {
            /* eslint-disable @typescript-eslint/ban-ts-comment */
            // @ts-ignore
            queries: {
              ...fulfilledGetPerson,
              ...fulfilledGetInntekt,
              ...fulfilledGetUfoeregrad,
            },
          },
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            samboer: false,
            afp: 'ja_privat',
          },
        },
      })

      expect(await screen.findByTestId('tidligst-mulig-uttak')).toBeVisible()
    })
  })

  describe('Når brukeren velger uttaksalder', () => {
    it('viser en loader mens beregning av alderspensjon pågår, oppdaterer valgt knapp og tegner graph og viser tabell, Grunnlag og Forbehold, gitt at beregning av alderspensjon var vellykket', async () => {
      const user = userEvent.setup()
      const { container } = render(<BeregningEnkel />)
      await user.click(await screen.findByText('68 alder.aar'))
      const buttons = await screen.findAllByRole('button', { pressed: true })
      expect(buttons[0]).toHaveTextContent('68 alder.aar')
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
      expect(await screen.findByText('grunnlag.title')).toBeInTheDocument()
      expect(
        await screen.findByText('grunnlag.forbehold.title')
      ).toBeInTheDocument()
      expect(await screen.findByText('savnerdunoe.title')).toBeInTheDocument()
      expect(await screen.findByText('savnerdunoe.ingress')).toBeInTheDocument()
    })

    it('beregnes ikke med AFP privat, når brukeren mottar uføretrygd', async () => {
      const simuleringsMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.alderspensjon,
        'initiate'
      )

      mockResponse('/v1/ufoeregrad', {
        status: 200,
        json: {
          ufoeregrad: 100,
        },
      })

      const user = userEvent.setup()
      const { store } = render(<BeregningEnkel />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            samtykke: false,
            afp: 'ja_privat',
            currentSimulation: {
              formatertUttaksalderReadOnly: '68 år string.og 0 alder.maaned',
              uttaksalder: { aar: 68, maaneder: 0 },
              aarligInntektFoerUttakBeloep: '0',
              gradertUttaksperiode: null,
            },
          },
        },
      })
      store.dispatch(apiSliceUtils.apiSlice.endpoints.getUfoeregrad.initiate())
      await user.click(await screen.findByText('68 alder.aar'))
      const buttons = await screen.findAllByRole('button', { pressed: true })
      expect(buttons[0]).toHaveTextContent('68 alder.aar')

      await waitFor(async () => {
        expect(
          screen.queryByTestId('uttaksalder-loader')
        ).not.toBeInTheDocument()
        expect(
          await screen.findByText('beregning.tabell.vis')
        ).toBeInTheDocument()
      })

      expect(simuleringsMock).toHaveBeenCalledWith(
        {
          aarligInntektFoerUttakBeloep: 0,
          epsHarInntektOver2G: true,
          foedselsdato: '1963-04-30',
          heltUttak: {
            uttaksalder: {
              aar: 68,
              maaneder: 0,
            },
          },
          simuleringstype: 'ALDERSPENSJON',
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
      ).not.toBeInTheDocument()
    })

    it('beregnes ikke med AFP offentlig, når brukeren mottar uføretrygd', async () => {
      const simuleringsMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.alderspensjon,
        'initiate'
      )
      mockResponse('/v1/ufoeregrad', {
        status: 200,
        json: {
          ufoeregrad: 100,
        },
      })
      const user = userEvent.setup()
      const { store } = render(<BeregningEnkel />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            samtykke: false,
            afp: 'ja_offentlig',
            currentSimulation: {
              formatertUttaksalderReadOnly: '68 år string.og 0 alder.maaned',
              uttaksalder: { aar: 68, maaneder: 0 },
              aarligInntektFoerUttakBeloep: '0',
              gradertUttaksperiode: null,
            },
          },
        },
      })
      store.dispatch(apiSliceUtils.apiSlice.endpoints.getUfoeregrad.initiate())
      await user.click(await screen.findByText('68 alder.aar'))
      const buttons = await screen.findAllByRole('button', { pressed: true })
      expect(buttons[0]).toHaveTextContent('68 alder.aar')

      await waitFor(async () => {
        expect(
          screen.queryByTestId('uttaksalder-loader')
        ).not.toBeInTheDocument()
        expect(
          await screen.findByText('beregning.tabell.vis')
        ).toBeInTheDocument()
      })

      expect(simuleringsMock).toHaveBeenCalledWith(
        {
          aarligInntektFoerUttakBeloep: 0,
          epsHarInntektOver2G: true,
          foedselsdato: '1963-04-30',
          heltUttak: {
            uttaksalder: {
              aar: 68,
              maaneder: 0,
            },
          },
          simuleringstype: 'ALDERSPENSJON',
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
      ).not.toBeInTheDocument()
    })

    it('viser feilmelding og skjuler Grunnlag og tabell og gir mulighet til å prøve på nytt, gitt at beregning av alderspensjon har feilet', async () => {
      const initiateMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.alderspensjon,
        'initiate'
      )
      mockErrorResponse('/v5/alderspensjon/simulering', {
        method: 'post',
      })
      const user = userEvent.setup()
      render(<BeregningEnkel />, {
        preloadedState: {
          api: {
            /* eslint-disable @typescript-eslint/ban-ts-comment */
            // @ts-ignore
            queries: {
              ...fulfilledGetPerson,
              ...fulfilledGetInntekt,
            },
          },
          userInput: {
            ...userInputInitialState,
          },
        },
      })

      await user.click(await screen.findByText('70 alder.aar'))

      await waitFor(() => {
        expect(
          screen.queryByTestId('uttaksalder-loader')
        ).not.toBeInTheDocument()
      })
      waitFor(() => {
        expect(initiateMock).toHaveBeenCalledTimes(1)
      })
      expect(await screen.findByText('beregning.error')).toBeInTheDocument()
      await waitFor(async () => {
        expect(screen.queryByText('grunnlag.title')).not.toBeInTheDocument()
      })
      await user.click(await screen.findByText('application.global.retry'))
      expect(initiateMock).toHaveBeenCalledTimes(2)
      expect(screen.queryByText('beregning.tabell.vis')).not.toBeInTheDocument()
    })

    it('viser ErrorPageUnexpected når simulering svarer med errorcode 503', async () => {
      const navigateMock = vi.fn()
      vi.spyOn(ReactRouterUtils, 'useNavigate').mockImplementation(
        () => navigateMock
      )

      const user = userEvent.setup()
      // Må bruke mockResponse for å få riktig status (mockErrorResponse returnerer "originalStatus")
      mockResponse('/v5/alderspensjon/simulering', {
        status: 503,
        method: 'post',
      })
      const router = createMemoryRouter([
        {
          path: '/',
          element: <BeregningEnkel />,
          ErrorBoundary: RouteErrorBoundary,
        },
      ])
      render(<RouterProvider router={router} />, {
        hasRouter: false,
      })

      await user.click(await screen.findByText('68 alder.aar'))
      await waitFor(() => {
        expect(navigateMock).toHaveBeenCalledWith(paths.uventetFeil)
      })
    })

    it('Når brukeren velger en alder som de ikke har nok opptjening til, viser infomelding om at opptjeningen er for lav og skjuler Grunnlag', async () => {
      const user = userEvent.setup()
      mockResponse('/v5/alderspensjon/simulering', {
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
        },
      })
      mockErrorResponse('/v1/tidligste-hel-uttaksalder', {
        method: 'post',
      })
      render(<BeregningEnkel />, {
        preloadedState: {
          api: {
            /* eslint-disable @typescript-eslint/ban-ts-comment */
            // @ts-ignore
            queries: {
              ...fulfilledGetPerson,
              ...fulfilledGetInntekt,
            },
          },
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            samboer: false,
            currentSimulation: {
              formatertUttaksalderReadOnly: '63 alder.aar',
              uttaksalder: { aar: 63, maaneder: 0 },
              aarligInntektFoerUttakBeloep: '0',
              gradertUttaksperiode: null,
            },
          },
        },
      })

      await waitFor(async () => {
        expect(
          screen.queryByTestId('uttaksalder-loader')
        ).not.toBeInTheDocument()
      })

      await user.click(await screen.findByText('63 alder.aar'))

      expect(
        await screen.findByText(
          'Du har ikke høy nok opptjening til å kunne starte uttak ved 63 år. Prøv en høyere alder.',
          { exact: false }
        )
      ).toBeVisible()
      expect(screen.queryByText('grunnlag.title')).not.toBeInTheDocument()
      expect(screen.queryByText('beregning.tabell.vis')).not.toBeInTheDocument()
    })
  })

  describe('Når brukeren har oppdatert inntekten sin og at uttaksalder er nullstilt', () => {
    it('viser det en info-alertboks som forsvinner ved å velge en ny alder', async () => {
      const user = userEvent.setup()
      render(<BeregningEnkel />, {
        preloadedState: {
          api: {
            /* eslint-disable @typescript-eslint/ban-ts-comment */
            // @ts-ignore
            queries: {
              ...fulfilledGetPerson,
              ...fulfilledGetInntekt,
            },
          },
          userInput: {
            ...userInputInitialState,
            currentSimulation: {
              ...userInputInitialState.currentSimulation,
              aarligInntektFoerUttakBeloep: '100 000',
            },
          },
        },
      })
      await waitFor(async () => {
        expect(
          screen.queryByTestId('uttaksalder-loader')
        ).not.toBeInTheDocument()
      })

      const alertBoks = await screen.findByTestId('alert-inntekt')
      expect(alertBoks).toBeVisible()

      await user.click(await screen.findByText('67 alder.aar'))
      expect(alertBoks).not.toBeVisible()
    })

    it('viser det en info-alertboks som forsvinner ved å klikke på lukke knappen', async () => {
      const user = userEvent.setup()
      render(<BeregningEnkel />, {
        preloadedState: {
          api: {
            /* eslint-disable @typescript-eslint/ban-ts-comment */
            // @ts-ignore
            queries: {
              ...fulfilledGetPerson,
              ...fulfilledGetInntekt,
            },
          },
          userInput: {
            ...userInputInitialState,
            currentSimulation: {
              ...userInputInitialState.currentSimulation,
              aarligInntektFoerUttakBeloep: '100 000',
            },
          },
        },
      })
      const alertBoks = await screen.findByTestId('alert-inntekt')
      const alertButtonBoks = alertBoks.querySelector('button')
      expect(alertBoks).toBeVisible()
      expect(alertButtonBoks).toBeInTheDocument()
      await user.click(alertButtonBoks as HTMLButtonElement)
      expect(alertBoks).not.toBeVisible()
    })
  })
})
