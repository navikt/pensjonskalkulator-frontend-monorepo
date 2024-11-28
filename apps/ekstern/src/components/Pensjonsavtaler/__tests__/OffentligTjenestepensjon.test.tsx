import { describe, it } from 'vitest'

import { OffentligTjenestepensjon } from '../OffentligTjenestepensjon'
import { render, screen } from '@/test-utils'

describe('OffentligTjenestepensjon', () => {
  it('viser loader mens info om tp-medlemskap hentes', () => {
    render(
      <OffentligTjenestepensjon
        isLoading={true}
        isError={false}
        headingLevel="3"
      />
    )
    expect(screen.findByTestId('tpo-loader')).toBeVisible()
  })

  it('Når brukeren ikke har tp-medlemskap, viser ingenting ', () => {
    render(
      <OffentligTjenestepensjon
        isLoading={false}
        isError={false}
        offentligTp={{
          simuleringsresultatStatus: 'OK',
          muligeTpLeverandoerListe: [],
        }}
        headingLevel="3"
      />
    )

    expect(screen.queryByTestId('tpo-loader')).not.toBeInTheDocument()

    expect(
      screen.queryByText('pensjonsavtaler.tpo.title')
    ).not.toBeInTheDocument()
  })

  it('Når brukeren har tp-medlemskap, viser riktig heading på riktig level og riktig infotekst med tp-leverandør', () => {
    render(
      <OffentligTjenestepensjon
        isLoading={false}
        isError={false}
        offentligTp={{
          simuleringsresultatStatus: 'OK',
          muligeTpLeverandoerListe: [
            'Statens pensjonskasse',
            'Kommunal Landspensjonskasse',
            'Oslo Pensjonsforsikring',
          ],
        }}
        headingLevel="3"
      />
    )

    expect(screen.queryByTestId('tpo-loader')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
      'pensjonsavtaler.tpo.title'
    )
    expect(
      screen.getByText(
        'Du er eller har vært ansatt i offentlig sektor, men vi kan dessverre ikke hente inn offentlige pensjonsavtaler. Sjekk tjenestepensjonsavtalene dine hos aktuell tjenestepensjonsordning (Statens pensjonskasse, Kommunal Landspensjonskasse, Oslo Pensjonsforsikring).'
      )
    ).toBeInTheDocument()
  })

  it('Når kall til tp-medlemskap feiler, viser riktig heading på riktig level og riktig feilmelding', () => {
    render(
      <OffentligTjenestepensjon
        isLoading={false}
        isError={true}
        headingLevel="3"
      />
    )

    expect(screen.queryByTestId('tpo-loader')).toBeInTheDocument()

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
      'pensjonsavtaler.tpo.title'
    )
    expect(screen.getByText('pensjonsavtaler.tpo.error')).toBeInTheDocument()
  })
})
