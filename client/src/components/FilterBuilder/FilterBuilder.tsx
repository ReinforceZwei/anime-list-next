import { ScrollArea, Stack, Text } from '@mantine/core'
import type { FilterExpression, FilterableField } from '@/types/filter'
import { FilterGroupRow } from './FilterGroupRow'

interface FilterBuilderProps {
  /** The filter expression being edited (required, never null). */
  value: FilterExpression
  /** Called whenever the user makes any change to the filter. */
  onChange: (filter: FilterExpression) => void
  /** Optional label shown at the top of the builder. */
  label?: string
  /** Limit which fields appear in the field selector. Omit to show all. */
  availableFields?: FilterableField[]
}

export function FilterBuilder({
  value,
  onChange,
  label,
  availableFields,
}: FilterBuilderProps) {
  return (
    <Stack gap="sm">
      {label != null && (
        <Text fw={600} size="sm">
          {label}
        </Text>
      )}

      <ScrollArea.Autosize mah={400} offsetScrollbars>
        <FilterGroupRow
          group={value}
          onChange={onChange}
          isRoot
          availableFields={availableFields}
        />
      </ScrollArea.Autosize>
    </Stack>
  )
}
