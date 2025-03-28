import { describe, expect, it, vi } from 'vitest'

import { Beregningsvalg } from '../Beregningsvalg'
import { fulfilledGetPersonMedOekteAldersgrenser } from '@/mocks/mockedRTKQueryApiCalls'
import { userInputInitialState } from '@/state/userInput/userInputSlice'
import { render, screen } from '@/test-utils'

describe('Beregningsvalg', () => {
  const mockOnChange = vi.fn()

  const defaultProps = {
    localBeregningsTypeRadio: 'uten_afp' as const,
    onChange: mockOnChange,
  }

  const renderWithDefaultState = (
    props?: Partial<React.ComponentProps<typeof Beregningsvalg>>
  ) => {
    return render(<Beregningsvalg {...defaultProps} {...props} />, {
      preloadedState: {
        api: {
          // @ts-ignore
          queries: {
            ...fulfilledGetPersonMedOekteAldersgrenser,
          },
        },
        userInput: {
          ...userInputInitialState,
        },
      },
    })
  }

  const nedreAldersgrense =
    fulfilledGetPersonMedOekteAldersgrenser['getPerson(undefined)'].data
      .pensjoneringAldre.nedreAldersgrense

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('Viser begge radio valgene', () => {
      renderWithDefaultState()

      expect(screen.getByTestId('uten_afp')).toBeInTheDocument()
      expect(screen.getByTestId('med_afp')).toBeInTheDocument()
    })

    it('Viser riktig label på radio valgene', () => {
      renderWithDefaultState()

      expect(
        screen.getByText(
          'beregning.avansert.rediger.radio.beregningsvalg.uten_afp.label'
        )
      ).toBeInTheDocument()
      expect(
        screen.getByText('Alderspensjon og AFP, uten uføretrygd fra')
      ).toBeInTheDocument()
      expect(
        screen.getByText('Alderspensjon og AFP, uten uføretrygd fra')
      ).toHaveTextContent(`${nedreAldersgrense.aar}`)
    })
  })

  describe('Radio valg', () => {
    it('Håndterer valg av "uten_afp" korrekt', () => {
      renderWithDefaultState()

      const utenAfpRadio = screen.getByTestId('uten_afp')
      expect(utenAfpRadio).toHaveAttribute('value', 'uten_afp')
      expect(utenAfpRadio).toBeChecked()
    })

    it('Håndterer valg av "med_afp" korrekt', () => {
      renderWithDefaultState({ localBeregningsTypeRadio: 'med_afp' })

      const medAfpRadio = screen.getByTestId('med_afp')
      expect(medAfpRadio).toHaveAttribute('value', 'med_afp')
      expect(medAfpRadio).toBeChecked()
    })

    it('Håndterer nullstilling korrekt', () => {
      const { rerender } = renderWithDefaultState({
        localBeregningsTypeRadio: 'med_afp',
      })
      expect(screen.getByTestId('med_afp')).toBeChecked()

      rerender(
        <Beregningsvalg {...defaultProps} localBeregningsTypeRadio={null} />
      )
      expect(screen.getByTestId('med_afp')).not.toBeChecked()
      expect(screen.getByTestId('uten_afp')).not.toBeChecked()
    })
  })

  describe('Beskrivelses seksjon', () => {
    it('Viser ikke AFP beskrivelse når "uten_afp" er valgt', () => {
      renderWithDefaultState()

      expect(
        screen.queryByText('Alderspensjon og AFP fra')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText(/er laveste uttaksalder/)
      ).not.toBeInTheDocument()
    })

    it('Viser AFP beskrivelse når "med_afp" er valgt', () => {
      renderWithDefaultState({ localBeregningsTypeRadio: 'med_afp' })

      expect(screen.getByText('Alderspensjon og AFP fra')).toBeInTheDocument()
      expect(screen.getByText(/er laveste uttaksalder/)).toBeInTheDocument()
    })

    it('Sjekk at nedrealder blir vist når man har valgt med_afp', () => {
      renderWithDefaultState({ localBeregningsTypeRadio: 'med_afp' })

      expect(screen.getByText('Alderspensjon og AFP fra')).toHaveTextContent(
        `${nedreAldersgrense.aar}`
      )
    })
  })
})
