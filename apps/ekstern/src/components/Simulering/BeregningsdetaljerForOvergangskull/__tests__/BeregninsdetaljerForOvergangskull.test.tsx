import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import { BeregningsdetaljerForOvergangskull } from '../BeregningsdetaljerForOvergangskull'
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
  }: {
    opptjeningKap19Liste: DetaljRad[][]
    opptjeningKap20Liste: DetaljRad[][]
  }) => (
    <div
      data-testid="OpptjeningDetaljer"
      data-kap19-length={opptjeningKap19Liste.length}
      data-kap20-length={opptjeningKap20Liste.length}
    >
      OpptjeningDetaljer Mock
    </div>
  ),
}))

vi.mock('../Felles/AfpDetaljer', () => ({
  AfpDetaljer: ({
    afpPrivatDetaljerListe,
    afpOffentligDetaljerListe,
    opptjeningPre2025OffentligAfpListe,
  }: {
    afpPrivatDetaljerListe?: DetaljRad[][]
    afpOffentligDetaljerListe?: DetaljRad[]
    opptjeningPre2025OffentligAfpListe?: DetaljRad[]
  }) => (
    <div
      data-testid="AfpDetaljer"
      data-afp-privat-length={afpPrivatDetaljerListe?.length ?? ''}
      data-afp-offentlig-length={afpOffentligDetaljerListe?.length ?? ''}
      data-pre2025-length={opptjeningPre2025OffentligAfpListe?.length ?? ''}
    >
      AfpDetaljer Mock
    </div>
  ),
}))

vi.mock('../hooks', () => ({
  useBeregningsdetaljer: () => ({
    alderspensjonDetaljerListe: [
      [
        { tekst: 'Trygdetid', verdi: 40 },
        { tekst: 'Sluttpoengtall', verdi: 6.5 },
      ],
      [{ tekst: 'Pensjonsbeholdning', verdi: '500000 kr' }],
    ],
    pre2025OffentligAfpDetaljerListe: [
      { tekst: 'Grunnpensjon (kap. 19)', verdi: '12 000 kr' },
      { tekst: 'Sum månedlig alderspensjon', verdi: '28 000 kr' },
    ],
    opptjeningKap19Liste: [
      { tekst: 'Andelsbrøk', verdi: '10/10' },
      { tekst: 'Sluttpoengtall', verdi: 6.5 },
    ],
    opptjeningKap20Liste: [
      { tekst: 'Pensjonsbeholdning før uttak', verdi: '500000 kr' },
      { tekst: 'Trygdetid', verdi: 40 },
    ],
    afpPrivatDetaljerListe: [
      [
        { tekst: 'AFP grad', verdi: 100 },
        { tekst: 'Kompensasjonsgrad', verdi: 0.76 },
      ],
    ],
    opptjeningPre2025OffentligAfpListe: [
      { tekst: 'AFP grad', verdi: 100 },
      { tekst: 'Sluttpoengtall', verdi: 6.5 },
    ],
  }),
}))

describe('BeregningsdetaljerForOvergangskull', () => {
  const defaultProps = {
    alderspensjonListe: [] as AlderspensjonPensjonsberegning[],
    afpPrivatListe: [] as AfpPrivatPensjonsberegning[],
    pre2025OffentligAfp: undefined as
      | pre2025OffentligPensjonsberegning
      | undefined,
  }

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('rendrer wrapper med korrekt test id', () => {
    render(<BeregningsdetaljerForOvergangskull {...defaultProps} />)
    expect(
      screen.getByTestId('beregningsdetaljer-for-overgangskull')
    ).toBeVisible()
  })

  it('rendrer både desktop og mobil versjon med riktig CSS klasser', () => {
    const { container } = render(
      <BeregningsdetaljerForOvergangskull {...defaultProps} />
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
    render(<BeregningsdetaljerForOvergangskull {...defaultProps} />)

    const desktopContainer = screen
      .getByTestId('beregningsdetaljer-for-overgangskull')
      .querySelector('[class*="beregningsdetaljerForOvergangskullDesktopOnly"]')

    expect(desktopContainer?.firstChild).toHaveClass('navds-stack')
  })

  it('rendrer VStack for mobil versjon', () => {
    render(<BeregningsdetaljerForOvergangskull {...defaultProps} />)

    const mobileContainer = screen
      .getByTestId('beregningsdetaljer-for-overgangskull')
      .querySelector('[class*="beregningsdetaljerForOvergangskullMobileOnly"]')

    expect(mobileContainer?.firstChild).toHaveClass('navds-stack')
  })

  it('rendrer alle tre detalj komponenter', () => {
    render(<BeregningsdetaljerForOvergangskull {...defaultProps} />)

    // Skal rendre komponenter to ganger (desktop + mobil)
    expect(screen.getAllByTestId('AlderspensjonDetaljer')).toHaveLength(2)
    expect(screen.getAllByTestId('OpptjeningDetaljer')).toHaveLength(2)
    expect(screen.getAllByTestId('AfpDetaljer')).toHaveLength(2)
  })

  it('sender korrekte props til AlderspensjonDetaljer', () => {
    render(<BeregningsdetaljerForOvergangskull {...defaultProps} />)

    const alderspensjonDetaljerComponents = screen.getAllByTestId(
      'AlderspensjonDetaljer'
    )

    alderspensjonDetaljerComponents.forEach((component) => {
      expect(component).toHaveAttribute('data-objekter-length', '2')
      expect(component).toHaveAttribute('data-has-pre2025-afp', 'true')
    })
  })

  it('sender korrekte props til OpptjeningDetaljer', () => {
    render(<BeregningsdetaljerForOvergangskull {...defaultProps} />)

    const opptjeningDetaljerComponents =
      screen.getAllByTestId('OpptjeningDetaljer')

    opptjeningDetaljerComponents.forEach((component) => {
      expect(component).toHaveAttribute('data-kap19-length', '2')
      expect(component).toHaveAttribute('data-kap20-length', '2')
    })
  })

  it('sender korrekte props til AfpDetaljer', () => {
    render(<BeregningsdetaljerForOvergangskull {...defaultProps} />)

    const afpDetaljerComponents = screen.getAllByTestId('AfpDetaljer')

    afpDetaljerComponents.forEach((component) => {
      expect(component).toHaveAttribute('data-afp-privat-length', '1')
      expect(component).toHaveAttribute('data-pre2025-length', '2')
    })
  })

  it('rendrer komponenter i riktig rekkefølge for desktop', () => {
    const { container } = render(
      <BeregningsdetaljerForOvergangskull {...defaultProps} />
    )

    const desktopContainer = container.querySelector(
      '[class*="beregningsdetaljerForOvergangskullDesktopOnly"] .navds-stack'
    )
    const children = Array.from(desktopContainer?.children || [])

    expect(children[0]).toHaveAttribute('data-testid', 'AlderspensjonDetaljer')
    expect(children[1]).toHaveAttribute('data-testid', 'OpptjeningDetaljer')
    expect(children[2]).toHaveAttribute('data-testid', 'AfpDetaljer')
  })

  it('rendrer komponenter i riktig rekkefølge for mobil', () => {
    const { container } = render(
      <BeregningsdetaljerForOvergangskull {...defaultProps} />
    )

    const mobileContainer = container.querySelector(
      '[class*="beregningsdetaljerForOvergangskullMobileOnly"] .navds-stack'
    )
    const children = Array.from(mobileContainer?.children || [])

    expect(children[0]).toHaveAttribute('data-testid', 'AlderspensjonDetaljer')
    expect(children[1]).toHaveAttribute('data-testid', 'OpptjeningDetaljer')
    expect(children[2]).toHaveAttribute('data-testid', 'AfpDetaljer')
  })

  it('sender korrekte props til AlderspensjonDetaljer og AfpDetaljer', () => {
    render(<BeregningsdetaljerForOvergangskull {...defaultProps} />)

    const alderspensjonDetaljerComponents = screen.getAllByTestId(
      'AlderspensjonDetaljer'
    )

    alderspensjonDetaljerComponents.forEach((component) => {
      expect(component).toHaveAttribute('data-objekter-length', '2')
      expect(component).toHaveAttribute('data-has-pre2025-afp', 'true')
    })

    const afpDetaljerComponents = screen.getAllByTestId('AfpDetaljer')

    afpDetaljerComponents.forEach((component) => {
      expect(component).toHaveAttribute('data-pre2025-length', '2')
    })
  })

  it('håndterer valgfrie props', () => {
    const propsWithData = {
      alderspensjonListe: [
        {} as AlderspensjonPensjonsberegning,
      ] as AlderspensjonPensjonsberegning[],
      afpPrivatListe: [
        {} as AfpPrivatPensjonsberegning,
      ] as AfpPrivatPensjonsberegning[],
      pre2025OffentligAfp: {} as pre2025OffentligPensjonsberegning,
    }

    render(<BeregningsdetaljerForOvergangskull {...propsWithData} />)

    expect(screen.getAllByTestId('AlderspensjonDetaljer')).toHaveLength(2)
    expect(screen.getAllByTestId('OpptjeningDetaljer')).toHaveLength(2)
    expect(screen.getAllByTestId('AfpDetaljer')).toHaveLength(2)
  })

  it('håndterer tomme lister som props', () => {
    const emptyProps = {
      alderspensjonListe: [] as AlderspensjonPensjonsberegning[],
      afpPrivatListe: [] as AfpPrivatPensjonsberegning[],
      pre2025OffentligAfp: undefined as
        | pre2025OffentligPensjonsberegning
        | undefined,
    }

    render(<BeregningsdetaljerForOvergangskull {...emptyProps} />)

    expect(screen.getAllByTestId('AlderspensjonDetaljer')).toHaveLength(2)
    expect(screen.getAllByTestId('OpptjeningDetaljer')).toHaveLength(2)
    expect(screen.getAllByTestId('AfpDetaljer')).toHaveLength(2)
  })
})
