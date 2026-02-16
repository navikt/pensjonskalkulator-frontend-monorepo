import { getHandlers } from '@pensjonskalkulator-frontend-monorepo/api/mocks'

const API_BASE = '/pensjon/kalkulator/api'

export const handlers = getHandlers({ baseUrl: API_BASE })
