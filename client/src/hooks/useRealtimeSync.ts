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
import { useLastUpdate } from './useLastUpdate'

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
 * timestamps. For each collection whose timestamp differs from the cached one, the
 * corresponding query is invalidated (this also covers hard-deletes, which produce no
 * realtime record event).
 *
 * Query keys use the PocketBase collection name directly so no mapping is needed.
 */
function useStaleDetectionSync() {
  const queryClient = useQueryClient()
  const userId = pb.authStore.record?.id

  // Fetch last update data and cache it
  useLastUpdate()

  useEffect(() => {
    // Re-entrancy guard: the triggers below can fire together (e.g. `online` and
    // PB_CONNECT on a reconnect), and one comparison is enough for both.
    let revalidating = false

    const revalidateStaleCollections = async () => {
      if (revalidating) return
      revalidating = true
      try {
        console.debug(
          'useStaleDetectionSync: Revalidating cached collections...',
        )

        const freshLastUpdates = await pb
          .collection<LastUpdateRecord>(Collections.LastUpdates)
          .getFullList({ fields: 'collection,lastUpdated' })

        const cachedLastUpdates =
          queryClient.getQueryData<LastUpdateRecord[]>([
            Collections.LastUpdates,
            userId,
          ]) ?? []

        if (cachedLastUpdates.length > 0) {
          // Advance the cached timestamps to what we have just seen, keeping the
          // fields the comparison request does not ask for.
          queryClient.setQueryData<LastUpdateRecord[]>(
            [Collections.LastUpdates, userId],
            (old = []) =>
              old.map((cached) => {
                const fresh = freshLastUpdates.find(
                  (f) => f.collection === cached.collection,
                )
                return fresh
                  ? { ...cached, lastUpdated: fresh.lastUpdated }
                  : cached
              }),
          )
        }

        for (const fresh of freshLastUpdates) {
          const cached = cachedLastUpdates.find(
            (c) => c.collection === fresh.collection,
          )
          // Nothing cached to compare against (PB_CONNECT can beat the first
          // lastUpdates fetch, and a new session clears the cache): treat every
          // collection as possibly stale instead of skipping detection entirely.
          if (cached?.lastUpdated === fresh.lastUpdated) continue

          console.debug(
            `useStaleDetectionSync: Stale cache for "${fresh.collection}", invalidating query...`,
          )
          queryClient.invalidateQueries({
            queryKey: [fresh.collection, userId],
          })
        }

        if (cachedLastUpdates.length === 0) {
          // The list itself was never cached, so (re)load it — it is the baseline
          // every later comparison needs.
          queryClient.invalidateQueries({
            queryKey: [Collections.LastUpdates, userId],
          })
        }
      } catch (err) {
        // Offline or a transient failure — the next trigger tries again.
        console.warn('useStaleDetectionSync: Failed to revalidate:', err)
      } finally {
        revalidating = false
      }
    }

    const unsub = pb.realtime.subscribe('PB_CONNECT', () => {
      console.debug('useStaleDetectionSync: PB_CONNECT event received')
      void revalidateStaleCollections()
    })

    // Resuming the app is also a revalidation point: the socket is not guaranteed to
    // have survived a lock screen or a bfcache freeze, and PocketBase does not log
    // successful SSE connections, so a dead socket is invisible otherwise.
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void revalidateStaleCollections()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) void revalidateStaleCollections()
    }
    window.addEventListener('pageshow', handlePageShow)

    const handleOnline = () => void revalidateStaleCollections()
    window.addEventListener('online', handleOnline)

    return () => {
      unsub.then((fn) => fn())
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('pageshow', handlePageShow)
      window.removeEventListener('online', handleOnline)
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
