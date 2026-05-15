import { describe, it, expect } from 'vitest'
import { evaluateFilter } from '@/lib/filterEngine'
import type { AnimeRecord } from '@/types/anime'
import type { FilterExpression, FilterCondition, FilterGroup } from '@/types/filter'

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

function cond(
  field: FilterCondition['field'],
  operator: FilterCondition['operator'],
  value: FilterCondition['value'],
  id = 'c1',
): FilterCondition {
  return { id, field, operator, value }
}

function group(
  logic: 'and' | 'or',
  conditions: (FilterCondition | FilterGroup)[],
  id = 'g1',
): FilterGroup {
  return { id, logic, conditions }
}

// ======================================================================
// evaluateFilter null / empty
// ======================================================================

describe('evaluateFilter - null/undefined/empty', () => {
  it('returns true when filter is null', () => {
    expect(evaluateFilter(null, makeRecord())).toBe(true)
  })

  it('returns true when filter is undefined', () => {
    expect(evaluateFilter(undefined, makeRecord())).toBe(true)
  })

  it('returns true when group has empty conditions', () => {
    const filter: FilterExpression = { id: 'g1', logic: 'and', conditions: [] }
    expect(evaluateFilter(filter, makeRecord())).toBe(true)
  })
})

// ======================================================================
// AND / OR logic
// ======================================================================

describe('evaluateFilter - AND/OR logic', () => {
  it('AND: true when all conditions match', () => {
    const filter: FilterExpression = group('and', [
      cond('status', 'eq', 'watching'),
      cond('rating', 'gte', 3),
    ])
    const rec = makeRecord({ status: 'watching', rating: 5 })
    expect(evaluateFilter(filter, rec)).toBe(true)
  })

  it('AND: false when any condition fails', () => {
    const filter: FilterExpression = group('and', [
      cond('status', 'eq', 'watching'),
      cond('rating', 'gte', 8),
    ])
    const rec = makeRecord({ status: 'watching', rating: 5 })
    expect(evaluateFilter(filter, rec)).toBe(false)
  })

  it('OR: true when any condition matches', () => {
    const filter: FilterExpression = group('or', [
      cond('status', 'eq', 'watching'),
      cond('rating', 'gte', 8),
    ])
    const rec = makeRecord({ status: 'watching', rating: 5 })
    expect(evaluateFilter(filter, rec)).toBe(true)
  })

  it('OR: false when all conditions fail', () => {
    const filter: FilterExpression = group('or', [
      cond('status', 'eq', 'completed'),
      cond('rating', 'gte', 10),
    ])
    const rec = makeRecord({ status: 'watching', rating: 5 })
    expect(evaluateFilter(filter, rec)).toBe(false)
  })

  it('nested groups with mixed logic', () => {
    const filter: FilterExpression = group('and', [
      cond('status', 'eq', 'watching'),
      group('or', [
        cond('rating', 'gte', 8),
        cond('downloadStatus', 'eq', 'downloaded'),
      ]),
    ])
    // rating=5, status=watching, downloadStatus=downloaded → OR matches, AND matches
    expect(
      evaluateFilter(filter, makeRecord({ status: 'watching', rating: 5, downloadStatus: 'downloaded' })),
    ).toBe(true)
    // rating=5, status=watching, downloadStatus=pending → OR fails, AND fails
    expect(
      evaluateFilter(filter, makeRecord({ status: 'watching', rating: 5, downloadStatus: 'pending' })),
    ).toBe(false)
    // status=planned → AND fails regardless
    expect(
      evaluateFilter(filter, makeRecord({ status: 'planned', rating: 10, downloadStatus: 'downloaded' })),
    ).toBe(false)
  })
})

// ======================================================================
// isEmpty / isNotEmpty (top-level, before type dispatch)
// ======================================================================

describe('evaluateFilter - isEmpty / isNotEmpty', () => {
  it('isEmpty: true for null field', () => {
    const filter: FilterExpression = group('and', [cond('status', 'isEmpty', null)])
    const rec = makeRecord({ status: undefined })
    expect(evaluateFilter(filter, rec)).toBe(true)
  })

  it('isEmpty: true for empty string', () => {
    const filter: FilterExpression = group('and', [cond('status', 'isEmpty', null)])
    const rec = makeRecord({ status: '' })
    expect(evaluateFilter(filter, rec)).toBe(true)
  })

  it('isEmpty: false for non-empty string', () => {
    const filter: FilterExpression = group('and', [cond('status', 'isEmpty', null)])
    const rec = makeRecord({ status: 'watching' })
    expect(evaluateFilter(filter, rec)).toBe(false)
  })

  it('isNotEmpty: false for null field', () => {
    const filter: FilterExpression = group('and', [cond('status', 'isNotEmpty', null)])
    const rec = makeRecord({ status: undefined })
    expect(evaluateFilter(filter, rec)).toBe(false)
  })

  it('isNotEmpty: true for non-empty string', () => {
    const filter: FilterExpression = group('and', [cond('status', 'isNotEmpty', null)])
    const rec = makeRecord({ status: 'watching' })
    expect(evaluateFilter(filter, rec)).toBe(true)
  })
})

// ======================================================================
// Select fields (status, downloadStatus, tmdbMediaType)
// ======================================================================

describe('evaluateFilter - select fields', () => {
  describe('eq', () => {
    it('matches exact value', () => {
      const filter: FilterExpression = group('and', [cond('status', 'eq', 'watching')])
      expect(evaluateFilter(filter, makeRecord({ status: 'watching' }))).toBe(true)
      expect(evaluateFilter(filter, makeRecord({ status: 'completed' }))).toBe(false)
    })

    it('matches empty value', () => {
      const filter: FilterExpression = group('and', [cond('status', 'eq', '')])
      expect(evaluateFilter(filter, makeRecord({ status: undefined }))).toBe(true)
      expect(evaluateFilter(filter, makeRecord({ status: '' }))).toBe(true)
    })
  })

  describe('neq', () => {
    it('rejects exact value', () => {
      const filter: FilterExpression = group('and', [cond('status', 'neq', 'watching')])
      expect(evaluateFilter(filter, makeRecord({ status: 'completed' }))).toBe(true)
      expect(evaluateFilter(filter, makeRecord({ status: 'watching' }))).toBe(false)
    })

    it('handles empty value', () => {
      const filter: FilterExpression = group('and', [cond('status', 'neq', '')])
      expect(evaluateFilter(filter, makeRecord({ status: '' }))).toBe(false)
      expect(evaluateFilter(filter, makeRecord({ status: 'completed' }))).toBe(true)
    })
  })

  describe('in', () => {
    it('matches any in array', () => {
      const filter: FilterExpression = group('and', [cond('status', 'in', ['watching', 'completed'])])
      expect(evaluateFilter(filter, makeRecord({ status: 'completed' }))).toBe(true)
      expect(evaluateFilter(filter, makeRecord({ status: 'planned' }))).toBe(false)
    })

    it('handles single string value', () => {
      const filter: FilterExpression = group('and', [cond('status', 'in', 'watching')])
      expect(evaluateFilter(filter, makeRecord({ status: 'watching' }))).toBe(true)
      expect(evaluateFilter(filter, makeRecord({ status: 'planned' }))).toBe(false)
    })

    it('handles empty value', () => {
      const filter: FilterExpression = group('and', [cond('status', 'in', ['watching', 'completed'])])
      expect(evaluateFilter(filter, makeRecord({ status: '' }))).toBe(false)
      expect(evaluateFilter(filter, makeRecord({ status: undefined }))).toBe(false)
    })
  })

  describe('notIn', () => {
    it('rejects all in array', () => {
      const filter: FilterExpression = group('and', [cond('status', 'notIn', ['watching', 'completed'])])
      expect(evaluateFilter(filter, makeRecord({ status: 'planned' }))).toBe(true)
      expect(evaluateFilter(filter, makeRecord({ status: 'watching' }))).toBe(false)
    })

    it('handles empty value', () => {
      const filter: FilterExpression = group('and', [cond('status', 'notIn', ['watching', 'completed'])])
      expect(evaluateFilter(filter, makeRecord({ status: '' }))).toBe(true)
      expect(evaluateFilter(filter, makeRecord({ status: undefined }))).toBe(true)
    })
  })
})

// ======================================================================
// Number fields (rating)
// ======================================================================

describe('evaluateFilter - number fields', () => {
  describe('eq', () => {
    it('matches exact number', () => {
      const filter: FilterExpression = group('and', [cond('rating', 'eq', 5)])
      expect(evaluateFilter(filter, makeRecord({ rating: 5 }))).toBe(true)
      expect(evaluateFilter(filter, makeRecord({ rating: 4 }))).toBe(false)
    })
  })

  describe('neq', () => {
    it('rejects exact number', () => {
      const filter: FilterExpression = group('and', [cond('rating', 'neq', 5)])
      expect(evaluateFilter(filter, makeRecord({ rating: 4 }))).toBe(true)
      expect(evaluateFilter(filter, makeRecord({ rating: 5 }))).toBe(false)
    })
  })

  describe('gt', () => {
    it('greater than', () => {
      const filter: FilterExpression = group('and', [cond('rating', 'gt', 5)])
      expect(evaluateFilter(filter, makeRecord({ rating: 6 }))).toBe(true)
      expect(evaluateFilter(filter, makeRecord({ rating: 5 }))).toBe(false)
      expect(evaluateFilter(filter, makeRecord({ rating: 4 }))).toBe(false)
    })
  })

  describe('gte', () => {
    it('greater than or equal', () => {
      const filter: FilterExpression = group('and', [cond('rating', 'gte', 5)])
      expect(evaluateFilter(filter, makeRecord({ rating: 5 }))).toBe(true)
      expect(evaluateFilter(filter, makeRecord({ rating: 6 }))).toBe(true)
      expect(evaluateFilter(filter, makeRecord({ rating: 4 }))).toBe(false)
    })
  })

  describe('lt', () => {
    it('less than', () => {
      const filter: FilterExpression = group('and', [cond('rating', 'lt', 5)])
      expect(evaluateFilter(filter, makeRecord({ rating: 4 }))).toBe(true)
      expect(evaluateFilter(filter, makeRecord({ rating: 5 }))).toBe(false)
    })
  })

  describe('lte', () => {
    it('less than or equal', () => {
      const filter: FilterExpression = group('and', [cond('rating', 'lte', 5)])
      expect(evaluateFilter(filter, makeRecord({ rating: 5 }))).toBe(true)
      expect(evaluateFilter(filter, makeRecord({ rating: 4 }))).toBe(true)
      expect(evaluateFilter(filter, makeRecord({ rating: 6 }))).toBe(false)
    })
  })

  describe('between', () => {
    it('inside range', () => {
      const filter: FilterExpression = group('and', [cond('rating', 'between', ['3', '7'])])
      expect(evaluateFilter(filter, makeRecord({ rating: 5 }))).toBe(true)
      expect(evaluateFilter(filter, makeRecord({ rating: 3 }))).toBe(true)
      expect(evaluateFilter(filter, makeRecord({ rating: 7 }))).toBe(true)
      expect(evaluateFilter(filter, makeRecord({ rating: 2 }))).toBe(false)
      expect(evaluateFilter(filter, makeRecord({ rating: 8 }))).toBe(false)
    })

    it('returns false for invalid bounds', () => {
      const filter: FilterExpression = group('and', [cond('rating', 'between', ['x', 'y'])])
      expect(evaluateFilter(filter, makeRecord({ rating: 5 }))).toBe(false)
    })
  })

  it('returns false for undefined rating (empty guard kicks in before evaluateNumber)', () => {
    const filter: FilterExpression = group('and', [cond('rating', 'eq', 0)])
    expect(evaluateFilter(filter, makeRecord({ rating: undefined }))).toBe(false)
  })

  it('rating=0 matches eq 0', () => {
    const filter: FilterExpression = group('and', [cond('rating', 'eq', 0)])
    expect(evaluateFilter(filter, makeRecord({ rating: 0 }))).toBe(true)
  })
})

// ======================================================================
// Text fields (cachedTitle, customName, comment, remark, cachedSeasonName)
// ======================================================================

describe('evaluateFilter - text fields', () => {
  describe('contains', () => {
    it('case-insensitive substring match', () => {
      const filter: FilterExpression = group('and', [cond('cachedTitle', 'contains', 'sword')])
      expect(evaluateFilter(filter, makeRecord({ cachedTitle: 'Sword Art Online' }))).toBe(true)
      expect(evaluateFilter(filter, makeRecord({ cachedTitle: 'One Piece' }))).toBe(false)
    })

    it('handles undefined value', () => {
      const filter: FilterExpression = group('and', [cond('cachedTitle', 'contains', 'sword')])
      expect(evaluateFilter(filter, makeRecord({ cachedTitle: undefined }))).toBe(false)
    })

    it('handles empty input', () => {
      const filter: FilterExpression = group('and', [cond('cachedTitle', 'contains', '')])
      expect(evaluateFilter(filter, makeRecord({ cachedTitle: 'Sword Art Online' }))).toBe(false)
      expect(evaluateFilter(filter, makeRecord({ cachedTitle: '' }))).toBe(false)
      expect(evaluateFilter(filter, makeRecord({ cachedTitle: undefined }))).toBe(false)
    })
  })

  describe('notContains', () => {
    it('case-insensitive non-match', () => {
      const filter: FilterExpression = group('and', [cond('cachedTitle', 'notContains', 'sword')])
      expect(evaluateFilter(filter, makeRecord({ cachedTitle: 'One Piece' }))).toBe(true)
      expect(evaluateFilter(filter, makeRecord({ cachedTitle: 'Sword Art' }))).toBe(false)
    })

    it('handles empty input', () => {
      const filter: FilterExpression = group('and', [cond('cachedTitle', 'notContains', 'sword')])
      expect(evaluateFilter(filter, makeRecord({ cachedTitle: '' }))).toBe(true)
      expect(evaluateFilter(filter, makeRecord({ cachedTitle: undefined }))).toBe(true)
    })
  })

  describe('eq', () => {
    it('exact match', () => {
      const filter: FilterExpression = group('and', [cond('comment', 'eq', 'great')])
      expect(evaluateFilter(filter, makeRecord({ comment: 'great' }))).toBe(true)
      expect(evaluateFilter(filter, makeRecord({ comment: 'not great' }))).toBe(false)
    })

    it('handles empty input', () => {
      const filter: FilterExpression = group('and', [cond('comment', 'eq', '')])
      expect(evaluateFilter(filter, makeRecord({ comment: '' }))).toBe(true)
      expect(evaluateFilter(filter, makeRecord({ comment: undefined }))).toBe(true)
      expect(evaluateFilter(filter, makeRecord({ comment: 'great' }))).toBe(false)
    })
  })

  describe('neq', () => {
    it('exact non-match', () => {
      const filter: FilterExpression = group('and', [cond('comment', 'neq', 'bad')])
      expect(evaluateFilter(filter, makeRecord({ comment: 'great' }))).toBe(true)
      expect(evaluateFilter(filter, makeRecord({ comment: 'bad' }))).toBe(false)
    })

    it('handles empty input', () => {
      const filter: FilterExpression = group('and', [cond('comment', 'neq', '')])
      expect(evaluateFilter(filter, makeRecord({ comment: '' }))).toBe(false)
      expect(evaluateFilter(filter, makeRecord({ comment: undefined }))).toBe(false)
      expect(evaluateFilter(filter, makeRecord({ comment: 'great' }))).toBe(true)
    })
  })
})

// ======================================================================
// Date fields (startedAt, completedAt, created, updated)
// ======================================================================

describe('evaluateFilter - date fields', () => {
  // Filter values in the app are date-only strings (e.g. "2025-06-01") because
  // DatePickerInput passes the formatted value as string, not a Date object.
  // Record values are full ISO strings from PocketBase.
  // new Date("2025-06-01") parses as UTC midnight, same timestamp as "2025-06-01T00:00:00.000Z",
  // so comparisons work identically regardless of timezone.
  describe('before', () => {
    it('true when record date < filter date', () => {
      const filter: FilterExpression = group('and', [cond('completedAt', 'before', '2025-06-01')])
      expect(evaluateFilter(filter, makeRecord({ completedAt: '2025-01-01T00:00:00.000Z' }))).toBe(true)
      expect(evaluateFilter(filter, makeRecord({ completedAt: '2025-12-01T00:00:00.000Z' }))).toBe(false)
    })

    it('false for missing date', () => {
      const filter: FilterExpression = group('and', [cond('completedAt', 'before', '2025-06-01')])
      expect(evaluateFilter(filter, makeRecord({ completedAt: undefined }))).toBe(false)
    })
  })

  describe('after', () => {
    it('true when record date > filter date', () => {
      const filter: FilterExpression = group('and', [cond('completedAt', 'after', '2025-01-01')])
      expect(evaluateFilter(filter, makeRecord({ completedAt: '2025-06-01T00:00:00.000Z' }))).toBe(true)
      expect(evaluateFilter(filter, makeRecord({ completedAt: '2024-01-01T00:00:00.000Z' }))).toBe(false)
    })
  })

  describe('lt (alias for before)', () => {
    it('works same as before', () => {
      const filter: FilterExpression = group('and', [cond('completedAt', 'lt', '2025-06-01')])
      expect(evaluateFilter(filter, makeRecord({ completedAt: '2025-01-01T00:00:00.000Z' }))).toBe(true)
    })
  })

  describe('gt (alias for after)', () => {
    it('works same as after', () => {
      const filter: FilterExpression = group('and', [cond('completedAt', 'gt', '2025-01-01')])
      expect(evaluateFilter(filter, makeRecord({ completedAt: '2025-06-01T00:00:00.000Z' }))).toBe(true)
    })
  })

  describe('between', () => {
    it('inside range', () => {
      const filter: FilterExpression = group('and', [
        cond('completedAt', 'between', ['2025-01-01', '2025-12-31']),
      ])
      expect(evaluateFilter(filter, makeRecord({ completedAt: '2025-06-01T00:00:00.000Z' }))).toBe(true)
      expect(evaluateFilter(filter, makeRecord({ completedAt: '2024-06-01T00:00:00.000Z' }))).toBe(false)
      expect(evaluateFilter(filter, makeRecord({ completedAt: '2025-01-01T00:00:00.000Z' }))).toBe(true)
      // Date-only upper bound "2025-12-31" is treated as end-of-day (23:59:59.999Z),
      // so records on Dec 31 at any time are included in the range.
      expect(evaluateFilter(filter, makeRecord({ completedAt: '2025-12-31T23:59:59.999Z' }))).toBe(true)
      expect(evaluateFilter(filter, makeRecord({ completedAt: '2025-12-31T12:00:00.000Z' }))).toBe(true)
    })

    it('false for invalid bounds', () => {
      const filter: FilterExpression = group('and', [
        cond('completedAt', 'between', ['invalid', 'also-invalid']),
      ])
      expect(evaluateFilter(filter, makeRecord({ completedAt: '2025-06-01T00:00:00.000Z' }))).toBe(false)
    })
  })
})

// ======================================================================
// Tags
// ======================================================================

describe('evaluateFilter - tags', () => {
  describe('containsAll', () => {
    it('true when record has all filter tags', () => {
      const filter: FilterExpression = group('and', [cond('tags', 'containsAll', ['action', 'fantasy'])])
      expect(evaluateFilter(filter, makeRecord({ tags: ['action', 'fantasy', 'comedy'] }))).toBe(true)
    })

    it('false when record missing any filter tag', () => {
      const filter: FilterExpression = group('and', [cond('tags', 'containsAll', ['action', 'fantasy'])])
      expect(evaluateFilter(filter, makeRecord({ tags: ['action', 'comedy'] }))).toBe(false)
    })

    it('true when record has no tags and filter is empty', () => {
      const filter: FilterExpression = group('and', [cond('tags', 'containsAll', [])])
      expect(evaluateFilter(filter, makeRecord({ tags: [] }))).toBe(true)
    })
  })

  describe('containsAny', () => {
    it('true when record has any filter tag', () => {
      const filter: FilterExpression = group('and', [cond('tags', 'containsAny', ['action', 'romance'])])
      expect(evaluateFilter(filter, makeRecord({ tags: ['comedy', 'action'] }))).toBe(true)
      expect(evaluateFilter(filter, makeRecord({ tags: ['comedy', 'sci-fi'] }))).toBe(false)
    })
  })

  describe('isEmpty', () => {
    it('true when tags is empty array', () => {
      const filter: FilterExpression = group('and', [cond('tags', 'isEmpty', [])])
      expect(evaluateFilter(filter, makeRecord({ tags: [] }))).toBe(true)
    })

    it('false when tags has items', () => {
      const filter: FilterExpression = group('and', [cond('tags', 'isEmpty', [])])
      expect(evaluateFilter(filter, makeRecord({ tags: ['action'] }))).toBe(false)
    })
  })

  describe('isNotEmpty', () => {
    it('true when tags has items', () => {
      const filter: FilterExpression = group('and', [cond('tags', 'isNotEmpty', [])])
      expect(evaluateFilter(filter, makeRecord({ tags: ['action'] }))).toBe(true)
    })

    it('false when tags is empty', () => {
      const filter: FilterExpression = group('and', [cond('tags', 'isNotEmpty', [])])
      expect(evaluateFilter(filter, makeRecord({ tags: [] }))).toBe(false)
    })
  })

  it('returns true for unknown operator with empty filter value', () => {
    // If filterValue is empty and operator is not isEmpty/isNotEmpty, it returns true
    const filter: FilterExpression = group('and', [cond('tags', 'unknownOperator' as never, [] as never)])
    expect(evaluateFilter(filter, makeRecord({ tags: ['action'] }))).toBe(true)
  })
})

// ======================================================================
// Edge cases
// ======================================================================

describe('evaluateFilter - edge cases', () => {
  it('unknown field returns false', () => {
    const filter: FilterExpression = group('and', [
      { id: 'c1', field: 'nonexistent' as never, operator: 'eq', value: 'x' } as FilterCondition,
    ])
    expect(evaluateFilter(filter, makeRecord())).toBe(false)
  })

  it('unknown operator returns false', () => {
    const filter: FilterExpression = group('and', [
      { id: 'c1', field: 'status', operator: 'unknownOp' as never, value: 'x' } as FilterCondition,
    ])
    expect(evaluateFilter(filter, makeRecord({ status: 'watching' }))).toBe(false)
  })

  it('select: non-operator path falls to default false', () => {
    // status is a select field but 'contains' is not a select operator
    const filter: FilterExpression = group('and', [cond('status', 'contains' as never, 'watch')])
    expect(evaluateFilter(filter, makeRecord({ status: 'watching' }))).toBe(false)
  })

  it('tags field skips the empty-value check for non-emptiness operators', () => {
    // For tags, the isEmpty check before type dispatch is only on the 'tags' field
    // This is already covered by the tags tests above
    const filter: FilterExpression = group('and', [cond('tags', 'containsAll', ['action'])])
    // record with undefined tags (null/undefined → empty array from ?? [])
    expect(evaluateFilter(filter, makeRecord({ tags: undefined }))).toBe(false)
  })

  it('deeply nested groups', () => {
    const filter: FilterExpression = group('and', [
      group('or', [
        group('and', [cond('status', 'eq', 'watching'), cond('rating', 'gte', 5)]),
        group('and', [cond('status', 'eq', 'completed'), cond('rating', 'gte', 7)]),
      ]),
    ])
    expect(evaluateFilter(filter, makeRecord({ status: 'watching', rating: 6 }))).toBe(true)
    expect(evaluateFilter(filter, makeRecord({ status: 'completed', rating: 6 }))).toBe(false)
    expect(evaluateFilter(filter, makeRecord({ status: 'completed', rating: 8 }))).toBe(true)
    expect(evaluateFilter(filter, makeRecord({ status: 'planned', rating: 9 }))).toBe(false)
  })

  it('empty subgroup in OR is ignored (no longer contaminates the OR)', () => {
    // Empty child groups are filtered out before evaluation.
    // An empty subgroup inside OR does NOT make every record match.
    const filter: FilterExpression = group('and', [
      group('or', [
        { id: 'empty', logic: 'or', conditions: [] } as FilterGroup,
        cond('rating', 'gte', 10),
      ]),
    ])
    expect(evaluateFilter(filter, makeRecord({ rating: 5 }))).toBe(false)
    expect(evaluateFilter(filter, makeRecord({ rating: 10 }))).toBe(true)
  })

  it('empty subgroup in AND is ignored (no effect on result)', () => {
    const filter: FilterExpression = group('and', [
      { id: 'empty', logic: 'and', conditions: [] } as FilterGroup,
      cond('rating', 'gte', 10),
    ])
    expect(evaluateFilter(filter, makeRecord({ rating: 8 }))).toBe(false)
    expect(evaluateFilter(filter, makeRecord({ rating: 10 }))).toBe(true)
  })
})
