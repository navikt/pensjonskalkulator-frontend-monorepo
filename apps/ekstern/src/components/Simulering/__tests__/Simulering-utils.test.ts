import { IntlShape } from 'react-intl'

import { Chart } from 'highcharts'
import { describe, expect, it, vi } from 'vitest'

import { highchartsScrollingSelector } from '../constants'
import {
  getChartDefaults,
  processInntektArray,
  processPensjonsberegningArray,
  getAntallMaanederMedPensjon,
  processPensjonsavtalerArray,
  generateXAxis,
  getTooltipTitle,
  getHoverColor,
  getNormalColor,
  onVisFlereAarClick,
  onVisFaerreAarClick,
  handleChartScroll,
} from '../utils'

import { getChartMock } from './chart-mock'

describe('Simulering-utils', () => {
  const createMockedPensjonsavtale = (args: {
    startAar: number
    startMaaned?: number
    sluttAar?: number
    sluttMaaned?: number
    grad?: number
  }): Pensjonsavtale => {
    const {
      startAar,
      startMaaned = 0,
      sluttAar,
      sluttMaaned = 11,
      grad = 100,
    } = args

    return {
      key: 0,
      produktbetegnelse: 'Egen Sparing',
      kategori: 'INDIVIDUELL_ORDNING',
      startAar,
      sluttAar,
      utbetalingsperioder: [
        {
          startAlder: { aar: startAar, maaneder: startMaaned },
          ...(sluttAar && {
            sluttAlder: { aar: sluttAar, maaneder: sluttMaaned },
          }),
          grad,
          aarligUtbetaling: 100000,
        },
      ],
    }
  }

  afterEach(() => {
    document.getElementsByTagName('html')[0].innerHTML = ''
    vi.resetAllMocks()
  })

  describe('getChartDefaults', () => {
    it('enrer riktig defaults avhengig av aldere som sendes inn', () => {
      expect(getChartDefaults([])).toMatchSnapshot()
      expect(getChartDefaults(['62', '63', '64', '65'])).toMatchSnapshot()
    })
  })

  describe('processInntektArray', () => {
    describe('Når ingen uttaksperiode er oppgitt', () => {
      it('returnerer et array med én 0 verdi uten å feile', () => {
        expect(
          processInntektArray({
            inntektFoerUttakBeloep: 0,
            gradertUttak: undefined,
            heltUttak: undefined,
            length: 0,
          })
        ).toEqual([0])
      })

      it('returnerer et riktig mappet array med riktig beløp før uttak, og 0 verdi videre', () => {
        expect(
          processInntektArray({
            inntektFoerUttakBeloep: 500000,
            gradertUttak: undefined,
            heltUttak: undefined,
            length: 1,
          })
        ).toEqual([500000])
        expect(
          processInntektArray({
            inntektFoerUttakBeloep: 500000,
            gradertUttak: undefined,
            heltUttak: undefined,
            length: 4,
          })
        ).toEqual([500000, 0, 0, 0])
      })
    })
    describe('Når helt uttak er oppgitt', () => {
      it('uten inntekt vsa hel pensjon, returnerer et riktig mappet array med riktig beløp før uttak', () => {
        expect(
          processInntektArray({
            inntektFoerUttakBeloep: 500000,
            gradertUttak: undefined,
            heltUttak: {
              fra: { aar: 65, maaneder: 0 },
              til: undefined,
              beloep: undefined,
            },
            length: 5,
          })
        ).toEqual([500000, 0, 0, 0, 0])

        expect(
          processInntektArray({
            inntektFoerUttakBeloep: 500000,
            gradertUttak: undefined,
            heltUttak: {
              fra: { aar: 65, maaneder: 4 },
              til: undefined,
              beloep: undefined,
            },
            length: 5,
          })
        ).toEqual([500000, 166666.66666666666, 0, 0, 0])
      })
      it('med inntekt vsa hel pensjon, returnerer et riktig mappet array med riktig beløp før uttak, og verdi for inntekt vsa pensjon videre', () => {
        expect(
          processInntektArray({
            inntektFoerUttakBeloep: 500000,
            gradertUttak: undefined,
            heltUttak: {
              fra: { aar: 65, maaneder: 0 },
              til: { aar: 67, maaneder: 0 },
              beloep: 300000,
            },
            length: 5,
          })
        ).toEqual([500000, 300000, 300000, 0, 0])

        expect(
          processInntektArray({
            inntektFoerUttakBeloep: 500000,
            gradertUttak: undefined,
            heltUttak: {
              fra: { aar: 65, maaneder: 4 },
              til: { aar: 67, maaneder: 3 },
              beloep: 300000,
            },
            length: 5,
          })
        ).toEqual([500000, 366666.6666666666, 300000, 75000, 0])
      })
    })

    describe('Når helt uttak og gradert uttak er oppgitt', () => {
      it('returnerer et riktig mappet array med riktig beløp før uttak, og verdi for inntekt vsa pensjon videre', () => {
        expect(
          processInntektArray({
            inntektFoerUttakBeloep: 500000,
            gradertUttak: {
              fra: { aar: 65, maaneder: 0 },
              til: { aar: 67, maaneder: 0 },
              beloep: 300000,
            },
            heltUttak: {
              fra: { aar: 67, maaneder: 0 },
              til: { aar: 71, maaneder: 0 },
              beloep: 100000,
            },
            length: 8,
          })
        ).toEqual([500000, 300000, 300000, 100000, 100000, 100000, 100000, 0])

        expect(
          processInntektArray({
            inntektFoerUttakBeloep: 500000,
            gradertUttak: {
              fra: { aar: 65, maaneder: 4 },
              til: { aar: 67, maaneder: 3 },
              beloep: 300000,
            },
            heltUttak: {
              fra: { aar: 67, maaneder: 3 },
              til: { aar: 71, maaneder: 8 },
              beloep: 100000,
            },
            length: 10,
          })
        ).toEqual([
          500000, 366666.6666666666, 300000, 150000, 100000, 100000, 100000,
          66666.66666666667, 0, 0,
        ])
      })
    })
  })

  describe('processPensjonsberegningArray', () => {
    it('returnerer et array med en 0 verdi uten å feile hvis input er et tomt array', () => {
      expect(processPensjonsberegningArray([], 0)).toEqual([0, 0])
      expect(processPensjonsberegningArray([], 1)).toEqual([0, 0])
    })

    it('returnerer riktig mappet array med 0 verdi først, beløp, og livsvarig beløp duplisert sist, avhengig av x-axis lengden', () => {
      expect(
        processPensjonsberegningArray(
          [
            {
              alder: 75,
              beloep: 20000,
            },

            {
              alder: 76,
              beloep: 80000,
            },
            {
              alder: 77,
              beloep: 80000,
            },
          ],
          2
        )
      ).toEqual([0, 20000, 80000, 80000, 80000])
      expect(
        processPensjonsberegningArray(
          [
            {
              alder: 75,
              beloep: 20000,
            },

            {
              alder: 76,
              beloep: 80000,
            },
            {
              alder: 77,
              beloep: 80000,
            },
          ],
          5
        )
      ).toEqual([0, 20000, 80000, 80000, 80000])
      expect(
        processPensjonsberegningArray(
          [
            {
              alder: 75,
              beloep: 20000,
            },

            {
              alder: 76,
              beloep: 80000,
            },
            {
              alder: 77,
              beloep: 80000,
            },
          ],
          10
        )
      ).toEqual([
        0, 20000, 80000, 80000, 80000, 80000, 80000, 80000, 80000, 80000,
      ])
    })
  })

  describe('getAntallMaanederMedPensjon', () => {
    it('returnerer 12 måneder når uttaksalderen er hverken først eller sist', () => {
      expect(getAntallMaanederMedPensjon(69, { aar: 68, maaneder: 0 })).toBe(12)
      expect(
        getAntallMaanederMedPensjon(
          69,
          { aar: 68, maaneder: 3 },
          { aar: 70, maaneder: 11 }
        )
      ).toBe(12)
    })
    test.each([
      [0, 12],
      [1, 11],
      [2, 10],
      [3, 9],
      [4, 8],
      [5, 7],
      [6, 6],
      [7, 5],
      [8, 4],
      [9, 3],
      [10, 2],
      [11, 1],
    ])(
      'returnerer %s måneder  når uttaksalderen er først',
      async (maaneder, expected) => {
        expect(getAntallMaanederMedPensjon(67, { aar: 67, maaneder })).toEqual(
          expected
        )
      }
    )

    test.each([
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 8],
      [8, 9],
      [9, 10],
      [10, 11],
      [11, 12],
    ])(
      'returnerer %s måneder når uttaksalderen er sist',
      async (maaneder, expected) => {
        expect(
          getAntallMaanederMedPensjon(
            77,
            { aar: 67, maaneder: 0 },
            { aar: 77, maaneder }
          )
        ).toEqual(expected)
      }
    )

    it('returnerer riktig antall år når avtalen er på ett og samme år år', () => {
      expect(
        getAntallMaanederMedPensjon(
          67,
          { aar: 67, maaneder: 0 },
          { aar: 67, maaneder: 0 }
        )
      ).toBe(1)
      expect(
        getAntallMaanederMedPensjon(
          67,
          { aar: 67, maaneder: 0 },
          { aar: 67, maaneder: 1 }
        )
      ).toBe(2)
      expect(
        getAntallMaanederMedPensjon(
          67,
          { aar: 67, maaneder: 0 },
          { aar: 67, maaneder: 11 }
        )
      ).toBe(12)
      expect(
        getAntallMaanederMedPensjon(
          67,
          { aar: 67, maaneder: 5 },
          { aar: 67, maaneder: 10 }
        )
      ).toBe(6)
      expect(
        getAntallMaanederMedPensjon(
          67,
          { aar: 67, maaneder: 3 },
          { aar: 67, maaneder: 2 }
        )
      ).toBe(0)
    })
  })
  describe('processPensjonsavtalerArray', () => {
    it('returnerer en liste med 0 med riktig lengde', () => {
      expect(processPensjonsavtalerArray(66, 13, [])).toEqual([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ])
      expect(processPensjonsavtalerArray(66, 1, [])).toEqual([0])
      expect(processPensjonsavtalerArray(66, 0, [])).toEqual([])
    })

    it('returnerer riktig summer med en eller flere avtaler, eller med flere utbetalingsperioder', () => {
      const avtale = createMockedPensjonsavtale({
        startAar: 67,
        sluttAar: 77,
        grad: 50,
      })
      expect(processPensjonsavtalerArray(66, 13, [{ ...avtale }])).toEqual([
        0, 100000, 100000, 100000, 100000, 100000, 100000, 100000, 100000,
        100000, 100000, 100000, 0,
      ])
      expect(
        processPensjonsavtalerArray(66, 13, [
          createMockedPensjonsavtale({
            startAar: 67,
            startMaaned: 6,
            sluttAar: 77,
          }),
        ])
      ).toEqual([
        0, 50000, 100000, 100000, 100000, 100000, 100000, 100000, 100000,
        100000, 100000, 100000, 0,
      ])
      expect(
        processPensjonsavtalerArray(66, 13, [
          {
            ...avtale,
            utbetalingsperioder: [
              {
                startAlder: { aar: 67, maaneder: 0 },
                sluttAlder: { aar: 70, maaneder: 11 },
                aarligUtbetaling: 100000,
                grad: 100,
              },
              {
                startAlder: { aar: 71, maaneder: 0 },
                sluttAlder: { aar: 77, maaneder: 11 },
                aarligUtbetaling: 100000,
                grad: 100,
              },
            ],
          },
          createMockedPensjonsavtale({ startAar: 70, sluttAar: 78 }),
        ])
      ).toEqual([
        0, 100000, 100000, 100000, 200000, 200000, 200000, 200000, 200000,
        200000, 200000, 200000, 100000,
      ])
      expect(
        processPensjonsavtalerArray(66, 13, [
          {
            ...avtale,
            utbetalingsperioder: [
              {
                startAlder: { aar: 67, maaneder: 0 },
                sluttAlder: { aar: 70, maaneder: 5 },
                aarligUtbetaling: 100000,
                grad: 100,
              },
              {
                startAlder: { aar: 70, maaneder: 6 },
                sluttAlder: { aar: 77, maaneder: 11 },
                aarligUtbetaling: 100000,
                grad: 100,
              },
            ],
          },
          createMockedPensjonsavtale({ startAar: 70, sluttAar: 78 }),
        ])
      ).toEqual([
        0, 100000, 100000, 100000, 200000, 200000, 200000, 200000, 200000,
        200000, 200000, 200000, 100000,
      ])
    })

    it('returnerer riktig summer med livsvarig avtale (avtale uten sluttAar)', () => {
      expect(
        processPensjonsavtalerArray(66, 13, [
          createMockedPensjonsavtale({ startAar: 67, sluttAar: undefined }),
        ])
      ).toEqual([
        0, 100000, 100000, 100000, 100000, 100000, 100000, 100000, 100000,
        100000, 100000, 100000, 100000,
      ])
      expect(
        processPensjonsavtalerArray(66, 14, [
          createMockedPensjonsavtale({ startAar: 67, sluttAar: undefined }),
          createMockedPensjonsavtale({ startAar: 70, sluttAar: 78 }),
        ])
      ).toEqual([
        0, 100000, 100000, 100000, 200000, 200000, 200000, 200000, 200000,
        200000, 200000, 200000, 200000, 100000,
      ])
    })
  })

  describe('generateXAxis', () => {
    const setIsPensjonsavtaleFlagVisibleMock = vi.fn()
    const maxArray = [
      '61',
      '62',
      '63',
      '64',
      '65',
      '66',
      '67',
      '68',
      '69',
      '70',
      '71',
      '72',
      '73',
      '74',
      '75',
      '76',
      '77',
      '77+',
    ]

    it('returnerer riktig array når pensjonsavtaler-arrayet er tomt', () => {
      const alderArray = generateXAxis(
        65,
        [],
        setIsPensjonsavtaleFlagVisibleMock
      )
      expect(alderArray).toEqual([
        '64',
        '65',
        '66',
        '67',
        '68',
        '69',
        '70',
        '71',
        '72',
        '73',
        '74',
        '75',
        '76',
        '77',
        '77+',
      ])
    })

    it('returnerer et minimum array fra året før startAar til 77+ når pensjonsavtaler dekker en mindre periode eller er livsvarige', () => {
      const alderArray = generateXAxis(
        62,
        [
          createMockedPensjonsavtale({
            startAar: 67,
            sluttAar: 70,
          }),
        ],
        setIsPensjonsavtaleFlagVisibleMock
      )
      expect(alderArray).toHaveLength(18)
      expect(alderArray).toEqual(maxArray)

      const alderArrayUnlimited = generateXAxis(
        62,
        [
          createMockedPensjonsavtale({
            startAar: 67,
          }),
        ],
        setIsPensjonsavtaleFlagVisibleMock
      )
      expect(alderArrayUnlimited).toHaveLength(18)
      expect(alderArrayUnlimited).toEqual(maxArray)
    })

    it('returnerer riktig array når pensjonsavtaler har ulike startAar, eller utbetalingsperioder med ulike startAar', () => {
      const avtale1 = createMockedPensjonsavtale({
        startAar: 68,
        sluttAar: 70,
      })
      const alderArray1 = generateXAxis(
        67,
        [
          { ...avtale1 },
          createMockedPensjonsavtale({
            startAar: 70,
            sluttAar: 72,
          }),
        ],
        setIsPensjonsavtaleFlagVisibleMock
      )
      expect(alderArray1).toHaveLength(13)
      expect(alderArray1).toEqual([
        '66',
        '67',
        '68',
        '69',
        '70',
        '71',
        '72',
        '73',
        '74',
        '75',
        '76',
        '77',
        '77+',
      ])

      const alderArray2 = generateXAxis(
        67,
        [
          {
            ...avtale1,
            utbetalingsperioder: [
              ...avtale1.utbetalingsperioder,
              {
                startAlder: { aar: 70, maaneder: 0 },
                sluttAlder: { aar: 72, maaneder: 0 },
                aarligUtbetaling: 100000,
                grad: 100,
              },
            ],
          },
        ],
        setIsPensjonsavtaleFlagVisibleMock
      )
      expect(alderArray2).toHaveLength(13)
      expect(alderArray2).toEqual([
        '66',
        '67',
        '68',
        '69',
        '70',
        '71',
        '72',
        '73',
        '74',
        '75',
        '76',
        '77',
        '77+',
      ])
    })

    it('returnerer riktig array når pensjonsavtaler har ulike sluttAlder under 77', () => {
      const alderArray = generateXAxis(
        65,
        [
          createMockedPensjonsavtale({
            startAar: 67,
            sluttAar: 70,
          }),
          createMockedPensjonsavtale({
            startAar: 68,
            sluttAar: 72,
          }),
        ],
        setIsPensjonsavtaleFlagVisibleMock
      )
      expect(alderArray).toHaveLength(15)
      expect(alderArray).toEqual([
        '64',
        '65',
        '66',
        '67',
        '68',
        '69',
        '70',
        '71',
        '72',
        '73',
        '74',
        '75',
        '76',
        '77',
        '77+',
      ])
    })
    it('returnerer riktig array når sluttAlder er utenfor standardområdet, og kaller setIsPensjonsavtaleFlagVisible når en avtale begynner før startAar', () => {
      const alderArray = generateXAxis(
        62,
        [createMockedPensjonsavtale({ startAar: 55, sluttAar: 80 })],
        setIsPensjonsavtaleFlagVisibleMock
      )
      expect(alderArray).toEqual([
        '61',
        '62',
        '63',
        '64',
        '65',
        '66',
        '67',
        '68',
        '69',
        '70',
        '71',
        '72',
        '73',
        '74',
        '75',
        '76',
        '77',
        '78',
        '79',
        '80',
        '80+',
      ])
      expect(setIsPensjonsavtaleFlagVisibleMock).toHaveBeenCalled()
    })
  })

  describe('getTooltipTitle', () => {
    const intlMock = {
      formatMessage: (s: { id: string }) => s.id,
    } as unknown as IntlShape

    it('returnerer riktig streng for inntekt uten pensjon', () => {
      expect(getTooltipTitle('67', true, false, intlMock)).toEqual(
        'beregning.highcharts.tooltip.inntekt 67 alder.aar'
      )
    })
    it('returnerer riktig streng for pensjon uten inntekt', () => {
      expect(getTooltipTitle('67', false, true, intlMock)).toEqual(
        'beregning.highcharts.tooltip.pensjon 67 alder.aar'
      )
    })
    it('returnerer riktig streng for pensjon og inntekt', () => {
      expect(getTooltipTitle('67', true, true, intlMock)).toEqual(
        'beregning.highcharts.tooltip.inntekt_og_pensjon 67 alder.aar'
      )
    })
    it('returnerer streng for pensjon som fallback', () => {
      expect(getTooltipTitle('67', false, false, intlMock)).toEqual(
        'beregning.highcharts.tooltip.pensjon 67 alder.aar'
      )
    })
  })

  describe('getHoverColor og getNormalColor', () => {
    test.each([
      ['var(--a-deepblue-500)', 'var(--a-deepblue-200)'],
      ['var(--a-green-400)', 'var(--a-green-200)'],
      ['var(--a-purple-400)', 'var(--a-purple-200)'],
      ['var(--a-gray-500)', 'var(--a-gray-300)'],
      ['#FF0000', ''],
    ])('returnerer riktig hover farge for: %s', async (a, expected) => {
      const color = getHoverColor(a)
      expect(color).toEqual(expected)
    })

    test.each([
      ['var(--a-deepblue-200)', 'var(--a-deepblue-500)'],
      ['var(--a-green-200)', 'var(--a-green-400)'],
      ['var(--a-purple-200)', 'var(--a-purple-400)'],
      ['var(--a-gray-300)', 'var(--a-gray-500)'],
      ['var(--a-deepblue-500)', 'var(--a-deepblue-500)'],
      ['var(--a-green-400)', 'var(--a-green-400)'],
      ['var(--a-purple-400)', 'var(--a-purple-400)'],
      ['var(--a-gray-500)', 'var(--a-gray-500)'],
    ])('returnerer riktig normal farge for: %s', async (a, expected) => {
      const color = getNormalColor(a)
      expect(color).toEqual(expected)
    })
  })
  describe('onVisFlereAarClick og onVisFaerreAarClick', () => {
    it('finner riktig element og øker scrollLeft', () => {
      const div = document.createElement('div')
      div.innerHTML = '<div class="highcharts-scrolling">SPAN</div>'
      document.body.appendChild(div)
      expect(div.scrollLeft).toBe(0)
      onVisFlereAarClick()
      expect(
        (document.querySelector(highchartsScrollingSelector) as HTMLElement)
          .scrollLeft
      ).toBe(50)
      onVisFlereAarClick()
      expect(
        (document.querySelector(highchartsScrollingSelector) as HTMLElement)
          .scrollLeft
      ).toBe(100)
      onVisFaerreAarClick()
      expect(
        (document.querySelector(highchartsScrollingSelector) as HTMLElement)
          .scrollLeft
      ).toBe(50)
      onVisFaerreAarClick()
      expect(
        (document.querySelector(highchartsScrollingSelector) as HTMLElement)
          .scrollLeft
      ).toBe(0)
    })
  })

  describe('handleChartScroll', () => {
    const redrawMock = vi.fn()
    const tooltipUpdateMock = vi.fn()

    const chart = getChartMock(vi.fn(), tooltipUpdateMock, vi.fn())

    it('skjuler tooltip og kaller resetColumnColors når brukeren ikke beveger scroll-posisjonen allikevel', () => {
      vi.useFakeTimers()
      const showRightButtonMock = vi.fn()
      const showLeftButtonMock = vi.fn()
      const mockedEvent = {
        currentTarget: {
          scrollLeft: 150,
          handleButtonVisibility: {
            showRightButton: showRightButtonMock,
            showLeftButton: showLeftButtonMock,
          },
        },
      }

      handleChartScroll(mockedEvent as unknown as Event, {
        chart: {
          ...chart,
          redraw: redrawMock,
          tooltip: {
            update: tooltipUpdateMock,
            isHidden: false,
          },
        } as unknown as Chart,
        scrollPosition: 100,
      })
      vi.advanceTimersByTime(150)
      expect(redrawMock).toHaveBeenCalledOnce()
    })

    describe('Gitt at brukeren scroller', () => {
      it('Viser ingen knapp når det ikke er mer innhold og at graffens scroll posisjon er på 0', () => {
        const showRightButtonMock = vi.fn()
        const showLeftButtonMock = vi.fn()

        const mockedEvent = {
          currentTarget: {
            scrollLeft: 0,
            scrollWidth: 366,
            offsetWidth: 366,
            handleButtonVisibility: {
              showRightButton: showRightButtonMock,
              showLeftButton: showLeftButtonMock,
            },
          },
        }
        handleChartScroll(mockedEvent as unknown as Event, {
          chart: undefined,
          scrollPosition: undefined,
        })
        expect(showRightButtonMock).toHaveBeenCalledWith(false)
        expect(showLeftButtonMock).toHaveBeenCalledWith(false)
      })

      it('Viser Flere år knapp og skjuler Færre år knapp når det er mer innhold og at graffens scroll posisjon er på 0', () => {
        const showRightButtonMock = vi.fn()
        const showLeftButtonMock = vi.fn()

        const mockedEvent = {
          currentTarget: {
            scrollLeft: 0,
            scrollWidth: 500,
            offsetWidth: 366,
            handleButtonVisibility: {
              showRightButton: showRightButtonMock,
              showLeftButton: showLeftButtonMock,
            },
          },
        }
        handleChartScroll(mockedEvent as unknown as Event, {
          chart: undefined,
          scrollPosition: undefined,
        })
        expect(showRightButtonMock).toHaveBeenCalledWith(true)
        expect(showLeftButtonMock).toHaveBeenCalledWith(false)
      })

      it('Skjuler Flere år knapp og viser Færre år knapp når graffens scroll posisjon er på maks', () => {
        const showRightButtonMock = vi.fn()
        const showLeftButtonMock = vi.fn()

        const mockedEvent = {
          currentTarget: {
            scrollLeft: 50,
            offsetWidth: 450,
            scrollWidth: 500,
            handleButtonVisibility: {
              showRightButton: showRightButtonMock,
              showLeftButton: showLeftButtonMock,
            },
          },
        }
        handleChartScroll(mockedEvent as unknown as Event, {
          chart: undefined,
          scrollPosition: undefined,
        })
        expect(showRightButtonMock).toHaveBeenCalledWith(false)
        expect(showLeftButtonMock).toHaveBeenCalledWith(true)
      })

      it('Viser både Flere år knapp og Færre år knapp når graffens scroll posisjon er et sted i midten', () => {
        const showRightButtonMock = vi.fn()
        const showLeftButtonMock = vi.fn()

        const mockedEvent = {
          currentTarget: {
            scrollLeft: 50,
            offsetWidth: 100,
            scrollWidth: 500,
            handleButtonVisibility: {
              showRightButton: showRightButtonMock,
              showLeftButton: showLeftButtonMock,
            },
          },
        }
        handleChartScroll(mockedEvent as unknown as Event, {
          chart: undefined,
          scrollPosition: undefined,
        })
        expect(showRightButtonMock).toHaveBeenCalledWith(true)
        expect(showLeftButtonMock).toHaveBeenCalledWith(true)
      })
    })
  })
})
