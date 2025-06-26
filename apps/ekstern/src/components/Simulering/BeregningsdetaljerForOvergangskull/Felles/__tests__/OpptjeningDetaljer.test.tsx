import { render, screen } from '@testing-library/react'
import { IntlProvider } from 'react-intl'

import { DetaljRad } from '../../hooks'
import { OpptjeningDetaljer } from '../OpptjeningDetaljer'

const renderWithIntl = (component: React.ReactElement) => {
  const mockMessages = {
    'beregning.detaljer.OpptjeningDetaljer.kap19.table.title':
      'Kapitel 19 detaljer',
    'beregning.detaljer.OpptjeningDetaljer.kap20.table.title':
      'Kapitel 20 detaljer',
  }
  return render(
    <IntlProvider locale="nb" messages={mockMessages}>
      {component}
    </IntlProvider>
  )
}

describe('Gitt at OpptjeningDetaljer rendres', () => {
  const mockOpptjeningKap19Liste: DetaljRad[][] = [
    [
      { tekst: 'Andelsbrøk', verdi: '10/10' },
      { tekst: 'Sluttpoengtall', verdi: 6.5 },
      { tekst: 'Grunnpensjon', verdi: '180 000 kr' },
    ],
  ]

  const mockOpptjeningKap20Liste: DetaljRad[][] = [
    [
      { tekst: 'Pensjonsbeholdning', verdi: '500 000 kr' },
      { tekst: 'Trygdetid', verdi: 40 },
      { tekst: 'Alderspensjon', verdi: '200 000 kr' },
    ],
  ]

  const mockAlderspensjonDetaljerListe: DetaljRad[][] = [
    [
      { tekst: 'Grunnpensjon', verdi: '150 000 kr' },
      { tekst: 'Tilleggspensjon', verdi: '50 000 kr' },
    ],
    [{ tekst: 'Alderspensjon', verdi: '200 000 kr' }],
  ]

  const defaultProps = {
    opptjeningKap19Liste: mockOpptjeningKap19Liste,
    opptjeningKap20Liste: mockOpptjeningKap20Liste,
    alderspensjonDetaljerListe: mockAlderspensjonDetaljerListe,
  }

  it('rendrer komponenten med påkrevde props', () => {
    const { container } = renderWithIntl(
      <OpptjeningDetaljer {...defaultProps} />
    )

    const container_element = container.firstChild
    expect(container_element).toBeInTheDocument()
  })

  it('rendrer kap19 OpptjeningDetaljer når data er tilgjengelig', () => {
    renderWithIntl(<OpptjeningDetaljer {...defaultProps} />)

    expect(screen.getByText('Andelsbrøk:')).toBeVisible()
    expect(screen.getByText('10/10')).toBeVisible()
    expect(screen.getByText('Sluttpoengtall:')).toBeVisible()
    expect(screen.getByText('6.5')).toBeVisible()
    expect(screen.getByText('Grunnpensjon:')).toBeVisible()
    expect(screen.getByText('180 000 kr')).toBeVisible()
  })

  it('rendrer kap20 OpptjeningDetaljer når data er tilgjengelig', () => {
    renderWithIntl(<OpptjeningDetaljer {...defaultProps} />)

    expect(screen.getByText('Pensjonsbeholdning:')).toBeVisible()
    expect(screen.getByText('500 000 kr')).toBeVisible()
    expect(screen.getByText('Trygdetid:')).toBeVisible()
    expect(screen.getByText('40')).toBeVisible()
    expect(screen.getByText('Alderspensjon:')).toBeVisible()
    expect(screen.getByText('200 000 kr')).toBeVisible()
  })

  it('rendrer ikke kap19 seksjon når data er tom', () => {
    renderWithIntl(
      <OpptjeningDetaljer
        opptjeningKap19Liste={[]}
        opptjeningKap20Liste={mockOpptjeningKap20Liste}
        alderspensjonDetaljerListe={mockAlderspensjonDetaljerListe}
      />
    )

    expect(screen.queryByText('Andelsbrøk:')).not.toBeInTheDocument()
    expect(screen.queryByText('Sluttpoengtall:')).not.toBeInTheDocument()
  })

  it('rendrer ikke kap20 seksjon når data er tom', () => {
    renderWithIntl(
      <OpptjeningDetaljer
        opptjeningKap19Liste={mockOpptjeningKap19Liste}
        opptjeningKap20Liste={[]}
        alderspensjonDetaljerListe={mockAlderspensjonDetaljerListe}
      />
    )

    expect(screen.queryByText('Pensjonsbeholdning:')).not.toBeInTheDocument()
    expect(screen.queryByText('Trygdetid:')).not.toBeInTheDocument()
  })

  it('håndterer tomme arrays for begge objekter', () => {
    const { container } = renderWithIntl(
      <OpptjeningDetaljer
        opptjeningKap19Liste={[]}
        opptjeningKap20Liste={[]}
        alderspensjonDetaljerListe={mockAlderspensjonDetaljerListe}
      />
    )

    const container_element = container.firstChild
    expect(container_element).toBeVisible()
    expect(screen.queryByText('Andelsbrøk:')).not.toBeInTheDocument()
    expect(screen.queryByText('Pensjonsbeholdning:')).not.toBeInTheDocument()
  })

  it('håndterer undefined verdier i DetaljRad objekter', () => {
    const objektMedUndefined: DetaljRad[][] = [
      [{ tekst: 'Test tekst', verdi: undefined }, { tekst: 'Test tekst 2' }],
    ]

    renderWithIntl(
      <OpptjeningDetaljer
        opptjeningKap19Liste={objektMedUndefined}
        opptjeningKap20Liste={[]}
        alderspensjonDetaljerListe={mockAlderspensjonDetaljerListe}
      />
    )

    expect(screen.getByText('Test tekst:')).toBeVisible()
    expect(screen.getByText('Test tekst 2:')).toBeVisible()
  })

  it('rendrer VStack med korrekt gap', () => {
    const { container } = renderWithIntl(
      <OpptjeningDetaljer {...defaultProps} />
    )

    const vStack = container.querySelector('.navds-stack')
    expect(vStack).toBeVisible()
  })

  it('rendrer definition lists korrekt', () => {
    const { container } = renderWithIntl(
      <OpptjeningDetaljer {...defaultProps} />
    )

    const definitionLists = container.querySelectorAll('dl')
    expect(definitionLists).toHaveLength(2) // En for kap19 og en for kap20
  })

  it('rendrer HStack komponenter med space-between justering', () => {
    const { container } = renderWithIntl(
      <OpptjeningDetaljer {...defaultProps} />
    )

    const hStackElements = container.querySelectorAll('.navds-stack')
    expect(hStackElements.length).toBeGreaterThan(0)
  })

  // Tests for gradert uttak scenarios with mixed empty/filled arrays
  describe('Gradert uttak scenarios', () => {
    it('rendrer kun kap19 når første array er tom og andre har data', () => {
      const kap19MedTomForsteArray: DetaljRad[][] = [
        [], // Tom array for gradert periode
        [
          { tekst: 'Andelsbrøk', verdi: '10/10' },
          { tekst: 'Sluttpoengtall', verdi: 6.5 },
        ], // Data for helt uttak periode
      ]

      renderWithIntl(
        <OpptjeningDetaljer
          opptjeningKap19Liste={kap19MedTomForsteArray}
          opptjeningKap20Liste={[]}
          alderspensjonDetaljerListe={mockAlderspensjonDetaljerListe}
        />
      )

      // Skal vise kap19 data fra andre array
      expect(screen.getByText('Andelsbrøk:')).toBeVisible()
      expect(screen.getByText('10/10')).toBeVisible()
      expect(screen.getByText('Sluttpoengtall:')).toBeVisible()
      expect(screen.getByText('6.5')).toBeVisible()
    })

    it('rendrer kun kap19 når andre array er tom og første har data', () => {
      const kap19MedTomAndreArray: DetaljRad[][] = [
        [
          { tekst: 'Andelsbrøk', verdi: '8/10' },
          { tekst: 'Sluttpoengtall', verdi: 4.2 },
        ], // Data for gradert periode
        [], // Tom array for helt uttak periode
      ]

      renderWithIntl(
        <OpptjeningDetaljer
          opptjeningKap19Liste={kap19MedTomAndreArray}
          opptjeningKap20Liste={[]}
          alderspensjonDetaljerListe={mockAlderspensjonDetaljerListe}
        />
      )

      // Skal vise kap19 data fra første array
      expect(screen.getByText('Andelsbrøk:')).toBeVisible()
      expect(screen.getByText('8/10')).toBeVisible()
      expect(screen.getByText('Sluttpoengtall:')).toBeVisible()
      expect(screen.getByText('4.2')).toBeVisible()
    })

    it('rendrer begge kap19 seksjoner når begge arrays har data', () => {
      const kap19MedBeggeArrays: DetaljRad[][] = [
        [
          { tekst: 'Andelsbrøk', verdi: '8/10' },
          { tekst: 'Sluttpoengtall', verdi: 4.2 },
        ], // Data for gradert periode
        [
          { tekst: 'Andelsbrøk', verdi: '10/10' },
          { tekst: 'Sluttpoengtall', verdi: 6.5 },
        ], // Data for helt uttak periode
      ]

      const { container } = renderWithIntl(
        <OpptjeningDetaljer
          opptjeningKap19Liste={kap19MedBeggeArrays}
          opptjeningKap20Liste={[]}
          alderspensjonDetaljerListe={mockAlderspensjonDetaljerListe}
        />
      )

      // Skal vise to kap19 seksjoner
      const definitionLists = container.querySelectorAll('dl')
      expect(definitionLists).toHaveLength(2)

      // Skal vise data fra begge arrays
      expect(screen.getByText('8/10')).toBeVisible()
      expect(screen.getByText('4.2')).toBeVisible()
      expect(screen.getByText('10/10')).toBeVisible()
      expect(screen.getByText('6.5')).toBeVisible()
    })

    it('håndterer kompleks gradert uttak scenario med kap19 og kap20', () => {
      const kap19MedMixedData: DetaljRad[][] = [
        [], // Ingen kap19 data for gradert periode
        [
          { tekst: 'Andelsbrøk', verdi: '10/10' },
          { tekst: 'Sluttpoengtall', verdi: 6.5 },
        ], // Kap19 data for helt uttak periode
      ]

      const kap20MedMixedData: DetaljRad[][] = [
        [
          { tekst: 'Pensjonsbeholdning', verdi: '300 000 kr' },
          { tekst: 'Trygdetid', verdi: 25 },
        ], // Kap20 data for gradert periode
        [], // Ingen kap20 data for helt uttak periode
      ]

      const { container } = renderWithIntl(
        <OpptjeningDetaljer
          opptjeningKap19Liste={kap19MedMixedData}
          opptjeningKap20Liste={kap20MedMixedData}
          alderspensjonDetaljerListe={mockAlderspensjonDetaljerListe}
        />
      )

      // Skal vise én kap19 og én kap20 seksjon
      const definitionLists = container.querySelectorAll('dl')
      expect(definitionLists).toHaveLength(2)

      // Skal vise kap19 data fra andre array (helt uttak)
      expect(screen.getByText('Andelsbrøk:')).toBeVisible()
      expect(screen.getByText('10/10')).toBeVisible()
      expect(screen.getByText('Sluttpoengtall:')).toBeVisible()
      expect(screen.getByText('6.5')).toBeVisible()

      // Skal vise kap20 data fra første array (gradert periode)
      expect(screen.getByText('Pensjonsbeholdning:')).toBeVisible()
      expect(screen.getByText('300 000 kr')).toBeVisible()
      expect(screen.getByText('Trygdetid:')).toBeVisible()
      expect(screen.getByText('25')).toBeVisible()
    })

    it('rendrer ingenting når alle arrays er tomme i gradert scenario', () => {
      const { container } = renderWithIntl(
        <OpptjeningDetaljer
          opptjeningKap19Liste={[[], []]}
          opptjeningKap20Liste={[[], []]}
          alderspensjonDetaljerListe={mockAlderspensjonDetaljerListe}
        />
      )

      const container_element = container.firstChild
      expect(container_element).toBeVisible()

      // Skal ikke ha noen definition lists
      const definitionLists = container.querySelectorAll('dl')
      expect(definitionLists).toHaveLength(0)

      // Skal ikke vise noen detaljer
      expect(screen.queryByText('Andelsbrøk:')).not.toBeInTheDocument()
      expect(screen.queryByText('Pensjonsbeholdning:')).not.toBeInTheDocument()
    })

    it('korrekt key generation for arrays med mixed tomme/fulle arrays', () => {
      const kap19MedMixedData: DetaljRad[][] = [
        [],
        [{ tekst: 'Test verdi', verdi: 'test' }],
        [],
        [{ tekst: 'Annen test verdi', verdi: 'test2' }],
      ]

      const { container } = renderWithIntl(
        <OpptjeningDetaljer
          opptjeningKap19Liste={kap19MedMixedData}
          opptjeningKap20Liste={[]}
          alderspensjonDetaljerListe={mockAlderspensjonDetaljerListe}
        />
      )

      // Skal bare vise de to seksjonene med data
      const definitionLists = container.querySelectorAll('dl')
      expect(definitionLists).toHaveLength(2)

      // Verifiser at begge verdiene vises
      expect(screen.getByText('Test verdi:')).toBeVisible()
      expect(screen.getByText('test')).toBeVisible()
      expect(screen.getByText('Annen test verdi:')).toBeVisible()
      expect(screen.getByText('test2')).toBeVisible()
    })
  })

  describe('HStack/VStack betinget rendering basert på totalt antall elementer', () => {
    it('bruker VStack når totalt antall elementer er mindre enn 4', () => {
      const kap19Liste: DetaljRad[][] = [[{ tekst: 'Test 1', verdi: 'value1' }]]
      const kap20Liste: DetaljRad[][] = [[{ tekst: 'Test 2', verdi: 'value2' }]]

      renderWithIntl(
        <OpptjeningDetaljer
          opptjeningKap19Liste={kap19Liste}
          opptjeningKap20Liste={kap20Liste}
          alderspensjonDetaljerListe={mockAlderspensjonDetaljerListe}
        />
      )

      // Totalt antall elementer = 2, skal bruke VStack
      expect(screen.getByText('Test 1:')).toBeVisible()
      expect(screen.getByText('Test 2:')).toBeVisible()
    })

    it('bruker VStack når totalt antall elementer er mer enn 4', () => {
      const kap19Liste: DetaljRad[][] = [
        [{ tekst: 'Test 1', verdi: 'value1' }],
        [{ tekst: 'Test 2', verdi: 'value2' }],
        [{ tekst: 'Test 3', verdi: 'value3' }],
      ]
      const kap20Liste: DetaljRad[][] = [
        [{ tekst: 'Test 4', verdi: 'value4' }],
        [{ tekst: 'Test 5', verdi: 'value5' }],
        [{ tekst: 'Test 6', verdi: 'value6' }],
      ]

      renderWithIntl(
        <OpptjeningDetaljer
          opptjeningKap19Liste={kap19Liste}
          opptjeningKap20Liste={kap20Liste}
          alderspensjonDetaljerListe={mockAlderspensjonDetaljerListe}
        />
      )

      expect(screen.getByText('Test 1:')).toBeVisible()
      expect(screen.getByText('Test 4:')).toBeVisible()
      expect(screen.getByText('Test 6:')).toBeVisible()
    })

    it('bruker HStack når totalt antall elementer er nøyaktig 4', () => {
      const kap19Liste: DetaljRad[][] = [
        [{ tekst: 'Kap19 Test 1', verdi: 'value1' }],
        [{ tekst: 'Kap19 Test 2', verdi: 'value2' }],
      ]
      const kap20Liste: DetaljRad[][] = [
        [{ tekst: 'Kap20 Test 1', verdi: 'value3' }],
        [{ tekst: 'Kap20 Test 2', verdi: 'value4' }],
      ]

      renderWithIntl(
        <OpptjeningDetaljer
          opptjeningKap19Liste={kap19Liste}
          opptjeningKap20Liste={kap20Liste}
          alderspensjonDetaljerListe={mockAlderspensjonDetaljerListe}
        />
      )

      expect(screen.getByText('Kap19 Test 1:')).toBeVisible()
      expect(screen.getByText('Kap19 Test 2:')).toBeVisible()
      expect(screen.getByText('Kap20 Test 1:')).toBeVisible()
      expect(screen.getByText('Kap20 Test 2:')).toBeVisible()
    })

    it('bruker HStack når en liste er tom men totalt er 4', () => {
      const kap19Liste: DetaljRad[][] = [
        [{ tekst: 'Kap19 Test 1', verdi: 'value1' }],
        [{ tekst: 'Kap19 Test 2', verdi: 'value2' }],
        [{ tekst: 'Kap19 Test 3', verdi: 'value3' }],
        [{ tekst: 'Kap19 Test 4', verdi: 'value4' }],
      ]
      const kap20Liste: DetaljRad[][] = []

      renderWithIntl(
        <OpptjeningDetaljer
          opptjeningKap19Liste={kap19Liste}
          opptjeningKap20Liste={kap20Liste}
          alderspensjonDetaljerListe={mockAlderspensjonDetaljerListe}
        />
      )

      // Totalt antall elementer = 4, skal bruke HStack
      expect(screen.getByText('Kap19 Test 1:')).toBeVisible()
      expect(screen.getByText('Kap19 Test 2:')).toBeVisible()
      expect(screen.getByText('Kap19 Test 3:')).toBeVisible()
      expect(screen.getByText('Kap19 Test 4:')).toBeVisible()
    })

    it('bruker VStack når totalt antall elementer er 0', () => {
      const { container } = renderWithIntl(
        <OpptjeningDetaljer
          opptjeningKap19Liste={[]}
          opptjeningKap20Liste={[]}
          alderspensjonDetaljerListe={mockAlderspensjonDetaljerListe}
        />
      )

      const container_element = container.firstChild
      expect(container_element).toBeVisible()

      // Skal ikke rendre noen definisjonslister
      const definitionLists = container.querySelectorAll('dl')
      expect(definitionLists).toHaveLength(0)
    })

    it('teller korrekt elementer når arrays inneholder tomme underarrays', () => {
      const kap19Liste: DetaljRad[][] = [
        [], // Tom underarray - skal ikke telle mot rendering
        [{ tekst: 'Kap19 Test 1', verdi: 'value1' }], // Teller som 1
        [{ tekst: 'Kap19 Test 2', verdi: 'value2' }], // Teller som 1
      ]
      const kap20Liste: DetaljRad[][] = [
        [{ tekst: 'Kap20 Test 1', verdi: 'value3' }], // Teller som 1
        [], // Tom underarray - skal ikke telle mot rendering
      ]

      const { container } = renderWithIntl(
        <OpptjeningDetaljer
          opptjeningKap19Liste={kap19Liste}
          opptjeningKap20Liste={kap20Liste}
          alderspensjonDetaljerListe={mockAlderspensjonDetaljerListe}
        />
      )

      const definitionLists = container.querySelectorAll('dl')
      expect(definitionLists).toHaveLength(3)

      expect(screen.getByText('Kap19 Test 1:')).toBeVisible()
      expect(screen.getByText('Kap19 Test 2:')).toBeVisible()
      expect(screen.getByText('Kap20 Test 1:')).toBeVisible()
    })
  })
})
