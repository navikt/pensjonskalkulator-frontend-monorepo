import React, { PropsWithChildren } from 'react'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'
import {
  createBrowserRouter,
  MemoryRouter,
  RouterProvider,
  Routes,
  Route,
  Outlet,
} from 'react-router-dom'

import { createListenerMiddleware } from '@reduxjs/toolkit'
import { render, RenderOptions } from '@testing-library/react'

import { authenticationGuard, LoginContext } from '@/router/loaders'
import { getTranslation_test } from '@/utils/__tests__/test-translations'

import { createUttaksalderListener } from './state/listeners/uttaksalderListener'
import {
  setupStore,
  RootState,
  AppStore,
  AppStartListening,
} from './state/store'
import { getTranslation_nb } from './translations/nb'

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: Partial<RootState>
  store?: AppStore
  hasRouter?: boolean
  hasLogin?: boolean
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

interface RenderRouteWithOutletContextProps<T = LoginContext> {
  context: T
  children: React.ReactNode
}

export const RenderRouteWithOutletContext = <T,>({
  context,
  children,
}: RenderRouteWithOutletContextProps<T>) => {
  return (
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<Outlet context={context as T} />}>
          <Route index element={children} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

function generateMockedTranslations() {
  const nbTranslations: Record<string, string> = getTranslation_nb()
  const testTranslations: Record<string, string> = getTranslation_test()
  const translationsInput = { ...nbTranslations, ...testTranslations }
  const translations: Record<string, string> = {}

  for (const key in translationsInput) {
    if (
      /<(?=.*? .*?\/ ?>|br|hr|input|!--|wbr)[a-z]+.*?>|<([a-z]+).*?<\/\1>|{[^}]+}/i.test(
        translationsInput[key]
      )
    ) {
      // for html or chunks keys: results in 'my_key' : 'my_key with some <html> or {chunk}'
      translations[key] = translationsInput[key]
    } else {
      // results in 'my_key' : 'my_key'
      translations[key] = key
    }
  }
  return translations
}

// Return an object with the store and all of RTL's query functions
export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = setupStore(preloadedState, true),
    hasRouter = true,
    hasLogin = false,
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: PropsWithChildren<unknown>): JSX.Element {
    const router = createBrowserRouter([
      {
        loader: authenticationGuard,
        path: '/',
        element: children,
      },
    ])

    const childrenWithRouter = hasLogin ? (
      <RouterProvider router={router} />
    ) : (
      <MemoryRouter>{children}</MemoryRouter>
    )

    return (
      <Provider store={store}>
        <IntlProvider locale="nb" messages={generateMockedTranslations()}>
          {hasRouter ? childrenWithRouter : children}
        </IntlProvider>
      </Provider>
    )
  }

  const listenerMiddleware = createListenerMiddleware()
  createUttaksalderListener(
    listenerMiddleware.startListening as AppStartListening
  )

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}

export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'

export { renderWithProviders as render }
