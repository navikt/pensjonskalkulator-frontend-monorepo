import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAppSelector } from '@/state/hooks'
import {
  selectCurrentSimulation,
  selectFoedselsdato,
} from '@/state/userInput/selectors'
import { renderHook } from '@/test-utils'
import { calculateUttaksalderAsDate } from '@/utils/alder'

import { usePensjonBeregninger } from '../hooks'

vi.mock('@/state/hooks', () => ({
  useAppSelector: vi.fn(),
}))

vi.mock('@/utils/alder', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/utils/alder')>()
  return {
    ...actual,
    calculateUttaksalderAsDate: vi.fn(),
  }
})

vi.mock('@/context/LanguageProvider/utils', () => ({
  getSelectedLanguage: vi.fn(),
}))

vi.mock('../../Pensjonsavtaler/utils', () => ({
  hentSumPensjonsavtalerVedUttak: vi.fn(),
  hentSumOffentligTjenestepensjonVedUttak: vi.fn(),
}))

describe('usePensjonBeregninger', () => {
  const mockUttaksalder: Alder = { aar: 67, maaneder: 0 }
  const mockGradertUttaksperiode = {
    uttaksalder: { aar: 62, maaneder: 6 },
    grad: 40,
  }
  const mockFoedselsdato = '1980-01-01'

  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(useAppSelector).mockImplementation((selector) => {
      if (selector === selectCurrentSimulation) {
        return {
          uttaksalder: mockUttaksalder,
          gradertUttaksperiode: mockGradertUttaksperiode,
          aarligInntektVsaHelPensjon: undefined,
        }
      }
      if (selector === selectFoedselsdato) {
        return mockFoedselsdato
      }
      return undefined
    })
  })

  it('returnerer korrekt struktur for pensjonsdata', () => {
    const pensjonsavtaler: Pensjonsavtale[] = [
      {
        key: 1,
        produktbetegnelse: 'Test Pensjon',
        kategori: 'PRIVAT_TJENESTEPENSJON',
        startAar: 62,
        utbetalingsperioder: [
          {
            startAlder: { aar: 62, maaneder: 0 } as Alder,
            aarligUtbetaling: 60000,
            grad: 100,
          },
        ],
      },
    ]

    const props = {
      alderspensjonMaanedligVedEndring: {
        heltUttakMaanedligBeloep: 20000,
        gradertUttakMaanedligBeloep: 8000,
      },
      afpPrivatListe: [
        {
          alder: 62,
          beloep: 240000,
          maanedligBeloep: 20000,
        },
      ],
      afpOffentligListe: undefined,
      pensjonsavtaler,
    }

    const { result } = renderHook(() => usePensjonBeregninger(props))

    expect(result.current).toHaveProperty('pensjonsdata')
    expect(result.current).toHaveProperty('summerYtelser')
    expect(result.current).toHaveProperty('hentUttaksmaanedOgAar')
    expect(result.current).toHaveProperty('harGradering')
    expect(result.current).toHaveProperty('uttaksalder')

    expect(result.current.pensjonsdata).toHaveLength(2)
    expect(result.current.harGradering).toBe(true)
  })

  it('beregner summen av ytelser korrekt', () => {
    const props = {
      alderspensjonMaanedligVedEndring: {
        heltUttakMaanedligBeloep: 20000,
        gradertUttakMaanedligBeloep: 8000,
      },
      afpPrivatListe: [
        {
          alder: 62,
          beloep: 240000,
          maanedligBeloep: 20000,
        },
      ],
    }

    const { result } = renderHook(() => usePensjonBeregninger(props), {
      initialProps: {},
    })

    const testData = {
      alder: { aar: 67, maaneder: 0 },
      grad: 100,
      afp: 20000,
      pensjonsavtale: 5000,
      alderspensjon: 20000,
    }

    expect(result.current.summerYtelser(testData)).toBe(45000)
  })

  it('formaterer måned og år korrekt', () => {
    const props = {}

    vi.mocked(calculateUttaksalderAsDate).mockReturnValue(
      new Date('2047-01-01')
    )
    vi.spyOn(Date.prototype, 'toLocaleDateString').mockReturnValue('januar')

    const { result } = renderHook(() => usePensjonBeregninger(props))

    const testAlder = { aar: 67, maaneder: 0 }
    const formattedDate = result.current.hentUttaksmaanedOgAar(testAlder)

    expect(formattedDate).toEqual('januar 2047')
  })

  it('håndterer udefinerte pensjonsavtaledata på en god måte', () => {
    const props = {
      alderspensjonMaanedligVedEndring: {
        heltUttakMaanedligBeloep: 20000,
        gradertUttakMaanedligBeloep: 8000,
      },
    }

    const { result } = renderHook(() => usePensjonBeregninger(props))

    expect(result.current.pensjonsdata).toBeDefined()

    const testData = {
      alder: { aar: 67, maaneder: 0 },
      grad: 100,
      afp: 0,
      pensjonsavtale: 0,
      alderspensjon: 20000,
    }

    expect(result.current.summerYtelser(testData)).toBe(20000)
  })

  it('bestemmer korrekt AFP-beløp ved spesifikke aldre', () => {
    const afpPrivatListe = [
      {
        alder: 62,
        beloep: 120000,
        maanedligBeloep: 10000,
      },
      {
        alder: 65,
        beloep: 150000,
        maanedligBeloep: 12500,
      },
      {
        alder: 67,
        beloep: 180000,
        maanedligBeloep: 15000,
      },
    ]

    const props = {
      afpPrivatListe,
    }

    const { result } = renderHook(() => usePensjonBeregninger(props))

    const data = result.current.pensjonsdata
    expect(data).toMatchObject([
      {
        afp: 10000,
        alder: {
          aar: 62,
          maaneder: 6,
        },
        alderspensjon: undefined,
        grad: 40,
        pensjonsavtale: 0,
      },
      {
        afp: 15000,
        alder: {
          aar: 67,
          maaneder: 0,
        },
        alderspensjon: undefined,
        grad: 100,
        pensjonsavtale: 0,
      },
    ])
  })

  describe('afpVedUttak med offentligAfpFraTpOrdning (SPK besteberegning)', () => {
    it('bruker offentligAfpFraTpOrdning når foersteUttaksalder >= 65', () => {
      vi.mocked(useAppSelector).mockImplementation((selector) => {
        if (selector === selectCurrentSimulation) {
          return {
            uttaksalder: { aar: 67, maaneder: 0 },
            gradertUttaksperiode: {
              uttaksalder: { aar: 65, maaneder: 0 },
              grad: 40,
            },
          }
        }
        if (selector === selectFoedselsdato) {
          return mockFoedselsdato
        }
        return undefined
      })

      const offentligAfpFraTpOrdning: UtbetalingsperiodeFoer1963[] = [
        {
          startAlder: { aar: 65, maaneder: 0 },
          sluttAlder: { aar: 67, maaneder: 0 },
          aarligUtbetaling: 120000,
          grad: 100,
          ytelsekode: 'AFP',
        },
      ]

      const props = {
        alderspensjonMaanedligVedEndring: {
          heltUttakMaanedligBeloep: 20000,
          gradertUttakMaanedligBeloep: 8000,
        },
        offentligAfpFraTpOrdning,
      }

      const { result } = renderHook(() => usePensjonBeregninger(props))

      // Gradert uttak ved 65 år skal bruke SPK-beløpet: 120000 / 12 = 10000
      expect(result.current.pensjonsdata[0]?.afp).toBe(10000)
    })

    it('faller tilbake til afpOffentligListe når foersteUttaksalder < 65', () => {
      vi.mocked(useAppSelector).mockImplementation((selector) => {
        if (selector === selectCurrentSimulation) {
          return {
            uttaksalder: { aar: 67, maaneder: 0 },
            gradertUttaksperiode: {
              uttaksalder: { aar: 62, maaneder: 0 },
              grad: 40,
            },
          }
        }
        if (selector === selectFoedselsdato) {
          return mockFoedselsdato
        }
        return undefined
      })

      const offentligAfpFraTpOrdning: UtbetalingsperiodeFoer1963[] = [
        {
          startAlder: { aar: 65, maaneder: 0 },
          sluttAlder: { aar: 67, maaneder: 0 },
          aarligUtbetaling: 120000,
          grad: 100,
          ytelsekode: 'AFP',
        },
      ]

      const afpOffentligListe = [
        { alder: 62, beloep: 96000, maanedligBeloep: 8000 },
      ]

      const props = {
        alderspensjonMaanedligVedEndring: {
          heltUttakMaanedligBeloep: 20000,
          gradertUttakMaanedligBeloep: 8000,
        },
        offentligAfpFraTpOrdning,
        afpOffentligListe,
      }

      const { result } = renderHook(() => usePensjonBeregninger(props))

      // foersteUttaksalder er 62 (< 65), så SPK-perioder brukes ikke
      expect(result.current.pensjonsdata[0]?.afp).toBe(8000)
    })

    it('faller tilbake til afpOffentligListe når ingen periode matcher alder', () => {
      vi.mocked(useAppSelector).mockImplementation((selector) => {
        if (selector === selectCurrentSimulation) {
          return {
            uttaksalder: { aar: 68, maaneder: 0 },
            gradertUttaksperiode: null,
          }
        }
        if (selector === selectFoedselsdato) {
          return mockFoedselsdato
        }
        return undefined
      })

      const offentligAfpFraTpOrdning: UtbetalingsperiodeFoer1963[] = [
        {
          startAlder: { aar: 65, maaneder: 0 },
          sluttAlder: { aar: 67, maaneder: 0 },
          aarligUtbetaling: 120000,
          grad: 100,
          ytelsekode: 'AFP',
        },
      ]

      const afpOffentligListe = [
        { alder: 67, beloep: 180000, maanedligBeloep: 15000 },
      ]

      const props = {
        alderspensjonMaanedligVedEndring: {
          heltUttakMaanedligBeloep: 20000,
        },
        offentligAfpFraTpOrdning,
        afpOffentligListe,
      }

      const { result } = renderHook(() => usePensjonBeregninger(props))

      // Alder 68 >= sluttAlder 67, ingen SPK-match -> faller tilbake til afpOffentligListe
      expect(result.current.pensjonsdata[0]?.afp).toBe(15000)
    })
  })

  describe('summerYtelser unngår dobbeltelling', () => {
    it('inkluderer ikke pre2025OffentligAfp når afp allerede har verdi', () => {
      const props = {
        alderspensjonMaanedligVedEndring: {
          heltUttakMaanedligBeloep: 20000,
          gradertUttakMaanedligBeloep: 8000,
        },
      }

      const { result } = renderHook(() => usePensjonBeregninger(props))

      const testData = {
        alder: { aar: 65, maaneder: 0 },
        grad: 40,
        afp: 10000,
        pensjonsavtale: 5000,
        alderspensjon: 8000,
        pre2025OffentligAfp: 7000,
        uttaksgrad: 'gradert' as const,
      }

      // afp (10000) + pensjonsavtale (5000) + alderspensjon (8000) = 23000
      // pre2025OffentligAfp skal IKKE legges til siden afp allerede har verdi
      expect(result.current.summerYtelser(testData)).toBe(23000)
    })

    it('inkluderer pre2025OffentligAfp for gradert uttak når afp er 0/undefined', () => {
      const props = {
        alderspensjonMaanedligVedEndring: {
          heltUttakMaanedligBeloep: 20000,
          gradertUttakMaanedligBeloep: 8000,
        },
      }

      const { result } = renderHook(() => usePensjonBeregninger(props))

      const testData = {
        alder: { aar: 65, maaneder: 0 },
        grad: 40,
        afp: undefined,
        pensjonsavtale: 5000,
        alderspensjon: 8000,
        pre2025OffentligAfp: 7000,
        uttaksgrad: 'gradert' as const,
      }

      // pensjonsavtale (5000) + alderspensjon (8000) + pre2025OffentligAfp (7000) = 20000
      expect(result.current.summerYtelser(testData)).toBe(20000)
    })

    it('inkluderer ikke pre2025OffentligAfp for helt uttak', () => {
      const props = {
        alderspensjonMaanedligVedEndring: {
          heltUttakMaanedligBeloep: 20000,
        },
      }

      const { result } = renderHook(() => usePensjonBeregninger(props))

      const testData = {
        alder: { aar: 67, maaneder: 0 },
        grad: 100,
        afp: undefined,
        pensjonsavtale: 5000,
        alderspensjon: 20000,
        pre2025OffentligAfp: 7000,
        uttaksgrad: 'helt' as const,
      }

      // pensjonsavtale (5000) + alderspensjon (20000) = 25000
      // pre2025OffentligAfp skal ikke legges til for helt uttak
      expect(result.current.summerYtelser(testData)).toBe(25000)
    })
  })

  it('håndterer scenario uten gradert uttaksperiode', () => {
    vi.mocked(useAppSelector).mockImplementation((selector) => {
      if (selector === selectCurrentSimulation) {
        return {
          uttaksalder: mockUttaksalder,
          gradertUttaksperiode: null,
        }
      }
      if (selector === selectFoedselsdato) {
        return mockFoedselsdato
      }
      return undefined
    })

    const props = {
      alderspensjonMaanedligVedEndring: {
        heltUttakMaanedligBeloep: 20000,
      },
    }

    const { result } = renderHook(() => usePensjonBeregninger(props))

    expect(result.current.pensjonsdata).toHaveLength(1)
    expect(result.current.harGradering).toBe(false)
  })
})
