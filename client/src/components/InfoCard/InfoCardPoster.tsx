import { IconLink, IconPhotoOff } from '@tabler/icons-react'
import { modals } from '@mantine/modals'
import { ActionIcon, Tooltip } from '@mantine/core'
import { useInfoCard } from './InfoCardContext'
import styles from './InfoCard.module.css'

export default function InfoCardPoster() {
  const { anime, posterUrl, hasTmdbId, onPosterClick } = useInfoCard()

  if (!hasTmdbId) {
    return (
      <div className={styles.posterPlaceholder}>
        <IconPhotoOff size={28} stroke={1.5} />
        <Tooltip label="Link to TMDb" position="bottom" withArrow>
          <ActionIcon
            variant="subtle"
            size="sm"
            onClick={() => {
              if (!anime?.id) return
              modals.openContextModal({
                modal: 'tmdbSearch',
                title: 'Link to TMDb',
                size: '56rem',
                innerProps: { mode: 'link', animeId: anime.id, initialQuery: anime.customName ?? '' },
              })
            }}
          >
            <IconLink size={16} stroke={1.5} />
          </ActionIcon>
        </Tooltip>
      </div>
    )
  }

  return (
    <div
      className={styles.posterWrapper}
      style={posterUrl ? { backgroundImage: `url(${posterUrl})` } : undefined}
      onClick={posterUrl ? onPosterClick : undefined}
      role={posterUrl ? 'button' : undefined}
      aria-label={posterUrl ? 'View fullscreen poster' : undefined}
      tabIndex={posterUrl ? 0 : undefined}
      onKeyDown={posterUrl ? (e) => e.key === 'Enter' && onPosterClick() : undefined}
    />
  )
}
