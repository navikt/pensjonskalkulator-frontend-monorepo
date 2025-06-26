import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import { AlderspensjonDetaljerGrunnlag } from '../AlderspensjonDetaljerGrunnlag'
import { DetaljRad } from '../hooks'

// Mock the child components
vi.mock('../Felles/AlderspensjonDetaljer', () => ({
  AlderspensjonDetaljer: ({
    alderspensjonDetaljerListe,
    hasPre2025OffentligAfpUttaksalder,
  }: {
    alderspensjonDetaljerListe: DetaljRad[][]
    hasPre2025OffentligAfpUttaksalder: boolean
  }) => (
    <div
      data-testid="AlderspensjonDetaljer"
      data-objekter-length={alderspensjonDetaljerListe.length}
      data-has-pre2025-afp={hasPre2025OffentligAfpUttaksalder}
    >
      AlderspensjonDetaljer Mock
    </div>
  ),
}))

vi.mock('../Felles/OpptjeningDetaljer', () => ({
  OpptjeningDetaljer: ({
    opptjeningKap19Liste,
    opptjeningKap20Liste,
    alderspensjonDetaljerListe,
  }: {
    opptjeningKap19Liste: DetaljRad[][]
    opptjeningKap20Liste: DetaljRad[][]
    alderspensjonDetaljerListe: DetaljRad[][]
  }) => (
    <div
      data-testid="OpptjeningDetaljer"
      data-kap19-length={opptjeningKap19Liste.length}
      data-kap20-length={opptjeningKap20Liste.length}
      data-alderspensjon-length={alderspensjonDetaljerListe.length}
    >
      OpptjeningDetaljer Mock
    </div>
  ),
}))

describe('AlderspensjonDetaljerGrunnlag', () => {
  const defaultProps = {
    alderspensjonDetaljerListe: [
      [
        { tekst: 'Trygdetid', verdi: 40 },
        { tekst: 'Sluttpoengtall', verdi: 6.5 },
      ],
      [{ tekst: 'Pensjonsbeholdning', verdi: '500000 kr' }],
    ],
    opptjeningKap19Liste: [
      [{ tekst: 'Andelsbrøk', verdi: '10/10' }],
      [{ tekst: 'Sluttpoengtall', verdi: 6.5 }],
    ],
    opptjeningKap20Liste: [
      [{ tekst: 'Pensjonsbeholdning før uttak', verdi: '500000 kr' }],
      [{ tekst: 'Trygdetid', verdi: 40 }],
    ],
    hasPre2025OffentligAfpUttaksalder: true,
  }

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('rendrer wrapper med korrekt test id', () => {
    render(<AlderspensjonDetaljerGrunnlag {...defaultProps} />)
    expect(
      screen.getByTestId('beregningsdetaljer-for-overgangskull')
    ).toBeVisible()
  })

  it('rendrer både desktop og mobil versjon med riktig CSS klasser', () => {
    const { container } = render(
      <AlderspensjonDetaljerGrunnlag {...defaultProps} />
    )

    const desktopDiv = container.querySelector(
      '[class*="beregningsdetaljerForOvergangskullDesktopOnly"]'
    )
    const mobileDiv = container.querySelector(
      '[class*="beregningsdetaljerForOvergangskullMobileOnly"]'
    )

    expect(desktopDiv).toBeInTheDocument()
    expect(mobileDiv).toBeInTheDocument()
  })

  it('rendrer HStack for desktop versjon', () => {
    render(<AlderspensjonDetaljerGrunnlag {...defaultProps} />)

    const desktopContainer = screen
      .getByTestId('beregningsdetaljer-for-overgangskull')
      .querySelector('[class*="beregningsdetaljerForOvergangskullDesktopOnly"]')

    expect(desktopContainer?.firstChild).toHaveClass('navds-stack')
  })

  it('rendrer VStack for mobil versjon', () => {
    render(<AlderspensjonDetaljerGrunnlag {...defaultProps} />)

    const mobileContainer = screen
      .getByTestId('beregningsdetaljer-for-overgangskull')
      .querySelector('[class*="beregningsdetaljerForOvergangskullMobileOnly"]')

    expect(mobileContainer?.firstChild).toHaveClass('navds-stack')
  })

  it('rendrer begge detalj komponenter', () => {
    render(<AlderspensjonDetaljerGrunnlag {...defaultProps} />)

    // Skal rendre komponenter to ganger (desktop + mobil)
    expect(screen.getAllByTestId('AlderspensjonDetaljer')).toHaveLength(2)
    expect(screen.getAllByTestId('OpptjeningDetaljer')).toHaveLength(2)
  })

  it('sender korrekte props til AlderspensjonDetaljer', () => {
    render(<AlderspensjonDetaljerGrunnlag {...defaultProps} />)

    const alderspensjonDetaljerComponents = screen.getAllByTestId(
      'AlderspensjonDetaljer'
    )

    alderspensjonDetaljerComponents.forEach((component) => {
      expect(component).toHaveAttribute('data-objekter-length', '2')
      expect(component).toHaveAttribute('data-has-pre2025-afp', 'true')
    })
  })

  it('sender korrekte props til OpptjeningDetaljer', () => {
    render(<AlderspensjonDetaljerGrunnlag {...defaultProps} />)

    const opptjeningDetaljerComponents =
      screen.getAllByTestId('OpptjeningDetaljer')

    opptjeningDetaljerComponents.forEach((component) => {
      expect(component).toHaveAttribute('data-kap19-length', '2')
      expect(component).toHaveAttribute('data-kap20-length', '2')
    })
  })

  it('rendrer komponenter i riktig rekkefølge for desktop', () => {
    const { container } = render(
      <AlderspensjonDetaljerGrunnlag {...defaultProps} />
    )

    const desktopContainer = container.querySelector(
      '[class*="beregningsdetaljerForOvergangskullDesktopOnly"] .navds-stack'
    )
    const children = Array.from(desktopContainer?.children || [])

    expect(children[0]).toHaveAttribute('data-testid', 'AlderspensjonDetaljer')
    expect(children[1]).toHaveAttribute('data-testid', 'OpptjeningDetaljer')
  })

  it('rendrer komponenter i riktig rekkefølge for mobil', () => {
    const { container } = render(
      <AlderspensjonDetaljerGrunnlag {...defaultProps} />
    )

    const mobileContainer = container.querySelector(
      '[class*="beregningsdetaljerForOvergangskullMobileOnly"] .navds-stack'
    )
    const children = Array.from(mobileContainer?.children || [])

    expect(children[0]).toHaveAttribute('data-testid', 'AlderspensjonDetaljer')
    expect(children[1]).toHaveAttribute('data-testid', 'OpptjeningDetaljer')
  })

  it('håndterer tomme lister som props', () => {
    const emptyProps = {
      alderspensjonDetaljerListe: [],
      opptjeningKap19Liste: [],
      opptjeningKap20Liste: [],
      hasPre2025OffentligAfpUttaksalder: false,
    }

    render(<AlderspensjonDetaljerGrunnlag {...emptyProps} />)

    expect(screen.getAllByTestId('AlderspensjonDetaljer')).toHaveLength(2)
    expect(screen.getAllByTestId('OpptjeningDetaljer')).toHaveLength(2)
  })

  it('håndterer ulike verdier for hasPre2025OffentligAfpUttaksalder', () => {
    const propsWithFalse = {
      ...defaultProps,
      hasPre2025OffentligAfpUttaksalder: false,
    }

    render(<AlderspensjonDetaljerGrunnlag {...propsWithFalse} />)

    const alderspensjonDetaljerComponents = screen.getAllByTestId(
      'AlderspensjonDetaljer'
    )

    alderspensjonDetaljerComponents.forEach((component) => {
      expect(component).toHaveAttribute('data-has-pre2025-afp', 'false')
    })
  })
})
