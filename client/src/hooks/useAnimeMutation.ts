import { pb, Collections } from "@/lib/pb";
import { useMutation } from "@tanstack/react-query";
import type { AnimeRecord } from "@/types/anime";
import { showErrorNotification } from "@/lib/notifications";

// PocketBase internals excluded explicitly (RecordModel has an index signature that
// makes keyof RecordModel resolve to `string`, which would wipe the entire type).
type PbInternals = 'collectionId' | 'collectionName' | 'created' | 'updated' | 'expand'

// Excludes PocketBase internals and userId (injected by hook).
// id is kept so callers can optionally specify a custom record id on create.
// createdOverride is a virtual field accepted by the server hook to override the created timestamp.
export type AnimeCreateInput = Omit<AnimeRecord, PbInternals | 'userId'> & {
  createdOverride?: string
}
export type AnimeUpdateInput = Omit<AnimeRecord, PbInternals | 'userId'> & { id: string }
export type AnimeDeleteInput = { id: string }

/** Minimal payload for quick-creating a record straight from a TMDB search result. */
export type TmdbQuickCreateInput = {
  tmdbId: number
  tmdbMediaType: 'tv' | 'movie'
  tmdbSeasonNumber?: number
}

export function useAnimeMutation() {
  const userId = pb.authStore.record?.id
  if (!userId) {
    console.warn('useAnimeMutation() hook is called without authenticated user. Mutation will likely fail.')
  }
  const createMutation = useMutation({
    mutationFn: (anime: AnimeCreateInput) => pb.collection(Collections.Animes).create({ ...anime, userId }),
    onError: showErrorNotification,
  })

  const updateMutation = useMutation({
    mutationFn: (anime: AnimeUpdateInput) => pb.collection(Collections.Animes).update(anime.id, anime),
    onError: showErrorNotification,
  })

  const deleteMutation = useMutation({
    mutationFn: (input: AnimeDeleteInput) => pb.collection(Collections.Animes).delete(input.id),
    onError: showErrorNotification,
  })

  return { createMutation, updateMutation, deleteMutation }
}