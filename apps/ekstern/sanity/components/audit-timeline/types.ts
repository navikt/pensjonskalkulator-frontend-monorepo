export type Action =
  | 'create'
  | 'update'
  | 'publish'
  | 'unpublish'
  | 'delete'
  | 'duplicate'
  | 'discard'
  | 'default'

export interface Actor {
  id: string
  name?: string
  email?: string
  type: 'user' | 'system' | 'token'
}

export interface RevisionRef {
  rev?: string
  at?: string
}

export interface Transaction {
  id: string
  timestamp: string
  action: Action
  documentId: string
  documentType?: string
  revBefore?: string
  revAfter?: string
  actor?: Actor
  message?: string
}

export interface TimelineItem extends Transaction {
  title?: string
}

export interface ListOptions {
  limit?: number
  offset?: number
  actions?: Action[]
}
