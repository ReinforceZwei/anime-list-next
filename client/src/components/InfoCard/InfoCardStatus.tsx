import { Badge, Group, Skeleton } from '@mantine/core'
import {
  SELECT_DOWNLOAD_OPTIONS,
  SELECT_STATUS_OPTIONS,
} from '@/lib/fieldRegistry'
import { useInfoCard } from './InfoCardContext'

const STATUS_LABEL: Record<string, string> = Object.fromEntries(
  SELECT_STATUS_OPTIONS.map((o) => [o.value, o.label]),
)

const STATUS_COLOR: Record<string, string> = {
  planned: 'gray',
  watching: 'blue',
  completed: 'teal',
  dropped: 'red',
}

const DOWNLOAD_LABEL: Record<string, string> = Object.fromEntries(
  SELECT_DOWNLOAD_OPTIONS.map((o) => [o.value, o.label]),
)

const DOWNLOAD_COLOR: Record<string, string> = {
  pending: 'gray',
  downloading: 'orange',
  downloaded: 'green',
}

export default function InfoCardStatus() {
  const { anime, loading } = useInfoCard()

  if (loading) return <Skeleton height={20} width="50%" mb="xs" />

  const status = anime?.status
  const downloadStatus = anime?.downloadStatus
  const seasonNumber = anime?.tmdbSeasonNumber

  if (!status && !downloadStatus && !seasonNumber) return null

  return (
    <Group gap={6} mb="xs">
      {Boolean(seasonNumber) && (
        <Badge size="sm">第{anime?.tmdbSeasonNumber}季</Badge>
      )}
      {Boolean(anime?.tmdbId) &&
        anime?.tmdbMediaType === 'tv' &&
        seasonNumber === 0 && <Badge size="sm">SP</Badge>}
      {status && (
        <Badge size="sm" variant="light" color={STATUS_COLOR[status] ?? 'gray'}>
          {STATUS_LABEL[status] ?? status}
        </Badge>
      )}
      {downloadStatus && (
        <Badge
          size="sm"
          variant="outline"
          color={DOWNLOAD_COLOR[downloadStatus] ?? 'gray'}
        >
          {DOWNLOAD_LABEL[downloadStatus] ?? downloadStatus}
        </Badge>
      )}
    </Group>
  )
}
