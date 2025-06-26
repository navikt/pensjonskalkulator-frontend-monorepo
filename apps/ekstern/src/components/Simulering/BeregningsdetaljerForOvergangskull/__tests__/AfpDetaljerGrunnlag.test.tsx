import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import { AfpDetaljerGrunnlag } from '../AfpDetaljerGrunnlag'
import { DetaljRad } from '../hooks'

// Mock the child components
vi.mock('../Felles/AfpDetaljer', () => ({
  AfpDetaljer: ({
    afpPrivatDetaljerListe,
    afpOffentligDetaljerListe,
    pre2025OffentligAfpDetaljerListe,
    opptjeningPre2025OffentligAfpListe,
  }: {
    afpPrivatDetaljerListe?: DetaljRad[][]
    afpOffentligDetaljerListe?: DetaljRad[]
    pre2025OffentligAfpDetaljerListe?: DetaljRad[]
    opptjeningPre2025OffentligAfpListe?: DetaljRad[]
  }) => (
    <div
      data-testid="AfpDetaljer"
      data-afp-privat-length={afpPrivatDetaljerListe?.length ?? ''}
      data-afp-offentlig-length={afpOffentligDetaljerListe?.length ?? ''}
      data-pre2025-afp-length={pre2025OffentligAfpDetaljerListe?.length ?? ''}
      data-pre2025-opptjening-length={
        opptjeningPre2025OffentligAfpListe?.length ?? ''
      }
    >
      AfpDetaljer Mock
    </div>
  ),
}))

describe('AfpDetaljerGrunnlag', () => {
  const defaultProps = {
    afpPrivatDetaljerListe: [
      [
        { tekst: 'AFP grad', verdi: 100 },
        { tekst: 'Kompensasjonsgrad', verdi: 0.76 },
      ],
    ],
    afpOffentligDetaljerListe: [
      { tekst: 'AFP-tillegg', verdi: '5 000 kr' },
      { tekst: 'Sum AFP', verdi: '15 000 kr' },
    ],
    pre2025OffentligAfpDetaljerListe: [
      { tekst: 'Grunnpensjon (kap. 19)', verdi: '12 000 kr' },
      { tekst: 'Sum alderspensjon', verdi: '28 000 kr' },
    ],
    opptjeningPre2025OffentligAfpListe: [
      { tekst: 'AFP grad', verdi: 100 },
      { tekst: 'Sluttpoengtall', verdi: 6.5 },
    ],
  }

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('rendrer wrapper med korrekt test id', () => {
    render(<AfpDetaljerGrunnlag {...defaultProps} />)
    expect(
      screen.getByTestId('beregningsdetaljer-for-overgangskull')
    ).toBeVisible()
  })

  it('rendrer både desktop og mobil versjon med riktig CSS klasser', () => {
    const { container } = render(<AfpDetaljerGrunnlag {...defaultProps} />)

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
    render(<AfpDetaljerGrunnlag {...defaultProps} />)

    const desktopContainer = screen
      .getByTestId('beregningsdetaljer-for-overgangskull')
      .querySelector('[class*="beregningsdetaljerForOvergangskullDesktopOnly"]')

    expect(desktopContainer?.firstChild).toHaveClass('navds-stack')
  })

  it('rendrer VStack for mobil versjon', () => {
    render(<AfpDetaljerGrunnlag {...defaultProps} />)

    const mobileContainer = screen
      .getByTestId('beregningsdetaljer-for-overgangskull')
      .querySelector('[class*="beregningsdetaljerForOvergangskullMobileOnly"]')

    expect(mobileContainer?.firstChild).toHaveClass('navds-stack')
  })

  it('rendrer AfpDetaljer komponenten', () => {
    render(<AfpDetaljerGrunnlag {...defaultProps} />)

    // Skal rendre komponenter to ganger (desktop + mobil)
    expect(screen.getAllByTestId('AfpDetaljer')).toHaveLength(2)
  })

  it('sender korrekte props til AfpDetaljer', () => {
    render(<AfpDetaljerGrunnlag {...defaultProps} />)

    const afpDetaljerComponents = screen.getAllByTestId('AfpDetaljer')

    afpDetaljerComponents.forEach((component) => {
      expect(component).toHaveAttribute('data-afp-privat-length', '1')
      expect(component).toHaveAttribute('data-afp-offentlig-length', '2')
      expect(component).toHaveAttribute('data-pre2025-afp-length', '2')
      expect(component).toHaveAttribute('data-pre2025-opptjening-length', '2')
    })
  })

  it('håndterer valgfrie props som undefined', () => {
    const minimalProps = {
      afpPrivatDetaljerListe: undefined,
      afpOffentligDetaljerListe: undefined,
      pre2025OffentligAfpDetaljerListe: undefined,
      opptjeningPre2025OffentligAfpListe: undefined,
    }

    render(<AfpDetaljerGrunnlag {...minimalProps} />)

    const afpDetaljerComponents = screen.getAllByTestId('AfpDetaljer')

    afpDetaljerComponents.forEach((component) => {
      expect(component).toHaveAttribute('data-afp-privat-length', '')
      expect(component).toHaveAttribute('data-afp-offentlig-length', '')
      expect(component).toHaveAttribute('data-pre2025-afp-length', '')
      expect(component).toHaveAttribute('data-pre2025-opptjening-length', '')
    })
  })

  it('håndterer tomme lister som props', () => {
    const emptyProps = {
      afpPrivatDetaljerListe: [],
      afpOffentligDetaljerListe: [],
      pre2025OffentligAfpDetaljerListe: [],
      opptjeningPre2025OffentligAfpListe: [],
    }

    render(<AfpDetaljerGrunnlag {...emptyProps} />)

    const afpDetaljerComponents = screen.getAllByTestId('AfpDetaljer')

    afpDetaljerComponents.forEach((component) => {
      expect(component).toHaveAttribute('data-afp-privat-length', '0')
      expect(component).toHaveAttribute('data-afp-offentlig-length', '0')
      expect(component).toHaveAttribute('data-pre2025-afp-length', '0')
      expect(component).toHaveAttribute('data-pre2025-opptjening-length', '0')
    })
  })

  it('rendrer kun AfpDetaljer komponent (ikke andre)', () => {
    render(<AfpDetaljerGrunnlag {...defaultProps} />)

    // Skal bare rendre AfpDetaljer, ikke AlderspensjonDetaljer eller OpptjeningDetaljer
    expect(screen.getAllByTestId('AfpDetaljer')).toHaveLength(2)
    expect(
      screen.queryByTestId('AlderspensjonDetaljer')
    ).not.toBeInTheDocument()
    expect(screen.queryByTestId('OpptjeningDetaljer')).not.toBeInTheDocument()
  })

  it('rendrer med delvis definerte props', () => {
    const partialProps = {
      afpPrivatDetaljerListe: [
        [{ tekst: 'Test AFP privat', verdi: '1000 kr' }],
      ],
      afpOffentligDetaljerListe: undefined,
      pre2025OffentligAfpDetaljerListe: [{ tekst: 'Test pre2025', verdi: 100 }],
      opptjeningPre2025OffentligAfpListe: undefined,
    }

    render(<AfpDetaljerGrunnlag {...partialProps} />)

    const afpDetaljerComponents = screen.getAllByTestId('AfpDetaljer')

    afpDetaljerComponents.forEach((component) => {
      expect(component).toHaveAttribute('data-afp-privat-length', '1')
      expect(component).toHaveAttribute('data-afp-offentlig-length', '')
      expect(component).toHaveAttribute('data-pre2025-afp-length', '1')
      expect(component).toHaveAttribute('data-pre2025-opptjening-length', '')
    })
  })
})
