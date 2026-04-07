import { ActionIcon } from '@mantine/core'
import { IconX } from '@tabler/icons-react'
import { useInfoCard } from './InfoCardContext'
import styles from './InfoCard.module.css'

export default function InfoCardCloseButton() {
  const { onClose } = useInfoCard()

  return (
    <div className={styles.closeButtonRow}>
      <ActionIcon
        radius="xl"
        size="md"
        variant="filled"
        color="dark"
        onClick={onClose}
        aria-label="關閉資訊卡"
        mt={8}
      >
        <IconX size="1em" />
      </ActionIcon>
    </div>
  )
}
