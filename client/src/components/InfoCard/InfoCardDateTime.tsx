import { Skeleton, Stack, Text } from '@mantine/core'
import dayjs from 'dayjs'
import { useInfoCard } from './InfoCardContext'

function formatDate(iso: string): string {
  return dayjs(iso).format('MMM D, YYYY h:mm A')
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
          Added {formatDate(created)}
        </Text>
      )}
      {startedAt && (
        <Text size="xs" c="yellow.6">
          Started {formatDate(startedAt)}
        </Text>
      )}
      {completedAt && (
        <Text size="xs" c="teal.5">
          Completed {formatDate(completedAt)}
          {startedAt && (
            <Text span c="dimmed"> ({daysBetween(startedAt, completedAt)} days)</Text>
          )}
        </Text>
      )}
    </Stack>
  )
}
