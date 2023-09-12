import { describe, expect, it } from 'vitest'

import { Beregning } from '../Beregning'
import { mockErrorResponse, mockResponse } from '@/mocks/server'
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
    // it('viser loader når alderspensjon/afp-privat beregnes', async () => {
    //   render(<Simulering showAfp={false} showButtonsAndTable={true} />, {
    //     preloadedState: {
    //       userInput: {
    //         ...userInputInitialState,
    //         afp: 'nei',
    //         samtykke: true,
    //         samboer: true,
    //         currentSimulation: { ...currentSimulation },
    //       },
    //     },
    //   })
    //   expect(await screen.findByTestId('loader')).toBeVisible()
    // })

    // it('viser feilmelding når alderspensjon/afp-privat feiler', async () => {
    //   mockErrorResponse('/alderspensjon/simulering', {
    //     status: 500,
    //     json: "Beep boop I'm an error!",
    //     method: 'post',
    //   })
    //   const { asFragment } = render(<Simulering />, {
    //     preloadedState: {
    //       userInput: {
    //         ...userInputInitialState,
    //         samtykke: true,
    //         currentSimulation: { ...currentSimulation },
    //       },
    //     },
    //   })

    //   await waitFor(async () => {
    //     expect(
    //       await screen.findByText(
    //         'TODO PEK-119 feilhåndtering Vi klarte ikke å simulere pensjonen din'
    //       )
    //     ).toBeVisible()
    //     expect(asFragment()).toMatchSnapshot()
    //   })
    // })
    it('viser loading og deretter riktig header, tekst og knapper', async () => {
      const result = render(<Beregning />)
      expect(screen.getByTestId('loader')).toBeVisible()
      await waitFor(() => {
        expect(screen.queryByTestId('loader')).not.toBeInTheDocument()
      })
      expect(screen.getByTestId('tidligst-mulig-uttak')).toBeVisible()
      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(1)
      expect(screen.getAllByRole('button')).toHaveLength(12)
      expect(result.asFragment()).toMatchSnapshot()
    })

    // TODO PEK-119 - utvide med sjekk på at feilmeldingen dukker riktig opp under Grunnlag (etter merge)
    // it('viser feilmelding når henting av tidligst mulig uttaksalder feiler', async () => {
    //   mockErrorResponse('/tidligste-uttaksalder', {
    //     status: 500,
    //     json: "Beep boop I'm an error!",
    //     method: 'post',
    //   })

    //   const result = render(<Beregning />)

    //   await waitFor(() => {
    //     expect(
    //       screen.getByText(
    //         'Vi klarte ikke å hente din tidligste mulige uttaksalder. Prøv igjen senere.'
    //       )
    //     ).toBeVisible()
    //     expect(result.asFragment()).toMatchSnapshot()
    //   })
    // })
  })

  describe('Når brukeren velger uttaksalder', () => {
    const currentSimulation: Simulation = {
      startAlder: 65,
      startMaaned: 5,
      uttaksgrad: 100,
      aarligInntekt: 0,
    }
    // it('viser en loader mens beregning av alderspensjon pågår', async () => {
    //   render(<Beregning />, {
    //     preloadedState: {
    //       userInput: {
    //         ...userInputInitialState,
    //         afp: 'nei',
    //         samtykke: true,
    //         samboer: true,
    //         currentSimulation: { ...currentSimulation },
    //       },
    //     },
    //   })
    //   expect(await screen.findByTestId('alderspensjon-loader')).toBeVisible()
    // })

    it('viser en loader mens beregning av alderspensjon pågår, oppdaterer valgt knapp og tegner graph, gitt at beregning av alderspensjon var vellykket', async () => {
      const user = userEvent.setup()
      const { container } = render(<Beregning />)
      const button = await screen.findByText('68 år')
      await user.click(button)
      expect(screen.getByRole('button', { pressed: true })).toHaveTextContent(
        '68 år'
      )
      expect(await screen.findByTestId('alderspensjon-loader')).toBeVisible()
      expect(
        container.getElementsByClassName('highcharts-container').length
      ).toBe(1)
    })

    // TODO PEK-119 - legge til test for retry
    it('viser feilmelding når simuleringen feiler med mulighet til å prøve på nytt, og skjuler Grunnlag', async () => {
      mockErrorResponse('/alderspensjon/simulering', {
        status: 500,
        json: "Beep boop I'm an error!",
        method: 'post',
      })
      const user = userEvent.setup()
      const { asFragment } = render(<Beregning />)
      const button = await screen.findByText('68 år')
      await user.click(button)
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
    })

    it('viser feilmelding og skjuler Grunnlag når tidligste-uttaksalder har feilet og brukeren prøver å simulere med for lav uttaksalder', async () => {
      mockErrorResponse('/tidligste-uttaksalder', {
        status: 500,
        json: "Beep boop I'm an error!",
        method: 'post',
      })
      const user = userEvent.setup()
      const { asFragment } = render(<Beregning />)
      const button = await screen.findByText('62 år')
      await user.click(button)
      await waitFor(async () => {
        expect(
          await screen.findByText(
            'Du har ikke høy nok opptjening til å kunne starte uttak ved 62 år. Prøv en høyere alder.'
          )
        ).toBeVisible()
        expect(
          screen.queryByText('Grunnlaget for beregningen')
        ).not.toBeInTheDocument()
        expect(asFragment()).toMatchSnapshot()
      })
    })
  })
})
