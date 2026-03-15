import { useEffect, useMemo, useState } from 'react'
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Center,
  Divider,
  Group,
  Image,
  Loader,
  ScrollArea,
  Spoiler,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  UnstyledButton,
} from '@mantine/core'
import { useDebouncedValue, useMediaQuery } from '@mantine/hooks'
import { IconArrowLeft, IconCheck, IconPlus, IconSearch } from '@tabler/icons-react'
import type { ContextModalProps } from '@mantine/modals'
import { useTmdbSearch, useTmdbDetail } from '@/hooks/useTmdb'
import { useAnimeExistsMap } from '@/hooks/useAnimeExistsMap'
import { useAnimeMutation } from '@/hooks/useAnimeMutation'
import type { TmdbSearchItem } from '@/types/tmdb'

const PANEL_H = 520

function ExistsBadge() {
  return (
    <Group gap={4} align="center">
      <ThemeIcon size="xs" radius="xl" color="teal" variant="light">
        <IconCheck size={10} />
      </ThemeIcon>
      <Text size="xs" c="teal" fw={500}>Added</Text>
    </Group>
  )
}

export function TmdbSearchModal(_props: ContextModalProps) {
  const [query, setQuery] = useState('')
  const [debounced] = useDebouncedValue(query, 400)
  const [selected, setSelected] = useState<TmdbSearchItem | null>(null)
  const [mobileView, setMobileView] = useState<'search' | 'detail'>('search')

  const isMobile = useMediaQuery('(max-width: 780px)')

  const exists = useAnimeExistsMap()
  const { createMutation } = useAnimeMutation()
  const { data: results, isFetching } = useTmdbSearch(debounced)
  const { data: detail, isFetching: detailFetching } = useTmdbDetail(
    selected?.mediaType ?? null,
    selected?.id ?? null,
  )

  const movieExists = useMemo(
    () => detail?.mediaType === 'movie' ? exists('movie', detail.id) : false,
    [detail, exists],
  )

  const seasonExistsMap = useMemo(() => {
    if (detail?.mediaType !== 'tv' || !detail.seasons) return new Map<number, boolean>()
    return new Map(detail.seasons.map((s) => [s.seasonNumber, exists('tv', detail.id, s.seasonNumber)]))
  }, [detail, exists])

  useEffect(() => { setSelected(null); setMobileView('search') }, [debounced])
  useEffect(() => {
    if (results && results.length > 0 && !selected) setSelected(results[0])
  }, [results])

  function handleSelect(item: TmdbSearchItem) {
    setSelected(item)
    if (isMobile) setMobileView('detail')
  }

  // ── Shared panels ────────────────────────────────────────────────────────

  const searchPanel = (
    <Stack
      h="100%"
      gap="xs"
      w={isMobile ? '100%' : 280}
      pr={isMobile ? 0 : 'md'}
      style={isMobile ? {} : {
        flexShrink: 0,
        borderRight: '1px solid var(--mantine-color-default-border)',
      }}
    >
      <TextInput
        placeholder="Search movies & TV shows…"
        leftSection={<IconSearch size={14} />}
        rightSection={isFetching ? <Loader size="xs" /> : null}
        value={query}
        onChange={(e) => setQuery(e.currentTarget.value)}
        size="sm"
      />

      <ScrollArea flex={1} offsetScrollbars>
        {results?.length === 0 && (
          <Center py="lg">
            <Text size="sm" c="dimmed">No results</Text>
          </Center>
        )}
        <Stack gap={2}>
          {results?.map((item) => (
            <UnstyledButton
              key={item.id}
              onClick={() => handleSelect(item)}
              p="xs"
              style={(theme) => ({
                borderRadius: theme.radius.sm,
                backgroundColor:
                  selected?.id === item.id ? theme.colors.blue[0] : 'transparent',
              })}
            >
              <Group justify="space-between" align="flex-start" wrap="nowrap" gap="xs">
                <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                  <Text size="sm" fw={500} lineClamp={1}>{item.title}</Text>
                  {item.originalTitle && item.originalTitle !== item.title && (
                    <Text size="xs" c="dimmed" lineClamp={1}>{item.originalTitle}</Text>
                  )}
                </Stack>
                <Stack gap={4} align="flex-end" style={{ flexShrink: 0 }}>
                  <Badge size="xs" variant="light" color={item.mediaType === 'tv' ? 'blue' : 'grape'}>
                    {item.mediaType === 'tv' ? 'TV' : 'Movie'}
                  </Badge>
                  {item.year && <Text size="xs" c="dimmed">{item.year}</Text>}
                </Stack>
              </Group>
            </UnstyledButton>
          ))}
        </Stack>
      </ScrollArea>
    </Stack>
  )

  const detailPanel = (
    <Box flex={1} h="100%" pl={isMobile ? 0 : 'md'} style={{ minWidth: 0 }}>
      {!selected ? (
        <Center h="100%">
          <Text size="sm" c="dimmed">Search and select a title</Text>
        </Center>
      ) : detailFetching ? (
        <Center h="100%"><Loader /></Center>
      ) : detail ? (
        <ScrollArea h={PANEL_H} offsetScrollbars>
          {isMobile && (
            <ActionIcon variant="subtle" mb="xs" onClick={() => setMobileView('search')}>
              <IconArrowLeft size={16} />
            </ActionIcon>
          )}

          <Group align="flex-start" gap="md" wrap="nowrap">
            <Image
              src={detail.posterPath || undefined}
              fallbackSrc="https://placehold.co/100x150?text=?"
              w={140}
              radius="sm"
              style={{ flexShrink: 0 }}
            />
            <Stack gap="xs" style={{ flex: 1, minWidth: 0 }}>
              <Text fw={700} size="lg" lh={1.2}>{detail.title}</Text>
              {detail.originalTitle && detail.originalTitle !== detail.title && (
                <Text size="sm" c="dimmed">{detail.originalTitle}</Text>
              )}
              <Group gap="xs">
                <Badge variant="light" color={detail.mediaType === 'tv' ? 'blue' : 'grape'}>
                  {detail.mediaType === 'tv' ? 'TV' : 'Movie'}
                </Badge>
                {detail.year && <Text size="sm" c="dimmed">{detail.year}</Text>}
              </Group>
              {detail.overview && (
                <Spoiler maxHeight={60} showLabel="Show more" hideLabel="Show less">
                  <Text size="sm" c="dimmed">{detail.overview}</Text>
                </Spoiler>
              )}
              {detail.mediaType === 'movie' && (
                movieExists
                  ? <ExistsBadge />
                  : (
                    <Button
                      size="xs"
                      variant="light"
                      leftSection={<IconPlus size={13} />}
                      mt={4}
                      w="fit-content"
                      loading={createMutation.isPending}
                      onClick={() => createMutation.mutate({
                        tmdbId: detail.id,
                        tmdbMediaType: 'movie',
                      })}
                    >
                      Create Record
                    </Button>
                  )
              )}
            </Stack>
          </Group>

          {detail.mediaType === 'tv' && detail.seasons && (
            <>
              <Divider my="md" label="Seasons" labelPosition="left" />
              <Stack gap="xs">
                {detail.seasons.map((season) => (
                  <Group
                    key={season.seasonNumber}
                    justify="space-between"
                    wrap="nowrap"
                    px="sm"
                    py="xs"
                    style={{
                      borderRadius: 'var(--mantine-radius-sm)',
                      border: '1px solid var(--mantine-color-default-border)',
                    }}
                  >
                    <Text size="sm" fw={500} lineClamp={1} style={{ flex: 1 }}>
                      {season.name}
                    </Text>
                    <Group gap="xs" style={{ flexShrink: 0 }}>
                      <Badge size="xs" variant="outline">{season.episodeCount} eps</Badge>
                      {season.airDate && (
                        <Text size="xs" c="dimmed">{season.airDate.slice(0, 4)}</Text>
                      )}
                      {seasonExistsMap.get(season.seasonNumber)
                        ? <ExistsBadge />
                        : (
                          <Button
                            size="xs"
                            variant="light"
                            leftSection={<IconPlus size={12} />}
                            loading={
                              createMutation.isPending &&
                              createMutation.variables?.tmdbSeasonNumber === season.seasonNumber
                            }
                            disabled={createMutation.isPending}
                            onClick={() => createMutation.mutate({
                              tmdbId: detail.id,
                              tmdbMediaType: 'tv',
                              tmdbSeasonNumber: season.seasonNumber,
                            })}
                          >
                            Add
                          </Button>
                        )
                      }
                    </Group>
                  </Group>
                ))}
              </Stack>
            </>
          )}
        </ScrollArea>
      ) : null}
    </Box>
  )

  // ── Layout: stack on mobile, side-by-side on desktop ─────────────────────

  if (isMobile) {
    return (
      <Box h={PANEL_H}>
        {mobileView === 'search' ? searchPanel : detailPanel}
      </Box>
    )
  }

  return (
    <Group align="stretch" gap={0} h={PANEL_H} wrap="nowrap">
      {searchPanel}
      {detailPanel}
    </Group>
  )
}
