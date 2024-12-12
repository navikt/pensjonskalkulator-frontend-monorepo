import React from 'react'
import { IntlProvider } from 'react-intl'

import { add, endOfDay, format } from 'date-fns'
import HighchartsReact from 'highcharts-react-official'
import { describe, expect, it } from 'vitest'

import afpOffentligData from '../../../mocks/data/afp-offentlig.json' with { type: 'json' }
import afpPrivatData from '../../../mocks/data/afp-privat/67.json' with { type: 'json' }
import alderspensjonData from '../../../mocks/data/alderspensjon/67.json' with { type: 'json' }
import offentligTpData from '../../../mocks/data/offentlig-tp.json' with { type: 'json' }
import pensjonsavtalerData from '../../../mocks/data/pensjonsavtaler/67.json' with { type: 'json' }
import { getTranslation_nb } from '../../../translations/nb'
import {
  useSimuleringChartLocalState,
  useSimuleringPensjonsavtalerLocalState,
} from '../hooks'
import { renderHook } from '@/test-utils'
import { DATE_BACKEND_FORMAT } from '@/utils/dates'
import * as loggerUtils from '@/utils/logging'

import globalClassNames from './Simulering.module.scss'

describe('Simulering-hooks', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <IntlProvider locale="nb" messages={getTranslation_nb()}>
        {children}
      </IntlProvider>
    )
  }

  describe('useSimuleringChartLocalState', () => {
    const showLoadingMock = vi.fn()
    const hideLoadingMock = vi.fn()
    const initialProps = {
      styles: {
        lorem: 'ipsum',
      } as Partial<typeof globalClassNames>,
      chartRef: {
        current: {
          chart: { showLoading: showLoadingMock, hideLoading: hideLoadingMock },
        },
      } as unknown as React.RefObject<HighchartsReact.RefObject>,
      foedselsdato: '1963-04-30',
      isEndring: false,
      aarligInntektFoerUttakBeloep: '300 000',
      gradertUttaksperiode: {
        grad: 40,
        uttaksalder: { aar: 67, maaneder: 0 },
        aarligInntektVsaPensjonBeloep: '250 000',
      },
      uttaksalder: { aar: 70, maaneder: 0 },
      aarligInntektVsaHelPensjon: {
        beloep: '100 000',
        sluttAlder: { aar: 75, maaneder: 0 },
      },
      isLoading: false,
      pensjonsavtaler: {
        isLoading: false,
      },
      offentligTp: {
        isLoading: false,
      },
    }

    describe('Gitt at data lastes', () => {
      it('Når hverken alderspensjon eller pensjonsavtaler laster, kaller hideLoading gjennom chartRef', () => {
        renderHook(useSimuleringChartLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
          },
        })
        expect(hideLoadingMock).toHaveBeenCalled()
        expect(showLoadingMock).not.toHaveBeenCalled()
      })

      it('Når alderspensjon laster, kaller showLoading gjennom chartRef', () => {
        renderHook(useSimuleringChartLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
            isLoading: true,
          },
        })
        expect(showLoadingMock).toHaveBeenCalled()
      })

      it('Når private pensjonsavtaler laster, kaller showLoading gjennom chartRef', () => {
        renderHook(useSimuleringChartLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
            pensjonsavtaler: {
              isLoading: true,
            },
          },
        })
        expect(showLoadingMock).toHaveBeenCalled()
      })

      it('Når offentlig tjenestepensjon laster, kaller showLoading gjennom chartRef', () => {
        renderHook(useSimuleringChartLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
            offentligTp: {
              isLoading: true,
              isSuccess: false,
              isError: false,
            },
          },
        })
        expect(showLoadingMock).toHaveBeenCalled()
      })
    })

    describe('Gitt at data for alderspensjon og evt. AFP er tilgjengelig,', () => {
      it('Når brukeren har en gradert periode, beregner riktig xAxis for grafen basert på uttaksalderen og series blir riktig', () => {
        const { result } = renderHook(useSimuleringChartLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
            alderspensjonListe: [...alderspensjonData.alderspensjon],
          },
        })
        expect(result.current[0].xAxis).toMatchInlineSnapshot(`
        {
          "categories": [
            "66",
            "67",
            "68",
            "69",
            "70",
            "71",
            "72",
            "73",
            "74",
            "75",
            "76",
            "77",
            "77+",
          ],
        }
      `)
        expect(result.current[0].series).toMatchInlineSnapshot(`
          [
            {
              "color": "var(--a-gray-500)",
              "data": [
                300000,
                250000,
                250000,
                250000,
                100000,
                100000,
                100000,
                100000,
                100000,
                0,
                0,
                0,
                0,
              ],
              "name": "Pensjonsgivende inntekt",
              "pointWidth": 25,
              "type": "column",
            },
            {
              "color": "var(--a-deepblue-500)",
              "data": [
                0,
                234518,
                234722,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
              ],
              "name": "Alderspensjon (Nav)",
              "pointWidth": 25,
              "type": "column",
            },
          ]
        `)
      })

      it('Når brukeren ikke har noe gradert periode, beregner riktig xAxis for grafen basert på uttaksalderen og series blir riktig', () => {
        const { result } = renderHook(useSimuleringChartLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
            gradertUttaksperiode: null,
            alderspensjonListe: [...alderspensjonData.alderspensjon],
          },
        })
        expect(result.current[0].xAxis).toMatchInlineSnapshot(`
        {
          "categories": [
            "69",
            "70",
            "71",
            "72",
            "73",
            "74",
            "75",
            "76",
            "77",
            "77+",
          ],
        }
      `)
        expect(result.current[0].series).toMatchInlineSnapshot(`
          [
            {
              "color": "var(--a-gray-500)",
              "data": [
                300000,
                100000,
                100000,
                100000,
                100000,
                100000,
                0,
                0,
                0,
                0,
              ],
              "name": "Pensjonsgivende inntekt",
              "pointWidth": 25,
              "type": "column",
            },
            {
              "color": "var(--a-deepblue-500)",
              "data": [
                0,
                234518,
                234722,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
              ],
              "name": "Alderspensjon (Nav)",
              "pointWidth": 25,
              "type": "column",
            },
          ]
        `)
      })

      it('Når brukeren har vedtak om alderspensjon, beregner riktig xAxis for grafen basert på brukerens alder og series blir riktig', () => {
        const minAlderYearsBeforeNow = add(endOfDay(new Date()), {
          years: -63,
          months: -1,
        })
        // Brukeren skal være 63 år og 1 md gammel
        const foedselsdato = format(minAlderYearsBeforeNow, DATE_BACKEND_FORMAT)

        const { result } = renderHook(useSimuleringChartLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
            foedselsdato,
            isEndring: true,
            alderspensjonListe: [...alderspensjonData.alderspensjon],
          },
        })
        expect(result.current[0].xAxis).toMatchInlineSnapshot(`
        {
          "categories": [
            "63",
            "64",
            "65",
            "66",
            "67",
            "68",
            "69",
            "70",
            "71",
            "72",
            "73",
            "74",
            "75",
            "76",
            "77",
            "77+",
          ],
        }
      `)
        expect(result.current[0].series).toMatchInlineSnapshot(`
          [
            {
              "color": "var(--a-gray-500)",
              "data": [
                300000,
                300000,
                300000,
                300000,
                250000,
                250000,
                250000,
                100000,
                100000,
                100000,
                100000,
                100000,
                0,
                0,
                0,
                0,
              ],
              "name": "Pensjonsgivende inntekt",
              "pointWidth": 25,
              "type": "column",
            },
            {
              "color": "var(--a-deepblue-500)",
              "data": [
                234518,
                234722,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
              ],
              "name": "Alderspensjon (Nav)",
              "pointWidth": 25,
              "type": "column",
            },
          ]
        `)
      })

      it('Når brukeren har en gradert periode, beregner riktig xAxis for grafen basert på uttaksalderen. AFP privat påvirker ikke xAxis og series blir riktig', () => {
        const { result } = renderHook(useSimuleringChartLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
            alderspensjonListe: [...alderspensjonData.alderspensjon],
            afpPrivatListe: [...afpPrivatData.afpPrivat],
          },
        })
        expect(result.current[0].xAxis).toMatchInlineSnapshot(`
        {
          "categories": [
            "66",
            "67",
            "68",
            "69",
            "70",
            "71",
            "72",
            "73",
            "74",
            "75",
            "76",
            "77",
            "77+",
          ],
        }
      `)
        expect(result.current[0].series).toMatchInlineSnapshot(`
          [
            {
              "color": "var(--a-gray-500)",
              "data": [
                300000,
                250000,
                250000,
                250000,
                100000,
                100000,
                100000,
                100000,
                100000,
                0,
                0,
                0,
                0,
              ],
              "name": "Pensjonsgivende inntekt",
              "pointWidth": 25,
              "type": "column",
            },
            {
              "color": "var(--a-purple-400)",
              "data": [
                0,
                20000,
                80000,
                80000,
                80000,
                80000,
                80000,
                80000,
                80000,
                80000,
                80000,
                80000,
                80000,
              ],
              "name": "AFP (avtalefestet pensjon)",
              "pointWidth": 25,
              "type": "column",
            },
            {
              "color": "var(--a-deepblue-500)",
              "data": [
                0,
                234518,
                234722,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
              ],
              "name": "Alderspensjon (Nav)",
              "pointWidth": 25,
              "type": "column",
            },
          ]
        `)
      })

      it('Når brukeren har en gradert periode, beregner riktig xAxis for grafen basert på uttaksalderen. AFP offentlig påvirker ikke xAxis og series blir riktig', () => {
        const { result } = renderHook(useSimuleringChartLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
            alderspensjonListe: [...alderspensjonData.alderspensjon],
            afpOffentligListe: [...afpOffentligData.afpOffentlig],
          },
        })
        expect(result.current[0].xAxis).toMatchInlineSnapshot(`
        {
          "categories": [
            "66",
            "67",
            "68",
            "69",
            "70",
            "71",
            "72",
            "73",
            "74",
            "75",
            "76",
            "77",
            "77+",
          ],
        }
      `)
        expect(result.current[0].series).toMatchInlineSnapshot(`
          [
            {
              "color": "var(--a-gray-500)",
              "data": [
                300000,
                250000,
                250000,
                250000,
                100000,
                100000,
                100000,
                100000,
                100000,
                0,
                0,
                0,
                0,
              ],
              "name": "Pensjonsgivende inntekt",
              "pointWidth": 25,
              "type": "column",
            },
            {
              "color": "var(--a-purple-400)",
              "data": [
                0,
                49059,
                49059,
                49059,
                49059,
                49059,
                49059,
                49059,
                49059,
                49059,
                49059,
                49059,
                49059,
              ],
              "name": "AFP (avtalefestet pensjon)",
              "pointWidth": 25,
              "type": "column",
            },
            {
              "color": "var(--a-deepblue-500)",
              "data": [
                0,
                234518,
                234722,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
              ],
              "name": "Alderspensjon (Nav)",
              "pointWidth": 25,
              "type": "column",
            },
          ]
        `)
      })
    })

    describe('Gitt at data for alderspensjon og private pensjonsavtaler er tilgjengelig,', () => {
      const pensjonsavtaler = {
        isLoading: false,
        data: {
          avtaler: [...pensjonsavtalerData.avtaler] as Pensjonsavtale[],
          partialResponse: false,
        },
      }

      it('Når brukeren har en gradert periode, beregner riktig xAxis for grafen basert på uttaksalderen og private pensjonsavtaler og series blir riktig', () => {
        const { result } = renderHook(useSimuleringChartLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
            alderspensjonListe: [...alderspensjonData.alderspensjon],
            pensjonsavtaler,
          },
        })
        expect(result.current[0].xAxis).toMatchInlineSnapshot(`
          {
            "categories": [
              "66",
              "67",
              "68",
              "69",
              "70",
              "71",
              "72",
              "73",
              "74",
              "75",
              "76",
              "77",
              "78",
              "79",
              "80",
              "81",
              "82",
              "83",
              "84",
              "85",
              "86",
              "87",
              "87+",
            ],
          }
        `)
        expect(result.current[0].series).toMatchInlineSnapshot(`
          [
            {
              "color": "var(--a-gray-500)",
              "data": [
                300000,
                250000,
                250000,
                250000,
                100000,
                100000,
                100000,
                100000,
                100000,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
              ],
              "name": "Pensjonsgivende inntekt",
              "pointWidth": 25,
              "type": "column",
            },
            {
              "color": "var(--a-green-400)",
              "data": [
                0,
                162264,
                162264,
                162264,
                208165,
                229066,
                229066,
                254066,
                254066,
                195510,
                162264,
                172264,
                137000,
                137000,
                137000,
                137000,
                137000,
                137000,
                137000,
                137000,
                137000,
                127000,
                125000,
              ],
              "name": "Pensjonsavtaler (arbeidsgivere m.m.)",
              "pointWidth": 25,
              "type": "column",
            },
            {
              "color": "var(--a-deepblue-500)",
              "data": [
                0,
                234518,
                234722,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
              ],
              "name": "Alderspensjon (Nav)",
              "pointWidth": 25,
              "type": "column",
            },
          ]
        `)
      })

      it('Når brukeren ikke har noe gradert periode, beregner riktig xAxis for grafen basert på uttaksalderen og private pensjonsavtaler og series blir riktig', () => {
        const { result } = renderHook(useSimuleringChartLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
            gradertUttaksperiode: null,
            alderspensjonListe: [...alderspensjonData.alderspensjon],
            pensjonsavtaler,
          },
        })
        expect(result.current[0].xAxis).toMatchInlineSnapshot(`
          {
            "categories": [
              "69",
              "70",
              "71",
              "72",
              "73",
              "74",
              "75",
              "76",
              "77",
              "78",
              "79",
              "80",
              "81",
              "82",
              "83",
              "84",
              "85",
              "86",
              "87",
              "87+",
            ],
          }
        `)
        expect(result.current[0].series).toMatchInlineSnapshot(`
          [
            {
              "color": "var(--a-gray-500)",
              "data": [
                300000,
                100000,
                100000,
                100000,
                100000,
                100000,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
              ],
              "name": "Pensjonsgivende inntekt",
              "pointWidth": 25,
              "type": "column",
            },
            {
              "color": "var(--a-green-400)",
              "data": [
                162264,
                208165,
                229066,
                229066,
                254066,
                254066,
                195510,
                162264,
                172264,
                137000,
                137000,
                137000,
                137000,
                137000,
                137000,
                137000,
                137000,
                137000,
                127000,
                125000,
              ],
              "name": "Pensjonsavtaler (arbeidsgivere m.m.)",
              "pointWidth": 25,
              "type": "column",
            },
            {
              "color": "var(--a-deepblue-500)",
              "data": [
                0,
                234518,
                234722,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
              ],
              "name": "Alderspensjon (Nav)",
              "pointWidth": 25,
              "type": "column",
            },
          ]
        `)
      })

      it('Når brukeren har vedtak om alderspensjon, beregner riktig xAxis for grafen basert på brukerens alder og private pensjonsavtaler og series blir riktig', () => {
        const minAlderYearsBeforeNow = add(endOfDay(new Date()), {
          years: -63,
          months: -1,
        })
        const foedselsdato = format(minAlderYearsBeforeNow, DATE_BACKEND_FORMAT)

        const { result } = renderHook(useSimuleringChartLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
            foedselsdato,
            isEndring: true,
            alderspensjonListe: [...alderspensjonData.alderspensjon],
            pensjonsavtaler,
          },
        })
        expect(result.current[0].xAxis).toMatchInlineSnapshot(`
          {
            "categories": [
              "63",
              "64",
              "65",
              "66",
              "67",
              "68",
              "69",
              "70",
              "71",
              "72",
              "73",
              "74",
              "75",
              "76",
              "77",
              "78",
              "79",
              "80",
              "81",
              "82",
              "83",
              "84",
              "85",
              "86",
              "87",
              "87+",
            ],
          }
        `)
        expect(result.current[0].series).toMatchInlineSnapshot(`
          [
            {
              "color": "var(--a-gray-500)",
              "data": [
                300000,
                300000,
                300000,
                300000,
                250000,
                250000,
                250000,
                100000,
                100000,
                100000,
                100000,
                100000,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
              ],
              "name": "Pensjonsgivende inntekt",
              "pointWidth": 25,
              "type": "column",
            },
            {
              "color": "var(--a-green-400)",
              "data": [
                0,
                0,
                0,
                0,
                162264,
                162264,
                162264,
                208165,
                229066,
                229066,
                254066,
                254066,
                195510,
                162264,
                172264,
                137000,
                137000,
                137000,
                137000,
                137000,
                137000,
                137000,
                137000,
                137000,
                127000,
                125000,
              ],
              "name": "Pensjonsavtaler (arbeidsgivere m.m.)",
              "pointWidth": 25,
              "type": "column",
            },
            {
              "color": "var(--a-deepblue-500)",
              "data": [
                234518,
                234722,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
              ],
              "name": "Alderspensjon (Nav)",
              "pointWidth": 25,
              "type": "column",
            },
          ]
        `)
      })
    })

    describe('Gitt at data for alderspensjon og offentlig tjenestepensjon er tilgjengelig,', () => {
      const offentligTp = {
        isLoading: false,
        data: offentligTpData as OffentligTp,
      }

      it('Når brukeren har en gradert periode, beregner riktig xAxis for grafen basert på uttaksalderen og private pensjonsavtaler og series blir riktig', () => {
        const { result } = renderHook(useSimuleringChartLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
            alderspensjonListe: [...alderspensjonData.alderspensjon],
            offentligTp,
          },
        })
        expect(result.current[0].xAxis).toMatchInlineSnapshot(`
          {
            "categories": [
              "66",
              "67",
              "68",
              "69",
              "70",
              "71",
              "72",
              "73",
              "74",
              "75",
              "76",
              "77",
              "77+",
            ],
          }
        `)
        expect(result.current[0].series).toMatchInlineSnapshot(`
          [
            {
              "color": "var(--a-gray-500)",
              "data": [
                300000,
                250000,
                250000,
                250000,
                100000,
                100000,
                100000,
                100000,
                100000,
                0,
                0,
                0,
                0,
              ],
              "name": "Pensjonsgivende inntekt",
              "pointWidth": 25,
              "type": "column",
            },
            {
              "color": "var(--a-green-400)",
              "data": [
                0,
                64340,
                64340,
                64340,
                53670,
                53670,
                53670,
                53670,
                53670,
                48900,
                48900,
                48900,
                48900,
              ],
              "name": "Pensjonsavtaler (arbeidsgivere m.m.)",
              "pointWidth": 25,
              "type": "column",
            },
            {
              "color": "var(--a-deepblue-500)",
              "data": [
                0,
                234518,
                234722,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
              ],
              "name": "Alderspensjon (Nav)",
              "pointWidth": 25,
              "type": "column",
            },
          ]
        `)
      })

      it('Når brukeren ikke har noe gradert periode, beregner riktig xAxis for grafen basert på uttaksalderen og private pensjonsavtaler og series blir riktig', () => {
        const { result } = renderHook(useSimuleringChartLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
            gradertUttaksperiode: null,
            alderspensjonListe: [...alderspensjonData.alderspensjon],
            offentligTp,
          },
        })
        expect(result.current[0].xAxis).toMatchInlineSnapshot(`
          {
            "categories": [
              "69",
              "70",
              "71",
              "72",
              "73",
              "74",
              "75",
              "76",
              "77",
              "77+",
            ],
          }
        `)
        expect(result.current[0].series).toMatchInlineSnapshot(`
          [
            {
              "color": "var(--a-gray-500)",
              "data": [
                300000,
                100000,
                100000,
                100000,
                100000,
                100000,
                0,
                0,
                0,
                0,
              ],
              "name": "Pensjonsgivende inntekt",
              "pointWidth": 25,
              "type": "column",
            },
            {
              "color": "var(--a-green-400)",
              "data": [
                64340,
                53670,
                53670,
                53670,
                53670,
                53670,
                48900,
                48900,
                48900,
                48900,
              ],
              "name": "Pensjonsavtaler (arbeidsgivere m.m.)",
              "pointWidth": 25,
              "type": "column",
            },
            {
              "color": "var(--a-deepblue-500)",
              "data": [
                0,
                234518,
                234722,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
              ],
              "name": "Alderspensjon (Nav)",
              "pointWidth": 25,
              "type": "column",
            },
          ]
        `)
      })

      it('Når brukeren har vedtak om alderspensjon, beregner riktig xAxis for grafen basert på brukerens alder og private pensjonsavtaler og series blir riktig', () => {
        const minAlderYearsBeforeNow = add(endOfDay(new Date()), {
          years: -63,
          months: -1,
        })
        const foedselsdato = format(minAlderYearsBeforeNow, DATE_BACKEND_FORMAT)

        const { result } = renderHook(useSimuleringChartLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
            foedselsdato,
            isEndring: true,
            alderspensjonListe: [...alderspensjonData.alderspensjon],
            offentligTp,
          },
        })
        expect(result.current[0].xAxis).toMatchInlineSnapshot(`
          {
            "categories": [
              "63",
              "64",
              "65",
              "66",
              "67",
              "68",
              "69",
              "70",
              "71",
              "72",
              "73",
              "74",
              "75",
              "76",
              "77",
              "77+",
            ],
          }
        `)
        expect(result.current[0].series).toMatchInlineSnapshot(`
          [
            {
              "color": "var(--a-gray-500)",
              "data": [
                300000,
                300000,
                300000,
                300000,
                250000,
                250000,
                250000,
                100000,
                100000,
                100000,
                100000,
                100000,
                0,
                0,
                0,
                0,
              ],
              "name": "Pensjonsgivende inntekt",
              "pointWidth": 25,
              "type": "column",
            },
            {
              "color": "var(--a-green-400)",
              "data": [
                0,
                0,
                0,
                0,
                64340,
                64340,
                64340,
                53670,
                53670,
                53670,
                53670,
                53670,
                48900,
                48900,
                48900,
                48900,
              ],
              "name": "Pensjonsavtaler (arbeidsgivere m.m.)",
              "pointWidth": 25,
              "type": "column",
            },
            {
              "color": "var(--a-deepblue-500)",
              "data": [
                234518,
                234722,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
              ],
              "name": "Alderspensjon (Nav)",
              "pointWidth": 25,
              "type": "column",
            },
          ]
        `)
      })
    })

    describe('Gitt at data for alderspensjon og private pensjonsavtaler og offentlig tjenestepensjon er tilgjengelig,', () => {
      const pensjonsavtaler = {
        isLoading: false,
        data: {
          avtaler: [{ ...pensjonsavtalerData.avtaler[0] }] as Pensjonsavtale[],
          partialResponse: false,
        },
      }

      const offentligTp = {
        isLoading: false,
        data: offentligTpData as OffentligTp,
      }

      it('Når brukeren har en gradert periode, beregner riktig xAxis for grafen basert på uttaksalderen og private pensjonsavtaler og series blir riktig', () => {
        const { result } = renderHook(useSimuleringChartLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
            alderspensjonListe: [...alderspensjonData.alderspensjon],
            pensjonsavtaler,
            offentligTp,
          },
        })
        expect(result.current[0].xAxis).toMatchInlineSnapshot(`
          {
            "categories": [
              "66",
              "67",
              "68",
              "69",
              "70",
              "71",
              "72",
              "73",
              "74",
              "75",
              "76",
              "77",
              "77+",
            ],
          }
        `)
        expect(result.current[0].series).toMatchInlineSnapshot(`
          [
            {
              "color": "var(--a-gray-500)",
              "data": [
                300000,
                250000,
                250000,
                250000,
                100000,
                100000,
                100000,
                100000,
                100000,
                0,
                0,
                0,
                0,
              ],
              "name": "Pensjonsgivende inntekt",
              "pointWidth": 25,
              "type": "column",
            },
            {
              "color": "var(--a-green-400)",
              "data": [
                0,
                64340,
                64340,
                64340,
                78670,
                78670,
                78670,
                103670,
                103670,
                48900,
                48900,
                48900,
                48900,
              ],
              "name": "Pensjonsavtaler (arbeidsgivere m.m.)",
              "pointWidth": 25,
              "type": "column",
            },
            {
              "color": "var(--a-deepblue-500)",
              "data": [
                0,
                234518,
                234722,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
              ],
              "name": "Alderspensjon (Nav)",
              "pointWidth": 25,
              "type": "column",
            },
          ]
        `)
      })

      it('Når brukeren ikke har noe gradert periode, beregner riktig xAxis for grafen basert på uttaksalderen og private pensjonsavtaler og series blir riktig', () => {
        const { result } = renderHook(useSimuleringChartLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
            gradertUttaksperiode: null,
            alderspensjonListe: [...alderspensjonData.alderspensjon],
            pensjonsavtaler,
            offentligTp,
          },
        })
        expect(result.current[0].xAxis).toMatchInlineSnapshot(`
          {
            "categories": [
              "69",
              "70",
              "71",
              "72",
              "73",
              "74",
              "75",
              "76",
              "77",
              "77+",
            ],
          }
        `)
        expect(result.current[0].series).toMatchInlineSnapshot(`
          [
            {
              "color": "var(--a-gray-500)",
              "data": [
                300000,
                100000,
                100000,
                100000,
                100000,
                100000,
                0,
                0,
                0,
                0,
              ],
              "name": "Pensjonsgivende inntekt",
              "pointWidth": 25,
              "type": "column",
            },
            {
              "color": "var(--a-green-400)",
              "data": [
                64340,
                78670,
                78670,
                78670,
                103670,
                103670,
                48900,
                48900,
                48900,
                48900,
              ],
              "name": "Pensjonsavtaler (arbeidsgivere m.m.)",
              "pointWidth": 25,
              "type": "column",
            },
            {
              "color": "var(--a-deepblue-500)",
              "data": [
                0,
                234518,
                234722,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
              ],
              "name": "Alderspensjon (Nav)",
              "pointWidth": 25,
              "type": "column",
            },
          ]
        `)
      })

      it('Når brukeren har vedtak om alderspensjon, beregner riktig xAxis for grafen basert på brukerens alder og private pensjonsavtaler og series blir riktig', () => {
        const minAlderYearsBeforeNow = add(endOfDay(new Date()), {
          years: -63,
          months: -1,
        })
        const foedselsdato = format(minAlderYearsBeforeNow, DATE_BACKEND_FORMAT)

        const { result } = renderHook(useSimuleringChartLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
            foedselsdato,
            isEndring: true,
            alderspensjonListe: [...alderspensjonData.alderspensjon],
            pensjonsavtaler,
            offentligTp,
          },
        })
        expect(result.current[0].xAxis).toMatchInlineSnapshot(`
          {
            "categories": [
              "63",
              "64",
              "65",
              "66",
              "67",
              "68",
              "69",
              "70",
              "71",
              "72",
              "73",
              "74",
              "75",
              "76",
              "77",
              "77+",
            ],
          }
        `)
        expect(result.current[0].series).toMatchInlineSnapshot(`
          [
            {
              "color": "var(--a-gray-500)",
              "data": [
                300000,
                300000,
                300000,
                300000,
                250000,
                250000,
                250000,
                100000,
                100000,
                100000,
                100000,
                100000,
                0,
                0,
                0,
                0,
              ],
              "name": "Pensjonsgivende inntekt",
              "pointWidth": 25,
              "type": "column",
            },
            {
              "color": "var(--a-green-400)",
              "data": [
                0,
                0,
                0,
                0,
                64340,
                64340,
                64340,
                78670,
                78670,
                78670,
                103670,
                103670,
                48900,
                48900,
                48900,
                48900,
              ],
              "name": "Pensjonsavtaler (arbeidsgivere m.m.)",
              "pointWidth": 25,
              "type": "column",
            },
            {
              "color": "var(--a-deepblue-500)",
              "data": [
                234518,
                234722,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
                234756,
              ],
              "name": "Alderspensjon (Nav)",
              "pointWidth": 25,
              "type": "column",
            },
          ]
        `)
      })
    })

    it('Gitt at brukeren ikke har noe inntekt, så skal serien ikke lastes, og dermed ikke vise noe legend', () => {
      const { result } = renderHook(useSimuleringChartLocalState, {
        wrapper,
        initialProps: {
          ...initialProps,
          aarligInntektFoerUttakBeloep: '0',
          gradertUttaksperiode: null,
          aarligInntektVsaHelPensjon: undefined,
          alderspensjonListe: [...alderspensjonData.alderspensjon],
          afpPrivatListe: [...afpPrivatData.afpPrivat],
          afpOffentligListe: [...afpOffentligData.afpOffentlig],
        },
      })

      const series = result.current[0].series as Highcharts.SeriesOptionsType[]
      expect(series).toHaveLength(3)
      expect(series.some((s) => s.name === 'Pensjonsgivende inntekt')).toBe(
        false
      )
    })
  })

  describe('useSimuleringPensjonsavtalerLocalState', () => {
    const initialProps = {
      isEndring: false,
      isPensjonsavtaleFlagVisible: false,
      pensjonsavtaler: {
        isLoading: false,
        isSuccess: false,
        isError: false,
      },
      offentligTp: {
        isError: false,
      },
    }

    it('Når tpo isError er true, logger riktig melding', () => {
      const loggerMock = vi.spyOn(loggerUtils, 'logger')
      renderHook(useSimuleringPensjonsavtalerLocalState, {
        wrapper,
        initialProps: {
          ...initialProps,
          offentligTp: {
            isError: true,
          },
        },
      })

      expect(loggerMock).toHaveBeenCalledWith('alert', {
        tekst:
          'TPO infoboks: Vi klarte ikke å sjekke om du har pensjonsavtaler i offentlig sektor',
      })
    })

    it('Når offentligTp data inneholder muligeTpLeverandoerListe, logger riktig melding', () => {
      const loggerMock = vi.spyOn(loggerUtils, 'logger')
      renderHook(useSimuleringPensjonsavtalerLocalState, {
        wrapper,
        initialProps: {
          ...initialProps,
          offentligTp: {
            isError: false,
            data: {
              simuleringsresultatStatus: 'OK',
              muligeTpLeverandoerListe: [
                'Statens pensjonskasse',
                'Kommunal Landspensjonskasse',
                'Oslo Pensjonsforsikring',
              ],
            },
          },
        },
      })

      expect(loggerMock).toHaveBeenCalledWith('alert', {
        tekst: 'TPO infoboks: Du kan ha rett til offentlig tjenestepensjon',
      })
    })

    it('Når pensjonsavtaler er ferdig lastet og isPensjonsavtaleFlagVisible er true, returnerer riktig pensjonsavtalerAlert', () => {
      const { result } = renderHook(useSimuleringPensjonsavtalerLocalState, {
        wrapper,
        initialProps: {
          ...initialProps,
          isPensjonsavtaleFlagVisible: true,
          pensjonsavtaler: {
            isLoading: false,
            isSuccess: true,
            isError: false,
            data: {
              avtaler: [...pensjonsavtalerData.avtaler] as Pensjonsavtale[],
              partialResponse: false,
            },
          },
        },
      })
      expect(result.current[0]?.variant).toBe('info')
      expect(result.current[0]?.text).toBe('beregning.pensjonsavtaler.info')
    })

    it('Når brukeren har vedtak om alderspensjon, returnerer riktig pensjonsavtalerAlert', () => {
      const { result } = renderHook(useSimuleringPensjonsavtalerLocalState, {
        wrapper,
        initialProps: {
          ...initialProps,
          isEndring: true,
        },
      })
      expect(result.current[0]?.variant).toBe('info')
      expect(result.current[0]?.text).toBe('beregning.tpo.info.endring')
    })

    describe('Gitt at kall til offentligTp er vellykket', () => {
      it('Når offentligTp returnerer en liste over tp-ordninger og at pensjonsavtaler har feilet, returnerer riktig pensjonsavtalerAlert', () => {
        const { result } = renderHook(useSimuleringPensjonsavtalerLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
            offentligTp: {
              isError: false,
              data: {
                simuleringsresultatStatus: 'OK',
                muligeTpLeverandoerListe: ['Leverandør 1'],
              },
            },
            pensjonsavtaler: {
              isLoading: false,
              isSuccess: true,
              isError: true,
            },
          },
        })
        expect(result.current[0]?.variant).toBe('alert-warning')
        expect(result.current[0]?.text).toBe(
          'beregning.tpo.info.pensjonsavtaler.error'
        )
      })

      it('Når offentligTp returnerer en liste over tp-ordninger og at pensjonsavtaler har delvis svar med 0 avtaler, returnerer riktig pensjonsavtalerAlert', () => {
        const { result } = renderHook(useSimuleringPensjonsavtalerLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
            offentligTp: {
              isError: false,
              data: {
                simuleringsresultatStatus: 'OK',
                muligeTpLeverandoerListe: ['Leverandør 1'],
              },
            },
            pensjonsavtaler: {
              isLoading: false,
              isSuccess: true,
              isError: false,
              data: {
                avtaler: [] as Pensjonsavtale[],
                partialResponse: true,
              },
            },
          },
        })
        expect(result.current[0]?.variant).toBe('alert-warning')
        expect(result.current[0]?.text).toBe(
          'beregning.tpo.info.pensjonsavtaler.error'
        )
      })

      it('Når offentligTp returnerer en liste over tp-ordninger og at pensjonsavtaler har delvis svar, returnerer riktig pensjonsavtalerAlert', () => {
        const { result } = renderHook(useSimuleringPensjonsavtalerLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
            offentligTp: {
              isError: false,
              data: {
                simuleringsresultatStatus: 'OK',
                muligeTpLeverandoerListe: ['Leverandør 1'],
              },
            },
            pensjonsavtaler: {
              isLoading: false,
              isSuccess: true,
              isError: false,
              data: {
                avtaler: [...pensjonsavtalerData.avtaler] as Pensjonsavtale[],
                partialResponse: true,
              },
            },
          },
        })
        expect(result.current[0]?.variant).toBe('alert-warning')
        expect(result.current[0]?.text).toBe(
          'beregning.tpo.info.pensjonsavtaler.partial'
        )
      })

      it('Når offentligTp returnerer en liste over tp-ordninger og at brukeren har pensjonsavtaler, returnerer riktig pensjonsavtalerAlert', () => {
        const { result } = renderHook(useSimuleringPensjonsavtalerLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
            offentligTp: {
              isError: false,
              data: {
                simuleringsresultatStatus: 'OK',
                muligeTpLeverandoerListe: ['Leverandør 1'],
              },
            },
            pensjonsavtaler: {
              isLoading: false,
              isSuccess: true,
              isError: false,
              data: {
                avtaler: [...pensjonsavtalerData.avtaler] as Pensjonsavtale[],
                partialResponse: false,
              },
            },
          },
        })
        expect(result.current[0]?.variant).toBe('alert-info')
        expect(result.current[0]?.text).toBe('beregning.tpo.info')
      })

      it('Når offentligTp returnerer en liste uten tp-ordninger og at pensjonsavtaler har feilet, returnerer riktig pensjonsavtalerAlert', () => {
        const { result } = renderHook(useSimuleringPensjonsavtalerLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
            offentligTp: {
              isError: false,
              data: {
                simuleringsresultatStatus:
                  'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING',
                muligeTpLeverandoerListe: [],
              },
            },
            pensjonsavtaler: {
              isLoading: false,
              isSuccess: true,
              isError: true,
            },
          },
        })
        expect(result.current[0]?.variant).toBe('alert-warning')
        expect(result.current[0]?.text).toBe('beregning.pensjonsavtaler.error')
      })

      it('Når offentligTp returnerer en liste uten tp-ordninger og at pensjonsavtaler har delvis svar med 0 avtaler, returnerer riktig pensjonsavtalerAlert', () => {
        const { result } = renderHook(useSimuleringPensjonsavtalerLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
            offentligTp: {
              isError: false,
              data: {
                simuleringsresultatStatus:
                  'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING',
                muligeTpLeverandoerListe: [],
              },
            },
            pensjonsavtaler: {
              isLoading: false,
              isSuccess: true,
              isError: false,
              data: {
                avtaler: [] as Pensjonsavtale[],
                partialResponse: true,
              },
            },
          },
        })
        expect(result.current[0]?.variant).toBe('alert-warning')
        expect(result.current[0]?.text).toBe('beregning.pensjonsavtaler.error')
      })

      it('Når offentligTp returnerer en liste uten tp-ordninger og at pensjonsavtaler har delvis svar, returnerer riktig pensjonsavtalerAlert', () => {
        const { result } = renderHook(useSimuleringPensjonsavtalerLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
            offentligTp: {
              isError: false,
              data: {
                simuleringsresultatStatus:
                  'BRUKER_ER_IKKE_MEDLEM_AV_TP_ORDNING',
                muligeTpLeverandoerListe: [],
              },
            },
            pensjonsavtaler: {
              isLoading: false,
              isSuccess: true,
              isError: false,
              data: {
                avtaler: [...pensjonsavtalerData.avtaler] as Pensjonsavtale[],
                partialResponse: true,
              },
            },
          },
        })
        expect(result.current[0]?.variant).toBe('alert-warning')
        expect(result.current[0]?.text).toBe(
          'beregning.pensjonsavtaler.partial'
        )
      })
    })
    describe('Gitt at kall til offentligTp har feilet', () => {
      it('Når pensjonsavtaler har feilet, returnerer riktig pensjonsavtalerAlert', () => {
        const { result } = renderHook(useSimuleringPensjonsavtalerLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
            offentligTp: {
              isError: true,
            },
            pensjonsavtaler: {
              isLoading: false,
              isSuccess: true,
              isError: true,
            },
          },
        })
        expect(result.current[0]?.variant).toBe('alert-warning')
        expect(result.current[0]?.text).toBe(
          'beregning.tpo.error.pensjonsavtaler.error'
        )
      })

      it('Når pensjonsavtaler har delvis svar med 0 avtaler, returnerer riktig pensjonsavtalerAlert', () => {
        const { result } = renderHook(useSimuleringPensjonsavtalerLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
            offentligTp: {
              isError: true,
            },
            pensjonsavtaler: {
              isLoading: false,
              isSuccess: true,
              isError: false,
              data: {
                avtaler: [] as Pensjonsavtale[],
                partialResponse: true,
              },
            },
          },
        })
        expect(result.current[0]?.variant).toBe('alert-warning')
        expect(result.current[0]?.text).toBe(
          'beregning.tpo.error.pensjonsavtaler.error'
        )
      })

      it('Når pensjonsavtaler har delvis svar, returnerer riktig pensjonsavtalerAlert', () => {
        const { result } = renderHook(useSimuleringPensjonsavtalerLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
            offentligTp: {
              isError: true,
            },
            pensjonsavtaler: {
              isLoading: false,
              isSuccess: true,
              isError: false,
              data: {
                avtaler: [...pensjonsavtalerData.avtaler] as Pensjonsavtale[],
                partialResponse: true,
              },
            },
          },
        })
        expect(result.current[0]?.variant).toBe('alert-warning')
        expect(result.current[0]?.text).toBe(
          'beregning.tpo.error.pensjonsavtaler.partial'
        )
      })

      it('Når pensjonsavtaler er tilgjengelig, returnerer riktig pensjonsavtalerAlert', () => {
        const { result } = renderHook(useSimuleringPensjonsavtalerLocalState, {
          wrapper,
          initialProps: {
            ...initialProps,
            offentligTp: {
              isError: true,
            },
            pensjonsavtaler: {
              isLoading: false,
              isSuccess: true,
              isError: false,
              data: {
                avtaler: [...pensjonsavtalerData.avtaler] as Pensjonsavtale[],
                partialResponse: false,
              },
            },
          },
        })
        expect(result.current[0]?.variant).toBe('alert-warning')
        expect(result.current[0]?.text).toBe('beregning.tpo.error')
      })
    })
  })
})
