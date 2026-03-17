import { ActionIcon } from '@mantine/core'
import { IconEdit } from '@tabler/icons-react'
import { useInfoCard } from './InfoCardContext'
import styles from './InfoCard.module.css'

export default function InfoCardEditButton() {
  const { onEdit } = useInfoCard()

  return (
    <div className={styles.editButton}>
      <ActionIcon
        radius="xl"
        size="lg"
        variant="filled"
        color="blue"
        onClick={onEdit}
        aria-label="Edit anime"
      >
        <IconEdit size={16} />
      </ActionIcon>
    </div>
  )
}
