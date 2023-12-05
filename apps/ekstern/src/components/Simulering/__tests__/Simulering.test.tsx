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
  const inntekt = { beloep: 500000, aar: 2021 }
  const currentSimulation: Simulation = {
    startAar: 67,
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
          inntekt={inntekt}
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
          inntekt={inntekt}
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
      const legendItems = container.getElementsByClassName(
        'highcharts-legend-item'
      )
      const SVGlegendItems = Array.from(legendItems).filter(
        (item) => item.tagName === 'g'
      )
      expect(SVGlegendItems).toHaveLength(2)
    })

    it('Når brukeren velger AFP-privat, viser inntekt, alderspensjon og AFP', async () => {
      const { container } = render(
        <Simulering
          isLoading={false}
          inntekt={inntekt}
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
      const legendItems = container.getElementsByClassName(
        'highcharts-legend-item'
      )
      const SVGlegendItems = Array.from(legendItems).filter(
        (item) => item.tagName === 'g'
      )
      expect(SVGlegendItems).toHaveLength(3)
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
          inntekt={inntekt}
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
          aarligInntektFoerUttak: 500000,
          antallInntektsaarEtterUttak: 0,
          harAfp: false,
          sivilstand: undefined,
          uttaksperioder: [
            {
              startAlder: { aar: 67, maaneder: 5 },
              aarligInntekt: 0,
              grad: 100,
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
      expect(
        await screen.findByText('beregning.highcharts.serie.inntekt.name')
      ).toBeVisible()
      expect(
        await screen.findByText('beregning.highcharts.serie.alderspensjon.name')
      ).toBeVisible()
      expect(
        await screen.findByText('beregning.highcharts.serie.tp.name')
      ).toBeVisible()
      expect(
        screen.queryByText('beregning.highcharts.serie.afp.name')
      ).not.toBeInTheDocument()
      expect(legendItems).toHaveLength(3)
    })

    it('Når brukeren velger AFP-privat, henter og viser inntekt, alderspensjon, AFP og pensjonsavtaler', async () => {
      const { container } = render(
        <Simulering
          isLoading={false}
          inntekt={inntekt}
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
      mockResponse('/v1/pensjonsavtaler', {
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
          inntekt={inntekt}
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
      mockResponse('/v1/pensjonsavtaler', {
        status: 200,
        json: {
          avtaler: [
            {
              produktbetegnelse: 'Storebrand',
              kategori: 'PRIVAT_TJENESTEPENSJON',
              startAar: 62,
              sluttAar: 71,
              utbetalingsperioder: [
                {
                  startAlder: { aar: 62, maaneder: 0 },
                  sluttAlder: { aar: 71, maaneder: 11 },
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
          inntekt={inntekt}
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
        expect(
          await screen.findByText('beregning.pensjonsavtaler.info')
        ).toBeVisible()
      })
    })

    it('Når brukeren har samtykket og pensjonsavtaler feiler, vises det riktig feilmelding som sender til Grunnlag', async () => {
      const scrollIntoViewMock = vi.fn()
      const user = userEvent.setup()
      mockErrorResponse('/v1/pensjonsavtaler', {
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
            inntekt={inntekt}
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
      const button = await screen.findByText('pensjonsavtalene dine')
      await user.click(button)
      expect(scrollIntoViewMock).toHaveBeenCalled()
      expect(toggleOpenMock).toHaveBeenCalled()
    })

    it('Når brukeren har samtykket og pensjonsavtaler kommer med utilgjengelig selskap, vises det riktig feilmelding som sender til Grunnlag', async () => {
      const scrollIntoViewMock = vi.fn()
      const user = userEvent.setup()
      mockResponse('/v1/pensjonsavtaler', {
        status: 200,
        json: {
          avtaler: [
            {
              produktbetegnelse: 'Oslo Pensjonsforsikring (livsvarig eksempel)',
              kategori: 'OFFENTLIG_TJENESTEPENSJON',
              startAar: 69,
              utbetalingsperioder: [
                {
                  startAlder: { aar: 69, maaneder: 0 },
                  aarligUtbetaling: 175000,
                  grad: 100,
                },
              ],
            },
          ],
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
            inntekt={inntekt}
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
      const button = await screen.findByText('pensjonsavtalene dine')
      await act(async () => {
        await user.click(button)
      })
      expect(scrollIntoViewMock).toHaveBeenCalled()
      expect(toggleOpenMock).toHaveBeenCalled()
    })

    it('Når brukeren har samtykket, har ingen pensjonsavtale men har utilgjengelig selskap, vises det riktig feilmelding som sender til Grunnlag', async () => {
      const scrollIntoViewMock = vi.fn()
      const user = userEvent.setup()
      mockResponse('/v1/pensjonsavtaler', {
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
            inntekt={inntekt}
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
      const button = await screen.findByText('pensjonsavtalene dine')
      await act(async () => {
        await user.click(button)
      })
      expect(scrollIntoViewMock).toHaveBeenCalled()
      expect(toggleOpenMock).toHaveBeenCalled()
    })
  })

  it('viser tabell og skjuler grafen for skjermlesere', async () => {
    render(
      <Simulering
        isLoading={false}
        showAfp={true}
        showButtonsAndTable={true}
        inntekt={inntekt}
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
    expect(screen.getByText('beregning.tabell.vis')).toBeVisible()
    expect(
      screen.getByTestId('highcharts-aria-wrapper').getAttribute('aria-hidden')
    ).toBe('true')
  })

  it('setter aria-hidden attrbute iht hasHighchartsAccessibilityPlugin property', async () => {
    render(
      <Simulering
        isLoading={false}
        hasHighchartsAccessibilityPlugin={true}
        showAfp={true}
        showButtonsAndTable={true}
        inntekt={inntekt}
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
    expect(
      screen.getByTestId('highcharts-aria-wrapper').getAttribute('aria-hidden')
    ).toBe('false')
  })
})
