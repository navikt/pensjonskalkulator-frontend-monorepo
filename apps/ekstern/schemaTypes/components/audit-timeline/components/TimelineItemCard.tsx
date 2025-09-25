import { ChevronDownIcon, CopyIcon, LaunchIcon } from '@sanity/icons'
import {
  Badge,
  Button,
  Card,
  Code,
  Flex,
  Stack,
  Text,
  Tooltip,
} from '@sanity/ui'
import React, { useCallback, useMemo, useState } from 'react'

import type { Transaction } from '../types'
import { actionTone, formatDateTime, formatTime } from '../utils'
import { actionLabel } from '../utils/index'
import { EventDetails } from './EventDetails'

export interface TimelineItemCardProps {
  transaction: Transaction
  documentTitle?: string
  documentType?: string
  actorName?: string
  hideActions?: boolean
}

const getAccent = (tone: string): string => {
  switch (tone) {
    case 'positive':
      return '#2E7D32'
    case 'caution':
      return '#ED6C02'
    case 'critical':
      return '#D32F2F'
    case 'primary':
      return '#1976D2'
    default:
      return '#9E9E9E'
  }
}

export const TimelineItemCard: React.FC<TimelineItemCardProps> = ({
  transaction,
  documentTitle,
  documentType,
  actorName,
  hideActions,
}) => {
  const [open, setOpen] = useState(false)

  const handleToggle = useCallback(() => {
    const next = !open
    setOpen(next)
  }, [open])

  const tone = actionTone(transaction.action)
  const accent = getAccent(tone)

  const href = useMemo(() => {
    if (!documentType || transaction.documentId === 'unknown') return undefined
    const baseId = transaction.documentId.replace(/^drafts\./, '')
    const { pathname } = window.location
    const seg1 = pathname.split('/')[1] || ''
    const base = seg1 ? `/${seg1}` : ''
    return `${base}/structure/${encodeURIComponent(documentType)};${encodeURIComponent(baseId)}`
  }, [documentType, transaction.documentId])

  const copyId = useCallback(() => {
    navigator.clipboard?.writeText(transaction.documentId)
  }, [transaction.documentId])

  const actionText = actionLabel(transaction.action)

  const cardInteractive = !hideActions
  const themeBg = 'var(--card-bg-color, #1c1c1c)'
  const baseBg = open ? `${accent}1A` : themeBg
  const hoverBg = open ? `${accent}26` : `${accent}14`

  const renderActions = () => (
    <Flex gap={1} style={{ marginLeft: 'auto' }} align="center">
      <Tooltip
        content={<Text size={1}>Copy document ID</Text>}
        portal
        placement="top"
      >
        <Button
          aria-label="Copy document ID"
          mode="bleed"
          icon={CopyIcon}
          size={1}
          onClick={(e) => {
            e.stopPropagation()
            copyId()
          }}
        />
      </Tooltip>
      {href && (
        <Tooltip
          content={<Text size={1}>Open document</Text>}
          portal
          placement="top"
        >
          <Button
            as="a"
            href={href}
            mode="bleed"
            aria-label="Open document"
            icon={LaunchIcon}
            size={1}
            onClick={(e) => e.stopPropagation()}
          />
        </Tooltip>
      )}
      <Tooltip
        content={
          <Text size={1}>{open ? 'Collapse details' : 'Expand details'}</Text>
        }
        portal
        placement="top"
      >
        <Button
          aria-label={open ? 'Hide details' : 'Show details'}
          mode="bleed"
          tone="primary"
          size={1}
          icon={ChevronDownIcon}
          onClick={(e) => {
            e.stopPropagation()
            handleToggle()
          }}
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 120ms ease',
          }}
          aria-expanded={open}
        />
      </Tooltip>
    </Flex>
  )

  const renderHeader = () => (
    <Flex gap={3} align="center" wrap="nowrap" style={{ width: '100%' }}>
      <span
        aria-hidden
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: accent,
          boxShadow: `0 0 0 2px var(--card-bg-color, #1c1c1c), 0 0 0 3px ${accent}55`,
          flexShrink: 0,
        }}
      />
      <Stack space={2} flex={1} style={{ minWidth: 0 }}>
        <Flex align="center" gap={2} wrap="wrap" style={{ minWidth: 0 }}>
          <Text
            size={1}
            muted
            title={new Date(transaction.timestamp).toISOString()}
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {hideActions
              ? formatDateTime(transaction.timestamp)
              : formatTime(transaction.timestamp)}
          </Text>
          <Badge tone={tone} fontSize={1} padding={2}>
            {actionText}
          </Badge>
          <Text size={1} style={{ fontWeight: 500, minWidth: 0 }}>
            {documentTitle ? (
              <>
                <span style={{ whiteSpace: 'nowrap' }}>{documentTitle}</span>
                {documentType && (
                  <Text size={1} muted>
                    {' '}
                    ({documentType})
                  </Text>
                )}
              </>
            ) : (
              <Code size={1}>{transaction.documentId}</Code>
            )}
          </Text>
          {actorName && (
            <Text size={1} muted>
              · {actorName}
              {transaction.actor?.type && ` (${transaction.actor.type})`}
            </Text>
          )}
          {transaction.message && (
            <Text size={1} muted style={{ fontStyle: 'italic' }}>
              · {transaction.message}
            </Text>
          )}
        </Flex>
        {open && (
          <Flex gap={2} wrap="wrap" style={{ opacity: 0.85 }}>
            {!documentTitle && documentType && (
              <Text size={1} muted>
                Type: {documentType}
              </Text>
            )}
            <Text size={1} muted>
              ID: <Code size={1}>{transaction.documentId}</Code>
            </Text>
            {transaction.actor?.id && (
              <Text size={1} muted>
                Actor ID: <Code size={1}>{transaction.actor.id}</Code>
              </Text>
            )}
          </Flex>
        )}
      </Stack>
      {!hideActions && renderActions()}
    </Flex>
  )

  return (
    <Card
      padding={3}
      radius={3}
      shadow={open ? 2 : 1}
      tone="transparent"
      onClick={cardInteractive ? undefined : handleToggle}
      aria-expanded={open}
      style={{
        borderLeft: `4px solid ${accent}`,
        background: baseBg,
        transition: 'background 140ms ease, box-shadow 180ms ease',
        position: 'relative',
        cursor: cardInteractive ? 'default' : 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = open ? baseBg : hoverBg
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = baseBg
      }}
    >
      <Stack space={open ? 3 : 2}>
        {renderHeader()}
        {open && (
          <div
            style={{
              borderTop: `1px solid ${accent}33`,
              paddingTop: 8,
              animation: 'fadeIn 160ms ease',
            }}
          >
            <EventDetails
              transaction={transaction}
              documentTitle={documentTitle}
              documentType={documentType}
              hideRaw={hideActions}
            />
          </div>
        )}
      </Stack>
    </Card>
  )
}

export default TimelineItemCard
