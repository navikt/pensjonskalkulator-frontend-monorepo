import type { SanityClient } from '@sanity/client'
import { useEffect, useState } from 'react'

import type { Transaction } from '../types'

export const useActorNames = (
  client: SanityClient,
  items: readonly Transaction[]
): Record<string, string> => {
  const [actorNames, setActorNames] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchActorNames = async () => {
      const ids = new Set<string>()
      for (const item of items) {
        const id = item.actor?.id
        if (id && !item.actor?.name && !actorNames[id]) {
          ids.add(id)
        }
      }
      const idsArray = Array.from(ids)
      if (idsArray.length === 0) return

      const entries: Array<readonly [string, string]> = []
      const results = await Promise.allSettled(
        idsArray.map(async (id) => {
          const user = await client.request<{
            displayName?: string
            name?: string
          } | null>({
            uri: `/users/${encodeURIComponent(id)}`,
            method: 'GET',
            tag: 'audit.user',
          })
          const displayName = user?.displayName || user?.name
          return displayName ? ([id, displayName] as const) : null
        })
      )

      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          entries.push(result.value)
        }
      })
      setActorNames((prev) => ({ ...prev, ...Object.fromEntries(entries) }))
    }

    fetchActorNames()
  }, [client, items, actorNames])

  return actorNames
}

interface DocumentMeta {
  title?: string
  type?: string
}

export const useDocumentMeta = (
  client: SanityClient,
  items: readonly Transaction[]
): Record<string, DocumentMeta> => {
  const [documentMeta, setDocumentMeta] = useState<
    Record<string, DocumentMeta>
  >({})

  useEffect(() => {
    const fetchDocumentMeta = async () => {
      const ids = new Set<string>()
      for (const item of items) {
        const id = item.documentId
        if (!id || id === 'unknown') continue
        if (
          !documentMeta[id] ||
          (!documentMeta[id].type && !item.documentType)
        ) {
          ids.add(id)
        }
      }
      const idsArray = Array.from(ids)
      if (idsArray.length === 0) return

      const query = `*[_id in $ids]{_id,_type,"title": coalesce(title,name,tittel,overskrift,heading,headline,navn,title_no,title_nb,title_en,label)}`
      try {
        const result = await client.fetch<
          Array<{ _id: string; _type?: string; title?: string }>
        >(query, { ids: idsArray })
        const entries = result.map(
          (document): readonly [string, DocumentMeta] => [
            document._id,
            {
              title: document.title,
              type: document._type,
            },
          ]
        )
        setDocumentMeta((prev) => ({ ...prev, ...Object.fromEntries(entries) }))
      } catch {
        // Silently fail - document meta is not critical
      }
    }

    fetchDocumentMeta()
  }, [client, items, documentMeta])

  return documentMeta
}
