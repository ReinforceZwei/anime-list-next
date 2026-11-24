import { Skeleton, Stack, Text } from '@mantine/core'
import dayjs from 'dayjs'
import { formatDateTime } from '@/lib/dateUtils'
import { useInfoCard } from './InfoCardContext'

function daysBetween(a: string, b: string): number {
  // dayjs default truncate the result to zero decimal places
  // but we want to round up to the nearest integer, i.e. 11.1 -> 12
  return Math.ceil(dayjs(b).diff(dayjs(a), 'day', true))
}

export default function InfoCardDateTime() {
  const { anime, loading } = useInfoCard()

  if (loading) return <Skeleton height={36} mb="xs" />

  const created = anime?.created
  const startedAt = anime?.startedAt
  const completedAt = anime?.completedAt

  if (!created && !startedAt && !completedAt) return null

  return (
    <Stack gap={2} mb="xs">
      {created && (
        <Text size="xs" c="dimmed">
          加入於 {formatDateTime(created)}
        </Text>
      )}
      {startedAt && (
        <Text size="xs" c="yellow.6">
          開始於 {formatDateTime(startedAt)}
        </Text>
      )}
      {completedAt && (
        <Text size="xs" c="teal.5">
          完成於 {formatDateTime(completedAt)}
          {startedAt && (
            <Text span c="dimmed">
              （{daysBetween(startedAt, completedAt)} 天）
            </Text>
          )}
        </Text>
      )}
    </Stack>
  )
}
