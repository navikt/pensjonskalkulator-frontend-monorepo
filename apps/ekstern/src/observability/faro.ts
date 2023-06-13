import { getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk'

export const initializeLogs = () =>
  initializeFaro({
    url: process.env.FARO_TELEMETRY_URL,
    app: {
      name: 'pensjonskalkulator-frontend',
      version: 'dev',
    },
    instrumentations: [...getWebInstrumentations()],
  })
