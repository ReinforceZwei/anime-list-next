import { pb, Collections } from "@/lib/pb";
import type { AnimeRecord } from "@/types/anime";
import { useQuery } from "@tanstack/react-query";

// Make a super large batch size to ensure we get all records
// if records more than 99999, thats another problem...
const BATCH_SIZE = 99999

export function useAnimeList() {
  const userId = pb.authStore.record?.id
  if (!userId) {
    console.warn('useAnimeList() hook is called without authenticated user. Query will likely fail.')
  }

  return useQuery({
    queryKey: [Collections.Animes, userId],
    queryFn: () => pb.collection<AnimeRecord>(Collections.Animes).getFullList({ batch: BATCH_SIZE }),
    staleTime: Infinity,
    gcTime: Infinity,
  })
}
