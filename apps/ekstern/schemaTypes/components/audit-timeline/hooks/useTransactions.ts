import type { SanityClient } from '@sanity/client'
import { useEffect, useState } from 'react'

import {
  listTransactionsDatasetPage,
  listTransactionsForDocument,
} from '../api/history'
import type { Action, Transaction } from '../types'
import { getAttemptIds, sortDescByTimestamp } from '../utils'

interface FilterParams {
  readonly actions: readonly Action[]
}

interface UseTransactionsResult {
  items: readonly Transaction[]
  loading: boolean
  usedFallback: boolean
}

const collectDocumentTransactions = async (
  client: SanityClient,
  id: string,
  params: FilterParams,
  signal: AbortSignal,
  limit: number
): Promise<readonly Transaction[]> => {
  if (!id.trim()) return []

  if (limit > 0) {
    const first = await listTransactionsForDocument(
      client,
      id,
      { limit, offset: 0, actions: [...params.actions] },
      signal
    )
    if (!first.length)
      throw new Error(`No transactions found for document ${id}`)
    return sortDescByTimestamp(first)
  }

  const mod = await import('../api/history')
  const all = await mod.listAllTransactionsForDocument(
    client,
    id,
    {
      actions: [...params.actions],
    },
    signal
  )
  if (!all.length) throw new Error(`No transactions found for document ${id}`)
  return sortDescByTimestamp(all)
}

interface UseTransactionsOptions {
  limit?: number
  signal?: AbortSignal
}

export const useTransactions = (
  client: SanityClient,
  documentId: string,
  params: FilterParams,
  refreshKey: number,
  options?: UseTransactionsOptions
): UseTransactionsResult => {
  const [items, setItems] = useState<readonly Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [usedFallback, setUsedFallback] = useState(false)

  const limit = options?.limit
  const externalSignal = options?.signal

  useEffect(() => {
    if (!client) return

    const abortController = new AbortController()
    const { signal: abortSignal } = abortController

    setLoading(true)
    setItems([])
    setUsedFallback(false)

    let externalAbortHandler: (() => void) | undefined
    if (externalSignal) {
      if (externalSignal.aborted) {
        abortController.abort()
      } else {
        externalAbortHandler = () => abortController.abort()
        externalSignal.addEventListener('abort', externalAbortHandler)
      }
    }

    const fetchDatasetPage = async () => {
      const page = await listTransactionsDatasetPage(client, {
        filters: {
          actions: [...params.actions],
        },
        offset: 0,
        ...(typeof limit === 'number' && limit > 0 ? { limit } : {}),
      })
      return { items: page.items, usedFallback: page.usedFallback || false }
    }

    const fetchForDocumentIds = async (
      ids: readonly string[],
      sig: AbortSignal
    ) => {
      let fallbackUsed = false
      for (const id of ids) {
        try {
          const rows = await collectDocumentTransactions(
            client,
            id,
            params,
            sig,
            limit as number
          )
          return { items: rows, usedFallback: fallbackUsed }
        } catch (error) {
          console.warn(
            `Failed to fetch for ${id}: ${error instanceof Error ? error.message : String(error)}`
          )
          fallbackUsed = true
        }
      }
      throw new Error(`No transactions found for document ${documentId}`)
    }

    const load = async () => {
      try {
        let allItems: readonly Transaction[] = []
        let fallbackUsed = false

        if (documentId.trim()) {
          const attemptIds = getAttemptIds(documentId)
          const res = await fetchForDocumentIds(attemptIds, abortSignal)
          allItems = [...allItems, ...res.items]
          fallbackUsed = res.usedFallback
        } else {
          const res = await fetchDatasetPage()
          allItems = res.items
          fallbackUsed = res.usedFallback
        }

        if (!abortSignal.aborted) {
          const sorted = sortDescByTimestamp(allItems)
          setItems(sorted)
          setUsedFallback(fallbackUsed)
        }
      } catch (error) {
        if (!abortSignal.aborted) {
          console.error('Failed to load transactions:', {
            error: error instanceof Error ? error.message : String(error),
            documentId,
            params,
          })
          setItems([])
          setUsedFallback(true)
        }
      } finally {
        if (!abortSignal.aborted) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      abortController.abort()
      if (externalSignal && externalAbortHandler) {
        externalSignal.removeEventListener('abort', externalAbortHandler)
      }
    }
  }, [client, documentId, params.actions, refreshKey, externalSignal, limit])

  return { items, loading, usedFallback }
}
