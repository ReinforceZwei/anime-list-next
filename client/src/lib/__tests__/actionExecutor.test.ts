import { describe, it, expect } from 'vitest'
import { applySingleAction, applyActions, describeAction, describeActions } from '@/lib/actionExecutor'
import type { AnimeRecord, TagRecord } from '@/types/anime'
import type { ActionableField, ActionDef } from '@/types/filter'

// ---- Helpers ----

function makeRecord(overrides: Partial<AnimeRecord> = {}): AnimeRecord {
  return {
    id: 'rec-001',
    collectionId: 'col-001',
    collectionName: 'animeRecords',
    userId: 'user-001',
    created: '2025-01-01T00:00:00.000Z',
    updated: '2025-06-01T00:00:00.000Z',
    ...overrides,
  } as AnimeRecord
}

function makeTag(id: string, name: string): TagRecord {
  return {
    id,
    collectionId: 'col-tags',
    collectionName: 'tags',
    userId: 'user-001',
    name,
    created: '2025-01-01T00:00:00.000Z',
    updated: '2025-01-01T00:00:00.000Z',
  } as TagRecord
}

function tagMap(tags: TagRecord[]): Map<string, TagRecord> {
  return new Map(tags.map(t => [t.id, t]))
}

function setField(field: ActionableField & string, value: string | number): ActionDef {
  return { type: 'setField', field, value } as ActionDef
}

function addTag(...tagIds: string[]): ActionDef {
  return { type: 'addTag', tagIds }
}

function removeTag(...tagIds: string[]): ActionDef {
  return { type: 'removeTag', tagIds }
}

// ======================================================================
// applySingleAction
// ======================================================================

describe('applySingleAction', () => {
  // --- setField ---

  describe('setField', () => {
    it('sets a field value', () => {
      const rec = makeRecord({ status: 'planned' })
      const patch = applySingleAction(rec, setField('status', 'watching'))
      expect(patch).toEqual({ status: 'watching' })
    })

    it('sets a numeric field value', () => {
      const rec = makeRecord()
      const patch = applySingleAction(rec, setField('rating', 5))
      expect(patch).toEqual({ rating: 5 })
    })
  })

  // --- addTag ---

  describe('addTag', () => {
    it('adds new tags to an empty list', () => {
      const rec = makeRecord()
      const patch = applySingleAction(rec, addTag('t1', 't2'))
      expect(patch).toEqual({ tags: ['t1', 't2'] })
    })

    it('appends new tags to existing tags', () => {
      const rec = makeRecord({ tags: ['t1'] })
      const patch = applySingleAction(rec, addTag('t2', 't3'))
      expect(patch).toEqual({ tags: ['t1', 't2', 't3'] })
    })

    it('deduplicates — does not add tags already present', () => {
      const rec = makeRecord({ tags: ['t1', 't2'] })
      const patch = applySingleAction(rec, addTag('t2', 't3'))
      expect(patch).toEqual({ tags: ['t1', 't2', 't3'] })
    })

    it('returns empty patch when all tags are already present', () => {
      const rec = makeRecord({ tags: ['t1', 't2'] })
      const patch = applySingleAction(rec, addTag('t1', 't2'))
      expect(patch).toEqual({})
    })
  })

  // --- removeTag ---

  describe('removeTag', () => {
    it('removes specified tags', () => {
      const rec = makeRecord({ tags: ['t1', 't2', 't3'] })
      const patch = applySingleAction(rec, removeTag('t2'))
      expect(patch).toEqual({ tags: ['t1', 't3'] })
    })

    it('removes multiple tags at once', () => {
      const rec = makeRecord({ tags: ['t1', 't2', 't3'] })
      const patch = applySingleAction(rec, removeTag('t1', 't3'))
      expect(patch).toEqual({ tags: ['t2'] })
    })

    it('returns empty patch when tag is not present', () => {
      const rec = makeRecord({ tags: ['t1'] })
      const patch = applySingleAction(rec, removeTag('t99'))
      expect(patch).toEqual({})
    })

    it('handles undefined tags gracefully', () => {
      const rec = makeRecord()
      const patch = applySingleAction(rec, removeTag('t1'))
      expect(patch).toEqual({})
    })
  })

  // --- unknown action type ---

  it('returns empty patch for unknown action type', () => {
    const rec = makeRecord({ status: 'planned' })
    // @ts-expect-error testing runtime behavior for invalid action
    const patch = applySingleAction(rec, { type: 'unknown' })
    expect(patch).toEqual({})
  })
})

// ======================================================================
// applyActions — chaining
// ======================================================================

describe('applyActions', () => {
  it('returns empty patch for empty actions list', () => {
    const rec = makeRecord({ status: 'planned' })
    const patch = applyActions(rec, [])
    expect(patch).toEqual({})
  })

  it('applies a single action', () => {
    const rec = makeRecord({ status: 'planned' })
    const patch = applyActions(rec, [setField('status', 'watching')])
    expect(patch).toEqual({ status: 'watching' })
  })

  it('chains setField + addTag', () => {
    const rec = makeRecord({ status: 'planned' })
    const patch = applyActions(rec, [
      setField('status', 'watching'),
      addTag('t1', 't2'),
    ])
    expect(patch).toEqual({ status: 'watching', tags: ['t1', 't2'] })
  })

  it('chains addTag then removeTag on the same tags', () => {
    const rec = makeRecord({ tags: ['t1', 't2', 't3'] })
    // Add t4, then remove t1 and t2
    const patch = applyActions(rec, [
      addTag('t4'),
      removeTag('t1', 't2'),
    ])
    // Final tags should be: original [t1,t2,t3] + t4 - t1 - t2 = [t3, t4]
    expect(patch).toEqual({ tags: ['t3', 't4'] })
  })

  it('chains removeTag then addTag', () => {
    const rec = makeRecord({ tags: ['t1', 't2'] })
    const patch = applyActions(rec, [
      removeTag('t1'),
      addTag('t3'),
    ])
    expect(patch).toEqual({ tags: ['t2', 't3'] })
  })

  it('chains multiple setField actions — last one wins for same field', () => {
    const rec = makeRecord({ rating: 3 })
    const patch = applyActions(rec, [
      setField('rating', 5),
      setField('rating', 8),
    ])
    expect(patch).toEqual({ rating: 8 })
  })

  it('chains setField and tag operations correctly', () => {
    const rec = makeRecord({ status: 'planned', tags: ['t1'] })
    const patch = applyActions(rec, [
      setField('status', 'watching'),
      setField('rating', 10),
      addTag('t2'),
      removeTag('t1'),
    ])
    expect(patch).toEqual({
      status: 'watching',
      rating: 10,
      tags: ['t2'],
    })
  })

  it('does not mutate the original record', () => {
    const rec = makeRecord({ tags: ['original'] })
    const original = { ...rec, tags: [...(rec.tags ?? [])] }
    applyActions(rec, [addTag('t1'), removeTag('original')])
    expect(rec).toEqual(original)
  })
})

// ======================================================================
// describeAction
// ======================================================================

describe('describeAction', () => {
  const tags = [makeTag('t1', '動作'), makeTag('t2', '喜劇')]
  const map = tagMap(tags)

  describe('setField', () => {
    it('describes a setField action with field label', () => {
      const action = setField('status', 'watching')
      const desc = describeAction(action, map)
      expect(desc).toBe('將狀態設為「觀看中」')
    })

    it('describes a setField action for a field without options', () => {
      const action = setField('rating', 5)
      const desc = describeAction(action, map)
      expect(desc).toBe('將評分設為「5」')
    })

    it('falls back to (空白) when value is null', () => {
      const action = { type: 'setField' as const, field: 'status' as const, value: null as unknown as string }
      const desc = describeAction(action, map)
      expect(desc).toBe('將狀態設為「(空白)」')
    })

    it('falls back to (空白) when value is undefined', () => {
      const action = { type: 'setField' as const, field: 'status' as const, value: undefined as unknown as string }
      const desc = describeAction(action, map)
      expect(desc).toBe('將狀態設為「(空白)」')
    })

    it('falls back to (空白) when value is empty string', () => {
      const action = setField('status', '')
      const desc = describeAction(action, map)
      expect(desc).toBe('將狀態設為「(空白)」')
    })

    it('falls back to (空白) when value is whitespace only', () => {
      const action = setField('status', '   ')
      const desc = describeAction(action, map)
      expect(desc).toBe('將狀態設為「(空白)」')
    })
  })

  describe('addTag', () => {
    it('describes addTag with tag names from map', () => {
      const action = addTag('t1', 't2')
      const desc = describeAction(action, map)
      expect(desc).toBe('加入標籤「動作、喜劇」')
    })

    it('falls back to tag id when map is empty', () => {
      const action = addTag('t1')
      const desc = describeAction(action, new Map())
      expect(desc).toBe('加入標籤「t1」')
    })

    it('falls back to tag id when map is undefined', () => {
      const action = addTag('t1')
      const desc = describeAction(action)
      expect(desc).toBe('加入標籤「t1」')
    })
  })

  describe('removeTag', () => {
    it('describes removeTag with tag names from map', () => {
      const action = removeTag('t1')
      const desc = describeAction(action, map)
      expect(desc).toBe('移除標籤「動作」')
    })

    it('falls back to tag id when map lacks entry', () => {
      const action = removeTag('t99')
      const desc = describeAction(action, map)
      expect(desc).toBe('移除標籤「t99」')
    })
  })

  it('returns fallback string for unknown action type', () => {
    // @ts-expect-error testing runtime behavior
    const desc = describeAction({ type: 'unknown' }, map)
    expect(desc).toBe('未知動作')
  })
})

// ======================================================================
// describeActions
// ======================================================================

describe('describeActions', () => {
  const tags = [makeTag('t1', '動作'), makeTag('t2', '喜劇')]
  const map = tagMap(tags)

  it('returns placeholder for empty actions', () => {
    expect(describeActions([], map)).toBe('(無動作)')
  })

  it('describes a single action', () => {
    const desc = describeActions([setField('status', 'completed')], map)
    expect(desc).toBe('將狀態設為「已看完」')
  })

  it('joins multiple actions with 「，然後」', () => {
    const desc = describeActions(
      [setField('status', 'watching'), addTag('t1')],
      map,
    )
    expect(desc).toBe('將狀態設為「觀看中」，然後加入標籤「動作」')
  })

  it('describes a full setField + addTag + removeTag chain', () => {
    const desc = describeActions(
      [setField('status', 'completed'), addTag('t2'), removeTag('t1')],
      map,
    )
    expect(desc).toBe('將狀態設為「已看完」，然後加入標籤「喜劇」，然後移除標籤「動作」')
  })
})
