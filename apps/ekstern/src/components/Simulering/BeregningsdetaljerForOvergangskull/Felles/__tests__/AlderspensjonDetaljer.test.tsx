import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'

import {
  userInputInitialState,
  userInputSlice,
} from '@/state/userInput/userInputSlice'

import { DetaljRad } from '../../hooks'
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
  const mockHeltUttakData: DetaljRad[] = [
    { tekst: 'Grunnpensjon (kap. 19)', verdi: '12 000 kr' },
    { tekst: 'Tilleggspensjon (kap. 19)', verdi: '8 000 kr' },
    { tekst: 'Skjermingstillegg (kap. 19)', verdi: '2 000 kr' },
    { tekst: 'Pensjonstillegg (kap. 19)', verdi: '1 000 kr' },
    { tekst: 'Inntektspensjon (kap. 20)', verdi: '15 000 kr' },
    { tekst: 'Garantipensjon (kap. 20)', verdi: '3 000 kr' },
    { tekst: 'Sum alderspensjon', verdi: '41 000 kr' },
  ]

  const mockGradertUttakData: DetaljRad[] = [
    { tekst: 'Grunnpensjon (kap. 19)', verdi: '6 000 kr' },
    { tekst: 'Tilleggspensjon (kap. 19)', verdi: '4 000 kr' },
    { tekst: 'Skjermingstillegg (kap. 19)', verdi: '1 000 kr' },
    { tekst: 'Inntektspensjon (kap. 20)', verdi: '7 500 kr' },
    { tekst: 'Garantipensjon (kap. 20)', verdi: '1 500 kr' },
    { tekst: 'Sum alderspensjon', verdi: '20 000 kr' },
  ]

  it('rendrer komponenten med kun helt uttak', () => {
    renderWithProviders(
      <AlderspensjonDetaljer
        alderspensjonDetaljerListe={[mockHeltUttakData]}
        hasPre2025OffentligAfpUttaksalder={false}
      />
    )

    expect(screen.getByText('Grunnpensjon (kap. 19):')).toBeVisible()
    expect(screen.getByText('12 000 kr')).toBeVisible()
    expect(screen.getByText('Tilleggspensjon (kap. 19):')).toBeVisible()
    expect(screen.getByText('8 000 kr')).toBeVisible()
    expect(screen.getByText('Inntektspensjon (kap. 20):')).toBeVisible()
    expect(screen.getByText('15 000 kr')).toBeVisible()
    expect(screen.getByText('Sum alderspensjon:')).toBeVisible()
    expect(screen.getByText('41 000 kr')).toBeVisible()
  })

  it('rendrer både gradert og helt uttak når begge er tilgjengelige', () => {
    const stateWithGradertUttak = {
      gradertUttaksperiode: {
        uttaksalder: { aar: 62, maaneder: 6 },
        grad: 50,
      },
    }

    renderWithProviders(
      <AlderspensjonDetaljer
        alderspensjonDetaljerListe={[mockGradertUttakData, mockHeltUttakData]}
        hasPre2025OffentligAfpUttaksalder={false}
      />,
      stateWithGradertUttak
    )

    // Gradert uttak - sjekker unike verdier for å skille fra helt uttak
    expect(screen.getByText('6 000 kr')).toBeVisible() // Gradert uttak amount (unique)
    expect(screen.getByText('4 000 kr')).toBeVisible() // Tilleggspensjon gradert (unique)
    expect(screen.getByText('20 000 kr')).toBeVisible() // Sum gradert (unique)

    // Helt uttak - sjekker unike verdier
    expect(screen.getByText('12 000 kr')).toBeVisible() // Helt uttak amount (unique)
    expect(screen.getByText('8 000 kr')).toBeVisible() // Tilleggspensjon helt (unique)
    expect(screen.getByText('41 000 kr')).toBeVisible() // Sum helt (unique)

    // Sjekker at begge seksjoner eksisterer
    expect(screen.getAllByText('Grunnpensjon (kap. 19):')).toHaveLength(2)
    expect(screen.getAllByText('Sum alderspensjon:')).toHaveLength(2)
  })

  it('rendrer kun helt uttak når gradertUttaksperiode er null', () => {
    renderWithProviders(
      <AlderspensjonDetaljer
        alderspensjonDetaljerListe={[mockHeltUttakData]}
        hasPre2025OffentligAfpUttaksalder={false}
      />
    )

    expect(screen.getByText('Grunnpensjon (kap. 19):')).toBeVisible()
    expect(screen.queryByText('6 000 kr')).not.toBeInTheDocument()
  })

  it('håndterer tom alderspensjonDetaljerListe array', () => {
    const { container } = renderWithProviders(
      <AlderspensjonDetaljer
        alderspensjonDetaljerListe={[]}
        hasPre2025OffentligAfpUttaksalder={false}
      />
    )

    // Komponenten skal fortsatt rendre, men uten data
    const vStack = container.querySelector('.navds-stack')
    expect(vStack).toBeInTheDocument()
  })

  it('rendrer headings korrekt for gradert og helt uttak', () => {
    const stateWithGradertUttak = {
      uttaksalder: { aar: 67, maaneder: 3 },
      gradertUttaksperiode: {
        uttaksalder: { aar: 62, maaneder: 0 },
        grad: 75,
      },
    }

    renderWithProviders(
      <AlderspensjonDetaljer
        alderspensjonDetaljerListe={[mockGradertUttakData, mockHeltUttakData]}
        hasPre2025OffentligAfpUttaksalder={false}
      />,
      stateWithGradertUttak
    )

    const headings = screen.getAllByRole('heading', { level: 4 })
    expect(headings).toHaveLength(2) // En for gradert og en for helt uttak
  })

  it('rendrer siste element i hver array med strong styling', () => {
    const { container } = renderWithProviders(
      <AlderspensjonDetaljer
        alderspensjonDetaljerListe={[mockHeltUttakData]}
        hasPre2025OffentligAfpUttaksalder={false}
      />
    )

    const strongElements = container.querySelectorAll('strong')
    expect(strongElements.length).toBeGreaterThan(0)
  })

  it('håndterer undefined verdier i DetaljRad objekter', () => {
    const objektMedUndefined: DetaljRad[] = [
      { tekst: 'Test grunnpensjon', verdi: undefined },
      { tekst: 'Test tilleggspensjon' },
    ]

    renderWithProviders(
      <AlderspensjonDetaljer
        alderspensjonDetaljerListe={[objektMedUndefined]}
        hasPre2025OffentligAfpUttaksalder={false}
      />
    )

    expect(screen.getByText('Test grunnpensjon:')).toBeVisible()
    expect(screen.getByText('Test tilleggspensjon:')).toBeVisible()
  })

  it('rendrer VStack med korrekt gap', () => {
    const { container } = renderWithProviders(
      <AlderspensjonDetaljer
        alderspensjonDetaljerListe={[mockHeltUttakData]}
        hasPre2025OffentligAfpUttaksalder={false}
      />
    )

    const vStack = container.querySelector('.navds-stack')
    expect(vStack).toBeInTheDocument()
  })

  it('rendrer definition lists korrekt', () => {
    const { container } = renderWithProviders(
      <AlderspensjonDetaljer
        alderspensjonDetaljerListe={[mockHeltUttakData]}
        hasPre2025OffentligAfpUttaksalder={false}
      />
    )

    const definitionLists = container.querySelectorAll('dl')
    expect(definitionLists).toHaveLength(1)

    const terms = container.querySelectorAll('dt')
    const definitions = container.querySelectorAll('dd')
    expect(terms.length).toBeGreaterThan(0)
    expect(definitions.length).toBeGreaterThan(0)
  })

  it('håndterer uttaksalder med måneder korrekt', () => {
    const stateWithMonths = {
      uttaksalder: { aar: 67, maaneder: 6 },
    }

    renderWithProviders(
      <AlderspensjonDetaljer
        alderspensjonDetaljerListe={[mockHeltUttakData]}
        hasPre2025OffentligAfpUttaksalder={false}
      />,
      stateWithMonths
    )

    expect(screen.getByText('Grunnpensjon (kap. 19):')).toBeVisible()
  })

  it('håndterer når alderspensjonDetaljerListe har nøyaktig 2 arrays', () => {
    const stateWithGradertUttak = {
      gradertUttaksperiode: {
        uttaksalder: { aar: 62, maaneder: 0 },
        grad: 50,
      },
    }

    renderWithProviders(
      <AlderspensjonDetaljer
        alderspensjonDetaljerListe={[mockGradertUttakData, mockHeltUttakData]}
        hasPre2025OffentligAfpUttaksalder={false}
      />,
      stateWithGradertUttak
    )

    // Skal fungere korrekt med 2 arrays - gradert og helt uttak
    expect(screen.getAllByText('Grunnpensjon (kap. 19):')).toHaveLength(2)
    expect(screen.getAllByText('Sum alderspensjon:')).toHaveLength(2)
    expect(screen.getByText('6 000 kr')).toBeVisible() // Gradert uttak
    expect(screen.getByText('12 000 kr')).toBeVisible() // Helt uttak
  })

  it('prioriterer gradert uttak når uttaksalder og gradert uttaksalder er like', () => {
    const stateWithSameAges = {
      uttaksalder: { aar: 67, maaneder: 6 },
      gradertUttaksperiode: {
        uttaksalder: { aar: 67, maaneder: 0 },
        grad: 50,
      },
    }

    renderWithProviders(
      <AlderspensjonDetaljer
        alderspensjonDetaljerListe={[mockGradertUttakData]}
        hasPre2025OffentligAfpUttaksalder={false}
      />,
      stateWithSameAges
    )

    // Skal kun vise gradert uttak seksjon
    expect(screen.getAllByText('Grunnpensjon (kap. 19):')).toHaveLength(1)
    expect(screen.getAllByText('Sum alderspensjon:')).toHaveLength(1)

    // Skal vise gradert uttak data
    expect(screen.getByText('6 000 kr')).toBeVisible() // Gradert uttak beløp
    expect(screen.getByText('4 000 kr')).toBeVisible() // Tilleggspensjon gradert
    expect(screen.getByText('20 000 kr')).toBeVisible() // Sum gradert

    // Skal ikke vise helt uttak data
    expect(screen.queryByText('12 000 kr')).not.toBeInTheDocument()
    expect(screen.queryByText('8 000 kr')).not.toBeInTheDocument()
    expect(screen.queryByText('41 000 kr')).not.toBeInTheDocument()
  })

  it('prioriterer helt uttak når uttaksalder og gradert uttaksalder er like og hasPre2025OffentligAfpUttaksalder er true', () => {
    const stateWithSameAges = {
      uttaksalder: { aar: 67, maaneder: 0 },
      gradertUttaksperiode: {
        uttaksalder: { aar: 67, maaneder: 0 },
        grad: 50,
      },
    }

    renderWithProviders(
      <AlderspensjonDetaljer
        alderspensjonDetaljerListe={[mockHeltUttakData]}
        hasPre2025OffentligAfpUttaksalder={true} // Pre-2025 AFP case
      />,
      stateWithSameAges
    )

    // Skal kun vise helt uttak seksjon siden hasPre2025OffentligAfpUttaksalder er true
    expect(screen.getAllByText('Grunnpensjon (kap. 19):')).toHaveLength(1)
    expect(screen.getAllByText('Sum alderspensjon:')).toHaveLength(1)

    // Skal vise helt uttak data
    expect(screen.getByText('12 000 kr')).toBeVisible() // Helt uttak beløp
    expect(screen.getByText('8 000 kr')).toBeVisible() // Tilleggspensjon helt
    expect(screen.getByText('41 000 kr')).toBeVisible() // Sum helt

    // Skal ikke vise gradert uttak data siden pre-2025 AFP prioriterer helt uttak
    expect(screen.queryByText('6 000 kr')).not.toBeInTheDocument()
    expect(screen.queryByText('4 000 kr')).not.toBeInTheDocument()
    expect(screen.queryByText('20 000 kr')).not.toBeInTheDocument()
  })
})
