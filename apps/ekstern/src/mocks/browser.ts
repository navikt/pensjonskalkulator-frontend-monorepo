import { setupWorker } from 'msw'

import { getHandlers } from './handlers'

const handlers = getHandlers()
export const worker = setupWorker(...handlers)
