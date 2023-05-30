import React from 'react'
import { Provider } from 'react-redux'

import ReactDOM from 'react-dom/client'

import { App } from '@/components/App'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LanguageProvider } from '@/containers/LanguageProvider'

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

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
)
