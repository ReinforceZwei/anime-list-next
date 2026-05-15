import type { AnimeRecord } from '@/types/anime'
import type {
  FilterExpression,
  FilterCondition,
  FilterGroup,
  FilterOperator,
} from '@/types/filter'
import { FIELD_MAP } from '@/lib/fieldRegistry'

/**
 * Evaluate a FilterExpression against a single AnimeRecord.
 * Returns true if the record matches the filter.
 */
export function evaluateFilter(
  filter: FilterExpression | null | undefined,
  record: AnimeRecord,
): boolean {
  if (!filter) return true
  return evaluateGroup(filter, record)
}

function hasActiveConditions(group: FilterGroup): boolean {
  return group.conditions.some((c) => {
    if ('field' in c) return true
    return hasActiveConditions(c as FilterGroup)
  })
}

function evaluateGroup(group: FilterGroup, record: AnimeRecord): boolean {
  // Skip empty child groups — they should not act as unconditional true/false
  const active = group.conditions.filter((c) => {
    if ('field' in c) return true
    return hasActiveConditions(c as FilterGroup)
  })
  if (active.length === 0) return true
  const results = active.map((c) => {
    if ('field' in c) {
      return evaluateCondition(c as FilterCondition, record)
    }
    return evaluateGroup(c as FilterGroup, record)
  })
  return group.logic === 'and' ? results.every(Boolean) : results.some(Boolean)
}

function evaluateCondition(
  cond: FilterCondition,
  record: AnimeRecord,
): boolean {
  const rawValue = record[cond.field as keyof AnimeRecord]
  const { operator, value } = cond

  switch (operator) {
    case 'isEmpty':
      return isEmptyValue(rawValue)
    case 'isNotEmpty':
      return !isEmptyValue(rawValue)
    default:
      break
  }

  const def = FIELD_MAP.get(cond.field)
  if (!def) return false

  switch (def.type) {
    case 'select':
      return evaluateSelect(rawValue as string, operator, value as string | string[])
    case 'number':
      return evaluateNumber(rawValue as number, operator, value as number | [string, string])
    case 'date':
      return evaluateDate(rawValue as string, operator, value as string | [string, string])
    case 'text':
      return evaluateText(rawValue as string, operator, value as string)
    case 'tags':
      return evaluateTags(
        (record.tags ?? []) as string[],
        operator,
        value as string[],
      )
    default:
      return false
  }
}

// ---- Value emptiness ----

function isEmptyValue(v: unknown): boolean {
  if (v === null || v === undefined) return true
  if (typeof v === 'string') return v.trim() === ''
  if (Array.isArray(v)) return v.length === 0
  return false
}

// ---- Select fields ----

function evaluateSelect(
  recordValue: string,
  operator: FilterOperator,
  filterValue: string | string[],
): boolean {
  const normalized = recordValue ?? ''
  switch (operator) {
    case 'eq':
      return normalized === filterValue
    case 'neq':
      return normalized !== filterValue
    case 'in': {
      const arr = Array.isArray(filterValue) ? filterValue : [filterValue]
      return arr.some((v) => normalized === v)
    }
    case 'notIn': {
      const arr = Array.isArray(filterValue) ? filterValue : [filterValue]
      return !arr.some((v) => normalized === v)
    }
    default:
      return false
  }
}

// ---- Number fields ----

function evaluateNumber(
  recordValue: number,
  operator: FilterOperator,
  filterValue: number | [string, string],
): boolean {
  if (recordValue === null || recordValue === undefined) return false
  const num = recordValue
  switch (operator) {
    case 'eq':
      return num === (filterValue as number)
    case 'neq':
      return num !== (filterValue as number)
    case 'gt':
      return num > (filterValue as number)
    case 'gte':
      return num >= (filterValue as number)
    case 'lt':
      return num < (filterValue as number)
    case 'lte':
      return num <= (filterValue as number)
    case 'between': {
      const [lo, hi] = filterValue as [string, string]
      const loNum = parseFloat(lo)
      const hiNum = parseFloat(hi)
      if (isNaN(loNum) || isNaN(hiNum)) return false
      return num >= loNum && num <= hiNum
    }
    default:
      return false
  }
}

// ---- Text fields ----

function evaluateText(
  recordValue: string,
  operator: FilterOperator,
  filterValue: string,
): boolean {
  const text = (recordValue ?? '').trim().toLowerCase()
  const filter = (filterValue ?? '').trim().toLowerCase()
  switch (operator) {
    case 'contains':
      return filter.length > 0 && text.includes(filter)
    case 'notContains':
      return filter.length > 0 && !text.includes(filter)
    case 'eq':
      return text === filter
    case 'neq':
      return text !== filter
    default:
      return false
  }
}

// ---- Date fields ----

function evaluateDate(
  recordValue: string,
  operator: FilterOperator,
  filterValue: string | [string, string],
): boolean {
  const recordTs = recordValue ? new Date(recordValue).getTime() : NaN
  if (isNaN(recordTs)) return false

  switch (operator) {
    case 'before':
    case 'lt': {
      const ts = filterValue ? new Date(filterValue as string).getTime() : NaN
      if (isNaN(ts)) return false
      return recordTs < ts
    }
    case 'after':
    case 'gt': {
      const ts = filterValue ? new Date(filterValue as string).getTime() : NaN
      if (isNaN(ts)) return false
      return recordTs > ts
    }
    case 'between': {
      const [lo, hi] = filterValue as [string, string]
      // Parse lower bound as start-of-day (default Date parsing for date-only strings)
      const loTs = lo ? new Date(lo).getTime() : NaN
      // Parse upper bound as end-of-day so the entire final day is included
      const hiTs = parseDateUpperBound(hi)
      if (isNaN(loTs) || isNaN(hiTs)) return false
      return recordTs >= loTs && recordTs <= hiTs
    }
    default:
      return false
  }
}

/**
 * Parse a date string as an inclusive upper bound. If the value is a date-only
 * string (e.g. "2025-12-31") with no time component, it is treated as the end
 * of that day (23:59:59.999Z) so records throughout the day are included.
 */
function parseDateUpperBound(value: string): number {
  if (!value) return NaN
  // Date-only strings have exactly 10 chars (YYYY-MM-DD) and no 'T'
  if (value.length === 10 && !value.includes('T')) {
    return new Date(value + 'T23:59:59.999Z').getTime()
  }
  return new Date(value).getTime()
}

// ---- Tags ----

function evaluateTags(
  recordTags: string[],
  operator: FilterOperator,
  filterValue: string[],
): boolean {
  if (!Array.isArray(filterValue) || filterValue.length === 0) {
    // No tags selected in filter
    switch (operator) {
      case 'isEmpty':
        return recordTags.length === 0
      case 'isNotEmpty':
        return recordTags.length > 0
      default:
        return true
    }
  }

  const tagSet = new Set(recordTags.map((t) => t.trim()).filter(Boolean))
  const filterSet = new Set(filterValue.map((t) => t.trim()).filter(Boolean))

  switch (operator) {
    case 'containsAll': {
      for (const f of filterSet) {
        if (!tagSet.has(f)) return false
      }
      return true
    }
    case 'containsAny': {
      for (const f of filterSet) {
        if (tagSet.has(f)) return true
      }
      return false
    }
    case 'isEmpty':
      return tagSet.size === 0
    case 'isNotEmpty':
      return tagSet.size > 0
    default:
      return false
  }
}
