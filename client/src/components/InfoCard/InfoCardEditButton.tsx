import { ActionIcon, Tooltip } from '@mantine/core'
import { IconEdit } from '@tabler/icons-react'
import { useInfoCard } from './InfoCardContext'

export default function InfoCardEditButton() {
  const { onEdit } = useInfoCard()

  return (
    <Tooltip label="編輯動畫" withArrow events={{ hover: true, focus: true, touch: false }}>
      <ActionIcon
        radius="xl"
        size="lg"
        variant="filled"
        color="blue"
        onClick={onEdit}
        aria-label="編輯動畫"
      >
        <IconEdit size="1em" />
      </ActionIcon>
    </Tooltip>
  )
}
