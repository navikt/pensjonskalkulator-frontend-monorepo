import {
  configureStore,
  createListenerMiddleware,
  Unsubscribe,
} from '@reduxjs/toolkit'
import { vi } from 'vitest'

import { createUttaksalderListener } from '../uttaksalderListener'
import { apiSlice } from '@/state/api/apiSlice'
import { AppStartListening, rootReducer } from '@/state/store'
import { selectCurrentSimulation } from '@/state/userInput/selectors'
import { userInputActions } from '@/state/userInput/userInputReducer'

describe('uttaksalderListener', () => {
  const onMiddlewareError = vi.fn((): void => {})

  const listenerMiddlewareInstance = createListenerMiddleware({
    onError: onMiddlewareError,
  })

  function setupTestStore() {
    return configureStore({
      reducer: rootReducer,
      middleware: (gDM) =>
        gDM({ immutableCheck: false, serializableCheck: false })
          .concat(apiSlice.middleware)
          .prepend(listenerMiddlewareInstance.middleware),
    })
  }

  let store = setupTestStore()
  let unsubscribe: Unsubscribe

  beforeEach(() => {
    listenerMiddlewareInstance.clearListeners()
    onMiddlewareError.mockClear()
    store = setupTestStore()

    unsubscribe = createUttaksalderListener(
      listenerMiddlewareInstance.startListening as AppStartListening
    )
  })

  afterEach(() => {
    unsubscribe?.()
  })

  describe('Gitt at formatertUttaksalder oppdateres,', () => {
    it('oppdaterer currentSimulation', async () => {
      store.dispatch(
        userInputActions.setCurrentSimulationFormatertUttaksalder(
          '66 alder.aar string.og 5 alder.maaneder'
        )
      )
      const currentSimulation = selectCurrentSimulation(store.getState())
      expect(currentSimulation.startAar).toBe(66)
      expect(currentSimulation.startMaaned).toBe(5)

      store.dispatch(
        userInputActions.setCurrentSimulationFormatertUttaksalder(
          '67 alder.aar'
        )
      )
      const currentSimulationUpdated = selectCurrentSimulation(store.getState())
      expect(currentSimulationUpdated.startAar).toBe(67)
      expect(currentSimulationUpdated.startMaaned).toBe(0)
    })
  })
})
