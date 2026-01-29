import { setupWorker } from 'msw/browser'

import { getHandlers } from './handlers'

const handlers = getHandlers()
export const worker = setupWorker(...handlers)
