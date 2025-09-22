/* eslint-disable import/export */
import { RenderOptions, render } from '@testing-library/react'
import React, { PropsWithChildren } from 'react'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'
import { MemoryRouter, RouterProvider, createBrowserRouter } from 'react-router'

import { SanityContext } from '@/context/SanityContext'
import { authenticationGuard } from '@/router/loaders'
import test_translations from '@/utils/__tests__/test-translations'

import sanityForbeholdAvsnittDataResponse from './mocks/data/sanity-forbehold-avsnitt-data.json' with { type: 'json' }
import sanityGuidePanelDataResponse from './mocks/data/sanity-guidepanel-data.json' with { type: 'json' }
import sanityReadMoreDataResponse from './mocks/data/sanity-readmore-data.json' with { type: 'json' }
import { apiSlice } from './state/api/apiSlice'
import { AppStore, RootState, setupStore } from './state/store'
import translations_nb from './translations/nb'
import {
  ForbeholdAvsnittQueryResult,
  GuidePanelQueryResult,
  ReadMoreQueryResult,
} from './types/sanity.types'

type QueryKeys = Parameters<typeof apiSlice.util.upsertQueryData>[0]

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: Partial<RootState>
  preloadedApiState?: {
    [Key in QueryKeys]?: Parameters<
      typeof apiSlice.util.upsertQueryData<Key>
    >[2]
  }
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

function generateMockedTranslations() {
  const translationsInput: Record<string, string> = {
    ...translations_nb,
    ...test_translations,
  }
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
    preloadedApiState = {},
    store = setupStore(
      {
        // Default to logged-in in tests unless explicitly overridden
        session: { isLoggedIn: true, hasErApotekerError: false },
        ...preloadedState,
      },
      true
    ),
    hasRouter = true,
    hasLogin = false,
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  const preloadedApiStateEntries = Object.entries(preloadedApiState)
  if (preloadedApiStateEntries.length) {
    store.dispatch(
      apiSlice.util.upsertQueryEntries(
        preloadedApiStateEntries.map(([key, value]) => ({
          endpointName: key as QueryKeys,
          arg: undefined,
          value,
        }))
      )
    )
  }

  function Wrapper({
    children,
  }: PropsWithChildren<unknown>): React.JSX.Element {
    const router = createBrowserRouter([
      {
        loader: authenticationGuard,
        path: '/',
        element: children,
        hydrateFallbackElement: <div />, // For å unngå error "No `HydrateFallback` element provided to render during initial hydration"
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
          <SanityContext.Provider
            value={{
              readMoreData: Object.fromEntries(
                (sanityReadMoreDataResponse.result as ReadMoreQueryResult).map(
                  (readmore) => [readmore.name, readmore]
                )
              ),
              guidePanelData: Object.fromEntries(
                (
                  sanityGuidePanelDataResponse.result as GuidePanelQueryResult
                ).map((guidepanel) => [guidepanel.name, guidepanel])
              ),
              forbeholdAvsnittData:
                sanityForbeholdAvsnittDataResponse.result as ForbeholdAvsnittQueryResult,
            }}
          >
            {hasRouter ? childrenWithRouter : children}
          </SanityContext.Provider>
        </IntlProvider>
      </Provider>
    )
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}

export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'

export { renderWithProviders as render }
