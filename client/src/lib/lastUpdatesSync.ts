import type { LastUpdateRecord } from '@/types/lastUpdate'

/**
 * Collections whose change stamp differs between what the server just reported and the
 * baseline the client already had — i.e. the changes the client may have missed while its
 * realtime socket was down.
 *
 * Only collections the server reports are considered: a collection missing from `fresh` is
 * not something we can reason about (it may simply not be tracked yet).
 */
export function changedCollections(
  fresh: LastUpdateRecord[],
  cached: LastUpdateRecord[],
): string[] {
  const changed: string[] = []

  for (const record of fresh) {
    const known = cached.find((c) => c.collection === record.collection)
    if (known?.lastUpdated === record.lastUpdated) continue
    changed.push(record.collection)
  }

  return changed
}
