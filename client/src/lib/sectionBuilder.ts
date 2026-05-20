import type { AnimeRecord, AnimeSection, SectionDef, SortableField } from '@/types/anime'
import { evaluateFilter as evalFilter } from '@/lib/filterEngine'

/**
 * Sort anime records by a given field. Nullish values are treated as empty strings
 * and sorted to the beginning.
 */
export function sortItems(
  items: AnimeRecord[],
  sortBy: SortableField,
  sortOrder: 'asc' | 'desc',
): AnimeRecord[] {
  return [...items].sort((a, b) => {
    const aVal = a[sortBy] ?? ''
    const bVal = b[sortBy] ?? ''
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1
    return 0
  })
}

/**
 * Partition records into sections per the given definitions.
 * First-match-wins: a record claimed by an earlier section is excluded from later ones.
 * Unclaimed records are placed in an `__other__` catch-all section (sorted by updated desc).
 */
export function buildSections(
  records: AnimeRecord[],
  sectionDefs: SectionDef[],
  evaluateFilter: (filter: SectionDef['filter'], record: AnimeRecord) => boolean = evalFilter,
): AnimeSection[] {
  const claimed = new Set<string>()
  const result: AnimeSection[] = []

  for (const def of sectionDefs) {
    const items = records.filter((item) => {
      if (claimed.has(item.id)) return false
      if (!def.filter) return true
      return evaluateFilter(def.filter, item)
    })

    items.forEach((item) => claimed.add(item.id))

    result.push({
      key: def.key,
      label: def.label,
      items: sortItems(items, def.sortBy, def.sortOrder),
    })
  }

  // Catch-all for unclaimed records
  const unclaimed = records.filter((item) => !claimed.has(item.id))
  if (unclaimed.length > 0) {
    result.push({
      key: '__other__',
      label: '未分類',
      items: sortItems(unclaimed, 'updated', 'desc'),
    })
  }

  return result
}
