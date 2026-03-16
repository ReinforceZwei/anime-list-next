import { pb, Collections } from "@/lib/pb";
import type { AnimeRecord, TagRecord } from "@/types/anime";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { RecordModel } from "pocketbase";

function useCollectionRealtimeSync<T extends RecordModel>(
  collection: string,
  queryKey: unknown[],
) {
  const queryClient = useQueryClient()

  useEffect(() => {
    console.debug(`useCollectionRealtimeSync(${collection}): Subscribing...`)
    const unsub = pb.collection(collection).subscribe<T>('*', (data) => {
      console.debug(`useCollectionRealtimeSync(${collection}): Realtime event received:`, data)
      switch (data.action) {
        case 'create':
          queryClient.setQueryData(queryKey, (old: T[]) => [...old, data.record]);
          break;
        case 'update':
          queryClient.setQueryData(queryKey, (old: T[]) => old.map(item => item.id === data.record.id ? data.record : item));
          break;
        case 'delete':
          queryClient.setQueryData(queryKey, (old: T[]) => old.filter(item => item.id !== data.record.id));
          break;
        default:
          console.warn(`useCollectionRealtimeSync(${collection}): Unknown action from realtime subscription:`, data.action);
          break;
      }
    });

    const unsub2 = pb.realtime.subscribe('PB_CONNECT', async (data) => {
      console.debug(`useCollectionRealtimeSync(${collection}): PB_CONNECT event received:`, data)
      const cached = queryClient.getQueryData<T[]>(queryKey)
      if (!cached?.length) return

      const latestCachedUpdated = cached.reduce((max, item) =>
        item.updated > max ? item.updated : max, cached[0].updated)

      const result = await pb.collection<T>(collection).getList(1, 1, { sort: '-updated', fields: 'updated' })
      const latestPbUpdated = result.items[0]?.updated

      if (latestPbUpdated && latestPbUpdated !== latestCachedUpdated) {
        console.debug(`useCollectionRealtimeSync(${collection}): PB_CONNECT detected stale cache, invalidating query...`)
        queryClient.invalidateQueries({ queryKey })
      }
    })

    return () => {
      console.debug(`useCollectionRealtimeSync(${collection}): Unsubscribing...`)
      unsub.then(fn => fn());
      unsub2.then(fn => fn());
    }
  // queryKey is an array — JSON-serialize it so the effect only re-runs when its contents change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection, JSON.stringify(queryKey)]);
}

export function useAnimeRealtimeSync() {
  const userId = pb.authStore.record?.id
  useCollectionRealtimeSync<AnimeRecord>(Collections.Animes, ['anime', userId])
}

export function useTagRealtimeSync() {
  const userId = pb.authStore.record?.id
  useCollectionRealtimeSync<TagRecord>(Collections.Tags, ['tags', userId])
}
