import { mockErrorResponse, mockResponse } from '@/mocks/server'
import { setupStore } from '@/state/store'
import { apiSlice } from '@/state/api/apiSlice'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { swallowErrorsAsync } from '@/test-utils'

const tidligstemuligeuttaksalderData = require('../../../mocks/data/tidligstemuligeuttaksalder.json')
const pensjonsberegningData = require('../../../mocks/data/pensjonsberegning.json')
const personData = require('../../../mocks/data/person.json')

// TODO: fikse bedre typing ved dispatch
describe('apiSlice', () => {
  it('eksponerer riktig endepunkter', async () => {
    expect(apiSlice.endpoints).toHaveProperty('getTidligsteMuligeUttaksalder')
    expect(apiSlice.endpoints).toHaveProperty('getPensjonsberegning')
    expect(apiSlice.endpoints).toHaveProperty('getPerson')
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

      mockResponse('/tidligste-uttaksalder', {
        status: 200,
        json: [{ 'tullete svar': 'lorem' }],
      })

      await swallowErrorsAsync(async () => {
        await storeRef
          .dispatch<any>(
            apiSlice.endpoints.getTidligsteMuligeUttaksalder.initiate()
          )
          .then((result: FetchBaseQueryError) => {
            expect(result).toThrow(Error)
            expect(result.status).toBe('rejected')
            expect(result.data).toBe(undefined)
          })
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

      mockResponse('/pensjonsberegning', {
        status: 200,
        json: [{ 'tullete svar': 'lorem' }],
      })

      await swallowErrorsAsync(async () => {
        await storeRef
          .dispatch<any>(apiSlice.endpoints.getPensjonsberegning.initiate())
          .then((result: FetchBaseQueryError) => {
            expect(result).toThrow(Error)
            expect(result.status).toBe('rejected')
            expect(result.data).toBe(undefined)
          })
      })
    })
  })

  describe('getPerson', () => {
    it('returnerer data ved suksessfull query', async () => {
      const storeRef = await setupStore()
      return storeRef
        .dispatch<any>(apiSlice.endpoints.getPerson.initiate())
        .then((result: FetchBaseQueryError) => {
          expect(result.status).toBe('fulfilled')
          expect(result.data).toMatchObject(personData)
        })
    })

    it('returnerer undefined ved feilende query', async () => {
      const storeRef = await setupStore()
      mockErrorResponse('/person')
      return storeRef
        .dispatch<any>(apiSlice.endpoints.getPerson.initiate())
        .then((result: FetchBaseQueryError) => {
          expect(result.status).toBe('rejected')
          expect(result.data).toBe(undefined)
        })
    })

    it('kaster feil ved uforventet format på responsen', async () => {
      const storeRef = await setupStore()

      mockResponse('/person', {
        status: 200,
        json: { sivilstand: 'SIRKUSKLOVN' },
      })

      await swallowErrorsAsync(async () => {
        await storeRef
          .dispatch<any>(apiSlice.endpoints.getPerson.initiate())
          .then((result: FetchBaseQueryError) => {
            expect(result).toThrow(Error)
            expect(result.status).toBe('rejected')
            expect(result.data).toBe(undefined)
          })
      })
    })
  })
})
