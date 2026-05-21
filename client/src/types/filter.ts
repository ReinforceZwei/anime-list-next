// ---- Field definitions ----

export type FilterableField =
  | 'status'
  | 'downloadStatus'
  | 'tmdbMediaType'
  | 'rating'
  | 'startedAt'
  | 'completedAt'
  | 'cachedTitle'
  | 'cachedSeasonName'
  | 'customName'
  | 'comment'
  | 'remark'
  | 'created'
  | 'updated'
  | 'tags'

// ---- Operators ----

export type FilterOperator =
  // Universal
  | 'eq' | 'neq' | 'isEmpty' | 'isNotEmpty'
  // Text
  | 'contains' | 'notContains'
  // Number / Date
  | 'gt' | 'gte' | 'lt' | 'lte' | 'between'
  // Date only
  | 'before' | 'after'
  // Select
  | 'in' | 'notIn'
  // Tags (multi-select relation)
  | 'containsAll' | 'containsAny'

// ---- Value types ----

export type FilterValue = string | number | string[] | [string, string] | null

// ---- Leaf: one field predicate ----

export interface FilterCondition {
  id: string
  field: FilterableField
  operator: FilterOperator
  value: FilterValue
}

// ---- Branch: AND/OR group ----

export interface FilterGroup {
  id: string
  logic: 'and' | 'or'
  conditions: (FilterCondition | FilterGroup)[]
}

// A root filter is just a FilterGroup
export type FilterExpression = FilterGroup

// ---- Action rule (for Phase 4, defined here for reference) ----

export interface ActionRule {
  id: string
  label: string
  icon?: string
  condition: FilterExpression
  action: ActionDef
}

export type ActionDef =
  | { type: 'setStatus'; status: 'planned' | 'watching' | 'completed' | 'dropped' }
  | { type: 'setDownloadStatus'; downloadStatus: 'pending' | 'downloading' | 'downloaded' }
  | { type: 'setRating'; rating: number }
  | { type: 'addTag'; tagId: string }
  | { type: 'removeTag'; tagId: string }

// ---- Fallback UUID generator (crypto.randomUUID requires secure context) ----

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for plain HTTP (e.g. Docker serve)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// ---- Helper: create an empty filter expression ----

export function createEmptyFilter(): FilterExpression {
  return {
    id: generateId(),
    logic: 'and',
    conditions: [],
  }
}

export function createEmptyCondition(): FilterCondition {
  return {
    id: generateId(),
    field: 'cachedTitle',
    operator: 'contains',
    value: '',
  }
}

export function createEmptyGroup(): FilterGroup {
  return {
    id: generateId(),
    logic: 'and',
    conditions: [],
  }
}
