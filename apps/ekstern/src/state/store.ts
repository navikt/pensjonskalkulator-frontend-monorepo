import {
  combineReducers,
  configureStore,
  createListenerMiddleware,
  ListenerEffectAPI,
  TypedStartListening,
  TypedAddListener,
} from '@reduxjs/toolkit'

import { apiSlice } from './api/apiSlice'
import { createUttaksalderListener } from './listeners/uttaksalderListener'
import userInputReducer, {
  userInputInitialState,
} from './userInput/userInputSlice'

const listenerMiddleware = createListenerMiddleware()

export const rootReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  userInput: userInputReducer,
})

export const initialState = {
  api: {},
  userInput: userInputInitialState,
} as RootState

export function setupStore(preloadedState?: Partial<RootState>, isDev = false) {
  return configureStore({
    reducer: rootReducer,
    preloadedState: preloadedState ? preloadedState : initialState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware(
        isDev ? { immutableCheck: false, serializableCheck: false } : {}
      )
        .concat(apiSlice.middleware)
        .prepend(listenerMiddleware.middleware),
  })
}

export const store = setupStore()

createUttaksalderListener(
  listenerMiddleware.startListening as AppStartListening
)

export type RootState = ReturnType<typeof rootReducer>
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']

export type AppListenerEffectAPI = ListenerEffectAPI<RootState, AppDispatch>
export type AppStartListening = TypedStartListening<RootState, AppDispatch>
export type AppAddListener = TypedAddListener<RootState, AppDispatch>
