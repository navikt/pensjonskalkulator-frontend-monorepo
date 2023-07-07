import React from 'react'
import { Provider } from 'react-redux'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import ReactDOM from 'react-dom/client'

import { LanguageProvider } from '@/containers/LanguageProvider'
import { initializeLogs } from '@/observability/faro'
import { BASE_PATH, routes } from '@/routes'

import { store } from './state/store'

import './scss/designsystem.scss'

const root = document.getElementById('root')

if (!root) {
  throw Error(`Missing root element`)
}

if (process.env.NODE_ENV === 'development') {
  const msw = await import('./mocks/browser')
  await msw.worker.start({ onUnhandledRequest: 'bypass' })
  msw.worker.printHandlers()
}

const router = createBrowserRouter(routes, {
  basename: BASE_PATH,
})

initializeLogs()

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <Provider store={store}>
      <LanguageProvider>
        <RouterProvider router={router} />
      </LanguageProvider>
    </Provider>
  </React.StrictMode>
)

if (window.Cypress) {
  window.store = store
  window.router = router
}
