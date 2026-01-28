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

describe('AFP etterfulgt av alderspensjon, gradert uttak', () => {
  it('skal håndtere AFP som slutter når alderspensjon starter', () => {
    // AFP fra 62 år 0 mnd til 67 år 0 mnd
    const afpUtbetaling: AarligUtbetalingStartSlutt = {
      startAlder: { aar: 62, maaneder: 0 },
      sluttAlder: { aar: 67, maaneder: 0 },
      aarligUtbetaling: 60000,
    }

    const afpParsed = parseStartSluttUtbetaling(afpUtbetaling)

    expect(afpParsed).toStrictEqual([
      { alder: 62, beloep: 60000 },
      { alder: 63, beloep: 60000 },
      { alder: 64, beloep: 60000 },
      { alder: 65, beloep: 60000 },
      { alder: 66, beloep: 60000 },
      { alder: 67, beloep: 5000 }, // 1 måned (januar) = 60000/12
    ])
  })

  it('skal håndtere alderspensjon med livsvarig uttak som starter etter AFP', () => {
    // Alderspensjon livsvarig fra 67 år 0 mnd
    const alderspensjonUtbetaling: AarligUtbetalingStartSlutt = {
      startAlder: { aar: 67, maaneder: 0 },
      aarligUtbetaling: 240000,
    }

    const alderspensjonParsed = parseStartSluttUtbetaling(
      alderspensjonUtbetaling
    )

    // Når startAlder er 0 måneder (januar) er forsteAarAndel = 1, så det legges ikke til neste år
    expect(alderspensjonParsed).toStrictEqual([
      { alder: 67, beloep: 240000 },
      { alder: Infinity, beloep: 240000 },
    ])
  })

  it('skal generere xAxis for AFP og alderspensjon kombinert', () => {
    const afpData: AarligUtbetaling[] = [
      { alder: 62, beloep: 60000 },
      { alder: 63, beloep: 60000 },
      { alder: 64, beloep: 60000 },
      { alder: 65, beloep: 60000 },
      { alder: 66, beloep: 60000 },
      { alder: 67, beloep: 5000 },
    ]

    const alderspensjonData: AarligUtbetaling[] = [
      { alder: 67, beloep: 240000 },
      { alder: 68, beloep: 240000 },
      { alder: Infinity, beloep: 240000 },
    ]

    const xAxis = generateXAxis([afpData, alderspensjonData])

    expect(xAxis).toStrictEqual({
      62: 0,
      63: 0,
      64: 0,
      65: 0,
      66: 0,
      67: 0,
      68: 0,
      Infinity: 0,
    })
  })

  it('skal merge AFP og alderspensjon utbetalinger', () => {
    const afpData: AarligUtbetaling[] = [
      { alder: 62, beloep: 60000 },
      { alder: 63, beloep: 60000 },
      { alder: 64, beloep: 60000 },
      { alder: 65, beloep: 60000 },
      { alder: 66, beloep: 60000 },
      { alder: 67, beloep: 5000 },
    ]

    const alderspensjonData: AarligUtbetaling[] = [
      { alder: 67, beloep: 240000 },
      { alder: Infinity, beloep: 240000 },
    ]

    const merged = mergeAarligUtbetalinger([afpData, alderspensjonData])

    // mergeAarligUtbetalinger summerer beløp for samme alder
    // Infinity-verdien beholdes og representerer livsvarig utbetaling
    expect(merged).toStrictEqual([
      { alder: 62, beloep: 60000 },
      { alder: 63, beloep: 60000 },
      { alder: 64, beloep: 60000 },
      { alder: 65, beloep: 60000 },
      { alder: 66, beloep: 60000 },
      { alder: 67, beloep: 245000 }, // AFP 5000 + alderspensjon 240000
      { alder: Infinity, beloep: 240000 },
    ])
  })

  it('skal generere series for AFP og alderspensjon med gradert uttak', () => {
    // Gradert uttak: 50% alderspensjon fra 62, full fra 67
    const afpData: AarligUtbetaling[] = [
      { alder: 62, beloep: 30000 },
      { alder: 63, beloep: 30000 },
      { alder: 64, beloep: 30000 },
      { alder: 65, beloep: 30000 },
      { alder: 66, beloep: 30000 },
    ]

    const alderspensjon50Data: AarligUtbetaling[] = [
      { alder: 62, beloep: 120000 },
      { alder: 63, beloep: 120000 },
      { alder: 64, beloep: 120000 },
      { alder: 65, beloep: 120000 },
      { alder: 66, beloep: 120000 },
    ]

    const alderspensjon100Data: AarligUtbetaling[] = [
      { alder: 67, beloep: 240000 },
      { alder: Infinity, beloep: 240000 },
    ]

    const seriesConfig: SeriesConfig[] = [
      { data: afpData, name: 'AFP', color: 'green' },
      { data: alderspensjon50Data, name: 'Alderspensjon 50%', color: 'blue' },
      {
        data: alderspensjon100Data,
        name: 'Alderspensjon 100%',
        color: 'darkblue',
      },
    ]

    const result = generateSeries(seriesConfig)

    expect(result.xAxis).toStrictEqual([
      '62',
      '63',
      '64',
      '65',
      '66',
      '67',
      '67+',
    ])
    expect(result.series).toHaveLength(3)

    // AFP: bare fra 62-66
    expect(result.series[0]).toMatchObject({
      name: 'AFP',
      data: [30000, 30000, 30000, 30000, 30000, 0, 0],
    })

    // Alderspensjon 50%: bare fra 62-66
    expect(result.series[1]).toMatchObject({
      name: 'Alderspensjon 50%',
      data: [120000, 120000, 120000, 120000, 120000, 0, 0],
    })

    // Alderspensjon 100%: fra 67 og livsvarig
    expect(result.series[2]).toMatchObject({
      name: 'Alderspensjon 100%',
      data: [0, 0, 0, 0, 0, 240000, 240000],
    })
  })
})

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
    it('parser startAlder og sluttAlder', () => {
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

    it('parser startAlder og sluttAlder med andre verdier', () => {
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
    it('genererer serier', () => {
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
            showInLegend: true,
          },
          {
            data: [50, 50, 50, 0],
            name: 'Series 2',
            type: 'column',
            pointWidth: 25,
            stacking: 'normal',
            color: 'blue',
            showInLegend: true,
          },
        ],
      })
    })
  })

  describe('mergeAarligUtbetalinger', () => {
    it('skal slå sammen flere årlige utbetalinger til én', () => {
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
    it('skal fylle yAxis med manglende datapunkter', () => {
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

  it('skal fylle yAxis med Infinity (livsvarig) data', () => {
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

  it('skal fylle yAxis med Infinity (livsvarig) data, men kun for aldre etter høyeste alder', () => {
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
