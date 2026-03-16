import { pb, Collections } from "@/lib/pb";
import type { AnimeRecord, TagRecord } from "@/types/anime";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { RecordModel } from "pocketbase";
import type { LastUpdateRecord } from "@/types/lastUpdate";

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

    return () => {
      console.debug(`useCollectionRealtimeSync(${collection}): Unsubscribing...`)
      unsub.then(fn => fn());
    }
  // queryKey is an array — JSON-serialize it so the effect only re-runs when its contents change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection, JSON.stringify(queryKey)]);
}

/**
 * Subscribes to PB_CONNECT and uses the lastUpdates collection to detect
 * stale cached data after a reconnection (including hard-deletes).
 * For each collection whose lastUpdated timestamp differs from the cache,
 * the corresponding query is invalidated.
 *
 * Query keys use the PocketBase collection name directly so no mapping is needed.
 */
function useStaleDetectionSync() {
  const queryClient = useQueryClient()
  const userId = pb.authStore.record?.id

  useEffect(() => {
    const unsub = pb.realtime.subscribe('PB_CONNECT', async (data) => {
      console.debug('useStaleDetectionSync: PB_CONNECT event received:', data)

      const cachedLastUpdates = queryClient.getQueryData<LastUpdateRecord[]>([Collections.LastUpdates, userId])
      if (!cachedLastUpdates?.length) return

      const freshLastUpdates = await pb
        .collection<LastUpdateRecord>(Collections.LastUpdates)
        .getFullList({ fields: 'collection,lastUpdated' })

      queryClient.setQueryData([Collections.LastUpdates, userId], (old: LastUpdateRecord[]) =>
        old.map(cached => {
          const fresh = freshLastUpdates.find(f => f.collection === cached.collection)
          return fresh ? { ...cached, lastUpdated: fresh.lastUpdated } : cached
        })
      )

      for (const fresh of freshLastUpdates) {
        const cached = cachedLastUpdates.find(c => c.collection === fresh.collection)
        if (cached?.lastUpdated === fresh.lastUpdated) continue

        console.debug(`useStaleDetectionSync: Stale cache for "${fresh.collection}", invalidating query...`)
        queryClient.invalidateQueries({ queryKey: [fresh.collection, userId] })
      }
    })

    return () => { unsub.then(fn => fn()) }
  }, [userId])
}

export function useAnimeRealtimeSync() {
  const userId = pb.authStore.record?.id
  useCollectionRealtimeSync<AnimeRecord>(Collections.Animes, [Collections.Animes, userId])
}

export function useTagRealtimeSync() {
  const userId = pb.authStore.record?.id
  useCollectionRealtimeSync<TagRecord>(Collections.Tags, [Collections.Tags, userId])
}

export function useLastUpdateRealtimeSync() {
  const userId = pb.authStore.record?.id
  useCollectionRealtimeSync<LastUpdateRecord>(Collections.LastUpdates, [Collections.LastUpdates, userId])
}

export function useRealtimeSync() {
  useAnimeRealtimeSync()
  useTagRealtimeSync()
  useLastUpdateRealtimeSync()
  useStaleDetectionSync()
}