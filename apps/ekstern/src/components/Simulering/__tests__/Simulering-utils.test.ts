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
      sluttMaaned = 0,
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
    it('returnerer et array med en 0 verdi uten å feile hvis input er 0', () => {
      expect(processInntektArray(0, 0, 0)).toEqual([0])
      expect(processInntektArray(0, 1, 0)).toEqual([0])
    })

    it('returnerer riktig mappet array med beløp og 0 verdi', () => {
      expect(processInntektArray(500000, 1, 0)).toEqual([500000])
      expect(processInntektArray(500000, 4, 0)).toEqual([500000, 0, 0, 0])
    })

    it('returnerer riktig mappet array uttak etter mnd ', () => {
      expect(processInntektArray(1200, 1, 4)).toEqual([1200, 400])
      expect(processInntektArray(1200, 4, 4)).toEqual([1200, 400, 0, 0])
      expect(processInntektArray(1200, 2, 4)).toEqual([1200, 400])
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
    it('returnerer riktig når året er hverken først eller sist', () => {
      expect(getAntallMaanederMedPensjon(false, false, 2, 6)).toBe(12)
    })
    it('returnerer riktig når året er først', () => {
      expect(getAntallMaanederMedPensjon(true, false, 0, 6)).toBe(12)
      expect(getAntallMaanederMedPensjon(true, false, 1, 6)).toBe(11)
      expect(getAntallMaanederMedPensjon(true, false, 2, 6)).toBe(10)
      expect(getAntallMaanederMedPensjon(true, false, 3, 6)).toBe(9)
      expect(getAntallMaanederMedPensjon(true, false, 4, 6)).toBe(8)
      expect(getAntallMaanederMedPensjon(true, false, 5, 6)).toBe(7)
      expect(getAntallMaanederMedPensjon(true, false, 6, 6)).toBe(6)
      expect(getAntallMaanederMedPensjon(true, false, 7, 6)).toBe(5)
      expect(getAntallMaanederMedPensjon(true, false, 8, 6)).toBe(4)
      expect(getAntallMaanederMedPensjon(true, false, 9, 6)).toBe(3)
      expect(getAntallMaanederMedPensjon(true, false, 10, 6)).toBe(2)
      expect(getAntallMaanederMedPensjon(true, false, 11, 6)).toBe(1)
    })
    it('returnerer riktig når året er sist', () => {
      expect(getAntallMaanederMedPensjon(false, true, 1, 0)).toBe(0)
      expect(getAntallMaanederMedPensjon(false, true, 1, 1)).toBe(1)
      expect(getAntallMaanederMedPensjon(false, true, 1, 2)).toBe(2)
      expect(getAntallMaanederMedPensjon(false, true, 1, 3)).toBe(3)
      expect(getAntallMaanederMedPensjon(false, true, 1, 4)).toBe(4)
      expect(getAntallMaanederMedPensjon(false, true, 1, 5)).toBe(5)
      expect(getAntallMaanederMedPensjon(false, true, 1, 6)).toBe(6)
      expect(getAntallMaanederMedPensjon(false, true, 1, 7)).toBe(7)
      expect(getAntallMaanederMedPensjon(false, true, 1, 8)).toBe(8)
      expect(getAntallMaanederMedPensjon(false, true, 1, 9)).toBe(9)
      expect(getAntallMaanederMedPensjon(false, true, 1, 10)).toBe(10)
      expect(getAntallMaanederMedPensjon(false, true, 1, 11)).toBe(11)
    })
    it('returnerer riktig når året er først og sist', () => {
      expect(getAntallMaanederMedPensjon(true, true, 0, 0)).toBe(0)
      expect(getAntallMaanederMedPensjon(true, true, 11, 11)).toBe(0)
      expect(getAntallMaanederMedPensjon(true, true, 0, 11)).toBe(11)
      expect(getAntallMaanederMedPensjon(true, true, 5, 11)).toBe(6)
      expect(getAntallMaanederMedPensjon(true, true, 0, 1)).toBe(1)
      expect(getAntallMaanederMedPensjon(true, true, 10, 11)).toBe(1)
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
      })
      expect(processPensjonsavtalerArray(66, 13, [{ ...avtale }])).toEqual([
        0, 100000, 100000, 100000, 100000, 100000, 100000, 100000, 100000,
        100000, 100000, 0, 0,
      ])

      expect(
        processPensjonsavtalerArray(66, 13, [
          { ...avtale },
          createMockedPensjonsavtale({ startAar: 70, sluttAar: 78 }),
        ])
      ).toEqual([
        0, 100000, 100000, 100000, 200000, 200000, 200000, 200000, 200000,
        200000, 200000, 100000, 0,
      ])
      expect(
        processPensjonsavtalerArray(66, 13, [
          {
            ...avtale,
            utbetalingsperioder: [
              {
                startAlder: { aar: 67, maaneder: 2 },
                sluttAlder: { aar: 70, maaneder: 0 },
                aarligUtbetaling: 100000,
                grad: 100,
              },
              {
                startAlder: { aar: 70, maaneder: 2 },
                sluttAlder: { aar: 77, maaneder: 0 },
                aarligUtbetaling: 100000,
                grad: 100,
              },
            ],
          },
          createMockedPensjonsavtale({ startAar: 70, sluttAar: 78 }),
        ])
      ).toEqual([
        0, 83333.33333333333, 100000, 100000, 183333.3333333333, 200000, 200000,
        200000, 200000, 200000, 200000, 100000, 0,
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
        200000, 200000, 200000, 100000, 100000,
      ])
    })
    it('returnerer riktig summer med graderte avtaler, eller graderte utbetalingsperioder', () => {
      const avtale = createMockedPensjonsavtale({
        startAar: 67,
        sluttAar: 77,
        grad: 50,
      })
      expect(processPensjonsavtalerArray(66, 13, [{ ...avtale }])).toEqual([
        0, 50000, 50000, 50000, 50000, 50000, 50000, 50000, 50000, 50000, 50000,
        0, 0,
      ])
      expect(
        processPensjonsavtalerArray(66, 14, [
          { ...avtale },
          createMockedPensjonsavtale({ startAar: 70, sluttAar: 78 }),
          createMockedPensjonsavtale({
            startAar: 75,
            grad: 75,
          }),
        ])
      ).toEqual([
        0, 50000, 50000, 50000, 150000, 150000, 150000, 150000, 150000, 225000,
        225000, 175000, 75000, 75000,
      ])
      expect(
        processPensjonsavtalerArray(66, 14, [
          {
            ...avtale,
            utbetalingsperioder: [
              {
                startAlder: { aar: 67, maaneder: 1 },
                sluttAlder: { aar: 70, maaneder: 0 },
                aarligUtbetaling: 100000,
                grad: 50,
              },
              {
                startAlder: { aar: 70, maaneder: 1 },
                sluttAlder: { aar: 77, maaneder: 0 },
                aarligUtbetaling: 100000,
                grad: 50,
              },
            ],
          },
          createMockedPensjonsavtale({ startAar: 70, sluttAar: 78 }),
          createMockedPensjonsavtale({
            startAar: 75,
            grad: 75,
          }),
        ])
      ).toEqual([
        0, 45833.333333333336, 50000, 50000, 145833.33333333334, 150000, 150000,
        150000, 150000, 225000, 225000, 175000, 75000, 75000,
      ])
    })
    describe('returnerer riktig summer basert på startMaaned og sluttMaaned', () => {
      it('med en avtale', () => {
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
          100000, 100000, 0, 0,
        ])
        expect(
          processPensjonsavtalerArray(66, 13, [
            createMockedPensjonsavtale({
              startAar: 67,
              sluttAar: 77,
              sluttMaaned: 2,
            }),
          ])
        ).toEqual([
          0, 100000, 100000, 100000, 100000, 100000, 100000, 100000, 100000,
          100000, 100000, 16666.666666666668, 0,
        ])
        expect(
          processPensjonsavtalerArray(66, 13, [
            createMockedPensjonsavtale({
              startAar: 67,
              startMaaned: 6,
              sluttAar: 77,
              sluttMaaned: 2,
            }),
          ])
        ).toEqual([
          0, 50000, 100000, 100000, 100000, 100000, 100000, 100000, 100000,
          100000, 100000, 16666.666666666668, 0,
        ])
      })
      it('med flere avtaler (livsvarige og graderte)', () => {
        expect(
          processPensjonsavtalerArray(66, 13, [
            createMockedPensjonsavtale({
              startAar: 67,
              startMaaned: 2,
              sluttAar: 77,
            }),
            createMockedPensjonsavtale({ startAar: 70, sluttAar: 78 }),
          ])
        ).toEqual([
          0, 83333.33333333333, 100000, 100000, 200000, 200000, 200000, 200000,
          200000, 200000, 200000, 100000, 0,
        ])
        expect(
          processPensjonsavtalerArray(66, 13, [
            createMockedPensjonsavtale({
              startAar: 67,
              startMaaned: 6,
              sluttAar: undefined,
            }),
            createMockedPensjonsavtale({
              startAar: 67,
              startMaaned: 2,
              sluttAar: 77,
              sluttMaaned: 2,
            }),
          ])
        ).toEqual([
          0, 133333.3333333333, 200000, 200000, 200000, 200000, 200000, 200000,
          200000, 200000, 200000, 116666.66666666667, 100000,
        ])
        expect(
          processPensjonsavtalerArray(66, 13, [
            createMockedPensjonsavtale({
              startAar: 67,
              sluttAar: undefined,
              grad: 50,
            }),
            createMockedPensjonsavtale({
              startAar: 67,
              startMaaned: 2,
              sluttAar: 77,
              sluttMaaned: 2,
            }),
            createMockedPensjonsavtale({
              startAar: 70,
              sluttAar: 78,
              sluttMaaned: 4,
            }),
            createMockedPensjonsavtale({
              startAar: 75,
              startMaaned: 6,
              grad: 75,
            }),
          ])
        ).toEqual([
          0, 133333.3333333333, 150000, 150000, 250000, 250000, 250000, 250000,
          250000, 287500, 325000, 241666.6666666667, 158333.33333333334,
        ])
      })
      it('når antall måneder bikker over neste år', () => {
        expect(
          processPensjonsavtalerArray(66, 13, [
            createMockedPensjonsavtale({
              startAar: 67,
              startMaaned: 10,
              sluttAar: 77,
            }),
          ])
        ).toEqual([
          0, 16666.666666666668, 100000, 100000, 100000, 100000, 100000, 100000,
          100000, 100000, 100000, 0, 0,
        ])
        expect(
          processPensjonsavtalerArray(66, 13, [
            createMockedPensjonsavtale({
              startAar: 67,
              sluttAar: 77,
              sluttMaaned: 10,
            }),
          ])
        ).toEqual([
          0, 100000, 100000, 100000, 100000, 100000, 100000, 100000, 100000,
          100000, 100000, 83333.33333333333, 0,
        ])
      })
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
                startAlder: { aar: 70, maaneder: 1 },
                sluttAlder: { aar: 72, maaneder: 1 },
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
    it('returnerer riktig streng for inntekt uten pensjon', () => {
      expect(getTooltipTitle(true, false)).toEqual('Inntekt når du er')
    })
    it('returnerer riktig streng for pensjon uten inntekt', () => {
      expect(getTooltipTitle(false, true)).toEqual('Pensjon når du er')
    })
    it('returnerer riktig streng for pensjon og inntekt', () => {
      expect(getTooltipTitle(true, true)).toEqual(
        'Inntekt og pensjon når du er'
      )
    })
    it('returnerer streng for pensjon som fallback', () => {
      expect(getTooltipTitle(false, false)).toEqual('Pensjon når du er')
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
