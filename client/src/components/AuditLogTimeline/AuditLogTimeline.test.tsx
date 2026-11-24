import { MantineProvider } from '@mantine/core'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { AuditLogTimeline } from './AuditLogTimeline'

vi.mock('@/hooks/useAuditLogs', () => ({
  useAuditLogs: () => ({
    data: {
      totalPages: 1,
      items: [
        {
          id: 'log-1',
          action: 'UPDATE',
          collection: 'animes',
          recordId: 'anime-1',
          created: '2025-01-01T12:00:00Z',
          changes: {
            status: { old: 'planned', new: 'dropped' },
            downloadStatus: { old: 'pending', new: 'downloading' },
            tmdbMediaType: { old: 'tv', new: 'movie' },
            cachedTitle: { old: 'Old title', new: 'New title' },
            cachedSeasonName: { old: 'Old season', new: 'New season' },
            tmdbId: { old: 10, new: 20 },
            tmdbSeasonNumber: { old: 1, new: 2 },
            futureField: { old: 'old value', new: 'new value' },
          },
        },
        {
          id: 'log-2',
          action: 'UPDATE',
          collection: 'animes',
          recordId: 'anime-1',
          created: '2025-01-01T12:00:00Z',
          changes: { status: { old: '', new: 'future-status' } },
        },
        {
          id: 'log-3',
          action: 'UPDATE',
          collection: 'tags',
          recordId: 'tag-1',
          created: '2025-01-01T12:00:00Z',
          changes: {
            name: { old: 'A', new: 'B' },
            color: { old: '#000', new: '#fff' },
            weight: { old: 1, new: 2 },
            hidden: { old: false, new: true },
          },
        },
      ],
    },
    isLoading: false,
    isError: false,
  }),
}))
vi.mock('@/hooks/useAnimeList', () => ({ useAnimeList: () => ({ data: [] }) }))
vi.mock('@/hooks/useTagMap', () => ({ useTagMap: () => new Map() }))

describe('AuditLogTimeline', () => {
  it('uses existing field and select labels and preserves unknown fields', () => {
    const html = renderToStaticMarkup(
      <MantineProvider>
        <AuditLogTimeline page={1} onPageChange={() => {}} />
      </MantineProvider>,
    )

    for (const text of [
      '待看', '棄番', '等待下載', '下載中', '電視（TV）', '電影（Movie）',
      '狀態', '標題', '季名', 'TMDb ID', 'TMDb 季數', 'futureField', 'new value', 'future-status',
      '名稱', '顏色', '權重', '隱藏',
    ]) {
      expect(html).toContain(`>${text}<`)
    }
  })
})
