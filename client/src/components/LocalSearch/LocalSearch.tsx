import { useState, useRef, useEffect, useMemo } from 'react'
import { ActionIcon, Paper, TextInput, ScrollArea, UnstyledButton, Text, Stack } from '@mantine/core'
import { IconSearch, IconX } from '@tabler/icons-react'
import { useAnimeList } from '@/hooks/useAnimeList'
import classes from './LocalSearch.module.css'

interface LocalSearchProps {
  jumpTo: (id: string) => void
}

export function LocalSearch({ jumpTo }: LocalSearchProps) {
  const [opened, setOpened] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { data: animeList } = useAnimeList()

  useEffect(() => {
    if (opened) {
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [opened])

  useEffect(() => {
    if (!opened) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpened(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [opened])

  const results = useMemo(() => {
    if (!query.trim() || !animeList) return []
    const q = query.trim().toLowerCase()
    return animeList.filter(
      (anime) =>
        anime.cachedTitle?.toLowerCase().includes(q) ||
        anime.cachedSeasonName?.toLowerCase().includes(q) ||
        anime.customName?.toLowerCase().includes(q),
    )
  }, [query, animeList])

  return (
    <div className={classes.container}>
      <ActionIcon
        variant="white"
        size="lg"
        radius="lg"
        onClick={() => setOpened((o) => !o)}
        aria-label="Search anime"
      >
        <IconSearch size={18} />
      </ActionIcon>
      {opened && (
        <Paper shadow="xl" withBorder className={classes.panel}>
          <TextInput
            ref={inputRef}
            placeholder="Search by title..."
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            rightSection={
              query ? (
                <ActionIcon
                  variant="transparent"
                  color="gray"
                  size="sm"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                >
                  <IconX size={14} />
                </ActionIcon>
              ) : null
            }
          />
          {results.length > 0 && (
            <ScrollArea.Autosize mah={320} mt="xs">
              <Stack gap={0}>
                {results.map((anime) => {
                  const primary = anime.customName || anime.cachedTitle || '(Untitled)'
                  const secondary =
                    anime.cachedSeasonName && anime.cachedSeasonName !== primary
                      ? anime.cachedSeasonName
                      : null
                  return (
                    <UnstyledButton
                      key={anime.id}
                      className={classes.resultItem}
                      onClick={() => jumpTo(anime.id)}
                    >
                      <Text size="sm" lh={1.3}>
                        {primary}
                      </Text>
                      {secondary && (
                        <Text size="xs" c="dimmed" lh={1.2}>
                          {secondary}
                        </Text>
                      )}
                    </UnstyledButton>
                  )
                })}
              </Stack>
            </ScrollArea.Autosize>
          )}
          {query.trim() && results.length === 0 && (
            <Text size="sm" c="dimmed" mt="xs" ta="center">
              No results
            </Text>
          )}
        </Paper>
      )}
    </div>
  )
}
