import { ACTION_CONFIG } from '../constants'
import type { Action, Transaction } from '../types'

const LOCALE = 'no-NO'
const TIMEZONE = 'Europe/Oslo'
const DEV = '/development'
const PROD = '/production'

const formatWithLocale = (
  date: Date,
  options: Intl.DateTimeFormatOptions
): string => date.toLocaleDateString(LOCALE, { ...options, timeZone: TIMEZONE })

const formatTimeWithLocale = (
  date: Date,
  options: Intl.DateTimeFormatOptions
): string => date.toLocaleTimeString(LOCALE, { ...options, timeZone: TIMEZONE })

export const formatDayTitle = (dayKey: string): string => {
  const d = new Date(`${dayKey}T00:00:00.000Z`)
  return formatWithLocale(d, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    weekday: 'short',
  })
}

export const formatTime = (timestamp: string): string => {
  const d = new Date(timestamp)
  return formatTimeWithLocale(d, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export const formatDateTime = (timestamp: string): string => {
  const d = new Date(timestamp)
  return d.toLocaleString(LOCALE, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: TIMEZONE,
  })
}

export const actionTone = (
  action: Transaction['action']
): 'default' | 'primary' | 'positive' | 'caution' | 'critical' =>
  ACTION_CONFIG[action]?.tone ?? ACTION_CONFIG.default.tone

export const actionLabel = (action: Action): string =>
  ACTION_CONFIG[action]?.label ?? ACTION_CONFIG.default.label

export const sortDescByTimestamp = <T extends { readonly timestamp: string }>(
  array: readonly T[]
): readonly T[] => {
  return [...array].sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}

export const groupByDay = (
  transactions: readonly Transaction[]
): Map<string, readonly Transaction[]> => {
  const map = new Map<string, readonly Transaction[]>()
  const normDay = (timestamp: string): string => timestamp.slice(0, 10)

  for (const transaction of transactions) {
    const dayKey = normDay(transaction.timestamp)
    if (!dayKey) continue
    const existing = map.get(dayKey) || []
    map.set(dayKey, [...existing, transaction])
  }

  return map
}

export const getAttemptIds = (documentId: string): readonly string[] => {
  const baseId = documentId.replace(/^drafts\./, '')
  const attemptIds = [documentId]
  if (baseId !== documentId) attemptIds.push(baseId)
  if (!documentId.startsWith('drafts.')) attemptIds.push(`drafts.${baseId}`)
  return attemptIds
}

export function getBasePath(pathname: string) {
  const environments = [DEV, PROD]
  for (const env of environments) {
    const idx = pathname.indexOf(env)
    if (idx >= 0) return pathname.slice(0, idx + env.length)
  }
  return ''
}
