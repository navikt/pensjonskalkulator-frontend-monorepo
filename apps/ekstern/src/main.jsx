import React from 'react'

import ReactDOM from 'react-dom/client'

import '@navikt/ds-css'

import App from './App'
import './global.scss'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
