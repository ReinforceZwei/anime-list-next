import { useMemo } from 'react'
import { useAnimeList } from './useAnimeList'
import type { AnimeSection, SectionDef } from '@/types/anime'
import { buildSections } from '@/lib/sectionBuilder'

export function useAnimeSections(sectionDefs: SectionDef[]) {
  const { data, ...rest } = useAnimeList()

  const sections = useMemo<AnimeSection[]>(
    () => (data ? buildSections(data, sectionDefs) : []),
    [data, sectionDefs],
  )

  return { sections, ...rest }
}
