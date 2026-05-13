import { Group, Select, ActionIcon } from '@mantine/core'
import { IconTrash } from '@tabler/icons-react'
import type { FilterCondition, FilterableField, FilterOperator } from '@/types/filter'
import { FIELD_REGISTRY, getOperatorsForField, getOperatorLabel } from '@/lib/fieldRegistry'
import { FilterValueInput } from './FilterValueInput'

interface FilterConditionRowProps {
  condition: FilterCondition
  onChange: (condition: FilterCondition) => void
  onDelete: () => void
}

const FIELD_OPTIONS = FIELD_REGISTRY.map((def) => ({
  value: def.field,
  label: def.label,
}))

export function FilterConditionRow({
  condition,
  onChange,
  onDelete,
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
    // Reset value when changing field
    const needsNoValue = newOperator === 'isEmpty' || newOperator === 'isNotEmpty'
    onChange({
      ...condition,
      field: newField,
      operator: newOperator,
      value: needsNoValue ? null : '',
    })
  }

  function handleOperatorChange(op: string | null) {
    if (!op) return
    const newOperator = op as FilterOperator
    const needsNoValue = newOperator === 'isEmpty' || newOperator === 'isNotEmpty'
    onChange({
      ...condition,
      operator: newOperator,
      value: needsNoValue ? null : (condition.value ?? ''),
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
        data={FIELD_OPTIONS}
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
