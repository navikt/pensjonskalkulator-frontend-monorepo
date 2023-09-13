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
import { render, screen, userEvent, waitFor } from '@/test-utils'

describe('Beregning', () => {
  it('har riktig sidetittel', () => {
    render(<Beregning />)
    expect(document.title).toBe('application.title.beregning')
  })

  describe('Når tidligst mulig uttaksalder hentes', () => {
    it('viser loading og deretter riktig header, tekst og knapper', async () => {
      render(<Beregning />)
      expect(screen.getByTestId('uttaksalder-loader')).toBeVisible()
      await waitFor(async () => {
        expect(
          screen.queryByTestId('uttaksalder-loader')
        ).not.toBeInTheDocument()
        expect(await screen.findByTestId('tidligst-mulig-uttak')).toBeVisible()
        expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1)
        expect(screen.getAllByRole('button')).toHaveLength(12)
      })
    })

    it('viser ikke info om tidligst mulig uttaksalder når kallet feiler, og resten av siden er som vanlig', async () => {
      mockErrorResponse('/tidligste-uttaksalder', {
        status: 500,
        json: "Beep boop I'm an error!",
        method: 'post',
      })
      const result = render(<Beregning />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            samtykke: true,
          },
        },
      })
      await waitFor(() => {
        expect(
          screen.queryByTestId('uttaksalder-loader')
        ).not.toBeInTheDocument()
        expect(
          screen.queryByTestId('tidligst-mulig-uttak')
        ).not.toBeInTheDocument()
        expect(result.asFragment()).toMatchSnapshot()
      })
    })
  })

  describe('Når brukeren velger uttaksalder', () => {
    it('viser en loader mens beregning av alderspensjon pågår, oppdaterer valgt knapp og tegner graph, gitt at beregning av alderspensjon var vellykket', async () => {
      const user = userEvent.setup()
      const { container } = render(<Beregning />)
      const button = await screen.findByText('68 år')
      await user.click(button)
      expect(screen.getByRole('button', { pressed: true })).toHaveTextContent(
        '68 år'
      )
      expect(await screen.findByTestId('alderspensjon-loader')).toBeVisible()
      await waitFor(() => {
        expect(
          screen.queryByTestId('uttaksalder-loader')
        ).not.toBeInTheDocument()
        expect(
          container.getElementsByClassName('highcharts-container').length
        ).toBe(1)
        expect(screen.getByText('Vis tabell av beregningen')).toBeVisible()
      })
    })

    it('viser feilmelding og skjuler Grunnlag når simuleringen feiler med mulighet til å prøve på nytt', async () => {
      const initiateMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.alderspensjon,
        'initiate'
      )
      mockErrorResponse('/alderspensjon/simulering', {
        status: 500,
        json: "Beep boop I'm an error!",
        method: 'post',
      })
      const user = userEvent.setup()
      const { asFragment } = render(<Beregning />)

      await user.click(await screen.findByText('68 år'))
      expect(initiateMock).toHaveBeenCalledTimes(1)
      await waitFor(async () => {
        expect(
          await screen.findByText(
            'Vi klarte dessverre ikke å beregne pensjonen din akkurat nå'
          )
        ).toBeVisible()
        expect(
          screen.queryByText('Grunnlaget for beregningen')
        ).not.toBeInTheDocument()
        expect(asFragment()).toMatchSnapshot()
      })
      await user.click(await screen.findByText('Prøv på nytt'))
      expect(initiateMock).toHaveBeenCalledTimes(2)
      expect(
        screen.queryByText('Vis tabell av beregningen')
      ).not.toBeInTheDocument()
    })

    it('viser ErrorPageUnexpected når simulering svarer med errorcode 503', async () => {
      const cache = console.error
      console.error = () => {}

      const user = userEvent.setup()
      mockErrorResponse('/alderspensjon/simulering', {
        status: 503,
        json: "Beep boop I'm an error!",
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
      await user.click(await screen.findByText('68 år'))
      await waitFor(async () => {
        expect(
          screen.queryByTestId('alderspensjon-loader')
        ).not.toBeInTheDocument()
      })
      expect(await screen.findByText('error.global.title')).toBeVisible()
      expect(await screen.findByText('error.global.ingress')).toBeVisible()

      console.error = cache
    })

    it('viser feilmelding og skjuler Grunnlag når tidligste-uttaksalder har feilet og brukeren prøver å simulere med for lav uttaksalder', async () => {
      const currentSimulation: Simulation = {
        startAlder: 68,
        startMaaned: 1,
        uttaksgrad: 100,
        aarligInntekt: 0,
      }
      const user = userEvent.setup()
      mockErrorResponse('/tidligste-uttaksalder', {
        status: 500,
        json: "Beep boop I'm an error!",
        method: 'post',
      })
      const result = render(<Beregning />, {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            formatertUttaksalder: '68 år og 5 måneder',
            samtykke: true,
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
      await user.click(await screen.findByText('62 år'))

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
      expect(result.asFragment()).toMatchSnapshot()
    })
  })
})
