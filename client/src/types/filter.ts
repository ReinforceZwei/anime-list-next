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
  | 'containsAll' | 'containsAny' | 'notContainsAll' | 'notContainsAny'

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

// ---- Actionable fields (subset of filterable fields, excludes tags) ----

export type ActionableField =
  | 'status'
  | 'downloadStatus'
  | 'rating'
  | 'comment'
  | 'remark'

// ---- Action types ----

export interface SetFieldAction {
  type: 'setField'
  field: ActionableField
  value: string | number | null
}

export interface AddTagAction {
  type: 'addTag'
  tagIds: string[]
}

export interface RemoveTagAction {
  type: 'removeTag'
  tagIds: string[]
}

export type ActionDef = SetFieldAction | AddTagAction | RemoveTagAction

// ---- Action button (user-defined) ----

export interface ActionButton {
  id: string
  label: string                          // button text (or tooltip text when showAsIcon)
  icon?: string                          // icon name from ICON_OPTIONS; undefined = no icon
  color?: string                         // optional color for the button (Mantine color)
  condition: FilterExpression            // when this filter matches the record, show the button
  actions: ActionDef[]                   // chain of actions executed in order
  askConfirmation?: boolean              // show confirm dialog before executing (default false)
  showAsIcon?: boolean                   // render as icon-only with tooltip (default false)
}

// ---- Helper ----

export function createEmptyActionButton(): ActionButton {
  return {
    id: generateId(),
    label: '新按鈕',
    condition: createEmptyFilter(),
    actions: [{ type: 'setField', field: 'status', value: 'watching' }],
  }
}

export function createEmptyActionDef(): ActionDef {
  return { type: 'setField', field: 'status', value: 'watching' }
}

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
