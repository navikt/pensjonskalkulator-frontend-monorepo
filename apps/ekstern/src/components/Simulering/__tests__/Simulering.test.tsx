import { describe, it, vi } from 'vitest'

import afpOffentligData from '../../../mocks/data/afp-offentlig.json' assert { type: 'json' }
import afpPrivatData from '../../../mocks/data/afp-privat/67.json' assert { type: 'json' }
import alderspensjonData from '../../../mocks/data/alderspensjon/67.json' assert { type: 'json' }
import { Simulering } from '../Simulering'
import { mockErrorResponse, mockResponse } from '@/mocks/server'
import * as apiSliceUtils from '@/state/api/apiSlice'
import {
  userInputInitialState,
  Simulation,
} from '@/state/userInput/userInputReducer'
import { act, render, screen, userEvent, waitFor } from '@/test-utils'

describe('Simulering', () => {
  const currentSimulation: Simulation = {
    utenlandsperioder: [],
    formatertUttaksalderReadOnly: '67 år string.og 0 alder.maaned',
    uttaksalder: { aar: 67, maaneder: 0 },
    aarligInntektFoerUttakBeloep: '0',
    gradertUttaksperiode: null,
  }

  const fakeApiCallUfoere = {
    queries: {
      ['getUfoeregrad(undefined)']: {
        status: 'fulfilled',
        endpointName: 'getUfoeregrad',
        requestId: 'xTaE6mOydr5ZI75UXq4Wi',
        startedTimeStamp: 1688046411971,
        data: {
          ufoeregrad: 75,
        },
        fulfilledTimeStamp: 1688046412103,
      },
    },
  }

  afterEach(() => {
    vi.clearAllMocks()
    window.scrollTo = () => vi.fn()
  })

  it('Når alderspensjon laster så vises det en spinner, og deretter heading på riktig nivå', async () => {
    const { container } = render(
      <Simulering
        isLoading={true}
        headingLevel="3"
        aarligInntektFoerUttakBeloep="0"
        alderspensjonListe={alderspensjonData.alderspensjon}
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

    expect(await screen.findByTestId('highcharts-done-drawing')).toBeVisible()

    // Nødvendig for at animasjonen rekker å bli ferdig
    await act(async () => {
      await new Promise((r) => setTimeout(r, 500))
    })

    expect(
      container.getElementsByClassName('highcharts-container')
    ).toHaveLength(1)
    expect(container.getElementsByClassName('highcharts-loading')).toHaveLength(
      1
    )
    const heading = screen.getByRole('heading', { level: 3 })
    expect(heading).toHaveTextContent('beregning.highcharts.title')
  })

  describe('Gitt at brukeren IKKE samtykker', () => {
    it('Når brukeren ikke velger AFP, viser kun inntekt og alderspensjon', async () => {
      const usePensjonsavtalerQueryMock = vi.spyOn(
        apiSliceUtils,
        'usePensjonsavtalerQuery'
      )
      const { container } = render(
        <Simulering
          isLoading={false}
          headingLevel="3"
          aarligInntektFoerUttakBeloep="500 000"
          alderspensjonListe={alderspensjonData.alderspensjon}
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

      expect(await screen.findByTestId('highcharts-done-drawing')).toBeVisible()
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
          headingLevel="3"
          aarligInntektFoerUttakBeloep="500 000"
          alderspensjonListe={alderspensjonData.alderspensjon}
          afpPrivatListe={afpPrivatData.afpPrivat}
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

      expect(await screen.findByTestId('highcharts-done-drawing')).toBeVisible()
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

    it('Når brukeren velger AFP-offentlig, viser inntekt, alderspensjon og AFP', async () => {
      const { container } = render(
        <Simulering
          isLoading={false}
          headingLevel="3"
          aarligInntektFoerUttakBeloep="500 000"
          alderspensjonListe={alderspensjonData.alderspensjon}
          afpOffentligListe={afpOffentligData.afpOffentlig}
          showButtonsAndTable={true}
        />,
        {
          preloadedState: {
            userInput: {
              ...userInputInitialState,
              samtykke: false,
              afp: 'ja_offentlig',
              currentSimulation: { ...currentSimulation },
            },
          },
        }
      )

      expect(await screen.findByTestId('highcharts-done-drawing')).toBeVisible()
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

    it('Når brukeren velger uttaksagrad 67 år, vises årene i grafen fra 66 år til 77+', async () => {
      const { container } = render(
        <Simulering
          isLoading={false}
          headingLevel="3"
          aarligInntektFoerUttakBeloep="500 000"
          alderspensjonListe={alderspensjonData.alderspensjon}
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

      expect(await screen.findByTestId('highcharts-done-drawing')).toBeVisible()

      await act(async () => {
        await new Promise((r) => setTimeout(r, 500))
      })

      const xAxisLabels = container
        .getElementsByClassName('highcharts-xaxis-labels')[0]
        .querySelectorAll('text')
      expect(xAxisLabels).toHaveLength(13)
      expect(xAxisLabels[0]).toHaveTextContent('66')
      expect(xAxisLabels[12]).toHaveTextContent('77+')
    })

    it('Når brukeren velger gradert pensjon med uttaksgrad 62 år, vises årene i grafen fra 61 år til 77+', async () => {
      const { container } = render(
        <Simulering
          isLoading={false}
          headingLevel="3"
          aarligInntektFoerUttakBeloep="500 000"
          alderspensjonListe={alderspensjonData.alderspensjon}
          showButtonsAndTable={false}
        />,
        {
          preloadedState: {
            userInput: {
              ...userInputInitialState,
              samtykke: false,
              currentSimulation: {
                ...currentSimulation,
                gradertUttaksperiode: {
                  grad: 40,
                  uttaksalder: { aar: 62, maaneder: 0 },
                },
              },
            },
          },
        }
      )

      expect(await screen.findByTestId('highcharts-done-drawing')).toBeVisible()

      await act(async () => {
        await new Promise((r) => setTimeout(r, 500))
      })

      const xAxisLabels = container
        .getElementsByClassName('highcharts-xaxis-labels')[0]
        .querySelectorAll('text')
      expect(xAxisLabels).toHaveLength(18)
      expect(xAxisLabels[0]).toHaveTextContent('61')
      expect(xAxisLabels[17]).toHaveTextContent('77+')
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
          headingLevel="3"
          aarligInntektFoerUttakBeloep="500 000"
          alderspensjonListe={alderspensjonData.alderspensjon}
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
      expect(await screen.findByTestId('highcharts-done-drawing')).toBeVisible()
      expect(usePensjonsavtalerQueryMock).toHaveBeenLastCalledWith(
        {
          aarligInntektFoerUttakBeloep: 500000,
          harAfp: false,
          sivilstand: undefined,
          uttaksperioder: [
            {
              startAlder: { aar: 67, maaneder: 0 },
              aarligInntektVsaPensjon: undefined,
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
      expect(legendItems).toHaveLength(3)
      expect(
        screen.queryByText('beregning.highcharts.serie.afp.name')
      ).not.toBeInTheDocument()
      expect(
        screen.getByText('beregning.highcharts.serie.inntekt.name')
      ).toBeVisible()
      expect(
        screen.getByText('beregning.highcharts.serie.alderspensjon.name')
      ).toBeVisible()
      expect(
        screen.getByText('beregning.highcharts.serie.tp.name')
      ).toBeVisible()
    })

    it('Når brukeren velger AFP-privat, henter og viser inntekt, alderspensjon, AFP og pensjonsavtaler', async () => {
      const usePensjonsavtalerQueryMock = vi.spyOn(
        apiSliceUtils,
        'usePensjonsavtalerQuery'
      )
      const { container } = render(
        <Simulering
          isLoading={false}
          headingLevel="3"
          aarligInntektFoerUttakBeloep="500 000"
          alderspensjonListe={alderspensjonData.alderspensjon}
          afpPrivatListe={afpPrivatData.afpPrivat}
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

      expect(usePensjonsavtalerQueryMock).toHaveBeenLastCalledWith(
        {
          aarligInntektFoerUttakBeloep: 500000,
          harAfp: true,
          sivilstand: undefined,
          uttaksperioder: [
            {
              startAlder: { aar: 67, maaneder: 0 },
              aarligInntektVsaPensjon: undefined,
              grad: 100,
            },
          ],
        },
        { skip: false }
      )

      expect(await screen.findByTestId('highcharts-done-drawing')).toBeVisible()
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

    it('Når brukeren velger AFP-offentlig, henter og viser inntekt, alderspensjon, AFP og pensjonsavtaler', async () => {
      const usePensjonsavtalerQueryMock = vi.spyOn(
        apiSliceUtils,
        'usePensjonsavtalerQuery'
      )
      const { container } = render(
        <Simulering
          isLoading={false}
          headingLevel="3"
          aarligInntektFoerUttakBeloep="500 000"
          alderspensjonListe={alderspensjonData.alderspensjon}
          afpOffentligListe={afpOffentligData.afpOffentlig}
          showButtonsAndTable={true}
        />,
        {
          preloadedState: {
            userInput: {
              ...userInputInitialState,
              samtykke: true,
              afp: 'ja_offentlig',
              currentSimulation: { ...currentSimulation },
            },
          },
        }
      )

      expect(await screen.findByTestId('highcharts-done-drawing')).toBeVisible()
      // Nødvendig for at animasjonen rekker å bli ferdig
      await act(async () => {
        await new Promise((r) => setTimeout(r, 500))
      })
      expect(usePensjonsavtalerQueryMock).toHaveBeenLastCalledWith(
        {
          aarligInntektFoerUttakBeloep: 500000,
          harAfp: false,
          sivilstand: undefined,
          uttaksperioder: [
            {
              startAlder: { aar: 67, maaneder: 0 },
              aarligInntektVsaPensjon: undefined,
              grad: 100,
            },
          ],
        },
        { skip: false }
      )

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

    it('Når brukeren har uføretrygd og velger AFP-privat, henter og viser inntekt, alderspensjon og pensjonsavtaler', async () => {
      const usePensjonsavtalerQueryMock = vi.spyOn(
        apiSliceUtils,
        'usePensjonsavtalerQuery'
      )
      const { container } = render(
        <Simulering
          isLoading={false}
          headingLevel="3"
          aarligInntektFoerUttakBeloep="500 000"
          alderspensjonListe={alderspensjonData.alderspensjon}
          showButtonsAndTable={false}
        />,
        {
          preloadedState: {
            /* eslint-disable @typescript-eslint/ban-ts-comment */
            // @ts-ignore
            api: {
              ...fakeApiCallUfoere,
            },
            userInput: {
              ...userInputInitialState,
              samtykke: true,
              afp: 'ja_privat',
              currentSimulation: { ...currentSimulation },
            },
          },
        }
      )
      expect(await screen.findByTestId('highcharts-done-drawing')).toBeVisible()
      expect(usePensjonsavtalerQueryMock).toHaveBeenLastCalledWith(
        {
          aarligInntektFoerUttakBeloep: 500000,
          harAfp: false,
          sivilstand: undefined,
          uttaksperioder: [
            {
              startAlder: { aar: 67, maaneder: 0 },
              aarligInntektVsaPensjon: undefined,
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
      expect(legendItems).toHaveLength(3)
      expect(
        screen.queryByText('beregning.highcharts.serie.afp.name')
      ).not.toBeInTheDocument()
      expect(
        screen.getByText('beregning.highcharts.serie.inntekt.name')
      ).toBeVisible()
      expect(
        screen.getByText('beregning.highcharts.serie.alderspensjon.name')
      ).toBeVisible()
      expect(
        screen.getByText('beregning.highcharts.serie.tp.name')
      ).toBeVisible()
    })

    it('Når brukeren har uføretrygd og velger AFP-offentlig, henter og viser inntekt, alderspensjon og pensjonsavtaler', async () => {
      const usePensjonsavtalerQueryMock = vi.spyOn(
        apiSliceUtils,
        'usePensjonsavtalerQuery'
      )
      const { container } = render(
        <Simulering
          isLoading={false}
          headingLevel="3"
          aarligInntektFoerUttakBeloep="500 000"
          alderspensjonListe={alderspensjonData.alderspensjon}
          showButtonsAndTable={false}
        />,
        {
          preloadedState: {
            /* eslint-disable @typescript-eslint/ban-ts-comment */
            // @ts-ignore
            api: {
              ...fakeApiCallUfoere,
            },
            userInput: {
              ...userInputInitialState,
              samtykke: true,
              afp: 'ja_offentlig',
              currentSimulation: { ...currentSimulation },
            },
          },
        }
      )
      expect(await screen.findByTestId('highcharts-done-drawing')).toBeVisible()
      expect(usePensjonsavtalerQueryMock).toHaveBeenLastCalledWith(
        {
          aarligInntektFoerUttakBeloep: 500000,
          harAfp: false,
          sivilstand: undefined,
          uttaksperioder: [
            {
              startAlder: { aar: 67, maaneder: 0 },
              aarligInntektVsaPensjon: undefined,
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
      expect(legendItems).toHaveLength(3)
      expect(
        screen.queryByText('beregning.highcharts.serie.afp.name')
      ).not.toBeInTheDocument()
      expect(
        screen.getByText('beregning.highcharts.serie.inntekt.name')
      ).toBeVisible()
      expect(
        screen.getByText('beregning.highcharts.serie.alderspensjon.name')
      ).toBeVisible()
      expect(
        screen.getByText('beregning.highcharts.serie.tp.name')
      ).toBeVisible()
    })

    it('Når brukeren har 0 pensjonsavtaler', async () => {
      mockResponse('/v2/pensjonsavtaler', {
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
          headingLevel="3"
          aarligInntektFoerUttakBeloep="500 000"
          alderspensjonListe={alderspensjonData.alderspensjon}
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

    it('Når brukeren har en pensjonsavtale som begynner før uttaksalderen, viser infomelding om pensjonsavtaler', async () => {
      const scrollToMock = vi.fn()
      Object.defineProperty(global.window, 'scrollTo', {
        value: scrollToMock,
        writable: true,
      })

      const user = userEvent.setup()
      mockResponse('/v2/pensjonsavtaler', {
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
          headingLevel="3"
          aarligInntektFoerUttakBeloep="0"
          alderspensjonListe={alderspensjonData.alderspensjon}
          showButtonsAndTable={true}
        />,
        {
          preloadedState: {
            userInput: {
              ...userInputInitialState,
              samtykke: true,
              currentSimulation: {
                ...currentSimulation,
                aarligInntektFoerUttakBeloep: '500 000',
              },
            },
          },
        }
      )

      const elemDiv = document.createElement('div')
      elemDiv.setAttribute('id', 'pensjonsavtaler-heading')
      document.body.appendChild(elemDiv)
      await waitFor(async () => {
        expect(
          await screen.findByText(
            'Du har pensjonsavtaler som starter før valgt alder.',
            { exact: false }
          )
        ).toBeVisible()
      })
      await user.click(await screen.findByTestId('pensjonsavtaler-info-link'))
      expect(scrollToMock).toHaveBeenCalledWith({
        behavior: 'smooth',
        top: -15,
      })
    })

    describe('Gitt at brukeren har tp-medlemskap', () => {
      it('Når pensjonsavtaler hentes, vises det riktig infomelding for tp-ordning', async () => {
        render(
          <Simulering
            isLoading={false}
            headingLevel="3"
            aarligInntektFoerUttakBeloep="0"
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
        expect(
          await screen.findByText(
            'Denne beregningen viser kanskje ikke alt. Du kan ha rett til offentlig tjenestepensjon.',
            {
              exact: false,
            }
          )
        ).toBeVisible()
      })

      it('Når pensjonsavtaler feiler, vises det riktig feilmelding', async () => {
        mockErrorResponse('/v2/pensjonsavtaler', {
          status: 500,
          json: "Beep boop I'm an error!",
          method: 'post',
        })
        render(
          <Simulering
            isLoading={false}
            headingLevel="3"
            aarligInntektFoerUttakBeloep="0"
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
        expect(
          await screen.findByText(
            'Denne beregningen viser kanskje ikke alt. Vi klarte ikke å hente dine private pensjonsavtaler. Du kan også ha rett til offentlig tjenestepensjon.',
            {
              exact: false,
            }
          )
        ).toBeVisible()
      })

      it('Når pensjonsavtaler kommer med utilgjengelig selskap, vises det riktig feilmelding', async () => {
        mockResponse('/v2/pensjonsavtaler', {
          status: 200,
          json: {
            avtaler: [
              {
                produktbetegnelse:
                  'Oslo Pensjonsforsikring (livsvarig eksempel)',
                kategori: 'PRIVAT_TJENESTEPENSJON',
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
        render(
          <Simulering
            isLoading={false}
            headingLevel="3"
            aarligInntektFoerUttakBeloep="0"
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
        expect(
          await screen.findByText(
            'Denne beregningen viser kanskje ikke alt. Vi klarte ikke å hente alle dine private pensjonsavtaler. Du kan også ha rett til offentlig tjenestepensjon.',
            { exact: false }
          )
        ).toBeVisible()
      })

      it('Når pensjonsavtaler kommer med utilgjengelig selskap og 0 avtaler, vises det riktig feilmelding', async () => {
        mockResponse('/v2/pensjonsavtaler', {
          status: 200,
          json: {
            avtaler: [],
            utilgjengeligeSelskap: ['Something'],
          },
          method: 'post',
        })
        render(
          <Simulering
            isLoading={false}
            headingLevel="3"
            aarligInntektFoerUttakBeloep="0"
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
        expect(
          await screen.findByText(
            'Denne beregningen viser kanskje ikke alt. Vi klarte ikke å hente dine private pensjonsavtaler. Du kan også ha rett til offentlig tjenestepensjon.',
            { exact: false }
          )
        ).toBeVisible()
      })
    })

    describe('Gitt at brukeren ikke har noe tp-medlemskap', () => {
      beforeEach(() => {
        mockResponse('/v1/tpo-medlemskap', {
          status: 200,
          json: {
            tpLeverandoerListe: [],
          },
        })
      })
      it('Når pensjonsavtaler feiler, vises det riktig feilmelding', async () => {
        mockErrorResponse('/v2/pensjonsavtaler', {
          status: 500,
          json: "Beep boop I'm an error!",
          method: 'post',
        })
        render(
          <Simulering
            isLoading={false}
            headingLevel="3"
            aarligInntektFoerUttakBeloep="0"
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
        expect(
          await screen.findByText(
            'Denne beregningen viser kanskje ikke alt. Vi klarte ikke å hente',
            {
              exact: false,
            }
          )
        ).toBeVisible()
      })

      it('Når pensjonsavtaler kommer med utilgjengelig selskap, vises det riktig feilmelding', async () => {
        mockResponse('/v2/pensjonsavtaler', {
          status: 200,
          json: {
            avtaler: [
              {
                produktbetegnelse:
                  'Oslo Pensjonsforsikring (livsvarig eksempel)',
                kategori: 'PRIVAT_TJENESTEPENSJON',
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
        render(
          <Simulering
            isLoading={false}
            headingLevel="3"
            aarligInntektFoerUttakBeloep="0"
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
        expect(
          await screen.findByText(
            'Denne beregningen viser kanskje ikke alt. Vi klarte ikke å hente alle',
            { exact: false }
          )
        ).toBeVisible()
      })

      it('Når pensjonsavtaler kommer med utilgjengelig selska og 0 avtalerp, vises det riktig feilmelding', async () => {
        mockResponse('/v2/pensjonsavtaler', {
          status: 200,
          json: {
            avtaler: [],
            utilgjengeligeSelskap: ['Something'],
          },
          method: 'post',
        })
        render(
          <Simulering
            isLoading={false}
            headingLevel="3"
            aarligInntektFoerUttakBeloep="0"
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
        expect(
          await screen.findByText(
            'Denne beregningen viser kanskje ikke alt. Vi klarte ikke å hente',
            { exact: false }
          )
        ).toBeVisible()
      })
    })

    describe('Gitt at kall til tp-medlemskap feiler', () => {
      beforeEach(() => {
        mockErrorResponse('/v1/tpo-medlemskap')
      })

      it('Når pensjonsavtaler hentes, vises det riktig feilmelding for tp-ordninger', async () => {
        render(
          <Simulering
            isLoading={false}
            headingLevel="3"
            aarligInntektFoerUttakBeloep="0"
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
        expect(
          await screen.findByText(
            'Denne beregningen viser kanskje ikke alt. Vi klarte ikke å sjekke om du har pensjonsavtaler i offentlig sektor.',
            {
              exact: false,
            }
          )
        ).toBeVisible()
      })

      it('Når pensjonsavtaler feiler, vises det riktig feilmelding for tp-ordninger og pensjonsvtaler', async () => {
        mockErrorResponse('/v2/pensjonsavtaler', {
          status: 500,
          json: "Beep boop I'm an error!",
          method: 'post',
        })
        render(
          <Simulering
            isLoading={false}
            headingLevel="3"
            aarligInntektFoerUttakBeloep="0"
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
        expect(
          await screen.findByText(
            'Denne beregningen viser kanskje ikke alt. Vi klarte ikke å sjekke om du har pensjonsavtaler i offentlig sektor og vi klarte ikke å hente',
            {
              exact: false,
            }
          )
        ).toBeVisible()
      })

      it('Når pensjonsavtaler kommer med utilgjengelig selskap, vises det riktig feilmelding', async () => {
        mockResponse('/v2/pensjonsavtaler', {
          status: 200,
          json: {
            avtaler: [
              {
                produktbetegnelse:
                  'Oslo Pensjonsforsikring (livsvarig eksempel)',
                kategori: 'PRIVAT_TJENESTEPENSJON',
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
        render(
          <Simulering
            isLoading={false}
            headingLevel="3"
            aarligInntektFoerUttakBeloep="0"
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
        expect(
          await screen.findByText(
            'Denne beregningen viser kanskje ikke alt. Vi klarte ikke å sjekke om du har pensjonsavtaler i offentlig sektor og vi klarte ikke å hente alle',
            { exact: false }
          )
        ).toBeVisible()
      })

      it('Når pensjonsavtaler kommer med utilgjengelig selskap og 0 avtaler, vises det riktig feilmelding', async () => {
        mockResponse('/v2/pensjonsavtaler', {
          status: 200,
          json: {
            avtaler: [],
            utilgjengeligeSelskap: ['Something'],
          },
          method: 'post',
        })
        render(
          <Simulering
            isLoading={false}
            headingLevel="3"
            aarligInntektFoerUttakBeloep="0"
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
        expect(
          await screen.findByText(
            'Denne beregningen viser kanskje ikke alt. Vi klarte ikke å sjekke om du har pensjonsavtaler i offentlig sektor og vi klarte ikke å hente',
            { exact: false }
          )
        ).toBeVisible()
      })
    })
  })

  it('viser tabell og skjuler grafen for skjermlesere', async () => {
    const { store } = render(
      <Simulering
        isLoading={false}
        headingLevel="3"
        alderspensjonListe={alderspensjonData.alderspensjon}
        afpPrivatListe={afpPrivatData.afpPrivat}
        showButtonsAndTable={true}
        aarligInntektFoerUttakBeloep="500 000"
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
    store.dispatch(
      apiSliceUtils.apiSlice.endpoints.getHighchartsAccessibilityPluginFeatureToggle.initiate()
    )
    expect(await screen.findByText('beregning.tabell.vis')).toBeVisible()
    const highChartsWrapper = await screen.findByTestId(
      'highcharts-aria-wrapper'
    )
    await waitFor(() => {
      expect(highChartsWrapper.getAttribute('aria-hidden')).toBe('true')
    })
  })

  it('setter aria-hidden attribute iht feature toggle', async () => {
    mockResponse(
      '/feature/pensjonskalkulator.enable-highcharts-accessibility-plugin',
      {
        status: 200,
        json: { enabled: true },
      }
    )

    render(
      <Simulering
        isLoading={false}
        headingLevel="3"
        aarligInntektFoerUttakBeloep="0"
        afpPrivatListe={afpPrivatData.afpPrivat}
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
      const highchartsWrapper = await screen.findByTestId(
        'highcharts-aria-wrapper'
      )
      expect(highchartsWrapper.getAttribute('aria-hidden')).toBe('false')
    })
  })
})
