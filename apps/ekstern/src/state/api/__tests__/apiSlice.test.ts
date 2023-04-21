import { mockErrorResponse, mockResponse } from '@/mocks/server'
import { setupStore } from '@/state/store'
import { apiSlice } from '@/state/api/apiSlice'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react'

const tidligstemuligeuttaksalderData = require('../../../mocks/data/tidligstemuligeuttaksalder.json')
const pensjonsberegningData = require('../../../mocks/data/pensjonsberegning.json')

// TODO: fikse bedre typing ved dispatch
describe('apiSlice', () => {
  it('eksponerer riktig endepunkter', async () => {
    expect(apiSlice.endpoints).toHaveProperty('getTidligsteMuligeUttaksalder')
    expect(apiSlice.endpoints).toHaveProperty('getPensjonsberegning')
  })

  describe('getTidligsteUttaksalder', () => {
    it('returnerer data ved successfull query', async () => {
      const storeRef = await setupStore()
      return storeRef
        .dispatch<any>(
          apiSlice.endpoints.getTidligsteMuligeUttaksalder.initiate()
        )
        .then((result: FetchBaseQueryError) => {
          expect(result.status).toBe('fulfilled')
          expect(result.data).toMatchObject(tidligstemuligeuttaksalderData)
        })
    })

    it('returnerer undefined ved feilende query', async () => {
      const storeRef = await setupStore()
      mockErrorResponse('/tidligste-uttaksalder')
      return storeRef
        .dispatch<any>(
          apiSlice.endpoints.getTidligsteMuligeUttaksalder.initiate()
        )
        .then((result: FetchBaseQueryError) => {
          expect(result.status).toBe('rejected')
          expect(result.data).toBe(undefined)
        })
    })

    it('kaster feil ved uforventet format på responsen', async () => {
      const storeRef = await setupStore()
      const error = console.error
      console.error = () => {}
      mockResponse('/tidligste-uttaksalder', {
        status: 200,
        json: [{ 'tullete svar': 'lorem' }],
      })
      return storeRef
        .dispatch<any>(
          apiSlice.endpoints.getTidligsteMuligeUttaksalder.initiate()
        )
        .then((result: FetchBaseQueryError) => {
          expect(result).toThrow(Error)
          expect(result.status).toBe('rejected')
          expect(result.data).toBe(undefined)
          console.error = error
        })
    })
  })

  describe('getPensjonsberegning', () => {
    it('returnerer data ved successfull query', async () => {
      const storeRef = await setupStore()
      return storeRef
        .dispatch<any>(apiSlice.endpoints.getPensjonsberegning.initiate())
        .then((result: FetchBaseQueryError) => {
          expect(result.status).toBe('fulfilled')
          expect(result.data).toMatchObject(pensjonsberegningData)
        })
    })

    it('returnerer undefined ved feilende query', async () => {
      const storeRef = await setupStore()
      mockErrorResponse('/pensjonsberegning')
      return storeRef
        .dispatch<any>(apiSlice.endpoints.getPensjonsberegning.initiate())
        .then((result: FetchBaseQueryError) => {
          expect(result.status).toBe('rejected')
          expect(result.data).toBe(undefined)
        })
    })

    it('kaster feil ved uforventet format på responsen', async () => {
      const storeRef = await setupStore()
      const error = console.error
      console.error = () => {}
      mockResponse('/pensjonsberegning', {
        status: 200,
        json: [{ 'tullete svar': 'lorem' }],
      })
      return storeRef
        .dispatch<any>(apiSlice.endpoints.getPensjonsberegning.initiate())
        .then((result: FetchBaseQueryError) => {
          expect(result).toThrow(Error)
          expect(result.status).toBe('rejected')
          expect(result.data).toBe(undefined)
          console.error = error
        })
    })
  })
})
