import { Box, Button, Card, Inline, Text, TextInput } from '@sanity/ui'
import React from 'react'

import type { Action } from '../types'

export interface FilterBarProps {
  documentId: string
  onDocumentIdChange: (next: string) => void
  loading?: boolean
  onRefresh: () => void
  actions: readonly Action[]
  onActionsChange: (next: Action[]) => void
}

export const FilterBar: React.FC<FilterBarProps> = ({
  documentId,
  onDocumentIdChange,
  loading,
  onRefresh,
  actions,
  onActionsChange,
}) => {
  const toggleAction = (a: Action) => {
    const has = actions.includes(a)
    onActionsChange(has ? actions.filter((x) => x !== a) : [...actions, a])
  }

  const VISIBLE_ACTIONS: Action[] = ['create', 'update', 'delete']

  return (
    <Box>
      <Inline space={2} style={{ rowGap: 8, flexWrap: 'wrap' }}>
        <TextInput
          value={documentId}
          onChange={(e) => onDocumentIdChange(e.currentTarget.value)}
          placeholder="Document ID (optional)"
          aria-label="Filter by document ID"
          style={{ width: 360 }}
        />
        {documentId ? (
          <Button
            text="Clear"
            mode="bleed"
            onClick={() => onDocumentIdChange('')}
            disabled={loading}
            size={1}
          />
        ) : null}
        <Button text="Refresh" onClick={onRefresh} disabled={loading} />
        <Text muted size={1}>
          Snapshots and diffs available in details.
        </Text>
      </Inline>

      <Card padding={2} radius={2} tone="transparent" style={{ marginTop: 8 }}>
        <div
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            paddingBottom: 4,
          }}
        >
          {VISIBLE_ACTIONS.map((a) => (
            <Button
              key={a}
              mode={actions.includes(a) ? 'default' : 'ghost'}
              text={a}
              onClick={() => toggleAction(a)}
              size={1}
            />
          ))}
          {actions.length ? (
            <Button
              mode="bleed"
              text="Clear"
              onClick={() => onActionsChange([])}
              size={1}
            />
          ) : null}
        </div>
      </Card>
    </Box>
  )
}
