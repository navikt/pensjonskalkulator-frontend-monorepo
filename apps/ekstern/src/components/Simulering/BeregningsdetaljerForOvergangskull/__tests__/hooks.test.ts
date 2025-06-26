import { renderHook } from '@testing-library/react'
import { vi } from 'vitest'

import { useAppSelector } from '@/state/hooks'

import { useBeregningsdetaljer } from '../hooks'

vi.mock('@/state/hooks', () => ({
  useAppSelector: vi.fn(),
}))

vi.mock('@/utils/inntekt', () => ({
  formatInntekt: (v: number) => v.toString(),
}))

const mockAlderspensjon = {
  alder: 67,
  beloep: 4800,
  grunnpensjon: 1000,
  tilleggspensjon: 2000,
  skjermingstillegg: 300,
  pensjonstillegg: 400,
  inntektspensjonBeloep: 500,
  garantipensjonBeloep: 600,
  andelsbroekKap19: 0.3,
  andelsbroekKap20: 0.7,
  sluttpoengtall: 3,
  poengaarFoer92: 4,
  poengaarEtter91: 5,
  trygdetidKap19: 6,
  trygdetidKap20: 7,
  pensjonBeholdningFoerUttakBeloep: 80000,
  kapittel19Gjenlevendetillegg: 342,
}

const mockAfpPrivat = {
  alder: 62,
  beloep: 15000,
  kompensasjonstillegg: 500,
  kronetillegg: 1000,
  livsvarig: 12000,
  maanedligBeloep: 15000,
}

const mockAfpOffentlig = {
  alder: 62,
  beloep: 12000,
  maanedligBeloep: 12000,
}

const mockPre2025OffentligAfp = {
  alderAar: 62,
  totaltAfpBeloep: 15000,
  tidligereArbeidsinntekt: 500000,
  grunnbeloep: 118620,
  sluttpoengtall: 2,
  trygdetid: 5,
  poengaarTom1991: 3,
  poengaarFom1992: 4,
  grunnpensjon: 1000,
  tilleggspensjon: 2000,
  afpTillegg: 500,
  saertillegg: 0,
  afpGrad: 50,
  afpAvkortetTil70Prosent: false,
}

describe('useBeregningsdetaljer', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(useAppSelector).mockReturnValue({
      uttaksalder: { aar: 67, maaneder: 0 },
      gradertUttaksperiode: null,
    })
  })

  it('returnerer tomme arrays hvis ingen input', () => {
    const { result } = renderHook(() => useBeregningsdetaljer())
    expect(result.current.alderspensjonDetaljerListe).toEqual([])
    expect(result.current.pre2025OffentligAfpDetaljerListe).toEqual([])
    expect(result.current.opptjeningKap19Liste).toEqual([])
    expect(result.current.opptjeningKap20Liste).toEqual([])
    expect(result.current.afpPrivatDetaljerListe).toEqual([])
    expect(result.current.afpOffentligDetaljerListe).toEqual([])
    expect(result.current.opptjeningPre2025OffentligAfpListe).toEqual([])
  })

  describe('Gitt at brukeren har alderspensjon', () => {
    it('returneres riktige rader for alderspensjonDetaljerListe', () => {
      const { result } = renderHook(() =>
        useBeregningsdetaljer(
          [mockAlderspensjon],
          [mockAfpPrivat],
          [mockAfpOffentlig],
          mockPre2025OffentligAfp
        )
      )
      expect(result.current.alderspensjonDetaljerListe).toEqual([
        expect.arrayContaining([
          expect.objectContaining({
            tekst: 'Grunnpensjon (kap. 19)',
            verdi: '83 kr',
          }),
          expect.objectContaining({
            tekst: 'Tilleggspensjon (kap. 19)',
            verdi: '167 kr',
          }),
          expect.objectContaining({
            tekst: 'Skjermingstillegg (kap. 19)',
            verdi: '25 kr',
          }),
          expect.objectContaining({
            tekst: 'Pensjonstillegg (kap. 19)',
            verdi: '33 kr',
          }),
          expect.objectContaining({
            tekst: 'Inntektspensjon (kap. 20)',
            verdi: '42 kr',
          }),
          expect.objectContaining({
            tekst: 'Garantipensjon (kap. 20)',
            verdi: '50 kr',
          }),
          expect.objectContaining({
            tekst: 'Gjenlevendetillegg (kap. 19)',
            verdi: '29 kr',
          }),
          expect.objectContaining({
            tekst: 'Sum alderspensjon',
            verdi: '429 kr',
          }),
        ]),
      ])
    })
    describe('Når det er felter som har verdi 0', () => {
      it('skjules feltene', () => {
        const mock = {
          ...mockAlderspensjon,
          grunnpensjon: 0,
          tilleggspensjon: 0,
          skjermingstillegg: 0,
          pensjonstillegg: 0,
          inntektspensjonBeloep: 0,
          garantipensjonBeloep: 0,
          kapittel19Gjenlevendetillegg: 0,
        }
        const { result } = renderHook(() =>
          useBeregningsdetaljer(
            [mock],
            [mockAfpPrivat],
            [mockAfpOffentlig],
            mockPre2025OffentligAfp
          )
        )
        expect(result.current.alderspensjonDetaljerListe).toEqual([[]])
      })
    })

    describe('Når det er gjenlevendetillegg', () => {
      it('inkluderes gjenlevendetillegg i beregningen', () => {
        const mockMedGjenlevendetillegg = {
          ...mockAlderspensjon,
          kapittel19Gjenlevendetillegg: 600, // 50 kr per måned
        }
        const { result } = renderHook(() =>
          useBeregningsdetaljer(
            [mockMedGjenlevendetillegg],
            [mockAfpPrivat],
            [mockAfpOffentlig],
            mockPre2025OffentligAfp
          )
        )
        expect(result.current.alderspensjonDetaljerListe).toEqual([
          expect.arrayContaining([
            expect.objectContaining({
              tekst: 'Gjenlevendetillegg (kap. 19)',
              verdi: '50 kr',
            }),
          ]),
        ])
      })

      it('skjules når gjenlevendetillegg er 0', () => {
        const mockUtenGjenlevendetillegg = {
          ...mockAlderspensjon,
          kapittel19Gjenlevendetillegg: 0,
        }
        const { result } = renderHook(() =>
          useBeregningsdetaljer(
            [mockUtenGjenlevendetillegg],
            [mockAfpPrivat],
            [mockAfpOffentlig],
            mockPre2025OffentligAfp
          )
        )
        const alderspensjonDetaljer =
          result.current.alderspensjonDetaljerListe[0]
        const gjenlevendetilleggRad = alderspensjonDetaljer.find(
          (rad) => rad.tekst === 'Gjenlevendetillegg (kap. 19)'
        )
        expect(gjenlevendetilleggRad).toBeUndefined()
      })
    })

    describe('Når det er felter som har negativ verdi', () => {
      it('skjules feltene i alderspensjonDetaljerListe', () => {
        const mock = {
          ...mockAlderspensjon,
          grunnpensjon: -100,
          tilleggspensjon: -200,
          skjermingstillegg: -300,
          pensjonstillegg: -400,
          inntektspensjonBeloep: -500,
          garantipensjonBeloep: -600,
          kapittel19Gjenlevendetillegg: -342,
        }
        const { result } = renderHook(() =>
          useBeregningsdetaljer(
            [mock],
            [mockAfpPrivat],
            [mockAfpOffentlig],
            mockPre2025OffentligAfp
          )
        )
        expect(result.current.alderspensjonDetaljerListe).toEqual([[]])
      })
    })
  })

  describe('Gitt at brukeren har opptjening i kapittel 19', () => {
    it('returneres riktige rader for opptjeningKap19Liste', () => {
      const { result } = renderHook(() =>
        useBeregningsdetaljer(
          [mockAlderspensjon],
          [mockAfpPrivat],
          [mockAfpOffentlig],
          mockPre2025OffentligAfp
        )
      )
      expect(result.current.opptjeningKap19Liste).toEqual([
        expect.arrayContaining([
          expect.objectContaining({ tekst: 'Andelsbrøk', verdi: '3/10' }),
          expect.objectContaining({ tekst: 'Sluttpoengtall', verdi: 3 }),
          expect.objectContaining({ tekst: 'Poengår', verdi: 9 }),
          expect.objectContaining({ tekst: 'Trygdetid', verdi: 6 }),
        ]),
      ])
    })

    describe('Når det er felter som har verdi 0', () => {
      it('vises Poengår selv om verdien er 0', () => {
        const mock = {
          ...mockAlderspensjon,
          poengaarFoer92: 0,
          poengaarEtter91: 0,
        }
        const { result } = renderHook(() =>
          useBeregningsdetaljer(
            [mock],
            [mockAfpPrivat],
            [mockAfpOffentlig],
            mockPre2025OffentligAfp
          )
        )
        expect(result.current.opptjeningKap19Liste).toEqual([
          expect.arrayContaining([
            expect.objectContaining({ tekst: 'Poengår', verdi: 0 }),
          ]),
        ])
      })

      it('vises Trygdetid selv om verdien er 0', () => {
        const mock = { ...mockAlderspensjon, trygdetidKap19: 0 }
        const { result } = renderHook(() =>
          useBeregningsdetaljer(
            [mock],
            [mockAfpPrivat],
            [mockAfpOffentlig],
            mockPre2025OffentligAfp
          )
        )
        expect(result.current.opptjeningKap19Liste).toEqual([
          expect.arrayContaining([
            expect.objectContaining({ tekst: 'Trygdetid', verdi: 0 }),
          ]),
        ])
      })

      it('skjules andre felter med verdi 0', () => {
        const mock = {
          ...mockAlderspensjon,
          andelsbroekKap19: 0,
          sluttpoengtall: 0,
        }
        const { result } = renderHook(() =>
          useBeregningsdetaljer(
            [mock],
            [mockAfpPrivat],
            [mockAfpOffentlig],
            mockPre2025OffentligAfp
          )
        )
        expect(result.current.opptjeningKap19Liste).toEqual([[]])
      })

      it('skjules Andelsbrøk når verdien er 10/10', () => {
        const mock = {
          ...mockAlderspensjon,
          andelsbroekKap19: 1, // 1 * 10 = 10/10
        }
        const { result } = renderHook(() =>
          useBeregningsdetaljer(
            [mock],
            [mockAfpPrivat],
            [mockAfpOffentlig],
            mockPre2025OffentligAfp
          )
        )
        const opptjeningResult = result.current.opptjeningKap19Liste[0]
        const andelsbroekRad = opptjeningResult?.find(
          (rad) => rad.tekst === 'Andelsbrøk'
        )
        expect(andelsbroekRad).toBeUndefined()
        // But other fields should still be present
        expect(opptjeningResult).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ tekst: 'Sluttpoengtall', verdi: 3 }),
            expect.objectContaining({ tekst: 'Poengår', verdi: 9 }),
            expect.objectContaining({ tekst: 'Trygdetid', verdi: 6 }),
          ])
        )
      })
    })
  })

  describe('Gitt at brukeren har opptjening i kapittel 20', () => {
    it('returneres riktige rader for opptjeningKap20Liste', () => {
      const { result } = renderHook(() =>
        useBeregningsdetaljer(
          [mockAlderspensjon],
          [mockAfpPrivat],
          [mockAfpOffentlig],
          mockPre2025OffentligAfp
        )
      )
      expect(result.current.opptjeningKap20Liste).toEqual([
        expect.arrayContaining([
          expect.objectContaining({ tekst: 'Andelsbrøk', verdi: '7/10' }),
          expect.objectContaining({ tekst: 'Trygdetid', verdi: 7 }),
          expect.objectContaining({
            tekst: 'Pensjonsbeholdning',
            verdi: '80000 kr',
          }),
        ]),
      ])
    })

    describe('Når det er felter som har verdi 0', () => {
      it('vises Trygdetid selv om verdien er 0', () => {
        const mock = { ...mockAlderspensjon, trygdetidKap20: 0 }
        const { result } = renderHook(() =>
          useBeregningsdetaljer(
            [mock],
            [mockAfpPrivat],
            [mockAfpOffentlig],
            mockPre2025OffentligAfp
          )
        )
        expect(result.current.opptjeningKap20Liste).toEqual([
          expect.arrayContaining([
            expect.objectContaining({ tekst: 'Trygdetid', verdi: 0 }),
          ]),
        ])
      })

      it('vises Pensjonbeholdning før uttak selv om verdien er 0', () => {
        const mock = {
          ...mockAlderspensjon,
          pensjonBeholdningFoerUttakBeloep: 0,
        }
        const { result } = renderHook(() =>
          useBeregningsdetaljer(
            [mock],
            [mockAfpPrivat],
            [mockAfpOffentlig],
            mockPre2025OffentligAfp
          )
        )
        expect(result.current.opptjeningKap20Liste).toEqual([
          expect.arrayContaining([
            expect.objectContaining({
              tekst: 'Pensjonsbeholdning',
              verdi: '0 kr',
            }),
          ]),
        ])
      })

      it('skjules andre felter med verdi 0', () => {
        const mock = {
          ...mockAlderspensjon,
          andelsbroekKap20: 0,
        }
        const { result } = renderHook(() =>
          useBeregningsdetaljer(
            [mock],
            [mockAfpPrivat],
            [mockAfpOffentlig],
            mockPre2025OffentligAfp
          )
        )
        expect(result.current.opptjeningKap20Liste).toEqual([[]])
      })

      it('skjules Andelsbrøk når verdien er 10/10', () => {
        const mock = {
          ...mockAlderspensjon,
          andelsbroekKap20: 1, // 1 * 10 = 10/10
        }
        const { result } = renderHook(() =>
          useBeregningsdetaljer(
            [mock],
            [mockAfpPrivat],
            [mockAfpOffentlig],
            mockPre2025OffentligAfp
          )
        )
        const opptjeningResult = result.current.opptjeningKap20Liste[0]
        const andelsbroekRad = opptjeningResult?.find(
          (rad) => rad.tekst === 'Andelsbrøk'
        )
        expect(andelsbroekRad).toBeUndefined()
        // But other fields should still be present
        expect(opptjeningResult).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ tekst: 'Trygdetid', verdi: 7 }),
            expect.objectContaining({
              tekst: 'Pensjonsbeholdning',
              verdi: '80000 kr',
            }),
          ])
        )
      })
    })
  })

  describe('Gitt at brukeren har gammel Afp', () => {
    it('returneres riktige rader for opptjeningPre2025OffentligAfpListe', () => {
      const { result } = renderHook(() =>
        useBeregningsdetaljer(
          [mockAlderspensjon],
          [mockAfpPrivat],
          [mockAfpOffentlig],
          mockPre2025OffentligAfp
        )
      )
      expect(result.current.opptjeningPre2025OffentligAfpListe).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ tekst: 'AFP grad', verdi: 50 }),
          expect.objectContaining({ tekst: 'Sluttpoengtall', verdi: 2 }),
          expect.objectContaining({ tekst: 'Poengår', verdi: 7 }),
          expect.objectContaining({ tekst: 'Trygdetid', verdi: 5 }),
        ])
      )
    })

    describe('Når det er felter som har verdi 0', () => {
      it('vises Poengår selv om verdien er 0', () => {
        const mock = {
          ...mockPre2025OffentligAfp,
          poengaarTom1991: 0,
          poengaarFom1992: 0,
        }
        const { result } = renderHook(() =>
          useBeregningsdetaljer([], [], [], mock)
        )
        expect(result.current.opptjeningPre2025OffentligAfpListe).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ tekst: 'Poengår', verdi: 0 }),
          ])
        )
      })

      it('vises Trygdetid selv om verdien er 0', () => {
        const mock = { ...mockPre2025OffentligAfp, trygdetid: 0 }
        const { result } = renderHook(() =>
          useBeregningsdetaljer([], [], [], mock)
        )
        expect(result.current.opptjeningPre2025OffentligAfpListe).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ tekst: 'Trygdetid', verdi: 0 }),
          ])
        )
      })

      it('skjules andre felter med verdi 0', () => {
        const mock = {
          ...mockPre2025OffentligAfp,
          afpGrad: 0,
          sluttpoengtall: 0,
        }
        const { result } = renderHook(() =>
          useBeregningsdetaljer([], [], [], mock)
        )
        expect(result.current.opptjeningPre2025OffentligAfpListe).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ tekst: 'Poengår', verdi: 7 }),
            expect.objectContaining({ tekst: 'Trygdetid', verdi: 5 }),
          ])
        )
      })
    })
  })

  describe('Gitt at brukeren har AFP privat', () => {
    it('returnerer kun ett objekt når uttaksalder er 67 eller høyere', () => {
      vi.mocked(useAppSelector).mockReturnValue({
        uttaksalder: { aar: 67, maaneder: 0 },
        gradertUttaksperiode: null,
      })

      const { result } = renderHook(() =>
        useBeregningsdetaljer(
          [mockAlderspensjon],
          [mockAfpPrivat],
          [mockAfpOffentlig],
          mockPre2025OffentligAfp
        )
      )

      expect(result.current.afpPrivatDetaljerListe).toHaveLength(1)
      expect(result.current.afpPrivatDetaljerListe[0]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            tekst: 'Kompensasjonstillegg',
            verdi: '500 kr',
          }),
          expect.objectContaining({
            tekst: 'Kronetillegg',
            verdi: '1000 kr',
          }),
          expect.objectContaining({
            tekst: 'Livsvarig del',
            verdi: '12000 kr',
          }),
          expect.objectContaining({
            tekst: 'Sum AFP',
            verdi: '15000 kr',
          }),
        ])
      )
    })

    it('returnerer to objekter når uttaksalder er mindre enn 67 og AFP 67 finnes', () => {
      vi.mocked(useAppSelector).mockReturnValue({
        uttaksalder: { aar: 65, maaneder: 0 },
        gradertUttaksperiode: null,
      })

      const afpPrivatListe = [
        mockAfpPrivat,
        {
          alder: 67,
          beloep: 20000,
          kompensasjonstillegg: 600,
          kronetillegg: 1200,
          livsvarig: 15000,
          maanedligBeloep: 20000,
        },
      ]

      const { result } = renderHook(() =>
        useBeregningsdetaljer(
          [mockAlderspensjon],
          afpPrivatListe,
          [mockAfpOffentlig],
          mockPre2025OffentligAfp
        )
      )

      expect(result.current.afpPrivatDetaljerListe).toHaveLength(2)

      // Første element (index 0 - uttaksalder)
      expect(result.current.afpPrivatDetaljerListe[0]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            tekst: 'Kompensasjonstillegg',
            verdi: '500 kr',
          }),
          expect.objectContaining({
            tekst: 'Sum AFP',
            verdi: '15000 kr',
          }),
        ])
      )

      // Andre element (alder 67)
      expect(result.current.afpPrivatDetaljerListe[1]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            tekst: 'Kompensasjonstillegg',
            verdi: '600 kr',
          }),
          expect.objectContaining({
            tekst: 'Sum AFP',
            verdi: '20000 kr',
          }),
        ])
      )
    })

    it('returnerer kun ett objekt når uttaksalder er mindre enn 67 men AFP 67 ikke finnes', () => {
      vi.mocked(useAppSelector).mockReturnValue({
        uttaksalder: { aar: 65, maaneder: 0 },
        gradertUttaksperiode: null,
      })

      const afpPrivatListe = [mockAfpPrivat]

      const { result } = renderHook(() =>
        useBeregningsdetaljer(
          [mockAlderspensjon],
          afpPrivatListe,
          [mockAfpOffentlig],
          mockPre2025OffentligAfp
        )
      )

      expect(result.current.afpPrivatDetaljerListe).toHaveLength(1)
    })

    it('filtrerer bort rader med verdi 0 kr', () => {
      const afpPrivatMedNull = {
        ...mockAfpPrivat,
        kompensasjonstillegg: 0,
        kronetillegg: 0,
      }

      const { result } = renderHook(() =>
        useBeregningsdetaljer(
          [mockAlderspensjon],
          [afpPrivatMedNull],
          [mockAfpOffentlig],
          mockPre2025OffentligAfp
        )
      )

      expect(result.current.afpPrivatDetaljerListe[0]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            tekst: 'Livsvarig del',
            verdi: '12000 kr',
          }),
          expect.objectContaining({
            tekst: 'Sum AFP',
            verdi: '15000 kr',
          }),
        ])
      )

      expect(result.current.afpPrivatDetaljerListe[0]).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            tekst: 'Kompensasjonstillegg',
          }),
        ])
      )
    })
  })

  describe('Gitt at brukeren har AFP offentlig', () => {
    it('returnerer riktige rader for afpOffentligDetaljerListe', () => {
      const { result } = renderHook(() =>
        useBeregningsdetaljer(
          [mockAlderspensjon],
          [mockAfpPrivat],
          [mockAfpOffentlig],
          mockPre2025OffentligAfp
        )
      )
      expect(result.current.afpOffentligDetaljerListe).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            tekst: 'Månedlig livsvarig avtalefestet pensjon (AFP)',
            verdi: '12000 kr',
          }),
        ])
      )
    })

    it('returnerer tom liste når AFP offentlig er undefined', () => {
      const { result } = renderHook(() =>
        useBeregningsdetaljer(
          [mockAlderspensjon],
          [mockAfpPrivat],
          undefined,
          mockPre2025OffentligAfp
        )
      )
      expect(result.current.afpOffentligDetaljerListe).toEqual([])
    })

    it('returnerer tom liste når AFP offentlig er tom liste', () => {
      const { result } = renderHook(() =>
        useBeregningsdetaljer(
          [mockAlderspensjon],
          [mockAfpPrivat],
          [],
          mockPre2025OffentligAfp
        )
      )
      expect(result.current.afpOffentligDetaljerListe).toEqual([])
    })

    it('filtrerer bort rader med verdi 0', () => {
      const afpOffentligMedNull = {
        ...mockAfpOffentlig,
        maanedligBeloep: 0,
      }

      const { result } = renderHook(() =>
        useBeregningsdetaljer(
          [mockAlderspensjon],
          [mockAfpPrivat],
          [afpOffentligMedNull],
          mockPre2025OffentligAfp
        )
      )

      expect(result.current.afpOffentligDetaljerListe).toEqual([])
    })
  })

  describe('Gitt at brukeren har pre2025OffentligAfp', () => {
    it('returneres riktige rader for pre2025OffentligAfpDetaljerListe', () => {
      const { result } = renderHook(() =>
        useBeregningsdetaljer(
          [mockAlderspensjon],
          [mockAfpPrivat],
          [mockAfpOffentlig],
          mockPre2025OffentligAfp
        )
      )
      expect(result.current.pre2025OffentligAfpDetaljerListe).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            tekst: 'Grunnpensjon (kap. 19)',
            verdi: '1000 kr',
          }),
          expect.objectContaining({
            tekst: 'Tilleggspensjon (kap. 19)',
            verdi: '2000 kr',
          }),
          expect.objectContaining({
            tekst: 'AFP-tillegg',
            verdi: '500 kr',
          }),
          expect.objectContaining({
            tekst: 'Sum AFP',
            verdi: '3500 kr',
          }),
        ])
      )
    })

    it('filtrerer bort rader med verdi 0 fra pre2025OffentligAfpDetaljerListe', () => {
      const pre2025AfpMedNuller = {
        ...mockPre2025OffentligAfp,
        grunnpensjon: 1000,
        tilleggspensjon: 0,
        afpTillegg: 500,
        saertillegg: 0,
      }

      const { result } = renderHook(() =>
        useBeregningsdetaljer(
          [mockAlderspensjon],
          [mockAfpPrivat],
          [mockAfpOffentlig],
          pre2025AfpMedNuller
        )
      )

      expect(result.current.pre2025OffentligAfpDetaljerListe).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            tekst: 'Grunnpensjon (kap. 19)',
            verdi: '1000 kr',
          }),
          expect.objectContaining({
            tekst: 'AFP-tillegg',
            verdi: '500 kr',
          }),
          expect.objectContaining({
            tekst: 'Sum AFP',
            verdi: '1500 kr',
          }),
        ])
      )
      expect(result.current.pre2025OffentligAfpDetaljerListe.length).toBe(3) // Kun non-zero values + sum
    })

    it('returnerer tom liste når pre2025OffentligAfp er undefined', () => {
      const { result } = renderHook(() =>
        useBeregningsdetaljer(
          [mockAlderspensjon],
          [mockAfpPrivat],
          [mockAfpOffentlig],
          undefined
        )
      )
      expect(result.current.pre2025OffentligAfpDetaljerListe).toEqual([])
    })

    it('håndterer negative verdier korrekt i pre2025OffentligAfpDetaljerListe', () => {
      const pre2025AfpMedNegative = {
        ...mockPre2025OffentligAfp,
        grunnpensjon: -1000,
        tilleggspensjon: 2000,
        afpTillegg: 500,
        saertillegg: 0,
      }

      const { result } = renderHook(() =>
        useBeregningsdetaljer(
          [mockAlderspensjon],
          [mockAfpPrivat],
          [mockAfpOffentlig],
          pre2025AfpMedNegative
        )
      )

      // Negative verdier skal filtreres bort
      const grunnpensjonRad =
        result.current.pre2025OffentligAfpDetaljerListe.find(
          (rad) => rad.tekst === 'Grunnpensjon (kap. 19)'
        )
      expect(grunnpensjonRad).toBeUndefined()
    })

    it('inkluderer alle komponenter i summen for pre2025OffentligAfpDetaljerListe', () => {
      const { result } = renderHook(() =>
        useBeregningsdetaljer(
          [mockAlderspensjon],
          [mockAfpPrivat],
          [mockAfpOffentlig],
          mockPre2025OffentligAfp
        )
      )

      const sumRad = result.current.pre2025OffentligAfpDetaljerListe.find(
        (rad) => rad.tekst === 'Sum AFP'
      )
      expect(sumRad).toBeDefined()
      expect(sumRad?.verdi).toBe('3500 kr')
    })
  })
})
