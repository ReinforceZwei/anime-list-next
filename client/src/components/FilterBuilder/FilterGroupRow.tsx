import {
  Paper,
  Group,
  SegmentedControl,
  Stack,
  ActionIcon,
  Button,
  Divider,
} from '@mantine/core'
import { IconTrash, IconPlus } from '@tabler/icons-react'
import type { FilterGroup, FilterCondition, FilterableField } from '@/types/filter'
import { createEmptyCondition, createEmptyGroup } from '@/types/filter'
import { FilterConditionRow } from './FilterConditionRow'

interface FilterGroupRowProps {
  group: FilterGroup
  onChange: (group: FilterGroup) => void
  onDelete?: () => void
  /** Whether this is the root group (no delete, simpler appearance) */
  isRoot?: boolean
  /** Limit which fields appear in the field selector. Omit to show all. */
  availableFields?: FilterableField[]
}

export function FilterGroupRow({
  group,
  onChange,
  onDelete,
  isRoot,
  availableFields,
}: FilterGroupRowProps) {
  function toggleLogic(value: string) {
    onChange({ ...group, logic: value as 'and' | 'or' })
  }

  function addCondition() {
    onChange({
      ...group,
      conditions: [...group.conditions, createEmptyCondition()],
    })
  }

  function addGroup() {
    onChange({
      ...group,
      conditions: [...group.conditions, createEmptyGroup()],
    })
  }

  function updateCondition(index: number, updated: FilterCondition) {
    const next = [...group.conditions]
    next[index] = updated
    onChange({ ...group, conditions: next })
  }

  function deleteCondition(index: number) {
    const next = group.conditions.filter((_, i) => i !== index)
    onChange({ ...group, conditions: next })
  }

  function updateSubGroup(index: number, updated: FilterGroup) {
    const next = [...group.conditions]
    next[index] = updated
    onChange({ ...group, conditions: next })
  }

  const noConditions = group.conditions.length === 0

  return (
    <Paper
      withBorder={!isRoot}
      p={isRoot ? 0 : 'sm'}
      bg={isRoot ? undefined : 'dark.7'}
    >
      <Group gap="xs" mb={noConditions ? 0 : 'xs'} wrap="nowrap">
        <SegmentedControl
          size="xs"
          data={[
            { value: 'and', label: 'AND' },
            { value: 'or', label: 'OR' },
          ]}
          value={group.logic}
          onChange={toggleLogic}
        />
        {noConditions && (
          <Group gap="xs" style={{ flex: 1 }}>
            <Button
              size="xs"
              variant="light"
              leftSection={<IconPlus size="0.8em" />}
              onClick={addCondition}
            >
              新增條件
            </Button>
            <Button
              size="xs"
              variant="light"
              leftSection={<IconPlus size="0.8em" />}
              onClick={addGroup}
            >
              新增群組
            </Button>
          </Group>
        )}
        {!isRoot && onDelete && (
          <ActionIcon
            variant="subtle"
            color="red"
            size="sm"
            onClick={onDelete}
            aria-label="刪除群組"
          >
            <IconTrash size="0.9em" />
          </ActionIcon>
        )}
      </Group>

      {!noConditions && (
        <Stack gap="xs" pl={isRoot ? 0 : 'sm'}>
          {group.conditions.map((cond, index) => {
            if ('field' in cond) {
              return (
                <FilterConditionRow
                  key={cond.id}
                  condition={cond as FilterCondition}
                  onChange={(updated) => updateCondition(index, updated)}
                  onDelete={() => deleteCondition(index)}
                  availableFields={availableFields}
                />
              )
            }
            return (
              <FilterGroupRow
                key={cond.id}
                group={cond as FilterGroup}
                onChange={(updated) => updateSubGroup(index, updated)}
                onDelete={() => deleteCondition(index)}
                availableFields={availableFields}
              />
            )
          })}

          <Divider variant="dashed" />

          <Group gap="xs">
            <Button
              size="xs"
              variant="light"
              leftSection={<IconPlus size="0.8em" />}
              onClick={addCondition}
            >
              新增條件
            </Button>
            <Button
              size="xs"
              variant="light"
              leftSection={<IconPlus size="0.8em" />}
              onClick={addGroup}
            >
              新增群組
            </Button>
          </Group>
        </Stack>
      )}
    </Paper>
  )
}
