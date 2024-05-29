import { UNSAFE_DeferredData } from '@remix-run/router'
import { describe, it, vi } from 'vitest'

import {
  directAccessGuard,
  authenticationGuard,
  landingPageAccessGuard,
  step0AccessGuard,
  step3AccessGuard,
  step4AccessGuard,
  step5AccessGuard,
  step6AccessGuard,
} from '../loaders'
import { mockResponse, mockErrorResponse } from '@/mocks/server'
import { externalUrls, henvisningUrlParams, paths } from '@/router/constants'
import * as apiSliceUtils from '@/state/api/apiSlice'
import { store } from '@/state/store'
import { userInputInitialState } from '@/state/userInput/userInputReducer'
import { waitFor } from '@/test-utils'

const fakeApiCalls = {
  queries: {
    ['tulleQuery(undefined)']: {
      status: 'fulfilled',
      endpointName: 'getPerson',
      requestId: 'xTaE6mOydr5ZI75UXq4Wi',
      startedTimeStamp: 1688046411971,
      data: {
        navn: 'Aprikos',
        sivilstand: 'UGIFT',
        foedselsdato: '1963-04-30',
      },
      fulfilledTimeStamp: 1688046412103,
    },
  },
}

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
          ...fakeApiCalls,
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
          ...fakeApiCalls,
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
    it('kaller getPersonQuery, getInntekt og getEkskludertStatus og returnerer en defered response med getPerson og en redirect url', async () => {
      const initiateGetPersonMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.getPerson,
        'initiate'
      )
      const initiateGetInntektMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.getInntekt,
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
      expect(initiateGetEkskludertStatusMock).toHaveBeenCalled()
    })

    // it('Når brukeren har gjenlevendeytelse, returneres det riktig redirect url', async () => {
    //   mockResponse('/v1/ekskludert', {
    //     json: {
    //       ekskludert: true,
    //       aarsak: 'HAR_GJENLEVENDEYTELSE',
    //     },
    //   })

    //   const mockedState = {
    //     userInput: { ...userInputInitialState },
    //   }
    //   store.getState = vi.fn().mockImplementation(() => {
    //     return mockedState
    //   })
    //   const returnedFromLoader = await step0AccessGuard()
    //   await returnedFromLoader.data.getPersonQuery
    //   const shouldRedirectToResponse =
    //     await returnedFromLoader.data.shouldRedirectTo

    //   await waitFor(async () => {
    //     expect(shouldRedirectToResponse).toEqual(
    //       `${paths.henvisning}/${henvisningUrlParams.gjenlevende}`
    //     )
    //   })
    // })

    it('Når brukeren har bruker har medlemskap til apoterkerne, returneres det riktig redirect url', async () => {
      mockResponse('/v1/ekskludert', {
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

  describe('step3AccessGuard', () => {
    it('kaller redirect til /start location, når samtykke er null', async () => {
      const mockedState = {
        userInput: { ...userInputInitialState, samtykke: null },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })
      expect(await step3AccessGuard()).toMatchSnapshot()
    })

    it('kaller redirect til /afp location når samtykke er oppgitt til false', async () => {
      const mockedState = {
        api: {
          ...fakeApiCalls,
        },
        userInput: { ...userInputInitialState, samtykke: false },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })
      expect(await step3AccessGuard()).toMatchSnapshot()
    })

    it('kaller getTpoMedlemskapQuery og returnerer en defered response med en tom redirect url, når samtykke er true og brukeren har tp-forhold', async () => {
      const initiateMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.getTpoMedlemskap,
        'initiate'
      )
      const mockedState = {
        api: {
          ...fakeApiCalls,
        },
        userInput: { ...userInputInitialState, samtykke: true },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })
      const returnedFromLoader = await step3AccessGuard()
      const shouldRedirectToResponse = await (
        returnedFromLoader as UNSAFE_DeferredData
      ).data.shouldRedirectTo

      await waitFor(async () => {
        expect(shouldRedirectToResponse).toEqual('')
      })
      expect(initiateMock).toHaveBeenCalled()
    })

    it('kaller getTpoMedlemskapQuery og returnerer en defered response med en redirect url, når samtykke er true og brukeren ikke har tp-forhold', async () => {
      mockResponse('/tpo-medlemskap', {
        status: 200,
        json: { harTjenestepensjonsforhold: false },
      })

      const initiateMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.getTpoMedlemskap,
        'initiate'
      )
      const mockedState = {
        api: {
          ...fakeApiCalls,
        },
        userInput: { ...userInputInitialState, samtykke: true },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })
      const returnedFromLoader = await step3AccessGuard()
      const shouldRedirectToResponse = await (
        returnedFromLoader as UNSAFE_DeferredData
      ).data.shouldRedirectTo

      await waitFor(async () => {
        expect(shouldRedirectToResponse).toEqual(paths.afp)
      })
      expect(initiateMock).toHaveBeenCalled()
    })

    it('kaller getTpoMedlemskapQuery og returnerer en rejected defered response, når samtykke er true og tp-forhold feilet', async () => {
      mockErrorResponse('/tpo-medlemskap')
      const initiateMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.getTpoMedlemskap,
        'initiate'
      )
      const mockedState = {
        api: {
          ...fakeApiCalls,
        },
        userInput: { ...userInputInitialState, samtykke: true },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })

      try {
        const returnedFromLoader = await step3AccessGuard()
        await (returnedFromLoader as UNSAFE_DeferredData).data.shouldRedirectTo
      } catch (error) {
        expect(error).toEqual(null)
        expect(initiateMock).toHaveBeenCalled()
      }
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

    it('Når kall til /ufoeregrad feiler returneres det redirect url til feilsiden', async () => {
      mockErrorResponse('/v1/ufoeregrad')
      const initiateMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.getUfoeregrad,
        'initiate'
      )

      const mockedState = {
        api: {
          queries: {
            ['getInntekt(undefined)']: {
              status: 'fulfilled',
              endpointName: 'getInntekt',
              requestId: 'aVfT2Ly4YtGoIOvDdZfmG',
              startedTimeStamp: 1714725265404,
              data: { beloep: '500000', aar: '2022' },
              fulfilledTimeStamp: 1714725797669,
            },
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
      const shouldRedirectToResponse = await (
        returnedFromLoader as UNSAFE_DeferredData
      ).data.shouldRedirectTo

      await waitFor(async () => {
        expect(shouldRedirectToResponse).toEqual(paths.uventetFeil)
      })
      expect(initiateMock).toHaveBeenCalled()
    })

    it('Gitt kall til inntekt har tidligere feilet, kjøres det nytt kall. Når den fungerer igjen returneres det tom redirect url', async () => {
      const initiateMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.getInntekt,
        'initiate'
      )

      const mockedState = {
        api: {
          queries: {
            ['getInntekt(undefined)']: {
              status: 'rejected',
              endpointName: 'getInntekt',
              requestId: 'aVfT2Ly4YtGoIOvDdZfmG',
              startedTimeStamp: 1714725265404,
              error: {
                status: 'FETCH_ERROR',
                error: 'TypeError: Failed to fetch',
              },
            },
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
      const shouldRedirectToResponse = await (
        returnedFromLoader as UNSAFE_DeferredData
      ).data.shouldRedirectTo

      await waitFor(async () => {
        expect(shouldRedirectToResponse).toEqual('')
      })
      expect(initiateMock).toHaveBeenCalled()
    })

    it('Gitt kall til inntekt har tidligere feilet, kjøres det nytt kall. Når den feiler igjen returneres det redirect url til feilsiden', async () => {
      mockErrorResponse('/inntekt')
      const initiateMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.getInntekt,
        'initiate'
      )

      const mockedState = {
        api: {
          queries: {
            ['getInntekt(undefined)']: {
              status: 'rejected',
              endpointName: 'getInntekt',
              requestId: 'aVfT2Ly4YtGoIOvDdZfmG',
              startedTimeStamp: 1714725265404,
              error: {
                status: 'FETCH_ERROR',
                error: 'TypeError: Failed to fetch',
              },
            },
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
      const shouldRedirectToResponse = await (
        returnedFromLoader as UNSAFE_DeferredData
      ).data.shouldRedirectTo

      await waitFor(async () => {
        expect(shouldRedirectToResponse).toEqual(paths.uventetFeil)
      })
      expect(initiateMock).toHaveBeenCalled()
    })

    // it('Gitt kall til ekskludertStatus har tidligere feilet, kjøres det nytt kall. Når brukeren har gjenlevendeytelse, returneres det riktig redirect url', async () => {
    //   mockResponse('/v1/ekskludert', {
    //     json: {
    //       ekskludert: true,
    //       aarsak: 'HAR_GJENLEVENDEYTELSE',
    //     },
    //   })
    //   const initiateMock = vi.spyOn(
    //     apiSliceUtils.apiSlice.endpoints.getEkskludertStatus,
    //     'initiate'
    //   )

    //   const mockedState = {
    //     api: {
    //       queries: {
    //         ['getEkskludertStatus(undefined)']: {
    //           status: 'rejected',
    //           endpointName: 'getEkskludertStatus',
    //           requestId: 'aVfT2Ly4YtGoIOvDdZfmG',
    //           startedTimeStamp: 1714725265404,
    //           error: {
    //             status: 'FETCH_ERROR',
    //             error: 'TypeError: Failed to fetch',
    //           },
    //         },
    //       },
    //     },
    //     userInput: { ...userInputInitialState },
    //   }
    //   store.getState = vi.fn().mockImplementation(() => {
    //     return mockedState
    //   })
    //   const returnedFromLoader = await step4AccessGuard()
    //   const shouldRedirectToResponse = await (
    //     returnedFromLoader as UNSAFE_DeferredData
    //   ).data.shouldRedirectTo

    //   await waitFor(async () => {
    //     expect(shouldRedirectToResponse).toEqual(
    //       `${paths.henvisning}/${henvisningUrlParams.gjenlevende}`
    //     )
    //   })
    //   expect(initiateMock).toHaveBeenCalled()
    // })

    it('Gitt kall til ekskludertStatus har tidligere feilet, kjøres det nytt kall. Når brukeren har medlemskap til apoterkerne, returneres det riktig redirect url', async () => {
      mockResponse('/v1/ekskludert', {
        json: {
          ekskludert: true,
          aarsak: 'ER_APOTEKER',
        },
      })
      const initiateMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.getEkskludertStatus,
        'initiate'
      )

      const mockedState = {
        api: {
          queries: {
            ['getEkskludertStatus(undefined)']: {
              status: 'rejected',
              endpointName: 'getEkskludertStatus',
              requestId: 'aVfT2Ly4YtGoIOvDdZfmG',
              startedTimeStamp: 1714725265404,
              error: {
                status: 'FETCH_ERROR',
                error: 'TypeError: Failed to fetch',
              },
            },
          },
        },
        userInput: { ...userInputInitialState },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })
      const returnedFromLoader = await step4AccessGuard()
      const shouldRedirectToResponse = await (
        returnedFromLoader as UNSAFE_DeferredData
      ).data.shouldRedirectTo

      await waitFor(async () => {
        expect(shouldRedirectToResponse).toEqual(
          `${paths.henvisning}/${henvisningUrlParams.apotekerne}`
        )
      })
      expect(initiateMock).toHaveBeenCalled()
    })

    it('Gitt kall til ekskludertStatus har tidligere feilet, kjøres det nytt kall. Når brukeren ikke er ekskludert, returneres det tom redirect url', async () => {
      const initiateMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.getEkskludertStatus,
        'initiate'
      )

      const mockedState = {
        api: {
          queries: {
            ['getEkskludertStatus(undefined)']: {
              status: 'rejected',
              endpointName: 'getEkskludertStatus',
              requestId: 'aVfT2Ly4YtGoIOvDdZfmG',
              startedTimeStamp: 1714725265404,
              error: {
                status: 'FETCH_ERROR',
                error: 'TypeError: Failed to fetch',
              },
            },
            ['getInntekt(undefined)']: {
              status: 'fulfilled',
              endpointName: 'getInntekt',
              requestId: 'Agg8YpiSQJ9z7snnDTE7c',
              data: { beloep: 500000, aar: '2022' },
              startedTimeStamp: 1714725797073,
              fulfilledTimeStamp: 1714725797288,
            },
          },
        },
        userInput: { ...userInputInitialState },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })
      const returnedFromLoader = await step4AccessGuard()
      const shouldRedirectToResponse = await (
        returnedFromLoader as UNSAFE_DeferredData
      ).data.shouldRedirectTo

      await waitFor(async () => {
        expect(shouldRedirectToResponse).toEqual('')
      })
      expect(initiateMock).toHaveBeenCalled()
    })

    it('Gitt kall til ekskludertStatus har tidligere feilet, kjøres det nytt kall. Når den feiler igjen returneres det redirect url til feilsiden', async () => {
      mockErrorResponse('/v1/ekskludert')

      const initiateMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.getEkskludertStatus,
        'initiate'
      )

      const mockedState = {
        api: {
          queries: {
            ['getEkskludertStatus(undefined)']: {
              status: 'rejected',
              endpointName: 'getEkskludertStatus',
              requestId: 'aVfT2Ly4YtGoIOvDdZfmG',
              startedTimeStamp: 1714725265404,
              error: {
                status: 'FETCH_ERROR',
                error: 'TypeError: Failed to fetch',
              },
            },
          },
        },
        userInput: { ...userInputInitialState },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })
      const returnedFromLoader = await step4AccessGuard()
      const shouldRedirectToResponse = await (
        returnedFromLoader as UNSAFE_DeferredData
      ).data.shouldRedirectTo

      await waitFor(async () => {
        expect(shouldRedirectToResponse).toEqual(paths.uventetFeil)
      })
      expect(initiateMock).toHaveBeenCalled()
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

      const returnedFromLoader = await step5AccessGuard()
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

      const returnedFromLoader = await step5AccessGuard()
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

      const returnedFromLoader = await step5AccessGuard()
      expect(returnedFromLoader).not.toBeNull()
      expect(returnedFromLoader).toMatchSnapshot()
    })
  })

  describe('step6AccessGuard', async () => {
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
      const returnedFromLoader = await step6AccessGuard()
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

      const returnedFromLoader = await step6AccessGuard()
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

      const returnedFromLoader = await step6AccessGuard()
      const shouldRedirectToResponse = await (
        returnedFromLoader as UNSAFE_DeferredData
      ).data.shouldRedirectTo
      expect(shouldRedirectToResponse).toBe(paths.beregningEnkel)
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

      const returnedFromLoader = await step6AccessGuard()
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

      const returnedFromLoader = await step6AccessGuard()
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

      const returnedFromLoader = await step6AccessGuard()
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
})
