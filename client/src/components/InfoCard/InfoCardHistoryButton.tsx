import { ActionIcon } from '@mantine/core'
import { IconHistory } from '@tabler/icons-react'
import { modals } from '@/lib/modalStack'
import { useInfoCard } from './InfoCardContext'
import { getDisplayTitle } from '@/lib/animeUtils'

export default function InfoCardHistoryButton() {
  const { anime, hasTmdbId } = useInfoCard()

  if (!anime) return null

  function handleClick() {
    if (!anime) return
    modals.openContextModal({
      modal: 'auditHistory',
      title: `${getDisplayTitle(anime)} — 編輯紀錄`,
      innerProps: {
        collection: 'animes',
        recordId: anime.id,
      },
    })
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: hasTmdbId
          ? 'calc(var(--mantine-spacing-md) + 5rem)'
          : 'calc(var(--mantine-spacing-md) + 2.5rem)',
        transform: 'translateY(-50%)',
      }}
    >
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
    </div>
  )
}
