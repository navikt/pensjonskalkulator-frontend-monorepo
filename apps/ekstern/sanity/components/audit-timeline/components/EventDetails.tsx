import {
  Badge,
  Button,
  Card,
  Code,
  Flex,
  Inline,
  Label,
  Stack,
  Text,
} from '@sanity/ui'
import React from 'react'

import type { Transaction } from '../types'
import { eventDetails } from '../utils/event'
import { actionLabel, actionTone } from '../utils/index'

export interface EventDetailsProps {
  transaction: Transaction
  documentTitle?: string
  documentType?: string
  hideRaw?: boolean
}

export const EventDetails: React.FC<EventDetailsProps> = ({
  transaction,
  documentTitle,
  documentType,
  hideRaw,
}) => {
  const revBefore = transaction.revBefore
  const revAfter = transaction.revAfter
  const [showRaw, setShowRaw] = React.useState(false)

  return (
    <Card padding={3} radius={2} tone="transparent" style={{ marginTop: 8 }}>
      <Stack space={3}>
        <Flex align="center" gap={2} wrap="wrap">
          <Text size={1} weight="semibold">
            Details
          </Text>
          <Badge tone={actionTone(transaction.action)}>
            {actionLabel(transaction.action)}
          </Badge>
          <Text size={1} muted>
            {new Date(transaction.timestamp).toLocaleString()}
          </Text>
        </Flex>

        <Stack space={1}>
          {(eventDetails(transaction) || []).map((line, i) => (
            <Text key={i} size={1}>
              {line}
            </Text>
          ))}
          <Inline space={3}>
            <Text size={1}>
              <span>ID:</span> <Code size={1}>{transaction.documentId}</Code>
            </Text>
            {documentType ? <Text size={1}>Type: {documentType}</Text> : null}
            {documentTitle ? (
              <Text size={1}>Title: {documentTitle}</Text>
            ) : null}
            {revBefore || revAfter ? (
              <Text size={1}>
                <span>Rev:</span> <Code size={1}>{revBefore || '—'}</Code> →{' '}
                <Code size={1}>{revAfter || '—'}</Code>
              </Text>
            ) : null}
          </Inline>
        </Stack>

        {!hideRaw && (
          <Inline space={2} style={{ flexWrap: 'wrap' }}>
            <Button
              mode="bleed"
              size={1}
              onClick={() => setShowRaw((v) => !v)}
              text={showRaw ? 'Hide raw' : 'Show raw'}
            />
          </Inline>
        )}

        {!hideRaw && showRaw ? (
          <Stack space={1}>
            <Label size={0}>Raw</Label>
            <Card padding={2} tone="transparent" style={{ overflowX: 'auto' }}>
              <Code size={1}>{JSON.stringify(transaction, null, 2)}</Code>
            </Card>
          </Stack>
        ) : null}
      </Stack>
    </Card>
  )
}

export default EventDetails
