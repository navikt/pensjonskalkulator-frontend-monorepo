import type { SanityClient } from '@sanity/client'
import { TagIcon } from '@sanity/icons'
import { Box, Button, Card, Flex, Stack, Text } from '@sanity/ui'
import React, { useEffect, useState } from 'react'
import { useClient } from 'sanity'
import { useRouter } from 'sanity/router'

import { listTransactionsForDocument } from './api/history'
import { TimelineItemCard } from './components/TimelineItemCard'
import { useActorNames, useDocumentMeta } from './hooks/dataHooks'
import type { TimelineItem } from './types'
import { getBasePath } from './utils'

export interface DocumentPanelProps {
  documentId?: string
  document?: { readonly _id?: string } | null
}

export const DocumentPanel: React.FC<DocumentPanelProps> = (props) => {
  const API_VERSION = '2023-10-01'
  const client = useClient({
    apiVersion: API_VERSION,
  }) as unknown as SanityClient
  const router = useRouter()
  const documentId: string | undefined =
    props?.documentId || props?.document?._id

  const [rows, setRows] = useState<readonly TimelineItem[]>([])
  const resolvedNames = useActorNames(client, rows)
  const resolvedDocumentMeta = useDocumentMeta(client, rows)

  useEffect(() => {
    if (!documentId) return
    const loadRows = async () => {
      try {
        const items = await listTransactionsForDocument(client, documentId, {
          limit: 100,
        })
        setRows(items)
      } catch (error) {
        console.warn(
          `Failed to load document transactions: ${error instanceof Error ? error.message : String(error)}`
        )
        setRows([])
      }
    }
    loadRows()
  }, [client, documentId])

  if (!documentId)
    return (
      <Box padding={3}>
        <Text muted>Document id not available.</Text>
      </Box>
    )

  const openInAuditTool = () => {
    if (!documentId) return
    try {
      router.navigate({
        pathname: 'audit',
        search: `documentId=${encodeURIComponent(documentId)}`,
      })
      return
    } catch {
      console.log('Falling back to window.location')
    }
    try {
      const origin = window.location.origin
      const base = getBasePath(window.location.pathname)
      window.location.assign(
        `${origin}${base}/audit?documentId=${encodeURIComponent(documentId)}`
      )
    } catch {
      window.location.assign(
        `/audit?documentId=${encodeURIComponent(documentId)}`
      )
    }
  }

  return (
    <Box padding={3} style={{ height: '100%', overflow: 'auto' }}>
      <Stack space={3}>
        <Flex align="center" gap={2} justify="space-between">
          <Flex align="center" gap={2}>
            <TagIcon />
            <Text size={2} weight="semibold">
              Audit
            </Text>
          </Flex>
          <Button onClick={openInAuditTool} text="Open in Audit tool" />
        </Flex>
        {!rows.length && (
          <Card padding={3} tone="transparent" radius={2}>
            <Text muted>No changes yet.</Text>
          </Card>
        )}
        <Stack space={2}>
          {rows.map((r) => {
            const documentTitle = resolvedDocumentMeta[r.documentId]?.title
            const documentType =
              r.documentType || resolvedDocumentMeta[r.documentId]?.type
            const actorName = r.actor?.id
              ? resolvedNames[r.actor.id] || r.actor.name || 'Unknown'
              : undefined
            return (
              <TimelineItemCard
                key={r.id}
                transaction={r}
                documentTitle={documentTitle}
                documentType={documentType}
                actorName={actorName}
                hideActions
              />
            )
          })}
        </Stack>
      </Stack>
    </Box>
  )
}
