import {
  Anchor,
  Badge,
  Center,
  Divider,
  Group,
  Image,
  Loader,
  ScrollArea,
  SimpleGrid,
  Spoiler,
  Stack,
  Text,
} from '@mantine/core'
import type { ContextModalProps } from '@/lib/modalStack'
import { useTmdbDetail } from '@/hooks/useTmdb'
import type { TmdbTvDetailResult, TmdbMovieDetailResult } from '@/types/tmdb'

interface TmdbMetadataInnerProps extends Record<string, unknown> {
  tmdbId: number
  tmdbMediaType: 'tv' | 'movie'
  title: string
  tmdbSeasonNumber?: number
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Group gap="xs" align="flex-start">
      <Text size="sm" fw={600} w={120} style={{ flexShrink: 0 }}>
        {label}
      </Text>
      <Text size="sm" style={{ flex: 1 }}>
        {children}
      </Text>
    </Group>
  )
}

function formatRuntime(minutes: number) {
  if (!minutes) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function formatMoney(amount: number) {
  if (!amount) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
}

function TvContent({ data }: { data: TmdbTvDetailResult }) {
  return (
    <Stack gap="md">
      {/* Basic info */}
      <Stack gap={6}>
        <MetaRow label="狀態">{data.status || '—'}</MetaRow>
        <MetaRow label="類型">{data.type || '—'}</MetaRow>
        <MetaRow label="製作中">
          <Badge size="sm" color={data.in_production ? 'teal' : 'gray'} variant="light">
            {data.in_production ? '是' : '否'}
          </Badge>
        </MetaRow>
        <MetaRow label="首播日期">{data.first_air_date || '—'}</MetaRow>
        <MetaRow label="最後播出">{data.last_air_date || '—'}</MetaRow>
        <MetaRow label="季數 / 集數">
          {data.number_of_seasons} 季 / {data.number_of_episodes} 集
        </MetaRow>
        <MetaRow label="集均時長">
          {data.episode_run_time?.length ? data.episode_run_time.map(formatRuntime).join(', ') : '—'}
        </MetaRow>
        <MetaRow label="原始語言">{data.original_language?.toUpperCase() || '—'}</MetaRow>
        <MetaRow label="原產國">
          {data.origin_country?.length ? (
            <Group gap={4}>{data.origin_country.map((c) => <Badge key={c} size="sm" variant="default">{c}</Badge>)}</Group>
          ) : '—'}
        </MetaRow>
        {data.homepage && (
          <MetaRow label="官方網站">
            <Anchor href={data.homepage} target="_blank" rel="noopener noreferrer" size="sm">
              {data.homepage}
            </Anchor>
          </MetaRow>
        )}
      </Stack>

      {/* Created by */}
      {data.created_by?.length > 0 && (
        <>
          <Divider label="製作人" labelPosition="left" />
          <Group gap="xs">
            {data.created_by.map((p) => (
              <Badge key={p.id} size="sm" variant="outline">{p.name}</Badge>
            ))}
          </Group>
        </>
      )}

      {/* Networks */}
      {data.networks?.length > 0 && (
        <>
          <Divider label="播出平台" labelPosition="left" />
          <Group gap="xs">
            {data.networks.map((n) => (
              <Badge key={n.id} size="sm" variant="light">{n.name}{n.origin_country ? ` (${n.origin_country})` : ''}</Badge>
            ))}
          </Group>
        </>
      )}

      {/* Seasons */}
      {data.seasons?.length > 0 && (
        <>
          <Divider label="季別" labelPosition="left" />
          <SimpleGrid cols={1} spacing={4}>
            {data.seasons.map((s) => (
              <Group key={s.id} gap="xs" align="center">
                <Text size="sm" w={140} fw={500}>{s.name}</Text>
                <Text size="sm" c="dimmed">{s.air_date || '—'}</Text>
                <Text size="sm" c="dimmed">· {s.episode_count} 集</Text>
                {s.vote_average > 0 && (
                  <Text size="sm" c="dimmed">· ★ {s.vote_average.toFixed(1)}</Text>
                )}
              </Group>
            ))}
          </SimpleGrid>
        </>
      )}

      {/* Last episode */}
      {data.last_episode_to_air && (
        <>
          <Divider label="最近播出集" labelPosition="left" />
          <Stack gap={6}>
            <MetaRow label="集名">{data.last_episode_to_air.name || '—'}</MetaRow>
            <MetaRow label="播出日期">{data.last_episode_to_air.air_date || '—'}</MetaRow>
            <MetaRow label="第 / 集">第 {data.last_episode_to_air.season_number} 季 第 {data.last_episode_to_air.episode_number} 集</MetaRow>
            {data.last_episode_to_air.overview && (
              <MetaRow label="簡介">
                <Spoiler maxHeight={60} showLabel="更多" hideLabel="收起" style={{ flex: 1 }}>
                  {data.last_episode_to_air.overview}
                </Spoiler>
              </MetaRow>
            )}
          </Stack>
        </>
      )}

      {/* Next episode */}
      {data.next_episode_to_air && (
        <>
          <Divider label="下一播出集" labelPosition="left" />
          <Stack gap={6}>
            <MetaRow label="集名">{data.next_episode_to_air.name || '—'}</MetaRow>
            <MetaRow label="播出日期">{data.next_episode_to_air.air_date || '—'}</MetaRow>
            <MetaRow label="第 / 集">第 {data.next_episode_to_air.season_number} 季 第 {data.next_episode_to_air.episode_number} 集</MetaRow>
          </Stack>
        </>
      )}

      {/* Production */}
      {(data.production_companies?.length > 0 || data.production_countries?.length > 0) && (
        <>
          <Divider label="製作" labelPosition="left" />
          {data.production_companies?.length > 0 && (
            <MetaRow label="製作公司">
              <Group gap={4}>
                {data.production_companies.map((c) => (
                  <Badge key={c.id} size="sm" variant="default">{c.name}</Badge>
                ))}
              </Group>
            </MetaRow>
          )}
          {data.production_countries?.length > 0 && (
            <MetaRow label="製作國家">
              <Group gap={4}>
                {data.production_countries.map((c) => (
                  <Badge key={c.iso_3166_1} size="sm" variant="default">{c.name}</Badge>
                ))}
              </Group>
            </MetaRow>
          )}
        </>
      )}

      {/* Ratings */}
      <Divider label="評分" labelPosition="left" />
      <Stack gap={6}>
        <MetaRow label="TMDb 評分">★ {data.vote_average?.toFixed(1) ?? '—'} ({data.vote_count?.toLocaleString() ?? 0} 票)</MetaRow>
        <MetaRow label="熱門度">{data.popularity?.toFixed(1) ?? '—'}</MetaRow>
      </Stack>
    </Stack>
  )
}

function MovieContent({ data }: { data: TmdbMovieDetailResult }) {
  return (
    <Stack gap="md">
      {/* Basic info */}
      <Stack gap={6}>
        <MetaRow label="狀態">{data.status || '—'}</MetaRow>
        <MetaRow label="上映日期">{data.release_date || '—'}</MetaRow>
        <MetaRow label="片長">{formatRuntime(data.runtime)}</MetaRow>
        <MetaRow label="原始語言">{data.original_language?.toUpperCase() || '—'}</MetaRow>
        <MetaRow label="原產國">
          {data.origin_country?.length ? (
            <Group gap={4}>{data.origin_country.map((c) => <Badge key={c} size="sm" variant="default">{c}</Badge>)}</Group>
          ) : '—'}
        </MetaRow>
        {data.imdb_id && (
          <MetaRow label="IMDb">
            <Anchor href={`https://www.imdb.com/title/${data.imdb_id}`} target="_blank" rel="noopener noreferrer" size="sm">
              {data.imdb_id}
            </Anchor>
          </MetaRow>
        )}
        {data.homepage && (
          <MetaRow label="官方網站">
            <Anchor href={data.homepage} target="_blank" rel="noopener noreferrer" size="sm">
              {data.homepage}
            </Anchor>
          </MetaRow>
        )}
      </Stack>

      {/* Collection */}
      {data.belongs_to_collection && (
        <>
          <Divider label="系列作品" labelPosition="left" />
          <Text size="sm">{data.belongs_to_collection.name}</Text>
        </>
      )}

      {/* Box office */}
      {(data.budget > 0 || data.revenue > 0) && (
        <>
          <Divider label="票房" labelPosition="left" />
          <Stack gap={6}>
            <MetaRow label="預算">{formatMoney(data.budget)}</MetaRow>
            <MetaRow label="票房收入">{formatMoney(data.revenue)}</MetaRow>
          </Stack>
        </>
      )}

      {/* Production */}
      {(data.production_companies?.length > 0 || data.production_countries?.length > 0) && (
        <>
          <Divider label="製作" labelPosition="left" />
          {data.production_companies?.length > 0 && (
            <MetaRow label="製作公司">
              <Group gap={4}>
                {data.production_companies.map((c) => (
                  <Badge key={c.id} size="sm" variant="default">{c.name}</Badge>
                ))}
              </Group>
            </MetaRow>
          )}
          {data.production_countries?.length > 0 && (
            <MetaRow label="製作國家">
              <Group gap={4}>
                {data.production_countries.map((c) => (
                  <Badge key={c.iso_3166_1} size="sm" variant="default">{c.name}</Badge>
                ))}
              </Group>
            </MetaRow>
          )}
        </>
      )}

      {/* Languages */}
      {data.spoken_languages?.length > 0 && (
        <>
          <Divider label="語言" labelPosition="left" />
          <Group gap={4}>
            {data.spoken_languages.map((l) => (
              <Badge key={l.iso_639_1} size="sm" variant="default">{l.name}</Badge>
            ))}
          </Group>
        </>
      )}

      {/* Ratings */}
      <Divider label="評分" labelPosition="left" />
      <Stack gap={6}>
        <MetaRow label="TMDb 評分">★ {data.vote_average?.toFixed(1) ?? '—'} ({data.vote_count?.toLocaleString() ?? 0} 票)</MetaRow>
        <MetaRow label="熱門度">{data.popularity?.toFixed(1) ?? '—'}</MetaRow>
      </Stack>
    </Stack>
  )
}

export function TmdbMetadataModal({ innerProps }: ContextModalProps<TmdbMetadataInnerProps>) {
  const { tmdbId, tmdbMediaType } = innerProps

  const { data, isFetching } = useTmdbDetail(tmdbMediaType, tmdbId)

  if (isFetching) {
    return (
      <Center h={200}>
        <Loader />
      </Center>
    )
  }

  if (!data) {
    return (
      <Center h={200}>
        <Text c="dimmed">無法載入 TMDb 資料</Text>
      </Center>
    )
  }

  const posterSrc = data.poster_path || null
  const title = data.mediaType === 'tv' ? data.name : data.title
  const originalTitle = data.mediaType === 'tv' ? data.original_name : data.original_title

  return (
    <ScrollArea>
      <Stack gap="md" p={4}>
        {/* Header */}
        <Group gap="md" align="flex-start" wrap="nowrap">
          {posterSrc && (
            <Image
              src={posterSrc}
              alt={title}
              w={90}
              radius="sm"
              style={{ flexShrink: 0 }}
            />
          )}
          <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
            <Text fw={700} size="lg" style={{ lineHeight: 1.2 }}>{title}</Text>
            {originalTitle && originalTitle !== title && (
              <Text size="sm" c="dimmed">{originalTitle}</Text>
            )}
            {data.tagline && (
              <Text size="sm" fs="italic" c="dimmed">{data.tagline}</Text>
            )}
            {data.genres?.length > 0 && (
              <Group gap={4} mt={4}>
                {data.genres.map((g) => (
                  <Badge key={g.id} size="sm" variant="light">{g.name}</Badge>
                ))}
              </Group>
            )}
            <Anchor
              href={`https://www.themoviedb.org/${data.mediaType}/${data.id}`}
              target="_blank"
              rel="noopener noreferrer"
              size="xs"
              c="dimmed"
              mt={2}
            >
              themoviedb.org ↗
            </Anchor>
          </Stack>
        </Group>

        {/* Overview */}
        {data.overview && (
          <>
            <Divider label="劇情簡介" labelPosition="left" />
            <Spoiler maxHeight={80} showLabel="展開" hideLabel="收起">
              <Text size="sm">{data.overview}</Text>
            </Spoiler>
          </>
        )}

        {/* Type-specific content */}
        {data.mediaType === 'tv' ? (
          <TvContent data={data} />
        ) : (
          <MovieContent data={data} />
        )}
      </Stack>
    </ScrollArea>
  )
}
