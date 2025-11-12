import { Card, Stack, Text } from '@sanity/ui'
import React from 'react'

import type { Transaction } from '../types'
import { formatDayTitle } from '../utils'
import { TimelineItemCard } from './TimelineItemCard'

export interface TimelineGroupProps {
  dayKey: string
  items: readonly Transaction[]
  resolvedNames: Record<string, string>
  resolvedDocumentMeta: Record<string, { title?: string; type?: string }>
}

export const TimelineGroup: React.FC<TimelineGroupProps> = ({
  dayKey,
  items,
  resolvedDocumentMeta,
  resolvedNames,
}) => {
  return (
    <Stack key={dayKey} space={3}>
      <Card padding={2} radius={2} tone="transparent">
        <Text size={1} muted>
          {formatDayTitle(dayKey)}
        </Text>
      </Card>
      <Stack space={2}>
        {items.map((transaction) => {
          const meta = resolvedDocumentMeta[transaction.documentId] || {}
          const actorId = transaction.actor?.id
          const actorName = actorId
            ? resolvedNames[actorId] || transaction.actor?.name
            : undefined
          return (
            <TimelineItemCard
              key={transaction.id}
              transaction={transaction}
              documentTitle={meta.title}
              documentType={transaction.documentType || meta.type}
              actorName={actorName}
            />
          )
        })}
      </Stack>
    </Stack>
  )
}
