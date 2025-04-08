import { Chart } from 'highcharts'
import { IntlShape } from 'react-intl'
import { describe, expect, it, vi } from 'vitest'

import { highchartsScrollingSelector } from '../constants'
import {
  generateXAxis,
  getAntallMaanederMedPensjon,
  getChartDefaults,
  getHoverColor,
  getNormalColor,
  getTooltipTitle,
  handleChartScroll,
  onVisFaerreAarClick,
  onVisFlereAarClick,
  processAfpPensjonsberegningArray,
  processInntektArray,
  processPensjonsavtalerArray,
  processPensjonsberegningArray,
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
      it('returnerer et tomt array uten å feile', () => {
        expect(
          processInntektArray({
            xAxisStartAar: 67,
            inntektFoerUttakBeloep: 0,
            gradertUttak: undefined,
            heltUttak: undefined,
            xAxisLength: 0,
          })
        ).toEqual([])
      })

      it('returnerer et riktig mappet array med riktig beløp før uttak', () => {
        expect(
          processInntektArray({
            xAxisStartAar: 67,
            inntektFoerUttakBeloep: 500000,
            gradertUttak: undefined,
            heltUttak: undefined,
            xAxisLength: 1,
          })
        ).toEqual([500000])
        expect(
          processInntektArray({
            xAxisStartAar: 67,
            inntektFoerUttakBeloep: 500000,
            gradertUttak: undefined,
            heltUttak: undefined,
            xAxisLength: 4,
          })
        ).toEqual([500000, 500000, 500000, 500000])
      })
    })
    describe('Når helt uttak er oppgitt', () => {
      it('uten inntekt vsa hel pensjon, returnerer et riktig mappet array med riktig beløp før uttak', () => {
        expect(
          processInntektArray({
            xAxisStartAar: 64,
            inntektFoerUttakBeloep: 500000,
            gradertUttak: undefined,
            heltUttak: {
              fra: { aar: 65, maaneder: 0 },
              til: undefined,
              beloep: undefined,
            },
            xAxisLength: 5,
          })
        ).toEqual([500000, 0, 0, 0, 0])

        expect(
          processInntektArray({
            xAxisStartAar: 64,
            inntektFoerUttakBeloep: 500000,
            gradertUttak: undefined,
            heltUttak: {
              fra: { aar: 65, maaneder: 4 },
              til: undefined,
              beloep: undefined,
            },
            xAxisLength: 5,
          })
        ).toEqual([500000, 166666.66666666666, 0, 0, 0])
      })
      it('med inntekt vsa hel pensjon, returnerer et riktig mappet array med riktig beløp før uttak, og verdi for inntekt vsa pensjon videre', () => {
        expect(
          processInntektArray({
            xAxisStartAar: 64,
            inntektFoerUttakBeloep: 500000,
            gradertUttak: undefined,
            heltUttak: {
              fra: { aar: 65, maaneder: 0 },
              til: { aar: 66, maaneder: 11 },
              beloep: 300000,
            },
            xAxisLength: 5,
          })
        ).toEqual([500000, 300000, 300000, 0, 0])

        expect(
          processInntektArray({
            xAxisStartAar: 64,
            inntektFoerUttakBeloep: 500000,
            gradertUttak: undefined,
            heltUttak: {
              fra: { aar: 65, maaneder: 4 },
              til: { aar: 67, maaneder: 2 },
              beloep: 300000,
            },
            xAxisLength: 5,
          })
        ).toEqual([500000, 366666.6666666666, 300000, 75000, 0])

        expect(
          processInntektArray({
            xAxisStartAar: 66,
            inntektFoerUttakBeloep: 500000,
            gradertUttak: undefined,
            heltUttak: {
              fra: { aar: 67, maaneder: 0 },
              til: { aar: 67, maaneder: 5 },
              beloep: 300000,
            },
            xAxisLength: 5,
          })
        ).toEqual([500000, 150000, 0, 0, 0])

        expect(
          processInntektArray({
            xAxisStartAar: 66,
            inntektFoerUttakBeloep: 500000,
            gradertUttak: undefined,
            heltUttak: {
              fra: { aar: 67, maaneder: 6 },
              til: { aar: 67, maaneder: 11 },
              beloep: 300000,
            },
            xAxisLength: 5,
          })
        ).toEqual([500000, 400000, 0, 0, 0])

        expect(
          processInntektArray({
            xAxisStartAar: 66,
            inntektFoerUttakBeloep: 500000,
            gradertUttak: undefined,
            heltUttak: {
              fra: { aar: 67, maaneder: 6 },
              til: { aar: 67, maaneder: 9 },
              beloep: 300000,
            },
            xAxisLength: 5,
          })
        ).toEqual([500000, 350000, 0, 0, 0])
      })
    })
    describe('Når gradert uttak er oppgitt', () => {
      it('uten inntekt vsa gradert pensjon, returnerer et riktig mappet array med riktig beløp før uttak', () => {
        expect(
          processInntektArray({
            xAxisStartAar: 64,
            inntektFoerUttakBeloep: 500000,
            gradertUttak: {
              fra: { aar: 65, maaneder: 0 },
              til: { aar: 66, maaneder: 11 },
              beloep: undefined,
            },
            heltUttak: undefined,
            xAxisLength: 5,
          })
        ).toEqual([500000, 0, 0, 0, 0])

        expect(
          processInntektArray({
            xAxisStartAar: 64,
            inntektFoerUttakBeloep: 500000,
            gradertUttak: {
              fra: { aar: 65, maaneder: 4 },
              til: { aar: 67, maaneder: 2 },
              beloep: undefined,
            },
            heltUttak: undefined,
            xAxisLength: 5,
          })
        ).toEqual([500000, 166666.66666666666, 0, 0, 0])
      })

      it('med inntekt vsa gradert pensjon, returnerer et riktig mappet array med riktig beløp før uttak, og verdi for inntekt vsa pensjon videre', () => {
        expect(
          processInntektArray({
            xAxisStartAar: 64,
            inntektFoerUttakBeloep: 500000,
            gradertUttak: {
              fra: { aar: 65, maaneder: 0 },
              til: { aar: 66, maaneder: 11 },
              beloep: 300000,
            },
            heltUttak: undefined,
            xAxisLength: 5,
          })
        ).toEqual([500000, 300000, 300000, 0, 0])

        expect(
          processInntektArray({
            xAxisStartAar: 64,
            inntektFoerUttakBeloep: 500000,
            gradertUttak: {
              fra: { aar: 65, maaneder: 4 },
              til: { aar: 67, maaneder: 2 },
              beloep: 300000,
            },
            heltUttak: undefined,
            xAxisLength: 5,
          })
        ).toEqual([500000, 366666.6666666666, 300000, 75000, 0])

        expect(
          processInntektArray({
            xAxisStartAar: 66,
            inntektFoerUttakBeloep: 500000,
            gradertUttak: {
              fra: { aar: 67, maaneder: 0 },
              til: { aar: 67, maaneder: 5 },
              beloep: 300000,
            },
            heltUttak: undefined,
            xAxisLength: 5,
          })
        ).toEqual([500000, 150000, 0, 0, 0])

        expect(
          processInntektArray({
            xAxisStartAar: 66,
            inntektFoerUttakBeloep: 500000,
            gradertUttak: {
              fra: { aar: 67, maaneder: 6 },
              til: { aar: 67, maaneder: 11 },
              beloep: 300000,
            },
            heltUttak: undefined,
            xAxisLength: 5,
          })
        ).toEqual([500000, 400000, 0, 0, 0])

        expect(
          processInntektArray({
            xAxisStartAar: 66,
            inntektFoerUttakBeloep: 500000,
            gradertUttak: {
              fra: { aar: 67, maaneder: 6 },
              til: { aar: 67, maaneder: 9 },
              beloep: 300000,
            },
            heltUttak: undefined,
            xAxisLength: 5,
          })
        ).toEqual([500000, 350000, 0, 0, 0])
      })
    })

    describe('Når helt uttak og gradert uttak er oppgitt', () => {
      it('returnerer et riktig mappet array med riktig beløp før uttak, og verdi for inntekt vsa pensjon videre', () => {
        expect(
          processInntektArray({
            xAxisStartAar: 64,
            inntektFoerUttakBeloep: 500000,
            gradertUttak: {
              fra: { aar: 65, maaneder: 0 },
              til: { aar: 66, maaneder: 11 },
              beloep: 300000,
            },
            heltUttak: {
              fra: { aar: 67, maaneder: 0 },
              til: { aar: 70, maaneder: 11 },
              beloep: 100000,
            },
            xAxisLength: 8,
          })
        ).toEqual([500000, 300000, 300000, 100000, 100000, 100000, 100000, 0])

        expect(
          processInntektArray({
            xAxisStartAar: 64,
            inntektFoerUttakBeloep: 500000,
            gradertUttak: {
              fra: { aar: 65, maaneder: 4 },
              til: { aar: 67, maaneder: 2 },
              beloep: 300000,
            },
            heltUttak: {
              fra: { aar: 67, maaneder: 3 },
              til: { aar: 71, maaneder: 7 },
              beloep: 100000,
            },
            xAxisLength: 10,
          })
        ).toEqual([
          500000, 366666.6666666666, 300000, 150000, 100000, 100000, 100000,
          66666.66666666667, 0, 0,
        ])

        // half of inntektFoerUttak: 250000 =  250000 (half of inntektFoerUttak) + 125000 (5md av inntekt vsa gradert) + 8333,33 (1md inntekt vsa helt)
        expect(
          processInntektArray({
            xAxisStartAar: 64,
            inntektFoerUttakBeloep: 500000,
            gradertUttak: {
              fra: { aar: 65, maaneder: 6 },
              til: { aar: 65, maaneder: 10 },
              beloep: 300000,
            },
            heltUttak: {
              fra: { aar: 65, maaneder: 11 },
              til: { aar: 70, maaneder: 11 },
              beloep: 100000,
            },
            xAxisLength: 8,
          })
        ).toEqual([
          500000, 383333.3333333333, 100000, 100000, 100000, 100000, 100000, 0,
        ])
      })
    })
  })

  describe('processPensjonsberegningArray', () => {
    it('returnerer et array med en 0 verdi uten å feile hvis input er et tomt array', () => {
      expect(processPensjonsberegningArray([], false, 0)).toEqual([0, 0])
      expect(processPensjonsberegningArray([], false, 1)).toEqual([0, 0])
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
          false,
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
          false,
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
          false,
          10
        )
      ).toEqual([
        0, 20000, 80000, 80000, 80000, 80000, 80000, 80000, 80000, 80000,
      ])
    })

    it('Når brukeren har vedtak om alderspensjon, returnerer riktig mappet array med beløp først, og livsvarig beløp duplisert sist, avhengig av x-axis lengden', () => {
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
          true,
          2
        )
      ).toEqual([20000, 80000, 80000, 80000])
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
          true,
          5
        )
      ).toEqual([20000, 80000, 80000, 80000, 80000])
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
          true,
          10
        )
      ).toEqual([
        20000, 80000, 80000, 80000, 80000, 80000, 80000, 80000, 80000, 80000,
      ])
    })
  })

  describe('processAfpPensjonsberegningArray', () => {
    it('returnerer et tomt array uten å feile hvis input er et tomt array', () => {
      expect(processAfpPensjonsberegningArray(67, 5, [], false)).toEqual([])
    })

    it('returnerer riktig mappet array med 0 verdi først, beløp, og livsvarig beløp duplisert sist, avhengig av x-axis lengden', () => {
      expect(
        processAfpPensjonsberegningArray(
          73,
          6,
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
          false
        )
      ).toEqual([0, 0, 20000, 80000, 80000, 80000])
      expect(
        processAfpPensjonsberegningArray(
          74,
          5,
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
          false
        )
      ).toEqual([0, 20000, 80000, 80000, 80000])
    })

    it('Når brukeren har vedtak om alderspensjon, returnerer riktig mappet array med beløp først, og livsvarig beløp duplisert sist, avhengig av x-axis lengden', () => {
      expect(
        processAfpPensjonsberegningArray(
          74,
          5,
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
          true
        )
      ).toEqual([0, 20000, 80000, 80000, 80000])
      expect(
        processAfpPensjonsberegningArray(
          75,
          4,
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
          true
        )
      ).toEqual([20000, 80000, 80000, 80000])
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
      expect(processPensjonsavtalerArray(66, 13, [], [])).toEqual([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ])
      expect(processPensjonsavtalerArray(66, 1, [], [])).toEqual([0])
      expect(processPensjonsavtalerArray(66, 0, [], [])).toEqual([])
    })

    it('returnerer riktig summer med en eller flere avtaler, eller med flere utbetalingsperioder', () => {
      const avtale = createMockedPensjonsavtale({
        startAar: 67,
        sluttAar: 77,
        grad: 50,
      })
      expect(processPensjonsavtalerArray(66, 13, [{ ...avtale }], [])).toEqual([
        0, 100000, 100000, 100000, 100000, 100000, 100000, 100000, 100000,
        100000, 100000, 100000, 0,
      ])
      expect(
        processPensjonsavtalerArray(
          66,
          13,
          [{ ...avtale }],
          [
            {
              startAlder: { aar: 70, maaneder: 0 },
              sluttAlder: { aar: 71, maaneder: 11 },
              aarligUtbetaling: 50000,
            },
          ]
        )
      ).toEqual([
        0, 100000, 100000, 100000, 150000, 150000, 100000, 100000, 100000,
        100000, 100000, 100000, 0,
      ])

      expect(
        processPensjonsavtalerArray(
          66,
          13,
          [
            createMockedPensjonsavtale({
              startAar: 67,
              startMaaned: 6,
              sluttAar: 77,
            }),
          ],
          []
        )
      ).toEqual([
        0, 50000, 100000, 100000, 100000, 100000, 100000, 100000, 100000,
        100000, 100000, 100000, 0,
      ])
      expect(
        processPensjonsavtalerArray(
          66,
          13,
          [
            createMockedPensjonsavtale({
              startAar: 67,
              startMaaned: 6,
              sluttAar: 77,
            }),
          ],
          [
            {
              startAlder: { aar: 67, maaneder: 6 },
              sluttAlder: { aar: 69, maaneder: 11 },
              aarligUtbetaling: 100000,
            },
          ]
        )
      ).toEqual([
        0, 100000, 200000, 200000, 100000, 100000, 100000, 100000, 100000,
        100000, 100000, 100000, 0,
      ])
      expect(
        processPensjonsavtalerArray(
          66,
          13,
          [
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
          ],
          []
        )
      ).toEqual([
        0, 100000, 100000, 100000, 200000, 200000, 200000, 200000, 200000,
        200000, 200000, 200000, 100000,
      ])
      expect(
        processPensjonsavtalerArray(
          66,
          13,
          [
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
          ],
          [
            {
              startAlder: { aar: 67, maaneder: 6 },
              sluttAlder: { aar: 69, maaneder: 11 },
              aarligUtbetaling: 100000,
            },
            {
              startAlder: { aar: 75, maaneder: 0 },
              sluttAlder: { aar: 76, maaneder: 6 },
              aarligUtbetaling: 100000,
            },
          ]
        )
      ).toEqual([
        0, 150000, 200000, 200000, 200000, 200000, 200000, 200000, 200000,
        300000, 258333.33333333334, 200000, 100000,
      ])
      expect(
        processPensjonsavtalerArray(
          66,
          13,
          [
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
          ],
          []
        )
      ).toEqual([
        0, 100000, 100000, 100000, 200000, 200000, 200000, 200000, 200000,
        200000, 200000, 200000, 100000,
      ])
    })

    it('returnerer riktig summer med livsvarig avtale (avtale uten sluttAar)', () => {
      expect(
        processPensjonsavtalerArray(
          66,
          13,
          [createMockedPensjonsavtale({ startAar: 67, sluttAar: undefined })],
          []
        )
      ).toEqual([
        0, 100000, 100000, 100000, 100000, 100000, 100000, 100000, 100000,
        100000, 100000, 100000, 100000,
      ])
      expect(
        processPensjonsavtalerArray(
          66,
          13,
          [createMockedPensjonsavtale({ startAar: 67, sluttAar: undefined })],
          [
            {
              startAlder: { aar: 67, maaneder: 6 },
              sluttAlder: { aar: 69, maaneder: 11 },
              aarligUtbetaling: 100000,
            },
            {
              startAlder: { aar: 75, maaneder: 0 },
              sluttAlder: undefined,
              aarligUtbetaling: 100000,
            },
          ]
        )
      ).toEqual([
        0, 150000, 200000, 200000, 100000, 100000, 100000, 100000, 100000,
        200000, 200000, 200000, 200000,
      ])
      expect(
        processPensjonsavtalerArray(
          66,
          14,
          [
            createMockedPensjonsavtale({ startAar: 67, sluttAar: undefined }),
            createMockedPensjonsavtale({ startAar: 70, sluttAar: 78 }),
          ],
          []
        )
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
        false,
        [],
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

    it('returnerer riktig array når brukeren har vedtak om alderspensjon (array starter et år senere)', () => {
      const alderArray = generateXAxis(
        65,
        true,
        [],
        [],
        setIsPensjonsavtaleFlagVisibleMock
      )
      expect(alderArray).toEqual([
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
        false,
        [
          createMockedPensjonsavtale({
            startAar: 67,
            sluttAar: 70,
          }),
        ],
        [],
        setIsPensjonsavtaleFlagVisibleMock
      )
      expect(alderArray).toHaveLength(18)
      expect(alderArray).toEqual(maxArray)

      const alderArrayUnlimited = generateXAxis(
        62,
        false,
        [
          createMockedPensjonsavtale({
            startAar: 67,
          }),
        ],
        [],
        setIsPensjonsavtaleFlagVisibleMock
      )
      expect(alderArrayUnlimited).toHaveLength(18)
      expect(alderArrayUnlimited).toEqual(maxArray)

      const alderArrayMixed = generateXAxis(
        62,
        false,
        [
          createMockedPensjonsavtale({
            startAar: 67,
            sluttAar: 70,
          }),
        ],
        [
          {
            startAlder: { aar: 70, maaneder: 0 },
            aarligUtbetaling: 100000,
          },
        ],
        setIsPensjonsavtaleFlagVisibleMock
      )
      expect(alderArrayMixed).toHaveLength(18)
      expect(alderArrayMixed).toEqual(maxArray)
    })

    it('returnerer riktig array når pensjonsavtaler har ulike startAar, eller utbetalingsperioder med ulike startAar', () => {
      const avtale1 = createMockedPensjonsavtale({
        startAar: 68,
        sluttAar: 70,
      })
      const alderArray1 = generateXAxis(
        67,
        false,
        [
          { ...avtale1 },
          createMockedPensjonsavtale({
            startAar: 70,
            sluttAar: 72,
          }),
        ],
        [],
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
        false,
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
        [],
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

      const alderArray3 = generateXAxis(
        67,
        false,
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
        [
          {
            startAlder: { aar: 70, maaneder: 0 },
            sluttAlder: { aar: 72, maaneder: 0 },
            aarligUtbetaling: 100000,
          },
        ],
        setIsPensjonsavtaleFlagVisibleMock
      )
      expect(alderArray3).toHaveLength(13)
      expect(alderArray3).toEqual([
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
        false,
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
        [],
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

      const alderArray2 = generateXAxis(
        65,
        false,
        [
          createMockedPensjonsavtale({
            startAar: 67,
            sluttAar: 70,
          }),
        ],
        [
          {
            startAlder: { aar: 68, maaneder: 0 },
            sluttAlder: { aar: 72, maaneder: 0 },
            aarligUtbetaling: 100000,
          },
        ],
        setIsPensjonsavtaleFlagVisibleMock
      )
      expect(alderArray2).toHaveLength(15)
      expect(alderArray2).toEqual([
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
        false,
        [createMockedPensjonsavtale({ startAar: 55, sluttAar: 80 })],
        [],
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

    it('returnerer riktig array når sluttAlder er utenfor standardområdet, og kaller setIsPensjonsavtaleFlagVisible når en utbetalingsperiode begynner før startAar', () => {
      const alderArray = generateXAxis(
        62,
        false,
        [createMockedPensjonsavtale({ startAar: 67, sluttAar: 70 })],
        [
          {
            startAlder: { aar: 55, maaneder: 0 },
            sluttAlder: { aar: 80, maaneder: 0 },
            aarligUtbetaling: 100000,
          },
        ],
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
      ['var(--a-data-surface-5)', 'var(--a-data-surface-5-subtle)'],
      ['var(--a-purple-400)', 'var(--a-purple-200)'],
      ['var(--a-gray-500)', 'var(--a-gray-300)'],
      ['#FF0000', ''],
    ])('returnerer riktig hover farge for: %s', async (a, expected) => {
      const color = getHoverColor(a)
      expect(color).toEqual(expected)
    })

    test.each([
      ['var(--a-deepblue-200)', 'var(--a-deepblue-500)'],
      ['var(--a-data-surface-5-subtle)', 'var(--a-data-surface-5)'],
      ['var(--a-purple-200)', 'var(--a-purple-400)'],
      ['var(--a-gray-300)', 'var(--a-gray-500)'],
      ['var(--a-deepblue-500)', 'var(--a-deepblue-500)'],
      ['var(--a-data-surface-5)', 'var(--a-data-surface-5)'],
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
