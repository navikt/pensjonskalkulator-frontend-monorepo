import { createMemoryRouter, RouterProvider } from 'react-router-dom'

import { act } from 'react-dom/test-utils'
import { describe, expect, it, vi } from 'vitest'

import { BeregningEnkel } from '../BeregningEnkel'
import { mockResponse, mockErrorResponse } from '@/mocks/server'
import { RouteErrorBoundary } from '@/router/RouteErrorBoundary'
import * as apiSliceUtils from '@/state/api/apiSlice'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { render, screen, userEvent, waitFor } from '@/test-utils'

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

  describe('Gitt at pensjonskalkulator er i "enkel" visning', () => {
    describe('Når brukeren velger uttaksalder', () => {
      it('viser en loader mens beregning av alderspensjon pågår, oppdaterer valgt knapp og tegner graph, gitt at beregning av alderspensjon var vellykket', async () => {
        const user = userEvent.setup()
        const { container } = render(<BeregningEnkel />)
        const button = await screen.findByText('68 alder.aar')

        await user.click(button)

        expect(
          screen.getAllByRole('button', { pressed: true })[0]
        ).toHaveTextContent('68 alder.aar')
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
          await new Promise((r) => {
            setTimeout(r, 500)
          })
        })

        expect(
          container.getElementsByClassName('highcharts-container').length
        ).toBe(1)
        expect(await screen.findByText('beregning.tabell.vis')).toBeVisible()
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
        render(<BeregningEnkel />)

        const button = await screen.findByText('68 alder.aar')

        await user.click(button)

        expect(initiateMock).toHaveBeenCalledTimes(1)
        await waitFor(async () => {
          expect(await screen.findByText('beregning.error')).toBeVisible()
          expect(screen.queryByText('grunnlag.title')).not.toBeInTheDocument()
        })

        const proevPaaNyttbutton = await screen.findByText(
          'application.global.retry'
        )

        await user.click(proevPaaNyttbutton)

        expect(initiateMock).toHaveBeenCalledTimes(3)
        expect(
          screen.queryByText('beregning.tabell.vis')
        ).not.toBeInTheDocument()
      })

      it('viser ErrorPageUnexpected når simulering svarer med errorcode 503', async () => {
        const cache = console.error
        console.error = () => {}

        const user = userEvent.setup()
        // Må bruke mockResponse for å få riktig status (mockErrorResponse returnerer "originalStatus")
        mockResponse('/v1/alderspensjon/simulering', {
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
        const button = await screen.findByText('68 alder.aar')

        await user.click(button)

        expect(await screen.findByText('error.global.title')).toBeVisible()
        expect(await screen.findByText('error.global.ingress')).toBeVisible()

        console.error = cache
      })

      it('Når brukeren velger en alder som de ikke har nok opptjening til, viser infomelding om at opptjeningen er for lav og skjuler Grunnlag', async () => {
        const user = userEvent.setup()
        mockResponse('/v1/alderspensjon/simulering', {
          status: 200,
          method: 'post',
          json: {
            alderspensjon: [],
            afpPrivat: [],
            vilkaarErOppfylt: false,
          },
        })
        mockErrorResponse('/v1/tidligste-uttaksalder', {
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
                formatertUttaksalder: '63 alder.aar',
                startAar: 63,
                startMaaned: 0,
                uttaksgrad: 100,
                aarligInntektFoerUttak: 0,
              },
            },
          },
        })

        await waitFor(async () => {
          expect(
            screen.queryByTestId('uttaksalder-loader')
          ).not.toBeInTheDocument()
        })

        const button = await screen.findByText('63 alder.aar')

        await user.click(button)

        expect(
          await screen.findByText(
            'Du har ikke høy nok opptjening til å kunne starte uttak ved 63 år. Prøv en høyere alder.',
            { exact: false }
          )
        ).toBeVisible()
        expect(screen.queryByText('grunnlag.title')).not.toBeInTheDocument()
        expect(
          screen.queryByText('beregning.tabell.vis')
        ).not.toBeInTheDocument()
      })
    })
  })
})
