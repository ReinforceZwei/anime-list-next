import { useEffect, useMemo, useRef, useState } from 'react'
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
  useMantineTheme,
} from '@mantine/core'
import { useDebouncedValue, useMediaQuery } from '@mantine/hooks'
import { modals as mantineModals } from '@/lib/modalStack'
import { IconArrowLeft, IconCheck, IconLink, IconPlus, IconSearch, IconX } from '@tabler/icons-react'
import type { ContextModalProps } from '@/lib/modalStack'
import { useTmdbSearch, useTmdbDetail } from '@/hooks/useTmdb'
import { useAnimeExistsMap } from '@/hooks/useAnimeExistsMap'
import { useAnimeMutation } from '@/hooks/useAnimeMutation'
import { useAnimeList } from '@/hooks/useAnimeList'
import type { TmdbSearchItem } from '@/types/tmdb'

const PANEL_H = 520

type TmdbSearchInnerProps =
  | { mode?: 'create'; onSaved?: (id: string) => void }
  | { mode: 'link'; animeId: string; initialQuery?: string; onSaved?: (id: string) => void }

function ExistsBadge() {
  return (
    <Group gap={4} align="center">
      <ThemeIcon size="xs" radius="xl" color="teal" variant="light">
        <IconCheck size="1em" />
      </ThemeIcon>
      <Text size="xs" c="teal" fw={500}>已加入</Text>
    </Group>
  )
}

export function TmdbSearchModal({ context, innerProps }: ContextModalProps<TmdbSearchInnerProps>) {
  const mode = innerProps.mode ?? 'create'
  const linkProps = mode === 'link' ? (innerProps as { mode: 'link'; animeId: string; initialQuery?: string }) : null
  const animeId = linkProps?.animeId ?? null
  const onSaved = innerProps.onSaved

  const [query, setQuery] = useState(linkProps?.initialQuery ?? '')
  const [debounced] = useDebouncedValue(query, 400)
  const [selected, setSelected] = useState<TmdbSearchItem | null>(null)
  const [mobileView, setMobileView] = useState<'search' | 'detail'>('search')
  const inputRef = useRef<HTMLInputElement>(null)

  const isMobile = useMediaQuery('(max-width: 780px)')
  const theme = useMantineTheme()
  const colors = useMemo(() => theme.variantColorResolver({
    color: theme.primaryColor,
    theme,
    variant: 'light',
  }), [theme])

  const exists = useAnimeExistsMap()
  const { createMutation, updateMutation } = useAnimeMutation()
  const { data: animeList } = useAnimeList()
  const targetAnime = useMemo(
    () => animeId ? animeList?.find((a) => a.id === animeId) : undefined,
    [animeList, animeId],
  )

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

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }, [])

  function handleLink(tmdbId: number, tmdbMediaType: 'tv' | 'movie', tmdbSeasonNumber?: number) {
    if (!targetAnime) return
    updateMutation.mutate(
      { ...targetAnime, tmdbId, tmdbMediaType, tmdbSeasonNumber },
      { onSuccess: () => context.closeAll() },
    )
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
        placeholder="搜尋電影與電視劇…"
        leftSection={<IconSearch size="1em" />}
        rightSection={
          isFetching ? <Loader size="xs" /> : query ? (
            <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => setQuery('')}>
              <IconX size="1em" />
            </ActionIcon>
          ) : null
        }
        value={query}
        onChange={(e) => setQuery(e.currentTarget.value)}
        size="sm"
        ref={inputRef}
      />

      <ScrollArea flex={1} offsetScrollbars>
        {results?.length === 0 && (
          <Center py="lg">
            <Text size="sm" c="dimmed">沒有結果</Text>
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
                  selected?.id === item.id ? colors.background : 'transparent',
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
                    {item.mediaType === 'tv' ? '電視劇' : '電影'}
                  </Badge>
                  {item.year && <Text size="xs" c="dimmed">{item.year}</Text>}
                </Stack>
              </Group>
            </UnstyledButton>
          ))}
        </Stack>
      </ScrollArea>

      {mode === 'create' && (
        <Button
          variant="subtle"
          size="xs"
          color="dimmed"
          onClick={() => mantineModals.openContextModal({
            modal: 'addAnime',
            title: '不經 TMDb 新增',
            innerProps: { onSaved },
          })}
        >
          不經 TMDb 新增
        </Button>
      )}
    </Stack>
  )

  const detailPanel = (
    <Box flex={1} h="100%" pl={isMobile ? 0 : 'md'} style={{ minWidth: 0 }}>
      {!selected ? (
        <Center h="100%">
          <Text size="sm" c="dimmed">搜尋並選擇作品</Text>
        </Center>
      ) : detailFetching ? (
        <Center h="100%"><Loader /></Center>
      ) : detail ? (
        <ScrollArea h={PANEL_H} offsetScrollbars>
          {isMobile && (
            <ActionIcon variant="subtle" mb="xs" onClick={() => setMobileView('search')}>
              <IconArrowLeft size="1em" />
            </ActionIcon>
          )}

          <Group align="flex-start" gap="md" wrap="nowrap">
            <Image
              src={detail.posterPath || undefined}
              fallbackSrc="https://placehold.co/100x150?text=?"
              w={140}
              radius="sm"
              style={{
                flexShrink: 0,
                cursor: detail.posterPath ? 'pointer' : undefined,
              }}
              onClick={detail.posterPath ? () => {
                const posterModalId = mantineModals.open({
                  size: 'auto',
                  padding: 0,
                  withCloseButton: false,
                  children: (
                    <Image
                      src={detail.posterPath!}
                      alt={detail.title}
                      fit="contain"
                      mah="90vh"
                      style={{ display: 'block' }}
                      onClick={() => mantineModals.close(posterModalId)}
                    />
                  ),
                })
              } : undefined}
            />
            <Stack gap="xs" style={{ flex: 1, minWidth: 0 }}>
              <Text fw={700} size="lg" lh={1.2}>{detail.title}</Text>
              {detail.originalTitle && detail.originalTitle !== detail.title && (
                <Text size="sm" c="dimmed">{detail.originalTitle}</Text>
              )}
              <Group gap="xs">
                <Badge variant="light" color={detail.mediaType === 'tv' ? 'blue' : 'grape'}>
                  {detail.mediaType === 'tv' ? '電視劇' : '電影'}
                </Badge>
                {detail.year && <Text size="sm" c="dimmed">{detail.year}</Text>}
              </Group>
              {detail.overview && (
                <Spoiler maxHeight={60} showLabel="顯示更多" hideLabel="顯示較少">
                  <Text size="sm" c="dimmed">{detail.overview}</Text>
                </Spoiler>
              )}
              {detail.mediaType === 'movie' && (
                mode === 'link'
                  ? (
                    <Button
                      size="xs"
                      variant="light"
                      leftSection={<IconLink size="1em" />}
                      mt={4}
                      w="fit-content"
                      loading={updateMutation.isPending}
                      disabled={!targetAnime}
                      onClick={() => handleLink(detail.id, 'movie')}
                    >
                      連結
                    </Button>
                  )
                  : movieExists
                    ? <ExistsBadge />
                    : (
                      <Button
                        size="xs"
                        variant="light"
                        leftSection={<IconPlus size="1em" />}
                        mt={4}
                        w="fit-content"
                        loading={createMutation.isPending}
                        onClick={() => createMutation.mutate(
                          { tmdbId: detail.id, tmdbMediaType: 'movie' },
                          { onSuccess: (record) => onSaved?.(record.id) },
                        )}
                      >
                        建立紀錄
                      </Button>
                    )
              )}
            </Stack>
          </Group>

          {detail.mediaType === 'tv' && detail.seasons && (
            <>
              <Divider my="md" label="分季" labelPosition="left" />
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
                      <Badge size="xs" variant="outline">{season.episodeCount} 集</Badge>
                      {season.airDate && (
                        <Text size="xs" c="dimmed">{season.airDate.slice(0, 4)}</Text>
                      )}
                      {mode === 'link'
                        ? (
                          <Button
                            size="xs"
                            variant="light"
                            leftSection={<IconLink size="1em" />}
                            loading={
                              updateMutation.isPending &&
                              updateMutation.variables?.tmdbSeasonNumber === season.seasonNumber
                            }
                            disabled={updateMutation.isPending || !targetAnime}
                            onClick={() => handleLink(detail.id, 'tv', season.seasonNumber)}
                          >
                            連結
                          </Button>
                        )
                        : seasonExistsMap.get(season.seasonNumber)
                          ? <ExistsBadge />
                          : (
                            <Button
                              size="xs"
                              variant="light"
                              leftSection={<IconPlus size="1em" />}
                              loading={
                                createMutation.isPending &&
                                createMutation.variables?.tmdbSeasonNumber === season.seasonNumber
                              }
                              disabled={createMutation.isPending}
                              onClick={() => createMutation.mutate(
                                { tmdbId: detail.id, tmdbMediaType: 'tv', tmdbSeasonNumber: season.seasonNumber },
                                { onSuccess: (record) => onSaved?.(record.id) },
                              )}
                            >
                              加入
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
