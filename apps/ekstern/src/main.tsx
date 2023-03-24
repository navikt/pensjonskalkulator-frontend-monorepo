import React from 'react'
import { Provider } from 'react-redux'

import ReactDOM from 'react-dom/client'

import { App } from './App/App'
import { ErrorBoundary } from './ErrorBoundary/ErrorBoundary'
import { store } from './state/store'

import '@navikt/ds-css'
import '@navikt/ds-tokens'

const startRendering = () => {
  const rootId = 'root'
  const root = document.getElementById(rootId)

  if (!root) {
    throw Error(`Missing element with id "${rootId}"`)
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
}

if (process.env.NODE_ENV === 'development') {
  import('./api/browser').then((mswBrowserModule) => {
    mswBrowserModule.worker.start({ onUnhandledRequest: 'bypass' })
    mswBrowserModule.worker.printHandlers()
    startRendering()
  })
} else {
  startRendering()
}
