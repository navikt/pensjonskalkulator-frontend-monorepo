import { mockErrorResponse, mockResponse } from '@/mocks/server'
import { setupStore } from '@/state/store'
import { apiSlice } from '@/state/api/apiSlice'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import { swallowErrorsAsync } from '@/test-utils'

const inntektResponse = require('../../../mocks/data/inntekt.json')
const personResponse = require('../../../mocks/data/person.json')
const tpoMedlemskapResponse = require('../../../mocks/data/tpo-medlemskap.json')
const tidligsteUttaksalderResponse = require('../../../mocks/data/tidligsteUttaksalder.json')
const pensjonsavtalerResponse = require('../../../mocks/data/pensjonsavtaler/67.json')
const alderspensjonResponse = require('../../../mocks/data/alderspensjon/67.json')
const sakStatusResponse = require('../../../mocks/data/sak-status.json')
const spraakvelgerToggleResponse = require('../../../mocks/data/unleash-disable-spraakvelger.json')
const highchartsAccessibilityPluginResponse = require('../../../mocks/data/unleash-enable-highcharts-accessibility-plugin.json')
const highchartsDetaljertFaneResponse = require('../../../mocks/data/unleash-enable-detaljert-fane.json')

// TODO: fikse bedre typing ved dispatch
describe('apiSlice', () => {
  it('eksponerer riktig endepunkter', async () => {
    expect(apiSlice.endpoints).toHaveProperty('getInntekt')
    expect(apiSlice.endpoints).toHaveProperty('getPerson')
    expect(apiSlice.endpoints).toHaveProperty('getTpoMedlemskap')
    expect(apiSlice.endpoints).toHaveProperty('pensjonsavtaler')
    expect(apiSlice.endpoints).toHaveProperty('tidligsteUttaksalder')
    expect(apiSlice.endpoints).toHaveProperty('alderspensjon')
    expect(apiSlice.endpoints).toHaveProperty('getSpraakvelgerFeatureToggle')
  })

  describe('getInntekt', () => {
    it('returnerer data ved vellykket query', async () => {
      const storeRef = await setupStore({}, true)
      return storeRef
        .dispatch<any>(apiSlice.endpoints.getInntekt.initiate())
        .then((result: FetchBaseQueryError) => {
          expect(result.status).toBe('fulfilled')
          expect(result.data).toMatchObject(inntektResponse)
        })
    })

    it('returnerer undefined ved feilende query', async () => {
      const storeRef = await setupStore({}, true)
      mockErrorResponse('/inntekt')
      return storeRef
        .dispatch<any>(apiSlice.endpoints.getInntekt.initiate())
        .then((result: FetchBaseQueryError) => {
          expect(result.status).toBe('rejected')
          expect(result.data).toBe(undefined)
        })
    })

    it('kaster feil ved uventet format på responsen', async () => {
      const storeRef = await setupStore({}, true)
      mockResponse('/inntekt', {
        status: 200,
        json: { aar: '532' },
      })
      await swallowErrorsAsync(async () => {
        await storeRef
          .dispatch<any>(apiSlice.endpoints.getInntekt.initiate())
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
          expect(result.data).toMatchObject({
            ...personResponse,
            foedselsdato: '1963-04-30',
          })
        })
    })

    it('returnerer undefined ved feilende query', async () => {
      const storeRef = await setupStore({}, true)
      mockErrorResponse('/v1/person')
      return storeRef
        .dispatch<any>(apiSlice.endpoints.getPerson.initiate())
        .then((result: FetchBaseQueryError) => {
          expect(result.status).toBe('rejected')
          expect(result.data).toBe(undefined)
        })
    })

    it('kaster feil ved uventet format på responsen', async () => {
      const storeRef = await setupStore({}, true)
      mockResponse('/v1/person', {
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

  describe('getSakStatus', () => {
    it('returnerer data ved vellykket query', async () => {
      const storeRef = await setupStore({}, true)
      return storeRef
        .dispatch<any>(apiSlice.endpoints.getSakStatus.initiate())
        .then((result: FetchBaseQueryError) => {
          expect(result.status).toBe('fulfilled')
          expect(result.data).toMatchObject(sakStatusResponse)
        })
    })

    it('kaster feil ved uforventet format på data', async () => {
      const storeRef = await setupStore({}, true)

      mockResponse('/sak-status', {
        json: {
          feil: 'format',
        },
      })
      await swallowErrorsAsync(async () => {
        return storeRef
          .dispatch<any>(apiSlice.endpoints.getSakStatus.initiate())
          .then((result: FetchBaseQueryError) => {
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

    it('kaster feil ved uventet format på responsen', async () => {
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

  describe('pensjonsavtaler', () => {
    const dummyRequestBody = {
      aarligInntektFoerUttak: 500000,
      uttaksperioder: [
        {
          startAlder: { aar: 67, maaneder: 0 },
          grad: 100,
          aarligInntekt: 500000,
        },
      ],
      antallInntektsaarEtterUttak: 0,
    }

    it('returnerer riktig data og flag ved vellykket query', async () => {
      const storeRef = await setupStore({}, true)
      return storeRef
        .dispatch<any>(
          apiSlice.endpoints.pensjonsavtaler.initiate(dummyRequestBody)
        )
        .then((result: FetchBaseQueryError) => {
          expect(result.status).toBe('fulfilled')
          const obj = result.data as {
            avtaler: Pensjonsavtale[]
            partialResponse: boolean
          }
          expect(obj.avtaler).toMatchObject(pensjonsavtalerResponse.avtaler)
          expect(obj.partialResponse).toBeFalsy()
        })
    })

    it('returnerer riktig data og flagg ved delvis vellykket query', async () => {
      const avtale = {
        produktbetegnelse: 'IPS',
        kategori: 'INDIVIDUELL_ORDNING',
        startAar: 70,
        sluttAar: 75,
        utbetalingsperioder: [
          {
            startAlder: { aar: 70, maaneder: 6 },
            sluttAlder: { aar: 75, maaneder: 6 },
            aarligUtbetaling: 41802,
            grad: 100,
          },
        ],
      }
      mockResponse('/v1/pensjonsavtaler', {
        status: 200,
        json: {
          avtaler: [{ ...avtale }],
          utilgjengeligeSelskap: ['Something'],
        },
        method: 'post',
      })
      const storeRef = await setupStore({}, true)
      return storeRef
        .dispatch<any>(
          apiSlice.endpoints.pensjonsavtaler.initiate(dummyRequestBody)
        )
        .then((result: FetchBaseQueryError) => {
          expect(result.status).toBe('fulfilled')
          const obj = result.data as {
            avtaler: Pensjonsavtale[]
            partialResponse: boolean
          }
          expect(obj.avtaler).toMatchObject([{ ...avtale }])
          expect(obj.partialResponse).toBeTruthy()
        })
    })

    it('returnerer undefined ved feilende query', async () => {
      const storeRef = await setupStore({}, true)
      mockErrorResponse('/v1/pensjonsavtaler', {
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

    it('kaster feil ved uventet format på responsen', async () => {
      const storeRef = await setupStore({}, true)
      mockResponse('/v1/pensjonsavtaler', {
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
      mockErrorResponse('/v1/tidligste-uttaksalder', {
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

    it('kaster feil ved uventet format på responsen', async () => {
      const storeRef = await setupStore({}, true)
      mockResponse('/v1/tidligste-uttaksalder', {
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
      simuleringstype: 'ALDERSPENSJON_MED_AFP_PRIVAT',
      uttaksgrad: 100,
      foedselsdato: '1963-04-30',
      foersteUttaksalder: { aar: 67, maaneder: 8 },
      sivilstand: 'UGIFT',
      epsHarInntektOver2G: true,
    }
    it('returnerer data ved vellykket query', async () => {
      const storeRef = await setupStore({}, true)
      return storeRef
        .dispatch<any>(apiSlice.endpoints.alderspensjon.initiate(body))
        .then((result: FetchBaseQueryError) => {
          expect(result.status).toBe('fulfilled')
          expect(result.data).toMatchObject(alderspensjonResponse)
        })
    })

    it('returnerer undefined ved feilende query', async () => {
      const storeRef = await setupStore({}, true)
      mockErrorResponse('/v1/alderspensjon/simulering', {
        method: 'post',
      })
      return storeRef
        .dispatch<any>(apiSlice.endpoints.alderspensjon.initiate(body))
        .then((result: FetchBaseQueryError) => {
          expect(result.status).toBe('rejected')
          expect(result.data).toBe(undefined)
        })
    })

    it('kaster feil ved uventet format på responsen', async () => {
      const storeRef = await setupStore({}, true)
      mockResponse('/v1/alderspensjon/simulering', {
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

  describe('getSpraakvelgerFeatureToggle', () => {
    it('returnerer data ved vellykket query', async () => {
      const storeRef = await setupStore({}, true)
      return storeRef
        .dispatch<any>(
          apiSlice.endpoints.getSpraakvelgerFeatureToggle.initiate()
        )
        .then((result: FetchBaseQueryError) => {
          expect(result.status).toBe('fulfilled')
          expect(result.data).toMatchObject(spraakvelgerToggleResponse)
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

    it('kaster feil ved uventet format på responsen', async () => {
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

  describe('getHighchartsAccessibilityPluginFeatureToggle', () => {
    it('returnerer data ved vellykket query', async () => {
      const storeRef = setupStore({}, true)
      return storeRef
        .dispatch<any>(
          apiSlice.endpoints.getHighchartsAccessibilityPluginFeatureToggle.initiate()
        )
        .then((result: FetchBaseQueryError) => {
          expect(result.status).toBe('fulfilled')
          expect(result.data).toMatchObject(
            highchartsAccessibilityPluginResponse
          )
        })
    })

    it('returnerer undefined ved feilende query', async () => {
      const storeRef = setupStore({}, true)
      mockErrorResponse(
        '/feature/pensjonskalkulator.enable-highcharts-accessibility-plugin'
      )
      return storeRef
        .dispatch<any>(
          apiSlice.endpoints.getHighchartsAccessibilityPluginFeatureToggle.initiate()
        )
        .then((result: FetchBaseQueryError) => {
          expect(result.status).toBe('rejected')
          expect(result.data).toBe(undefined)
        })
    })

    it('kaster feil ved uventet format på responsen', async () => {
      const storeRef = await setupStore({}, true)

      mockResponse(
        '/feature/pensjonskalkulator.enable-highcharts-accessibility-plugin',
        {
          status: 200,
          json: { lorem: 'ipsum' },
        }
      )

      await swallowErrorsAsync(async () => {
        await storeRef
          .dispatch<any>(
            apiSlice.endpoints.getHighchartsAccessibilityPluginFeatureToggle.initiate()
          )
          .then((result: FetchBaseQueryError) => {
            expect(result).toThrow(Error)
            expect(result.status).toBe('rejected')
            expect(result.data).toBe(undefined)
          })
      })
    })
  })

  describe('getDetaljertFaneFeatureToggle', () => {
    it('returnerer data ved vellykket query', async () => {
      const storeRef = setupStore({}, true)
      return storeRef
        .dispatch<any>(
          apiSlice.endpoints.getDetaljertFaneFeatureToggle.initiate()
        )
        .then((result: FetchBaseQueryError) => {
          expect(result.status).toBe('fulfilled')
          expect(result.data).toMatchObject(highchartsDetaljertFaneResponse)
        })
    })

    it('returnerer undefined ved feilende query', async () => {
      const storeRef = setupStore({}, true)
      mockErrorResponse('/feature/pensjonskalkulator.enable-detaljert-fane')
      return storeRef
        .dispatch<any>(
          apiSlice.endpoints.getDetaljertFaneFeatureToggle.initiate()
        )
        .then((result: FetchBaseQueryError) => {
          expect(result.status).toBe('rejected')
          expect(result.data).toBe(undefined)
        })
    })

    it('kaster feil ved uventet format på responsen', async () => {
      const storeRef = await setupStore({}, true)

      mockResponse('/feature/pensjonskalkulator.enable-detaljert-fane', {
        status: 200,
        json: { lorem: 'ipsum' },
      })

      await swallowErrorsAsync(async () => {
        await storeRef
          .dispatch<any>(
            apiSlice.endpoints.getDetaljertFaneFeatureToggle.initiate()
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
