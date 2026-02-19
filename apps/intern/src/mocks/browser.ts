import { handlers } from '@pensjonskalkulator-frontend-monorepo/mocks/handlers'
import { setupWorker } from 'msw/browser'

export const worker = setupWorker(...handlers)
