import type { Action } from './types'

export const ACTIONS: readonly Action[] = [
  'create',
  'update',
  'publish',
  'unpublish',
  'delete',
  'duplicate',
  'discard',
  'default',
] as const

export const ACTION_CONFIG: Record<
  Action,
  {
    tone: 'default' | 'primary' | 'positive' | 'caution' | 'critical'
    label: string
  }
> = {
  create: { tone: 'positive', label: 'Created' },
  update: { tone: 'caution', label: 'Updated' },
  publish: { tone: 'positive', label: 'Published' },
  unpublish: { tone: 'caution', label: 'Unpublished' },
  delete: { tone: 'critical', label: 'Deleted' },
  duplicate: { tone: 'primary', label: 'Duplicated' },
  discard: { tone: 'caution', label: 'Discarded draft' },
  default: { tone: 'default', label: 'System change' },
}

export const CACHE_TTL_MS = 24 * 60 * 60 * 1000
export const INITIAL_VISIBLE_LIMIT = 50
