import { describe, it } from 'vitest'

import { OffentligTjenestepensjon } from '../OffentligTjenestepensjon'
import { mockErrorResponse, mockResponse } from '@/mocks/server'
import { render, screen, waitFor } from '@/test-utils'

describe('OffentligTjenestepensjon', () => {
  it('viser loader mens info om tp-medlemskap hentes', async () => {
    render(<OffentligTjenestepensjon headingLevel="3" />)
    expect(await screen.findByTestId('tpo-loader')).toBeVisible()
  })

  it('Når brukeren ikke har tp-medlemskap, viser ingenting ', async () => {
    mockResponse('/v1/tpo-medlemskap', {
      status: 200,
      json: {
        tpLeverandoerListe: [],
      },
    })
    render(<OffentligTjenestepensjon headingLevel="3" />)
    expect(await screen.findByTestId('tpo-loader')).toBeVisible()
    await waitFor(async () => {
      expect(screen.queryByTestId('tpo-loader')).not.toBeInTheDocument()
      expect(
        screen.queryByText('pensjonsavtaler.tpo.title')
      ).not.toBeInTheDocument()
    })
  })

  it('Når brukeren har tp-medlemskap, viser riktig heading på riktig level og riktig infotekst med tp-leverandør', async () => {
    mockResponse('/v1/tpo-medlemskap', {
      status: 200,
      json: {
        tpLeverandoerListe: [
          'Statens pensjonskasse',
          'Kommunal Landspensjonskasse',
          'Oslo Pensjonsforsikring',
        ],
      },
    })
    render(<OffentligTjenestepensjon headingLevel="3" />)

    await waitFor(async () => {
      expect(screen.queryByTestId('tpo-loader')).not.toBeInTheDocument()
      expect(
        await screen.findByRole('heading', { level: 3 })
      ).toHaveTextContent('pensjonsavtaler.tpo.title')
      expect(
        await screen.findByText(
          'Du er eller har vært ansatt i offentlig sektor, men vi kan dessverre ikke hente inn offentlige pensjonsavtaler. Sjekk tjenestepensjonsavtalene dine hos aktuell tjenestepensjonsordning (Statens pensjonskasse, Kommunal Landspensjonskasse, Oslo Pensjonsforsikring).'
        )
      ).toBeInTheDocument()
    })
  })

  it('Når kall til tp-medlemskap feiler, viser riktig heading på riktig level og riktig feilmelding', async () => {
    mockErrorResponse('/v1/tpo-medlemskap')
    render(<OffentligTjenestepensjon headingLevel="3" />)

    await waitFor(async () => {
      expect(screen.queryByTestId('tpo-loader')).not.toBeInTheDocument()
      expect(
        await screen.findByRole('heading', { level: 3 })
      ).toHaveTextContent('pensjonsavtaler.tpo.title')
      expect(
        await screen.findByText('pensjonsavtaler.tpo.error')
      ).toBeInTheDocument()
    })
  })
})
