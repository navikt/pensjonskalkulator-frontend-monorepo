import { vi } from 'vitest'
import { mockErrorResponse, mockResponse } from '../../../api/server'
import { API_BASEURL } from '../../../api/paths'

const pensjonsberegningData = require('../../../api/__mocks__/pensjonsberegning.json')

vi.mock('@reduxjs/toolkit/query/react')
vi.mock('../apiSlice')

describe('apiSlice', () => {
  const importRealApiSlice = async () => {
    const apiSliceModuleActual = await vi.importActual('../apiSlice')
    let apiSliceModule = await import('../apiSlice')
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    apiSliceModule.apiSlice = apiSliceModuleActual.apiSlice
    return apiSliceModule.apiSlice
  }

  afterEach(async () => {
    const realModule: typeof import('@reduxjs/toolkit/query/react') =
      await vi.importActual('@reduxjs/toolkit/query/react')
    const reduxUtils: typeof import('@reduxjs/toolkit/query/react') =
      await import('@reduxjs/toolkit/query/react')
    reduxUtils.fetchBaseQuery = realModule.fetchBaseQuery
    reduxUtils.createApi = realModule.createApi
  })

  it('har riktig baseQuery', async () => {
    const createAPIMockFunction = vi
      .fn()
      .mockReturnValueOnce({ useGetPensjonsberegningQuery: 'lorem' })
    const fetchBaseQueryMockFunction = vi.fn().mockReturnValueOnce('')

    const reduxUtils = await import('@reduxjs/toolkit/query/react')
    reduxUtils.fetchBaseQuery = fetchBaseQueryMockFunction
    reduxUtils.createApi = createAPIMockFunction

    await import('../apiSlice')

    await expect(fetchBaseQueryMockFunction).toHaveBeenCalledWith({
      baseUrl: API_BASEURL,
    })
  })

  it('eksponerer riktig endepunkter', async () => {
    const apiSlice = await importRealApiSlice()
    expect(apiSlice.endpoints).toHaveProperty('getPensjonsberegning')
  })

  it('returnerer data ved successfull query', async () => {
    const apiSlice = await importRealApiSlice()

    const storeModule = await import('../../store')
    const storeRef = await storeModule.setupStore()

    return storeRef
      .dispatch<any>(apiSlice.endpoints.getPensjonsberegning.initiate())
      .then((result: any) => {
        expect(result.status).toBe('fulfilled')
        expect(result.data).toMatchObject(pensjonsberegningData)
      })
  })

  it('returnerer undefined ved feilende query', async () => {
    const apiSlice = await importRealApiSlice()
    const storeModule = await import('../../store')
    const storeRef = await storeModule.setupStore()

    mockErrorResponse('/pensjonsberegning')

    return storeRef
      .dispatch<any>(apiSlice.endpoints.getPensjonsberegning.initiate())
      .then((result: any) => {
        expect(result.status).toBe('rejected')
        expect(result.data).toBe(undefined)
      })
  })

  it('kaster feil ved uforventet format på responsen', async () => {
    const apiSlice = await importRealApiSlice()
    const storeModule = await import('../../store')
    const storeRef = await storeModule.setupStore()

    const error = console.error
    console.error = () => {}

    mockResponse('/pensjonsberegning', {
      status: 200,
      json: [{ 'tullete svar': 'lorem' }],
    })

    return storeRef
      .dispatch<any>(apiSlice.endpoints.getPensjonsberegning.initiate())
      .then((result: any) => {
        expect(result).toThrow(Error)
        expect(result.status).toBe('rejected')
        expect(result.data).toBe(undefined)
        console.error = error
      })
  })
})
