import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'

import { LanguageProvider } from '@/context/LanguageProvider'
import { initializeLogs } from '@/faro'

import { VeilederInput } from './pages/VeilederInput/VeilederInput'
import { store } from './state/store'

import './scss/designsystem.scss'
import '@/utils/logging'

const root = document.getElementById('root')

if (!root) {
  throw Error(`Missing root element`)
}

declare global {
  interface Window {
    __DISABLE_MSW__?: boolean
  }
}

if (process.env.NODE_ENV === 'development' && !window.__DISABLE_MSW__) {
  const msw = await import('./mocks/browser')
  await msw.worker.start({
    serviceWorker: {
      url: '/pensjon/kalkulator/mockServiceWorker.js',
    },
    onUnhandledRequest: 'bypass',
  })
}

initializeLogs()

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <Provider store={store}>
      <LanguageProvider>
        <VeilederInput />
      </LanguageProvider>
    </Provider>
  </React.StrictMode>
)

if (window.Playwright) {
  window.store = store
}
