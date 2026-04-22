import { setupWorker } from 'msw/browser'

import { type HandlerOptions, getHandlers } from './handlers'

export const createWorker = (options?: HandlerOptions) =>
	setupWorker(...getHandlers(options))

export const worker = createWorker()
