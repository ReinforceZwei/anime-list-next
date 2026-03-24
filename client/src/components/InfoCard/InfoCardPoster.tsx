import { IconPhotoOff } from '@tabler/icons-react'
import { useInfoCard } from './InfoCardContext'
import styles from './InfoCard.module.css'

export default function InfoCardPoster() {
  const { posterUrl, hasTmdbId, onPosterClick } = useInfoCard()

  if (!hasTmdbId) {
    return (
      <div className={styles.posterPlaceholder}>
        <IconPhotoOff size={28} stroke={1.5} />
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
