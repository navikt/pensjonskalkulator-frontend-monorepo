import { describe, expect, it, vi } from 'vitest'

import { render, screen } from '@/test-utils'

import { Pensjonsdata } from '../../hooks'
import { PensjonVisningDesktop } from '../PensjonVisningDesktop'

describe('DesktopPensjonVisning', () => {
  const mockPensjonsdata = [
    {
      alder: { aar: 67, maaneder: 0 },
      grad: 100,
      afp: 10000,
      pensjonsavtale: 5000,
      alderspensjon: 20000,
    },
    {
      alder: { aar: 68, maaneder: 0 },
      grad: 100,
      afp: 12000,
      pensjonsavtale: 6000,
      alderspensjon: 22000,
    },
  ]

  const mockSummerYtelser = vi.fn((data: Pensjonsdata) => {
    return (
      (data.afp || 0) + (data.pensjonsavtale || 0) + (data.alderspensjon || 0)
    )
  })

  const mockHentUttaksmaanedOgAar = vi.fn(() => {
    return 'januar 2030'
  })

  it('rendrer korrekt med flere pensjonsdata oppføringer', () => {
    render(
      <PensjonVisningDesktop
        pensjonsdata={mockPensjonsdata}
        summerYtelser={mockSummerYtelser}
        hentUttaksmaanedOgAar={mockHentUttaksmaanedOgAar}
      />
    )

    expect(mockSummerYtelser).toHaveBeenCalledTimes(2)

    expect(mockHentUttaksmaanedOgAar).toHaveBeenCalledWith({
      aar: 67,
      maaneder: 0,
    })
    expect(mockHentUttaksmaanedOgAar).toHaveBeenCalledWith({
      aar: 68,
      maaneder: 0,
    })

    expect(screen.getByText(/10 000\s*kr/)).toBeVisible()
    expect(screen.getByText('5 000 kr')).toBeVisible()
    expect(screen.getByText(/12 000\s*kr/)).toBeVisible()
    expect(screen.getByText('6 000 kr')).toBeVisible()
  })

  it('returnerer null når ingen pensjonsdata oppføringer er tilgjengelige', async () => {
    const { container } = render(
      <PensjonVisningDesktop
        pensjonsdata={[]}
        summerYtelser={mockSummerYtelser}
        hentUttaksmaanedOgAar={mockHentUttaksmaanedOgAar}
      />
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('viser dato i parantes i tittel når det kun er 1 ytelse', () => {
    const singlePensjonData = [
      {
        alder: { aar: 67, maaneder: 0 },
        grad: 100,
        afp: 0,
        alderspensjon: 20000,
        pensjonsavtale: 0,
      },
    ]

    render(
      <PensjonVisningDesktop
        pensjonsdata={singlePensjonData}
        summerYtelser={mockSummerYtelser}
        hentUttaksmaanedOgAar={mockHentUttaksmaanedOgAar}
      />
    )

    const dateText = screen.getByTestId('maanedsbeloep-desktop-title')
    expect(dateText).toContainElement(screen.queryByText(/(januar 2030)/))
  })

  it('viser ikke kalender måned når det er mer enn en ytelse', () => {
    const singlePensjonData = [
      {
        alder: { aar: 67, maaneder: 0 },
        grad: 100,
        afp: 0,
        alderspensjon: 20000,
        pensjonsavtale: 0,
        pre2025OffentligAFP: 10000,
      },
    ]

    render(
      <PensjonVisningDesktop
        pensjonsdata={singlePensjonData}
        summerYtelser={mockSummerYtelser}
        hentUttaksmaanedOgAar={mockHentUttaksmaanedOgAar}
        harGradering={false}
      />
    )

    expect(
      screen.getByTestId('maanedsbeloep-desktop-title').textContent
    ).not.toContain(/(januar 2030)/)
  })

  describe('vise månedsbeløp for gammel AFP - pre2025OffentligAfp', () => {
    const mockPensjonsdataPre2025OffentligAfp = [
      {
        alder: { aar: 65, maaneder: 3 },
        grad: 100,
        afp: 0,
        pensjonsavtale: 0,
        alderspensjon: undefined,
        pre2025OffentligAfp: 15000,
      },
      {
        alder: { aar: 67, maaneder: 3 },
        grad: 100,
        afp: 0,
        pensjonsavtale: 0,
        alderspensjon: 20000,
        pre2025OffentligAfp: 15000,
      },
    ]

    beforeEach(() => {
      render(
        <PensjonVisningDesktop
          pensjonsdata={mockPensjonsdataPre2025OffentligAfp}
          summerYtelser={mockSummerYtelser}
          hentUttaksmaanedOgAar={mockHentUttaksmaanedOgAar}
        />
      )
    })

    it('viser kun AFP og Alerdspensjon for pre2025OffentligAfp', () => {
      expect(mockSummerYtelser).toHaveBeenCalledTimes(2)
      const sumText = screen.queryByTestId('maanedsbeloep-desktop-sum')
      expect(sumText).not.toBeInTheDocument()
    })

    it('viser dato i parantes i tittel for pre2025OffentligAfp', () => {
      const pre2025OffentligAfpMaanedsBeloepTittelList = screen.getAllByTestId(
        'maanedsbeloep-desktop-title'
      )

      expect(pre2025OffentligAfpMaanedsBeloepTittelList[0]).toHaveTextContent(
        'beregning.avansert.maanedsbeloep.box_title 65 alder.aar string.og 3 alder.maaneder (januar 2030)'
      )

      expect(pre2025OffentligAfpMaanedsBeloepTittelList[1]).toHaveTextContent(
        '67 år (januar 2030)'
      )
    })

    it('viser bare tidligst uttaks alder for AP i tittel for pre2025OffentligAfp', () => {
      const afpMaanedsBeloepTittel = screen.getAllByTestId(
        'maanedsbeloep-desktop-title'
      )[1]
      expect(afpMaanedsBeloepTittel).toContainElement(
        screen.queryByText(/67 år/)
      )
    })
  })
})
