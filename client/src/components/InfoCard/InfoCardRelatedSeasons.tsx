import { useMemo } from 'react'
import { Button, Divider, Stack, Text } from '@mantine/core'
import { useAnimeList } from '@/hooks/useAnimeList'
import { getDisplayTitle } from '@/lib/animeUtils'
import { useInfoCard } from './InfoCardContext'

export default function InfoCardRelatedSeasons() {
  const { anime, onJumpTo } = useInfoCard()
  const { data: animeList } = useAnimeList()

  const tmdbId = anime?.tmdbId
  const animeId = anime?.id

  const relatedRecords = useMemo(() => {
    if (!tmdbId || !animeList) return []
    return animeList.filter((a) => a.tmdbId === tmdbId && a.id !== animeId)
  }, [tmdbId, animeId, animeList])

  if (!relatedRecords.length) return null

  return (
    <>
      <Divider mb="xs" />
      <Text size="xs" c="dimmed" mb={4}>
        相關季度
      </Text>
      <Stack gap={4} mb="xs">
        {relatedRecords.map((record) => (
          <Button
            key={record.id}
            variant="subtle"
            size="compact-sm"
            justify="start"
            onClick={() => onJumpTo?.(record.id)}
          >
            {getDisplayTitle(record, '未命名')}
          </Button>
        ))}
      </Stack>
    </>
  )
}
