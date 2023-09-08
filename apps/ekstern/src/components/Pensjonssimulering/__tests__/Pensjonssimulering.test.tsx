import { describe, it } from 'vitest'

import { Pensjonssimulering } from '../Pensjonssimulering'
import { mockResponse, mockErrorResponse } from '@/mocks/server'
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

  it('viser loader når alderspensjon/afp-privat beregnes', async () => {
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

  it('viser feilmelding når alderspensjon/afp-privat feiler', async () => {
    mockErrorResponse('/alderspensjon/simulering', {
      status: 500,
      json: "Beep boop I'm an error!",
      method: 'post',
    })
    const { asFragment } = render(<Pensjonssimulering />, {
      preloadedState: {
        userInput: {
          ...userInputInitialState,
          samtykke: true,
          currentSimulation: { ...currentSimulation },
        },
      },
    })

    await waitFor(async () => {
      expect(
        await screen.findByText(
          'TODO PEK-119 feilhåndtering Vi klarte ikke å simulere pensjonen din'
        )
      ).toBeVisible()
      expect(asFragment()).toMatchSnapshot()
    })
  })

  describe('Når brukeren ikke samtykker og ikke velger AFP', () => {
    it('rendrer som default med riktig tittel og chart, kun med alderspensjon og inntekt, og uten scroll-knapper', async () => {
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
      await waitFor(async () => {
        expect(
          container.getElementsByClassName('highcharts-container')
        ).toHaveLength(1)
        expect(
          container.getElementsByClassName('highcharts-legend-item')
        ).toHaveLength(4)
        expect(asFragment()).toMatchSnapshot()
      })
    })
  })

  it('rendrer med AFP når brukeren har valgt AFP-privat', async () => {
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
    await waitFor(async () => {
      expect(
        container.getElementsByClassName('highcharts-container')
      ).toHaveLength(1)
      expect(
        container.getElementsByClassName('highcharts-legend-item')
      ).toHaveLength(6)
    })
  })

  it('rendrer med Pensjonsavtaler når brukeren har samtykket', async () => {
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
      ).toHaveLength(6)
    })
  })

  it('rendrer med AFP og Pensjonsavtaler når brukeren har valgt AFP-privat og har samtykket', async () => {
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
            sluttAlder: 72,
            utbetalingsperioder: [
              {
                startAlder: 62,
                startMaaned: 1,
                sluttAlder: 72,
                sluttMaaned: 1,
                aarligUtbetaling: 31298,
                grad: 100,
              },
            ],
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
    await waitFor(async () => {
      expect(screen.getByText('Lukk tabell av beregningen')).toBeVisible()
      const rows = await screen.findAllByRole('row')
      expect(rows.length).toBe(47)
    })
  })
})
