import { useMemo } from 'react'
import type { TagRecord } from '@/types/anime'
import { useTagList } from './useTagList'

/**
 * Derives a tag lookup map from the already-cached tag list.
 * No extra network call — the list is kept live by the realtime subscription.
 *
 * Soft-deleted records (deleted field set) are excluded.
 */
export function useTagMap(): Map<string, TagRecord> {
  const { data: list } = useTagList()

  return useMemo(() => {
    const map = new Map<string, TagRecord>()
    for (const record of list ?? []) {
      if (record.deleted) continue
      map.set(record.id, record)
    }
    return map
  }, [list])
}
