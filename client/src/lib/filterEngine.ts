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

function evaluateGroup(group: FilterGroup, record: AnimeRecord): boolean {
  if (group.conditions.length === 0) return true
  const results = group.conditions.map((c) => {
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

  // For operators that need a value, if the record's value is empty, no match
  if (cond.field !== 'tags' && isEmptyValue(rawValue)) return false

  const def = FIELD_MAP.get(cond.field)
  if (!def) return false

  switch (def.type) {
    case 'select':
    case 'multiSelect':
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
  const normalized = (recordValue ?? '').trim()
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
  const num = recordValue ?? 0
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
      return text.includes(filter)
    case 'notContains':
      return !text.includes(filter)
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
      const loTs = lo ? new Date(lo).getTime() : NaN
      const hiTs = hi ? new Date(hi).getTime() : NaN
      if (isNaN(loTs) || isNaN(hiTs)) return false
      return recordTs >= loTs && recordTs <= hiTs
    }
    default:
      return false
  }
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
