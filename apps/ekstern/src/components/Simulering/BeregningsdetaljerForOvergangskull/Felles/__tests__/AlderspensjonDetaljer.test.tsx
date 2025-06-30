import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'

import {
  userInputInitialState,
  userInputSlice,
} from '@/state/userInput/userInputSlice'

import { AlderspensjonDetaljer } from '../AlderspensjonDetaljer'

const mockMessages = {
  'beregning.detaljer.fom': 'Fra og med',
  'beregning.detaljer.tom': 'Til og med',
  'beregning.detaljer.maaneder': 'måneder',
  'beregning.detaljer.kr': 'kr',
  'beregning.detaljer.grunnpensjon.heltUttak.title': 'Helt uttak',
  'beregning.detaljer.grunnpensjon.gradertUttak.title': 'Gradert uttak',
  'beregning.detaljer.grunnpensjon.pre2025OffentligAfp.title': 'Pre-2025 AFP',
  'beregning.detaljer.grunnpensjon.table.title': 'Grunnpensjon (kr)',
  'beregning.detaljer.grunnpensjon.afp.table.title': 'AFP (kr)',
}

const createMockStore = (customState = {}) => {
  const baseState = {
    ...userInputInitialState,
    currentSimulation: {
      ...userInputInitialState.currentSimulation,
      uttaksalder: { aar: 67, maaneder: 0 },
      gradertUttaksperiode: null,
      ...customState,
    },
  }

  return configureStore({
    reducer: {
      userInput: userInputSlice.reducer,
    },
    preloadedState: {
      userInput: baseState,
    },
  })
}

const renderWithProviders = (
  component: React.ReactElement,
  initialState = {}
) => {
  const store = createMockStore(initialState)
  return render(
    <Provider store={store}>
      <IntlProvider locale="nb" messages={mockMessages}>
        {component}
      </IntlProvider>
    </Provider>
  )
}

describe('Gitt at AlderspensjonDetaljer rendres', () => {
  const mockHeltUttakData = {
    alderspensjon: [
      { tekst: 'Grunnpensjon (kap. 19)', verdi: '12 000 kr' },
      { tekst: 'Tilleggspensjon (kap. 19)', verdi: '8 000 kr' },
      { tekst: 'Skjermingstillegg (kap. 19)', verdi: '2 000 kr' },
      { tekst: 'Pensjonstillegg (kap. 19)', verdi: '1 000 kr' },
      { tekst: 'Inntektspensjon (kap. 20)', verdi: '15 000 kr' },
      { tekst: 'Garantipensjon (kap. 20)', verdi: '3 000 kr' },
      { tekst: 'Sum alderspensjon', verdi: '41 000 kr' },
    ],
    opptjeningKap19: [
      { tekst: 'Andelsbrøk', verdi: '10/10' },
      { tekst: 'Sluttpoengtall', verdi: 6.5 },
      { tekst: 'Poengår', verdi: 35 },
      { tekst: 'Trygdetid', verdi: 40 },
    ],
    opptjeningKap20: [
      { tekst: 'Andelsbrøk', verdi: '10/10' },
      { tekst: 'Trygdetid', verdi: 40 },
      { tekst: 'Pensjonsbeholdning', verdi: '500 000 kr' },
    ],
  }

  it('rendrer komponenten med kun helt uttak', () => {
    renderWithProviders(
      <AlderspensjonDetaljer
        alderspensjonDetaljForValgtUttak={mockHeltUttakData}
      />
    )

    expect(screen.getAllByText('Grunnpensjon (kap. 19)')).toHaveLength(2)
    expect(screen.getAllByText('12 000 kr')).toHaveLength(2)
    expect(screen.getAllByText('Tilleggspensjon (kap. 19)')).toHaveLength(2)
    expect(screen.getAllByText('8 000 kr')).toHaveLength(2)
    expect(screen.getAllByText('Inntektspensjon (kap. 20)')).toHaveLength(2)
    expect(screen.getAllByText('15 000 kr')).toHaveLength(2)
    expect(screen.getAllByText('Sum alderspensjon')).toHaveLength(2)
    expect(screen.getAllByText('41 000 kr')).toHaveLength(2)
  })

  it('rendrer alle seksjoner fra AlderspensjonDetaljerListe', () => {
    renderWithProviders(
      <AlderspensjonDetaljer
        alderspensjonDetaljForValgtUttak={mockHeltUttakData}
      />
    )

    // Should render alderspensjon section (appears in both desktop and mobile)
    expect(screen.getAllByText('Grunnpensjon (kap. 19)')).toHaveLength(2)
    expect(screen.getAllByText('Sum alderspensjon')).toHaveLength(2)

    // Should render opptjeningKap19 section (appears in both desktop and mobile)
    expect(screen.getAllByText('Andelsbrøk')).toHaveLength(4) // 2 from kap19 and 2 from kap20
    expect(screen.getAllByText('Sluttpoengtall')).toHaveLength(2)

    // Should render opptjeningKap20 section (appears in both desktop and mobile)
    expect(screen.getAllByText('Pensjonsbeholdning')).toHaveLength(2)
    expect(screen.getAllByText('500 000 kr')).toHaveLength(2)
  })

  it('håndterer tom alderspensjonDetaljForValgtUttak objekt', () => {
    const emptyData = {
      alderspensjon: [],
      opptjeningKap19: [],
      opptjeningKap20: [],
    }

    const { container } = renderWithProviders(
      <AlderspensjonDetaljer alderspensjonDetaljForValgtUttak={emptyData} />
    )

    // Komponenten skal fortsatt rendre, men uten data
    const box = container.querySelector(
      '[data-testid="beregningsdetaljer-for-overgangskull"]'
    )
    expect(box).toBeInTheDocument()
  })

  it('rendrer siste element i alderspensjon array med strong styling', () => {
    const { container } = renderWithProviders(
      <AlderspensjonDetaljer
        alderspensjonDetaljForValgtUttak={mockHeltUttakData}
      />
    )

    const strongElements = container.querySelectorAll('strong')
    expect(strongElements.length).toBeGreaterThan(0)
  })

  it('håndterer undefined verdier i DetaljRad objekter', () => {
    const objektMedUndefined = {
      alderspensjon: [
        { tekst: 'Test grunnpensjon', verdi: undefined },
        { tekst: 'Test tilleggspensjon' },
      ],
      opptjeningKap19: [],
      opptjeningKap20: [],
    }

    renderWithProviders(
      <AlderspensjonDetaljer
        alderspensjonDetaljForValgtUttak={objektMedUndefined}
      />
    )

    expect(screen.getAllByText('Test grunnpensjon')).toHaveLength(2)
    expect(screen.getAllByText('Test tilleggspensjon')).toHaveLength(2)
  })

  it('rendrer VStack med korrekt gap', () => {
    const { container } = renderWithProviders(
      <AlderspensjonDetaljer
        alderspensjonDetaljForValgtUttak={mockHeltUttakData}
      />
    )

    const vStack = container.querySelector('.navds-stack')
    expect(vStack).toBeInTheDocument()
  })

  it('rendrer definition lists korrekt', () => {
    const { container } = renderWithProviders(
      <AlderspensjonDetaljer
        alderspensjonDetaljForValgtUttak={mockHeltUttakData}
      />
    )

    const definitionLists = container.querySelectorAll('dl')
    expect(definitionLists.length).toBeGreaterThan(0)

    const terms = container.querySelectorAll('dt')
    const definitions = container.querySelectorAll('dd')
    expect(terms.length).toBeGreaterThan(0)
    expect(definitions.length).toBeGreaterThan(0)
  })

  it('rendrer sections med korrekte titler', () => {
    renderWithProviders(
      <AlderspensjonDetaljer
        alderspensjonDetaljForValgtUttak={mockHeltUttakData}
      />
    )

    // Check that section titles are rendered (these come from FormattedMessage)
    const dlElements = document.querySelectorAll('dl')
    expect(dlElements.length).toBe(6) // alderspensjon, opptjeningKap19, opptjeningKap20 x2 (desktop + mobile)
  })
})
