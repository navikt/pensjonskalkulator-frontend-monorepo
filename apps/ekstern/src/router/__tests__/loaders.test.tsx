import { describe, it, vi } from 'vitest'

import {
  directAccessGuard,
  authenticationGuard,
  tpoMedlemskapAccessGuard,
} from '../loaders'
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
