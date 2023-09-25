import { describe, it, vi } from 'vitest'

import alderspensjonData from '../../../mocks/data/alderspensjon/67.json' assert { type: 'json' }
import { Simulering } from '../Simulering'
import { AccordionContext } from '@/components/common/AccordionItem'
import { mockErrorResponse, mockResponse } from '@/mocks/server'
import * as apiSliceUtils from '@/state/api/apiSlice'
import {
  userInputInitialState,
  Simulation,
} from '@/state/userInput/userInputReducer'
import { act, render, screen, waitFor, userEvent } from '@/test-utils'

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
  describe('Gitt at brukeren IKKE samtykker', () => {
    it('Når alderspensjon laster så vises det en spinner', async () => {
      const { container } = render(
        <Simulering
          isLoading={true}
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
        expect(
          await screen.findByTestId('highcharts-done-drawing')
        ).toBeVisible()
      })

      // Nødvendig for at animasjonen rekker å bli ferdig
      await act(async () => {
        await new Promise((r) => setTimeout(r, 500))
      })

      expect(
        container.getElementsByClassName('highcharts-container')
      ).toHaveLength(1)
      expect(
        container.getElementsByClassName('highcharts-loading')
      ).toHaveLength(1)
    })

    it('Når brukeren ikke velger AFP, viser kun inntekt og alderspensjon', async () => {
      const usePensjonsavtalerQueryMock = vi.spyOn(
        apiSliceUtils,
        'usePensjonsavtalerQuery'
      )
      const { container } = render(
        <Simulering
          isLoading={false}
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
        expect(
          await screen.findByTestId('highcharts-done-drawing')
        ).toBeVisible()
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

    it('Når brukeren velger AFP-privat, viser inntekt, alderspensjon og AFP', async () => {
      const { container } = render(
        <Simulering
          isLoading={false}
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
        expect(
          await screen.findByTestId('highcharts-done-drawing')
        ).toBeVisible()
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
  })

  describe('Gitt at brukeren samtykker', () => {
    it('Når brukeren velger uten AFP, henter og viser inntekt, alderspensjon, AFP og pensjonsavtaler', async () => {
      const usePensjonsavtalerQueryMock = vi.spyOn(
        apiSliceUtils,
        'usePensjonsavtalerQuery'
      )
      const { container } = render(
        <Simulering
          isLoading={false}
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
        expect(
          await screen.findByTestId('highcharts-done-drawing')
        ).toBeVisible()
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
      expect(await screen.findByText('Inntekt (lønn m.m.)')).toBeVisible()
      expect(await screen.findByText('Alderspensjon (NAV)')).toBeVisible()
      expect(
        await screen.findByText('Pensjonsavtaler (arbeidsgiver)')
      ).toBeVisible()
      expect(
        screen.queryByText('Avtalefestet pensjon (AFP)')
      ).not.toBeInTheDocument()
      expect(legendItems).toHaveLength(3)
    })

    it('Når brukeren velger AFP-privat, henter og viser inntekt, alderspensjon, AFP og pensjonsavtaler', async () => {
      const { container } = render(
        <Simulering
          isLoading={false}
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
        expect(
          await screen.findByTestId('highcharts-done-drawing')
        ).toBeVisible()
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

    it('Når brukeren har 0 pensjonsavtaler', async () => {
      mockResponse('/pensjonsavtaler', {
        status: 200,
        json: {
          avtaler: [],
          utilgjengeligeSelskap: [],
        },
        method: 'post',
      })

      const { container } = render(
        <Simulering
          isLoading={false}
          alderspensjon={alderspensjonData}
          showAfp={false}
          showButtonsAndTable={true}
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
        expect(
          await screen.findByTestId('highcharts-done-drawing')
        ).toBeVisible()
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
      expect(legendItems).toHaveLength(2)
    })

    it('Når brukeren har en pensjonsavtale som begynner før uttaksalderen, viser infomelding om pensjonsavtaler ', async () => {
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
          isLoading={false}
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

    it('Når brukeren har samtykket og pensjonsavtaler feiler, vises det riktig feilmelding som sender til Grunnlag', async () => {
      const scrollIntoViewMock = vi.fn()
      const user = userEvent.setup()
      mockErrorResponse('/pensjonsavtaler', {
        status: 500,
        json: "Beep boop I'm an error!",
        method: 'post',
      })
      const refMock = { current: { scrollIntoView: scrollIntoViewMock } }
      const toggleOpenMock = vi.fn()
      render(
        <AccordionContext.Provider
          value={{
            ref: refMock as unknown as React.RefObject<HTMLSpanElement>,
            isOpen: false,
            toggleOpen: toggleOpenMock,
          }}
        >
          <Simulering
            isLoading={false}
            showAfp={false}
            showButtonsAndTable={false}
          />
        </AccordionContext.Provider>,
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
        expect(
          await screen.findByText('Vi klarte ikke å hente', {
            exact: false,
          })
        ).toBeVisible()
      })
      await user.click(await screen.findByText('pensjonsavtalene dine'))
      expect(scrollIntoViewMock).toHaveBeenCalled()
      expect(toggleOpenMock).toHaveBeenCalled()
    })

    it('Når brukeren har samtykket og pensjonsavtaler kommer med utilgjengelig selskap, vises det riktig feilmelding som sender til Grunnlag', async () => {
      const scrollIntoViewMock = vi.fn()
      const user = userEvent.setup()
      mockResponse('/pensjonsavtaler', {
        status: 200,
        json: {
          avtaler: [],
          utilgjengeligeSelskap: ['Something'],
        },
        method: 'post',
      })
      const refMock = { current: { scrollIntoView: scrollIntoViewMock } }
      const toggleOpenMock = vi.fn()
      render(
        <AccordionContext.Provider
          value={{
            ref: refMock as unknown as React.RefObject<HTMLSpanElement>,
            isOpen: false,
            toggleOpen: toggleOpenMock,
          }}
        >
          <Simulering
            isLoading={false}
            showAfp={false}
            showButtonsAndTable={false}
          />
        </AccordionContext.Provider>,
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
        expect(
          await screen.findByText('Vi klarte ikke å hente alle', {
            exact: false,
          })
        ).toBeVisible()
      })
      await user.click(await screen.findByText('pensjonsavtalene dine'))
      expect(scrollIntoViewMock).toHaveBeenCalled()
      expect(toggleOpenMock).toHaveBeenCalled()
    })
  })

  it('viser tabell', async () => {
    render(
      <Simulering
        isLoading={false}
        showAfp={true}
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
    expect(screen.getByText('Vis tabell av beregningen')).toBeVisible()
  })
})
