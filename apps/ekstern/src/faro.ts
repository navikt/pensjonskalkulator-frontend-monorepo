import { getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk'

import nais from '../nais.js'

export const initializeLogs = () =>
  initializeFaro({
    url: nais.telemetryCollectorURL,
    app: nais.app,
    instrumentations: [...getWebInstrumentations()],
  })
