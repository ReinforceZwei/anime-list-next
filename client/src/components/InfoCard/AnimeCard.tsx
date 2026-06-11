import { useMemo } from 'react'
import { Image } from '@mantine/core'
import { modals } from '@/lib/modalStack'
import { useAnimeList } from '@/hooks/useAnimeList'
import { useTagMap } from '@/hooks/useTagMap'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import { useTmdbDetail } from '@/hooks/useTmdb'
import { useAnimeMutation } from '@/hooks/useAnimeMutation'
import type { AnimeRecord } from '@/types/anime'
import { getDisplayTitle, sortTags } from '@/lib/animeUtils'
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
  const { data: prefs } = useUserPreferences()
  const { updateMutation } = useAnimeMutation()

  const anime = useMemo(
    () => animeList?.find((a) => a.id === animeId),
    [animeList, animeId],
  )

  const loading = listLoading || (!anime && !animeList)

  const tmdbType = anime?.tmdbMediaType ? anime.tmdbMediaType : null
  const tmdbId = anime?.tmdbId ?? null
  const { data: tmdbDetail } = useTmdbDetail(tmdbType, tmdbId)

  const posterUrl = tmdbDetail?.poster_path ?? null
  const posterUrlFull = tmdbDetail?.posterOriginal ?? null

  const tags = useMemo(() => {
    if (!anime?.tags) return []
    return sortTags(
      anime.tags.map((id) => tagMap.get(id)).filter((t): t is NonNullable<typeof t> => !!t),
    )
  }, [anime?.tags, tagMap])

  const actionButtons = prefs?.actionButtons ?? []
  const showBuiltInActions = prefs?.uiConfig?.showBuiltInActions ?? true

  const title = anime ? getDisplayTitle(anime) : undefined

  function handleEdit() {
    if (!anime) return
    modals.openContextModal({
      modal: 'editAnime',
      title: '編輯動畫',
      innerProps: { anime, onSaved: onJumpTo, onDeleted: onClose },
    })
  }

  function handlePosterClick() {
    if (!posterUrlFull) return
    modals.open({
      size: 'auto',
      padding: 0,
      withCloseButton: false,
      children: (
        <Image
          src={posterUrlFull}
          alt={title}
          fit="contain"
          mah="90vh"
          style={{ display: 'block' }}
          onClick={() => modals.closeAll()}
        />
      ),
    })
  }

  function handleMutate(patch: Partial<AnimeRecord>) {
    if (!anime) return
    updateMutation.mutate(
      { ...anime, ...patch },
      { onSuccess: (record) => setTimeout(() => onJumpTo?.(record.id), 1000) },
    )
  }

  return (
    <InfoCard
      anime={anime}
      tags={tags}
      loading={loading}
      posterUrl={posterUrl}
      posterUrlFull={posterUrlFull}
      hasTmdbId={Boolean(tmdbId)}
      onClose={onClose}
      onEdit={handleEdit}
      onPosterClick={handlePosterClick}
      onJumpTo={onJumpTo}
      actionButtons={actionButtons}
      tagMap={tagMap}
      showBuiltInActions={showBuiltInActions}
    >
      <InfoCard.CloseButton />
      <InfoCard.Poster />
      <InfoCard.Content>
        <InfoCard.EditButton />
        <InfoCard.TmdbButton />
        <InfoCard.Title />
        <InfoCard.Status />
        <InfoCard.Tags />
        <InfoCard.Rating />
        <InfoCard.DateTime />
        <InfoCard.TextSection label="心得" contentKey="comment" />
        <InfoCard.TextSection label="備註" contentKey="remark" />
        <InfoCard.RelatedSeasons />
      </InfoCard.Content>
      <InfoCard.QuickActions onMutate={handleMutate} />
    </InfoCard>
  )
}
