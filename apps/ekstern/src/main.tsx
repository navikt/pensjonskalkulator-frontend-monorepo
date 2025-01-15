import React from 'react'
import { Provider } from 'react-redux'
import { createBrowserRouter, RouterProvider } from 'react-router'

import ReactDOM from 'react-dom/client'

import { sanityClient } from '../sanity.config'
import { LanguageProvider } from '@/context/LanguageProvider'
import { SanityContext } from '@/context/SanityContext'
import { SanityReadMore } from '@/context/SanityContext/SanityTypes'
import { initializeLogs } from '@/faro'
import { BASE_PATH } from '@/router/constants'
import { routes } from '@/router/routes'

import { store } from './state/store'

import './scss/designsystem.scss'

import '@/utils/logging'

const root = document.getElementById('root')

if (!root) {
  throw Error(`Missing root element`)
}

if (process.env.NODE_ENV === 'development') {
  const msw = await import('./mocks/browser')
  await msw.worker.start({
    serviceWorker: {
      url: '/pensjon/kalkulator/mockServiceWorker.js',
    },
    onUnhandledRequest: 'bypass',
  })
}

const router = createBrowserRouter(routes, {
  basename: BASE_PATH,
  future: {
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
  },
})

let sanityData: SanityReadMore[] = []
if (sanityClient) {
  await sanityClient.fetch(`*[_type == "readmore"]`).then((readMoreData) => {
    console.log(`Fetches readmores`, readMoreData)
    sanityData = readMoreData
  })
}

initializeLogs()

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <Provider store={store}>
      <LanguageProvider>
        <SanityContext.Provider value={{ readMoreData: sanityData }}>
          <RouterProvider router={router} />
        </SanityContext.Provider>
      </LanguageProvider>
    </Provider>
  </React.StrictMode>
)

if (window.Cypress) {
  window.store = store
  window.router = router
}
