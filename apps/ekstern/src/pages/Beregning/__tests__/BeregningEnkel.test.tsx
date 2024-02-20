import { createMemoryRouter, RouterProvider } from 'react-router-dom'

import { describe, expect, it, vi } from 'vitest'

import { BeregningEnkel } from '../BeregningEnkel'
import { mockResponse, mockErrorResponse } from '@/mocks/server'
import { RouteErrorBoundary } from '@/router/RouteErrorBoundary'
import * as apiSliceUtils from '@/state/api/apiSlice'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { render, screen, userEvent, waitFor } from '@/test-utils'

const alderspensjonResponse = require('../../../mocks/data/alderspensjon/68.json')

describe('BeregningEnkel', () => {
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

  describe('Når tidligst mulig uttaksalder hentes', () => {
    it('kalles endepunktet med riktig request body', async () => {
      const initiateMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.tidligstMuligHeltUttak,
        'initiate'
      )
      render(<BeregningEnkel />, {
        preloadedState: {
          /* eslint-disable @typescript-eslint/ban-ts-comment */
          // @ts-ignore
          api: { ...fakeApiCalls },
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
          aarligInntektFoerUttakBeloep: 500000,
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

    it('viser loading og deretter riktig header, tekst og knapper', async () => {
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
    })

    it('når kallet til TMU feiler, viser det feilmelding og alle knappene fra 62 år. Resten av siden er som vanlig', async () => {
      mockErrorResponse('/v1/tidligste-hel-uttaksalder', {
        method: 'post',
      })
      mockResponse('/v2/alderspensjon/simulering', {
        status: 200,
        method: 'post',
        json: {
          ...alderspensjonResponse,
        },
      })
      render(<BeregningEnkel />, {
        preloadedState: {
          /* eslint-disable @typescript-eslint/ban-ts-comment */
          // @ts-ignore
          api: { ...fakeApiCalls },
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

  describe('Når brukeren velger uttaksalder', () => {
    it('viser en loader mens beregning av alderspensjon pågår, oppdaterer valgt knapp og tegner graph, gitt at beregning av alderspensjon var vellykket', async () => {
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
    })

    it('viser feilmelding og skjuler Grunnlag og tabell og gir mulighet til å prøve på nytt, gitt at beregning av alderspensjon har feilet', async () => {
      const initiateMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.alderspensjon,
        'initiate'
      )
      mockErrorResponse('/v2/alderspensjon/simulering', {
        method: 'post',
      })
      const user = userEvent.setup()
      render(<BeregningEnkel />, {
        preloadedState: {
          /* eslint-disable @typescript-eslint/ban-ts-comment */
          // @ts-ignore
          api: { ...fakeApiCalls },
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
      const cache = console.error
      console.error = () => {}

      const user = userEvent.setup()
      // Må bruke mockResponse for å få riktig status (mockErrorResponse returnerer "originalStatus")
      mockResponse('/v2/alderspensjon/simulering', {
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

      expect(await screen.findByText('error.global.title')).toBeVisible()
      expect(await screen.findByText('error.global.ingress')).toBeVisible()

      console.error = cache
    })

    it('Når brukeren velger en alder som de ikke har nok opptjening til, viser infomelding om at opptjeningen er for lav og skjuler Grunnlag', async () => {
      const user = userEvent.setup()
      mockResponse('/v2/alderspensjon/simulering', {
        status: 200,
        method: 'post',
        json: {
          alderspensjon: [],
          afpPrivat: [],
          vilkaarErOppfylt: false,
        },
      })
      mockErrorResponse('/v1/tidligste-hel-uttaksalder', {
        method: 'post',
      })
      render(<BeregningEnkel />, {
        preloadedState: {
          /* eslint-disable @typescript-eslint/ban-ts-comment */
          // @ts-ignore
          api: { ...fakeApiCalls },
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            samboer: false,
            currentSimulation: {
              formatertUttaksalderReadOnly: '63 alder.aar',
              uttaksalder: { aar: 63, maaneder: 0 },
              aarligInntektFoerUttakBeloep: 0,
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
          /* eslint-disable @typescript-eslint/ban-ts-comment */
          // @ts-ignore
          api: { ...fakeApiCalls },
          userInput: {
            ...userInputInitialState,
            currentSimulation: {
              ...userInputInitialState.currentSimulation,
              aarligInntektFoerUttakBeloep: 100000,
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
          /* eslint-disable @typescript-eslint/ban-ts-comment */
          // @ts-ignore
          api: { ...fakeApiCalls },
          userInput: {
            ...userInputInitialState,
            currentSimulation: {
              ...userInputInitialState.currentSimulation,
              aarligInntektFoerUttakBeloep: 100000,
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
