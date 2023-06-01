import React from 'react'
import { Provider } from 'react-redux'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'

import ReactDOM from 'react-dom/client'

import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LanguageProvider } from '@/containers/LanguageProvider'
import { ROUTER_BASE_URL, routes } from '@/routes'

import { store } from './state/store'

import './scss/designsystem.scss'

if (process.env.NODE_ENV === 'development') {
  const msw = await import('./mocks/browser')
  await msw.worker.start({ onUnhandledRequest: 'bypass' })
  msw.worker.printHandlers()
}

const root = document.getElementById('root')

if (!root) {
  throw Error(`Missing root element`)
}

const router = createBrowserRouter(routes, {
  basename: ROUTER_BASE_URL,
})

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <LanguageProvider>
          <RouterProvider router={router} />
        </LanguageProvider>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
)
