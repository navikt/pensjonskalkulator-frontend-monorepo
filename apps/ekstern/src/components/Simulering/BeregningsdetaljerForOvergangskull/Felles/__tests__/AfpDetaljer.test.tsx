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

// Hjelpe funksjon som destrukturerer AfpDetaljerListe
const createAfpDetaljerListe = (options: {
  afpPrivat?: DetaljRad[]
  afpOffentlig?: DetaljRad[]
  afpOffentligSpk?: DetaljRad[]
  pre2025OffentligAfp?: DetaljRad[]
  opptjeningPre2025OffentligAfp?: DetaljRad[]
}) => ({
  afpPrivat: options.afpPrivat || [],
  afpOffentlig: options.afpOffentlig || [],
  pre2025OffentligAfp: options.pre2025OffentligAfp || [],
  opptjeningPre2025OffentligAfp: options.opptjeningPre2025OffentligAfp || [],
  afpOffentligSpk: options.afpOffentligSpk || [],
})

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
  'beregning.detaljer.grunnpensjon.afp.table.title':
    'AFP grunnpensjon beregning',
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
    { tekst: 'AFP grad', verdi: '100 %' },
    { tekst: 'Sluttpoengtall', verdi: 6.5 },
    { tekst: 'Poengår', verdi: '35 år' },
    { tekst: 'Trygdetid', verdi: '40 år' },
  ]

  const mockAfpOffentligData: DetaljRad[] = [
    {
      tekst: 'Månedlig livsvarig avtalefestet pensjon (AFP)',
      verdi: '12 000 kr',
    },
    { tekst: 'Tillegg for ansiennitet', verdi: '3 000 kr' },
  ]

  it('rendrer komponenten uten data', () => {
    const emptyAfpDetaljer = createAfpDetaljerListe({})
    const { container } = renderWithProviders(
      <AfpDetaljer
        afpDetaljForValgtUttak={emptyAfpDetaljer}
        alderspensjonColumnsCount={3}
      />
    )

    const box = container.querySelector('.navds-box')
    expect(box).toBeInTheDocument()
  })

  it('rendrer kun AFP privat ved 67 år når uttaksalder er 67 eller høyere', () => {
    const stateWith67 = {
      uttaksalder: { aar: 67, maaneder: 0 },
    }

    renderWithProviders(
      <AfpDetaljer
        afpDetaljForValgtUttak={createAfpDetaljerListe({
          afpPrivat: mockAfpPrivatAt67Data,
        })}
        alderspensjonColumnsCount={3}
      />,
      stateWith67
    )

    // Komponenten rendrer både desktop og mobil, så vi bruker getAllByText
    expect(screen.getAllByText('Kompensasjonstillegg:')[0]).toBeVisible()
    expect(screen.getAllByText('9 000 kr')[0]).toBeVisible()
    expect(screen.getAllByText('Kronetillegg:')[0]).toBeVisible()
    expect(screen.getAllByText('6 000 kr')[0]).toBeVisible()
    expect(screen.getAllByText('Livsvarig del:')[0]).toBeVisible()
    expect(screen.getAllByText('3 000 kr')[0]).toBeVisible()
    expect(screen.getAllByText('Sum AFP:')[0]).toBeVisible()
    expect(screen.getAllByText('18 000 kr')[0]).toBeVisible()
  })

  it('rendrer AFP privat når uttaksalder er under 67', () => {
    const stateWith62 = {
      uttaksalder: { aar: 62, maaneder: 0 },
    }

    renderWithProviders(
      <AfpDetaljer
        afpDetaljForValgtUttak={createAfpDetaljerListe({
          afpPrivat: mockAfpPrivatAtUttaksalderData,
        })}
        alderspensjonColumnsCount={3}
      />,
      stateWith62
    )

    // Komponenten rendrer både desktop og mobil
    expect(screen.getAllByText('Kompensasjonstillegg:')[0]).toBeVisible()
    expect(screen.getAllByText('Kronetillegg:')[0]).toBeVisible()
    expect(screen.getAllByText('Livsvarig del:')[0]).toBeVisible()
    expect(screen.getAllByText('Sum AFP:')[0]).toBeVisible()

    // Sjekk spesifikke verdier fra uttaksalder data
    expect(screen.getAllByText('8 000 kr')[0]).toBeVisible() // Kompensasjonstillegg ved uttaksalder
    expect(screen.getAllByText('5 000 kr')[0]).toBeVisible() // Kronetillegg ved uttaksalder
    expect(screen.getAllByText('2 000 kr')[0]).toBeVisible() // Livsvarig del ved uttaksalder
    expect(screen.getAllByText('15 000 kr')[0]).toBeVisible() // Sum ved uttaksalder
  })

  it('rendrer ikke AFP privat ved uttaksalder når uttaksalder er 67 eller høyere', () => {
    const stateWith67 = {
      uttaksalder: { aar: 67, maaneder: 0 },
    }

    renderWithProviders(
      <AfpDetaljer
        afpDetaljForValgtUttak={createAfpDetaljerListe({
          afpPrivat: mockAfpPrivatAt67Data,
        })}
        alderspensjonColumnsCount={3}
      />,
      stateWith67
    )

    // Skal ikke vise AFP ved uttaksalder siden uttaksalder er 67
    expect(screen.queryByText('8 000 kr')).not.toBeInTheDocument()
    expect(screen.queryByText('15 000 kr')).not.toBeInTheDocument()

    // Men skal vise AFP ved 67
    expect(screen.getAllByText('Sum AFP:')[0]).toBeVisible()
    expect(screen.getAllByText('18 000 kr')[0]).toBeVisible()
  })

  it('rendrer pre-2025 offentlig AFP når data er tilgjengelig', () => {
    renderWithProviders(
      <AfpDetaljer
        afpDetaljForValgtUttak={createAfpDetaljerListe({
          opptjeningPre2025OffentligAfp: mockPre2025OffentligAfpData,
        })}
        alderspensjonColumnsCount={3}
      />
    )

    expect(screen.getAllByText('AFP grad:')[0]).toBeVisible()
    expect(screen.getAllByText('100 %')[0]).toBeVisible()
    expect(screen.getAllByText('Sluttpoengtall:')[0]).toBeVisible()
    expect(screen.getAllByText('6.5')[0]).toBeVisible()
    expect(screen.getAllByText('Poengår:')[0]).toBeVisible()
    expect(screen.getAllByText('35 år')[0]).toBeVisible()
    expect(screen.getAllByText('Trygdetid:')[0]).toBeVisible()
    expect(screen.getAllByText('40 år')[0]).toBeVisible()
  })

  it('rendrer både AFP privat og pre-2025 offentlig AFP samtidig', () => {
    renderWithProviders(
      <AfpDetaljer
        afpDetaljForValgtUttak={createAfpDetaljerListe({
          afpPrivat: mockAfpPrivatAt67Data,
          opptjeningPre2025OffentligAfp: mockPre2025OffentligAfpData,
        })}
        alderspensjonColumnsCount={3}
      />
    )

    // AFP privat
    expect(screen.getAllByText('Kompensasjonstillegg:')[0]).toBeVisible()
    expect(screen.getAllByText('Sum AFP:')[0]).toBeVisible()

    // Pre-2025 offentlig AFP
    expect(screen.getAllByText('AFP grad:')[0]).toBeVisible()
    expect(screen.getAllByText('Trygdetid:')[0]).toBeVisible()
  })

  it('rendrer ikke noe når alle data er tomme eller undefined', () => {
    const { container } = renderWithProviders(
      <AfpDetaljer
        afpDetaljForValgtUttak={createAfpDetaljerListe({})}
        alderspensjonColumnsCount={3}
      />
    )

    // Kun box elementet skal være tilstede
    const box = container.querySelector('.navds-box')
    expect(box).toBeInTheDocument()
    expect(screen.queryByText('Kompensasjonstillegg:')).not.toBeInTheDocument()
    expect(screen.queryByText('AFP grad:')).not.toBeInTheDocument()
  })

  it('håndterer undefined verdier i DetaljRad objekter', () => {
    const objektMedUndefined: DetaljRad[] = [
      { tekst: 'Test AFP', verdi: undefined },
      { tekst: 'Test AFP 2' },
    ]

    renderWithProviders(
      <AfpDetaljer
        afpDetaljForValgtUttak={createAfpDetaljerListe({
          afpPrivat: objektMedUndefined,
        })}
        alderspensjonColumnsCount={3}
      />
    )

    expect(screen.getAllByText('Test AFP:')[0]).toBeVisible()
    expect(screen.getAllByText('Test AFP 2:')[0]).toBeVisible()
  })

  it('rendrer headings korrekt for AFP privat seksjoner', () => {
    const stateWith62 = {
      uttaksalder: { aar: 62, maaneder: 6 },
    }

    renderWithProviders(
      <AfpDetaljer
        afpDetaljForValgtUttak={createAfpDetaljerListe({
          afpPrivat: mockAfpPrivatAtUttaksalderData,
        })}
        alderspensjonColumnsCount={3}
      />,
      stateWith62
    )

    const strongElements = screen.getAllByText('AFP privat beregning')
    expect(strongElements).toHaveLength(2) // En for desktop og en for mobile
  })

  it('rendrer siste element i hver array med strong styling', () => {
    const { container } = renderWithProviders(
      <AfpDetaljer
        afpDetaljForValgtUttak={createAfpDetaljerListe({
          afpPrivat: mockAfpPrivatAt67Data,
        })}
        alderspensjonColumnsCount={3}
      />
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
        afpDetaljForValgtUttak={createAfpDetaljerListe({
          afpPrivat: mockAfpPrivatAtUttaksalderData,
        })}
        alderspensjonColumnsCount={3}
      />,
      stateWithMonths
    )

    // Skal vise AFP privat siden uttaksalder er under 67
    expect(screen.getAllByText('Sum AFP:')[0]).toBeVisible()
    expect(screen.getAllByText('15 000 kr')[0]).toBeVisible() // Ved uttaksalder
  })

  it('rendrer VStack med korrekt gap for AFP privat', () => {
    const { container } = renderWithProviders(
      <AfpDetaljer
        afpDetaljForValgtUttak={createAfpDetaljerListe({
          afpPrivat: mockAfpPrivatAt67Data,
        })}
        alderspensjonColumnsCount={3}
      />
    )

    const vStack = container.querySelector('.navds-stack')
    expect(vStack).toBeVisible()
  })

  it('rendrer definition lists korrekt', () => {
    const { container } = renderWithProviders(
      <AfpDetaljer
        afpDetaljForValgtUttak={createAfpDetaljerListe({
          afpPrivat: mockAfpPrivatAt67Data,
          opptjeningPre2025OffentligAfp: mockPre2025OffentligAfpData,
        })}
        alderspensjonColumnsCount={3}
      />
    )

    const definitionLists = container.querySelectorAll('dl')
    expect(definitionLists).toHaveLength(4) // 2 for AFP privat (desktop + mobile) og 2 for pre-2025 offentlig (desktop + mobile)

    const terms = container.querySelectorAll('dt')
    const definitions = container.querySelectorAll('dd')
    expect(terms.length).toBeGreaterThan(0)
    expect(definitions.length).toBeGreaterThan(0)
  })

  it('håndterer kun ett element i afpPrivat array', () => {
    renderWithProviders(
      <AfpDetaljer
        afpDetaljForValgtUttak={createAfpDetaljerListe({
          afpPrivat: mockAfpPrivatAt67Data,
        })}
        alderspensjonColumnsCount={3}
      />
    )

    // Skal vise AFP privat
    expect(screen.getAllByText('Sum AFP:')[0]).toBeVisible()
    expect(screen.getAllByText('18 000 kr')[0]).toBeVisible()
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
          afpDetaljForValgtUttak={createAfpDetaljerListe({
            afpPrivat: mockAfpPrivatAtUttaksalderData,
          })}
          alderspensjonColumnsCount={3}
        />,
        stateWithGradertUttak
      )

      // Skal vise AFP siden gradertUttak alder (62) er under 67
      expect(screen.getAllByText('Sum AFP:')[0]).toBeVisible()
      expect(screen.getAllByText('15 000 kr')[0]).toBeVisible() // Ved gradert uttaksalder
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
          afpDetaljForValgtUttak={createAfpDetaljerListe({
            afpPrivat: mockAfpPrivatAt67Data,
          })}
          alderspensjonColumnsCount={3}
        />,
        stateWithGradertUttakAt67
      )

      // Skal vise AFP ved 67 siden gradertUttak alder er 67
      expect(screen.getAllByText('Sum AFP:')[0]).toBeVisible()
      expect(screen.getAllByText('18 000 kr')[0]).toBeVisible() // Ved 67
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
          afpDetaljForValgtUttak={createAfpDetaljerListe({
            afpPrivat: mockAfpPrivatAtUttaksalderData,
          })}
          alderspensjonColumnsCount={3}
        />,
        stateWithGradertUttakWithMonths
      )

      // Skal vise AFP siden gradert alder (63) er under 67
      expect(screen.getAllByText('Sum AFP:')[0]).toBeVisible()
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
          afpDetaljForValgtUttak={createAfpDetaljerListe({
            afpPrivat: mockAfpPrivatAtUttaksalderData,
          })}
          alderspensjonColumnsCount={3}
        />,
        stateWithGradertUttakUnder67
      )

      // Skal vise AFP
      expect(screen.getAllByText('Sum AFP:')[0]).toBeVisible()
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
          afpDetaljForValgtUttak={createAfpDetaljerListe({
            afpPrivat: mockAfpPrivatAt67Data,
          })}
          alderspensjonColumnsCount={3}
        />,
        stateWithGradertUttakOver67
      )

      // Skal vise AFP ved 67 siden gradert alder er over 67
      expect(screen.getAllByText('Sum AFP:')[0]).toBeVisible()
      expect(screen.getAllByText('18 000 kr')[0]).toBeVisible() // Ved 67
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
          afpDetaljForValgtUttak={createAfpDetaljerListe({
            afpPrivat: mockAfpPrivatAtUttaksalderData,
          })}
          alderspensjonColumnsCount={3}
        />,
        stateWithGradertUttakNoMonths
      )

      // Skal vise AFP siden gradert alder (64) er under 67
      expect(screen.getAllByText('Sum AFP:')[0]).toBeVisible()
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
          afpDetaljForValgtUttak={createAfpDetaljerListe({
            afpPrivat: mockAfpPrivatAtUttaksalderData,
          })}
          alderspensjonColumnsCount={3}
        />,
        stateWithIncompleteGradertUttak
      )

      // Skal falle tilbake til uttaksalder (65) og vise AFP
      expect(screen.getAllByText('Sum AFP:')[0]).toBeVisible()
    })
  })

  describe('afpOffentligDetaljerListe', () => {
    it('rendrer AFP offentlig når data er tilgjengelig', () => {
      renderWithProviders(
        <AfpDetaljer
          afpDetaljForValgtUttak={createAfpDetaljerListe({
            afpOffentlig: mockAfpOffentligData,
          })}
          alderspensjonColumnsCount={3}
        />
      )

      expect(
        screen.getAllByText('Månedlig livsvarig avtalefestet pensjon (AFP):')[0]
      ).toBeVisible()
      expect(screen.getAllByText('12 000 kr')[0]).toBeVisible()
      expect(screen.getAllByText('Tillegg for ansiennitet:')[0]).toBeVisible()
      expect(screen.getAllByText('3 000 kr')[0]).toBeVisible()
    })

    it('rendrer AFP offentlig med strong styling for alle elementer', () => {
      const { container } = renderWithProviders(
        <AfpDetaljer
          afpDetaljForValgtUttak={createAfpDetaljerListe({
            afpOffentlig: mockAfpOffentligData,
          })}
          alderspensjonColumnsCount={3}
        />
      )

      const strongElements = container.querySelectorAll('strong')
      // Alle dt og dd skal være strong for AFP offentlig
      expect(strongElements.length).toBeGreaterThanOrEqual(4) // minst 2 dt + 2 dd
    })

    it('rendrer ikke AFP offentlig når lista er tom', () => {
      renderWithProviders(
        <AfpDetaljer
          afpDetaljForValgtUttak={createAfpDetaljerListe({})}
          alderspensjonColumnsCount={3}
        />
      )

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
        <AfpDetaljer
          afpDetaljForValgtUttak={createAfpDetaljerListe({
            afpOffentlig: afpOffentligMedUndefined,
          })}
          alderspensjonColumnsCount={3}
        />
      )

      expect(screen.getAllByText('Test AFP offentlig:')[0]).toBeVisible()
      expect(screen.getAllByText('Test AFP offentlig 2:')[0]).toBeVisible()
    })

    it('rendrer AFP offentlig sammen med AFP privat', () => {
      renderWithProviders(
        <AfpDetaljer
          afpDetaljForValgtUttak={createAfpDetaljerListe({
            afpPrivat: mockAfpPrivatAt67Data,
            afpOffentlig: mockAfpOffentligData,
          })}
          alderspensjonColumnsCount={3}
        />
      )

      // AFP privat
      expect(screen.getAllByText('Kompensasjonstillegg:')[0]).toBeVisible()
      expect(screen.getAllByText('Sum AFP:')[0]).toBeVisible()

      // AFP offentlig
      expect(
        screen.getAllByText('Månedlig livsvarig avtalefestet pensjon (AFP):')[0]
      ).toBeVisible()
      expect(screen.getAllByText('12 000 kr')[0]).toBeVisible()
    })

    it('rendrer AFP offentlig sammen med pre-2025 offentlig AFP', () => {
      renderWithProviders(
        <AfpDetaljer
          afpDetaljForValgtUttak={createAfpDetaljerListe({
            afpOffentlig: mockAfpOffentligData,
            opptjeningPre2025OffentligAfp: mockPre2025OffentligAfpData,
          })}
          alderspensjonColumnsCount={3}
        />
      )

      // AFP offentlig
      expect(
        screen.getAllByText('Månedlig livsvarig avtalefestet pensjon (AFP):')[0]
      ).toBeVisible()

      // Pre-2025 offentlig AFP
      expect(screen.getAllByText('AFP grad:')[0]).toBeVisible()
      expect(screen.getAllByText('Trygdetid:')[0]).toBeVisible()
    })
  })

  describe('edge cases og spesifikke scenarier', () => {
    it('håndterer tom afpPrivat array', () => {
      renderWithProviders(
        <AfpDetaljer
          afpDetaljForValgtUttak={createAfpDetaljerListe({})}
          alderspensjonColumnsCount={3}
        />
      )

      expect(screen.queryByText('Sum AFP:')).not.toBeInTheDocument()
    })

    it('håndterer afpPrivat med kun tomt array', () => {
      renderWithProviders(
        <AfpDetaljer
          afpDetaljForValgtUttak={createAfpDetaljerListe({ afpPrivat: [] })}
          alderspensjonColumnsCount={3}
        />
      )

      expect(screen.queryByText('Sum AFP:')).not.toBeInTheDocument()
    })

    it('håndterer afpPrivat med tom array', () => {
      renderWithProviders(
        <AfpDetaljer
          afpDetaljForValgtUttak={createAfpDetaljerListe({ afpPrivat: [] })}
          alderspensjonColumnsCount={3}
        />
      )

      expect(screen.queryByText('Sum AFP:')).not.toBeInTheDocument()
    })

    it('rendrer kun første array når afpPrivat har ett element og uttaksalder under 67', () => {
      const stateWith65 = {
        uttaksalder: { aar: 65, maaneder: 0 },
      }

      renderWithProviders(
        <AfpDetaljer
          afpDetaljForValgtUttak={createAfpDetaljerListe({
            afpPrivat: mockAfpPrivatAtUttaksalderData,
          })}
          alderspensjonColumnsCount={3}
        />,
        stateWith65
      )

      // Skal vise AFP siden uttaksalder er under 67
      expect(screen.getAllByText('Sum AFP:')[0]).toBeVisible()
      expect(screen.getAllByText('15 000 kr')[0]).toBeVisible()
    })

    it('viser ikke måneder i heading når currentMonths er 0', () => {
      const stateWithZeroMonths = {
        uttaksalder: { aar: 65, maaneder: 0 },
      }

      renderWithProviders(
        <AfpDetaljer
          afpDetaljForValgtUttak={createAfpDetaljerListe({
            afpPrivat: mockAfpPrivatAtUttaksalderData,
          })}
          alderspensjonColumnsCount={3}
        />,
        stateWithZeroMonths
      )

      // Skal vise AFP
      expect(screen.getAllByText('Sum AFP:')[0]).toBeVisible()
    })

    it('håndterer undefined uttaksalder', () => {
      const stateWithUndefinedUttaksalder = {
        uttaksalder: undefined,
      }

      renderWithProviders(
        <AfpDetaljer
          afpDetaljForValgtUttak={createAfpDetaljerListe({
            afpPrivat: mockAfpPrivatAt67Data,
          })}
          alderspensjonColumnsCount={3}
        />,
        stateWithUndefinedUttaksalder
      )

      // Skal vise AFP ved 67
      expect(screen.getAllByText('Sum AFP:')[0]).toBeVisible()
      expect(screen.getAllByText('18 000 kr')[0]).toBeVisible() // Kun AFP ved 67
    })

    it('håndterer undefined uttaksalder år', () => {
      const stateWithUndefinedYear = {
        uttaksalder: { aar: undefined, maaneder: 6 },
      }

      renderWithProviders(
        <AfpDetaljer
          afpDetaljForValgtUttak={createAfpDetaljerListe({
            afpPrivat: mockAfpPrivatAt67Data,
          })}
          alderspensjonColumnsCount={3}
        />,
        stateWithUndefinedYear
      )

      // Skal vise AFP ved 67
      expect(screen.getAllByText('Sum AFP:')[0]).toBeVisible()
      expect(screen.getAllByText('18 000 kr')[0]).toBeVisible() // Kun AFP ved 67
    })

    it('håndterer alle props som undefined', () => {
      const { container } = renderWithProviders(
        <AfpDetaljer
          afpDetaljForValgtUttak={createAfpDetaljerListe({})}
          alderspensjonColumnsCount={3}
        />
      )
      const box = container.querySelector('.navds-box')
      expect(box).toBeInTheDocument()
    })
  })

  describe('integrering med alle props samtidig', () => {
    it('rendrer alle typer AFP data samtidig', () => {
      const stateWith62 = {
        uttaksalder: { aar: 62, maaneder: 3 },
      }

      const { container } = renderWithProviders(
        <AfpDetaljer
          afpDetaljForValgtUttak={createAfpDetaljerListe({
            afpPrivat: mockAfpPrivatAtUttaksalderData,
            afpOffentlig: mockAfpOffentligData,
            opptjeningPre2025OffentligAfp: mockPre2025OffentligAfpData,
          })}
          alderspensjonColumnsCount={3}
        />,
        stateWith62
      )

      // AFP privat
      expect(screen.getAllByText('8 000 kr')[0]).toBeVisible()
      expect(screen.getAllByText('15 000 kr')[0]).toBeVisible()

      // AFP offentlig
      expect(
        screen.getAllByText('Månedlig livsvarig avtalefestet pensjon (AFP):')[0]
      ).toBeVisible()
      expect(screen.getAllByText('12 000 kr')[0]).toBeVisible()

      // Pre-2025 offentlig AFP
      expect(screen.getAllByText('AFP grad:')[0]).toBeVisible()
      expect(screen.getAllByText('100 %')[0]).toBeVisible()

      // Totalt skal det være minst 3 forskjellige seksjoner med AFP data (hver har desktop + mobile)
      const definitionLists = container.querySelectorAll('dl')
      expect(definitionLists.length).toBeGreaterThanOrEqual(3)
    })

    it('rendrer riktig antall headings når alle data er tilstede', () => {
      const stateWith64 = {
        uttaksalder: { aar: 64, maaneder: 8 },
      }

      renderWithProviders(
        <AfpDetaljer
          afpDetaljForValgtUttak={createAfpDetaljerListe({
            afpPrivat: mockAfpPrivatAtUttaksalderData,
            afpOffentlig: mockAfpOffentligData,
            opptjeningPre2025OffentligAfp: mockPre2025OffentligAfpData,
          })}
          alderspensjonColumnsCount={3}
        />,
        stateWith64
      )

      const afpPrivatHeadings = screen.getAllByText('AFP privat beregning')
      const afpOffentligHeadings = screen.getAllByText(
        'AFP offentlig beregning'
      )
      expect(afpPrivatHeadings.length).toBeGreaterThanOrEqual(2) // Minst 2 headings (desktop + mobile)
      expect(afpOffentligHeadings.length).toBeGreaterThanOrEqual(2) // Minst 2 headings (desktop + mobile)
    })
  })

  describe('FormattedMessage values testing', () => {
    it('sender riktige verdier til FormattedMessage for gradert uttak tittel', () => {
      const stateWithMonths = {
        uttaksalder: { aar: 63, maaneder: 9 },
      }

      renderWithProviders(
        <AfpDetaljer
          afpDetaljForValgtUttak={createAfpDetaljerListe({
            afpPrivat: mockAfpPrivatAtUttaksalderData,
          })}
          alderspensjonColumnsCount={3}
        />,
        stateWithMonths
      )

      // Test at AFP vises
      expect(screen.getAllByText('Sum AFP:')[0]).toBeVisible()
    })

    it('sender riktige verdier til FormattedMessage for heltUttak tittel når alder er over 67', () => {
      const stateWith68 = {
        uttaksalder: { aar: 68, maaneder: 2 },
      }

      renderWithProviders(
        <AfpDetaljer
          afpDetaljForValgtUttak={createAfpDetaljerListe({
            afpPrivat: mockAfpPrivatAt67Data,
          })}
          alderspensjonColumnsCount={3}
        />,
        stateWith68
      )

      // Skal vise AFP ved 67 siden uttaksalder er over 67
      expect(screen.getAllByText('Sum AFP:')[0]).toBeVisible()
      expect(screen.getAllByText('18 000 kr')[0]).toBeVisible()
    })
  })

  describe('pre-2025 offentlig AFP', () => {
    it('rendrer pre-2025 offentlig AFP når data er tilgjengelig', () => {
      renderWithProviders(
        <AfpDetaljer
          afpDetaljForValgtUttak={createAfpDetaljerListe({
            opptjeningPre2025OffentligAfp: mockPre2025OffentligAfpData,
          })}
          alderspensjonColumnsCount={3}
        />
      )

      expect(screen.getAllByText('AFP grad:')[0]).toBeVisible()
      expect(screen.getAllByText('100 %')[0]).toBeVisible()
      expect(screen.getAllByText('Sluttpoengtall:')[0]).toBeVisible()
      expect(screen.getAllByText('6.5')[0]).toBeVisible()
      expect(screen.getAllByText('Poengår:')[0]).toBeVisible()
      expect(screen.getAllByText('35 år')[0]).toBeVisible()
      expect(screen.getAllByText('Trygdetid:')[0]).toBeVisible()
      expect(screen.getAllByText('40 år')[0]).toBeVisible()
    })

    it('rendrer ikke pre-2025 offentlig AFP når data er tom', () => {
      renderWithProviders(
        <AfpDetaljer
          afpDetaljForValgtUttak={createAfpDetaljerListe({})}
          alderspensjonColumnsCount={3}
        />
      )

      expect(screen.queryByText('AFP grad:')).not.toBeInTheDocument()
      expect(screen.queryByText('Sluttpoengtall:')).not.toBeInTheDocument()
      expect(screen.queryByText('Poengår:')).not.toBeInTheDocument()
      expect(screen.queryByText('Trygdetid:')).not.toBeInTheDocument()
    })

    it('rendrer ikke pre-2025 offentlig AFP når data er undefined', () => {
      renderWithProviders(
        <AfpDetaljer
          afpDetaljForValgtUttak={createAfpDetaljerListe({})}
          alderspensjonColumnsCount={3}
        />
      )

      expect(screen.queryByText('AFP grad:')).not.toBeInTheDocument()
      expect(screen.queryByText('Sluttpoengtall:')).not.toBeInTheDocument()
      expect(screen.queryByText('Poengår:')).not.toBeInTheDocument()
      expect(screen.queryByText('Trygdetid:')).not.toBeInTheDocument()
    })

    it('rendrer pre-2025 offentlig AFP med korrekt styling', () => {
      const { container } = renderWithProviders(
        <AfpDetaljer
          afpDetaljForValgtUttak={createAfpDetaljerListe({
            opptjeningPre2025OffentligAfp: mockPre2025OffentligAfpData,
          })}
          alderspensjonColumnsCount={3}
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
        { tekst: 'Poengår', verdi: '35 år' },
      ]

      renderWithProviders(
        <AfpDetaljer
          afpDetaljForValgtUttak={createAfpDetaljerListe({
            opptjeningPre2025OffentligAfp: mockDataWithUndefined,
          })}
          alderspensjonColumnsCount={3}
        />
      )

      expect(screen.getAllByText('AFP grad:')[0]).toBeVisible()
      expect(screen.getAllByText('Sluttpoengtall:')[0]).toBeVisible()
      expect(screen.getAllByText('Poengår:')[0]).toBeVisible()
      expect(screen.getAllByText('35 år')[0]).toBeVisible()
    })

    it('rendrer pre-2025 offentlig AFP sammen med AFP privat', () => {
      renderWithProviders(
        <AfpDetaljer
          afpDetaljForValgtUttak={createAfpDetaljerListe({
            afpPrivat: mockAfpPrivatAt67Data,
            opptjeningPre2025OffentligAfp: mockPre2025OffentligAfpData,
          })}
          alderspensjonColumnsCount={3}
        />
      )

      // AFP privat
      expect(screen.getAllByText('Kompensasjonstillegg:')[0]).toBeVisible()
      expect(screen.getAllByText('Sum AFP:')[0]).toBeVisible()

      // Pre-2025 offentlig AFP
      expect(screen.getAllByText('AFP grad:')[0]).toBeVisible()
      expect(screen.getAllByText('Sluttpoengtall:')[0]).toBeVisible()
      expect(screen.getAllByText('Poengår:')[0]).toBeVisible()
      expect(screen.getAllByText('Trygdetid:')[0]).toBeVisible()
    })

    it('rendrer pre-2025 offentlig AFP sammen med AFP offentlig', () => {
      renderWithProviders(
        <AfpDetaljer
          afpDetaljForValgtUttak={createAfpDetaljerListe({
            afpOffentlig: mockAfpOffentligData,
            opptjeningPre2025OffentligAfp: mockPre2025OffentligAfpData,
          })}
          alderspensjonColumnsCount={3}
        />
      )

      // AFP offentlig
      expect(
        screen.getAllByText('Månedlig livsvarig avtalefestet pensjon (AFP):')[0]
      ).toBeVisible()

      // Pre-2025 offentlig AFP
      expect(screen.getAllByText('AFP grad:')[0]).toBeVisible()
      expect(screen.getAllByText('Sluttpoengtall:')[0]).toBeVisible()
    })

    it('rendrer alle typer AFP data samtidig med pre-2025 offentlig AFP', () => {
      const stateWith62 = {
        uttaksalder: { aar: 62, maaneder: 3 },
      }

      const { container } = renderWithProviders(
        <AfpDetaljer
          afpDetaljForValgtUttak={createAfpDetaljerListe({
            afpPrivat: mockAfpPrivatAtUttaksalderData,
            afpOffentlig: mockAfpOffentligData,
            opptjeningPre2025OffentligAfp: mockPre2025OffentligAfpData,
          })}
          alderspensjonColumnsCount={3}
        />,
        stateWith62
      )

      // AFP privat
      expect(screen.getAllByText('8 000 kr')[0]).toBeVisible()

      // AFP offentlig
      expect(
        screen.getAllByText('Månedlig livsvarig avtalefestet pensjon (AFP):')[0]
      ).toBeVisible()

      // Pre-2025 offentlig AFP
      expect(screen.getAllByText('AFP grad:')[0]).toBeVisible()
      expect(screen.getAllByText('100 %')[0]).toBeVisible()

      // Skal ha minst 3 definition lists
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
          afpDetaljForValgtUttak={createAfpDetaljerListe({
            afpPrivat: mockAfpPrivatAtUttaksalderData,
          })}
          alderspensjonColumnsCount={3}
        />,
        stateWithMonths
      )

      // Skal vise AFP siden uttaksalder er under 67
      expect(screen.getAllByText('Sum AFP:')[0]).toBeVisible()
    })

    it('viser ikke måneder i gradert uttak heading når currentMonths er 0', () => {
      const stateWithZeroMonths = {
        uttaksalder: { aar: 65, maaneder: 0 },
      }

      renderWithProviders(
        <AfpDetaljer
          afpDetaljForValgtUttak={createAfpDetaljerListe({
            afpPrivat: mockAfpPrivatAtUttaksalderData,
          })}
          alderspensjonColumnsCount={3}
        />,
        stateWithZeroMonths
      )

      // Skal vise AFP
      expect(screen.getAllByText('Sum AFP:')[0]).toBeVisible()
    })

    it('viser måneder i heltUttak heading når currentAge er 67 eller høyere og har måneder', () => {
      const stateWith67AndMonths = {
        uttaksalder: { aar: 67, maaneder: 8 },
      }

      renderWithProviders(
        <AfpDetaljer
          afpDetaljForValgtUttak={createAfpDetaljerListe({
            afpPrivat: mockAfpPrivatAt67Data,
          })}
          alderspensjonColumnsCount={3}
        />,
        stateWith67AndMonths
      )

      // Skal vise AFP ved 67 siden uttaksalder er 67
      expect(screen.getAllByText('Sum AFP:')[0]).toBeVisible()
      expect(screen.getAllByText('18 000 kr')[0]).toBeVisible()
    })

    it('viser ikke måneder i heltUttak heading når currentAge er 67 men måneder er 0', () => {
      const stateWith67NoMonths = {
        uttaksalder: { aar: 67, maaneder: 0 },
      }

      renderWithProviders(
        <AfpDetaljer
          afpDetaljForValgtUttak={createAfpDetaljerListe({
            afpPrivat: mockAfpPrivatAt67Data,
          })}
          alderspensjonColumnsCount={3}
        />,
        stateWith67NoMonths
      )

      // Skal vise AFP ved 67 siden uttaksalder er 67
      expect(screen.getAllByText('Sum AFP:')[0]).toBeVisible()
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
          afpDetaljForValgtUttak={createAfpDetaljerListe({
            pre2025OffentligAfp: mockPre2025AfpDetaljerData,
          })}
          alderspensjonColumnsCount={3}
        />,
        stateWithUttaksalder
      )

      expect(screen.getAllByText('Grunnpensjon (kap. 19):')[0]).toBeVisible()
      expect(screen.getAllByText('10 000 kr')[0]).toBeVisible()
      expect(screen.getAllByText('Tilleggspensjon (kap. 19):')[0]).toBeVisible()
      expect(screen.getAllByText('7 000 kr')[0]).toBeVisible()
      expect(screen.getAllByText('17 000 kr')[0]).toBeVisible()
    })

    it('håndterer pre2025OffentligAfpDetaljerListe med siste element strong styling', () => {
      const mockPre2025AfpDetaljerData: DetaljRad[] = [
        { tekst: 'Grunnpensjon (kap. 19)', verdi: '10 000 kr' },
        { tekst: 'Sum AFP', verdi: '10 000 kr' },
      ]

      const { container } = renderWithProviders(
        <AfpDetaljer
          afpDetaljForValgtUttak={createAfpDetaljerListe({
            pre2025OffentligAfp: mockPre2025AfpDetaljerData,
          })}
          alderspensjonColumnsCount={3}
        />
      )

      const strongElements = container.querySelectorAll('strong')
      expect(strongElements.length).toBeGreaterThan(0)
    })

    it('viser ikke pre2025OffentligAfpDetaljerListe når tom', () => {
      renderWithProviders(
        <AfpDetaljer
          afpDetaljForValgtUttak={createAfpDetaljerListe({})}
          alderspensjonColumnsCount={3}
        />
      )

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
          afpDetaljForValgtUttak={createAfpDetaljerListe({
            afpPrivat: mockAfpPrivatAt67Data,
          })}
          alderspensjonColumnsCount={3}
        />,
        stateWithUndefinedAge
      )

      // Skal vise AFP ved 67 siden currentAge er undefined
      expect(screen.getAllByText('Sum AFP:')[0]).toBeVisible()
      expect(screen.getAllByText('18 000 kr')[0]).toBeVisible()
    })

    it('håndterer alle props som undefined samtidig', () => {
      const { container } = renderWithProviders(
        <AfpDetaljer
          afpDetaljForValgtUttak={createAfpDetaljerListe({})}
          alderspensjonColumnsCount={3}
        />
      )

      const box = container.querySelector('.navds-box')
      expect(box).toBeInTheDocument()
    })

    it('viser riktig alder i heltUttak heading når currentAge er over 67', () => {
      const stateWith70 = {
        uttaksalder: { aar: 70, maaneder: 0 },
      }

      renderWithProviders(
        <AfpDetaljer
          afpDetaljForValgtUttak={createAfpDetaljerListe({
            afpPrivat: mockAfpPrivatAt67Data,
          })}
          alderspensjonColumnsCount={3}
        />,
        stateWith70
      )

      // Skal vise AFP ved 67 siden uttaksalder er over 67
      expect(screen.getAllByText('Sum AFP:')[0]).toBeVisible()
      expect(screen.getAllByText('18 000 kr')[0]).toBeVisible()
    })

    it('håndterer tom afpPrivat med length 0', () => {
      renderWithProviders(
        <AfpDetaljer
          afpDetaljForValgtUttak={createAfpDetaljerListe({})}
          alderspensjonColumnsCount={3}
        />
      )

      expect(screen.queryByText('Sum AFP:')).not.toBeInTheDocument()
    })

    it('kombinerer pre2025OffentligAfpDetaljerListe med andre AFP typer', () => {
      const mockPre2025AfpDetaljerData: DetaljRad[] = [
        { tekst: 'Grunnpensjon (kap. 19)', verdi: '8 000 kr' },
        { tekst: 'Sum AFP', verdi: '8 000 kr' },
      ]

      renderWithProviders(
        <AfpDetaljer
          afpDetaljForValgtUttak={createAfpDetaljerListe({
            afpPrivat: mockAfpPrivatAt67Data,
            pre2025OffentligAfp: mockPre2025AfpDetaljerData,
            opptjeningPre2025OffentligAfp: mockPre2025OffentligAfpData,
            afpOffentlig: mockAfpOffentligData,
          })}
          alderspensjonColumnsCount={3}
        />
      )

      // Alle typer skal vises
      expect(screen.getAllByText('Kompensasjonstillegg:')[0]).toBeVisible() // AFP privat
      expect(screen.getAllByText('Grunnpensjon (kap. 19):')[0]).toBeVisible() // pre2025 detaljer
      expect(screen.getAllByText('AFP grad:')[0]).toBeVisible() // opptjening pre2025
      expect(
        screen.getAllByText('Månedlig livsvarig avtalefestet pensjon (AFP):')[0]
      ).toBeVisible() // AFP offentlig
    })
  })
})
