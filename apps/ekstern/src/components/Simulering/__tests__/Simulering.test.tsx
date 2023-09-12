import { describe, it, vi } from 'vitest'

import alderspensjonData from '../../../mocks/data/alderspensjon/67.json' assert { type: 'json' }
import { Simulering } from '../Simulering'
import { mockResponse } from '@/mocks/server'
import * as apiSliceUtils from '@/state/api/apiSlice'
import {
  userInputInitialState,
  Simulation,
} from '@/state/userInput/userInputReducer'
import { render, screen, waitFor } from '@/test-utils'

describe('Simulering', () => {
  const currentSimulation: Simulation = {
    startAlder: 65,
    startMaaned: 5,
    uttaksgrad: 100,
    aarligInntekt: 0,
  }

  it('henter ikke pensjonsavtaler når brukeren ikke har samtykket', async () => {
    const usePensjonsavtalerQueryMock = vi.spyOn(
      apiSliceUtils,
      'usePensjonsavtalerQuery'
    )
    render(<Simulering showAfp={false} showButtonsAndTable={false} />, {
      preloadedState: {
        userInput: { ...userInputInitialState, samtykke: false },
      },
    })
    expect(usePensjonsavtalerQueryMock.mock.calls[0][1]).toEqual({
      skip: true,
    })
  })

  it('henter og viser pensjonsavtaler når brukeren har samtykket', async () => {
    const usePensjonsavtalerQueryMock = vi.spyOn(
      apiSliceUtils,
      'usePensjonsavtalerQuery'
    )
    const { container } = render(
      <Simulering
        alderspensjon={alderspensjonData}
        showAfp={false}
        showButtonsAndTable={false}
      />,
      {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            currentSimulation: { ...currentSimulation },
          },
        },
      }
    )

    await waitFor(async () => {
      expect(await screen.findByText('Beregning')).toBeVisible()
      expect(usePensjonsavtalerQueryMock.mock?.lastCall?.[0]).toEqual({
        antallInntektsaarEtterUttak: 0,
        uttaksperioder: [
          {
            aarligInntekt: 0,
            grad: 100,
            startAlder: 65,
            startMaaned: 5,
          },
        ],
      })
      expect(
        container.getElementsByClassName('highcharts-container')
      ).toHaveLength(1)
      expect(
        container.getElementsByClassName('highcharts-legend-item')
      ).toHaveLength(6)
    })
  })

  // TODO PEK-97
  // it('henter pensjonsavtaler og viser riktig feilmelding ved feil', async () => {
  //   mockErrorResponse('/pensjonsavtaler', {
  //     status: 500,
  //     json: "Beep boop I'm an error!",
  //     method: 'post',
  //   })
  //   render(<Simulering showAfp={false} showButtonsAndTable={false} />, {
  //     preloadedState: {
  //       userInput: { ...userInputInitialState, samtykke: true },
  //     },
  //   })

  //   await waitFor(async () => {
  //     expect(
  //       await screen.findByText(
  //         'Vi klarte ikke å hente pensjonsavtalene dine fra Norsk Pensjon. Prøv igjen senere.'
  //       )
  //     ).toBeVisible()
  //   })
  // })

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
    render(
      <Simulering
        alderspensjon={alderspensjonData}
        showAfp={false}
        showButtonsAndTable={true}
      />,
      {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            currentSimulation: { ...currentSimulation },
          },
        },
      }
    )

    await waitFor(async () => {
      expect(await screen.findByText('Beregning')).toBeVisible()
      expect(
        await screen.findByText(
          'Du har pensjonsavtaler som starter før valgt alder. Se detaljer i grunnlaget under.'
        )
      ).toBeVisible()
    })
  })

  describe('Når brukeren ikke samtykker og ikke velger AFP', () => {
    it('rendrer som default med riktig tittel og chart, kun med alderspensjon og inntekt, og uten scroll-knapper', async () => {
      const { container, asFragment } = render(
        <Simulering
          alderspensjon={alderspensjonData}
          showAfp={false}
          showButtonsAndTable={true}
        />,
        {
          preloadedState: {
            userInput: {
              ...userInputInitialState,
              samtykke: false,
              currentSimulation: { ...currentSimulation },
            },
          },
        }
      )

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
    const { container } = render(
      <Simulering
        alderspensjon={alderspensjonData}
        showAfp={true}
        showButtonsAndTable={true}
      />,
      {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            samtykke: false,
            afp: 'ja_privat',
            currentSimulation: { ...currentSimulation },
          },
        },
      }
    )

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
    const { container } = render(
      <Simulering
        alderspensjon={alderspensjonData}
        showAfp={true}
        showButtonsAndTable={true}
      />,
      {
        preloadedState: {
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            afp: 'ja_privat',
            currentSimulation: { ...currentSimulation },
          },
        },
      }
    )

    await waitFor(async () => {
      expect(await screen.findByText('Beregning')).toBeVisible()
      expect(
        container.getElementsByClassName('highcharts-container')
      ).toHaveLength(1)
      expect(
        container.getElementsByClassName('highcharts-legend-item')
      ).toHaveLength(8)
    })
  })

  it('viser tabell ', async () => {
    render(<Simulering showAfp={true} showButtonsAndTable={true} />, {
      preloadedState: {
        userInput: {
          ...userInputInitialState,
          samtykke: true,
          currentSimulation: { ...currentSimulation },
        },
      },
    })

    expect(screen.getByText('Vis tabell av beregningen')).toBeVisible()
  })
})
