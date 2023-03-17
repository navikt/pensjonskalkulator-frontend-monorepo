import { afterEach, describe, it, vi } from 'vitest'
import {
  createFailureFetchResponse,
  createSuccessFetchResponse,
} from '../../test-utils'
import { fetchPensjonsberegning } from '../pensjonsberegning'

const cachedFetch = global.fetch

function mockSuccessResponse(response: Pensjonsberegning[]) {
  const fetchMock = vi
    .fn()
    .mockResolvedValue(createSuccessFetchResponse(response))
  global.fetch = fetchMock
}

function mockErrorResponse() {
  const fetchMock = vi.fn().mockResolvedValue(createFailureFetchResponse(500))
  global.fetch = fetchMock
}

function cleanup() {
  global.fetch = cachedFetch
}

describe('fetchPensjonsberegning', () => {
  afterEach(() => {
    cleanup()
  })

  it('returnerer pensjonsberegning ved ok-response', async () => {
    const beregning = {
      pensjonsbeloep: 1234,
      pensjonsaar: 2020,
      alder: 67,
    }
    mockSuccessResponse([beregning])

    const response = await fetchPensjonsberegning()

    expect(response[0].pensjonsbeloep).toEqual(beregning.pensjonsbeloep)
    expect(response[0].pensjonsaar).toEqual(beregning.pensjonsaar)
    expect(response[0].alder).toEqual(beregning.alder)
  })

  it('kaster feil når pensjonsberegningen fra backend ikke følger forventet format', async () => {
    const beregning = {
      pensjonsbeloep: null,
      pensjonsaar: '2020',
      alder: 67,
    } as unknown as Pensjonsberegning
    mockSuccessResponse([beregning])

    await expect(() => fetchPensjonsberegning()).rejects.toThrow(
      'Mottok ugyldig pensjonsberegning fra backend'
    )
  })

  it('kaster feil når respons ikke er ok', async () => {
    mockErrorResponse()

    await expect(() => fetchPensjonsberegning()).rejects.toThrow(
      'Something went wrong'
    )
  })
})
