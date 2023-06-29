import { mockErrorResponse, mockResponse } from '@/mocks/server'
import { setupStore } from '@/state/store'
import { apiSlice } from '@/state/api/apiSlice'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { swallowErrorsAsync } from '@/test-utils'
import { AlderspensjonRequestBody } from '@/state/api/apiSlice.types'

const tidligsteUttaksalderResponse = require('../../../mocks/data/tidligsteUttaksalder.json')
const alderspensjonResponse = require('../../../mocks/data/alderspensjon/2031.json')
const personResponse = require('../../../mocks/data/person.json')
const tpoMedlemskapResponse = require('../../../mocks/data/tpo-medlemskap.json')
const unleashResponse = require('../../../mocks/data/unleash-disable-spraakvelger.json')
const pensjonsavtalerResponse = require('../../../mocks/data/pensjonsavtaler.json')

// TODO: fikse bedre typing ved dispatch
describe('apiSlice', () => {
  it('eksponerer riktig endepunkter', async () => {
    expect(apiSlice.endpoints).toHaveProperty('pensjonsavtaler')
    expect(apiSlice.endpoints).toHaveProperty('tidligsteUttaksalder')
    expect(apiSlice.endpoints).toHaveProperty('alderspensjon')
    expect(apiSlice.endpoints).toHaveProperty('getPerson')
    expect(apiSlice.endpoints).toHaveProperty('getTpoMedlemskap')

    expect(apiSlice.endpoints).toHaveProperty('getSpraakvelgerFeatureToggle')
  })

  describe('pensjonsavtaler', () => {
    const dummyRequestBody = {
      aarligInntektFoerUttak: 0,
      uttaksperiode: {
        startAlder: 0,
        startMaaned: 0,
        grad: 100,
        aarligInntekt: 500000,
      },
      antallInntektsaarEtterUttak: 0,
    }

    it('returnerer data ved vellykket query', async () => {
      const storeRef = await setupStore({}, true)
      return storeRef
        .dispatch<any>(
          apiSlice.endpoints.pensjonsavtaler.initiate(dummyRequestBody)
        )
        .then((result: FetchBaseQueryError) => {
          expect(result.status).toBe('fulfilled')
          expect(result.data).toMatchObject(pensjonsavtalerResponse.avtaler)
        })
    })

    it('returnerer undefined ved feilende query', async () => {
      const storeRef = await setupStore({}, true)
      mockErrorResponse('/pensjonsavtaler', {
        status: 500,
        json: "Beep boop I'm an error!",
        method: 'post',
      })
      return storeRef
        .dispatch<any>(
          apiSlice.endpoints.pensjonsavtaler.initiate(dummyRequestBody)
        )
        .then((result: FetchBaseQueryError) => {
          expect(result.status).toBe('rejected')
          expect(result.data).toBe(undefined)
        })
    })

    it('kaster feil ved uforventet format på responsen', async () => {
      const storeRef = await setupStore({}, true)
      mockResponse('/pensjonsavtaler', {
        status: 200,
        json: [{ 'tullete svar': 'lorem' }],
        method: 'post',
      })
      await swallowErrorsAsync(async () => {
        await storeRef
          .dispatch<any>(
            apiSlice.endpoints.pensjonsavtaler.initiate(dummyRequestBody)
          )
          .then((result: FetchBaseQueryError) => {
            expect(result).toThrow(Error)
            expect(result.status).toBe('rejected')
            expect(result.data).toBe(undefined)
          })
      })
    })
  })

  describe('tidligsteUttaksalder', () => {
    it('returnerer data ved successfull query', async () => {
      const storeRef = await setupStore({}, true)
      return storeRef
        .dispatch<any>(apiSlice.endpoints.tidligsteUttaksalder.initiate())
        .then((result: FetchBaseQueryError) => {
          expect(result.status).toBe('fulfilled')
          expect(result.data).toMatchObject(tidligsteUttaksalderResponse)
        })
    })

    it('returnerer undefined ved feilende query', async () => {
      const storeRef = await setupStore({}, true)
      mockErrorResponse('/tidligste-uttaksalder', {
        status: 500,
        method: 'post',
      })
      return storeRef
        .dispatch<any>(apiSlice.endpoints.tidligsteUttaksalder.initiate())
        .then((result: FetchBaseQueryError) => {
          expect(result.status).toBe('rejected')
          expect(result.data).toBe(undefined)
        })
    })

    it('kaster feil ved uforventet format på responsen', async () => {
      const storeRef = await setupStore({}, true)
      mockResponse('/tidligste-uttaksalder', {
        status: 200,
        json: [{ 'tullete svar': 'lorem' }],
        method: 'post',
      })
      await swallowErrorsAsync(async () => {
        await storeRef
          .dispatch<any>(apiSlice.endpoints.tidligsteUttaksalder.initiate())
          .then((result: FetchBaseQueryError) => {
            expect(result).toThrow(Error)
            expect(result.status).toBe('rejected')
            expect(result.data).toBe(undefined)
          })
      })
    })
  })

  describe('alderspensjon', () => {
    const body: AlderspensjonRequestBody = {
      simuleringstype: 'ALDER',
      uttaksgrad: 100,
      foersteUttaksdato: '2031-11-01',
      epsHarInntektOver2G: false,
      forventetInntekt: 500_000,
      sivilstand: 'UGIFT',
    }
    it('returnerer data ved vellykket query', async () => {
      const storeRef = await setupStore({}, true)
      return storeRef
        .dispatch<any>(apiSlice.endpoints.alderspensjon.initiate(body))
        .then((result: FetchBaseQueryError) => {
          expect(result.status).toBe('fulfilled')
          expect(result.data).toMatchObject(alderspensjonResponse.pensjon)
        })
    })

    it('returnerer undefined ved feilende query', async () => {
      const storeRef = await setupStore({}, true)
      mockErrorResponse('/alderspensjon/simulering', {
        status: 500,
        json: "Beep boop I'm an error!",
        method: 'post',
      })
      return storeRef
        .dispatch<any>(apiSlice.endpoints.alderspensjon.initiate(body))
        .then((result: FetchBaseQueryError) => {
          expect(result.status).toBe('rejected')
          expect(result.data).toBe(undefined)
        })
    })

    it('kaster feil ved uforventet format på responsen', async () => {
      const storeRef = await setupStore({}, true)
      mockResponse('/alderspensjon/simulering', {
        status: 200,
        json: [{ 'tullete svar': 'lorem' }],
        method: 'post',
      })
      await swallowErrorsAsync(async () => {
        await storeRef
          .dispatch<any>(apiSlice.endpoints.alderspensjon.initiate(body))
          .then((result: FetchBaseQueryError) => {
            expect(result).toThrow(Error)
            expect(result.status).toBe('rejected')
            expect(result.data).toBe(undefined)
          })
      })
    })
  })

  describe('getPerson', () => {
    it('returnerer data ved vellykket query', async () => {
      const storeRef = await setupStore({}, true)
      return storeRef
        .dispatch<any>(apiSlice.endpoints.getPerson.initiate())
        .then((result: FetchBaseQueryError) => {
          expect(result.status).toBe('fulfilled')
          expect(result.data).toMatchObject(personResponse)
        })
    })

    it('returnerer undefined ved feilende query', async () => {
      const storeRef = await setupStore({}, true)
      mockErrorResponse('/person')
      return storeRef
        .dispatch<any>(apiSlice.endpoints.getPerson.initiate())
        .then((result: FetchBaseQueryError) => {
          expect(result.status).toBe('rejected')
          expect(result.data).toBe(undefined)
        })
    })

    it('kaster feil ved uforventet format på responsen', async () => {
      const storeRef = await setupStore({}, true)
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

  describe('getTpoMedlemskap', () => {
    it('returnerer data ved vellykket query', async () => {
      const storeRef = await setupStore({}, true)
      return storeRef
        .dispatch<any>(apiSlice.endpoints.getTpoMedlemskap.initiate())
        .then((result: FetchBaseQueryError) => {
          expect(result.status).toBe('fulfilled')
          expect(result.data).toMatchObject(tpoMedlemskapResponse)
        })
    })

    it('returnerer undefined ved feilende query', async () => {
      const storeRef = await setupStore({}, true)
      mockErrorResponse('/tpo-medlemskap')
      return storeRef
        .dispatch<any>(apiSlice.endpoints.getTpoMedlemskap.initiate())
        .then((result: FetchBaseQueryError) => {
          expect(result.status).toBe('rejected')
          expect(result.data).toBe(undefined)
        })
    })

    it('kaster feil ved uforventet format på responsen', async () => {
      const storeRef = await setupStore({}, true)
      mockResponse('/tpo-medlemskap', {
        status: 200,
        json: { lorem: 'ipsum' },
      })
      await swallowErrorsAsync(async () => {
        await storeRef
          .dispatch<any>(apiSlice.endpoints.getTpoMedlemskap.initiate())
          .then((result: FetchBaseQueryError) => {
            expect(result).toThrow(Error)
            expect(result.status).toBe('rejected')
            expect(result.data).toBe(undefined)
          })
      })
    })
  })

  describe('getSpraakvelgerFeatureToggle', () => {
    it('returnerer data ved vellykket query', async () => {
      const storeRef = await setupStore({}, true)
      return storeRef
        .dispatch<any>(
          apiSlice.endpoints.getSpraakvelgerFeatureToggle.initiate()
        )
        .then((result: FetchBaseQueryError) => {
          expect(result.status).toBe('fulfilled')
          expect(result.data).toMatchObject(unleashResponse)
        })
    })

    it('returnerer undefined ved feilende query', async () => {
      const storeRef = await setupStore({}, true)
      mockErrorResponse('/feature/pensjonskalkulator.disable-spraakvelger')
      return storeRef
        .dispatch<any>(
          apiSlice.endpoints.getSpraakvelgerFeatureToggle.initiate()
        )
        .then((result: FetchBaseQueryError) => {
          expect(result.status).toBe('rejected')
          expect(result.data).toBe(undefined)
        })
    })

    it('kaster feil ved uforventet format på responsen', async () => {
      const storeRef = await setupStore({}, true)

      mockResponse('/feature/pensjonskalkulator.disable-spraakvelger', {
        status: 200,
        json: { lorem: 'ipsum' },
      })

      await swallowErrorsAsync(async () => {
        await storeRef
          .dispatch<any>(
            apiSlice.endpoints.getSpraakvelgerFeatureToggle.initiate()
          )
          .then((result: FetchBaseQueryError) => {
            expect(result).toThrow(Error)
            expect(result.status).toBe('rejected')
            expect(result.data).toBe(undefined)
          })
      })
    })
  })
})
