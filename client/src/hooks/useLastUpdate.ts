import { pb, Collections } from '@/lib/pb'
import type { LastUpdateRecord } from '@/types/lastUpdate'
import { useQuery } from '@tanstack/react-query'

/**
 * How long the fetched stamps count as fresh. This is the floor for the *fallback*
 * revalidation only — realtime events still land instantly.
 *
 * It bounds how often resuming the app can re-check the server: the query is revalidated on
 * window focus (which is also what fires when the page is restored from the bfcache) and on
 * `online`, but only once the data is older than this, so hopping between windows cannot turn
 * into one request per switch. A *failed* fetch does not advance it — `dataUpdatedAt` only
 * moves on success, so a resume that lands before the network is back re-checks on the next
 * trigger instead of being parked for the whole window.
 */
export const LAST_UPDATES_STALE_TIME_MS = 30 * 1000

export function lastUpdatesQueryKey(userId: string | undefined) {
  return [Collections.LastUpdates, userId]
}

/**
 * The server's per-collection change stamps. A pure query: it only fetches. Deciding what
 * those stamps mean belongs to `useStaleDetectionSync`, which compares one render's stamps
 * against the previous render's.
 */
export function useLastUpdate() {
  const userId = pb.authStore.record?.id
  if (!userId) {
    console.warn(
      'useLastUpdate() hook is called without authenticated user. Query will likely fail.',
    )
  }

  return useQuery({
    queryKey: lastUpdatesQueryKey(userId),
    queryFn: () =>
      pb.collection<LastUpdateRecord>(Collections.LastUpdates).getFullList(),
    staleTime: LAST_UPDATES_STALE_TIME_MS,
    gcTime: Infinity,
    // Both are TanStack Query defaults; they are spelled out because they are the feature
    // this relies on. A query is only revalidated on focus/reconnect while it has an active
    // observer, so the caller has to keep the query mounted (see useStaleDetectionSync).
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}
