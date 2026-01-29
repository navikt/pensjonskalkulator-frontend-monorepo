import type { SanityClient } from '@sanity/client'

import type { Action, Actor, ListOptions, Transaction } from '../types'
import { sortDescByTimestamp } from '../utils'

export interface TransactionNdjsonRow {
  readonly id?: string
  readonly txId?: string
  readonly timestamp?: string
  readonly time?: string
  readonly _ts?: string
  readonly _updatedAt?: string
  readonly operation?: string
  readonly op?: string
  readonly documentId?: string
  readonly documentIds?: readonly string[]
  readonly documentType?: string
  readonly type?: string
  readonly mutations?: ReadonlyArray<{
    readonly delete?: unknown
    readonly patch?: unknown
    readonly create?: unknown
    readonly createIfNotExists?: unknown
    readonly createOrReplace?: unknown
  }>
  readonly author?: unknown
  readonly identity?: unknown
  readonly userId?: string
  readonly authorId?: string
  readonly user?: unknown
  readonly actor?: unknown
  readonly prevRev?: string
  readonly beforeRev?: string
  readonly nextRev?: string
  readonly afterRev?: string
  readonly rev?: string
  readonly message?: string
  readonly comment?: string
}

const getDataset = (client: SanityClient): string =>
  client.config().dataset || 'production'

const buildTransactionParams = (
  limit?: number,
  offset?: number
): URLSearchParams => {
  const queryParams = new URLSearchParams()
  queryParams.set('excludeContent', 'true')
  queryParams.set('reverse', 'true')
  if (typeof limit === 'number') queryParams.set('limit', String(limit))
  if (typeof offset === 'number' && offset > 0)
    queryParams.set('offset', String(offset))
  return queryParams
}

const parseMonthKey = (timestamp: string): string => timestamp.slice(0, 7)

const filterUserDocIds = (ids: string[]): string[] =>
  ids.filter((id) => !id.startsWith('_.') && !id.startsWith('drafts.'))

const groupByMonth = (
  transactions: readonly Transaction[]
): Map<string, Transaction[]> => {
  const byMonth = new Map<string, Transaction[]>()
  for (const transaction of transactions) {
    const monthKey = parseMonthKey(transaction.timestamp)
    if (!monthKey) continue
    const array = byMonth.get(monthKey) || []
    array.push(transaction)
    byMonth.set(monthKey, array)
  }
  return byMonth
}

const sortMonthlyTransactions = (
  byMonth: Map<string, Transaction[]>
): Transaction[] => {
  const months = Array.from(byMonth.keys()).sort((a, b) => b.localeCompare(a))
  const out: Transaction[] = []
  for (const month of months) {
    const array = byMonth.get(month) || []
    array.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    out.push(...array)
  }
  return out
}

const mapOperationToAction = (
  operation: string,
  hasPrevious: boolean
): Action | undefined => {
  if (!operation) return undefined
  const op = operation.toLowerCase()
  const direct: Record<string, Action> = {
    delete: 'delete',
    unpublish: 'unpublish',
    publish: 'publish',
    discarddraft: 'discard',
    discard: 'discard',
    duplicate: 'duplicate',
    copy: 'duplicate',
    patch: 'update',
    update: 'update',
    createorreplace: 'update',
  }
  const foundKey = Object.keys(direct).find((k) => op.includes(k))
  if (foundKey) return direct[foundKey]
  if (op.includes('create')) {
    return hasPrevious ? 'update' : 'create'
  }
  return undefined
}

const mutationIndicatesCreate = (m: Record<string, unknown>): boolean => {
  const keys = ['create', 'createIfNotExists', 'createOrReplace'] as const
  return keys.some((k) => k in m && m[k] !== undefined)
}

const mapMutationsToAction = (
  mutations: TransactionNdjsonRow['mutations'],
  hasPrevious: boolean
): Action | undefined => {
  if (!mutations?.length) return undefined
  for (const m of mutations) {
    const rec = m as Record<string, unknown>
    if ('delete' in rec && rec.delete !== undefined) return 'delete'
    if ('patch' in rec && rec.patch !== undefined) return 'update'
    if (mutationIndicatesCreate(rec)) return hasPrevious ? 'update' : 'create'
  }
  return undefined
}

const inferActionFromOpOrMutations = (
  rawOperation: string,
  mutations: TransactionNdjsonRow['mutations'],
  hasPrevious: boolean
): Action | undefined =>
  !rawOperation && !mutations?.length
    ? undefined
    : mapOperationToAction(rawOperation, hasPrevious) ||
      mapMutationsToAction(mutations, hasPrevious)

const inferAction = (entry: TransactionNdjsonRow): Action => {
  const hasPrevious = Boolean(entry.prevRev || entry.beforeRev)
  return (
    inferActionFromOpOrMutations(
      entry.operation || entry.op || '',
      entry.mutations || [],
      hasPrevious
    ) || 'default'
  )
}

const toActor = (val: unknown): Actor | undefined => {
  if (!val) return undefined
  if (typeof val === 'string') return { id: val, type: 'user' as const }
  if (typeof val !== 'object' || val === null || Array.isArray(val))
    return undefined
  const obj = val as Record<string, unknown>
  const id =
    (obj.id as string) ||
    (obj._id as string) ||
    (obj.userId as string) ||
    (obj.identity as string)
  if (!id) return undefined
  const name =
    (obj.name as string) ||
    (obj.displayName as string) ||
    (obj.username as string) ||
    (obj.email as string)
  const email = obj.email as string
  const type = (obj.type as Actor['type']) || 'user'
  return {
    id,
    name: name || undefined,
    email: email || undefined,
    type,
  }
}

const deriveTimestamp = (row: TransactionNdjsonRow): string => {
  const raw = row.timestamp ?? row.time ?? row._ts ?? row._updatedAt
  if (!raw) return ''
  if (typeof raw === 'number') {
    const ms = raw > 1e12 ? raw : raw * 1000
    return new Date(ms).toISOString()
  }
  if (typeof raw === 'string') {
    if (/^\d{10,13}$/.test(raw)) {
      const n = parseInt(raw, 10)
      const ms = raw.length === 13 ? n : n * 1000
      return new Date(ms).toISOString()
    }
    const d = new Date(raw)
    if (!isNaN(d.getTime())) return d.toISOString()
    return raw
  }
  return ''
}

const deriveDocumentId = (row: TransactionNdjsonRow): string => {
  return (
    row.documentId ||
    row.documentIds?.[0] ||
    ((row as Record<string, unknown>).docId as string) ||
    'unknown'
  )
}

const mapNdjsonRowToTransaction = (
  row: TransactionNdjsonRow,
  overrideDocumentId?: string
): Transaction => {
  const ts = deriveTimestamp(row)
  const actor = toActor(
    row.author ||
      row.user ||
      row.actor ||
      row.identity ||
      row.userId ||
      row.authorId
  )
  const documentType = row.documentType || row.type
  const documentId = overrideDocumentId || deriveDocumentId(row)
  const fallbackId = `${documentId}:${ts}`
  const id = row.id || row.txId || fallbackId
  const timestamp = ts || new Date(0).toISOString()
  return {
    id,
    timestamp,
    action: inferAction(row),
    documentId,
    documentType: documentType || undefined,
    revBefore: row.prevRev || row.beforeRev,
    revAfter: row.nextRev || row.afterRev || row.rev,
    actor: actor || undefined,
    message: row.message || row.comment || undefined,
  } as const
}

const normalizeCreateUpdate = (
  transactions: readonly Transaction[]
): readonly Transaction[] => {
  if (!transactions.length) return transactions
  const idToTransaction = new Map(transactions.map((t) => [t.id, t]))
  const grouped = new Map<string, readonly Transaction[]>()
  for (const transaction of transactions) {
    const bucket = grouped.get(transaction.documentId) || []
    grouped.set(transaction.documentId, [...bucket, transaction])
  }
  grouped.forEach((list) => {
    const sorted = [...list].sort((a, b) =>
      a.timestamp.localeCompare(b.timestamp)
    )
    let seen = false
    let lastAction: Action | undefined
    for (const transaction of sorted) {
      if (transaction.action === 'create' && seen && lastAction !== 'delete') {
        idToTransaction.set(transaction.id, {
          ...transaction,
          action: 'update' as const,
        })
      }
      seen = true
      lastAction = transaction.action
    }
  })
  return Array.from(idToTransaction.values())
}

const fetchNdjson = async (
  client: SanityClient,
  dataset: string,
  path: string,
  signal?: AbortSignal
): Promise<readonly TransactionNdjsonRow[]> => {
  try {
    const text = await client.request<string>({
      uri: `/data/history/${dataset}/${path}`,
      method: 'GET',
      tag: 'audit.transactions',
      signal,
    })
    const lines = (text || '').split('\n').filter(Boolean)
    const out: TransactionNdjsonRow[] = []
    for (const raw of lines) {
      try {
        const parsed: unknown = JSON.parse(raw)
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          out.push(parsed as TransactionNdjsonRow)
        }
      } catch (error) {
        console.warn(
          `Failed to parse NDJSON line: ${error instanceof Error ? error.message : String(error)}`
        )
      }
    }
    return out
  } catch (error) {
    console.error('Failed to fetch NDJSON from %s:', path, {
      level: 'error',
      error: error instanceof Error ? error.message : String(error),
      dataset,
    })
    return []
  }
}

const mapRowsNormalized = (
  rows: readonly TransactionNdjsonRow[],
  overrideDocumentId?: string
): readonly Transaction[] =>
  normalizeCreateUpdate(
    rows.map((row) => mapNdjsonRowToTransaction(row, overrideDocumentId))
  )

const filterByActions = (
  t: Transaction,
  actions?: readonly Action[]
): boolean =>
  Array.isArray(actions) && actions.length > 0
    ? actions.includes(t.action)
    : true

interface NormalizedListOptions {
  limit?: number
  offset?: number
  actions?: Action[]
}
const toListOptions = (val: unknown): NormalizedListOptions => {
  if (!val || typeof val !== 'object') return {}
  const obj = val as Record<string, unknown>
  const limit = typeof obj.limit === 'number' ? obj.limit : undefined
  const offset = typeof obj.offset === 'number' ? obj.offset : undefined
  const actions = Array.isArray(obj.actions)
    ? obj.actions.filter(
        (action): action is Action => typeof action === 'string'
      )
    : undefined
  return { limit, offset, actions }
}

export const listTransactionsForDocument = async (
  client: SanityClient,
  id: string,
  opts?: ListOptions,
  signal?: AbortSignal
): Promise<readonly Transaction[]> => {
  if (!id) return []
  const { limit, offset, actions } = toListOptions(opts)
  const dataset = getDataset(client)
  const queryParams = buildTransactionParams(limit, offset)
  const rows = await fetchNdjson(
    client,
    dataset,
    `transactions/${encodeURIComponent(id)}?${queryParams.toString()}`,
    signal
  )
  const mapped = mapRowsNormalized(rows, id)
  return actions?.length
    ? mapped.filter((t) => filterByActions(t, actions))
    : mapped
}

export const listRecentTransactions = async (
  client: SanityClient,
  opts?: ListOptions
): Promise<readonly Transaction[]> => {
  const { actions, limit } = toListOptions(opts)
  const normalizedLimit =
    typeof limit === 'number' && limit > 0 ? limit : Number.POSITIVE_INFINITY
  const filterTransactions = (
    list: readonly Transaction[]
  ): readonly Transaction[] => list.filter((t) => filterByActions(t, actions))

  const fallbackAggregate = async (): Promise<readonly Transaction[]> => {
    const query = `*[_type != null]| order(_updatedAt desc){_id}`
    const params: Record<string, unknown> = {}
    interface DocStub {
      _id: string
    }
    const docs = (await client.fetch<DocStub[]>(query, params)) || []
    const ids = docs.map((d) => d._id).filter((x): x is string => Boolean(x))
    const userDocIds = filterUserDocIds(ids)

    let collected: readonly Transaction[] = []
    for (const id of userDocIds) {
      if (collected.length >= normalizedLimit) break
      try {
        const remaining =
          normalizedLimit === Number.POSITIVE_INFINITY
            ? undefined
            : Math.max(0, normalizedLimit - collected.length)
        const docLimit =
          typeof remaining === 'number' && remaining > 0 ? remaining : undefined
        const rows = await listAllTransactionsForDocument(
          client,
          id,
          docLimit ? { limit: docLimit } : undefined
        )
        const filteredRows = filterTransactions(rows)
        if (filteredRows.length) {
          collected = [...collected, ...filteredRows]
        }
      } catch {
        //ignore
      }
    }

    const limited =
      normalizedLimit === Number.POSITIVE_INFINITY
        ? collected
        : collected.slice(0, normalizedLimit)
    const byMonth = groupByMonth(limited)
    return sortMonthlyTransactions(byMonth)
  }

  return await fallbackAggregate()
}

export interface TransactionPage {
  readonly items: readonly Transaction[]
  readonly nextOffset?: number | null
  readonly usedFallback?: boolean
}

export const listTransactionsDatasetPage = async (
  client: SanityClient,
  options: {
    limit?: number
    offset?: number
    filters?: Omit<ListOptions, 'limit' | 'offset'>
  } = {}
): Promise<TransactionPage> => {
  const filters = options.filters || {}
  const limit =
    typeof options.limit === 'number' && options.limit > 0
      ? options.limit
      : undefined
  try {
    const items = await listAllTransactions(client, {
      ...filters,
      limit,
    })
    return {
      items,
      nextOffset: limit && items.length === limit ? limit : null,
      usedFallback: false,
    }
  } catch (error) {
    console.warn(
      `Primary dataset transaction fetch failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
    try {
      const fallback = await listRecentTransactions(client, {
        ...filters,
        limit,
      })
      return { items: fallback, nextOffset: null, usedFallback: true }
    } catch (fallbackError) {
      console.warn(
        `Fallback for dataset page failed: ${
          fallbackError instanceof Error
            ? fallbackError.message
            : String(fallbackError)
        }`
      )
      return { items: [], nextOffset: null, usedFallback: true }
    }
  }
}

const paginateNdjson = async (
  client: SanityClient,
  dataset: string,
  limit: number,
  offset: number,
  maxPages: number,
  processPage: (transactions: readonly Transaction[]) => boolean | void,
  signal?: AbortSignal
): Promise<void> => {
  for (let page = 0; page < maxPages; page++) {
    if (signal?.aborted) break
    const queryParams = buildTransactionParams(limit, offset)
    const rows = await fetchNdjson(
      client,
      dataset,
      `transactions?${queryParams.toString()}`,
      signal
    )
    if (signal?.aborted) break
    if (!rows.length) break
    const mapped = mapRowsNormalized(rows)
    const shouldContinue = processPage(mapped)
    if (shouldContinue === false) break
    if (rows.length < limit) break
    offset += limit
  }
}

export const listAllTransactions = async (
  client: SanityClient,
  opts?: ListOptions,
  signal?: AbortSignal
): Promise<readonly Transaction[]> => {
  const dataset = getDataset(client)
  const { actions, limit } = toListOptions(opts)
  const maxTotal = typeof limit === 'number' && limit > 0 ? limit : 5000
  const filterTransactions = (
    list: readonly Transaction[]
  ): readonly Transaction[] =>
    list
      .filter((t) => t.documentId !== 'unknown')
      .filter((t) => filterByActions(t, actions))

  let collected: readonly Transaction[] = []
  const batchLimit = Math.max(1, Math.min(200, maxTotal))
  const maxPages = 250
  const offset = 0

  await paginateNdjson(
    client,
    dataset,
    batchLimit,
    offset,
    maxPages,
    (mapped) => {
      const filtered = filterTransactions(mapped)
      if (filtered.length) collected = [...collected, ...filtered]
      if (collected.length >= maxTotal) return false
      return true
    },
    signal
  )

  const sorted = sortDescByTimestamp(
    maxTotal ? collected.slice(0, maxTotal) : collected
  )
  if (sorted.length > 0) return sorted

  try {
    const recent = await listRecentTransactions(client, {
      ...opts,
      limit: Math.min(800, maxTotal),
    })
    return recent.slice(0, maxTotal)
  } catch (error) {
    console.warn(
      `Fallback recent transactions failed: ${error instanceof Error ? error.message : String(error)}`
    )
    return sorted
  }
}

export const listAllTransactionsForDocument = async (
  client: SanityClient,
  id: string,
  opts?: ListOptions,
  signal?: AbortSignal
): Promise<readonly Transaction[]> => {
  if (!id) return []
  const { actions, limit } = toListOptions(opts)
  const maxTotal = typeof limit === 'number' && limit > 0 ? limit : undefined
  const basePerPage = maxTotal ? Math.max(1, Math.min(100, maxTotal)) : 100
  let offset = 0
  let out: readonly Transaction[] = []
  while (true) {
    const remaining = maxTotal ? Math.max(0, maxTotal - out.length) : undefined
    const perPage = remaining ? Math.min(basePerPage, remaining) : basePerPage
    if (perPage === 0) break
    let rows: readonly Transaction[] = []
    try {
      rows = await listTransactionsForDocument(
        client,
        id,
        {
          limit: perPage,
          offset,
          actions,
        },
        signal
      )
    } catch (error) {
      console.warn(
        `Error fetching transactions for document ${id}: ${error instanceof Error ? error.message : String(error)}`
      )
      break
    }
    if (!rows.length) break
    out = [...out, ...rows]
    if (maxTotal && out.length >= maxTotal) {
      out = out.slice(0, maxTotal)
      break
    }
    if (rows.length < perPage) break
    offset += perPage
  }
  return out
}
