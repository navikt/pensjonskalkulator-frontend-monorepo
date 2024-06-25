import { UNSAFE_DeferredData } from '@remix-run/router'
import { describe, it, vi } from 'vitest'

import {
  directAccessGuard,
  authenticationGuard,
  landingPageAccessGuard,
  step0AccessGuard,
  step1AccessGuard,
  step4AccessGuard,
  step5AccessGuard,
} from '../loaders'
import { fulfilledGetPerson } from '@/mocks/mockedRTKQueryApiCalls'
import { mockResponse } from '@/mocks/server'
import { externalUrls, henvisningUrlParams, paths } from '@/router/constants'
import * as apiSliceUtils from '@/state/api/apiSlice'
import { store } from '@/state/store'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { waitFor } from '@/test-utils'

describe('Loaders', () => {
  afterEach(() => {
    store.dispatch(apiSliceUtils.apiSlice.util.resetApiState())
  })

  describe('directAccessGuard', () => {
    it('returnerer redirect til /start location når ingen api kall er registrert', async () => {
      const mockedState = {
        api: {
          queries: {},
        },
        userInput: { ...userInputInitialState, samtykke: null },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })
      const returnedFromLoader = await directAccessGuard()
      expect(returnedFromLoader).not.toBeNull()
    })
    it('returnerer null når minst ett api kall er registrert', async () => {
      const mockedState = {
        api: {
          queries: {
            ...fulfilledGetPerson,
          },
        },
        userInput: { ...userInputInitialState, samtykke: null },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })
      const returnedFromLoader = await directAccessGuard()
      expect(returnedFromLoader).toBeNull()
    })
  })

  describe('authenticationGuard', () => {
    it('kaller /oauth2/session', async () => {
      const initiateMock = vi.spyOn(global, 'fetch')
      await authenticationGuard()
      expect(initiateMock).toHaveBeenCalledWith(
        'http://localhost:8088/pensjon/kalkulator/oauth2/session'
      )
    })
  })

  describe('landingPageAccessGuard', () => {
    it('kaller getPersonQuery og returnerer en defered response', async () => {
      const initiateMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.getPerson,
        'initiate'
      )
      const mockedState = {
        userInput: { ...userInputInitialState },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })
      const returnedFromLoader = await landingPageAccessGuard()
      const shouldRedirectToResponse = await (
        returnedFromLoader as UNSAFE_DeferredData
      ).data.shouldRedirectTo

      await waitFor(async () => {
        expect(shouldRedirectToResponse).toEqual('')
      })
      expect(initiateMock).toHaveBeenCalled()
    })

    it('redirigerer til detaljert kalkulator dersom brukeren er født før 1963', async () => {
      const open = vi.fn()
      vi.stubGlobal('open', open)

      mockResponse('/v2/person', {
        status: 200,
        json: {
          navn: 'Ola',
          sivilstand: 'GIFT',
          foedselsdato: '1960-04-30',
        },
      })

      const mockedState = {
        userInput: { ...userInputInitialState },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })
      const returnedFromLoader = await landingPageAccessGuard()
      const shouldRedirectToResponse = await (
        returnedFromLoader as UNSAFE_DeferredData
      ).data.shouldRedirectTo

      await waitFor(async () => {
        expect(shouldRedirectToResponse).toEqual('')
      })

      await waitFor(async () => {
        expect(open).toHaveBeenCalledWith(
          externalUrls.detaljertKalkulator,
          '_self'
        )
      })
    })

    it('kaller redirect til /start location når brukeren er veilder', async () => {
      const mockedState = {
        api: {
          queries: {
            ...fulfilledGetPerson,
          },
        },
        userInput: { ...userInputInitialState, veilederBorgerFnr: '81549300' },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })

      const returnedFromLoader = await landingPageAccessGuard()
      const shouldRedirectToResponse = await (
        returnedFromLoader as UNSAFE_DeferredData
      ).data.shouldRedirectTo

      await waitFor(async () => {
        expect(shouldRedirectToResponse).toEqual(paths.start)
      })
    })
  })

  describe('step0AccessGuard', () => {
    it('kaller getPersonQuery, getInntekt, getOmstillingsstoenadOgGjenlevende og getEkskludertStatus og returnerer en defered response med getPerson og en redirect url', async () => {
      const initiateGetPersonMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.getPerson,
        'initiate'
      )
      const initiateGetInntektMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.getInntekt,
        'initiate'
      )
      const initiateGetOmstillingsstoenadOgGjenlevendeMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.getOmstillingsstoenadOgGjenlevende,
        'initiate'
      )
      const initiateGetEkskludertStatusMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.getEkskludertStatus,
        'initiate'
      )
      const mockedState = {
        userInput: { ...userInputInitialState },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })
      const returnedFromLoader = await step0AccessGuard()
      const getPersonQueryResponse =
        await returnedFromLoader.data.getPersonQuery
      const shouldRedirectToResponse =
        await returnedFromLoader.data.shouldRedirectTo

      await waitFor(async () => {
        expect(
          (getPersonQueryResponse as GetPersonQuery).data.foedselsdato
        ).toBe('1963-04-30')
        expect(shouldRedirectToResponse).toEqual('')
      })
      expect(returnedFromLoader).toMatchSnapshot()
      expect(initiateGetPersonMock).toHaveBeenCalled()
      expect(initiateGetInntektMock).toHaveBeenCalled()
      expect(initiateGetOmstillingsstoenadOgGjenlevendeMock).toHaveBeenCalled()
      expect(initiateGetEkskludertStatusMock).toHaveBeenCalled()
    })

    it('Når brukeren har bruker har medlemskap til apoterkerne, returneres det riktig redirect url', async () => {
      mockResponse('/v2/ekskludert', {
        json: {
          ekskludert: true,
          aarsak: 'ER_APOTEKER',
        },
      })

      const mockedState = {
        userInput: { ...userInputInitialState },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })
      const returnedFromLoader = await step0AccessGuard()
      await returnedFromLoader.data.getPersonQuery
      const shouldRedirectToResponse =
        await returnedFromLoader.data.shouldRedirectTo

      await waitFor(async () => {
        expect(shouldRedirectToResponse).toEqual(
          `${paths.henvisning}/${henvisningUrlParams.apotekerne}`
        )
      })
    })
  })

  describe('step1AccessGuard', async () => {
    it('returnerer redirect til /start location når ingen api kall er registrert', async () => {
      const mockedState = {
        api: {
          queries: {},
        },
        userInput: { ...userInputInitialState, samtykke: null },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })
      const returnedFromLoader = await step1AccessGuard()
      expect(returnedFromLoader).not.toBeNull()
      expect(returnedFromLoader).toMatchSnapshot()
    })

    it('Når brukeren ikke har samboer, er hen ikke redirigert', async () => {
      const mockedState = {
        api: {
          queries: {
            ['getPerson(undefined)']: {
              status: 'fulfilled',
              endpointName: 'getPerson',
              requestId: 't1wLPiRKrfe_vchftk8s8',
              data: {
                navn: 'Aprikos',
                sivilstand: 'UGIFT',
                foedselsdato: '1963-04-30',
              },
              startedTimeStamp: 1714725797072,
              fulfilledTimeStamp: 1714725797669,
            },
          },
        },
        userInput: { ...userInputInitialState },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })

      const returnedFromLoader = await step1AccessGuard()
      const shouldRedirectToResponse = await (
        returnedFromLoader as UNSAFE_DeferredData
      ).data.shouldRedirectTo
      expect(shouldRedirectToResponse).toBe('')
    })

    it('Når brukeren har samboer, er hen redirigert', async () => {
      const mockedState = {
        api: {
          queries: {
            ['getPerson(undefined)']: {
              status: 'fulfilled',
              endpointName: 'getPerson',
              requestId: 't1wLPiRKrfe_vchftk8s8',
              data: {
                navn: 'Aprikos',
                sivilstand: 'GIFT',
                foedselsdato: '1963-04-30',
              },
              startedTimeStamp: 1714725797072,
              fulfilledTimeStamp: 1714725797669,
            },
          },
        },
        userInput: { ...userInputInitialState },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })

      const returnedFromLoader = await step1AccessGuard()
      const shouldRedirectToResponse = await (
        returnedFromLoader as UNSAFE_DeferredData
      ).data.shouldRedirectTo
      expect(shouldRedirectToResponse).toBe(paths.utenlandsopphold)
    })

    it('Gitt at getPerson har tidligere feilet kalles den på nytt. Når brukeren ikke har samboer, er hen ikke redirigert', async () => {
      mockResponse('/v2/person', {
        status: 200,
        json: {
          navn: 'Ola',
          sivilstand: 'UGIFT',
          foedselsdato: '1963-04-30',
        },
      })

      const mockedState = {
        api: {
          queries: {
            ['getPerson(undefined)']: {
              status: 'rejected',
              endpointName: 'getPerson',
              requestId: 't1wLPiRKrfe_vchftk8s8',
              error: {
                status: 'FETCH_ERROR',
                error: 'TypeError: Failed to fetch',
              },
              startedTimeStamp: 1714725797072,
              fulfilledTimeStamp: 1714725797669,
            },
          },
        },
        userInput: { ...userInputInitialState },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })

      const returnedFromLoader = await step1AccessGuard()
      const getPersonResponse = await (
        returnedFromLoader as UNSAFE_DeferredData
      ).data.getPersonQuery
      const shouldRedirectToResponse = await (
        returnedFromLoader as UNSAFE_DeferredData
      ).data.shouldRedirectTo
      expect((getPersonResponse as GetPersonQuery).data.sivilstand).toBe(
        'UGIFT'
      )
      expect(shouldRedirectToResponse).toBe('')
    })

    it('Gitt at getPerson har tidligere feilet kalles den på nytt. Når brukeren har samboer, er hen redirigert', async () => {
      mockResponse('/v2/person', {
        status: 200,
        json: {
          navn: 'Ola',
          sivilstand: 'GIFT',
          foedselsdato: '1963-04-30',
        },
      })

      const mockedState = {
        api: {
          queries: {
            ['getPerson(undefined)']: {
              status: 'rejected',
              endpointName: 'getPerson',
              requestId: 't1wLPiRKrfe_vchftk8s8',
              error: {
                status: 'FETCH_ERROR',
                error: 'TypeError: Failed to fetch',
              },
              startedTimeStamp: 1714725797072,
              fulfilledTimeStamp: 1714725797669,
            },
          },
        },
        userInput: { ...userInputInitialState },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })

      const returnedFromLoader = await step1AccessGuard()
      const getPersonResponse = await (
        returnedFromLoader as UNSAFE_DeferredData
      ).data.getPersonQuery
      const shouldRedirectToResponse = await (
        returnedFromLoader as UNSAFE_DeferredData
      ).data.shouldRedirectTo
      expect((getPersonResponse as GetPersonQuery).data.sivilstand).toBe('GIFT')
      expect(shouldRedirectToResponse).toBe(paths.beregningEnkel)
    })

    it('Gitt at getPerson har tidligere feilet kalles den på nytt. Når brukeren er født før 1963, er hen redirigert', async () => {
      const open = vi.fn()
      vi.stubGlobal('open', open)

      mockResponse('/v2/person', {
        status: 200,
        json: {
          navn: 'Ola',
          sivilstand: 'GIFT',
          foedselsdato: '1960-04-30',
        },
      })

      const mockedState = {
        api: {
          queries: {
            ['getPerson(undefined)']: {
              status: 'rejected',
              endpointName: 'getPerson',
              requestId: 't1wLPiRKrfe_vchftk8s8',
              error: {
                status: 'FETCH_ERROR',
                error: 'TypeError: Failed to fetch',
              },
              startedTimeStamp: 1714725797072,
              fulfilledTimeStamp: 1714725797669,
            },
          },
        },
        userInput: { ...userInputInitialState },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })

      const returnedFromLoader = await step1AccessGuard()
      const getPersonResponse = await (
        returnedFromLoader as UNSAFE_DeferredData
      ).data.getPersonQuery
      const shouldRedirectToResponse = await (
        returnedFromLoader as UNSAFE_DeferredData
      ).data.shouldRedirectTo
      expect((getPersonResponse as GetPersonQuery).data.foedselsdato).toBe(
        '1960-04-30'
      )
      expect(shouldRedirectToResponse).toBe('')

      expect(open).toHaveBeenCalledWith(
        externalUrls.detaljertKalkulator,
        '_self'
      )
    })
  })

  describe('step4AccessGuard', () => {
    it('returnerer redirect til /start location når ingen api kall er registrert', async () => {
      const mockedState = {
        api: {
          queries: {},
        },
        userInput: { ...userInputInitialState, samtykke: null },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })
      const returnedFromLoader = await step4AccessGuard()
      expect(returnedFromLoader).not.toBeNull()
      expect(returnedFromLoader).toMatchSnapshot()
    })

    it('Når brukeren har uføretrygd og har valgt afp, er hen ikke redirigert', async () => {
      const mockedState = {
        api: {
          queries: {
            ['getUfoeregrad(undefined)']: {
              status: 'fulfilled',
              endpointName: 'getUfoeregrad',
              requestId: 't1wLPiRKrfe_vchftk8s8',
              data: { ufoeregrad: 50 },
              startedTimeStamp: 1714725797072,
              fulfilledTimeStamp: 1714725797669,
            },
          },
        },
        userInput: { ...userInputInitialState, afp: 'ja_privat' },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })

      const returnedFromLoader = await step4AccessGuard()
      expect(returnedFromLoader).toBeNull()
    })

    it('Når brukeren har uføretrygd og har valgt nei til spørsmål om afp, er hen redirigert', async () => {
      const mockedState = {
        api: {
          queries: {
            ['getUfoeregrad(undefined)']: {
              status: 'fulfilled',
              endpointName: 'getUfoeregrad',
              requestId: 't1wLPiRKrfe_vchftk8s8',
              data: { ufoeregrad: 50 },
              startedTimeStamp: 1714725797072,
              fulfilledTimeStamp: 1714725797669,
            },
          },
        },
        userInput: { ...userInputInitialState, afp: 'nei' },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })

      const returnedFromLoader = await step4AccessGuard()
      expect(returnedFromLoader).not.toBeNull()
      expect(returnedFromLoader).toMatchSnapshot()
    })

    it('Når brukeren ikke har uføretrygd, er hen redirigert', async () => {
      const mockedState = {
        api: {
          queries: {
            ['getEkskludertStatus(undefined)']: {
              status: 'fulfilled',
              endpointName: 'getEkskludertStatus',
              requestId: 't1wLPiRKrfe_vchftk8s8',
              data: { ekskludert: false, aarsak: 'NONE' },
              startedTimeStamp: 1714725797072,
              fulfilledTimeStamp: 1714725797669,
            },
          },
        },
        userInput: { ...userInputInitialState },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })

      const returnedFromLoader = await step4AccessGuard()
      expect(returnedFromLoader).not.toBeNull()
      expect(returnedFromLoader).toMatchSnapshot()
    })
  })

  describe('step5AccessGuard', () => {
    it('returnerer redirect til /start location når ingen api kall er registrert', async () => {
      const mockedState = {
        api: {
          queries: {},
        },
        userInput: { ...userInputInitialState, samtykke: null },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })
      const returnedFromLoader = await step5AccessGuard()
      expect(returnedFromLoader).not.toBeNull()
      expect(returnedFromLoader).toMatchSnapshot()
    })

    it('Når brukeren ikke har uføretrygd og har valgt AFP offentlig, er hen ikke redirigert', async () => {
      const mockedState = {
        api: {
          queries: {
            ['getUfoeregrad(undefined)']: {
              status: 'fulfilled',
              endpointName: 'getUfoeregrad',
              requestId: 't1wLPiRKrfe_vchftk8s8',
              data: { ufoeregrad: 0 },
              startedTimeStamp: 1714725797072,
              fulfilledTimeStamp: 1714725797669,
            },
          },
        },
        userInput: { ...userInputInitialState, afp: 'ja_offentlig' },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })

      const returnedFromLoader = await step5AccessGuard()
      expect(returnedFromLoader).toBeNull()
    })

    it('Når brukeren har uføretrygd og har valgt ja_offentlig til spørsmål om afp, er hen redirigert', async () => {
      const mockedState = {
        api: {
          queries: {
            ['getUfoeregrad(undefined)']: {
              status: 'fulfilled',
              endpointName: 'getUfoeregrad',
              requestId: 't1wLPiRKrfe_vchftk8s8',
              data: { ufoeregrad: 50 },
              startedTimeStamp: 1714725797072,
              fulfilledTimeStamp: 1714725797669,
            },
          },
        },
        userInput: { ...userInputInitialState, afp: 'ja_offentlig' },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })

      const returnedFromLoader = await step5AccessGuard()
      expect(returnedFromLoader).not.toBeNull()
      expect(returnedFromLoader).toMatchSnapshot()
    })

    it('Når brukeren ikke har uføretrygd og har valgt afp nei, er hen redirigert', async () => {
      const mockedState = {
        api: {
          queries: {
            ['getUfoeregrad(undefined)']: {
              status: 'fulfilled',
              endpointName: 'getUfoeregrad',
              requestId: 't1wLPiRKrfe_vchftk8s8',
              data: { ufoeregrad: 0 },
              startedTimeStamp: 1714725797072,
              fulfilledTimeStamp: 1714725797669,
            },
          },
        },
        userInput: { ...userInputInitialState, afp: 'nei' },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })

      const returnedFromLoader = await step5AccessGuard()
      expect(returnedFromLoader).not.toBeNull()
      expect(returnedFromLoader).toMatchSnapshot()
    })
  })
})
