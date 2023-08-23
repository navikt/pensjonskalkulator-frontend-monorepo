import { describe, it } from 'vitest'

import { Pensjonssimulering } from '../Pensjonssimulering'
import { mockErrorResponse } from '@/mocks/server'
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

  it('viser loader når simuleringen beregnes', async () => {
    render(<Pensjonssimulering />, {
      preloadedState: {
        userInput: {
          ...userInputInitialState,
          afp: 'nei',
          samtykke: true,
          samboer: true,
          currentSimulation: { ...currentSimulation },
        },
      },
    })
    expect(await screen.findByTestId('loader')).toBeVisible()
  })

  it('viser feilmelding når simuleringen feiler', async () => {
    mockErrorResponse('/alderspensjon/simulering')
    render(<Pensjonssimulering />, {
      preloadedState: {
        userInput: {
          ...userInputInitialState,
          samtykke: true,
          currentSimulation: { ...currentSimulation },
        },
      },
    })

    await waitFor(() => {
      expect(
        screen.getByText(
          'TODO PEK-119 feilhåndtering Vi klarte ikke å simulere pensjonen din'
        )
      ).toBeVisible()
    })
  })

  it('rendrer med riktig tittel og chart, uten AFP og Pensjonsavtaler og uten scroll-knapper', async () => {
    const { container, asFragment } = render(<Pensjonssimulering />, {
      preloadedState: {
        userInput: {
          ...userInputInitialState,
          samtykke: false,
          currentSimulation: { ...currentSimulation },
        },
      },
    })

    expect(await screen.findByText('Beregning')).toBeVisible()
    expect(
      container.getElementsByClassName('highcharts-container')
    ).toHaveLength(1)
    expect(
      container.getElementsByClassName('highcharts-legend-item')
    ).toHaveLength(4)
    expect(asFragment()).toMatchSnapshot()
  })

  it('rendrer med AFP når brukeren har valgt AFP privat', async () => {
    const { container } = render(<Pensjonssimulering />, {
      preloadedState: {
        userInput: {
          ...userInputInitialState,
          samtykke: false,
          afp: 'ja_privat',
          currentSimulation: { ...currentSimulation },
        },
      },
    })

    expect(await screen.findByText('Beregning')).toBeVisible()
    expect(
      container.getElementsByClassName('highcharts-container')
    ).toHaveLength(1)
    expect(
      container.getElementsByClassName('highcharts-legend-item')
    ).toHaveLength(6)
  })

  it('rendrer med AFP og Pensjonsavtaler når brukeren har valgt AFP privat og har smatykket', async () => {
    const { container } = render(<Pensjonssimulering />, {
      preloadedState: {
        userInput: {
          ...userInputInitialState,
          samtykke: true,
          afp: 'ja_privat',
          currentSimulation: { ...currentSimulation },
        },
      },
    })

    expect(await screen.findByText('Beregning')).toBeVisible()
    expect(
      container.getElementsByClassName('highcharts-container')
    ).toHaveLength(1)
    expect(
      container.getElementsByClassName('highcharts-legend-item')
    ).toHaveLength(8)
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
    expect(screen.getAllByRole('row').length).toBe(31)
  })
})
