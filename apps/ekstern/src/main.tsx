import React from 'react'
import { Provider } from 'react-redux'

import ReactDOM from 'react-dom/client'

import { App } from './components/App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { store } from './state/store'

import './scss/designsystem.scss'
import './scss/chartist.scss'

if (process.env.NODE_ENV === 'development') {
  const msw = await import('./api/browser')
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
        <App />
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
)
