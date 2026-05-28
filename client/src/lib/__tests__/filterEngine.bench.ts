import { bench, describe } from 'vitest'
import { evaluateFilter } from '@/lib/filterEngine'
import type { AnimeRecord } from '@/types/anime'
import type { FilterExpression, FilterCondition, FilterGroup } from '@/types/filter'

// ---- Realistic record factory ----

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

function generateRecords(count: number): AnimeRecord[] {
  const statuses = ['planned', 'watching', 'completed', 'dropped', undefined]
  const dlStatuses = ['pending', 'downloading', 'downloaded', undefined]
  const titles = [
    'Sword Art Online', 'Attack on Titan', 'One Piece',
    'Demon Slayer', 'Jujutsu Kaisen', 'Chainsaw Man',
    'Spy x Family', 'Frieren', 'Vinland Saga', 'Mushoku Tensei',
  ]
  const tagsPool = ['action', 'fantasy', 'comedy', 'romance', 'sci-fi', 'horror', 'slice-of-life']

  return Array.from({ length: count }, (_, i) =>
    makeRecord({
      id: `rec-${i}`,
      status: statuses[i % statuses.length] as AnimeRecord['status'],
      downloadStatus: dlStatuses[i % dlStatuses.length] as AnimeRecord['downloadStatus'],
      rating: (i % 11), // 0-10
      cachedTitle: titles[i % titles.length],
      tags: tagsPool.filter(() => Math.random() > 0.5),
      startedAt: `202${(i % 5)}-0${(i % 9) + 1}-15T00:00:00.000Z`,
      completedAt: i % 3 === 0 ? `202${(i % 5)}-0${(i % 9) + 1}-20T00:00:00.000Z` : undefined,
    }),
  )
}

const records10 = generateRecords(10)
const records100 = generateRecords(100)
const records1000 = generateRecords(1000)

// ---- Helpers ----

function cond(
  field: FilterCondition['field'],
  operator: FilterCondition['operator'],
  value: FilterCondition['value'],
): FilterCondition {
  return { id: 'c1', field, operator, value }
}

function group(
  logic: 'and' | 'or',
  conditions: (FilterCondition | FilterGroup)[],
): FilterGroup {
  return { id: 'g1', logic, conditions }
}

// ======================================================================
// Single-condition throughput (per type)
// ======================================================================

describe('single condition — select', () => {
  const filter: FilterExpression = group('and', [cond('status', 'eq', 'watching')])
  const recMatch = makeRecord({ status: 'watching' })
  const recMiss = makeRecord({ status: 'completed' })

  bench('eq (match)', () => {
    evaluateFilter(filter, recMatch)
  })

  bench('eq (miss)', () => {
    evaluateFilter(filter, recMiss)
  })
})

describe('single condition — number', () => {
  const filter: FilterExpression = group('and', [cond('rating', 'gte', 7)])
  const rec = makeRecord({ rating: 8 })

  bench('gte (match)', () => {
    evaluateFilter(filter, rec)
  })
})

describe('single condition — text', () => {
  const filter: FilterExpression = group('and', [cond('cachedTitle', 'contains', 'sword')])
  const rec = makeRecord({ cachedTitle: 'Sword Art Online' })

  bench('contains (match)', () => {
    evaluateFilter(filter, rec)
  })
})

describe('single condition — date', () => {
  const filter: FilterExpression = group('and', [
    cond('completedAt', 'between', ['2025-01-01', '2025-12-31']),
  ])
  const rec = makeRecord({ completedAt: '2025-06-15T00:00:00.000Z' })

  bench('between (match)', () => {
    evaluateFilter(filter, rec)
  })
})

describe('single condition — tags', () => {
  const filter: FilterExpression = group('and', [
    cond('tags', 'containsAll', ['action', 'fantasy']),
  ])
  const rec = makeRecord({ tags: ['action', 'fantasy', 'comedy'] })

  bench('containsAll (match)', () => {
    evaluateFilter(filter, rec)
  })
})

// ======================================================================
// Group nesting depth
// ======================================================================

describe('group nesting depth', () => {
  const rec = makeRecord({ status: 'watching', rating: 8, cachedTitle: 'Sword Art Online' })

  bench('depth 1 (flat AND of 3)', () => {
    evaluateFilter(
      group('and', [
        cond('status', 'eq', 'watching'),
        cond('rating', 'gte', 7),
        cond('downloadStatus', 'neq', 'pending'),
      ]),
      rec,
    )
  })

  bench('depth 2 (AND of OR)', () => {
    evaluateFilter(
      group('and', [
        cond('status', 'eq', 'watching'),
        group('or', [
          cond('rating', 'gte', 8),
          cond('cachedTitle', 'contains', 'sword'),
        ]),
      ]),
      rec,
    )
  })

  bench('depth 3', () => {
    evaluateFilter(
      group('and', [
        group('or', [
          group('and', [
            cond('rating', 'gte', 7),
            cond('status', 'eq', 'watching'),
          ]),
          cond('cachedTitle', 'contains', 'sword'),
        ]),
        cond('downloadStatus', 'neq', 'pending'),
      ]),
      rec,
    )
  })
})

// ======================================================================
// Batch filtering (real-world use case)
// ======================================================================

describe('batch filtering', () => {
  const filter: FilterExpression = group('and', [
    cond('status', 'in', ['watching', 'completed']),
    cond('rating', 'gte', 5),
  ])

  bench('10  records', () => {
    records10.filter((r) => evaluateFilter(filter, r))
  })

  bench('100 records', () => {
    records100.filter((r) => evaluateFilter(filter, r))
  })

  bench('1000 records', () => {
    records1000.filter((r) => evaluateFilter(filter, r))
  })
})

// ======================================================================
// Short-circuit behavior
// ======================================================================

describe('short-circuit', () => {
  const expensiveTags = ['action', 'fantasy', 'comedy', 'sci-fi', 'horror']

  bench('AND short-circuit (first fails)', () => {
    evaluateFilter(
      group('and', [
        cond('status', 'eq', 'completed'),
        cond('tags', 'containsAll', expensiveTags),
      ]),
      makeRecord({ status: 'watching' }),
    )
  })

  bench('OR short-circuit (first passes)', () => {
    evaluateFilter(
      group('or', [
        cond('status', 'eq', 'watching'),
        cond('tags', 'containsAll', expensiveTags),
      ]),
      makeRecord({ status: 'watching' }),
    )
  })

  bench('AND no short-circuit (both evaluated)', () => {
    evaluateFilter(
      group('and', [
        cond('status', 'eq', 'watching'),
        cond('rating', 'gte', 5),
      ]),
      makeRecord({ status: 'watching', rating: 8 }),
    )
  })
})
