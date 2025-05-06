import { describe, expect, it, vi } from 'vitest'

import { render, screen } from '@/test-utils'

import { PensjonDataVisning } from '../PensjonDataVisning'

describe('PensjonDataVisning', () => {
  const mockPensjonsdata = {
    alder: { aar: 67, maaneder: 0 },
    grad: 100,
    afp: 10000,
    pensjonsavtale: 5000,
    alderspensjon: 20000,
  }

  const mockSummerYtelser = vi.fn(() => 35000)
  const mockHentUttaksmaanedOgAar = vi.fn(() => 'januar 2030')

  it('viser alle verdier når alle pensjonstyper er tilstede', () => {
    render(
      <PensjonDataVisning
        pensjonsdata={mockPensjonsdata}
        summerYtelser={mockSummerYtelser}
        hentUttaksMaanedOgAar={mockHentUttaksmaanedOgAar}
      />
    )

    expect(screen.getByText('10 000 kr')).toBeInTheDocument()
    expect(screen.getByText('5 000 kr')).toBeInTheDocument()
    expect(screen.getByText('20 000 kr')).toBeInTheDocument()
    expect(screen.getByText('35 000 kr')).toBeInTheDocument()
  })

  it('viser ikke AFP når den ikke er tilstede', () => {
    render(
      <PensjonDataVisning
        pensjonsdata={{ ...mockPensjonsdata, afp: undefined }}
        summerYtelser={mockSummerYtelser}
        hentUttaksMaanedOgAar={mockHentUttaksmaanedOgAar}
      />
    )

    expect(screen.queryByText('AFP')).not.toBeInTheDocument()

    expect(screen.getByText('5 000 kr')).toBeInTheDocument()
    expect(screen.getByText('20 000 kr')).toBeInTheDocument()
  })

  it('viser ikke pensjonsavtale når den er 0 eller ikke tilstede', () => {
    render(
      <PensjonDataVisning
        pensjonsdata={{ ...mockPensjonsdata, pensjonsavtale: 0 }}
        summerYtelser={mockSummerYtelser}
        hentUttaksMaanedOgAar={mockHentUttaksmaanedOgAar}
      />
    )

    const pensjonsavtaleElements = screen.queryAllByText('pensjonsavtaler')
    expect(pensjonsavtaleElements.length).toBe(0)
  })

  it('viser ikke sum når bare alderspensjon er tilstede', () => {
    render(
      <PensjonDataVisning
        pensjonsdata={{
          alder: { aar: 67, maaneder: 0 },
          grad: 100,
          afp: 0,
          alderspensjon: 20000,
          pensjonsavtale: 0,
        }}
        summerYtelser={mockSummerYtelser}
        hentUttaksMaanedOgAar={mockHentUttaksmaanedOgAar}
      />
    )

    expect(screen.getByText('20 000 kr')).toBeInTheDocument()

    expect(screen.queryByText('sum')).not.toBeInTheDocument()
  })

  it('viser dato i "sum" feltet når det er flere ytelser', () => {
    const mixedPensjonData = {
      alder: { aar: 67, maaneder: 0 },
      grad: 100,
      afp: 10000,
      alderspensjon: 20000,
      pensjonsavtale: 1000,
    }

    render(
      <PensjonDataVisning
        pensjonsdata={mixedPensjonData}
        summerYtelser={mockSummerYtelser}
        hentUttaksMaanedOgAar={mockHentUttaksmaanedOgAar}
      />
    )

    const dateText = screen.queryByTestId('maanedsbeloep-avansert-sum')
    expect(dateText).not.toContainElement(
      screen.queryByText(/(\bJanuary 2030\b)/)
    )
    expect(dateText).toContainElement(screen.getByText(/januar 2030/))
  })
})
