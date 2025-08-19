import {
  combineReducers,
  configureStore,
  createListenerMiddleware,
} from '@reduxjs/toolkit'

import { apiSlice } from './api/apiSlice'
import sessionReducer, { sessionInitialState } from './session/sessionSlice'
import userInputReducer, {
  userInputInitialState,
} from './userInput/userInputSlice'

const listenerMiddleware = createListenerMiddleware()

export const rootReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  session: sessionReducer,
  userInput: userInputReducer,
})

export const initialState = {
  api: {},
  session: sessionInitialState,
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

export type RootState = ReturnType<typeof rootReducer>
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch']
