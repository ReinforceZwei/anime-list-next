import { Group, Select, ActionIcon } from '@mantine/core'
import { IconTrash } from '@tabler/icons-react'
import type { FilterCondition, FilterableField, FilterOperator } from '@/types/filter'
import { FIELD_REGISTRY, getOperatorsForField, getOperatorLabel, getValueShape, getDefaultValueForOperator } from '@/lib/fieldRegistry'
import { FilterValueInput } from './FilterValueInput'

interface FilterConditionRowProps {
  condition: FilterCondition
  onChange: (condition: FilterCondition) => void
  onDelete: () => void
  /** Limit which fields appear in the field selector. Omit to show all. */
  availableFields?: FilterableField[]
}

const ALL_FIELD_OPTIONS = FIELD_REGISTRY.map((def) => ({
  value: def.field,
  label: def.label,
}))

function getFieldOptions(availableFields?: FilterableField[]) {
  if (!availableFields || availableFields.length === 0) {
    return ALL_FIELD_OPTIONS
  }
  const allowed = new Set(availableFields)
  return ALL_FIELD_OPTIONS.filter((opt) => allowed.has(opt.value as FilterableField))
}

export function FilterConditionRow({
  condition,
  onChange,
  onDelete,
  availableFields,
}: FilterConditionRowProps) {
  const operators = getOperatorsForField(condition.field)
  const operatorOptions = operators.map((op) => ({
    value: op,
    label: getOperatorLabel(op),
  }))

  function handleFieldChange(field: string | null) {
    if (!field) return
    const newField = field as FilterableField
    const newOps = getOperatorsForField(newField)
    const newOperator = newOps[0] ?? 'eq'
    // Reset value when changing field — use the correct empty value for the new operator
    onChange({
      ...condition,
      field: newField,
      operator: newOperator,
      value: getDefaultValueForOperator(newOperator),
    })
  }

  function handleOperatorChange(op: string | null) {
    if (!op) return
    const newOperator = op as FilterOperator
    // Preserve the old value only if the new operator expects the same value shape;
    // otherwise reset to the correct empty/default value for the new operator.
    const sameShape = getValueShape(condition.operator) === getValueShape(newOperator)
    onChange({
      ...condition,
      operator: newOperator,
      value: sameShape ? condition.value : getDefaultValueForOperator(newOperator),
    })
  }

  function handleValueChange(value: FilterCondition['value']) {
    onChange({ ...condition, value })
  }

  return (
    <Group gap="xs" wrap="nowrap" align="center">
      <Select
        size="xs"
        w={120}
        data={getFieldOptions(availableFields)}
        value={condition.field}
        onChange={handleFieldChange}
        placeholder="欄位"
      />
      <Select
        size="xs"
        w={110}
        data={operatorOptions}
        value={condition.operator}
        onChange={handleOperatorChange}
        placeholder="條件"
      />
      <FilterValueInput
        field={condition.field}
        operator={condition.operator}
        value={condition.value}
        onChange={handleValueChange}
      />
      <ActionIcon
        variant="subtle"
        color="gray"
        size="sm"
        onClick={onDelete}
        aria-label="刪除條件"
      >
        <IconTrash size="0.9em" />
      </ActionIcon>
    </Group>
  )
}
