import { Select, MultiSelect, NumberInput, TextInput } from '@mantine/core'
import { DatePickerInput, type DateValue } from '@mantine/dates'
import type { FilterableField, FilterOperator, FilterValue } from '@/types/filter'
import { getFieldDef, operatorNeedsRange, operatorNeedsNoValue } from '@/lib/fieldRegistry'
import { useTagList } from '@/hooks/useTagList'
import { TagMultiSelect } from '@/components/TagMultiSelect/TagMultiSelect'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-tw'

interface FilterValueInputProps {
  field: FilterableField
  operator: FilterOperator
  value: FilterValue
  onChange: (value: FilterValue) => void
}

export function FilterValueInput({
  field,
  operator,
  value,
  onChange,
}: FilterValueInputProps) {
  if (operatorNeedsNoValue(operator)) {
    return null
  }

  const fieldDef = getFieldDef(field)
  if (!fieldDef) return null

  const needsRange = operatorNeedsRange(operator)

  switch (fieldDef.type) {
    case 'select': {
      if (operator === 'in' || operator === 'notIn') {
        const options = fieldDef.options ?? []
        return (
          <MultiSelect
            size="xs"
            w={160}
            data={options}
            value={Array.isArray(value) ? value as string[] : []}
            onChange={(v) => onChange(v)}
            placeholder="選擇值…"
            clearable
            searchable
          />
        )
      }
      const options = fieldDef.options ?? []
      return (
        <Select
          size="xs"
          w={140}
          data={options}
          value={typeof value === 'string' ? value : ''}
          onChange={(v) => onChange(v ?? '')}
          placeholder="選擇值…"
          clearable
          searchable
        />
      )
    }
    case 'text':
      return (
        <TextInput
          size="xs"
          w={180}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.currentTarget.value)}
          placeholder="輸入文字…"
        />
      )
    case 'number':
      if (needsRange) {
        const arr = Array.isArray(value) ? value as [string, string] : ['', '']
        return (
          <>
            <NumberInput
              size="xs"
              w={80}
              min={0}
              max={5}
              value={arr[0] ? parseFloat(arr[0]) : undefined}
              onChange={(n) => onChange([String(n ?? ''), arr[1]])}
              placeholder="最小值"
            />
            <NumberInput
              size="xs"
              w={80}
              min={0}
              max={5}
              value={arr[1] ? parseFloat(arr[1]) : undefined}
              onChange={(n) => onChange([arr[0], String(n ?? '')])}
              placeholder="最大值"
            />
          </>
        )
      }
      return (
        <NumberInput
          size="xs"
          w={80}
          min={0}
          max={5}
          value={typeof value === 'number' ? value : undefined}
          onChange={(n) => onChange(typeof n === 'number' ? n : '')}
          placeholder="數值"
        />
      )
    case 'date':
      if (needsRange) {
        const arr = Array.isArray(value) ? value as [DateValue, DateValue] : ['', ''] as [DateValue, DateValue]
        return (
          <DatePickerInput
            type="range"
            size="xs"
            w={180}
            valueFormat="YYYY/MM/DD"
            value={arr}
            onChange={(d) => onChange(d ? d.map(x => x ?? '') : ['', ''])}
            placeholder="選擇日期"
            clearable
          />
        )
      }
      return (
        <DatePickerInput
          size="xs"
          w={150}
          valueFormat="YYYY/MM/DD"
          value={typeof value === 'string' && value ? dayjs(value).toDate() : null}
          onChange={(d) => onChange(d ?? '')}
          placeholder="選擇日期"
          clearable
        />
      )
    case 'tags':
      return <TagValueInput value={value} onChange={onChange} />
    default:
      return null
  }
}

/** Wrapper so that the tag list hook only loads when a tags field is used. */
function TagValueInput({
  value,
  onChange,
}: {
  value: FilterValue
  onChange: (value: FilterValue) => void
}) {
  const { data: tagList = [] } = useTagList()
  return (
    <TagMultiSelect
      data={tagList}
      value={Array.isArray(value) ? value as string[] : []}
      onChange={(ids) => onChange(ids)}
      placeholder="選擇標籤…"
    />
  )
}
