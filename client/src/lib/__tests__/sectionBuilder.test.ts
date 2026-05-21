import { describe, it, expect } from 'vitest'
import type { AnimeRecord, SectionDef } from '@/types/anime'
import { buildSections } from '@/lib/sectionBuilder'
import { evaluateFilter } from '@/lib/filterEngine'

// ---- Test helpers ----

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

function makeSectionDef(overrides: Partial<SectionDef> = {}): SectionDef {
  return {
    key: 'test',
    label: 'Test Section',
    filter: null,
    sortBy: 'updated',
    sortOrder: 'desc',
    ...overrides,
  }
}

// A simple pass-through filter evaluator (null = match all)
function passThroughEval(filter: SectionDef['filter'], _record: AnimeRecord): boolean {
  if (!filter) return true
  // For these tests we use a controlled evaluator, see filter tests below
  return true
}

// ======================================================================
// Empty / edge cases
// ======================================================================

describe('buildSections - empty/edge', () => {
  it('returns sections with empty items when records is empty', () => {
    const sections = buildSections([], [makeSectionDef()], passThroughEval)
    // Sections are still created; they just have no items. No __other__ since no unclaimed records.
    expect(sections).toHaveLength(1)
    expect(sections[0].items).toEqual([])
  })

  it('returns empty array when sectionDefs is empty and no records', () => {
    const sections = buildSections([], [], passThroughEval)
    expect(sections).toEqual([])
  })

  it('returns only __other__ when no sectionDefs but records exist', () => {
    const rec = makeRecord({ id: 'r1' })
    const sections = buildSections([rec], [], passThroughEval)
    expect(sections).toHaveLength(1)
    expect(sections[0].key).toBe('__other__')
    expect(sections[0].items).toEqual([rec])
  })
})

// ======================================================================
// Section key / label mapping
// ======================================================================

describe('buildSections - keys and labels', () => {
  it('preserves section key and label from definition', () => {
    const defs: SectionDef[] = [
      makeSectionDef({ key: 'watching', label: '觀看中' }),
      makeSectionDef({ key: 'completed', label: '已看完' }),
    ]
    const rec = makeRecord({ id: 'r1' })
    const sections = buildSections([rec], defs, passThroughEval)

    expect(sections).toHaveLength(2) // r1 claimed by watching, no __other__
    expect(sections[0].key).toBe('watching')
    expect(sections[0].label).toBe('觀看中')
    expect(sections[1].key).toBe('completed')
    expect(sections[1].label).toBe('已看完')
  })
})

// ======================================================================
// First-match-wins (no duplicate records across sections)
// ======================================================================

describe('buildSections - first-match-wins', () => {
  it('each record appears in only one section', () => {
    const rec = makeRecord({ id: 'shared' })
    const defs: SectionDef[] = [
      makeSectionDef({ key: 'first', filter: null }),  // null = match all
      makeSectionDef({ key: 'second', filter: null }),
    ]
    const sections = buildSections([rec], defs, passThroughEval)

    expect(sections).toHaveLength(2)
    expect(sections[0].items).toHaveLength(1)
    expect(sections[1].items).toHaveLength(0)
    // No __other__ because all records are claimed
  })

  it('no __other__ section when all records are claimed', () => {
    const rec = makeRecord({ id: 'r1' })
    const defs: SectionDef[] = [makeSectionDef({ key: 'only', filter: null })]
    const sections = buildSections([rec], defs, passThroughEval)

    expect(sections).toHaveLength(1)
    expect(sections[0].key).not.toBe('__other__')
  })
})

// ======================================================================
// __other__ catch-all
// ======================================================================

describe('buildSections - __other__ catch-all', () => {
  it('adds __other__ when records are not claimed by any section', () => {
    // filter that matches nothing
    const neverMatch = () => false
    const defs: SectionDef[] = [
      makeSectionDef({ key: 'empty', filter: { id: 'f1', logic: 'and', conditions: [] } }),
    ]
    const rec = makeRecord({ id: 'r1' })
    const sections = buildSections([rec], defs, neverMatch)

    expect(sections).toHaveLength(2)
    expect(sections[0].items).toHaveLength(0)
    expect(sections[1].key).toBe('__other__')
    expect(sections[1].label).toBe('未分類')
    expect(sections[1].items).toHaveLength(1)
  })

  it('omits __other__ when all records are claimed', () => {
    const rec = makeRecord({ id: 'r1' })
    const defs: SectionDef[] = [makeSectionDef({ key: 'all', filter: null })]
    const sections = buildSections([rec], defs, passThroughEval)

    const otherSection = sections.find((s) => s.key === '__other__')
    expect(otherSection).toBeUndefined()
  })
})

// ======================================================================
// Sorting
// ======================================================================

describe('buildSections - sorting', () => {
  it('sorts items within each section by sortBy and sortOrder', () => {
    const records = [
      makeRecord({ id: 'a', rating: 3 }),
      makeRecord({ id: 'b', rating: 5 }),
      makeRecord({ id: 'c', rating: 1 }),
    ]
    const defs: SectionDef[] = [
      makeSectionDef({ key: 'rated', label: 'Rated', sortBy: 'rating', sortOrder: 'asc', filter: null }),
    ]
    const sections = buildSections(records, defs, passThroughEval)

    expect(sections[0].items.map((i) => i.id)).toEqual(['c', 'a', 'b'])
  })

  it('sorts desc correctly', () => {
    const records = [
      makeRecord({ id: 'a', rating: 3 }),
      makeRecord({ id: 'b', rating: 5 }),
      makeRecord({ id: 'c', rating: 1 }),
    ]
    const defs: SectionDef[] = [
      makeSectionDef({ key: 'rated', label: 'Rated', sortBy: 'rating', sortOrder: 'desc', filter: null }),
    ]
    const sections = buildSections(records, defs, passThroughEval)

    expect(sections[0].items.map((i) => i.id)).toEqual(['b', 'a', 'c'])
  })

  it('sorts by updated desc (default for __other__)', () => {
    const records = [
      makeRecord({ id: 'old', updated: '2025-01-01T00:00:00.000Z' }),
      makeRecord({ id: 'new', updated: '2025-06-01T00:00:00.000Z' }),
    ]
    // no section defs → all go to __other__
    const sections = buildSections(records, [], passThroughEval)

    expect(sections[0].key).toBe('__other__')
    expect(sections[0].items.map((i) => i.id)).toEqual(['new', 'old'])
  })

  it('handles missing sort values gracefully (nullish → "")', () => {
    const records = [
      makeRecord({ id: 'hasRating', rating: 5 }),
      makeRecord({ id: 'noRating', rating: undefined }),
    ]
    const defs: SectionDef[] = [
      makeSectionDef({ key: 'r', label: 'R', sortBy: 'rating', sortOrder: 'asc', filter: null }),
    ]
    const sections = buildSections(records, defs, passThroughEval)

    // undefined coerces to '' which sorts before numbers as strings
    expect(sections[0].items.map((i) => i.id)).toEqual(['noRating', 'hasRating'])
  })
})

// ======================================================================
// Integration with real evaluateFilter
// ======================================================================

describe('buildSections - with real evaluateFilter', () => {
  it('routes records to correct sections based on status filter', () => {
    const records = [
      makeRecord({ id: 'w1', status: 'watching', cachedTitle: 'Attack on Titan' }),
      makeRecord({ id: 'c1', status: 'completed', cachedTitle: 'Steins;Gate' }),
      makeRecord({ id: 'p1', status: 'planned', cachedTitle: 'Frieren' }),
    ]

    const defs: SectionDef[] = [
      { key: 'watching', label: '觀看中', filter: { id: 'f1', logic: 'and', conditions: [{ id: 'c1', field: 'status', operator: 'eq', value: 'watching' }] }, sortBy: 'updated', sortOrder: 'desc' },
      { key: 'completed', label: '已看完', filter: { id: 'f2', logic: 'and', conditions: [{ id: 'c2', field: 'status', operator: 'eq', value: 'completed' }] }, sortBy: 'completedAt', sortOrder: 'asc' },
    ]

    const sections = buildSections(records, defs, evaluateFilter)

    expect(sections).toHaveLength(3) // watching, completed, __other__
    expect(sections[0].items.map((i) => i.id)).toEqual(['w1'])
    expect(sections[1].items.map((i) => i.id)).toEqual(['c1'])
    expect(sections[2].key).toBe('__other__')
    expect(sections[2].items.map((i) => i.id)).toEqual(['p1'])
  })
})
