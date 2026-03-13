import { pb, Collections } from "@/lib/pb";
import type { AnimeRecord } from "@/types/anime";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

// Make a super large batch size to ensure we get all records
// if records more than 99999, thats another problem...
const BATCH_SIZE = 99999

export function useAnimeList() {
  const queryClient = useQueryClient()
  const userId = pb.authStore.record?.id
  if (!userId) {
    console.warn('useAnimeList() hook is called without authenticated user. Query will likely fail.')
  }
  useEffect(() => {
    const unsub = pb.collection(Collections.Animes).subscribe<AnimeRecord>('*', (data) => {
      switch (data.action) {
        case 'create':
          queryClient.setQueryData(['anime', userId], (old: AnimeRecord[]) => [...old, data.record]);
          break;
        case 'update':
          queryClient.setQueryData(['anime', userId], (old: AnimeRecord[]) => old.map(item => item.id === data.record.id ? data.record : item));
          break;
        case 'delete':
          queryClient.setQueryData(['anime', userId], (old: AnimeRecord[]) => old.filter(item => item.id !== data.record.id));
          break;
        default:
          console.warn('useAnimeList(): Unknown action from realtime subscription:', data.action);
          break;
      }
    });
    // unsub is not yet resolved
    return () => { unsub.then(fn => fn()); };
  }, [userId]);

  return useQuery({
    queryKey: ['anime', userId],
    queryFn: () => pb.collection(Collections.Animes).getFullList({ batch: BATCH_SIZE }),
    staleTime: Infinity,
    gcTime: Infinity,
  })
}