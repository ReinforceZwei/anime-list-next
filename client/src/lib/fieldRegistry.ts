import type { FilterableField, FilterOperator } from '@/types/filter'

export type FieldType = 'select' | 'multiSelect' | 'text' | 'number' | 'date' | 'tags'

export interface FieldDef {
  field: FilterableField
  label: string
  type: FieldType
  operators: FilterOperator[]
  /** Options for select/multiSelect fields */
  options?: { value: string; label: string }[]
}

export const SELECT_STATUS_OPTIONS = [
  { value: 'planned', label: '待看' },
  { value: 'watching', label: '觀看中' },
  { value: 'completed', label: '已看完' },
  { value: 'dropped', label: '棄番' },
]

export const SELECT_DOWNLOAD_OPTIONS = [
  { value: 'pending', label: '待下載' },
  { value: 'downloading', label: '下載中' },
  { value: 'downloaded', label: '已下載' },
]

export const SELECT_MEDIA_OPTIONS = [
  { value: 'tv', label: '電視（TV）' },
  { value: 'movie', label: '電影（Movie）' },
]

const TEXT_OPERATORS: FilterOperator[] = [
  'contains', 'notContains', 'eq', 'neq', 'isEmpty', 'isNotEmpty',
]

const NUMBER_OPERATORS: FilterOperator[] = [
  'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between', 'isEmpty', 'isNotEmpty',
]

const DATE_OPERATORS: FilterOperator[] = [
  'before', 'after', 'between', 'isEmpty', 'isNotEmpty',
]

const SELECT_OPERATORS: FilterOperator[] = ['eq', 'neq', 'in', 'notIn']

const MEDIA_TYPE_OPERATORS: FilterOperator[] = ['eq', 'neq']

const TAGS_OPERATORS: FilterOperator[] = [
  'containsAll', 'containsAny', 'isEmpty', 'isNotEmpty',
]

export const FIELD_REGISTRY: FieldDef[] = [
  // Select fields
  { field: 'status', label: '狀態', type: 'select', operators: SELECT_OPERATORS, options: SELECT_STATUS_OPTIONS },
  { field: 'downloadStatus', label: '下載狀態', type: 'select', operators: SELECT_OPERATORS, options: SELECT_DOWNLOAD_OPTIONS },
  { field: 'tmdbMediaType', label: '媒體類型', type: 'select', operators: MEDIA_TYPE_OPERATORS, options: SELECT_MEDIA_OPTIONS },
  // Number field
  { field: 'rating', label: '評分', type: 'number', operators: NUMBER_OPERATORS },
  // Date fields
  { field: 'startedAt', label: '開始日期', type: 'date', operators: DATE_OPERATORS },
  { field: 'completedAt', label: '完成日期', type: 'date', operators: DATE_OPERATORS },
  { field: 'created', label: '建立日期', type: 'date', operators: DATE_OPERATORS },
  { field: 'updated', label: '更新日期', type: 'date', operators: DATE_OPERATORS },
  // Text fields
  { field: 'cachedTitle', label: '標題', type: 'text', operators: TEXT_OPERATORS },
  { field: 'cachedSeasonName', label: '季名', type: 'text', operators: TEXT_OPERATORS },
  { field: 'customName', label: '自訂名稱', type: 'text', operators: TEXT_OPERATORS },
  { field: 'comment', label: '留言', type: 'text', operators: TEXT_OPERATORS },
  { field: 'remark', label: '備註', type: 'text', operators: TEXT_OPERATORS },
  // Tags
  { field: 'tags', label: '標籤', type: 'tags', operators: TAGS_OPERATORS },
]

export const FIELD_MAP = new Map<FilterableField, FieldDef>(
  FIELD_REGISTRY.map((def) => [def.field, def]),
)

export function getFieldDef(field: FilterableField): FieldDef | undefined {
  return FIELD_MAP.get(field)
}

/**
 * Get the operators available for a given field.
 */
export function getOperatorsForField(field: FilterableField): FilterOperator[] {
  return FIELD_MAP.get(field)?.operators ?? []
}

/**
 * Human-readable label for an operator.
 */
export function getOperatorLabel(op: FilterOperator): string {
  const labels: Record<FilterOperator, string> = {
    eq: '等於',
    neq: '不等於',
    contains: '包含',
    notContains: '不包含',
    gt: '大於',
    gte: '大於等於',
    lt: '小於',
    lte: '小於等於',
    between: '介於',
    before: '早於',
    after: '晚於',
    in: '屬於',
    notIn: '不屬於',
    isEmpty: '為空',
    isNotEmpty: '非空',
    containsAll: '包含全部',
    containsAny: '包含任一',
  }
  return labels[op] ?? op
}

/**
 * Whether the operator requires a single value or a range.
 */
export function operatorNeedsRange(op: FilterOperator): boolean {
  return op === 'between'
}

/**
 * Whether the operator needs no value input (isEmpty/isNotEmpty).
 */
export function operatorNeedsNoValue(op: FilterOperator): boolean {
  return op === 'isEmpty' || op === 'isNotEmpty'
}
