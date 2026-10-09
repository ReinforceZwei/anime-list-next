import type { LastUpdateRecord } from '@/types/lastUpdate'

/**
 * Collections whose change stamp differs between the server view we have just received and
 * the one we had before it — i.e. the changes this client has not accounted for yet.
 *
 * Reports nothing when either side is missing. Before the first fetch there is no previous
 * view to compare against, and the collections are being fetched by their own mounting
 * queries anyway, so invalidating them would only cancel and restart those fetches.
 *
 * Only collections the server currently reports are considered: one that exists only in
 * `previous` is not something we can reason about (it may simply not be tracked any more).
 */
export function changedCollections(
  current: readonly LastUpdateRecord[] | undefined,
  previous: readonly LastUpdateRecord[] | undefined,
): string[] {
  if (!current || !previous) return []

  const changed: string[] = []

  for (const record of current) {
    const known = previous.find((p) => p.collection === record.collection)
    if (known?.lastUpdated === record.lastUpdated) continue
    changed.push(record.collection)
  }

  return changed
}
