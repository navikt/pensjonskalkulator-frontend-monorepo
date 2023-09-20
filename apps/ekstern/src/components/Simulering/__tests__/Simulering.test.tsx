import { describe, it, vi } from 'vitest'

import alderspensjonData from '../../../mocks/data/alderspensjon/67.json' assert { type: 'json' }
import { Simulering } from '../Simulering'
import { mockResponse } from '@/mocks/server'
import * as apiSliceUtils from '@/state/api/apiSlice'
import {
  userInputInitialState,
  Simulation,
} from '@/state/userInput/userInputReducer'
import { act, render, screen, waitFor } from '@/test-utils'

describe('Simulering', () => {
  const currentSimulation: Simulation = {
    startAlder: 70,
    startMaaned: 5,
    uttaksgrad: 100,
    aarligInntekt: 0,
  }

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('Når brukeren har samtykket, henter og viser Pensjonsavtaler', async () => {
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
            afp: 'nei',
            currentSimulation: { ...currentSimulation },
          },
        },
      }
    )
    await waitFor(async () => {
      expect(await screen.findByTestId('highcharts-done-drawing')).toBeVisible()
    })
    expect(usePensjonsavtalerQueryMock).toHaveBeenLastCalledWith(
      {
        antallInntektsaarEtterUttak: 0,
        uttaksperioder: [
          {
            aarligInntekt: 0,
            grad: 100,
            startAlder: 70,
            startMaaned: 5,
          },
        ],
      },
      { skip: false }
    )
    // Nødvendig for at animasjonen rekker å bli ferdig
    await act(async () => {
      await new Promise((r) => setTimeout(r, 500))
    })

    expect(
      container.getElementsByClassName('highcharts-container')
    ).toHaveLength(1)
    const legendContainer =
      container.getElementsByClassName('highcharts-legend')
    const legendItems = (
      legendContainer[0] as HTMLElement
    ).getElementsByClassName('highcharts-legend-item')
    expect(legendItems).toHaveLength(3)
  })

  it('Når brukeren har samtykket og valgt AFP-privat, henter og viser AFP og Pensjonsavtaler når brukeren har valgt', async () => {
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
      expect(await screen.findByTestId('highcharts-done-drawing')).toBeVisible()
    })
    // Nødvendig for at animasjonen rekker å bli ferdig
    await act(async () => {
      await new Promise((r) => setTimeout(r, 500))
    })

    expect(
      container.getElementsByClassName('highcharts-container')
    ).toHaveLength(1)
    const legendContainer =
      container.getElementsByClassName('highcharts-legend')
    const legendItems = (
      legendContainer[0] as HTMLElement
    ).getElementsByClassName('highcharts-legend-item')
    expect(legendItems).toHaveLength(4)
  })

  it('Når brukeren ikke samtykker og ikke velger AFP, viser kun alderspensjon og inntekt', async () => {
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
            samtykke: false,
            currentSimulation: { ...currentSimulation },
          },
        },
      }
    )

    await waitFor(async () => {
      expect(await screen.findByTestId('highcharts-done-drawing')).toBeVisible()
    })
    expect(usePensjonsavtalerQueryMock.mock.calls[0][1]).toEqual({
      skip: true,
    })
    // Nødvendig for at animasjonen rekker å bli ferdig
    await act(async () => {
      await new Promise((r) => setTimeout(r, 500))
    })

    expect(
      container.getElementsByClassName('highcharts-container')
    ).toHaveLength(1)
    expect(
      container.getElementsByClassName('highcharts-legend-item')
    ).toHaveLength(4)
  })

  it('Når brukeren har samtykket og har valgt AFP-privat, viser alderspensjon, inntekt og AFP', async () => {
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

    await waitFor(async () => {
      expect(await screen.findByTestId('highcharts-done-drawing')).toBeVisible()
    })
    // Nødvendig for at animasjonen rekker å bli ferdig
    await act(async () => {
      await new Promise((r) => setTimeout(r, 500))
    })

    expect(
      container.getElementsByClassName('highcharts-container')
    ).toHaveLength(1)
    expect(
      container.getElementsByClassName('highcharts-legend-item')
    ).toHaveLength(6)
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
        await screen.findByText('beregning.pensjonsavtaler.info')
      ).toBeVisible()
    })
  })

  it('viser tabell', async () => {
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
})
