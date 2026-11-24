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
import dayjs from 'dayjs'
import { useAuditLogs } from '@/hooks/useAuditLogs'
import { useAnimeList } from '@/hooks/useAnimeList'
import { useTagMap } from '@/hooks/useTagMap'
import { getDisplayTitle } from '@/lib/animeUtils'
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

const FIELD_LABELS: Record<string, string> = {
  tmdbId: 'TMDb ID',
  tmdbSeasonNumber: '季數',
  tmdbMediaType: '媒體類型',
  customName: '自訂名稱',
  cachedTitle: '作品名稱',
  cachedSeasonName: '季數名稱',
  status: '觀看狀態',
  downloadStatus: '下載狀態',
  startedAt: '開始日期',
  completedAt: '完成日期',
  rating: '評分',
  comment: '心得',
  remark: '備註',
  tags: '標籤',
  name: '標籤名稱',
  color: '顏色',
  weight: '權重',
  hidden: '隱藏',
}

const STATUS_LABELS: Record<string, string> = {
  planned: '計畫中',
  watching: '觀看中',
  completed: '已看完',
  dropped: '已棄番',
}

const DOWNLOAD_STATUS_LABELS: Record<string, string> = {
  pending: '未下載',
  downloading: '下載中',
  downloaded: '已下載',
}

function formatFieldValue(
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
  if (field === 'status' && typeof value === 'string') {
    return STATUS_LABELS[value] ?? value
  }
  if (field === 'downloadStatus' && typeof value === 'string') {
    return DOWNLOAD_STATUS_LABELS[value] ?? value
  }
  if ((field === 'startedAt' || field === 'completedAt') && typeof value === 'string') {
    const d = dayjs(value)
    return d.isValid() ? d.format('YYYY-MM-DD') : value
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
  if (log.collection === 'animes') {
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
                {dayjs(log.created).format('YYYY-MM-DD HH:mm:ss')}
              </Text>
            </Group>

            {entries.length > 0 && (
              <Stack gap={4}>
                {entries.map(([field, change]) => {
                  const oldStr = formatFieldValue(field, change.old, tagMap)
                  const newStr = formatFieldValue(field, change.new, tagMap)
                  return (
                    <Group key={field} gap={6} align="flex-start" wrap="wrap">
                      <Text size="xs" fw={500} c="dimmed" miw={72}>
                        {FIELD_LABELS[field] ?? field}
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
