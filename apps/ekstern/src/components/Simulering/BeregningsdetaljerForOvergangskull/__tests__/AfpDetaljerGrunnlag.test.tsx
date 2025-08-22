import { vi } from 'vitest'

import { render, screen } from '@/test-utils'

import { AfpDetaljerGrunnlag } from '../AfpDetaljerGrunnlag'
import { DetaljRad } from '../hooks'

// Mock the child components
vi.mock('../Felles/AfpDetaljer', () => ({
  AfpDetaljer: ({
    afpDetaljForValgtUttak,
  }: {
    afpDetaljForValgtUttak?: {
      afpPrivat?: DetaljRad[]
      afpOffentlig?: DetaljRad[]
      pre2025OffentligAfp?: DetaljRad[]
      opptjeningPre2025OffentligAfp?: DetaljRad[]
    }
  }) => (
    <div
      data-testid="AfpDetaljer"
      data-afp-privat-length={afpDetaljForValgtUttak?.afpPrivat?.length ?? ''}
      data-afp-offentlig-length={
        afpDetaljForValgtUttak?.afpOffentlig?.length ?? ''
      }
      data-pre2025-afp-length={
        afpDetaljForValgtUttak?.pre2025OffentligAfp?.length ?? ''
      }
      data-pre2025-opptjening-length={
        afpDetaljForValgtUttak?.opptjeningPre2025OffentligAfp?.length ?? ''
      }
    >
      AfpDetaljer Mock
    </div>
  ),
}))

describe('AfpDetaljerGrunnlag', () => {
  const defaultProps = {
    afpDetaljerListe: [
      {
        afpPrivat: [
          { tekst: 'AFP grad', verdi: 100 },
          { tekst: 'Kompensasjonsgrad', verdi: 0.76 },
        ],
        afpOffentlig: [
          { tekst: 'AFP-tillegg', verdi: '5 000 kr' },
          { tekst: 'Sum AFP', verdi: '15 000 kr' },
        ],
        pre2025OffentligAfp: [
          { tekst: 'Grunnpensjon (kap. 19)', verdi: '12 000 kr' },
          { tekst: 'Sum alderspensjon', verdi: '28 000 kr' },
        ],
        opptjeningPre2025OffentligAfp: [
          { tekst: 'AFP grad', verdi: 100 },
          { tekst: 'Sluttpoengtall', verdi: 6.5 },
        ],
      },
    ],
    alderspensjonColumnsCount: 2,
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

    // AfpDetaljerGrunnlag doesn't have desktop/mobile classes - AfpDetaljer itself handles this
    const desktopDiv = container.querySelector(
      '[class*="beregningsdetaljerForOvergangskullDesktopOnly"]'
    )
    const mobileDiv = container.querySelector(
      '[class*="beregningsdetaljerForOvergangskullMobileOnly"]'
    )

    // The CSS classes should be inside the AfpDetaljer component, not in the wrapper
    expect(desktopDiv).not.toBeInTheDocument()
    expect(mobileDiv).not.toBeInTheDocument()
  })

  it('rendrer HStack for desktop versjon', () => {
    render(<AfpDetaljerGrunnlag {...defaultProps} />)

    // AfpDetaljerGrunnlag doesn't have desktop/mobile structure - that's handled by AfpDetaljer
    const wrapper = screen.getByTestId('beregningsdetaljer-for-overgangskull')
    expect(wrapper).toBeInTheDocument()
    expect(wrapper).toHaveClass('navds-stack')
  })

  it('rendrer VStack for mobil versjon', () => {
    render(<AfpDetaljerGrunnlag {...defaultProps} />)

    // AfpDetaljerGrunnlag doesn't have desktop/mobile structure - that's handled by AfpDetaljer
    const wrapper = screen.getByTestId('beregningsdetaljer-for-overgangskull')
    expect(wrapper).toBeInTheDocument()
    expect(wrapper).toHaveClass('navds-stack')
  })

  it('rendrer AfpDetaljer komponenten', () => {
    render(<AfpDetaljerGrunnlag {...defaultProps} />)

    // AfpDetaljerGrunnlag renders AfpDetaljer once per item in the list
    expect(screen.getAllByTestId('AfpDetaljer')).toHaveLength(1)
  })

  it('sender korrekte props til AfpDetaljer', () => {
    render(<AfpDetaljerGrunnlag {...defaultProps} />)

    const afpDetaljerComponents = screen.getAllByTestId('AfpDetaljer')

    afpDetaljerComponents.forEach((component) => {
      expect(component).toHaveAttribute('data-afp-privat-length', '2')
      expect(component).toHaveAttribute('data-afp-offentlig-length', '2')
      expect(component).toHaveAttribute('data-pre2025-afp-length', '2')
      expect(component).toHaveAttribute('data-pre2025-opptjening-length', '2')
    })
  })

  it('håndterer valgfrie props som undefined', () => {
    const minimalProps = {
      afpDetaljerListe: [
        {
          afpPrivat: [],
          afpOffentlig: [],
          pre2025OffentligAfp: [],
          opptjeningPre2025OffentligAfp: [],
        },
      ],
      alderspensjonColumnsCount: 0,
    }

    render(<AfpDetaljerGrunnlag {...minimalProps} />)

    const afpDetaljerComponents = screen.getAllByTestId('AfpDetaljer')

    afpDetaljerComponents.forEach((component) => {
      expect(component).toHaveAttribute('data-afp-privat-length', '0')
      expect(component).toHaveAttribute('data-afp-offentlig-length', '0')
      expect(component).toHaveAttribute('data-pre2025-afp-length', '0')
      expect(component).toHaveAttribute('data-pre2025-opptjening-length', '0')
    })
  })

  it('håndterer tomme lister som props', () => {
    const emptyProps = {
      afpDetaljerListe: [
        {
          afpPrivat: [],
          afpOffentlig: [],
          pre2025OffentligAfp: [],
          opptjeningPre2025OffentligAfp: [],
        },
      ],
      alderspensjonColumnsCount: 0,
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
    expect(screen.getAllByTestId('AfpDetaljer')).toHaveLength(1)
    expect(
      screen.queryByTestId('AlderspensjonDetaljer')
    ).not.toBeInTheDocument()
    expect(screen.queryByTestId('OpptjeningDetaljer')).not.toBeInTheDocument()
  })

  it('rendrer med delvis definerte props', () => {
    const partialProps = {
      afpDetaljerListe: [
        {
          afpPrivat: [{ tekst: 'Test AFP privat', verdi: '1000 kr' }],
          afpOffentlig: [],
          pre2025OffentligAfp: [{ tekst: 'Test pre2025', verdi: 100 }],
          opptjeningPre2025OffentligAfp: [],
        },
      ],
      alderspensjonColumnsCount: 1,
    }

    render(<AfpDetaljerGrunnlag {...partialProps} />)

    const afpDetaljerComponents = screen.getAllByTestId('AfpDetaljer')

    afpDetaljerComponents.forEach((component) => {
      expect(component).toHaveAttribute('data-afp-privat-length', '1')
      expect(component).toHaveAttribute('data-afp-offentlig-length', '0')
      expect(component).toHaveAttribute('data-pre2025-afp-length', '1')
      expect(component).toHaveAttribute('data-pre2025-opptjening-length', '0')
    })
  })
})
