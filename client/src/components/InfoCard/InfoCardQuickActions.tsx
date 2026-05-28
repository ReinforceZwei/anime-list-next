import { useState } from 'react'
import {
  ActionIcon,
  Button,
  Group,
  Modal,
  Skeleton,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core'
import {
  IconPlayerPlay,
  IconCheck,
  IconDownload,
  IconCalendar,
} from '@tabler/icons-react'
import { useInfoCard } from './InfoCardContext'
import { evaluateFilter } from '@/lib/filterEngine'
import { applyActions, describeActions } from '@/lib/actionExecutor'
import { getIconComponent } from '@/components/ActionButtonEditor/iconCatalog'
import type { ActionButton } from '@/types/filter'
import type { AnimeRecord } from '../../types/anime'
import styles from './InfoCard.module.css'

type Status = NonNullable<AnimeRecord['status']>
type DownloadStatus = NonNullable<AnimeRecord['downloadStatus']>

interface QuickAction {
  label: string
  icon: React.ReactNode
  color: string
  patch: Partial<AnimeRecord>
}

function getDefaultActions(
  status: Status | undefined | '',
  downloadStatus: DownloadStatus | undefined | '',
): QuickAction[] {
  const actions: QuickAction[] = []

  if (status === 'planned') {
    actions.push({ label: '開始觀看', icon: <IconPlayerPlay size="1em" />, color: 'blue', patch: { status: 'watching' } })
  }
  if (status === 'watching') {
    actions.push({ label: '標記為已看完', icon: <IconCheck size="1em" />, color: 'teal', patch: { status: 'completed' } })
  }
  if (!status) {
    actions.push({ label: '列入待看', icon: <IconCalendar size="1em" />, color: 'gray', patch: { status: 'planned' } })
  }

  if (downloadStatus === 'pending') {
    actions.push({ label: '開始下載', icon: <IconDownload size="1em" />, color: 'orange', patch: { downloadStatus: 'downloading' } })
  }
  if (downloadStatus === 'downloading') {
    actions.push({ label: '標記為已下載', icon: <IconCheck size="1em" />, color: 'green', patch: { downloadStatus: 'downloaded' } })
  }

  return actions
}

interface InfoCardQuickActionsProps {
  onMutate?: (patch: Partial<AnimeRecord>) => void
}

export default function InfoCardQuickActions({ onMutate }: InfoCardQuickActionsProps) {
  const { anime, loading, actionButtons, tagMap, showBuiltInActions } = useInfoCard()
  const [confirmingButton, setConfirmingButton] = useState<ActionButton | null>(null)

  if (loading) {
    return (
      <div className={styles.quickActionsBar}>
        <Skeleton height={32} width={120} />
      </div>
    )
  }

  const defaultActions = getDefaultActions(anime?.status, anime?.downloadStatus)

  // --- Custom user buttons ---
  const matchedButtons = anime
    ? actionButtons.filter(b => evaluateFilter(b.condition, anime))
    : []

  function handleButtonClick(button: ActionButton) {
    if (!anime) return
    if (button.askConfirmation) {
      setConfirmingButton(button)
      return
    }
    const patch = applyActions(anime, button.actions)
    if (Object.keys(patch).length > 0) onMutate?.(patch)
  }

  function handleConfirm() {
    if (!confirmingButton || !anime) return
    const patch = applyActions(anime, confirmingButton.actions)
    if (Object.keys(patch).length > 0) onMutate?.(patch)
    setConfirmingButton(null)
  }

  const hasBuiltInActions = showBuiltInActions && defaultActions.length > 0
  if (!hasBuiltInActions && matchedButtons.length === 0) return null

  return (
    <div className={styles.quickActionsBar}>
      <Group gap="xs">
        {/* Built-in defaults (controlled by UIConfig.showBuiltInActions) */}
        {showBuiltInActions && defaultActions.map(action => (
          <Button
            key={action.label}
            size="xs"
            variant="filled"
            color={action.color}
            leftSection={action.icon}
            onClick={() => onMutate?.(action.patch)}
          >
            {action.label}
          </Button>
        ))}

        {/* Custom user buttons */}
        {matchedButtons.map(button => {
          const IconComp = getIconComponent(button.icon)
          if (button.showAsIcon) {
            return (
              <Tooltip key={button.id} label={button.label}>
                <ActionIcon
                  variant="filled"
                  color={button.color ?? 'gray'}
                  size="md"
                  onClick={() => handleButtonClick(button)}
                >
                  {IconComp ? <IconComp size="1em" /> : button.label.slice(0, 1)}
                </ActionIcon>
              </Tooltip>
            )
          }
          return (
            <Button
              key={button.id}
              size="xs"
              variant="filled"
              color={button.color ?? 'gray'}
              leftSection={IconComp ? <IconComp size="1em" /> : undefined}
              onClick={() => handleButtonClick(button)}
            >
              {button.label}
            </Button>
          )
        })}
      </Group>

      {/* Confirmation modal */}
      <Modal
        opened={confirmingButton !== null}
        onClose={() => setConfirmingButton(null)}
        title="確認執行"
        size="sm"
      >
        <Stack gap="sm">
          <Text>確定要執行「{confirmingButton?.label}」嗎？</Text>
          {confirmingButton && (
            <Text size="sm" c="dimmed">
              {describeActions(confirmingButton.actions, tagMap)}
            </Text>
          )}
        </Stack>
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setConfirmingButton(null)}>取消</Button>
          <Button onClick={handleConfirm}>確認</Button>
        </Group>
      </Modal>
    </div>
  )
}
