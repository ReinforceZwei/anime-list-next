import { ActionIcon, Tooltip } from '@mantine/core'
import { IconHistory } from '@tabler/icons-react'
import { modals } from '@/lib/modalStack'
import { useInfoCard } from './InfoCardContext'

export default function InfoCardHistoryButton() {
  const { anime } = useInfoCard()

  if (!anime) return null

  function handleClick() {
    if (!anime) return
    modals.openContextModal({
      modal: 'auditHistory',
      title: '編輯紀錄',
      innerProps: {
        collection: 'animes',
        recordId: anime.id,
      },
    })
  }

  return (
    <Tooltip label="編輯紀錄" withArrow events={{ hover: true, focus: true, touch: false }}>
      <ActionIcon
        radius="xl"
        size="lg"
        variant="filled"
        color="violet"
        onClick={handleClick}
        aria-label="編輯紀錄"
      >
        <IconHistory size="1em" />
      </ActionIcon>
    </Tooltip>
  )
}
