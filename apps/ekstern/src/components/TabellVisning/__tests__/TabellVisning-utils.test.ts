import { SeriesColumnOptions } from 'highcharts'
import { describe, expect, it } from 'vitest'

import { formatSeriesToTableData } from '../utils'

describe('TabellVisning-utils', () => {
  describe('formatSeriesToTableData', () => {
    const alderArray = ['62', '63', '64', '65', '66', '67', '68', '68', '70+']
    const series: SeriesColumnOptions[] = [
      {
        type: 'column',
        name: 'Pensjonsgivende inntekt',
        data: [
          100000, 175000, 220000, 220000, 220000, 220000, 220000, 220000,
          220000,
        ],
      },
      {
        type: 'column',
        name: 'AFP (Avtalefestet pensjon)',
        data: [
          150000, 200000, 350000, 350000, 350000, 350000, 350000, 350000,
          350000,
        ],
      },
      {
        type: 'column',
        name: 'Pensjonsavtaler (arbeidsgivere m.m.)',
        data: [
          180000, 250000, 380000, 380000, 380000, 380000, 380000, 380000,
          380000,
        ],
      },
      {
        type: 'column',
        name: 'Alderspensjon (NAV)',
        data: [
          200000, 350000, 400000, 400000, 400000, 400000, 400000, 400000,
          400000,
        ],
      },
    ]
    it('returnerer tomt array når alder array er undefined eller tomt', () => {
      const result0 = formatSeriesToTableData([])
      expect(result0).toHaveLength(0)
      const result1 = formatSeriesToTableData([], [])
      expect(result1).toHaveLength(0)
      const result2 = formatSeriesToTableData([...series], [])
      expect(result2).toHaveLength(0)
    })

    it('returnerer et array med riktig struktur og headere når alder array ikke er tomt', () => {
      const result = formatSeriesToTableData([], [...alderArray])
      expect(result).toHaveLength(alderArray.length)
      expect(result[0].alder).toBe('62 år')
      expect(result[alderArray.length - 1].alder).toBe('70+ år (livsvarig)')
      expect(result).toMatchSnapshot()
    })

    it('returnerer et array med riktig struktur og detaljer når begge arrayeme haer data', () => {
      const result = formatSeriesToTableData([...series], [...alderArray])
      expect(result).toHaveLength(alderArray.length)
      expect(result[0].detaljer).toHaveLength(series.length)
      expect(result).toMatchSnapshot()
    })
  })
})
