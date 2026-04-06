import { useRef, useState } from 'react'
import {
  Combobox,
  ColorSwatch,
  Group,
  isLightColor,
  Pill,
  PillsInput,
  Text,
  useCombobox,
  CheckIcon,
} from '@mantine/core'
import type { TagRecord } from '@/types/anime'
import { sortTags } from '@/lib/animeUtils'

interface TagMultiSelectProps {
  data: TagRecord[]
  value: string[]
  onChange: (ids: string[]) => void
  label?: string
  placeholder?: string
  style?: React.CSSProperties
}

export function TagMultiSelect({
  data,
  value,
  onChange,
  label,
  placeholder = 'Pick tags',
  style,
}: TagMultiSelectProps) {
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const combobox = useCombobox({
    onDropdownClose: () => {
      setSearch('')
      combobox.resetSelectedOption()
    },
    onDropdownOpen: () => {
      inputRef.current?.focus()
    },
  })

  const selectedSet = new Set(value)

  const sortedData = sortTags(data)

  const filtered = sortedData.filter((tag) =>
    tag.name.toLowerCase().includes(search.toLowerCase().trim()),
  )

  function toggleTag(tagId: string) {
    if (selectedSet.has(tagId)) {
      onChange(value.filter((id) => id !== tagId))
    } else {
      onChange([...value, tagId])
    }
  }

  const selectedTags = sortTags(data.filter((t) => selectedSet.has(t.id)))

  const options = filtered.map((tag) => (
    <Combobox.Option value={tag.id} key={tag.id}>
      <Group gap="xs" wrap="nowrap">
        <ColorSwatch color={tag.color ?? 'gray'} size={12} withShadow={false} />
        <Text size="sm" style={{ flex: 1 }}>
          {tag.name}
        </Text>
        {selectedSet.has(tag.id) && <CheckIcon size={12} />}
      </Group>
    </Combobox.Option>
  ))

  return (
    <Combobox store={combobox} onOptionSubmit={toggleTag} withinPortal>
      <Combobox.DropdownTarget>
        <PillsInput
          label={label}
          style={style}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
        >
          <Pill.Group>
            {selectedTags.map((tag) => (
              <Pill
                key={tag.id}
                withRemoveButton
                onRemove={() => toggleTag(tag.id)}
                styles={{
                  root: {
                    backgroundColor: tag.color ?? undefined,
                    color: tag.color ? (isLightColor(tag.color) ? '#000' : '#fff') : undefined,
                  },
                }}
              >
                {tag.name}
              </Pill>
            ))}
            <Combobox.EventsTarget>
              <PillsInput.Field
                ref={inputRef}
                value={search}
                placeholder={selectedTags.length === 0 ? placeholder : ''}
                onChange={(e) => {
                  setSearch(e.currentTarget.value)
                  combobox.openDropdown()
                  combobox.updateSelectedOptionIndex()
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && search.length === 0 && selectedTags.length > 0) {
                    const last = selectedTags[selectedTags.length - 1]
                    toggleTag(last.id)
                  }
                }}
                onBlur={() => combobox.closeDropdown()}
              />
            </Combobox.EventsTarget>
          </Pill.Group>
        </PillsInput>
      </Combobox.DropdownTarget>

      <Combobox.Dropdown>
        <Combobox.Options mah={200} style={{ overflowY: 'auto' }}>
          {options.length > 0 ? options : <Combobox.Empty>No tags found</Combobox.Empty>}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}
