import {
  Anchor,
  Badge,
  Center,
  DataList,
  Divider,
  Group,
  Image,
  Loader,
  Modal,
  ScrollArea,
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
      <DataList orientation="horizontal" size="sm" gap={6} labelWidth={120}>
        <DataList.Item>
          <DataList.ItemLabel>狀態</DataList.ItemLabel>
          <DataList.ItemValue>{data.status || '—'}</DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>類型</DataList.ItemLabel>
          <DataList.ItemValue>{data.type || '—'}</DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>製作中</DataList.ItemLabel>
          <DataList.ItemValue>
            <Badge size="sm" color={data.in_production ? 'teal' : 'gray'} variant="light">
              {data.in_production ? '是' : '否'}
            </Badge>
          </DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>首播日期</DataList.ItemLabel>
          <DataList.ItemValue>{data.first_air_date || '—'}</DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>最後播出</DataList.ItemLabel>
          <DataList.ItemValue>{data.last_air_date || '—'}</DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>季數 / 集數</DataList.ItemLabel>
          <DataList.ItemValue>
            {data.number_of_seasons} 季 / {data.number_of_episodes} 集
          </DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>集均時長</DataList.ItemLabel>
          <DataList.ItemValue>
            {data.episode_run_time?.length ? data.episode_run_time.map(formatRuntime).join(', ') : '—'}
          </DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>原始語言</DataList.ItemLabel>
          <DataList.ItemValue>{data.original_language?.toUpperCase() || '—'}</DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>原產國</DataList.ItemLabel>
          <DataList.ItemValue>
            {data.origin_country?.length ? (
              <Group gap={4}>{data.origin_country.map((c) => <Badge key={c} size="sm" variant="default">{c}</Badge>)}</Group>
            ) : '—'}
          </DataList.ItemValue>
        </DataList.Item>
        {data.homepage && (
          <DataList.Item>
            <DataList.ItemLabel>官方網站</DataList.ItemLabel>
            <DataList.ItemValue>
              <Anchor href={data.homepage} target="_blank" rel="noopener noreferrer" size="sm">
                {data.homepage}
              </Anchor>
            </DataList.ItemValue>
          </DataList.Item>
        )}
      </DataList>

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
          <DataList orientation="horizontal" size="sm" gap={6}>
            {data.seasons.map((s) => (
              <DataList.Item key={s.id}>
                <DataList.ItemLabel>{s.name}</DataList.ItemLabel>
                <DataList.ItemValue>
                  <Group gap="xs">
                    <Text size="sm" c="dimmed">{s.air_date || '—'}</Text>
                    <Text size="sm" c="dimmed">· {s.episode_count} 集</Text>
                    {s.vote_average > 0 && (
                      <Text size="sm" c="dimmed">· ★ {s.vote_average.toFixed(1)}</Text>
                    )}
                  </Group>
                </DataList.ItemValue>
              </DataList.Item>
            ))}
          </DataList>
        </>
      )}

      {/* Last episode */}
      {data.last_episode_to_air && (
        <>
          <Divider label="最近播出集" labelPosition="left" />
          <DataList orientation="horizontal" size="sm" gap={6} labelWidth={120}>
            <DataList.Item>
              <DataList.ItemLabel>集名</DataList.ItemLabel>
              <DataList.ItemValue>{data.last_episode_to_air.name || '—'}</DataList.ItemValue>
            </DataList.Item>
            <DataList.Item>
              <DataList.ItemLabel>播出日期</DataList.ItemLabel>
              <DataList.ItemValue>{data.last_episode_to_air.air_date || '—'}</DataList.ItemValue>
            </DataList.Item>
            <DataList.Item>
              <DataList.ItemLabel>第 / 集</DataList.ItemLabel>
              <DataList.ItemValue>第 {data.last_episode_to_air.season_number} 季 第 {data.last_episode_to_air.episode_number} 集</DataList.ItemValue>
            </DataList.Item>
            {data.last_episode_to_air.overview && (
              <DataList.Item>
                <DataList.ItemLabel>簡介</DataList.ItemLabel>
                <DataList.ItemValue>
                  <Spoiler maxHeight={60} showLabel="更多" hideLabel="收起" style={{ flex: 1 }}>
                    {data.last_episode_to_air.overview}
                  </Spoiler>
                </DataList.ItemValue>
              </DataList.Item>
            )}
          </DataList>
        </>
      )}

      {/* Next episode */}
      {data.next_episode_to_air && (
        <>
          <Divider label="下一播出集" labelPosition="left" />
          <DataList orientation="horizontal" size="sm" gap={6} labelWidth={120}>
            <DataList.Item>
              <DataList.ItemLabel>集名</DataList.ItemLabel>
              <DataList.ItemValue>{data.next_episode_to_air.name || '—'}</DataList.ItemValue>
            </DataList.Item>
            <DataList.Item>
              <DataList.ItemLabel>播出日期</DataList.ItemLabel>
              <DataList.ItemValue>{data.next_episode_to_air.air_date || '—'}</DataList.ItemValue>
            </DataList.Item>
            <DataList.Item>
              <DataList.ItemLabel>第 / 集</DataList.ItemLabel>
              <DataList.ItemValue>第 {data.next_episode_to_air.season_number} 季 第 {data.next_episode_to_air.episode_number} 集</DataList.ItemValue>
            </DataList.Item>
          </DataList>
        </>
      )}

      {/* Production */}
      {(data.production_companies?.length > 0 || data.production_countries?.length > 0) && (
        <>
          <Divider label="製作" labelPosition="left" />
          <DataList orientation="horizontal" size="sm" gap={6} labelWidth={120}>
            {data.production_companies?.length > 0 && (
              <DataList.Item>
                <DataList.ItemLabel>製作公司</DataList.ItemLabel>
                <DataList.ItemValue>
                  <Group gap={4}>
                    {data.production_companies.map((c) => (
                      <Badge key={c.id} size="sm" variant="default">{c.name}</Badge>
                    ))}
                  </Group>
                </DataList.ItemValue>
              </DataList.Item>
            )}
            {data.production_countries?.length > 0 && (
              <DataList.Item>
                <DataList.ItemLabel>製作國家</DataList.ItemLabel>
                <DataList.ItemValue>
                  <Group gap={4}>
                    {data.production_countries.map((c) => (
                      <Badge key={c.iso_3166_1} size="sm" variant="default">{c.name}</Badge>
                    ))}
                  </Group>
                </DataList.ItemValue>
              </DataList.Item>
            )}
          </DataList>
        </>
      )}

      {/* Ratings */}
      <Divider label="評分" labelPosition="left" />
      <DataList orientation="horizontal" size="sm" gap={6} labelWidth={120}>
        <DataList.Item>
          <DataList.ItemLabel>TMDb 評分</DataList.ItemLabel>
          <DataList.ItemValue>★ {data.vote_average?.toFixed(1) ?? '—'} ({data.vote_count?.toLocaleString() ?? 0} 票)</DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>熱門度</DataList.ItemLabel>
          <DataList.ItemValue>{data.popularity?.toFixed(1) ?? '—'}</DataList.ItemValue>
        </DataList.Item>
      </DataList>
    </Stack>
  )
}

function MovieContent({ data }: { data: TmdbMovieDetailResult }) {
  return (
    <Stack gap="md">
      {/* Basic info */}
      <DataList orientation="horizontal" size="sm" gap={6} labelWidth={120}>
        <DataList.Item>
          <DataList.ItemLabel>狀態</DataList.ItemLabel>
          <DataList.ItemValue>{data.status || '—'}</DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>上映日期</DataList.ItemLabel>
          <DataList.ItemValue>{data.release_date || '—'}</DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>片長</DataList.ItemLabel>
          <DataList.ItemValue>{formatRuntime(data.runtime)}</DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>原始語言</DataList.ItemLabel>
          <DataList.ItemValue>{data.original_language?.toUpperCase() || '—'}</DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>原產國</DataList.ItemLabel>
          <DataList.ItemValue>
            {data.origin_country?.length ? (
              <Group gap={4}>{data.origin_country.map((c) => <Badge key={c} size="sm" variant="default">{c}</Badge>)}</Group>
            ) : '—'}
          </DataList.ItemValue>
        </DataList.Item>
        {data.imdb_id && (
          <DataList.Item>
            <DataList.ItemLabel>IMDb</DataList.ItemLabel>
            <DataList.ItemValue>
              <Anchor href={`https://www.imdb.com/title/${data.imdb_id}`} target="_blank" rel="noopener noreferrer" size="sm">
                {data.imdb_id}
              </Anchor>
            </DataList.ItemValue>
          </DataList.Item>
        )}
        {data.homepage && (
          <DataList.Item>
            <DataList.ItemLabel>官方網站</DataList.ItemLabel>
            <DataList.ItemValue>
              <Anchor href={data.homepage} target="_blank" rel="noopener noreferrer" size="sm">
                {data.homepage}
              </Anchor>
            </DataList.ItemValue>
          </DataList.Item>
        )}
      </DataList>

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
          <DataList orientation="horizontal" size="sm" gap={6} labelWidth={120}>
            <DataList.Item>
              <DataList.ItemLabel>預算</DataList.ItemLabel>
              <DataList.ItemValue>{formatMoney(data.budget)}</DataList.ItemValue>
            </DataList.Item>
            <DataList.Item>
              <DataList.ItemLabel>票房收入</DataList.ItemLabel>
              <DataList.ItemValue>{formatMoney(data.revenue)}</DataList.ItemValue>
            </DataList.Item>
          </DataList>
        </>
      )}

      {/* Production */}
      {(data.production_companies?.length > 0 || data.production_countries?.length > 0) && (
        <>
          <Divider label="製作" labelPosition="left" />
          <DataList orientation="horizontal" size="sm" gap={6} labelWidth={120}>
            {data.production_companies?.length > 0 && (
              <DataList.Item>
                <DataList.ItemLabel>製作公司</DataList.ItemLabel>
                <DataList.ItemValue>
                  <Group gap={4}>
                    {data.production_companies.map((c) => (
                      <Badge key={c.id} size="sm" variant="default">{c.name}</Badge>
                    ))}
                  </Group>
                </DataList.ItemValue>
              </DataList.Item>
            )}
            {data.production_countries?.length > 0 && (
              <DataList.Item>
                <DataList.ItemLabel>製作國家</DataList.ItemLabel>
                <DataList.ItemValue>
                  <Group gap={4}>
                    {data.production_countries.map((c) => (
                      <Badge key={c.iso_3166_1} size="sm" variant="default">{c.name}</Badge>
                    ))}
                  </Group>
                </DataList.ItemValue>
              </DataList.Item>
            )}
          </DataList>
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
      <DataList orientation="horizontal" size="sm" gap={6} labelWidth={120}>
        <DataList.Item>
          <DataList.ItemLabel>TMDb 評分</DataList.ItemLabel>
          <DataList.ItemValue>★ {data.vote_average?.toFixed(1) ?? '—'} ({data.vote_count?.toLocaleString() ?? 0} 票)</DataList.ItemValue>
        </DataList.Item>
        <DataList.Item>
          <DataList.ItemLabel>熱門度</DataList.ItemLabel>
          <DataList.ItemValue>{data.popularity?.toFixed(1) ?? '—'}</DataList.ItemValue>
        </DataList.Item>
      </DataList>
    </Stack>
  )
}

export function TmdbMetadataModal({ innerProps, title, modalProps }: ContextModalProps<TmdbMetadataInnerProps>) {
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
  const displayTitle = data.mediaType === 'tv' ? data.name : data.title
  const displayOriginalTitle = data.mediaType === 'tv' ? data.original_name : data.original_title

  return (
    <Modal title={title} size="xl" {...modalProps}>
      <ScrollArea>
        <Stack gap="md" p={4}>
          {/* Header */}
          <Group gap="md" align="flex-start" wrap="nowrap">
            {posterSrc && (
              <Image
                src={posterSrc}
                alt={displayTitle}
                w={90}
                radius="sm"
                style={{ flexShrink: 0 }}
              />
            )}
            <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
              <Text fw={700} size="lg" style={{ lineHeight: 1.2 }}>{displayTitle}</Text>
              {displayOriginalTitle && displayOriginalTitle !== displayTitle && (
                <Text size="sm" c="dimmed">{displayOriginalTitle}</Text>
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
    </Modal>
  )
}
