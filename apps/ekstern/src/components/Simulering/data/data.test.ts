import {
  type AarligUtbetaling,
  type AarligUtbetalingStartSlutt,
  type SeriesConfig,
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

      const expected = [
        { alder: 50, beloep: 60000 },
        { alder: 51, beloep: 120000 },
        { alder: Infinity, beloep: 120000 },
      ]

      const actual = parseStartSluttUtbetaling(testdataIngenSluttDato)
      expect(actual).toStrictEqual(expected)
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
            alder: Infinity,
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
      // Max = 60
      // Infinity is included in xAxis skeleton when present in data

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
        Infinity: 0,
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
          color: 'blue',
        },
      ]

      const actual = generateSeries(testdata)
      const xAxis = ['57', '58', '59', '60']
      expect(actual).toStrictEqual({
        xAxis,
        series: [
          {
            data: [0, 10, 10, 10],
            name: 'Series 1',
            pointWidth: 25,
            stacking: 'normal',
            type: 'column',
            color: 'red',
          },
          {
            data: [50, 50, 50, 0],
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

  it('should fill yAxis with Infinity (livsvarig) data', () => {
    const xAxis = {
      56: 0,
      57: 0,
      58: 0,
      59: 0,
      60: 0,
    }
    const testdata = [
      { alder: 57, beloep: 7 },
      { alder: Infinity, beloep: 50 },
    ]

    const expected = [0, 7, 50, 50, 50]

    const actual = fillYAxis(xAxis, testdata)
    expect(actual).toStrictEqual(expected)
  })

  it('should fill yAxis with Infinity (livsvarig) data, but only after ages after highest age', () => {
    const xAxis = {
      56: 0,
      57: 0,
      58: 0,
      59: 0,
      60: 0,
      Infinity: 0,
    }
    const testdata = [
      { alder: 57, beloep: 10 },
      { alder: 58, beloep: 10 },
      { alder: Infinity, beloep: 50 },
    ]

    const expected = [0, 10, 10, 50, 50, 50]

    const actual = fillYAxis(xAxis, testdata)
    expect(actual).toStrictEqual(expected)
  })
})
