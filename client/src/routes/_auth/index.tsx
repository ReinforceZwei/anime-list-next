import { createFileRoute } from '@tanstack/react-router'
import { useAnimeList } from '@/hooks/useAnimeList'
import { Button } from '@mantine/core'
import { modals } from '@mantine/modals'

export const Route = createFileRoute('/_auth/')({
  component: Index,
})

function Index() {
  const animes = useAnimeList()

  function openTmdbModal() {
    modals.openContextModal({
      modal: 'tmdbSearch',
      title: 'Search TMDb',
      size: '56rem',
      innerProps: {},
    })
  }

  if (animes.isLoading) {
    return <div>Loading...</div>
  }

  if (animes.isError) {
    return <div>Error: {animes.error.message}</div>
  }
  return (
    <div>
      <Button onClick={openTmdbModal}>Search TMDb</Button>
      {animes.data?.map((anime) => (
        <div key={anime.id}>
          {anime.customName || anime.cachedTitle || anime.tmdbId}
        </div>
      ))}
    </div>
  )
}
