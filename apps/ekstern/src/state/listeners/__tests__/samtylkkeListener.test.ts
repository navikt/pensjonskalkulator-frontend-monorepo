import {
  configureStore,
  createListenerMiddleware,
  Unsubscribe,
} from '@reduxjs/toolkit'
import { vi } from 'vitest'

import { AppStartListening, rootReducer } from '../../store'
import { selectSomething } from '../../userInput/selectors'
import { userInputActions } from '../../userInput/userInputReducer'
import { createSamtykkeListener } from '../samtykkeListener'

describe('samtykkeListener', () => {
  const onMiddlewareError = vi.fn((): void => {})

  const listenerMiddlewareInstance = createListenerMiddleware({
    onError: onMiddlewareError,
  })

  function setupTestStore() {
    return configureStore({
      reducer: rootReducer,
      middleware: (gDM) => gDM().prepend(listenerMiddlewareInstance.middleware),
    })
  }

  let store = setupTestStore()
  let unsubscribe: Unsubscribe

  beforeEach(() => {
    listenerMiddlewareInstance.clearListeners()
    onMiddlewareError.mockClear()
    store = setupTestStore()

    unsubscribe = createSamtykkeListener(
      listenerMiddlewareInstance.startListening as AppStartListening
    )
  })

  afterEach(() => {
    unsubscribe?.()
  })

  it('lytter på endringer i samtykke og oppdaterer something-strengen', async () => {
    store.dispatch(userInputActions.setSamtykke(false))
    const somethingString = selectSomething(store.getState())
    expect(somethingString).toBe('Brukeren har ikke samtykket')

    store.dispatch(userInputActions.setSamtykke(true))
    const somethingStringUpdated = selectSomething(store.getState())
    expect(somethingStringUpdated).toBe('Brukeren har samtykket')
  })
})
