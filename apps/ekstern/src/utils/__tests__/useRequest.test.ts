import { describe, expect, it } from 'vitest'

import useRequest from '../useRequest'
import { mockErrorResponse, mockResponse } from '@/mocks/server'
import { API_BASEURL } from '@/paths'
import { act, renderHook, waitFor } from '@/test-utils'

describe('useRequest', () => {
  it('henting av data feiler', async () => {
    mockErrorResponse('/use-request/fail')
    const { result } = renderHook(() =>
      useRequest<boolean, { data: string }>(`${API_BASEURL}/use-request/fail`)
    )
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.hasError).toBe(true)
    expect(result.current.status).toBe(500)
    expect(result.current.errorData).toBe(`Internal Server Error`)
  })

  it('henting av data er OK, men data er ikke JSON', async () => {
    mockResponse('/use-request/ok', {
      text: 'Error string',
    })
    const { result } = renderHook(() =>
      useRequest<string>(`${API_BASEURL}/use-request/ok`)
    )
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.hasError).toBe(false)
    expect(result.current.data).toBeUndefined()
  })

  it('henting av strukturert feildata', async () => {
    mockResponse('/use-request/fail', {
      status: 500,
      json: { error: 'strukturert feil', userId: 10 },
    })

    type ErrorType = {
      error: string
      userId: number
    }

    type DataType = string
    const { result } = renderHook(() =>
      useRequest<DataType, ErrorType>(`${API_BASEURL}/use-request/fail`)
    )
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.status).toBe(500)
    expect(result.current.hasError).toBe(true)
    expect(result.current.errorData?.error).toBe(`strukturert feil`)
    expect(result.current.errorData?.userId).toBe(10)
  })

  it('henting av data ok, med strukturert data i JSON', async () => {
    mockResponse('/use-request/ok')
    const { result } = renderHook(() =>
      useRequest<{ data: string }>(`${API_BASEURL}/use-request/ok`)
    )
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.hasError).toBe(false)
    expect(result.current.data).not.toBeUndefined()
  })

  it('henting av data på nytt ved bruk av reload', async () => {
    mockResponse('/use-request/retry')
    const { result } = renderHook(() =>
      useRequest<{ data: string }>(`${API_BASEURL}/use-request/retry`)
    )
    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.hasError).toBe(false)
    expect(result.current.data).not.toBeUndefined()

    act(() => result.current.reload())
    await waitFor(() => expect(result.current.isLoading).toBe(true))
    expect(result.current.data).toStrictEqual({
      data: 'ok',
    })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data).not.toBeUndefined()
  })
})
