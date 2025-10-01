import type { SanityClient } from '@sanity/client'
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Inline,
  Spinner,
  Stack,
  Text,
} from '@sanity/ui'
import React, { useMemo, useState } from 'react'
import { useClient } from 'sanity'

import { FilterBar } from './components/FilterBar'
import { TimelineGroup } from './components/TimelineGroup'
import { ACTIONS, ACTION_CONFIG, INITIAL_VISIBLE_LIMIT } from './constants'
import { useActorNames, useDocumentMeta } from './hooks/dataHooks'
import { useTransactions } from './hooks/useTransactions'
import type { Action, Transaction } from './types'
import { groupByDay } from './utils'

interface FilterParams {
  readonly actions: readonly Action[]
}

const getDocumentIdFromUrl = (): string => {
  const searchParams = new URLSearchParams(window.location.search)
  return searchParams.get('documentId') || ''
}

const calculateActionCounts = (
  items: readonly Transaction[]
): Record<Action, number> => {
  const acc: Record<Action, number> = {
    create: 0,
    update: 0,
    publish: 0,
    unpublish: 0,
    delete: 0,
    duplicate: 0,
    discard: 0,
    default: 0,
  }
  for (const item of items) {
    acc[item.action] = (acc[item.action] || 0) + 1
  }
  return acc
}

export const AuditTool: React.FC = () => {
  const client = useClient({
    apiVersion: '2023-10-01',
  }) as unknown as SanityClient

  const [documentId, setDocumentId] = useState(getDocumentIdFromUrl)
  const [tick, setTick] = useState(0)
  const [showAll, setShowAll] = useState(false)
  const [actions, setActions] = useState<readonly Action[]>([])

  const filterParams = useMemo<FilterParams>(() => ({ actions }), [actions])

  const fetchLimit = showAll ? undefined : INITIAL_VISIBLE_LIMIT

  const { items, loading } = useTransactions(
    client,
    documentId,
    filterParams,
    tick,
    { limit: fetchLimit }
  )

  const resolvedNames = useActorNames(client, items)
  const resolvedDocumentMeta = useDocumentMeta(client, items)

  const groups = useMemo(() => {
    const dayGroups = groupByDay(items)
    return Array.from(dayGroups.entries()).sort((a, b) =>
      b[0].localeCompare(a[0])
    )
  }, [items])

  const visibleCount = useMemo(
    () => groups.reduce((sum, [, list]) => sum + list.length, 0),
    [groups]
  )

  const actionCounts = useMemo(() => calculateActionCounts(items), [items])

  const hasMore =
    !showAll &&
    !loading &&
    fetchLimit !== undefined &&
    items.length === fetchLimit

  React.useEffect(() => {
    setShowAll(false)
  }, [documentId, actions, tick])

  return (
    <Box padding={4}>
      <Stack space={4}>
        <Stack space={2}>
          <Card
            padding={3}
            tone="transparent"
            radius={2}
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 1,
              background: 'var(--card-bg-color)',
              borderBottom: '1px solid var(--card-border-color)',
            }}
          >
            <Stack space={3}>
              <Flex align="center" gap={2} wrap="wrap">
                <Text size={2} weight="semibold">
                  Audit timeline
                </Text>
                {!!visibleCount && (
                  <Text muted size={1}>
                    {showAll
                      ? `Showing ${visibleCount} change${visibleCount === 1 ? '' : 's'}`
                      : `Showing first ${visibleCount} change${visibleCount === 1 ? '' : 's'}`}
                  </Text>
                )}
              </Flex>
              <Inline space={2} style={{ flexWrap: 'wrap' }}>
                {ACTIONS.map((action) => {
                  const count = actionCounts[action]
                  if (!count) return null

                  return (
                    <Badge key={action} tone={ACTION_CONFIG[action].tone}>
                      {action}: {count}
                    </Badge>
                  )
                })}
              </Inline>
              <FilterBar
                documentId={documentId}
                onDocumentIdChange={setDocumentId}
                loading={loading}
                onRefresh={() => setTick((t) => t + 1)}
                actions={actions}
                onActionsChange={setActions}
              />
            </Stack>
          </Card>
        </Stack>

        {loading && (
          <Inline>
            <Spinner muted />
            <Text muted>Loading…</Text>
          </Inline>
        )}

        {!loading && items.length === 0 && (
          <Card padding={3} tone="transparent" radius={2}>
            <Text muted>No recent changes.</Text>
          </Card>
        )}

        <Stack space={4}>
          {groups.map(([dayKey, list]) => (
            <TimelineGroup
              key={dayKey}
              dayKey={dayKey}
              items={list}
              resolvedDocumentMeta={resolvedDocumentMeta}
              resolvedNames={resolvedNames}
            />
          ))}
        </Stack>

        {hasMore && (
          <Flex align="center" justify="center">
            <Button
              mode="ghost"
              text="Load all"
              onClick={() => setShowAll(true)}
              disabled={loading}
            />
          </Flex>
        )}

        <Flex align="center">
          <Card padding={2} tone="transparent" radius={2}>
            <Text size={1}>
              {showAll
                ? `Showing ${visibleCount} entr${visibleCount === 1 ? 'y' : 'ies'}`
                : `Showing first ${visibleCount} entr${visibleCount === 1 ? 'y' : 'ies'}`}
            </Text>
          </Card>
        </Flex>
      </Stack>
    </Box>
  )
}
