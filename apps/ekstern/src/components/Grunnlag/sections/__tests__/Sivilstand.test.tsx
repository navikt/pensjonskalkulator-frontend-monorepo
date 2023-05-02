import { waitFor } from '@testing-library/react'

import { Sivilstand } from '../Sivilstand'
import { mockErrorResponse, mockResponse } from '@/mocks/server'
import { render, screen } from '@/test-utils'

describe('Sivilstand', () => {
  it('rendrer sivilstand: GIFT', async () => {
    mockResponse('/person', { status: 200, json: { sivilstand: 'GIFT' } })
    render(<Sivilstand />)

    await waitFor(() => {
      expect(screen.getByText('Gift')).toBeVisible()
    })
  })

  it('rendrer sivilstand: SKILT', async () => {
    mockResponse('/person', { status: 200, json: { sivilstand: 'SKILT' } })
    render(<Sivilstand />)

    await waitFor(() => {
      expect(screen.getByText('Skilt')).toBeVisible()
    })
  })

  it('rendrer sivilstand: SEPARERT', async () => {
    mockResponse('/person', { status: 200, json: { sivilstand: 'SEPARERT' } })
    render(<Sivilstand />)

    await waitFor(() => {
      expect(screen.getByText('Separert')).toBeVisible()
    })
  })

  it('rendrer sivilstand: REGISTRERT_PARTNER', async () => {
    mockResponse('/person', {
      status: 200,
      json: { sivilstand: 'REGISTRERT_PARTNER' },
    })
    render(<Sivilstand />)

    await waitFor(() => {
      expect(screen.getByText('Registrert partner')).toBeVisible()
    })
  })

  it('rendrer sivilstand: SEPARERT_PARTNER', async () => {
    mockResponse('/person', {
      status: 200,
      json: { sivilstand: 'SEPARERT_PARTNER' },
    })
    render(<Sivilstand />)

    await waitFor(() => {
      expect(screen.getByText('Separert partner')).toBeVisible()
    })
  })

  it('rendrer sivilstand: SKILT_PARTNER', async () => {
    mockResponse('/person', {
      status: 200,
      json: { sivilstand: 'SKILT_PARTNER' },
    })
    render(<Sivilstand />)

    await waitFor(() => {
      expect(screen.getByText('Skilt partner')).toBeVisible()
    })
  })

  it('rendrer sivilstand: GJENLEVENDE_PARTNER', async () => {
    mockResponse('/person', {
      status: 200,
      json: { sivilstand: 'GJENLEVENDE_PARTNER' },
    })
    render(<Sivilstand />)

    await waitFor(() => {
      expect(screen.getByText('Gjenlevende partner')).toBeVisible()
    })
  })

  it('rendrer sivilstand: UGIFT', async () => {
    mockResponse('/person', {
      status: 200,
      json: { sivilstand: 'UGIFT' },
    })
    render(<Sivilstand />)

    await waitFor(() => {
      expect(screen.getByText('Ugift')).toBeVisible()
    })
  })

  it('viser feilmelding om henting av sivilstand feiler', async () => {
    mockErrorResponse('/person')
    render(<Sivilstand />)

    await waitFor(() => {
      expect(screen.getByText('Kunne ikke hente sivilstand')).toBeVisible()
    })
  })
})
