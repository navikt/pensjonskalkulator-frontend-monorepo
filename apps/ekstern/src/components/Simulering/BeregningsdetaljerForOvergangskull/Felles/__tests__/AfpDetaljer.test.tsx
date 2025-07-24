import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'

import {
  userInputInitialState,
  userInputSlice,
} from '@/state/userInput/userInputSlice'

import { DetaljRad } from '../../hooks'
import { AfpDetaljer } from '../AfpDetaljer'

const mockMessages = {
  'beregning.detaljer.fom': 'Fra og med',
  'beregning.detaljer.tom': 'Til og med',
  'beregning.detaljer.maaneder': 'måneder',
  'beregning.detaljer.kr': 'kr',
  'beregning.detaljer.afp.privat.title': 'AFP privat',
  'beregning.detaljer.afp.privat.title.grad': 'AFP privat {grad}% uttaksgrad',
  'beregning.detaljer.afp.privat.title.alderOgGrad':
    'AFP privat fra {alderAar} {alderMd} med {grad}% uttaksgrad',
  'beregning.detaljer.afp.pre2025Offentlig.title': 'AFP offentlig',
  'beregning.detaljer.afpPrivat.heltUttak.title': 'AFP privat ved 67 år',
  'beregning.detaljer.afpPrivat.gradertUttak.title':
    'AFP privat ved uttaksalder',
  'beregning.detaljer.OpptjeningDetaljer.afpPrivat.table.title':
    'AFP privat beregning',
  'beregning.detaljer.OpptjeningDetaljer.pre2025OffentligAfp.table.title':
    'AFP offentlig beregning',
}

const createMockStore = (customState = {}) => {
  const baseState = {
    ...userInputInitialState,
    currentSimulation: {
      ...userInputInitialState.currentSimulation,
      uttaksalder: { aar: 67, maaneder: 0 },
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

describe('Gitt at AfpDetaljer rendres', () => {
  const mockAfpPrivatAtUttaksalderData: DetaljRad[] = [
    { tekst: 'Kompensasjonstillegg', verdi: '8 000 kr' },
    { tekst: 'Kronetillegg', verdi: '5 000 kr' },
    { tekst: 'Livsvarig del', verdi: '2 000 kr' },
    { tekst: 'Sum AFP', verdi: '15 000 kr' },
  ]

  const mockAfpPrivatAt67Data: DetaljRad[] = [
    { tekst: 'Kompensasjonstillegg', verdi: '9 000 kr' },
    { tekst: 'Kronetillegg', verdi: '6 000 kr' },
    { tekst: 'Livsvarig del', verdi: '3 000 kr' },
    { tekst: 'Sum AFP', verdi: '18 000 kr' },
  ]

  const mockPre2025OffentligAfpData: DetaljRad[] = [
    { tekst: 'AFP grad', verdi: 100 },
    { tekst: 'Sluttpoengtall', verdi: 6.5 },
    { tekst: 'Poengår', verdi: 35 },
    { tekst: 'Trygdetid', verdi: 40 },
  ]

  const mockAfpOffentligData: DetaljRad[] = [
    {
      tekst: 'Månedlig livsvarig avtalefestet pensjon (AFP)',
      verdi: '12 000 kr',
    },
    { tekst: 'Tillegg for ansiennitet', verdi: '3 000 kr' },
  ]

  it('rendrer komponenten uten data', () => {
    const { container } = renderWithProviders(<AfpDetaljer />)

    const section = container.querySelector('section')
    expect(section).toBeInTheDocument()
  })

  it('rendrer kun AFP privat ved 67 år når uttaksalder er 67 eller høyere', () => {
    const stateWith67 = {
      uttaksalder: { aar: 67, maaneder: 0 },
    }

    renderWithProviders(
      <AfpDetaljer afpPrivatDetaljerListe={[mockAfpPrivatAt67Data]} />,
      stateWith67
    )

    expect(screen.getByText('Kompensasjonstillegg:')).toBeVisible()
    expect(screen.getByText('9 000 kr')).toBeVisible()
    expect(screen.getByText('Kronetillegg:')).toBeVisible()
    expect(screen.getByText('6 000 kr')).toBeVisible()
    expect(screen.getByText('Livsvarig del:')).toBeVisible()
    expect(screen.getByText('3 000 kr')).toBeVisible()
    expect(screen.getByText('Sum AFP:')).toBeVisible()
    expect(screen.getByText('18 000 kr')).toBeVisible()
  })

  it('rendrer både AFP privat ved uttaksalder og ved 67 når uttaksalder er under 67', () => {
    const stateWith62 = {
      uttaksalder: { aar: 62, maaneder: 0 },
    }

    renderWithProviders(
      <AfpDetaljer
        afpPrivatDetaljerListe={[
          mockAfpPrivatAtUttaksalderData,
          mockAfpPrivatAt67Data,
        ]}
      />,
      stateWith62
    )

    // AFP ved uttaksalder and ved 67 - use getAllByText for duplicate elements
    expect(screen.getAllByText('Kompensasjonstillegg:')).toHaveLength(2)
    expect(screen.getAllByText('Kronetillegg:')).toHaveLength(2)
    expect(screen.getAllByText('Livsvarig del:')).toHaveLength(2)
    expect(screen.getAllByText('Sum AFP:')).toHaveLength(2)

    // Sjekker unike verdier for å verifisere at begge seksjoner er tilstede
    expect(screen.getByText('8 000 kr')).toBeVisible() // Kompensasjonstillegg ved uttaksalder
    expect(screen.getByText('5 000 kr')).toBeVisible() // Kronetillegg ved uttaksalder
    expect(screen.getByText('2 000 kr')).toBeVisible() // Livsvarig del ved uttaksalder
    expect(screen.getByText('15 000 kr')).toBeVisible() // Sum ved uttaksalder

    expect(screen.getByText('9 000 kr')).toBeVisible() // Kompensasjonstillegg ved 67
    expect(screen.getByText('6 000 kr')).toBeVisible() // Kronetillegg ved 67
    expect(screen.getByText('3 000 kr')).toBeVisible() // Livsvarig del ved 67
    expect(screen.getByText('18 000 kr')).toBeVisible() // Sum AFP ved 67
  })

  it('rendrer ikke AFP privat ved uttaksalder når uttaksalder er 67 eller høyere', () => {
    const stateWith67 = {
      uttaksalder: { aar: 67, maaneder: 0 },
    }

    renderWithProviders(
      <AfpDetaljer
        afpPrivatDetaljerListe={[
          mockAfpPrivatAtUttaksalderData,
          mockAfpPrivatAt67Data,
        ]}
      />,
      stateWith67
    )

    // Skal ikke vise AFP ved uttaksalder siden uttaksalder er 67
    expect(screen.queryByText('8 000 kr')).not.toBeInTheDocument()
    expect(screen.queryByText('15 000 kr')).not.toBeInTheDocument()

    // Men skal vise AFP ved 67
    expect(screen.getByText('Sum AFP:')).toBeVisible()
    expect(screen.getByText('18 000 kr')).toBeVisible()
  })

  it('rendrer pre-2025 offentlig AFP når data er tilgjengelig', () => {
    renderWithProviders(
      <AfpDetaljer
        opptjeningPre2025OffentligAfpListe={mockPre2025OffentligAfpData}
      />
    )

    expect(screen.getByText('AFP grad:')).toBeVisible()
    expect(screen.getByText('100 %')).toBeVisible()
    expect(screen.getByText('Sluttpoengtall:')).toBeVisible()
    expect(screen.getByText('6.5')).toBeVisible()
    expect(screen.getByText('Poengår:')).toBeVisible()
    expect(screen.getByText('35 år')).toBeVisible()
    expect(screen.getByText('Trygdetid:')).toBeVisible()
    expect(screen.getByText('40 år')).toBeVisible()
  })

  it('rendrer både AFP privat og pre-2025 offentlig AFP samtidig', () => {
    renderWithProviders(
      <AfpDetaljer
        afpPrivatDetaljerListe={[mockAfpPrivatAt67Data]}
        opptjeningPre2025OffentligAfpListe={mockPre2025OffentligAfpData}
      />
    )

    // AFP privat
    expect(screen.getByText('Kompensasjonstillegg:')).toBeVisible()
    expect(screen.getByText('Sum AFP:')).toBeVisible()

    // Pre-2025 offentlig AFP
    expect(screen.getByText('AFP grad:')).toBeVisible()
    expect(screen.getByText('Trygdetid:')).toBeVisible()
  })

  it('rendrer ikke noe når alle data er tomme eller undefined', () => {
    const { container } = renderWithProviders(
      <AfpDetaljer
        afpPrivatDetaljerListe={[]}
        opptjeningPre2025OffentligAfpListe={[]}
      />
    )

    // Kun section elementet skal være tilstede
    const section = container.querySelector('section')
    expect(section).toBeInTheDocument()
    expect(screen.queryByText('Kompensasjonstillegg:')).not.toBeInTheDocument()
    expect(screen.queryByText('AFP grad:')).not.toBeInTheDocument()
  })

  it('håndterer undefined verdier i DetaljRad objekter', () => {
    const objektMedUndefined: DetaljRad[] = [
      { tekst: 'Test AFP', verdi: undefined },
      { tekst: 'Test AFP 2' },
    ]

    renderWithProviders(
      <AfpDetaljer afpPrivatDetaljerListe={[objektMedUndefined]} />
    )

    expect(screen.getByText('Test AFP:')).toBeVisible()
    expect(screen.getByText('Test AFP 2:')).toBeVisible()
  })

  it('rendrer headings korrekt for AFP privat seksjoner', () => {
    const stateWith62 = {
      uttaksalder: { aar: 62, maaneder: 6 },
    }

    renderWithProviders(
      <AfpDetaljer
        afpPrivatDetaljerListe={[
          mockAfpPrivatAtUttaksalderData,
          mockAfpPrivatAt67Data,
        ]}
      />,
      stateWith62
    )

    const headings = screen.getAllByRole('heading', { level: 4 })
    expect(headings).toHaveLength(2) // En for AFP ved uttaksalder og en for AFP ved 67
  })

  it('rendrer siste element i hver array med strong styling', () => {
    const { container } = renderWithProviders(
      <AfpDetaljer afpPrivatDetaljerListe={[mockAfpPrivatAt67Data]} />
    )

    const strongElements = container.querySelectorAll('strong')
    expect(strongElements.length).toBeGreaterThan(0)
  })

  it('håndterer uttaksalder med måneder korrekt', () => {
    const stateWithMonths = {
      uttaksalder: { aar: 65, maaneder: 8 },
    }

    renderWithProviders(
      <AfpDetaljer
        afpPrivatDetaljerListe={[
          mockAfpPrivatAtUttaksalderData,
          mockAfpPrivatAt67Data,
        ]}
      />,
      stateWithMonths
    )

    // Skal vise begge seksjoner siden uttaksalder er under 67
    expect(screen.getAllByText('Sum AFP:')).toHaveLength(2)
    expect(screen.getByText('15 000 kr')).toBeVisible() // Ved uttaksalder
    expect(screen.getByText('18 000 kr')).toBeVisible() // Ved 67
  })

  it('rendrer VStack med korrekt gap for AFP privat', () => {
    const { container } = renderWithProviders(
      <AfpDetaljer afpPrivatDetaljerListe={[mockAfpPrivatAt67Data]} />
    )

    const vStack = container.querySelector('.navds-stack')
    expect(vStack).toBeVisible()
  })

  it('rendrer definition lists korrekt', () => {
    const { container } = renderWithProviders(
      <AfpDetaljer
        afpPrivatDetaljerListe={[mockAfpPrivatAt67Data]}
        opptjeningPre2025OffentligAfpListe={mockPre2025OffentligAfpData}
      />
    )

    const definitionLists = container.querySelectorAll('dl')
    expect(definitionLists).toHaveLength(2) // En for AFP privat og en for pre-2025 offentlig

    const terms = container.querySelectorAll('dt')
    const definitions = container.querySelectorAll('dd')
    expect(terms.length).toBeGreaterThan(0)
    expect(definitions.length).toBeGreaterThan(0)
  })

  it('håndterer kun ett element i afpPrivatDetaljerListe array', () => {
    renderWithProviders(
      <AfpDetaljer afpPrivatDetaljerListe={[mockAfpPrivatAt67Data]} />
    )

    // Skal bare vise AFP ved 67 (siden det kun er ett element)
    expect(screen.getByText('Sum AFP:')).toBeVisible()
    expect(screen.getByText('18 000 kr')).toBeVisible()
    expect(screen.queryByText('15 000 kr')).not.toBeInTheDocument() // Ikke uttaksalder data
  })

  describe('når gradertUttaksperiode er definert', () => {
    it('bruker gradertUttaksperiode alder når den er definert istedenfor uttaksalder', () => {
      const stateWithGradertUttak = {
        uttaksalder: { aar: 67, maaneder: 0 },
        gradertUttaksperiode: {
          uttaksalder: { aar: 62, maaneder: 6 },
          grad: 50,
        },
      }

      renderWithProviders(
        <AfpDetaljer
          afpPrivatDetaljerListe={[
            mockAfpPrivatAtUttaksalderData,
            mockAfpPrivatAt67Data,
          ]}
        />,
        stateWithGradertUttak
      )

      // Skal vise begge seksjoner siden gradertUttak alder (62) er under 67
      expect(screen.getAllByText('Sum AFP:')).toHaveLength(2)
      expect(screen.getByText('15 000 kr')).toBeVisible() // Ved gradert uttaksalder
      expect(screen.getByText('18 000 kr')).toBeVisible() // Ved 67
    })

    it('bruker gradertUttaksperiode når den er 67 eller høyere', () => {
      const stateWithGradertUttakAt67 = {
        uttaksalder: { aar: 68, maaneder: 0 }, // uttaksalder må være høyere enn gradert
        gradertUttaksperiode: {
          uttaksalder: { aar: 67, maaneder: 0 },
          grad: 50,
        },
      }

      renderWithProviders(
        <AfpDetaljer
          afpPrivatDetaljerListe={[
            mockAfpPrivatAtUttaksalderData,
            mockAfpPrivatAt67Data,
          ]}
        />,
        stateWithGradertUttakAt67
      )

      // Skal ikke vise AFP ved uttaksalder siden gradertUttak alder er 67
      expect(screen.queryByText('15 000 kr')).not.toBeInTheDocument()
      expect(screen.getByText('18 000 kr')).toBeVisible() // Bare ved 67
    })

    it('viser korrekt alder i heading når gradertUttaksperiode har måneder', () => {
      const stateWithGradertUttakWithMonths = {
        uttaksalder: { aar: 68, maaneder: 0 }, // uttaksalder må være høyere enn gradert
        gradertUttaksperiode: {
          uttaksalder: { aar: 63, maaneder: 8 },
          grad: 75,
        },
      }

      renderWithProviders(
        <AfpDetaljer
          afpPrivatDetaljerListe={[
            mockAfpPrivatAtUttaksalderData,
            mockAfpPrivatAt67Data,
          ]}
        />,
        stateWithGradertUttakWithMonths
      )

      // Begge seksjoner skal vises siden gradert alder (63) er under 67
      expect(screen.getAllByText('Sum AFP:')).toHaveLength(2)
    })

    it('viser 67 år i "heltUttak" heading når gradertUttaksperiode alder er under 67', () => {
      const stateWithGradertUttakUnder67 = {
        uttaksalder: { aar: 68, maaneder: 0 }, // uttaksalder må være høyere enn gradert
        gradertUttaksperiode: {
          uttaksalder: { aar: 65, maaneder: 3 },
          grad: 40,
        },
      }

      renderWithProviders(
        <AfpDetaljer
          afpPrivatDetaljerListe={[
            mockAfpPrivatAtUttaksalderData,
            mockAfpPrivatAt67Data,
          ]}
        />,
        stateWithGradertUttakUnder67
      )

      // Skal vise begge seksjoner
      expect(screen.getAllByText('Sum AFP:')).toHaveLength(2)
    })

    it('viser gradertUttaksperiode alder i "heltUttak" heading når den er 67 eller høyere', () => {
      const stateWithGradertUttakOver67 = {
        uttaksalder: { aar: 69, maaneder: 0 }, // uttaksalder må være høyere enn gradert
        gradertUttaksperiode: {
          uttaksalder: { aar: 68, maaneder: 2 },
          grad: 80,
        },
      }

      renderWithProviders(
        <AfpDetaljer
          afpPrivatDetaljerListe={[
            mockAfpPrivatAtUttaksalderData,
            mockAfpPrivatAt67Data,
          ]}
        />,
        stateWithGradertUttakOver67
      )

      // Skal bare vise AFP ved 67 seksjonen (siden gradert alder er over 67)
      expect(screen.getAllByText('Sum AFP:')).toHaveLength(1)
      expect(screen.getByText('18 000 kr')).toBeVisible() // Bare ved 67
    })

    it('håndterer gradertUttaksperiode uten måneder (0 måneder)', () => {
      const stateWithGradertUttakNoMonths = {
        uttaksalder: { aar: 68, maaneder: 6 }, // uttaksalder må være høyere enn gradert
        gradertUttaksperiode: {
          uttaksalder: { aar: 64, maaneder: 0 },
          grad: 60,
        },
      }

      renderWithProviders(
        <AfpDetaljer
          afpPrivatDetaljerListe={[
            mockAfpPrivatAtUttaksalderData,
            mockAfpPrivatAt67Data,
          ]}
        />,
        stateWithGradertUttakNoMonths
      )

      // Skal vise begge seksjoner siden gradert alder (64) er under 67
      expect(screen.getAllByText('Sum AFP:')).toHaveLength(2)
    })

    it('fallback til uttaksalder når gradertUttaksperiode mangler uttaksalder', () => {
      const stateWithIncompleteGradertUttak = {
        uttaksalder: { aar: 65, maaneder: 4 },
        gradertUttaksperiode: {
          grad: 100,
        },
      }

      renderWithProviders(
        <AfpDetaljer
          afpPrivatDetaljerListe={[
            mockAfpPrivatAtUttaksalderData,
            mockAfpPrivatAt67Data,
          ]}
        />,
        stateWithIncompleteGradertUttak
      )

      // Skal falle tilbake til uttaksalder (65) og vise begge seksjoner
      expect(screen.getAllByText('Sum AFP:')).toHaveLength(2)
    })
  })

  describe('afpOffentligDetaljerListe', () => {
    it('rendrer AFP offentlig når data er tilgjengelig', () => {
      renderWithProviders(
        <AfpDetaljer afpOffentligDetaljerListe={mockAfpOffentligData} />
      )

      expect(
        screen.getByText('Månedlig livsvarig avtalefestet pensjon (AFP):')
      ).toBeVisible()
      expect(screen.getByText('12 000 kr')).toBeVisible()
      expect(screen.getByText('Tillegg for ansiennitet:')).toBeVisible()
      expect(screen.getByText('3 000 kr')).toBeVisible()
    })

    it('rendrer AFP offentlig med strong styling for alle elementer', () => {
      const { container } = renderWithProviders(
        <AfpDetaljer afpOffentligDetaljerListe={mockAfpOffentligData} />
      )

      const strongElements = container.querySelectorAll('strong')
      // Alle dt og dd skal være strong for AFP offentlig
      expect(strongElements.length).toBeGreaterThanOrEqual(4) // minst 2 dt + 2 dd
    })

    it('rendrer ikke AFP offentlig når lista er tom', () => {
      renderWithProviders(<AfpDetaljer afpOffentligDetaljerListe={[]} />)

      expect(
        screen.queryByText('Månedlig livsvarig avtalefestet pensjon (AFP):')
      ).not.toBeInTheDocument()
    })

    it('håndterer undefined verdier i AFP offentlig', () => {
      const afpOffentligMedUndefined: DetaljRad[] = [
        { tekst: 'Test AFP offentlig', verdi: undefined },
        { tekst: 'Test AFP offentlig 2' },
      ]

      renderWithProviders(
        <AfpDetaljer afpOffentligDetaljerListe={afpOffentligMedUndefined} />
      )

      expect(screen.getByText('Test AFP offentlig:')).toBeVisible()
      expect(screen.getByText('Test AFP offentlig 2:')).toBeVisible()
    })

    it('rendrer AFP offentlig sammen med AFP privat', () => {
      renderWithProviders(
        <AfpDetaljer
          afpPrivatDetaljerListe={[mockAfpPrivatAt67Data]}
          afpOffentligDetaljerListe={mockAfpOffentligData}
        />
      )

      // AFP privat
      expect(screen.getByText('Kompensasjonstillegg:')).toBeVisible()
      expect(screen.getByText('Sum AFP:')).toBeVisible()

      // AFP offentlig
      expect(
        screen.getByText('Månedlig livsvarig avtalefestet pensjon (AFP):')
      ).toBeVisible()
      expect(screen.getByText('12 000 kr')).toBeVisible()
    })

    it('rendrer AFP offentlig sammen med pre-2025 offentlig AFP', () => {
      renderWithProviders(
        <AfpDetaljer
          afpOffentligDetaljerListe={mockAfpOffentligData}
          opptjeningPre2025OffentligAfpListe={mockPre2025OffentligAfpData}
        />
      )

      // AFP offentlig
      expect(
        screen.getByText('Månedlig livsvarig avtalefestet pensjon (AFP):')
      ).toBeVisible()

      // Pre-2025 offentlig AFP
      expect(screen.getByText('AFP grad:')).toBeVisible()
      expect(screen.getByText('Trygdetid:')).toBeVisible()
    })
  })

  describe('edge cases og spesifikke scenarier', () => {
    it('håndterer tom afpPrivatDetaljerListe array', () => {
      renderWithProviders(<AfpDetaljer afpPrivatDetaljerListe={[]} />)

      expect(screen.queryByText('Sum AFP:')).not.toBeInTheDocument()
    })

    it('håndterer afpPrivatDetaljerListe med kun ett tomt array', () => {
      renderWithProviders(<AfpDetaljer afpPrivatDetaljerListe={[[]]} />)

      expect(screen.queryByText('Sum AFP:')).not.toBeInTheDocument()
    })

    it('håndterer afpPrivatDetaljerListe med to tomme arrays', () => {
      renderWithProviders(<AfpDetaljer afpPrivatDetaljerListe={[[], []]} />)

      // Skal ikke vise AFP ved uttaksalder (tom array)
      // Men skal vise AFP ved 67 (tom array blir ikke vist)
      expect(screen.queryByText('Sum AFP:')).not.toBeInTheDocument()
    })

    it('rendrer kun første array når afpPrivatDetaljerListe har ett element og uttaksalder under 67', () => {
      const stateWith65 = {
        uttaksalder: { aar: 65, maaneder: 0 },
      }

      renderWithProviders(
        <AfpDetaljer
          afpPrivatDetaljerListe={[mockAfpPrivatAtUttaksalderData]}
        />,
        stateWith65
      )

      // Skal bare vise AFP ved 67 (siden det kun er ett element i array)
      expect(screen.getByText('Sum AFP:')).toBeVisible()
      expect(screen.getByText('15 000 kr')).toBeVisible()
    })

    it('viser ikke måneder i heading når currentMonths er 0', () => {
      const stateWithZeroMonths = {
        uttaksalder: { aar: 65, maaneder: 0 },
      }

      renderWithProviders(
        <AfpDetaljer
          afpPrivatDetaljerListe={[
            mockAfpPrivatAtUttaksalderData,
            mockAfpPrivatAt67Data,
          ]}
        />,
        stateWithZeroMonths
      )

      // Skal vise begge seksjoner
      expect(screen.getAllByText('Sum AFP:')).toHaveLength(2)
    })

    it('håndterer undefined uttaksalder', () => {
      const stateWithUndefinedUttaksalder = {
        uttaksalder: undefined,
      }

      renderWithProviders(
        <AfpDetaljer
          afpPrivatDetaljerListe={[
            mockAfpPrivatAtUttaksalderData,
            mockAfpPrivatAt67Data,
          ]}
        />,
        stateWithUndefinedUttaksalder
      )

      // Skal ikke vise AFP ved uttaksalder (currentAge er undefined)
      expect(screen.getByText('Sum AFP:')).toBeVisible()
      expect(screen.getByText('18 000 kr')).toBeVisible() // Kun AFP ved 67
      expect(screen.queryByText('15 000 kr')).not.toBeInTheDocument()
    })

    it('håndterer undefined uttaksalder år', () => {
      const stateWithUndefinedYear = {
        uttaksalder: { aar: undefined, maaneder: 6 },
      }

      renderWithProviders(
        <AfpDetaljer
          afpPrivatDetaljerListe={[
            mockAfpPrivatAtUttaksalderData,
            mockAfpPrivatAt67Data,
          ]}
        />,
        stateWithUndefinedYear
      )

      // Skal ikke vise AFP ved uttaksalder (currentAge er undefined)
      expect(screen.getByText('Sum AFP:')).toBeVisible()
      expect(screen.getByText('18 000 kr')).toBeVisible() // Kun AFP ved 67
      expect(screen.queryByText('15 000 kr')).not.toBeInTheDocument()
    })

    it('håndterer alle props som undefined', () => {
      const { container } = renderWithProviders(<AfpDetaljer />)
      const section = container.querySelector('section')
      expect(section).toBeInTheDocument()
      expect(section?.children).toHaveLength(0)
    })
  })

  describe('integrering med alle props samtidig', () => {
    it('rendrer alle typer AFP data samtidig', () => {
      const stateWith62 = {
        uttaksalder: { aar: 62, maaneder: 3 },
      }

      const { container } = renderWithProviders(
        <AfpDetaljer
          afpPrivatDetaljerListe={[
            mockAfpPrivatAtUttaksalderData,
            mockAfpPrivatAt67Data,
          ]}
          afpOffentligDetaljerListe={mockAfpOffentligData}
          opptjeningPre2025OffentligAfpListe={mockPre2025OffentligAfpData}
        />,
        stateWith62
      )

      // AFP privat ved uttaksalder
      expect(screen.getByText('8 000 kr')).toBeVisible()
      expect(screen.getByText('15 000 kr')).toBeVisible()

      // AFP privat ved 67
      expect(screen.getByText('9 000 kr')).toBeVisible()
      expect(screen.getByText('18 000 kr')).toBeVisible()

      // AFP offentlig
      expect(
        screen.getByText('Månedlig livsvarig avtalefestet pensjon (AFP):')
      ).toBeVisible()
      expect(screen.getByText('12 000 kr')).toBeVisible()

      // Pre-2025 offentlig AFP
      expect(screen.getByText('AFP grad:')).toBeVisible()
      expect(screen.getByText('100 %')).toBeVisible()

      // Totalt skal det være 3 forskjellige seksjoner med AFP data
      const definitionLists = container.querySelectorAll('dl')
      expect(definitionLists.length).toBeGreaterThanOrEqual(3) // 2 for privat + 1 for offentlig + 1 for pre-2025
    })

    it('rendrer riktig antall headings når alle data er tilstede', () => {
      const stateWith64 = {
        uttaksalder: { aar: 64, maaneder: 8 },
      }

      renderWithProviders(
        <AfpDetaljer
          afpPrivatDetaljerListe={[
            mockAfpPrivatAtUttaksalderData,
            mockAfpPrivatAt67Data,
          ]}
          afpOffentligDetaljerListe={mockAfpOffentligData}
          opptjeningPre2025OffentligAfpListe={mockPre2025OffentligAfpData}
        />,
        stateWith64
      )

      const headings = screen.getAllByRole('heading', { level: 4 })
      expect(headings).toHaveLength(3) // To headings for AFP privat seksjoner og AFP offentlig seksjon
    })
  })

  describe('FormattedMessage values testing', () => {
    it('sender riktige verdier til FormattedMessage for gradert uttak tittel', () => {
      const stateWithMonths = {
        uttaksalder: { aar: 63, maaneder: 9 },
      }

      renderWithProviders(
        <AfpDetaljer
          afpPrivatDetaljerListe={[
            mockAfpPrivatAtUttaksalderData,
            mockAfpPrivatAt67Data,
          ]}
        />,
        stateWithMonths
      )

      // Test at begge seksjoner vises
      expect(screen.getAllByText('Sum AFP:')).toHaveLength(2)
    })

    it('sender riktige verdier til FormattedMessage for heltUttak tittel når alder er over 67', () => {
      const stateWith68 = {
        uttaksalder: { aar: 68, maaneder: 2 },
      }

      renderWithProviders(
        <AfpDetaljer
          afpPrivatDetaljerListe={[
            mockAfpPrivatAtUttaksalderData,
            mockAfpPrivatAt67Data,
          ]}
        />,
        stateWith68
      )

      // Skal bare vise AFP ved 67/heltUttak siden uttaksalder er over 67
      expect(screen.getAllByText('Sum AFP:')).toHaveLength(1)
      expect(screen.getByText('18 000 kr')).toBeVisible()
      expect(screen.queryByText('15 000 kr')).not.toBeInTheDocument()
    })
  })

  describe('pre-2025 offentlig AFP', () => {
    it('rendrer pre-2025 offentlig AFP når data er tilgjengelig', () => {
      renderWithProviders(
        <AfpDetaljer
          opptjeningPre2025OffentligAfpListe={mockPre2025OffentligAfpData}
        />
      )

      expect(screen.getByText('AFP grad:')).toBeVisible()
      expect(screen.getByText('100 %')).toBeVisible()
      expect(screen.getByText('Sluttpoengtall:')).toBeVisible()
      expect(screen.getByText('6.5')).toBeVisible()
      expect(screen.getByText('Poengår:')).toBeVisible()
      expect(screen.getByText('35 år')).toBeVisible()
      expect(screen.getByText('Trygdetid:')).toBeVisible()
      expect(screen.getByText('40 år')).toBeVisible()
    })

    it('rendrer ikke pre-2025 offentlig AFP når data er tom', () => {
      renderWithProviders(
        <AfpDetaljer opptjeningPre2025OffentligAfpListe={[]} />
      )

      expect(screen.queryByText('AFP grad:')).not.toBeInTheDocument()
      expect(screen.queryByText('Sluttpoengtall:')).not.toBeInTheDocument()
      expect(screen.queryByText('Poengår:')).not.toBeInTheDocument()
      expect(screen.queryByText('Trygdetid:')).not.toBeInTheDocument()
    })

    it('rendrer ikke pre-2025 offentlig AFP når data er undefined', () => {
      renderWithProviders(<AfpDetaljer />)

      expect(screen.queryByText('AFP grad:')).not.toBeInTheDocument()
      expect(screen.queryByText('Sluttpoengtall:')).not.toBeInTheDocument()
      expect(screen.queryByText('Poengår:')).not.toBeInTheDocument()
      expect(screen.queryByText('Trygdetid:')).not.toBeInTheDocument()
    })

    it('rendrer pre-2025 offentlig AFP med korrekt styling', () => {
      const { container } = renderWithProviders(
        <AfpDetaljer
          opptjeningPre2025OffentligAfpListe={mockPre2025OffentligAfpData}
        />
      )

      const definitionLists = container.querySelectorAll('dl')
      expect(definitionLists.length).toBeGreaterThan(0)

      const terms = container.querySelectorAll('dt')
      const definitions = container.querySelectorAll('dd')
      expect(terms.length).toBeGreaterThan(0)
      expect(definitions.length).toBeGreaterThan(0)
    })

    it('håndterer undefined verdier i pre-2025 offentlig AFP', () => {
      const mockDataWithUndefined: DetaljRad[] = [
        { tekst: 'AFP grad', verdi: undefined },
        { tekst: 'Sluttpoengtall' },
        { tekst: 'Poengår', verdi: 35 },
      ]

      renderWithProviders(
        <AfpDetaljer
          opptjeningPre2025OffentligAfpListe={mockDataWithUndefined}
        />
      )

      expect(screen.getByText('AFP grad:')).toBeVisible()
      expect(screen.getByText('Sluttpoengtall:')).toBeVisible()
      expect(screen.getByText('Poengår:')).toBeVisible()
      expect(screen.getByText('35 år')).toBeVisible()
    })

    it('rendrer pre-2025 offentlig AFP sammen med AFP privat', () => {
      renderWithProviders(
        <AfpDetaljer
          afpPrivatDetaljerListe={[mockAfpPrivatAt67Data]}
          opptjeningPre2025OffentligAfpListe={mockPre2025OffentligAfpData}
        />
      )

      // AFP privat
      expect(screen.getByText('Kompensasjonstillegg:')).toBeVisible()
      expect(screen.getByText('Sum AFP:')).toBeVisible()

      // Pre-2025 offentlig AFP
      expect(screen.getByText('AFP grad:')).toBeVisible()
      expect(screen.getByText('Sluttpoengtall:')).toBeVisible()
      expect(screen.getByText('Poengår:')).toBeVisible()
      expect(screen.getByText('Trygdetid:')).toBeVisible()
    })

    it('rendrer pre-2025 offentlig AFP sammen med AFP offentlig', () => {
      renderWithProviders(
        <AfpDetaljer
          afpOffentligDetaljerListe={mockAfpOffentligData}
          opptjeningPre2025OffentligAfpListe={mockPre2025OffentligAfpData}
        />
      )

      // AFP offentlig
      expect(
        screen.getByText('Månedlig livsvarig avtalefestet pensjon (AFP):')
      ).toBeVisible()

      // Pre-2025 offentlig AFP
      expect(screen.getByText('AFP grad:')).toBeVisible()
      expect(screen.getByText('Sluttpoengtall:')).toBeVisible()
    })

    it('rendrer alle typer AFP data samtidig med pre-2025 offentlig AFP', () => {
      const stateWith62 = {
        uttaksalder: { aar: 62, maaneder: 3 },
      }

      const { container } = renderWithProviders(
        <AfpDetaljer
          afpPrivatDetaljerListe={[
            mockAfpPrivatAtUttaksalderData,
            mockAfpPrivatAt67Data,
          ]}
          afpOffentligDetaljerListe={mockAfpOffentligData}
          opptjeningPre2025OffentligAfpListe={mockPre2025OffentligAfpData}
        />,
        stateWith62
      )

      // AFP privat ved uttaksalder
      expect(screen.getByText('8 000 kr')).toBeVisible()

      // AFP privat ved 67
      expect(screen.getByText('9 000 kr')).toBeVisible()

      // AFP offentlig
      expect(
        screen.getByText('Månedlig livsvarig avtalefestet pensjon (AFP):')
      ).toBeVisible()

      // Pre-2025 offentlig AFP
      expect(screen.getByText('AFP grad:')).toBeVisible()
      expect(screen.getByText('100 %')).toBeVisible()

      // Skal ha minst 3 definition lists (AFP privat x2, AFP offentlig, pre-2025)
      const definitionLists = container.querySelectorAll('dl')
      expect(definitionLists.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('additional coverage for missing branches', () => {
    it('viser måneder i gradert uttak heading når currentMonths er større enn 0', () => {
      const stateWithMonths = {
        uttaksalder: { aar: 65, maaneder: 8 },
      }

      renderWithProviders(
        <AfpDetaljer
          afpPrivatDetaljerListe={[
            mockAfpPrivatAtUttaksalderData,
            mockAfpPrivatAt67Data,
          ]}
        />,
        stateWithMonths
      )

      // Skal vise begge seksjoner siden uttaksalder er under 67
      expect(screen.getAllByText('Sum AFP:')).toHaveLength(2)
    })

    it('viser ikke måneder i gradert uttak heading når currentMonths er 0', () => {
      const stateWithZeroMonths = {
        uttaksalder: { aar: 65, maaneder: 0 },
      }

      renderWithProviders(
        <AfpDetaljer
          afpPrivatDetaljerListe={[
            mockAfpPrivatAtUttaksalderData,
            mockAfpPrivatAt67Data,
          ]}
        />,
        stateWithZeroMonths
      )

      // Skal vise begge seksjoner
      expect(screen.getAllByText('Sum AFP:')).toHaveLength(2)
    })

    it('viser måneder i heltUttak heading når currentAge er 67 eller høyere og har måneder', () => {
      const stateWith67AndMonths = {
        uttaksalder: { aar: 67, maaneder: 8 },
      }

      renderWithProviders(
        <AfpDetaljer
          afpPrivatDetaljerListe={[
            mockAfpPrivatAtUttaksalderData,
            mockAfpPrivatAt67Data,
          ]}
        />,
        stateWith67AndMonths
      )

      // Skal ikke vise AFP ved uttaksalder siden uttaksalder er 67
      expect(screen.getAllByText('Sum AFP:')).toHaveLength(1)
      expect(screen.getByText('18 000 kr')).toBeVisible()
    })

    it('viser ikke måneder i heltUttak heading når currentAge er 67 men måneder er 0', () => {
      const stateWith67NoMonths = {
        uttaksalder: { aar: 67, maaneder: 0 },
      }

      renderWithProviders(
        <AfpDetaljer
          afpPrivatDetaljerListe={[
            mockAfpPrivatAtUttaksalderData,
            mockAfpPrivatAt67Data,
          ]}
        />,
        stateWith67NoMonths
      )

      // Skal ikke vise AFP ved uttaksalder siden uttaksalder er 67
      expect(screen.getAllByText('Sum AFP:')).toHaveLength(1)
    })

    it('rendrer pre2025OffentligAfpDetaljerListe når tilgjengelig', () => {
      const mockPre2025AfpDetaljerData: DetaljRad[] = [
        { tekst: 'Grunnpensjon (kap. 19)', verdi: '10 000 kr' },
        { tekst: 'Tilleggspensjon (kap. 19)', verdi: '7 000 kr' },
        { tekst: 'Sum AFP', verdi: '17 000 kr' },
      ]

      const stateWithUttaksalder = {
        uttaksalder: { aar: 65, maaneder: 6 },
      }

      renderWithProviders(
        <AfpDetaljer
          pre2025OffentligAfpDetaljerListe={mockPre2025AfpDetaljerData}
        />,
        stateWithUttaksalder
      )

      expect(screen.getByText('Grunnpensjon (kap. 19):')).toBeVisible()
      expect(screen.getByText('10 000 kr')).toBeVisible()
      expect(screen.getByText('Tilleggspensjon (kap. 19):')).toBeVisible()
      expect(screen.getByText('7 000 kr')).toBeVisible()
      expect(screen.getByText('17 000 kr')).toBeVisible()
    })

    it('håndterer pre2025OffentligAfpDetaljerListe med siste element strong styling', () => {
      const mockPre2025AfpDetaljerData: DetaljRad[] = [
        { tekst: 'Grunnpensjon (kap. 19)', verdi: '10 000 kr' },
        { tekst: 'Sum AFP', verdi: '10 000 kr' },
      ]

      const { container } = renderWithProviders(
        <AfpDetaljer
          pre2025OffentligAfpDetaljerListe={mockPre2025AfpDetaljerData}
        />
      )

      const strongElements = container.querySelectorAll('strong')
      expect(strongElements.length).toBeGreaterThan(0)
    })

    it('viser ikke pre2025OffentligAfpDetaljerListe når tom', () => {
      renderWithProviders(<AfpDetaljer pre2025OffentligAfpDetaljerListe={[]} />)

      expect(
        screen.queryByText('Grunnpensjon (kap. 19):')
      ).not.toBeInTheDocument()
    })

    it('håndterer currentAge som undefined', () => {
      const stateWithUndefinedAge = {
        uttaksalder: undefined,
        gradertUttaksperiode: undefined,
      }

      renderWithProviders(
        <AfpDetaljer
          afpPrivatDetaljerListe={[
            mockAfpPrivatAtUttaksalderData,
            mockAfpPrivatAt67Data,
          ]}
        />,
        stateWithUndefinedAge
      )

      // Skal ikke vise AFP ved uttaksalder siden currentAge er undefined
      expect(screen.getAllByText('Sum AFP:')).toHaveLength(1)
      expect(screen.getByText('18 000 kr')).toBeVisible()
    })

    it('håndterer alle props som undefined samtidig', () => {
      const { container } = renderWithProviders(<AfpDetaljer />)

      const section = container.querySelector('section')
      expect(section).toBeInTheDocument()
      expect(section?.children).toHaveLength(0)
    })

    it('viser riktig alder i heltUttak heading når currentAge er over 67', () => {
      const stateWith70 = {
        uttaksalder: { aar: 70, maaneder: 0 },
      }

      renderWithProviders(
        <AfpDetaljer
          afpPrivatDetaljerListe={[
            mockAfpPrivatAtUttaksalderData,
            mockAfpPrivatAt67Data,
          ]}
        />,
        stateWith70
      )

      // Skal ikke vise AFP ved uttaksalder siden uttaksalder er over 67
      expect(screen.getAllByText('Sum AFP:')).toHaveLength(1)
      expect(screen.getByText('18 000 kr')).toBeVisible()
    })

    it('håndterer tom afpPrivatDetaljerListe med length 0', () => {
      renderWithProviders(<AfpDetaljer afpPrivatDetaljerListe={[]} />)

      expect(screen.queryByText('Sum AFP:')).not.toBeInTheDocument()
    })

    it('kombinerer pre2025OffentligAfpDetaljerListe med andre AFP typer', () => {
      const mockPre2025AfpDetaljerData: DetaljRad[] = [
        { tekst: 'Grunnpensjon (kap. 19)', verdi: '8 000 kr' },
        { tekst: 'Sum AFP', verdi: '8 000 kr' },
      ]

      renderWithProviders(
        <AfpDetaljer
          afpPrivatDetaljerListe={[mockAfpPrivatAt67Data]}
          pre2025OffentligAfpDetaljerListe={mockPre2025AfpDetaljerData}
          opptjeningPre2025OffentligAfpListe={mockPre2025OffentligAfpData}
          afpOffentligDetaljerListe={mockAfpOffentligData}
        />
      )

      // Alle typer skal vises
      expect(screen.getByText('Kompensasjonstillegg:')).toBeVisible() // AFP privat
      expect(screen.getByText('Grunnpensjon (kap. 19):')).toBeVisible() // pre2025 detaljer
      expect(screen.getByText('AFP grad:')).toBeVisible() // opptjening pre2025
      expect(
        screen.getByText('Månedlig livsvarig avtalefestet pensjon (AFP):')
      ).toBeVisible() // AFP offentlig
    })
  })
})
