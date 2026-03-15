import { pb, Collections } from "@/lib/pb";
import type { AnimeRecord } from "@/types/anime";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useAnimeRealtimeSync() {
  const queryClient = useQueryClient()
  const userId = pb.authStore.record?.id

  useEffect(() => {
    console.debug('useAnimeRealtimeSync(): Subscribing to anime list...')
    const unsub = pb.collection(Collections.Animes).subscribe<AnimeRecord>('*', (data) => {
      console.debug('useAnimeRealtimeSync(): Realtime event received:', data)
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
          console.warn('useAnimeRealtimeSync(): Unknown action from realtime subscription:', data.action);
          break;
      }
    });
    const unsub2 = pb.realtime.subscribe('PB_CONNECT', async (data) => {
      console.debug('useAnimeRealtimeSync(): PB_CONNECT event received:', data)
      const cached = queryClient.getQueryData<AnimeRecord[]>(['anime', userId])
      if (!cached?.length) return

      const latestCachedUpdated = cached.reduce((max, item) =>
        item.updated > max ? item.updated : max, cached[0].updated)

      const result = await pb.collection<AnimeRecord>(Collections.Animes).getList(1, 1, { sort: '-updated' })
      const latestPbUpdated = result.items[0]?.updated

      if (latestPbUpdated && latestPbUpdated !== latestCachedUpdated) {
        console.debug('useAnimeRealtimeSync(): PB_CONNECT detected stale cache, invalidating query...')
        queryClient.invalidateQueries({ queryKey: ['anime', userId] })
      }
    })
    return () => {
      console.debug('useAnimeRealtimeSync(): Unsubscribing from anime list...')
      unsub.then(fn => fn());
      unsub2.then(fn => fn());
    }
  }, [userId]);
}
