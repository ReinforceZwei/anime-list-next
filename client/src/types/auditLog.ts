import type { RecordModel } from 'pocketbase'

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE'

export interface FieldChange {
  old: unknown
  new: unknown
}

export interface AuditLogRecord extends RecordModel {
  collection: string
  recordId: string
  action: AuditAction
  actorId: string
  ownerId: string
  changes: Record<string, FieldChange>
  metadata?: Record<string, unknown> | null
  created: string
}
