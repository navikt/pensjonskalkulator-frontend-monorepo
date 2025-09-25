import type { Action, Transaction } from '../types'

const handlers: Record<Action | 'default', () => string[]> = {
  create: () => ['Document created'],
  update: () => ['Document updated'],
  publish: () => ['Document published'],
  unpublish: () => ['Document unpublished'],
  delete: () => ['Document deleted'],
  duplicate: () => ['Document duplicated'],
  discard: () => ['Draft discarded'],
  default: () => ['System change'],
}

export const eventDetails = (transaction: Transaction): string[] => {
  const handler = handlers[transaction.action] ?? handlers.default
  return handler()
}
