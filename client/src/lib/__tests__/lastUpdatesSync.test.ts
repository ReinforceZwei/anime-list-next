import { describe, expect, it } from 'vitest'
import { changedCollections } from '@/lib/lastUpdatesSync'
import type { LastUpdateRecord } from '@/types/lastUpdate'

function update(collection: string, lastUpdated: string): LastUpdateRecord {
  return {
    id: collection,
    collectionId: 'pbc_lastUpdates',
    collectionName: 'lastUpdates',
    created: '',
    updated: '',
    userId: 'user1',
    collection,
    lastUpdated,
  }
}

describe('changedCollections', () => {
  it('reports nothing when every stamp is unchanged', () => {
    const previous = [update('animes', 't1'), update('tags', 't1')]
    const current = [update('animes', 't1'), update('tags', 't1')]

    expect(changedCollections(current, previous)).toEqual([])
  })

  it('reports the collections whose stamp moved', () => {
    const previous = [update('animes', 't1'), update('tags', 't1')]
    const current = [update('animes', 't1'), update('tags', 't2')]

    expect(changedCollections(current, previous)).toEqual(['tags'])
  })

  it('reports a collection the client has never seen', () => {
    const previous = [update('animes', 't1')]
    const current = [update('animes', 't1'), update('userPreferences', 't2')]

    expect(changedCollections(current, previous)).toEqual(['userPreferences'])
  })

  it('ignores collections that only exist in the previous view', () => {
    const previous = [update('animes', 't1'), update('retiredCollection', 't1')]
    const current = [update('animes', 't1')]

    expect(changedCollections(current, previous)).toEqual([])
  })

  it('reports nothing before the first fetch, when there is no previous view', () => {
    // Every collection is being fetched by its own mounting query at that point.
    expect(changedCollections([update('animes', 't1')], undefined)).toEqual([])
    expect(changedCollections(undefined, [update('animes', 't1')])).toEqual([])
    expect(changedCollections(undefined, undefined)).toEqual([])
  })

  it('reports nothing when the server reports nothing', () => {
    expect(changedCollections([], [update('animes', 't1')])).toEqual([])
  })
})
