import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import {
  createFailureFetchResponse,
  createSuccessFetchResponse,
} from '../../test-utils'
import { Pensjonsberegning } from '../Pensjonsberegning'

const cachedFetch = global.fetch

const data: Pensjonsberegning[] = [
  {
    pensjonsbeloep: 1234,
    pensjonsaar: 2020,
    alder: 67,
  },
  {
    pensjonsbeloep: 1357,
    pensjonsaar: 2021,
    alder: 68,
  },
  {
    pensjonsbeloep: 2345,
    pensjonsaar: 2023,
    alder: 70,
  },
]

function mockSuccessResponse() {
  const fetchMock = vi.fn().mockResolvedValue(createSuccessFetchResponse(data))
  global.fetch = fetchMock
}

function mockErrorResponse() {
  const fetchMock = vi.fn().mockRejectedValue(createFailureFetchResponse(500))
  global.fetch = fetchMock
}

function cleanup() {
  global.fetch = cachedFetch
}

describe('Pensjonsberegning', () => {
  afterEach(() => {
    cleanup()
  })

  it('viser pensjonsberegning hentet fra backend', async () => {
    mockSuccessResponse()
    render(<Pensjonsberegning />)

    await waitFor(() => {
      expect(screen.getByText(`${data[0].alder} år`)).toBeVisible()
      expect(screen.getByText(`${data[1].alder} år`)).toBeVisible()
      expect(screen.getByText(`${data[2].alder} år`)).toBeVisible()
      expect(screen.getByText(`${data[0].pensjonsbeloep} kroner`)).toBeVisible()
      expect(screen.getByText(`${data[1].pensjonsbeloep} kroner`)).toBeVisible()
      expect(screen.getByText(`${data[2].pensjonsbeloep} kroner`)).toBeVisible()
    })
  })

  it('viser loader før pensjonsberegningen har blitt hentet', () => {
    mockSuccessResponse()
    render(<Pensjonsberegning />)

    expect(screen.getByTestId('loader')).toBeVisible()
  })

  it('viser feilmelding om henting av pensjonberegning feiler', async () => {
    mockErrorResponse()

    render(<Pensjonsberegning />)

    await waitFor(() => {
      expect(
        screen.getByText(
          'Vi klarte ikke å kalkulere pensjonen din. Prøv igjen senere.'
        )
      ).toBeVisible()
    })
  })
})
