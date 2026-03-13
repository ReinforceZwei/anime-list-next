import { useEffect, useState } from 'react'
import {
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
  UnstyledButton,
} from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { IconPlus, IconSearch } from '@tabler/icons-react'
import type { ContextModalProps } from '@mantine/modals'
import { useTmdbSearch, useTmdbDetail } from '@/hooks/useTmdb'
import type { TmdbSearchItem } from '@/types/tmdb'

const PANEL_H = 520

export function TmdbSearchModal(props: ContextModalProps) {
  const [query, setQuery] = useState('')
  const [debounced] = useDebouncedValue(query, 400)
  const [selected, setSelected] = useState<TmdbSearchItem | null>(null)

  const { data: results, isFetching } = useTmdbSearch(debounced)
  const { data: detail, isFetching: detailFetching } = useTmdbDetail(
    selected?.mediaType ?? null,
    selected?.id ?? null,
  )

  // Reset selection when query changes, then auto-select first result
  useEffect(() => { setSelected(null) }, [debounced])
  useEffect(() => {
    if (results && results.length > 0 && !selected) setSelected(results[0])
  }, [results])

  return (
    <Group align="stretch" gap={0} h={PANEL_H} wrap="nowrap">

      {/* ── LEFT: search + list ── */}
      <Stack
        w={280}
        style={{ flexShrink: 0, borderRight: '1px solid var(--mantine-color-default-border)' }}
        gap="xs"
        pr="md"
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
                onClick={() => setSelected(item)}
                p="xs"
                style={(theme) => ({
                  borderRadius: theme.radius.sm,
                  backgroundColor:
                    selected?.id === item.id
                      ? theme.colors.blue[0]
                      : 'transparent',
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
                    <Badge
                      size="xs"
                      variant="light"
                      color={item.mediaType === 'tv' ? 'blue' : 'grape'}
                    >
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

      {/* ── RIGHT: details ── */}
      <Box flex={1} pl="md" style={{ minWidth: 0 }}>
        {!selected ? (
          <Center h="100%">
            <Text size="sm" c="dimmed">Search and select a title</Text>
          </Center>
        ) : detailFetching ? (
          <Center h="100%"><Loader /></Center>
        ) : detail ? (
          <ScrollArea h={PANEL_H} offsetScrollbars>
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
                  <Button
                    size="xs"
                    variant="light"
                    leftSection={<IconPlus size={13} />}
                    mt={4}
                    w="fit-content"
                  >
                    Create Record
                  </Button>
                )}
              </Stack>
            </Group>

            {/* Seasons — TV only */}
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
                      style={(theme) => ({
                        borderRadius: theme.radius.sm,
                        border: `1px solid var(--mantine-color-default-border)`,
                      })}
                    >
                      <Text size="sm" fw={500} lineClamp={1} style={{ flex: 1 }}>
                        {season.name}
                      </Text>
                      <Group gap="xs" style={{ flexShrink: 0 }}>
                        <Badge size="xs" variant="outline">{season.episodeCount} eps</Badge>
                        {season.airDate && (
                          <Text size="xs" c="dimmed">{season.airDate.slice(0, 4)}</Text>
                        )}
                        <Button size="xs" variant="light" leftSection={<IconPlus size={12} />}>
                          Add
                        </Button>
                      </Group>
                    </Group>
                  ))}
                </Stack>
              </>
            )}
          </ScrollArea>
        ) : null}
      </Box>
    </Group>
  )
}
