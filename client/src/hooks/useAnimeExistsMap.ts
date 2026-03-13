import { useMemo } from 'react'
import { useAnimeList } from './useAnimeList'

function toKey(mediaType: 'tv' | 'movie', tmdbId: number, seasonNumber?: number) {
  return mediaType === 'tv' ? `tv-${tmdbId}-${seasonNumber}` : `movie-${tmdbId}`
}

/**
 * Derives an existence lookup function from the already-cached anime list.
 * No extra network call — the list is kept live by the realtime subscription.
 *
 * Soft-deleted records (deleted field set) are excluded.
 */
export function useAnimeExistsMap() {
  const { data: list } = useAnimeList()

  const existsSet = useMemo(() => {
    const set = new Set<string>()
    for (const record of list ?? []) {
      if (!record.tmdbId || !record.tmdbMediaType || record.deleted) continue
      set.add(toKey(record.tmdbMediaType, record.tmdbId, record.tmdbSeasonNumber))
    }
    return set
  }, [list])

  return (mediaType: 'tv' | 'movie', tmdbId: number, seasonNumber?: number) =>
    existsSet.has(toKey(mediaType, tmdbId, seasonNumber))
}
