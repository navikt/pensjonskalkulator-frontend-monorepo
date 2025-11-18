import {
  AarligUtbetaling,
  AarligUtbetalingStartSlutt,
  SeriesConfig,
  fillYAxis,
  generateSeries,
  generateXAxis,
  mergeAarligUtbetalinger,
  parseStartSluttUtbetaling,
} from './data'

// TODO: AFT etterfulgt av alderspensjon, gradert uttak

// 0 - Januar
// 1 - Februar
// 2 - Mars
// 3 - April
// 4 - Mai
// 5 - Juni
// 6 - Juli
// 7 - August
// 8 - September
// 9 - Oktober
// 10 - November
// 11 - Desember

describe('Simulering data', () => {
  describe('parseStartSluttUtbetaling ', () => {
    it('parse startAlder and sluttAlder', () => {
      const testdata: AarligUtbetalingStartSlutt = {
        startAlder: {
          aar: 50,
          maaneder: 10,
        },
        sluttAlder: {
          aar: 60,
          maaneder: 1,
        },
        aarligUtbetaling: 120000,
      }

      const expected = [
        { alder: 50, beloep: 20000 },
        { alder: 51, beloep: 120000 },
        { alder: 52, beloep: 120000 },
        { alder: 53, beloep: 120000 },
        { alder: 54, beloep: 120000 },
        { alder: 55, beloep: 120000 },
        { alder: 56, beloep: 120000 },
        { alder: 57, beloep: 120000 },
        { alder: 58, beloep: 120000 },
        { alder: 59, beloep: 120000 },
        { alder: 60, beloep: 20000 },
      ]

      const actual = parseStartSluttUtbetaling(testdata)
      expect(actual).toStrictEqual(expected)
    })

    it('parse startAlder and sluttAlder', () => {
      const testdata: AarligUtbetalingStartSlutt = {
        startAlder: {
          aar: 50,
          maaneder: 6,
        },
        sluttAlder: {
          aar: 60,
          maaneder: 11,
        },
        aarligUtbetaling: 120000,
      }
      const expected = [
        { alder: 50, beloep: 60000 },
        { alder: 51, beloep: 120000 },
        { alder: 52, beloep: 120000 },
        { alder: 53, beloep: 120000 },
        { alder: 54, beloep: 120000 },
        { alder: 55, beloep: 120000 },
        { alder: 56, beloep: 120000 },
        { alder: 57, beloep: 120000 },
        { alder: 58, beloep: 120000 },
        { alder: 59, beloep: 120000 },
        { alder: 60, beloep: 120000 },
      ]

      const actual = parseStartSluttUtbetaling(testdata)
      expect(actual).toStrictEqual(expected)
    })

    it('uten sluttalder', () => {
      const testdataIngenSluttDato: AarligUtbetalingStartSlutt = {
        startAlder: {
          aar: 50,
          maaneder: 6,
        },
        aarligUtbetaling: 120000,
      }

      const actual = parseStartSluttUtbetaling(testdataIngenSluttDato)

      // Should extend to default maxAlder of 100
      expect(actual.length).toBe(51) // 50 to 100 inclusive
      expect(actual[0]).toStrictEqual({ alder: 50, beloep: 60000 }) // Partial first year
      expect(actual[1]).toStrictEqual({ alder: 51, beloep: 120000 }) // Full year
      expect(actual[actual.length - 1]).toStrictEqual({
        alder: 100,
        beloep: 120000,
      }) // Last year
    })
  })

  describe('generateXAxis', () => {
    it('skal generere x Akse', () => {
      const testdata: AarligUtbetaling[][] = [
        [
          {
            alder: 58,
            beloep: 10,
          },
          {
            alder: 59,
            beloep: 10,
          },
          {
            alder: 60,
            beloep: 10,
          },
        ],
        [
          {
            alder: 50,
            beloep: 10,
          },
          {
            alder: 51,
            beloep: 10,
          },
          {
            alder: 52,
            beloep: 10,
          },
        ],
        [
          {
            alder: 56,
            beloep: 10,
          },
          {
            alder: 57,
            beloep: 10,
          },
          {
            alder: 58,
            beloep: 10,
          },
        ],
      ]

      // Min = 50,
      // Max = 60

      const expected = {
        50: 0,
        51: 0,
        52: 0,
        53: 0,
        54: 0,
        55: 0,
        56: 0,
        57: 0,
        58: 0,
        59: 0,
        60: 0,
      }

      const actual = generateXAxis(testdata)
      expect(actual).toStrictEqual(expected)
    })

    it('skal generere x Akse med livsvarig uttak', () => {
      const testdata: AarligUtbetaling[][] = [
        [
          {
            alder: 58,
            beloep: 10,
          },
          {
            alder: 59,
            beloep: 10,
          },
          {
            alder: 60,
            beloep: 10,
          },
        ],
        [
          {
            alder: 50,
            beloep: 12,
          },
          {
            alder: 87,
            beloep: 10,
          },
        ],
        [
          {
            alder: 56,
            beloep: 10,
          },
          {
            alder: 57,
            beloep: 10,
          },
          {
            alder: 58,
            beloep: 10,
          },
        ],
      ]
      // Min = 50
      // Max = 87 (no longer Infinity, uses concrete max age)

      const expected = {
        50: 0,
        51: 0,
        52: 0,
        53: 0,
        54: 0,
        55: 0,
        56: 0,
        57: 0,
        58: 0,
        59: 0,
        60: 0,
        61: 0,
        62: 0,
        63: 0,
        64: 0,
        65: 0,
        66: 0,
        67: 0,
        68: 0,
        69: 0,
        70: 0,
        71: 0,
        72: 0,
        73: 0,
        74: 0,
        75: 0,
        76: 0,
        77: 0,
        78: 0,
        79: 0,
        80: 0,
        81: 0,
        82: 0,
        83: 0,
        84: 0,
        85: 0,
        86: 0,
        87: 0,
      }

      const actual = generateXAxis(testdata)
      expect(actual).toStrictEqual(expected)
    })

    it('håndterer tom data i noen utbetalinger', () => {
      const testdata: AarligUtbetaling[][] = [
        [
          {
            alder: 58,
            beloep: 10,
          },
          {
            alder: 59,
            beloep: 10,
          },
          {
            alder: 60,
            beloep: 10,
          },
        ],
        [
          {
            alder: 57,
            beloep: 10,
          },
          {
            alder: 58,
            beloep: 10,
          },
          {
            alder: 59,
            beloep: 10,
          },
        ],
        [],
      ]

      const expected = {
        57: 0,
        58: 0,
        59: 0,
        60: 0,
      }

      const actual = generateXAxis(testdata)
      expect(actual).toStrictEqual(expected)
    })
  })

  describe('generateSeries', () => {
    it('generates series', () => {
      const testdata: SeriesConfig[] = [
        {
          data: [
            {
              alder: 58,
              beloep: 10,
            },
            {
              alder: 59,
              beloep: 10,
            },
            {
              alder: 60,
              beloep: 10,
            },
          ],
          name: 'Series 1',
          type: 'column',
          color: 'red',
        },
        {
          data: [
            {
              alder: 57,
              beloep: 50,
            },
            {
              alder: 58,
              beloep: 50,
            },
            {
              alder: 59,
              beloep: 50,
            },
          ],
          name: 'Series 2',
          type: 'column',
          color: 'blue',
        },
      ]

      const actual = generateSeries(testdata)
      const xAxis = ['57', '58', '59', '60', '60+']
      expect(actual).toStrictEqual({
        xAxis,
        series: [
          {
            data: [0, 10, 10, 10, 10],
            name: 'Series 1',
            pointWidth: 25,
            stacking: 'normal',
            type: 'column',
            color: 'red',
          },
          {
            data: [50, 50, 50, 0, 0],
            name: 'Series 2',
            type: 'column',
            pointWidth: 25,
            stacking: 'normal',
            color: 'blue',
          },
        ],
      })
    })
  })

  describe('mergeAarligUtbetalinger', () => {
    it('should merge multiple årlige utbetalinger into one', () => {
      const testdata = [
        [
          { alder: 58, beloep: 12 },
          { alder: 59, beloep: 10 },
          { alder: 60, beloep: 92 },
        ],
        [
          { alder: 57, beloep: 7 },
          { alder: 58, beloep: 12 },
          { alder: 59, beloep: 50 },
        ],
        [
          { alder: 56, beloep: 94 },
          { alder: 57, beloep: 7 },
          { alder: 58, beloep: 12 },
        ],
      ]

      const expected = [
        { alder: 56, beloep: 94 },
        { alder: 57, beloep: 14 },
        { alder: 58, beloep: 36 },
        { alder: 59, beloep: 60 },
        { alder: 60, beloep: 92 },
      ]

      const actual = mergeAarligUtbetalinger(testdata)
      expect(actual).toEqual(expected)
    })
  })

  describe('fillYAxis', () => {
    it('should fill the yAxis with missing data points', () => {
      const xAxis = {
        56: 0,
        57: 0,
        58: 0,
        59: 0,
        60: 0,
      }
      const testdata = [
        { alder: 57, beloep: 7 },
        { alder: 59, beloep: 50 },
      ]

      const expected = [0, 7, 0, 50, 0]

      const actual = fillYAxis(xAxis, testdata)
      expect(actual).toStrictEqual(expected)
    })
  })

  it('should handle data without gaps correctly', () => {
    const xAxis = {
      56: 0,
      57: 0,
      58: 0,
      59: 0,
      60: 0,
    }
    const testdata = [
      { alder: 57, beloep: 10 },
      { alder: 58, beloep: 20 },
      { alder: 60, beloep: 30 },
    ]

    const expected = [0, 10, 20, 0, 30]

    const actual = fillYAxis(xAxis, testdata)
    expect(actual).toStrictEqual(expected)
  })
})
