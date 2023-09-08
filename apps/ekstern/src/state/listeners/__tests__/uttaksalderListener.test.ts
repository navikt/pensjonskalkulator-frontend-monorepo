import {
  configureStore,
  createListenerMiddleware,
  Unsubscribe,
} from '@reduxjs/toolkit'
import { vi } from 'vitest'

import { createUttaksalderListener } from '../uttaksalderListener'
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
      middleware: (gDM) => gDM().prepend(listenerMiddlewareInstance.middleware),
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
    it('oppdaterer currentSimulation og kaller ikke /pensjonsavtaler når brukeren ikke har samtykket', async () => {
      store.dispatch(
        userInputActions.setFormatertUttaksalder('66 år og 5 måneder')
      )
      const currentSimulation = selectCurrentSimulation(store.getState())
      expect(currentSimulation.startAlder).toBe(66)
      expect(currentSimulation.startMaaned).toBe(5)

      store.dispatch(userInputActions.setFormatertUttaksalder('67 år'))
      const currentSimulationUpdated = selectCurrentSimulation(store.getState())
      expect(currentSimulationUpdated.startAlder).toBe(67)
      expect(currentSimulationUpdated.startMaaned).toBe(0)

      const queries = store.getState().api.queries
      expect(queries).toEqual({})
    })

    it('oppdaterer currentSimulation og kaller /pensjonsavtaler med riktig requestBody, når brukeren har samtykket', async () => {
      store.dispatch(userInputActions.setSamtykke(true))
      store.dispatch(
        userInputActions.setFormatertUttaksalder('62 år og 2 måneder')
      )
      const currentSimulation = selectCurrentSimulation(store.getState())
      expect(currentSimulation.startAlder).toBe(62)
      expect(currentSimulation.startMaaned).toBe(2)

      const queries = store.getState().api.queries
      expect(queries).toHaveProperty(
        'pensjonsavtaler({"antallInntektsaarEtterUttak":0,"uttaksperioder":[{"aarligInntekt":0,"grad":100,"startAlder":62,"startMaaned":2}]})'
      )
    })
  })
})
