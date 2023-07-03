import { getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk'

export const initializeLogs = () =>
  initializeFaro({
    url:
      import.meta.env.VITE_FARO_TELEMETRY_URL ||
      'http://localhost:12347/collect',
    app: {
      name: 'pensjonskalkulator-frontend',
      version: 'dev',
    },
    instrumentations: [...getWebInstrumentations()],
  })
