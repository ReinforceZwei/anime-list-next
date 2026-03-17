import { Badge, Group, Skeleton } from '@mantine/core'
import { useInfoCard } from './InfoCardContext'

const STATUS_LABEL: Record<string, string> = {
  planned: 'Planned',
  watching: 'Watching',
  completed: 'Completed',
  dropped: 'Dropped',
}

const STATUS_COLOR: Record<string, string> = {
  planned: 'gray',
  watching: 'blue',
  completed: 'teal',
  dropped: 'red',
}

const DOWNLOAD_LABEL: Record<string, string> = {
  pending: 'Pending',
  downloading: 'Downloading',
  downloaded: 'Downloaded',
}

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

  if (!status && !downloadStatus) return null

  return (
    <Group gap={6} mb="xs">
      {status && (
        <Badge size="sm" variant="light" color={STATUS_COLOR[status] ?? 'gray'}>
          {STATUS_LABEL[status] ?? status}
        </Badge>
      )}
      {downloadStatus && (
        <Badge size="sm" variant="outline" color={DOWNLOAD_COLOR[downloadStatus] ?? 'gray'}>
          {DOWNLOAD_LABEL[downloadStatus] ?? downloadStatus}
        </Badge>
      )}
    </Group>
  )
}
