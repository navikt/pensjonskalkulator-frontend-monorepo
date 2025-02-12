import { describe, it } from 'vitest'

import { Forbehold } from '..'
import { mockErrorResponse } from '@/mocks/server'
import { render, screen, waitFor } from '@/test-utils'

describe('Forbehold', () => {
  it('har riktig sidetittel', () => {
    render(<Forbehold />)
    expect(document.title).toBe('application.title.forbehold')
  })

  it('rendrer seksjonene riktig med innhold fra Sanity', async () => {
    render(<Forbehold />)
    await waitFor(() => {
      expect(screen.getByText('forbehold.title')).toBeVisible()
      expect(screen.getAllByRole('paragraph').length).toBeGreaterThanOrEqual(3)
    })
  })

  it('rendrer seksjonene riktig når tekstene fra Sanity ikke skal brukes', async () => {
    mockErrorResponse('/feature/pensjonskalkulator.hent-tekster-fra-sanity')
    render(<Forbehold />)
    expect(screen.getByText('forbehold.title')).toBeVisible()
    expect(screen.getByText('forbehold.inntekt.title')).toBeVisible()
    expect(screen.getByText('forbehold.utenlandsopphold.title')).toBeVisible()
    expect(screen.getByText('forbehold.sivilstand.title')).toBeVisible()
    expect(screen.getByText('forbehold.afp.title')).toBeVisible()
    expect(screen.getByText('forbehold.uforetrygd_afp.title')).toBeVisible()
    expect(screen.getByText('forbehold.gjenlevende.title')).toBeVisible()
    expect(screen.getByText('forbehold.pensjonsavtaler.title')).toBeVisible()

    await waitFor(() => {
      expect(screen.getByText('forbehold.uforetrygd.title')).toBeVisible()
    })
  })
})
