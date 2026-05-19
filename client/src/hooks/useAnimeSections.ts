import { useMemo } from 'react'
import { useAnimeList } from './useAnimeList'
import type { AnimeRecord, AnimeSection, SectionDef, SortableField } from '@/types/anime'
import { evaluateFilter } from '@/lib/filterEngine'

function sortItems(
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

export function useAnimeSections(sectionDefs: SectionDef[]) {
  const { data, ...rest } = useAnimeList()

  const sections = useMemo<AnimeSection[]>(() => {
    if (!data) return []

    const claimed = new Set<string>()
    const result: AnimeSection[] = []

    for (const def of sectionDefs) {
      const items = data.filter((item) => {
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

    // "Other" catch-all — only shown when records remain unclaimed
    const unclaimed = data.filter((item) => !claimed.has(item.id))
    if (unclaimed.length > 0) {
      result.push({
        key: '__other__',
        label: '未分類',
        items: sortItems(unclaimed, 'updated', 'desc'),
      })
    }

    return result
  }, [data, sectionDefs])

  return { sections, ...rest }
}
