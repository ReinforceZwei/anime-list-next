import { createFileRoute } from '@tanstack/react-router'
import { useAnimeSections } from '@/hooks/useAnimeSections'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import type { AnimeRecord, SectionDef } from '@/types/anime'
import { Affix, Button } from '@mantine/core'
import { modals } from '@mantine/modals'
import AnimePaper from '@/components/AnimePaper/AnimePaper'
import AppMenu from '@/components/AppMenu/AppMenu'
import AnimeCard from '@/components/InfoCard/AnimeCard'
import { useMemo, useState } from 'react'

export const Route = createFileRoute('/_auth/')({
  component: Index,
})

function Index() {
  const { data: prefs } = useUserPreferences()
  const sectionDefs = useMemo<SectionDef[]>(() => [
    { key: 'watching',  label: prefs?.watchingLabel  || 'Watching',  statuses: ['watching'],  sortBy: 'updated',     sortOrder: 'desc' },
    { key: 'completed', label: prefs?.completedLabel || 'Completed', statuses: ['completed'], sortBy: 'completedAt', sortOrder: 'desc' },
    { key: 'planned',   label: prefs?.plannedLabel   || 'Planned',   statuses: ['planned'],   sortBy: 'created',     sortOrder: 'asc'  },
    { key: 'dropped',   label: prefs?.droppedLabel   || 'Dropped',   statuses: ['dropped'],   sortBy: 'updated',     sortOrder: 'desc' },
  ], [prefs])

  const { sections, isLoading, isError, error } = useAnimeSections(sectionDefs)
  const [selectedAnimeId, setSelectedAnimeId] = useState<string | null>(null)
  const pageTitle = prefs?.pageTitle || 'My Anime List'

  function openTmdbModal() {
    modals.openContextModal({
      modal: 'tmdbSearch',
      title: 'Search TMDb',
      size: '56rem',
      innerProps: {},
    })
  }

  function handleAnimeClick(anime: AnimeRecord) {
    setSelectedAnimeId(anime.id)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div>
      <AppMenu />
      <AnimePaper>
        <AnimePaper.Title>{pageTitle}</AnimePaper.Title>
        {sections.map(section => (
          <div key={section.key}>
            <AnimePaper.Subtitle>{section.label}</AnimePaper.Subtitle>
            <AnimePaper.List>
              {section.items.map(anime => (
                <AnimePaper.Item key={anime.id} record={anime} onClick={handleAnimeClick} />
              ))}
            </AnimePaper.List>
          </div>
        ))}
      </AnimePaper>
      <Affix position={{ top: 20, right: 20 }}>
        {selectedAnimeId && <AnimeCard animeId={selectedAnimeId} onClose={() => setSelectedAnimeId(null)} />}
      </Affix>
      <Affix position={{ bottom: 20, right: 20 }}>
        <Button onClick={openTmdbModal}>Search TMDb</Button>
      </Affix>
    </div>
  )
}
