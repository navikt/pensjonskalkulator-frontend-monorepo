import {
  configureStore,
  createListenerMiddleware,
  Unsubscribe,
} from '@reduxjs/toolkit'
import { vi } from 'vitest'

import { createSamtykkeListener } from '../samtykkeListener'
import { AppStartListening, rootReducer } from '@/state/store'
import { selectAfp } from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'

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
    const somethingString = selectAfp(store.getState())
    expect(somethingString).toBe('nei')

    store.dispatch(userInputActions.setSamtykke(true))
    const somethingStringUpdated = selectAfp(store.getState())
    expect(somethingStringUpdated).toBe('vet_ikke')
  })
})
