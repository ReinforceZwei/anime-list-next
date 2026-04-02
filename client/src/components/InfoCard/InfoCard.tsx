import type { ReactNode } from 'react'
import { Paper } from '@mantine/core'
import { InfoCardContext } from './InfoCardContext'
import type { InfoCardContextValue } from './InfoCardContext'
import type { TagRecord } from '../../types/anime'
import InfoCardPoster from './InfoCardPoster'
import InfoCardCloseButton from './InfoCardCloseButton'
import InfoCardContent from './InfoCardContent'
import InfoCardEditButton from './InfoCardEditButton'
import InfoCardTitle from './InfoCardTitle'
import InfoCardStatus from './InfoCardStatus'
import InfoCardTags from './InfoCardTags'
import InfoCardRating from './InfoCardRating'
import InfoCardDateTime from './InfoCardDateTime'
import InfoCardTextSection from './InfoCardTextSection'
import InfoCardQuickActions from './InfoCardQuickActions'
import InfoCardRelatedSeasons from './InfoCardRelatedSeasons'
import styles from './InfoCard.module.css'

interface InfoCardProps
  extends Omit<InfoCardContextValue, 'tags'> {
  tags?: TagRecord[]
  children: ReactNode
}

function InfoCard({
  anime,
  tags = [],
  loading,
  posterUrl,
  hasTmdbId,
  onClose,
  onEdit,
  onPosterClick,
  onJumpTo,
  children,
}: InfoCardProps) {
  return (
    <InfoCardContext.Provider
      value={{ anime, tags, loading, posterUrl, hasTmdbId, onClose, onEdit, onPosterClick, onJumpTo }}
    >
      <Paper radius="md" shadow="xl" className={styles.card} withBorder>
        {children}
      </Paper>
    </InfoCardContext.Provider>
  )
}

InfoCard.Poster = InfoCardPoster
InfoCard.CloseButton = InfoCardCloseButton
InfoCard.Content = InfoCardContent
InfoCard.EditButton = InfoCardEditButton
InfoCard.Title = InfoCardTitle
InfoCard.Status = InfoCardStatus
InfoCard.Tags = InfoCardTags
InfoCard.Rating = InfoCardRating
InfoCard.DateTime = InfoCardDateTime
InfoCard.TextSection = InfoCardTextSection
InfoCard.QuickActions = InfoCardQuickActions
InfoCard.RelatedSeasons = InfoCardRelatedSeasons

export default InfoCard
