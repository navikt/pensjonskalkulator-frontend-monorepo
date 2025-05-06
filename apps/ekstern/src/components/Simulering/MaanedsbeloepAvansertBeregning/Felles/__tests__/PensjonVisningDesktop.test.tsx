import { describe, expect, it, vi } from 'vitest'

import { render, screen } from '@/test-utils'

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

  const mockSummerYtelser = vi.fn((data) => {
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

    expect(screen.getByText('10 000 kr')).toBeVisible()
    expect(screen.getByText('5 000 kr')).toBeVisible()
    expect(screen.getByText('12 000 kr')).toBeVisible()
    expect(screen.getByText('6 000 kr')).toBeVisible()
  })

  it('returnerer null når ingen pensjonsdata oppføringer er tilgjengelige', () => {
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
})
