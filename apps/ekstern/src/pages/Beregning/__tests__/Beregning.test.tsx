import { createMemoryRouter, RouterProvider } from 'react-router-dom'

import { describe, expect, it, vi } from 'vitest'

import { Beregning } from '../Beregning'
import { mockErrorResponse } from '@/mocks/server'
import { RouteErrorBoundary } from '@/router/RouteErrorBoundary'
import * as apiSliceUtils from '@/state/api/apiSlice'
import {
  userInputInitialState,
  Simulation,
} from '@/state/userInput/userInputReducer'
import { act, render, screen, userEvent, waitFor } from '@/test-utils'

describe('Beregning', () => {
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

  it('har riktig sidetittel', () => {
    render(<Beregning />)
    expect(document.title).toBe('application.title.beregning')
  })

  describe('Når tidligst mulig uttaksalder hentes', () => {
    it('kalles endepunktet med riktig request body', async () => {
      const initiateMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.tidligsteUttaksalder,
        'initiate'
      )
      render(<Beregning />, {
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
          harEps: false,
          simuleringstype: 'ALDERSPENSJON_MED_AFP_PRIVAT',
          sisteInntekt: 500000,
          sivilstand: 'UGIFT',
        },
        {
          forceRefetch: undefined,
          subscriptionOptions: {
            pollingInterval: 0,
            refetchOnFocus: undefined,
            refetchOnReconnect: undefined,
          },
        }
      )
    })
    it('viser loading og deretter riktig header, tekst og knapper', async () => {
      render(<Beregning />)
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
    it('når kallet feiler, viser ikke info om tidligst mulig uttaksalder og resten av siden er som vanlig', async () => {
      const user = userEvent.setup()
      mockErrorResponse('/v1/tidligste-uttaksalder', {
        method: 'post',
      })
      const { container } = render(<Beregning />, {
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
      await waitFor(() => {
        expect(
          screen.queryByTestId('tidligst-mulig-uttak')
        ).not.toBeInTheDocument()
      })
      const button = await screen.findByText('68 år')
      await act(async () => {
        user.click(button)
      })
      await waitFor(() => {
        expect(
          screen.queryByTestId('uttaksalder-loader')
        ).not.toBeInTheDocument()
      })
      await waitFor(async () => {
        expect(
          await screen.findByTestId('highcharts-done-drawing')
        ).toBeVisible()
      })
      // Nødvendig for at animasjonen rekker å bli ferdig
      await act(async () => {
        await new Promise((r) => setTimeout(r, 500))
      })
      expect(
        container.getElementsByClassName('highcharts-container').length
      ).toBe(1)
      expect(await screen.findByText('Vis tabell av beregningen')).toBeVisible()
    })
  })

  describe('Når brukeren velger uttaksalder', () => {
    it('viser en loader mens beregning av alderspensjon pågår, oppdaterer valgt knapp og tegner graph, gitt at beregning av alderspensjon var vellykket', async () => {
      const user = userEvent.setup()
      const { container } = render(<Beregning />)
      const button = await screen.findByText('68 år')
      await act(async () => {
        user.click(button)
      })
      expect(screen.getByRole('button', { pressed: true })).toHaveTextContent(
        '68 år'
      )
      expect(
        container.getElementsByClassName('highcharts-loading')
      ).toHaveLength(1)
      await waitFor(() => {
        expect(
          screen.queryByTestId('uttaksalder-loader')
        ).not.toBeInTheDocument()
      })
      await waitFor(async () => {
        expect(
          await screen.findByTestId('highcharts-done-drawing')
        ).toBeVisible()
      })
      // Nødvendig for at animasjonen rekker å bli ferdig
      await act(async () => {
        await new Promise((r) => setTimeout(r, 500))
      })
      expect(
        container.getElementsByClassName('highcharts-container').length
      ).toBe(1)
      expect(await screen.findByText('Vis tabell av beregningen')).toBeVisible()
    })

    it('viser feilmelding og skjuler Grunnlag og tabell når simuleringen feiler med mulighet til å prøve på nytt', async () => {
      const initiateMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.alderspensjon,
        'initiate'
      )
      mockErrorResponse('/v1/alderspensjon/simulering', {
        method: 'post',
      })
      const user = userEvent.setup()
      render(<Beregning />)

      const button = await screen.findByText('68 år')
      await act(async () => {
        user.click(button)
      })
      expect(initiateMock).toHaveBeenCalledTimes(1)
      await waitFor(async () => {
        expect(
          await screen.findByText(
            'Vi klarte dessverre ikke å beregne pensjonen din akkurat nå'
          )
        ).toBeVisible()
      })
      expect(
        screen.queryByText('Grunnlaget for beregningen')
      ).not.toBeInTheDocument()

      const proevPaaNyttbutton = await screen.findByText('Prøv på nytt')
      await act(async () => {
        await user.click(proevPaaNyttbutton)
      })
      expect(initiateMock).toHaveBeenCalledTimes(2)
      expect(
        screen.queryByText('Vis tabell av beregningen')
      ).not.toBeInTheDocument()
    })

    it('viser ErrorPageUnexpected når simulering svarer med errorcode 503', async () => {
      const cache = console.error
      console.error = () => {}

      const user = userEvent.setup()
      mockErrorResponse('/v1/alderspensjon/simulering', {
        status: 503,
        method: 'post',
      })
      const router = createMemoryRouter([
        {
          path: '/',
          element: <Beregning />,
          ErrorBoundary: RouteErrorBoundary,
        },
      ])
      render(<RouterProvider router={router} />, {
        hasRouter: false,
      })
      const button = await screen.findByText('68 år')
      await act(async () => {
        user.click(button)
      })
      expect(await screen.findByText('error.global.title')).toBeVisible()
      expect(await screen.findByText('error.global.ingress')).toBeVisible()

      console.error = cache
    })

    it('viser feilmelding og skjuler Grunnlag når tidligste-uttaksalder har feilet og brukeren prøver å simulere med for lav uttaksalder', async () => {
      const currentSimulation: Simulation = {
        startAar: 68,
        startMaaned: 5,
        uttaksgrad: 100,
        aarligInntekt: 0,
      }
      const user = userEvent.setup()
      mockErrorResponse('/v1/tidligste-uttaksalder', {
        method: 'post',
      })
      render(<Beregning />, {
        preloadedState: {
          /* eslint-disable @typescript-eslint/ban-ts-comment */
          // @ts-ignore
          api: { ...fakeApiCalls },
          userInput: {
            ...userInputInitialState,
            formatertUttaksalder: '68 år og 5 måneder',
            samtykke: true,
            samboer: false,
            currentSimulation: currentSimulation,
          },
        },
      })
      await waitFor(async () => {
        expect(
          screen.queryByTestId('uttaksalder-loader')
        ).not.toBeInTheDocument()
        expect(
          screen.queryByTestId('tidligst-mulig-uttak')
        ).not.toBeInTheDocument()
      })
      const button = await screen.findByText('62 år')
      await act(async () => {
        user.click(button)
      })
      expect(
        await screen.findByText(
          'Du har ikke høy nok opptjening til å kunne starte uttak ved 62 år. Prøv en høyere alder.'
        )
      ).toBeVisible()
      expect(
        screen.queryByText('Grunnlaget for beregningen')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText('Vis tabell av beregningen')
      ).not.toBeInTheDocument()
    })
  })
})
