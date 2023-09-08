import { vi } from 'vitest'
import { API_BASEURL } from '@/paths'

vi.mock('@reduxjs/toolkit/query/react')
vi.mock('../apiSlice')

describe('apiSlice', () => {
  it('har riktig baseQuery', async () => {
    const createAPIMockFunction = vi
      .fn()
      .mockReturnValueOnce({ useAlderspensjonQuery: 'lorem' })
    const fetchBaseQueryMockFunction = vi.fn().mockReturnValueOnce('')

    const reduxUtils = await import('@reduxjs/toolkit/query/react')
    reduxUtils.fetchBaseQuery = fetchBaseQueryMockFunction
    reduxUtils.createApi = createAPIMockFunction

    await import('../apiSlice')

    await expect(fetchBaseQueryMockFunction).toHaveBeenCalledWith({
      baseUrl: API_BASEURL,
    })
  })
})
