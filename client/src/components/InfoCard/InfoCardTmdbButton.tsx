import { ActionIcon, Tooltip } from '@mantine/core'
import { IconDatabase } from '@tabler/icons-react'
import { modals } from '@/lib/modalStack'
import { useInfoCard } from './InfoCardContext'
import { getDisplayTitle } from '@/lib/animeUtils'

export default function InfoCardTmdbButton() {
  const { anime, hasTmdbId } = useInfoCard()

  if (!hasTmdbId || !anime?.tmdbId || !anime?.tmdbMediaType) return null

  function handleClick() {
    if (!anime?.tmdbId || !anime?.tmdbMediaType) return
    modals.openContextModal({
      modal: 'tmdbMetadata',
      title: 'TMDb 詳細資料',
      innerProps: {
        tmdbId: anime.tmdbId,
        tmdbMediaType: anime.tmdbMediaType,
        title: getDisplayTitle(anime),
        tmdbSeasonNumber: anime.tmdbSeasonNumber,
      },
    })
  }

  return (
    <Tooltip label="TMDb 詳細資料" withArrow events={{ hover: true, focus: true, touch: false }}>
      <ActionIcon
        radius="xl"
        size="lg"
        variant="filled"
        color="teal"
        onClick={handleClick}
        aria-label="TMDb 詳細資料"
      >
        <IconDatabase size="1em" />
      </ActionIcon>
    </Tooltip>
  )
}
