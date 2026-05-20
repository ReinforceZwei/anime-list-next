import type { FilterExpression, FilterCondition, FilterGroup } from '@/types/filter'
import { FIELD_REGISTRY } from '@/lib/fieldRegistry'

export function describeFilter(filter: FilterExpression | null): string {
  if (!filter || filter.conditions.length === 0) return '(無篩選)'
  return describeGroup(filter, true)
}

function describeGroup(group: FilterGroup, isRoot: boolean): string {
  // Skip empty groups
  const active = group.conditions.filter(c =>
    'field' in c || (c as FilterGroup).conditions.length > 0
  )
  if (active.length === 0) return '(無篩選)'

  const parts = active.map(c =>
    'field' in c
      ? describeCondition(c as FilterCondition)
      : describeGroup(c as FilterGroup, false)
  )

  const joiner = group.logic === 'and' ? ' 且 ' : ' 或 '
  const joined = parts.join(joiner)

  // Wrap non-root groups in parentheses
  return isRoot ? joined : `(${joined})`
}

function describeCondition(cond: FilterCondition): string {
  const def = FIELD_REGISTRY.find(d => d.field === cond.field)
  const label = def?.label ?? cond.field
  const { operator, value } = cond

  switch (operator) {
    case 'eq':       return `${label} 是 "${value}"`
    case 'neq':      return `${label} 不是 "${value}"`
    case 'contains': return `${label} 包含 "${value}"`
    case 'notContains': return `${label} 不含 "${value}"`
    case 'gt':       return `${label} > ${value}`
    case 'gte':      return `${label} ≥ ${value}`
    case 'lt':       return `${label} < ${value}`
    case 'lte':      return `${label} ≤ ${value}`
    case 'in':       return `${label} 符合 [${(value as string[]).join(', ')}]`
    case 'notIn':    return `${label} 不符合 [${(value as string[]).join(', ')}]`
    case 'between':  return `${label} 在 ${(value as [string,string]).join(' 到 ')} 之間`
    case 'before':   return `${label} 在 ${value} 之前`
    case 'after':    return `${label} 在 ${value} 之後`
    case 'isEmpty':  return `${label} 為空`
    case 'isNotEmpty': return `${label} 不為空`
    case 'containsAll': return `${label} 包含全部`
    case 'containsAny': return `${label} 包含任一`
    default:         return `${label} ${operator} ${value}`
  }
}
