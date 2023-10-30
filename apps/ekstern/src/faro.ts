import { getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk'

import nais from './nais.js'
// const nais = {
//   telemetryCollectorURL: 'http://localhost:12347/collect',
//   app: {
//     name: 'pensjonskalkulator-frontend',
//     version: 'dev',
//   },
// }

export const initializeLogs = () =>
  initializeFaro({
    paused: window.location.hostname.includes('localhost'),
    url: nais.telemetryCollectorURL,
    app: nais.app,
    instrumentations: [...getWebInstrumentations()],
  })
