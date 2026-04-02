import { useMemo } from 'react'
import { Image } from '@mantine/core'
import { modals } from '@mantine/modals'
import { useAnimeList } from '@/hooks/useAnimeList'
import { useTagMap } from '@/hooks/useTagMap'
import { useTmdbDetail } from '@/hooks/useTmdb'
import { useAnimeMutation } from '@/hooks/useAnimeMutation'
import type { AnimeRecord } from '@/types/anime'
import InfoCard from './InfoCard'

interface AnimeCardProps {
  animeId: string
  onClose: () => void
  /**
   * Function to jump to the anime card in the anime list
   */
  onJumpTo?: (id: string) => void
}

export default function AnimeCard({ animeId, onClose, onJumpTo }: AnimeCardProps) {
  const { data: animeList, isLoading: listLoading } = useAnimeList()
  const tagMap = useTagMap()
  const { updateMutation } = useAnimeMutation()

  const anime = useMemo(
    () => animeList?.find((a) => a.id === animeId),
    [animeList, animeId],
  )

  const loading = listLoading || (!anime && !animeList)

  const tmdbType = anime?.tmdbMediaType ? anime.tmdbMediaType : null
  const tmdbId = anime?.tmdbId ?? null
  const { data: tmdbDetail } = useTmdbDetail(tmdbType, tmdbId)

  const posterUrl = tmdbDetail?.posterPath ?? null

  const tags = useMemo(() => {
    if (!anime?.tags) return []
    return anime.tags
      .map((id) => tagMap.get(id))
      .filter((t): t is NonNullable<typeof t> => !!t)
      .sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0) || a.name.localeCompare(b.name))
  }, [anime?.tags, tagMap])

  const title = anime?.cachedTitle || anime?.customName

  function handleEdit() {
    if (!anime) return
    modals.openContextModal({
      modal: 'editAnime',
      title: '編輯動畫',
      innerProps: { anime, onSaved: onJumpTo, onDeleted: onClose },
      closeOnClickOutside: false,
      closeOnEscape: false,
    })
  }

  function handlePosterClick() {
    if (!posterUrl) return
    modals.open({
      size: 'auto',
      padding: 0,
      withCloseButton: false,
      children: (
        <Image
          src={posterUrl}
          alt={title}
          fit="contain"
          mah="90vh"
          style={{ display: 'block' }}
          onClick={() => modals.closeAll()}
        />
      ),
    })
  }

  function handleStatusChange(targetStatus: NonNullable<AnimeRecord['status']>) {
    if (!anime) return
    const now = new Date().toISOString()
    const patch: Partial<AnimeRecord> = { status: targetStatus }
    if (targetStatus === 'watching' && !anime.startedAt) patch.startedAt = now
    if (targetStatus === 'completed' && !anime.completedAt) patch.completedAt = now
    updateMutation.mutate(
      { ...anime, ...patch },
      { onSuccess: (record) => onJumpTo?.(record.id) },
    )
  }

  function handleDownloadStatusChange(targetStatus: NonNullable<AnimeRecord['downloadStatus']>) {
    if (!anime) return
    updateMutation.mutate({ ...anime, downloadStatus: targetStatus })
  }

  return (
    <InfoCard
      anime={anime}
      tags={tags}
      loading={loading}
      posterUrl={posterUrl}
      hasTmdbId={Boolean(tmdbId)}
      onClose={onClose}
      onEdit={handleEdit}
      onPosterClick={handlePosterClick}
      onJumpTo={onJumpTo}
    >
      <InfoCard.CloseButton />
      <InfoCard.Poster />
      <InfoCard.Content>
        <InfoCard.EditButton />
        <InfoCard.Title />
        <InfoCard.Status />
        <InfoCard.Tags />
        <InfoCard.Rating />
        <InfoCard.DateTime />
        <InfoCard.TextSection label="心得" contentKey="comment" />
        <InfoCard.TextSection label="備註" contentKey="remark" />
        <InfoCard.RelatedSeasons />
      </InfoCard.Content>
      <InfoCard.QuickActions
        onStatusChange={handleStatusChange}
        onDownloadStatusChange={handleDownloadStatusChange}
      />
    </InfoCard>
  )
}
