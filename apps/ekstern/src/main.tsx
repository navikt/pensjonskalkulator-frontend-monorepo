import React from 'react'

import ReactDOM from 'react-dom/client'

import { App } from './App/App'
import { ErrorBoundary } from './ErrorBoundary/ErrorBoundary'
import '@navikt/ds-css'

const rootId = 'root'
const root = document.getElementById(rootId)

if (!root) {
  throw Error(`Missing element with id "${rootId}"`)
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
