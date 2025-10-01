import { ClockIcon } from '@sanity/icons'
import React, { useMemo } from 'react'
import { definePlugin, useCurrentUser } from 'sanity'

import { AuditTool } from './AuditTool'
import { DocumentPanel } from './DocumentPanel'

export interface AuditTimelineOptions {
  roles?: string[]
}

export const auditTimelinePlugin = definePlugin<AuditTimelineOptions | void>(
  (options) => {
    const allowedRoles = options?.roles || ['administrator', 'editor']

    const useCanSee = () => {
      const user = useCurrentUser()
      return useMemo(() => {
        const roles = (user?.roles || []).map((r) => r.name)
        return roles.some((r) => allowedRoles.includes(r))
      }, [user])
    }

    const GuardedTool: React.FC = () => {
      const canSee = useCanSee()
      if (!canSee) return <div style={{ padding: 24 }}>Audit locked</div>
      return <AuditTool />
    }

    const GuardedInspector: React.FC<{
      documentId?: string
      document?: { _id?: string } | null
    }> = (props) => {
      const canSee = useCanSee()
      if (!canSee)
        return <div style={{ padding: 16, fontSize: 13 }}>Audit locked</div>
      return <DocumentPanel {...props} />
    }

    return {
      name: 'audit-timeline',
      tools: [
        {
          name: 'audit',
          title: 'Audit',
          icon: ClockIcon,
          component: GuardedTool,
        },
      ],
      document: {
        inspectors: [
          {
            name: 'audit',
            title: 'Audit',
            icon: ClockIcon,
            component: GuardedInspector,
            useMenuItem: () => ({ icon: ClockIcon, title: 'Audit' }),
          },
        ],
      },
    }
  }
)

export default auditTimelinePlugin
