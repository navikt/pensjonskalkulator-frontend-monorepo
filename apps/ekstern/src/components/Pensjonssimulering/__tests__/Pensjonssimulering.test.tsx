import { describe, it } from 'vitest'

import { Pensjonssimulering } from '../Pensjonssimulering'
import { mockResponse } from '@/mocks/server'
import {
  userInputInitialState,
  Simulation,
} from '@/state/userInput/userInputReducer'
import { render, screen, userEvent, waitFor } from '@/test-utils'

describe('Pensjonssimulering', () => {
  const currentSimulation: Simulation = {
    startAlder: 65,
    startMaaned: 5,
    uttaksgrad: 100,
    aarligInntekt: 0,
  }
  it('rendrer med riktig tittel og chart og uten scroll-knapper', async () => {
    const { container, asFragment } = render(<Pensjonssimulering />, {
      preloadedState: {
        userInput: {
          ...userInputInitialState,
          samtykke: true,
          currentSimulation: { ...currentSimulation },
        },
      },
    })

    expect(await screen.findByText('Beregning')).toBeVisible()
    expect(
      container.getElementsByClassName('highcharts-container')
    ).toHaveLength(1)
    expect(asFragment()).toMatchSnapshot()
  })

  it('rendrer uten pensjonsavtaler når brukeren ikke har samtykket', async () => {
    const { container } = render(<Pensjonssimulering />, {
      preloadedState: {
        userInput: {
          ...userInputInitialState,
          samtykke: false,
          currentSimulation: { ...currentSimulation },
        },
      },
    })

    expect(await screen.findByText('Beregning')).toBeVisible()
    await waitFor(async () => {
      expect(
        container.getElementsByClassName('highcharts-container')
      ).toHaveLength(1)
      expect(
        container.getElementsByClassName('highcharts-legend-item')
      ).toHaveLength(6)
    })
  })

  it('rendrer med pensjonsavtaler når brukeren har samtykket', async () => {
    const { container } = render(<Pensjonssimulering />, {
      preloadedState: {
        userInput: {
          ...userInputInitialState,
          samtykke: true,
          currentSimulation: { ...currentSimulation },
        },
      },
    })

    expect(await screen.findByText('Beregning')).toBeVisible()
    await waitFor(async () => {
      expect(
        container.getElementsByClassName('highcharts-container')
      ).toHaveLength(1)
      expect(
        container.getElementsByClassName('highcharts-legend-item')
      ).toHaveLength(8)
    })
  })

  it('viser infomelding om pensjonsavtaler når brukeren har en pensjonsavtale som begynner før uttaksalderen', async () => {
    mockResponse('/pensjonsavtaler', {
      status: 200,
      json: {
        avtaler: [
          {
            produktbetegnelse: 'Storebrand',
            kategori: 'PRIVAT_TJENESTEPENSJON',
            startAlder: 62,
            startMaaned: 1,
            utbetalingsperioder: {
              startAlder: 62,
              startMaaned: 1,
              sluttAlder: 72,
              sluttMaaned: 1,
              aarligUtbetaling: 31298,
              grad: 100,
            },
          },
        ],
        utilgjengeligeSelskap: [],
      },
      method: 'post',
    })
    render(<Pensjonssimulering />, {
      preloadedState: {
        userInput: {
          ...userInputInitialState,
          samtykke: true,
          currentSimulation: { ...currentSimulation },
        },
      },
    })

    expect(await screen.findByText('Beregning')).toBeVisible()
    await waitFor(async () => {
      expect(
        screen.getByText(
          'Du har pensjonsavtaler som starter før valgt alder. Se detaljer i grunnlaget under.'
        )
      ).toBeVisible()
    })
  })

  it('viser tabell og oppdaterer label når brukeren klikker på Vis tabell knapp', async () => {
    const user = userEvent.setup()
    render(<Pensjonssimulering />, {
      preloadedState: {
        userInput: {
          ...userInputInitialState,
          samtykke: true,
          currentSimulation: { ...currentSimulation },
        },
      },
    })

    expect(screen.getByText('Vis tabell av beregningen')).toBeVisible()
    await user.click(screen.getByText('Vis tabell av beregningen'))
    expect(screen.getByText('Lukk tabell av beregningen')).toBeVisible()
    await waitFor(async () => {
      const rows = await screen.findAllByRole('row')
      expect(rows.length).toBe(47)
    })
  })
})
