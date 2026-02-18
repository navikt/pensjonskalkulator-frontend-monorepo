import { getHandlers } from '@pensjonskalkulator-frontend-monorepo/mocks/handlers'
import { setupWorker } from 'msw/browser'

const handlers = getHandlers()
export const worker = setupWorker(...handlers)
