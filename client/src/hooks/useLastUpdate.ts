import { pb, Collections } from '@/lib/pb'
import type { LastUpdateRecord } from '@/types/lastUpdate'
import { changedCollections } from '@/lib/lastUpdatesSync'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'

/**
 * How long a fetched baseline counts as fresh. This is the floor for the *fallback*
 * revalidation only — realtime events still land instantly.
 *
 * It bounds how often resuming the app can re-check the server: the query is revalidated on
 * window focus (which is also what fires when the page is restored from the bfcache) and on
 * `online`, but only once the cached baseline is older than this, so hopping between windows
 * cannot turn into one request per switch.
 *
 * A *failed* attempt does not advance it — the baseline is only stamped when a fetch
 * succeeds, so a resume that lands before the network is back still re-checks on the next
 * trigger instead of being parked for 30s.
 */
export const LAST_UPDATES_STALE_TIME_MS = 30 * 1000

export function lastUpdatesQueryKey(userId: string | undefined) {
  return [Collections.LastUpdates, userId]
}

/**
 * Refreshes the server's change stamps and invalidates every collection the client missed
 * while its socket was down (this is also what covers hard-deletes, which produce no
 * realtime record event).
 *
 * This lives in the query function because that is the only moment the *previous* baseline
 * is still readable: the cache entry holds "the server's stamps as we last knew them", it is
 * what realtime events patch, and it is what the fetch is about to replace. The invalidations
 * are idempotent, so a retried fetch cannot do harm.
 */
export async function fetchAndReconcile(
  queryClient: QueryClient,
  userId: string | undefined,
): Promise<LastUpdateRecord[]> {
  const cached =
    queryClient.getQueryData<LastUpdateRecord[]>(lastUpdatesQueryKey(userId)) ?? []

  const fresh = await pb
    .collection<LastUpdateRecord>(Collections.LastUpdates)
    .getFullList()

  // With no baseline this is the first fetch of a session, and the collections are being
  // fetched by their own mounting queries anyway — there is nothing that can have been
  // missed yet, so invalidating them would only cancel and restart those fetches.
  const changed = cached.length > 0 ? changedCollections(fresh, cached) : []

  for (const collection of changed) {
    console.debug(
      `useLastUpdate: Stale cache for "${collection}", invalidating query...`,
    )
    queryClient.invalidateQueries({ queryKey: [collection, userId] })
  }

  return fresh
}

export function useLastUpdate() {
  const queryClient = useQueryClient()
  const userId = pb.authStore.record?.id
  if (!userId) {
    console.warn(
      'useLastUpdate() hook is called without authenticated user. Query will likely fail.',
    )
  }

  return useQuery({
    queryKey: lastUpdatesQueryKey(userId),
    queryFn: () => fetchAndReconcile(queryClient, userId),
    staleTime: LAST_UPDATES_STALE_TIME_MS,
    gcTime: Infinity,
    // Both are TanStack Query defaults; they are spelled out because they are the feature
    // this relies on. A query is only revalidated on focus/reconnect while it has an active
    // observer, so the caller has to keep the query mounted (see useStaleDetectionSync).
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}
