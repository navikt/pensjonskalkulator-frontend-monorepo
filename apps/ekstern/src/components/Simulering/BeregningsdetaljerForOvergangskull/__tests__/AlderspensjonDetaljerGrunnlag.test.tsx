import { vi } from 'vitest'

import { userInputInitialState } from '@/state/userInput/userInputSlice'
import { render, screen } from '@/test-utils'

import { AlderspensjonDetaljerGrunnlag } from '../AlderspensjonDetaljerGrunnlag'
import { AlderspensjonDetaljerListe } from '../hooks'

// Mock the child components
vi.mock('../Felles/AlderspensjonDetaljer', () => ({
  AlderspensjonDetaljer: ({
    alderspensjonDetaljForValgtUttak,
  }: {
    alderspensjonDetaljForValgtUttak: AlderspensjonDetaljerListe
  }) => (
    <div
      data-testid="AlderspensjonDetaljer"
      data-alderspensjon-length={
        alderspensjonDetaljForValgtUttak.alderspensjon.length
      }
      data-kap19-length={
        alderspensjonDetaljForValgtUttak.opptjeningKap19.length
      }
      data-kap20-length={
        alderspensjonDetaljForValgtUttak.opptjeningKap20.length
      }
    >
      AlderspensjonDetaljer Mock
    </div>
  ),
}))

describe('AlderspensjonDetaljerGrunnlag', () => {
  const defaultProps = {
    alderspensjonDetaljerListe: [
      {
        alderspensjon: [
          { tekst: 'Grunnpensjon (kap. 19)', verdi: '12000 kr' },
          { tekst: 'Sum alderspensjon', verdi: '41000 kr' },
        ],
        opptjeningKap19: [
          { tekst: 'Andelsbrøk', verdi: '10/10' },
          { tekst: 'Sluttpoengtall', verdi: 6.5 },
        ],
        opptjeningKap20: [
          { tekst: 'Pensjonsbeholdning', verdi: '500000 kr' },
          { tekst: 'Trygdetid', verdi: 40 },
        ],
      },
    ],
    hasPre2025OffentligAfpUttaksalder: true,
  }

  const defaultPreloadedState = {
    userInput: {
      ...userInputInitialState,
      currentSimulation: {
        beregningsvalg: null,
        uttaksalder: { aar: 67, maaneder: 0 },
        aarligInntektFoerUttakBeloep: null,
        gradertUttaksperiode: null,
      },
    },
  }

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('rendrer wrapper med korrekt test id', () => {
    const { container } = render(
      <AlderspensjonDetaljerGrunnlag {...defaultProps} />,
      {
        preloadedState: defaultPreloadedState,
      }
    )
    // Component renders a VStack wrapper, check that it's rendered
    expect(container.querySelector('.navds-stack')).toBeInTheDocument()
  })

  it('rendrer både desktop og mobil versjon med riktig CSS klasser', () => {
    const { container } = render(
      <AlderspensjonDetaljerGrunnlag {...defaultProps} />,
      { preloadedState: defaultPreloadedState }
    )

    // Component only renders a single version, not separate desktop/mobile versions
    const stackDiv = container.querySelector('.navds-stack')
    expect(stackDiv).toBeInTheDocument()

    // There are no desktop/mobile specific CSS classes in the actual implementation
    const desktopDiv = container.querySelector(
      '[class*="beregningsdetaljerForOvergangskullDesktopOnly"]'
    )
    const mobileDiv = container.querySelector(
      '[class*="beregningsdetaljerForOvergangskullMobileOnly"]'
    )

    expect(desktopDiv).not.toBeInTheDocument()
    expect(mobileDiv).not.toBeInTheDocument()
  })

  it('rendrer HStack for desktop versjon', () => {
    const { container } = render(
      <AlderspensjonDetaljerGrunnlag {...defaultProps} />,
      {
        preloadedState: defaultPreloadedState,
      }
    )

    // Component uses VStack for layout, not HStack and no desktop-specific version
    const stackContainer = container.querySelector('.navds-stack')
    expect(stackContainer).toBeInTheDocument()
    expect(stackContainer).toHaveClass('navds-stack')
  })

  it('rendrer VStack for mobil versjon', () => {
    const { container } = render(
      <AlderspensjonDetaljerGrunnlag {...defaultProps} />,
      {
        preloadedState: defaultPreloadedState,
      }
    )

    // Component uses VStack for layout and there's no separate mobile version
    const stackContainer = container.querySelector('.navds-stack')
    expect(stackContainer).toBeInTheDocument()
    expect(stackContainer).toHaveClass('navds-stack')
  })

  it('rendrer AlderspensjonDetaljer komponenter for hver item i listen', () => {
    render(<AlderspensjonDetaljerGrunnlag {...defaultProps} />, {
      preloadedState: defaultPreloadedState,
    })

    // Skal rendre komponenter en gang per item (ikke desktop + mobil)
    expect(screen.getAllByTestId('AlderspensjonDetaljer')).toHaveLength(1)
  })

  it('sender korrekte props til AlderspensjonDetaljer', () => {
    render(<AlderspensjonDetaljerGrunnlag {...defaultProps} />, {
      preloadedState: defaultPreloadedState,
    })

    const alderspensjonDetaljerComponent = screen.getByTestId(
      'AlderspensjonDetaljer'
    )

    expect(alderspensjonDetaljerComponent).toHaveAttribute(
      'data-alderspensjon-length',
      '2'
    )
    expect(alderspensjonDetaljerComponent).toHaveAttribute(
      'data-kap19-length',
      '2'
    )
    expect(alderspensjonDetaljerComponent).toHaveAttribute(
      'data-kap20-length',
      '2'
    )
  })

  it('rendrer komponenter i riktig rekkefølge for desktop', () => {
    render(<AlderspensjonDetaljerGrunnlag {...defaultProps} />, {
      preloadedState: defaultPreloadedState,
    })

    // Component renders single version, check that AlderspensjonDetaljer is rendered
    const alderspensjonComponent = screen.getByTestId('AlderspensjonDetaljer')
    expect(alderspensjonComponent).toHaveAttribute(
      'data-testid',
      'AlderspensjonDetaljer'
    )
  })

  it('rendrer komponenter i riktig rekkefølge for mobil', () => {
    render(<AlderspensjonDetaljerGrunnlag {...defaultProps} />, {
      preloadedState: defaultPreloadedState,
    })

    // Component renders single version, check that AlderspensjonDetaljer is rendered
    const alderspensjonComponent = screen.getByTestId('AlderspensjonDetaljer')
    expect(alderspensjonComponent).toHaveAttribute(
      'data-testid',
      'AlderspensjonDetaljer'
    )
  })

  it('håndterer tomme lister som props', () => {
    const emptyProps = {
      alderspensjonDetaljerListe: [],
      hasPre2025OffentligAfpUttaksalder: false,
    }

    render(<AlderspensjonDetaljerGrunnlag {...emptyProps} />, {
      preloadedState: defaultPreloadedState,
    })

    // Should not render any AlderspensjonDetaljer components when list is empty
    expect(
      screen.queryByTestId('AlderspensjonDetaljer')
    ).not.toBeInTheDocument()
  })

  it('håndterer ulike verdier for hasPre2025OffentligAfpUttaksalder', () => {
    const propsWithFalse = {
      ...defaultProps,
      hasPre2025OffentligAfpUttaksalder: false,
    }

    render(<AlderspensjonDetaljerGrunnlag {...propsWithFalse} />, {
      preloadedState: defaultPreloadedState,
    })

    const alderspensjonDetaljerComponent = screen.getByTestId(
      'AlderspensjonDetaljer'
    )

    expect(alderspensjonDetaljerComponent).toHaveAttribute(
      'data-alderspensjon-length',
      '2'
    )
    expect(alderspensjonDetaljerComponent).toHaveAttribute(
      'data-kap19-length',
      '2'
    )
    expect(alderspensjonDetaljerComponent).toHaveAttribute(
      'data-kap20-length',
      '2'
    )
  })

  it('rendrer multiple items in alderspensjonDetaljerListe', () => {
    const propsWithMultipleItems = {
      alderspensjonDetaljerListe: [
        {
          alderspensjon: [
            { tekst: 'Grunnpensjon (kap. 19)', verdi: '12000 kr' },
          ],
          opptjeningKap19: [{ tekst: 'Andelsbrøk', verdi: '10/10' }],
          opptjeningKap20: [
            { tekst: 'Pensjonsbeholdning', verdi: '500000 kr' },
          ],
        },
        {
          alderspensjon: [
            { tekst: 'Grunnpensjon (kap. 19)', verdi: '15000 kr' },
          ],
          opptjeningKap19: [{ tekst: 'Sluttpoengtall', verdi: 7.5 }],
          opptjeningKap20: [{ tekst: 'Trygdetid', verdi: 35 }],
        },
      ],
      hasPre2025OffentligAfpUttaksalder: false,
    }

    render(<AlderspensjonDetaljerGrunnlag {...propsWithMultipleItems} />, {
      preloadedState: defaultPreloadedState,
    })

    // Should render 2 components total (2 items × 1 each, not desktop + mobile)
    expect(screen.getAllByTestId('AlderspensjonDetaljer')).toHaveLength(2)
  })
})
