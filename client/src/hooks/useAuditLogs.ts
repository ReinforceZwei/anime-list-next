import { pb, Collections } from '@/lib/pb'
import type { AuditAction, AuditLogRecord } from '@/types/auditLog'
import { useQuery } from '@tanstack/react-query'

export interface UseAuditLogsParams {
  collection?: string
  recordId?: string
  action?: AuditAction | ''
  page?: number
  perPage?: number
}

export function useAuditLogs({
  collection,
  recordId,
  action,
  page = 1,
  perPage = 20,
}: UseAuditLogsParams = {}) {
  const userId = pb.authStore.record?.id

  const filters: string[] = []
  if (collection) {
    filters.push(`collection = "${collection}"`)
  }
  if (recordId) {
    filters.push(`recordId = "${recordId}"`)
  }
  if (action) {
    filters.push(`action = "${action}"`)
  }
  const filter = filters.join(' && ')

  return useQuery({
    queryKey: [
      Collections.AuditLogs,
      userId,
      collection ?? '',
      recordId ?? '',
      action ?? '',
      page,
      perPage,
    ],
    queryFn: () =>
      pb
        .collection<AuditLogRecord>(Collections.AuditLogs)
        .getList(page, perPage, {
          filter,
          sort: '-created,-id',
        }),
    refetchOnMount: 'always',
  })
}
