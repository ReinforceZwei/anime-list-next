import { createFileRoute } from '@tanstack/react-router'
import { useAnimeSections } from '@/hooks/useAnimeSections'
import type { SectionDef } from '@/types/anime'
import { Button } from '@mantine/core'
import { modals } from '@mantine/modals'

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
      <Button onClick={openTmdbModal}>Search TMDb</Button>
      {sections.map(section => (
        <div key={section.key}>
          <h2>{section.label}</h2>
          {section.items.map(anime => (
            <div key={anime.id}>
              {anime.customName || anime.cachedTitle || anime.tmdbId}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
