import { pb, Collections } from '@/lib/pb'
import type {
  AnimeRecord,
  TagRecord,
  UserPreferencesRecord,
} from '@/types/anime'
import { useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import type { RecordModel } from 'pocketbase'
import type { LastUpdateRecord } from '@/types/lastUpdate'
import { lastUpdatesQueryKey, useLastUpdate } from './useLastUpdate'

/**
 * Patches a cached list in place, ignoring the event when the list has no cached data
 * yet (a realtime event can arrive before the first fetch resolves). `setQueryData`
 * treats an `undefined` updater result as "no change", so the cache is left alone —
 * caching a partial array instead would be served as fresh forever
 * (`staleTime: Infinity`).
 */
function patchCachedList<T extends RecordModel>(
  queryClient: QueryClient,
  queryKey: unknown[],
  update: (old: T[]) => T[],
) {
  queryClient.setQueryData(queryKey, (old: T[] | undefined) =>
    old ? update(old) : old,
  )
}

function useCollectionRealtimeSync<T extends RecordModel>(
  collection: string,
  queryKey: unknown[],
) {
  const queryClient = useQueryClient()

  useEffect(() => {
    console.debug(`useCollectionRealtimeSync(${collection}): Subscribing...`)
    const unsub = pb.collection(collection).subscribe<T>('*', (data) => {
      console.debug(
        `useCollectionRealtimeSync(${collection}): Realtime event received:`,
        data,
      )
      switch (data.action) {
        case 'create':
          patchCachedList<T>(queryClient, queryKey, (old) =>
            old.some((item) => item.id === data.record.id)
              ? old
              : [...old, data.record],
          )
          break
        case 'update':
          patchCachedList<T>(queryClient, queryKey, (old) =>
            old.map((item) =>
              item.id === data.record.id ? data.record : item,
            ),
          )
          break
        case 'delete':
          patchCachedList<T>(queryClient, queryKey, (old) =>
            old.filter((item) => item.id !== data.record.id),
          )
          break
        default:
          console.warn(
            `useCollectionRealtimeSync(${collection}): Unknown action from realtime subscription:`,
            data.action,
          )
          break
      }
    })

    return () => {
      console.debug(
        `useCollectionRealtimeSync(${collection}): Unsubscribing...`,
      )
      unsub.then((fn) => fn())
    }
    // queryKey is an array — JSON-serialize it so the effect only re-runs when its contents change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection, JSON.stringify(queryKey)])
}

// Variant for collections whose query caches a single record (T | null) instead of a list.
function useSingleRecordRealtimeSync<T extends RecordModel>(
  collection: string,
  queryKey: unknown[],
) {
  const queryClient = useQueryClient()

  useEffect(() => {
    console.debug(`useSingleRecordRealtimeSync(${collection}): Subscribing...`)
    const unsub = pb.collection(collection).subscribe<T>('*', (data) => {
      console.debug(
        `useSingleRecordRealtimeSync(${collection}): Realtime event received:`,
        data,
      )
      switch (data.action) {
        case 'create':
          queryClient.setQueryData(queryKey, data.record)
          break
        case 'update':
          queryClient.setQueryData(queryKey, (old: T | null) =>
            old?.id === data.record.id ? data.record : old,
          )
          break
        case 'delete':
          queryClient.setQueryData(queryKey, null)
          break
        default:
          console.warn(
            `useSingleRecordRealtimeSync(${collection}): Unknown action from realtime subscription:`,
            data.action,
          )
          break
      }
    })

    return () => {
      console.debug(
        `useSingleRecordRealtimeSync(${collection}): Unsubscribing...`,
      )
      unsub.then((fn) => fn())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection, JSON.stringify(queryKey)])
}

/**
 * Keeps the cached collections in sync with the server by comparing the lastUpdates
 * timestamps. *When* that comparison runs is left to TanStack Query: `useLastUpdate` holds the
 * baseline and revalidates it on window focus (which is also what fires when a page is
 * restored from the bfcache) and on `online`, throttled by its `staleTime`. The one resume
 * signal TanStack Query cannot know about is PocketBase's own realtime (re)connect, which is
 * handled here.
 *
 * Query keys use the PocketBase collection name directly so no mapping is needed.
 */
function useStaleDetectionSync() {
  const queryClient = useQueryClient()
  const userId = pb.authStore.record?.id

  // Mounting the query is what switches its revalidation on: TanStack Query only revalidates
  // a query on focus/reconnect while it has an active observer.
  useLastUpdate()

  useEffect(() => {
    // A socket that died while the app was backgrounded leaves no trace anywhere else — the
    // JS SDK only reconnects on an `error` event, and PocketBase does not log successful SSE
    // connections — so reconnecting is itself a cue to check. `stale: true` puts it behind the
    // same floor as the focus/reconnect revalidations, so a flapping socket cannot turn into a
    // burst of requests.
    const unsub = pb.realtime.subscribe('PB_CONNECT', () => {
      console.debug('useStaleDetectionSync: PB_CONNECT event received')
      void queryClient.refetchQueries({
        queryKey: lastUpdatesQueryKey(userId),
        stale: true,
      })
    })

    return () => {
      unsub.then((fn) => fn())
    }
  }, [userId, queryClient])
}

export function useAnimeRealtimeSync() {
  const userId = pb.authStore.record?.id
  useCollectionRealtimeSync<AnimeRecord>(Collections.Animes, [
    Collections.Animes,
    userId,
  ])
}

export function useTagRealtimeSync() {
  const userId = pb.authStore.record?.id
  useCollectionRealtimeSync<TagRecord>(Collections.Tags, [
    Collections.Tags,
    userId,
  ])
}

export function useLastUpdateRealtimeSync() {
  const userId = pb.authStore.record?.id
  useCollectionRealtimeSync<LastUpdateRecord>(Collections.LastUpdates, [
    Collections.LastUpdates,
    userId,
  ])
}

export function useUserPreferencesRealtimeSync() {
  const userId = pb.authStore.record?.id
  useSingleRecordRealtimeSync<UserPreferencesRecord>(
    Collections.UserPreferences,
    [Collections.UserPreferences, userId],
  )
}

export function useRealtimeSync() {
  useAnimeRealtimeSync()
  useTagRealtimeSync()
  useLastUpdateRealtimeSync()
  useUserPreferencesRealtimeSync()
  useStaleDetectionSync()
}
