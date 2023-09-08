import {
  combineReducers,
  configureStore,
  createListenerMiddleware,
  ListenerEffectAPI,
  TypedStartListening,
  TypedAddListener,
  PreloadedState,
} from '@reduxjs/toolkit'

import { apiSlice } from './api/apiSlice'
import { createUttaksalderListener } from './listeners/uttaksalderListener'
import userInputReducer from './userInput/userInputReducer'

const listenerMiddleware = createListenerMiddleware()

export const rootReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  userInput: userInputReducer,
})

export function setupStore(
  preloadedState?: PreloadedState<RootState>,
  isDev = false
) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
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
