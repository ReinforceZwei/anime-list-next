import { useMemo } from 'react'
import { useAnimeList } from './useAnimeList'
import type { AnimeRecord, AnimeSection, SectionDef, SortableField } from '@/types/anime'

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
    return sectionDefs.map(def => ({
      key: def.key,
      label: def.label,
      items: sortItems(
        data.filter(item => def.statuses.includes(item.status ?? '')),
        def.sortBy,
        def.sortOrder ?? 'desc',
      ),
    }))
  }, [data, sectionDefs])

  return { sections, ...rest }
}
