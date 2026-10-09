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
    const cached = [update('animes', 't1'), update('tags', 't1')]
    const fresh = [update('animes', 't1'), update('tags', 't1')]

    expect(changedCollections(fresh, cached)).toEqual([])
  })

  it('reports the collections whose stamp moved', () => {
    const cached = [update('animes', 't1'), update('tags', 't1')]
    const fresh = [update('animes', 't1'), update('tags', 't2')]

    expect(changedCollections(fresh, cached)).toEqual(['tags'])
  })

  it('reports a collection the client has never seen', () => {
    const cached = [update('animes', 't1')]
    const fresh = [update('animes', 't1'), update('userPreferences', 't2')]

    expect(changedCollections(fresh, cached)).toEqual(['userPreferences'])
  })

  it('ignores collections that only exist in the baseline', () => {
    const cached = [update('animes', 't1'), update('retiredCollection', 't1')]
    const fresh = [update('animes', 't1')]

    expect(changedCollections(fresh, cached)).toEqual([])
  })

  it('reports nothing when the server reports nothing', () => {
    expect(changedCollections([], [update('animes', 't1')])).toEqual([])
  })
})
