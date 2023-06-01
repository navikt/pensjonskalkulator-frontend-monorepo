import React, { PropsWithChildren } from 'react'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'

import { PreloadedState, createListenerMiddleware } from '@reduxjs/toolkit'
import { render, RenderOptions } from '@testing-library/react'

import { createSamtykkeListener } from './state/listeners/samtykkeListener'
import {
  setupStore,
  RootState,
  AppStore,
  AppStartListening,
} from './state/store'
import { getTranslation_nb } from './translations/nb'
export interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: PreloadedState<RootState>
  store?: AppStore
}

export const swallowErrors = (testFn: () => void) => {
  const error = console.error
  console.error = () => {}
  testFn()
  console.error = error
}

export const swallowErrorsAsync = async (testFn: () => Promise<void>) => {
  const cache = console.error
  console.error = () => {}
  await testFn()
  console.error = cache
}

function generateMockedTranslations() {
  const nbTranslations = getTranslation_nb()
  const translations: Record<string, string> = {}
  for (const key in nbTranslations) {
    translations[key] = key
  }
  return translations
}

// Return an object with the store and all of RTL's query functions
export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = setupStore(preloadedState, true),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: PropsWithChildren<unknown>): JSX.Element {
    return (
      <Provider store={store}>
        <IntlProvider locale={'nb'} messages={generateMockedTranslations()}>
          {children}
        </IntlProvider>
      </Provider>
    )
  }
  const listenerMiddleware = createListenerMiddleware()
  createSamtykkeListener(listenerMiddleware.startListening as AppStartListening)

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}

export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'

export { renderWithProviders as render }
