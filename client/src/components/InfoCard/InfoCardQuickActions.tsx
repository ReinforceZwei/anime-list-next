import { Button, Group, Skeleton } from '@mantine/core'
import {
  IconPlayerPlay,
  IconCheck,
  IconDownload,
  IconCalendar,
} from '@tabler/icons-react'
import { useInfoCard } from './InfoCardContext'
import type { AnimeRecord } from '../../types/anime'
import styles from './InfoCard.module.css'

type Status = NonNullable<AnimeRecord['status']>
type DownloadStatus = NonNullable<AnimeRecord['downloadStatus']>

interface QuickAction {
  label: string
  icon: React.ReactNode
  color: string
  /** null = not a status transition, string = target status */
  targetStatus?: Status
  targetDownloadStatus?: DownloadStatus
}

function getActions(
  status: Status | undefined | '',
  downloadStatus: DownloadStatus | undefined | '',
): QuickAction[] {
  const actions: QuickAction[] = []

  if (status === 'planned') {
    actions.push({ label: 'Start watching', icon: <IconPlayerPlay size={14} />, color: 'blue', targetStatus: 'watching' })
  }
  if (status === 'watching') {
    actions.push({ label: 'Mark completed', icon: <IconCheck size={14} />, color: 'teal', targetStatus: 'completed' })
  }
  if (!status || status === '') {
    actions.push({ label: 'Plan to watch', icon: <IconCalendar size={14} />, color: 'gray', targetStatus: 'planned' })
  }

  if (downloadStatus === 'pending') {
    actions.push({ label: 'Downloading', icon: <IconDownload size={14} />, color: 'orange', targetDownloadStatus: 'downloading' })
  }
  if (downloadStatus === 'downloading') {
    actions.push({ label: 'Mark downloaded', icon: <IconCheck size={14} />, color: 'green', targetDownloadStatus: 'downloaded' })
  }

  return actions
}

interface InfoCardQuickActionsProps {
  onStatusChange?: (targetStatus: Status) => void
  onDownloadStatusChange?: (targetDownloadStatus: DownloadStatus) => void
}

export default function InfoCardQuickActions({
  onStatusChange,
  onDownloadStatusChange,
}: InfoCardQuickActionsProps) {
  const { anime, loading } = useInfoCard()

  if (loading) {
    return (
      <div className={styles.quickActionsBar}>
        <Skeleton height={32} width={120} />
      </div>
    )
  }

  const actions = getActions(anime?.status, anime?.downloadStatus)
  if (!actions.length) return null

  return (
    <div className={styles.quickActionsBar}>
      <Group gap="xs">
        {actions.map((action) => (
          <Button
            key={action.label}
            size="xs"
            variant="filled"
            color={action.color}
            leftSection={action.icon}
            onClick={() => {
              if (action.targetStatus) onStatusChange?.(action.targetStatus)
              if (action.targetDownloadStatus) onDownloadStatusChange?.(action.targetDownloadStatus)
            }}
          >
            {action.label}
          </Button>
        ))}
      </Group>
    </div>
  )
}
