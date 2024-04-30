import { describe, it, vi } from 'vitest'

import {
  directAccessGuard,
  authenticationGuard,
  landingPageAccessGuard,
  step0AccessGuard,
  tpoMedlemskapAccessGuard,
} from '../loaders'
import { mockResponse } from '@/mocks/server'
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
        fornavn: 'Aprikos',
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
      const getPersonQueryPromise = await returnedFromLoader.data.getPersonQuery

      await waitFor(async () => {
        expect(
          (getPersonQueryPromise as GetPersonQuery).data.foedselsdato
        ).toBe('1963-04-30')
      })
      expect(returnedFromLoader).toMatchSnapshot()
      expect(initiateMock).toHaveBeenCalled()
    })

    it('redirigerer til detaljert kalkulator dersom brukeren er født før 1963', async () => {
      const open = vi.fn()
      vi.stubGlobal('open', open)

      mockResponse('/v1/person', {
        status: 200,
        json: {
          fornavn: 'Ola',
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
      const getPersonQueryPromise = await returnedFromLoader.data.getPersonQuery

      await waitFor(async () => {
        expect(
          (getPersonQueryPromise as GetPersonQuery).data.foedselsdato
        ).toBe('1960-04-30')
        expect(open).toHaveBeenCalledWith(
          externalUrls.detaljertKalkulator,
          '_self'
        )
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
      const getPersonQueryPromise = await returnedFromLoader.data.getPersonQuery
      const shouldRedirectToPromise =
        await returnedFromLoader.data.shouldRedirectTo

      await waitFor(async () => {
        expect(
          (getPersonQueryPromise as GetPersonQuery).data.foedselsdato
        ).toBe('1963-04-30')
        expect(shouldRedirectToPromise).toEqual('')
      })
      expect(returnedFromLoader).toMatchSnapshot()
      expect(initiateGetPersonMock).toHaveBeenCalled()
      expect(initiateGetInntektMock).toHaveBeenCalled()
      expect(initiateGetEkskludertStatusMock).toHaveBeenCalled()
    })

    it('Når brukeren har gjenlevendeytelse, returneres det riktig redirect url', async () => {
      mockResponse('/v1/ekskludert', {
        json: {
          ekskludert: true,
          aarsak: 'HAR_GJENLEVENDEYTELSE',
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
      const shouldRedirectToPromise =
        await returnedFromLoader.data.shouldRedirectTo

      await waitFor(async () => {
        expect(shouldRedirectToPromise).toEqual(
          `${paths.henvisning}/${henvisningUrlParams.gjenlevende}`
        )
      })
    })

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
      const shouldRedirectToPromise =
        await returnedFromLoader.data.shouldRedirectTo

      await waitFor(async () => {
        expect(shouldRedirectToPromise).toEqual(
          `${paths.henvisning}/${henvisningUrlParams.apotekerne}`
        )
      })
    })
  })

  describe('tpoMedlemskapAccessGuard', () => {
    it('kaller redirect til /start location når samtykke er null', async () => {
      const mockedState = {
        userInput: { ...userInputInitialState, samtykke: null },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })
      expect(await tpoMedlemskapAccessGuard()).toMatchSnapshot()
    })

    it('kaller redirect til /afp location når samtykke er oppgitt til false', async () => {
      const mockedState = {
        userInput: { ...userInputInitialState, samtykke: false },
      }
      store.getState = vi.fn().mockImplementation(() => {
        return mockedState
      })
      expect(await tpoMedlemskapAccessGuard()).toMatchSnapshot()
    })

    it('kaller tp-registret når samtykke er oppgitt til true', async () => {
      const initiateMock = vi.spyOn(
        apiSliceUtils.apiSlice.endpoints.getTpoMedlemskap,
        'initiate'
      )
      const mockedState = {
        userInput: { ...userInputInitialState, samtykke: true },
      }
      store.getState = vi.fn().mockImplementationOnce(() => {
        return mockedState
      })

      expect(await tpoMedlemskapAccessGuard()).toMatchSnapshot()
      expect(initiateMock).toHaveBeenCalled()
    })
  })
})
