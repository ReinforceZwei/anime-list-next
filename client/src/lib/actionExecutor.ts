import type { AnimeRecord, TagRecord } from '@/types/anime'
import type { ActionDef } from '@/types/filter'
import { getFieldDef } from '@/lib/fieldRegistry'

/**
 * Apply a single action against a record, returning a partial patch.
 * Does NOT mutate — the caller merges results.
 */
export function applySingleAction(record: AnimeRecord, action: ActionDef): Partial<AnimeRecord> {
  switch (action.type) {
    case 'setField':
      return { [action.field]: action.value }

    case 'addTag': {
      const current = record.tags ?? []
      const toAdd = action.tagIds.filter(id => !current.includes(id))
      if (toAdd.length === 0) return {}
      return { tags: [...current, ...toAdd] }
    }

    case 'removeTag': {
      const current = record.tags ?? []
      const removeSet = new Set(action.tagIds)
      const filtered = current.filter(id => !removeSet.has(id))
      if (filtered.length === current.length) return {}
      return { tags: filtered }
    }

    default:
      return {}
  }
}

/**
 * Apply a list of actions sequentially, merging all patches into one.
 * Each action operates against the original record plus previous patches,
 * so chained mutations compose correctly.
 */
export function applyActions(record: AnimeRecord, actions: ActionDef[]): Partial<AnimeRecord> {
  let merged: Partial<AnimeRecord> = {}
  let current = record
  for (const action of actions) {
    const patch = applySingleAction(current, action)
    if (Object.keys(patch).length > 0) {
      merged = deepMergePatch(merged, patch)
      current = { ...current, ...patch }
    }
  }
  return merged
}

/** Shallow-merge two patches; for tags arrays, concatenate deduplicated. */
function deepMergePatch(base: Partial<AnimeRecord>, next: Partial<AnimeRecord>): Partial<AnimeRecord> {
  const result = { ...base, ...next }
  // Merge tags arrays specially — the next patch may add or remove
  if (base.tags !== undefined || next.tags !== undefined) {
    // If next explicitly sets tags (removeTag case), it takes priority
    // since removeTag returns a fresh filtered array
    if (next.tags !== undefined) {
      result.tags = next.tags
    } else {
      result.tags = base.tags
    }
  }
  return result
}

/**
 * Returns a human-readable Chinese description of a single action.
 */
export function describeAction(action: ActionDef, tagMap?: Map<string, TagRecord>): string {
  switch (action.type) {
    case 'setField': {
      const def = getFieldDef(action.field)
      const fieldLabel = def?.label ?? action.field
      if (def?.options) {
        const opt = def.options.find(o => o.value === String(action.value))
        return `將${fieldLabel}設為「${opt?.label ?? action.value}」`
      }
      return `將${fieldLabel}設為「${action.value}」`
    }

    case 'addTag': {
      const names = action.tagIds.map(id => tagMap?.get(id)?.name ?? id)
      return `加入標籤「${names.join('、')}」`
    }

    case 'removeTag': {
      const names = action.tagIds.map(id => tagMap?.get(id)?.name ?? id)
      return `移除標籤「${names.join('、')}」`
    }

    default:
      return '未知動作'
  }
}

/**
 * Returns a human-readable Chinese description of a list of actions.
 * Used in the confirmation dialog and editor summary.
 */
export function describeActions(actions: ActionDef[], tagMap?: Map<string, TagRecord>): string {
  if (actions.length === 0) return '(無動作)'
  return actions.map(a => describeAction(a, tagMap)).join('，然後')
}
