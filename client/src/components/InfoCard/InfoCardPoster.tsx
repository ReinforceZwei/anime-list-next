import { useInfoCard } from './InfoCardContext'
import styles from './InfoCard.module.css'

export default function InfoCardPoster() {
  const { posterUrl, onPosterClick } = useInfoCard()

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
