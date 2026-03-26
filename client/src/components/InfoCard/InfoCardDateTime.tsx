import { Skeleton, Stack, Text } from '@mantine/core'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-tw'
import { useInfoCard } from './InfoCardContext'

function formatDate(iso: string): string {
  return dayjs(iso).format('YYYY年M月D日 HH:mm')
}

function daysBetween(a: string, b: string): number {
  return dayjs(b).diff(dayjs(a), 'day')
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
          加入於 {formatDate(created)}
        </Text>
      )}
      {startedAt && (
        <Text size="xs" c="yellow.6">
          開始於 {formatDate(startedAt)}
        </Text>
      )}
      {completedAt && (
        <Text size="xs" c="teal.5">
          完成於 {formatDate(completedAt)}
          {startedAt && (
            <Text span c="dimmed">（{daysBetween(startedAt, completedAt)} 天）</Text>
          )}
        </Text>
      )}
    </Stack>
  )
}
