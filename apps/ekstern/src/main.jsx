import React from 'react'

import ReactDOM from 'react-dom/client'

import { App } from './App'
import { ErrorBoundary } from './ErrorBoundary/ErrorBoundary'
import '@navikt/ds-css'

import './global.scss'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
