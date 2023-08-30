import { describe, it } from 'vitest'

import { Pensjonssimulering } from '../Pensjonssimulering'
import {
  userInputInitialState,
  Simulation,
} from '@/state/userInput/userInputReducer'
import { render, screen, userEvent } from '@/test-utils'

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
