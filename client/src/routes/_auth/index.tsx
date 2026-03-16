import { createFileRoute } from '@tanstack/react-router'
import { useAnimeSections } from '@/hooks/useAnimeSections'
import type { SectionDef } from '@/types/anime'
import { Affix, Button } from '@mantine/core'
import { modals } from '@mantine/modals'
import AnimePaper from '@/components/AnimePaper/AnimePaper'
import AppMenu from '@/components/AppMenu/AppMenu'

export const Route = createFileRoute('/_auth/')({
  component: Index,
})

const SECTIONS: SectionDef[] = [
  { key: 'watching',  label: 'Watching',  statuses: ['watching'],  sortBy: 'updated',     sortOrder: 'desc' },
  { key: 'completed', label: 'Completed', statuses: ['completed'], sortBy: 'completedAt', sortOrder: 'desc' },
  { key: 'planned',   label: 'Planned',   statuses: ['planned'],   sortBy: 'created',     sortOrder: 'asc'  },
  { key: 'dropped',   label: 'Dropped',   statuses: ['dropped'],   sortBy: 'updated',     sortOrder: 'desc' },
]

function Index() {
  const { sections, isLoading, isError, error } = useAnimeSections(SECTIONS)

  function openTmdbModal() {
    modals.openContextModal({
      modal: 'tmdbSearch',
      title: 'Search TMDb',
      size: '56rem',
      innerProps: {},
    })
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
        <AnimePaper.Title>My Anime List</AnimePaper.Title>
        {sections.map(section => (
          <div key={section.key}>
            <AnimePaper.Subtitle>{section.label}</AnimePaper.Subtitle>
            <AnimePaper.List>
              {section.items.map(anime => (
                <AnimePaper.Item key={anime.id} record={anime} />
              ))}
            </AnimePaper.List>
          </div>
        ))}
      </AnimePaper>
      <Affix position={{ bottom: 20, right: 20 }}>
        <Button onClick={openTmdbModal}>Search TMDb</Button>
      </Affix>
    </div>
  )
}
