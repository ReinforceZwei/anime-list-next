import { beforeEach, describe, expect, it, vi } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import type { LastUpdateRecord } from '@/types/lastUpdate'

// Plain functions rather than vi.fn(): a module-level mock shared across tests makes
// vitest misreport an Error raised inside it as a failure of every test in the file.
const { server } = vi.hoisted(() => ({
  server: { rows: [] as unknown[], failure: null as Error | null },
}))

vi.mock('@/lib/pb', () => ({
  Collections: {
    Animes: 'animes',
    Tags: 'tags',
    LastUpdates: 'lastUpdates',
    UserPreferences: 'userPreferences',
  },
  pb: {
    collection: () => ({
      getFullList: async () => {
        if (server.failure) throw server.failure
        return server.rows
      },
    }),
  },
}))

import { fetchAndReconcile, lastUpdatesQueryKey } from '@/hooks/useLastUpdate'

const USER = 'user1'
const TRACKED = ['animes', 'tags', 'userPreferences'] as const

function stamp(collection: string, lastUpdated: string): LastUpdateRecord {
  return {
    id: collection,
    collectionId: 'pbc_lastUpdates',
    collectionName: 'lastUpdates',
    created: '',
    updated: '',
    userId: USER,
    collection,
    lastUpdated,
  }
}

function makeClient(baseline: LastUpdateRecord[] | null) {
  const client = new QueryClient()
  // the collections the server tracks, cached but with no observer
  for (const collection of TRACKED) client.setQueryData([collection, USER], [])
  if (baseline) client.setQueryData(lastUpdatesQueryKey(USER), baseline)
  return client
}

const isInvalidated = (client: QueryClient, collection: string) =>
  client.getQueryState([collection, USER])?.isInvalidated === true

describe('fetchAndReconcile', () => {
  beforeEach(() => {
    server.rows = []
    server.failure = null
  })

  it('invalidates only the collections whose stamp moved', async () => {
    const client = makeClient([stamp('animes', 't1'), stamp('tags', 't1')])
    server.rows = [stamp('animes', 't1'), stamp('tags', 't2')]

    await fetchAndReconcile(client, USER)

    expect(isInvalidated(client, 'tags')).toBe(true)
    expect(isInvalidated(client, 'animes')).toBe(false)
  })

  it('invalidates a collection the client has never heard of', async () => {
    const client = makeClient([stamp('animes', 't1')])
    server.rows = [stamp('animes', 't1'), stamp('userPreferences', 't2')]

    await fetchAndReconcile(client, USER)

    expect(isInvalidated(client, 'userPreferences')).toBe(true)
    expect(isInvalidated(client, 'animes')).toBe(false)
  })

  it('does not cancel the mounting fetches on the first fetch of a session', async () => {
    // No baseline yet: every collection is being fetched by its own mounting query, so
    // nothing can have been missed and invalidating them would only restart those fetches.
    const client = makeClient(null)
    server.rows = [stamp('animes', 't1'), stamp('tags', 't1')]

    await fetchAndReconcile(client, USER)

    expect(TRACKED.map((c) => isInvalidated(client, c))).toEqual([false, false, false])
  })

  it('returns the fresh list, so the cache ends up holding the server stamps', async () => {
    const client = makeClient([stamp('animes', 't1')])
    server.rows = [stamp('animes', 't2')]

    expect(await fetchAndReconcile(client, USER)).toEqual(server.rows)
  })

  it('propagates a failed fetch and invalidates nothing', async () => {
    // A rejection is what keeps the query stale, so the next trigger re-checks instead of
    // being parked for the whole staleTime.
    const client = makeClient([stamp('animes', 't1')])
    server.failure = new Error('offline')

    let message = 'no error'
    try {
      await fetchAndReconcile(client, USER)
    } catch (err) {
      message = (err as Error).message
    }

    expect(message).toBe('offline')
    expect(isInvalidated(client, 'animes')).toBe(false)
  })
})
