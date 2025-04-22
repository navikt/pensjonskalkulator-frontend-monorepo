import { describe, it, vi } from 'vitest'

import {
  fulfilledGetInntekt,
  fulfilledGetLoependeVedtak0Ufoeregrad,
  fulfilledGetLoependeVedtakLoependeAlderspensjon,
  fulfilledGetPerson,
} from '@/mocks/mockedRTKQueryApiCalls'
import { mockErrorResponse, mockResponse } from '@/mocks/server'
import * as apiSliceUtils from '@/state/api/apiSlice'
import {
  Simulation,
  userInputInitialState,
} from '@/state/userInput/userInputSlice'
import { act, render, screen, waitFor } from '@/test-utils'

import afpOffentligData from '../../../mocks/data/afp-offentlig.json' with { type: 'json' }
import afpPrivatData from '../../../mocks/data/afp-privat/67.json' with { type: 'json' }
import alderspensjonData from '../../../mocks/data/alderspensjon/67.json' with { type: 'json' }
import { Simulering } from '../Simulering'

describe('Simulering', () => {
  const currentSimulation: Simulation = {
    beregningsvalg: null,
    uttaksalder: { aar: 67, maaneder: 0 },
    aarligInntektFoerUttakBeloep: '0',
    gradertUttaksperiode: null,
  }

  const preloadedQueries = {
    ...fulfilledGetInntekt,
    ...fulfilledGetPerson,
  }

  const fakeApiCallUfoere = {
    queries: {
      ['getLoependeVedtak(undefined)']: {
        status: 'fulfilled',
        endpointName: 'getLoependeVedtak',
        requestId: 'xTaE6mOydr5ZI75UXq4Wi',
        startedTimeStamp: 1688046411971,
        data: {
          ufoeretrygd: { grad: 75 },
        } satisfies LoependeVedtak,
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

  describe('Gitt at brukeren har vedtak om alderspensjon', () => {
    it('viser banner om info for endret alderspensjon, og viser ikke tittel.', () => {
      render(
        <Simulering
          isLoading={false}
          headingLevel="3"
          alderspensjonListe={alderspensjonData.alderspensjon}
          afpPrivatListe={afpPrivatData.afpPrivat}
          showButtonsAndTable={true}
          aarligInntektFoerUttakBeloep="500 000"
          alderspensjonMaanedligVedEndring={{
            heltUttakMaanedligBeloep: 100000,
          }}
        />,
        {
          preloadedState: {
            api: {
              // @ts-ignore
              queries: {
                ...preloadedQueries,
                ...fulfilledGetLoependeVedtakLoependeAlderspensjon,
              },
            },
            userInput: {
              ...userInputInitialState,
              currentSimulation: { ...currentSimulation },
            },
          },
        }
      )
      expect(
        screen.queryByText('beregning.highcharts.title')
      ).not.toBeInTheDocument()
      expect(
        screen.getByText('beregning.avansert.endring_banner.title', {
          exact: false,
        })
      ).toBeVisible()
      expect(
        screen.getAllByText('100 000', {
          exact: false,
        })
      ).toHaveLength(2)
      expect(
        screen.getByText('beregning.avansert.endring_banner.kr_md', {
          exact: false,
        })
      ).toBeVisible()
    })
  })

  describe('Gitt at brukeren IKKE samtykker, ', () => {
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
            api: {
              // @ts-ignore
              queries: {
                ...preloadedQueries,
                ...fulfilledGetLoependeVedtak0Ufoeregrad,
              },
            },
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
            api: {
              // @ts-ignore
              queries: {
                ...preloadedQueries,
                ...fulfilledGetLoependeVedtak0Ufoeregrad,
              },
            },
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
            api: {
              // @ts-ignore
              queries: {
                ...preloadedQueries,
                ...fulfilledGetLoependeVedtak0Ufoeregrad,
              },
            },
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
            api: {
              // @ts-ignore
              queries: {
                ...preloadedQueries,
                ...fulfilledGetLoependeVedtak0Ufoeregrad,
              },
            },
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

    it('Når brukeren har vedtak om alderspensjon, vises det riktig infomelding for tp-ordning', async () => {
      render(
        <Simulering
          isLoading={false}
          headingLevel="3"
          aarligInntektFoerUttakBeloep="0"
          showButtonsAndTable={false}
        />,
        {
          preloadedState: {
            api: {
              // @ts-ignore
              queries: {
                ...preloadedQueries,
                ...fulfilledGetLoependeVedtakLoependeAlderspensjon,
              },
            },
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
        await screen.findByText('beregning.pensjonsavtaler.alert.endring')
      ).toBeVisible()
    })
  })

  describe('Gitt at brukeren samtykker, ', () => {
    it('Når brukeren velger uten AFP, henter og viser inntekt, alderspensjon, AFP og pensjonsavtaler.', async () => {
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
            api: {
              /* @ts-ignore */
              queries: {
                ...fulfilledGetPerson,
              },
            },
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
          epsHarPensjon: false,
          epsHarInntektOver2G: false,
          sivilstand: 'UGIFT',
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

    it('Når brukeren velger AFP-privat, henter og viser inntekt, alderspensjon, AFP og pensjonsavtaler.', async () => {
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
            api: {
              /* @ts-ignore */
              queries: {
                ...fulfilledGetPerson,
              },
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

      expect(usePensjonsavtalerQueryMock).toHaveBeenLastCalledWith(
        {
          aarligInntektFoerUttakBeloep: 500000,
          harAfp: true,
          epsHarPensjon: false,
          epsHarInntektOver2G: false,
          sivilstand: 'UGIFT',
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

    it('Når brukeren velger AFP-offentlig, henter og viser inntekt, alderspensjon, AFP og pensjonsavtaler.', async () => {
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
            api: {
              /* @ts-ignore */
              queries: {
                ...fulfilledGetPerson,
              },
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
      // Nødvendig for at animasjonen rekker å bli ferdig
      await act(async () => {
        await new Promise((r) => setTimeout(r, 500))
      })
      expect(usePensjonsavtalerQueryMock).toHaveBeenLastCalledWith(
        {
          aarligInntektFoerUttakBeloep: 500000,
          harAfp: false,
          epsHarPensjon: false,
          epsHarInntektOver2G: false,
          sivilstand: 'UGIFT',
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

    it('Når brukeren har uføretrygd og velger AFP-privat, henter og viser inntekt, alderspensjon og pensjonsavtaler.', async () => {
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
            api: {
              /* @ts-ignore */
              queries: {
                ...fakeApiCallUfoere,
                ...fulfilledGetPerson,
              },
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
          harAfp: true,
          epsHarPensjon: false,
          epsHarInntektOver2G: false,
          sivilstand: 'UGIFT',
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

    it('Når brukeren har uføretrygd og velger AFP-offentlig, henter og viser inntekt, alderspensjon og pensjonsavtaler.', async () => {
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
            api: {
              /* @ts-ignore */
              queries: {
                ...fakeApiCallUfoere,
                ...fulfilledGetPerson,
              },
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
          epsHarPensjon: false,
          epsHarInntektOver2G: false,
          sivilstand: 'UGIFT',
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

    it('Når brukeren har 0 pensjonsavtaler (private og offentlige), viser inntekt og alderspensjon (uten pensjonsavtaler).', async () => {
      mockResponse('/v2/simuler-oftp', {
        status: 200,
        json: {
          simuleringsresultatStatus: 'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING',
          muligeTpLeverandoerListe: [],
        },
        method: 'post',
      })

      mockResponse('/v3/pensjonsavtaler', {
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
            api: {
              /* @ts-ignore */
              queries: {
                ...fulfilledGetPerson,
              },
            },
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

    it('Når henting av pensjonsavtaler (private og offentlige) feiler, viser inntekt og alderspensjon (uten pensjonsavtaler) og alert.', async () => {
      mockErrorResponse('/v2/simuler-oftp', {
        method: 'post',
      })
      mockErrorResponse('/v3/pensjonsavtaler', {
        method: 'post',
      })

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
            api: {
              /* @ts-ignore */
              queries: {
                ...fulfilledGetPerson,
              },
            },
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
      expect(screen.getByTestId('pensjonsavtaler-alert')).toBeVisible()
    })

    it('Når brukeren uten offentlig-tp har minst én privat pensjonsavtale, viser inntekt, alderspensjon og pensjonsavtaler.', async () => {
      mockResponse('/v3/pensjonsavtaler', {
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
      mockResponse('/v2/simuler-oftp', {
        status: 200,
        json: {
          simuleringsresultatStatus: 'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING',
          muligeTpLeverandoerListe: [],
        },
        method: 'post',
      })

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
            api: {
              /* @ts-ignore */
              queries: {
                ...fulfilledGetPerson,
              },
            },
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
        screen.getByText('beregning.highcharts.serie.tp.name')
      ).toBeVisible()
    })

    it('Når brukeren har privat pensjonsavtale før valgt alder, viser alert.', async () => {
      mockResponse('/v3/pensjonsavtaler', {
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
            api: {
              /* @ts-ignore */
              queries: {
                ...fulfilledGetPerson,
              },
            },
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
        screen.getByText('beregning.highcharts.serie.tp.name')
      ).toBeVisible()
      await waitFor(async () => {
        expect(screen.getByTestId('pensjonsavtaler-alert')).toBeVisible()
      })
    })

    it('Når brukeren med offentlig-tp ikke har noe privat pensjonsavtale, viser inntekt, alderspensjon og pensjonsavtaler.', async () => {
      mockResponse('/v3/pensjonsavtaler', {
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
          showButtonsAndTable={false}
        />,
        {
          preloadedState: {
            api: {
              /* @ts-ignore */
              queries: {
                ...fulfilledGetPerson,
              },
            },
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
        screen.getByText('beregning.highcharts.serie.tp.name')
      ).toBeVisible()
    })
  })

  it('viser tabell og skjuler grafen for skjermlesere', async () => {
    render(
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
          api: {
            /* @ts-ignore */
            queries: {
              ...fulfilledGetPerson,
            },
          },
          userInput: {
            ...userInputInitialState,
            samtykke: true,
            currentSimulation: { ...currentSimulation },
          },
        },
      }
    )
    expect(await screen.findByText('beregning.tabell.vis')).toBeVisible()
    const highChartsWrapper = await screen.findByTestId(
      'highcharts-aria-wrapper'
    )
    await waitFor(() => {
      expect(highChartsWrapper.getAttribute('aria-hidden')).toBe('true')
    })
  })

  describe('Gitt at simuleringen er i enkel visning', () => {
    it('viser tittel og riktig ingress', async () => {
      render(
        <Simulering
          visning="enkel"
          isLoading={false}
          headingLevel="3"
          alderspensjonListe={alderspensjonData.alderspensjon}
          afpPrivatListe={afpPrivatData.afpPrivat}
          showButtonsAndTable={true}
          aarligInntektFoerUttakBeloep="500 000"
        />,
        {
          preloadedState: {
            api: {
              /* @ts-ignore */
              queries: {
                ...fulfilledGetPerson,
              },
            },
            userInput: {
              ...userInputInitialState,
              samtykke: true,
              currentSimulation: { ...currentSimulation },
            },
          },
        }
      )
      expect(screen.getByText('beregning.highcharts.title')).toBeVisible()
      expect(screen.getByText('beregning.highcharts.ingress')).toBeVisible()
    })
  })
})
