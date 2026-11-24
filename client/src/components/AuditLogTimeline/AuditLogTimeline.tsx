import { useMemo } from 'react'
import {
  Badge,
  Center,
  Group,
  Loader,
  Pagination,
  Paper,
  Stack,
  Text,
} from '@mantine/core'
import { IconArrowRight } from '@tabler/icons-react'
import { useAuditLogs } from '@/hooks/useAuditLogs'
import { useAnimeList } from '@/hooks/useAnimeList'
import { useTagMap } from '@/hooks/useTagMap'
import { getDisplayTitle } from '@/lib/animeUtils'
import { formatDate, formatDateTime } from '@/lib/dateUtils'
import { getCollectionFieldMeta } from '@/lib/fieldRegistry'
import type { AuditAction, AuditLogRecord, FieldChange } from '@/types/auditLog'
import type { TagRecord } from '@/types/anime'

const ACTION_META: Record<AuditAction, { label: string; color: string }> = {
  CREATE: { label: '新增', color: 'teal' },
  UPDATE: { label: '編輯', color: 'blue' },
  DELETE: { label: '刪除', color: 'red' },
}

const COLLECTION_LABELS: Record<string, string> = {
  animes: '動畫',
  tags: '標籤',
}

function formatFieldValue(
  collection: string,
  field: string,
  value: unknown,
  tagMap: Map<string, TagRecord>,
): string {
  if (value === null || value === undefined || value === '') {
    return '（空）'
  }
  if (typeof value === 'boolean') {
    return value ? '是' : '否'
  }
  if (typeof value === 'string') {
    const options = getCollectionFieldMeta(collection, field)?.options
    if (options) return options.find((option) => option.value === value)?.label ?? value
  }
  if ((field === 'startedAt' || field === 'completedAt') && typeof value === 'string') {
    return formatDate(value)
  }
  if (field === 'tags' && Array.isArray(value)) {
    if (value.length === 0) return '（無）'
    return value
      .map((id) => tagMap.get(String(id))?.name ?? String(id))
      .join('、')
  }
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}

function extractString(change: FieldChange | undefined): string | null {
  if (!change) return null
  const v = change.new ?? change.old
  return typeof v === 'string' && v.trim() !== '' ? v : null
}

function resolveRecordTitle(
  log: AuditLogRecord,
  animeTitleMap: Map<string, string>,
  tagMap: Map<string, TagRecord>,
): string {
  const metaTitle =
    typeof log.metadata?.title === 'string' && log.metadata.title.trim() !== ''
      ? log.metadata.title
      : null
  const metaSeason =
    typeof log.metadata?.seasonName === 'string' &&
    log.metadata.seasonName.trim() !== ''
      ? log.metadata.seasonName
      : null
  const metaName =
    typeof log.metadata?.name === 'string' && log.metadata.name.trim() !== ''
      ? log.metadata.name
      : null

  if (log.collection === 'animes') {
    if (metaTitle) {
      return metaSeason ? `${metaTitle} · ${metaSeason}` : metaTitle
    }
    const live = animeTitleMap.get(log.recordId)
    if (live) return live
    const cachedTitle = extractString(log.changes?.cachedTitle)
    const cachedSeason = extractString(log.changes?.cachedSeasonName)
    const customName = extractString(log.changes?.customName)
    if (cachedTitle) {
      return cachedSeason ? `${cachedTitle} · ${cachedSeason}` : cachedTitle
    }
    if (customName) return customName
  } else if (log.collection === 'tags') {
    if (metaName) return metaName
    const live = tagMap.get(log.recordId)?.name
    if (live) return live
    const name = extractString(log.changes?.name)
    if (name) return name
  }
  return log.recordId
}

interface AuditLogTimelineProps {
  collection?: string
  recordId?: string
  action?: AuditAction | ''
  page: number
  onPageChange: (page: number) => void
  showRecordTitle?: boolean
}

export function AuditLogTimeline({
  collection,
  recordId,
  action,
  page,
  onPageChange,
  showRecordTitle = false,
}: AuditLogTimelineProps) {
  const { data, isLoading, isError } = useAuditLogs({
    collection,
    recordId,
    action,
    page,
    perPage: 20,
  })
  const { data: animeList } = useAnimeList()
  const tagMap = useTagMap()

  const animeTitleMap = useMemo(() => {
    const map = new Map<string, string>()
    if (animeList) {
      for (const a of animeList) {
        map.set(a.id, getDisplayTitle(a))
      }
    }
    return map
  }, [animeList])

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader size="md" />
      </Center>
    )
  }

  if (isError) {
    return (
      <Text c="red" ta="center" py="lg" size="sm">
        無法載入編輯紀錄
      </Text>
    )
  }

  const items = data?.items ?? []
  if (items.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl" size="sm">
        目前沒有編輯紀錄
      </Text>
    )
  }

  return (
    <Stack gap="sm">
      {items.map((log) => {
        const meta = ACTION_META[log.action] ?? {
          label: log.action,
          color: 'gray',
        }
        const entries = Object.entries(log.changes ?? {})
        const recordTitle = showRecordTitle
          ? resolveRecordTitle(log, animeTitleMap, tagMap)
          : null

        return (
          <Paper key={log.id} withBorder radius="md" p="sm">
            <Group justify="space-between" mb={entries.length > 0 ? 'xs' : 0} wrap="nowrap">
              <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
                <Badge color={meta.color} variant="light" size="sm">
                  {meta.label}
                </Badge>
                {showRecordTitle && (
                  <Badge color="gray" variant="outline" size="sm">
                    {COLLECTION_LABELS[log.collection] ?? log.collection}
                  </Badge>
                )}
                {recordTitle && (
                  <Text size="sm" fw={600} truncate>
                    {recordTitle}
                  </Text>
                )}
              </Group>
              <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
                {formatDateTime(log.created)}
              </Text>
            </Group>

            {entries.length > 0 && (
              <Stack gap={4}>
                {entries.map(([field, change]) => {
                  const oldStr = formatFieldValue(log.collection, field, change.old, tagMap)
                  const newStr = formatFieldValue(log.collection, field, change.new, tagMap)
                  return (
                    <Group key={field} gap={6} align="flex-start" wrap="wrap">
                      <Text size="xs" fw={500} c="dimmed" miw={72}>
                        {getCollectionFieldMeta(log.collection, field)?.label ?? field}
                      </Text>
                      <Group gap={4} align="center" wrap="wrap" style={{ flex: 1 }}>
                        <Text
                          size="xs"
                          c={change.old == null ? 'dimmed' : 'red'}
                          style={{ wordBreak: 'break-word' }}
                        >
                          {oldStr}
                        </Text>
                        <IconArrowRight size={12} style={{ opacity: 0.6, flexShrink: 0 }} />
                        <Text
                          size="xs"
                          c={change.new == null ? 'dimmed' : 'teal'}
                          style={{ wordBreak: 'break-word' }}
                        >
                          {newStr}
                        </Text>
                      </Group>
                    </Group>
                  )
                })}
              </Stack>
            )}
          </Paper>
        )
      })}

      {(data?.totalPages ?? 1) > 1 && (
        <Center pt="xs">
          <Pagination
            total={data!.totalPages}
            value={page}
            onChange={onPageChange}
            size="sm"
          />
        </Center>
      )}
    </Stack>
  )
}
