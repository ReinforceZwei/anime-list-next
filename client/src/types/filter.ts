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

// ---- Section definition (for Phase 3, defined here for reference) ----

export type SortableField = 'completedAt' | 'startedAt' | 'updated' | 'created' | 'rating'

export interface SectionDefV2 {
  key: string
  label: string
  filter: FilterExpression | null
  sortBy: SortableField
  sortOrder: 'asc' | 'desc'
}

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

// ---- Helper: create an empty filter expression ----

export function createEmptyFilter(): FilterExpression {
  return {
    id: crypto.randomUUID(),
    logic: 'and',
    conditions: [],
  }
}

export function createEmptyCondition(): FilterCondition {
  return {
    id: crypto.randomUUID(),
    field: 'cachedTitle',
    operator: 'contains',
    value: '',
  }
}

export function createEmptyGroup(): FilterGroup {
  return {
    id: crypto.randomUUID(),
    logic: 'and',
    conditions: [],
  }
}
