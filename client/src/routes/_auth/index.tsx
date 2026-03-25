import { createFileRoute } from '@tanstack/react-router'
import { useAnimeSections } from '@/hooks/useAnimeSections'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import { useScrollToRecord } from '@/hooks/useScrollToRecord'
import type { AnimeRecord, SectionDef } from '@/types/anime'
import { Affix, Button } from '@mantine/core'
import { modals } from '@mantine/modals'
import AnimePaper from '@/components/AnimePaper/AnimePaper'
import AppMenu from '@/components/AppMenu/AppMenu'
import AnimeCard from '@/components/InfoCard/AnimeCard'
import ElevatorWidget from '@/components/ElevatorWidget/ElevatorWidget'
import { LocalSearch } from '@/components/LocalSearch/LocalSearch'
import { useMemo, useRef, useState } from 'react'

export const Route = createFileRoute('/_auth/')({
  component: Index,
})

function Index() {
  const { data: prefs } = useUserPreferences()
  const sectionDefs = useMemo<SectionDef[]>(() => [
    { key: 'watching',  label: prefs?.watchingLabel  || 'Watching',  statuses: ['watching'],  sortBy: 'updated',     sortOrder: 'desc' },
    { key: 'completed', label: prefs?.completedLabel || 'Completed', statuses: ['completed'], sortBy: 'completedAt', sortOrder: 'asc' },
    { key: 'planned',   label: prefs?.plannedLabel   || 'Planned',   statuses: ['planned'],   sortBy: 'created',     sortOrder: 'asc'  },
    { key: 'dropped',   label: prefs?.droppedLabel   || 'Dropped',   statuses: ['dropped'],   sortBy: 'updated',     sortOrder: 'desc' },
  ], [prefs])

  const { sections, isLoading, isError, error } = useAnimeSections(sectionDefs)
  const [selectedAnimeId, setSelectedAnimeId] = useState<string | null>(null)
  const pageTitle = prefs?.pageTitle || 'My Anime List'
  const markerRefs = useRef<(HTMLParagraphElement | null)[]>([])
  const { getRef, jumpTo } = useScrollToRecord()

  function openTmdbModal() {
    modals.openContextModal({
      modal: 'tmdbSearch',
      title: 'Search TMDb',
      size: '56rem',
      innerProps: { onSaved: jumpTo },
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
      <Affix position={{ top: 10, left: 10 }}>
        <AppMenu />
      </Affix>
      <AnimePaper>
        <AnimePaper.Title>{pageTitle}</AnimePaper.Title>
        {sections.map((section, i) => (
          <div key={section.key}>
            <AnimePaper.Subtitle ref={el => { markerRefs.current[i] = el }}>{section.label}</AnimePaper.Subtitle>
            <AnimePaper.List>
              {section.items.map(anime => (
                <AnimePaper.Item key={anime.id} record={anime} onClick={handleAnimeClick} itemRef={getRef(anime.id)} />
              ))}
            </AnimePaper.List>
          </div>
        ))}
      </AnimePaper>
      <Affix position={{ top: 10, right: 10 }}>
        <LocalSearch jumpTo={jumpTo} />
      </Affix>
      <Affix position={{ top: 10, right: 10 }}>
        {selectedAnimeId && <AnimeCard animeId={selectedAnimeId} onClose={() => setSelectedAnimeId(null)} onJumpTo={jumpTo} />}
      </Affix>
      <Affix position={{ bottom: 10, right: 10 }}>
        <Button onClick={openTmdbModal}>Search TMDb</Button>
      </Affix>
      <ElevatorWidget markerRefs={markerRefs.current} />
    </div>
  )
}
