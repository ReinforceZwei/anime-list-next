import { useState } from 'react'
import {
  ActionIcon,
  Alert,
  Button,
  Group,
  Paper,
  SegmentedControl,
  Select,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core'
import {
  IconChevronUp,
  IconChevronDown,
  IconTrash,
  IconPlus,
  IconInfoCircle,
  IconFilter,
  IconRotate,
  IconX,
} from '@tabler/icons-react'
import { FilterBuilder } from '@/components/FilterBuilder/FilterBuilder'
import { describeFilter } from '@/lib/filterDescribe'
import { createEmptyFilter, generateId } from '@/types/filter'
import type { FilterExpression } from '@/types/filter'
import type { SectionDef, SortableField } from '@/types/anime'
import { DEFAULT_SECTIONS } from '@/types/anime'

interface SectionEditorProps {
  sections: SectionDef[]
  onChange: (sections: SectionDef[]) => void
}

const SORT_FIELD_OPTIONS: { value: SortableField; label: string }[] = [
  { value: 'updated', label: '更新日期' },
  { value: 'created', label: '建立日期' },
  { value: 'rating', label: '評分' },
  { value: 'startedAt', label: '開始日期' },
  { value: 'completedAt', label: '完成日期' },
]

function moveItem<T>(arr: T[], from: number, to: number): T[] {
  const next = [...arr]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

export function SectionEditor({ sections, onChange }: SectionEditorProps) {
  const [filterEditIndex, setFilterEditIndex] = useState<number | null>(null)

  function handleLabelChange(index: number, label: string) {
    const next = [...sections]
    next[index] = { ...next[index], label }
    onChange(next)
  }

  function handleSortByChange(index: number, sortBy: SortableField) {
    const next = [...sections]
    next[index] = { ...next[index], sortBy }
    onChange(next)
  }

  function handleSortOrderChange(index: number, sortOrder: 'asc' | 'desc') {
    const next = [...sections]
    next[index] = { ...next[index], sortOrder }
    onChange(next)
  }

  function handleFilterChange(index: number, filter: FilterExpression) {
    const next = [...sections]
    next[index] = { ...next[index], filter }
    onChange(next)
  }

  function handleDelete(index: number) {
    const next = sections.filter((_, i) => i !== index)
    onChange(next)
  }

  function handleMoveUp(index: number) {
    if (index === 0) return
    onChange(moveItem(sections, index, index - 1))
  }

  function handleMoveDown(index: number) {
    if (index === sections.length - 1) return
    onChange(moveItem(sections, index, index + 1))
  }

  function handleAdd() {
    onChange([
      ...sections,
      {
        key: generateId(),
        label: '新區塊',
        filter: null,
        sortBy: 'updated',
        sortOrder: 'desc',
      },
    ])
  }

  function handleReset() {
    onChange([...DEFAULT_SECTIONS])
  }

  function hasNullFilterNotAtBottom(section: SectionDef, index: number): boolean {
    return section.filter === null && index < sections.length - 1
  }

  return (
    <Stack gap="sm">
      {sections.length === 0 && (
        <Group justify="center">
          <Text c="dimmed" size="sm" ta="center" py="md">
            尚無自訂區塊。點擊新增區塊，或從預設值開始自訂。
          </Text>
          <Button variant="subtle" onClick={handleReset}>
            從預設值開始
          </Button>
        </Group>
      )}

      {sections.map((section, index) => (
        <Paper key={section.key} withBorder p="sm" shadow="xs">
          <Stack gap="xs">
            {/* Header: move buttons + label + delete */}
            <Group justify="space-between" wrap="nowrap">
              <Group gap={4}>
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  color="gray"
                  disabled={index === 0}
                  onClick={() => handleMoveUp(index)}
                  aria-label="上移"
                >
                  <IconChevronUp size="1em" />
                </ActionIcon>
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  color="gray"
                  disabled={index === sections.length - 1}
                  onClick={() => handleMoveDown(index)}
                  aria-label="下移"
                >
                  <IconChevronDown size="1em" />
                </ActionIcon>
              </Group>
              <ActionIcon
                variant="subtle"
                size="sm"
                color="red"
                onClick={() => handleDelete(index)}
                aria-label="刪除區塊"
              >
                <IconTrash size="1em" />
              </ActionIcon>
            </Group>

            {/* Label */}
            <TextInput
              label="區塊名稱"
              placeholder="區塊名稱"
              value={section.label}
              onChange={(e) => handleLabelChange(index, e.currentTarget.value)}
            />

            {/* Filter */}
            <div>
              <Text size="sm" fw={500} mb={4}>
                篩選條件
              </Text>
              <Group gap="xs" wrap="nowrap">
                <Button
                  variant="outline"
                  size="sm"
                  leftSection={
                    filterEditIndex === index ? (
                      <IconX size="1em" />
                    ) : (
                      <IconFilter size="1em" />
                    )
                  }
                  onClick={() =>
                    setFilterEditIndex(filterEditIndex === index ? null : index)
                  }
                  styles={{ root: { flex: 1, overflow: 'hidden' } }}
                >
                  <Text truncate size="xs">
                    {describeFilter(section.filter)}
                  </Text>
                </Button>
                {section.filter !== null && (
                  <ActionIcon
                    variant="subtle"
                    size="sm"
                    color="gray"
                    onClick={() =>
                      handleFilterChange(index, createEmptyFilter())
                    }
                    aria-label="清除篩選"
                  >
                    <IconTrash size="0.8em" />
                  </ActionIcon>
                )}
              </Group>

              {/* Inline FilterBuilder */}
              {filterEditIndex === index && (
                <Paper withBorder p="sm" mt="xs" bg="var(--mantine-color-body)">
                  <FilterBuilder
                    value={section.filter ?? createEmptyFilter()}
                    onChange={(f) => handleFilterChange(index, f)}
                  />
                </Paper>
              )}
            </div>

            {/* Null-filter warning */}
            {hasNullFilterNotAtBottom(section, index) && (
              <Alert
                color="yellow"
                icon={<IconInfoCircle size="1em" />}
                p="xs"
                styles={{ message: { fontSize: 'var(--mantine-font-size-xs)' } }}
              >
                此區塊沒有篩選條件 — 將符合<b>所有</b>剩餘紀錄。建議移至最下方作為「其他」用途。
              </Alert>
            )}

            {/* Sort */}
            <Group wrap="nowrap" align="end">
              <Select
                label="排序欄位"
                data={SORT_FIELD_OPTIONS}
                value={section.sortBy}
                onChange={(v) =>
                  v && handleSortByChange(index, v as SortableField)
                }
                style={{ flex: 1 }}
              />
              <SegmentedControl
                data={[
                  { value: 'desc', label: '遞減' },
                  { value: 'asc', label: '遞增' },
                ]}
                value={section.sortOrder}
                onChange={(v) => handleSortOrderChange(index, v as 'asc' | 'desc')}
              />
            </Group>
          </Stack>
        </Paper>
      ))}

      {/* Add / Reset buttons */}
      <Group justify="space-between">
        <Button
          variant="light"
          size="sm"
          leftSection={<IconPlus size="1em" />}
          onClick={handleAdd}
        >
          新增區塊
        </Button>
        <Button
          variant="subtle"
          size="sm"
          color="gray"
          leftSection={<IconRotate size="1em" />}
          onClick={handleReset}
        >
          恢復預設值
        </Button>
      </Group>

      {/* Info tooltip */}
      <Tooltip
        label="紀錄會顯示在第一個符合條件的區塊中。未符合任何區塊的紀錄將自動歸入「未分類」。"
        multiline
        w={280}
      >
        <Text c="dimmed" size="xs" style={{ cursor: 'help', display: 'flex', alignItems: 'center', gap: 4 }}>
          <IconInfoCircle size="0.9em" />
          紀錄依區塊順序比對，符合即歸類
        </Text>
      </Tooltip>
    </Stack>
  )
}
