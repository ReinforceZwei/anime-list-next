import { useState, useRef, useEffect, useMemo } from 'react'
import {
  ActionIcon,
  Collapse,
  Group,
  Indicator,
  Paper,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from '@mantine/core'
import { IconSearch, IconTag, IconX } from '@tabler/icons-react'
import { useAnimeList } from '@/hooks/useAnimeList'
import { useTagList } from '@/hooks/useTagList'
import { getDisplayTitle } from '@/lib/animeUtils'
import { TagMultiSelect } from '@/components/TagMultiSelect/TagMultiSelect'
import classes from './LocalSearch.module.css'

interface LocalSearchProps {
  jumpTo: (id: string) => void
}

export function LocalSearch({ jumpTo }: LocalSearchProps) {
  const [opened, setOpened] = useState(false)
  const [query, setQuery] = useState('')
  const [tagFilterOpen, setTagFilterOpen] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const { data: animeList } = useAnimeList()
  const { data: tagList = [] } = useTagList()

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
    const hasQuery = query.trim().length > 0
    const hasTags = selectedTags.length > 0
    if (!hasQuery && !hasTags) return []
    if (!animeList) return []
    const q = query.trim().toLowerCase()
    return animeList.filter((anime) => {
      const textMatch =
        !hasQuery ||
        anime.cachedTitle?.toLowerCase().includes(q) ||
        anime.cachedSeasonName?.toLowerCase().includes(q) ||
        anime.customName?.toLowerCase().includes(q)
      const tagMatch =
        !hasTags || selectedTags.every((tagId) => anime.tags?.includes(tagId))
      return textMatch && tagMatch
    })
  }, [query, selectedTags, animeList])

  const hasActiveFilters = query.trim().length > 0 || selectedTags.length > 0

  return (
    <div className={classes.container}>
      <ActionIcon
        variant="white"
        size="lg"
        radius="lg"
        style={(theme) => ({ boxShadow: theme.shadows.md })}
        onClick={() => setOpened((o) => !o)}
        aria-label="搜尋動畫"
      >
        <IconSearch size="1.2em" />
      </ActionIcon>
      {opened && (
        <Paper shadow="xl" withBorder className={classes.panel}>
          <Group gap="xs" wrap="nowrap">
            <TextInput
              ref={inputRef}
              style={{ flex: 1 }}
              placeholder="依標題搜尋…"
              value={query}
              onChange={(e) => setQuery(e.currentTarget.value)}
              rightSection={
                query ? (
                  <ActionIcon
                    variant="transparent"
                    color="gray"
                    size="sm"
                    onClick={() => setQuery('')}
                    aria-label="清除搜尋"
                  >
                    <IconX size="1em" />
                  </ActionIcon>
                ) : null
              }
            />
            <Indicator disabled={selectedTags.length === 0} size={8} offset={3}>
              <ActionIcon
                variant={tagFilterOpen ? 'filled' : 'subtle'}
                size="lg"
                onClick={() => setTagFilterOpen((o) => !o)}
                aria-label="依標籤篩選"
              >
                <IconTag size="1em" />
              </ActionIcon>
            </Indicator>
          </Group>
          <Collapse in={tagFilterOpen}>
            <TagMultiSelect
              data={tagList}
              value={selectedTags}
              onChange={setSelectedTags}
              placeholder="選擇標籤…"
              style={{ marginTop: 8 }}
            />
          </Collapse>
          {results.length > 0 && (
            <ScrollArea.Autosize mah={320} mt="xs">
              <Stack gap={0}>
                {results.map((anime) => (
                  <UnstyledButton
                    key={anime.id}
                    className={classes.resultItem}
                    onClick={() => jumpTo(anime.id)}
                  >
                    <Text size="sm" lh={1.3}>
                      {getDisplayTitle(anime, '（無標題）')}
                    </Text>
                  </UnstyledButton>
                ))}
              </Stack>
            </ScrollArea.Autosize>
          )}
          {hasActiveFilters && results.length === 0 && (
            <Text size="sm" c="dimmed" mt="xs" ta="center">
              沒有結果
            </Text>
          )}
        </Paper>
      )}
    </div>
  )
}
