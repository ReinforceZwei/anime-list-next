import { useState } from 'react'
import {
  ActionIcon,
  Button,
  ColorInput,
  Group,
  NumberInput,
  Paper,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core'
import {
  IconChevronUp,
  IconChevronDown,
  IconTrash,
  IconPlus,
  IconChevronRight,
  IconChevronDown as IconChevronDownExpand,
  IconFilter,
  IconX,
} from '@tabler/icons-react'
import type { ActionButton, ActionDef, ActionableField } from '@/types/filter'
import { createEmptyActionButton, createEmptyActionDef } from '@/types/filter'
import { moveItem } from '@/lib/arrayUtils'
import { FilterBuilder } from '@/components/FilterBuilder/FilterBuilder'
import { describeFilter } from '@/lib/filterDescribe'
import { describeAction, describeActions } from '@/lib/actionExecutor'
import { FIELD_REGISTRY, getFieldDef } from '@/lib/fieldRegistry'
import { getIconComponent } from './iconCatalog'
import { IconPicker } from './IconPicker'
import { useTagList } from '@/hooks/useTagList'
import { TagMultiSelect } from '@/components/TagMultiSelect/TagMultiSelect'
import { useTagMap } from '@/hooks/useTagMap'
import { getBuiltInActionButtons } from '@/types/anime'

interface ActionButtonEditorProps {
  buttons: ActionButton[]
  onChange: (buttons: ActionButton[]) => void
}

const ACTIONABLE_FIELDS: ActionableField[] = ['status', 'downloadStatus', 'rating', 'comment', 'remark']

const fieldOptions = FIELD_REGISTRY
  .filter(f => (ACTIONABLE_FIELDS as string[]).includes(f.field))
  .map(f => ({ value: f.field, label: f.label }))

const actionTypeOptions = [
  { value: 'setField', label: '設定欄位' },
  { value: 'addTag', label: '加入標籤' },
  { value: 'removeTag', label: '移除標籤' },
]

export function ActionButtonEditor({ buttons, onChange }: ActionButtonEditorProps) {
  const { data: tagList } = useTagList()
  const tagMap = useTagMap()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filterEditId, setFilterEditId] = useState<string | null>(null)

  function handleLabelChange(id: string, label: string) {
    onChange(buttons.map(b => b.id === id ? { ...b, label } : b))
  }

  function handleIconChange(id: string, icon: string | undefined) {
    onChange(buttons.map(b => b.id === id ? { ...b, icon } : b))
  }

  function handleColorChange(id: string, color: string | undefined) {
    onChange(buttons.map(b => b.id === id ? { ...b, color: color || undefined } : b))
  }

  function handleConditionChange(id: string, condition: ActionButton['condition']) {
    onChange(buttons.map(b => b.id === id ? { ...b, condition } : b))
  }

  function handleActionsChange(id: string, actions: ActionDef[]) {
    onChange(buttons.map(b => b.id === id ? { ...b, actions } : b))
  }

  function handleSingleActionChange(id: string, actionIndex: number, action: ActionDef) {
    onChange(buttons.map(b => {
      if (b.id !== id) return b
      const next = [...b.actions]
      next[actionIndex] = action
      return { ...b, actions: next }
    }))
  }

  function handleToggleChange(id: string, key: 'askConfirmation' | 'showAsIcon', value: boolean) {
    onChange(buttons.map(b => b.id === id ? { ...b, [key]: value } : b))
  }

  function handleDelete(id: string) {
    if (expandedId === id) setExpandedId(null)
    if (filterEditId === id) setFilterEditId(null)
    onChange(buttons.filter(b => b.id !== id))
  }

  function handleMoveUp(index: number) {
    if (index === 0) return
    onChange(moveItem(buttons, index, index - 1))
  }

  function handleMoveDown(index: number) {
    if (index === buttons.length - 1) return
    onChange(moveItem(buttons, index, index + 1))
  }

  function handleAdd() {
    const newButton = createEmptyActionButton()
    onChange([...buttons, newButton])
    setExpandedId(newButton.id)
  }

  function handleCreateFromBuiltIn() {
    onChange(getBuiltInActionButtons())
  }

  function toggleExpand(id: string) {
    setExpandedId(expandedId === id ? null : id)
    if (filterEditId !== id) setFilterEditId(null)
  }

  return (
    <Stack gap="sm">
      {buttons.length === 0 && (
        <Stack gap="sm" align="center" py="md">
          <Text c="dimmed" size="sm">
            尚無自訂按鈕。您可以手動新增，或從內建按鈕建立。
          </Text>
          <Group>
            <Button
              variant="light"
              size="sm"
              leftSection={<IconPlus size="1em" />}
              onClick={handleAdd}
            >
              手動新增
            </Button>
            <Button
              variant="light"
              size="sm"
              leftSection={<IconPlus size="1em" />}
              onClick={handleCreateFromBuiltIn}
            >
              從內建按鈕建立
            </Button>
          </Group>
        </Stack>
      )}

      {buttons.map((button, index) => {
        const isExpanded = expandedId === button.id
        const IconComp = getIconComponent(button.icon)

        return (
          <Paper key={button.id} withBorder p="sm" shadow="xs">
            <Stack gap="xs">
              {/* Collapsed header row */}
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
                    disabled={index === buttons.length - 1}
                    onClick={() => handleMoveDown(index)}
                    aria-label="下移"
                  >
                    <IconChevronDown size="1em" />
                  </ActionIcon>
                </Group>

                {/* Expand toggle + label + icon preview */}
                <Group
                  gap="xs"
                  wrap="nowrap"
                  style={{ flex: 1, cursor: 'pointer', marginLeft: 4 }}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  onClick={() => toggleExpand(button.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      toggleExpand(button.id)
                    }
                  }}
                >
                  {isExpanded ? <IconChevronDownExpand size="1em" /> : <IconChevronRight size="1em" />}
                  <Text size="sm" fw={500} lineClamp={1}>
                    {button.label}
                  </Text>
                  {IconComp && <IconComp size="1em" />}
                </Group>

                <ActionIcon
                  variant="subtle"
                  size="sm"
                  color="red"
                  onClick={() => handleDelete(button.id)}
                  aria-label="刪除按鈕"
                >
                  <IconTrash size="1em" />
                </ActionIcon>
              </Group>

              {/* Filter summary on collapsed row */}
              {!isExpanded && (
                <Text size="xs" c="dimmed" lineClamp={1}>
                  {describeFilter(button.condition)}
                </Text>
              )}

              {/* Expanded content */}
              {isExpanded && (
                <Stack gap="sm">
                  {/* Label */}
                  <TextInput
                    label="按鈕文字"
                    placeholder="按鈕文字"
                    value={button.label}
                    onChange={(e) => handleLabelChange(button.id, e.currentTarget.value)}
                  />

                  {/* Color + Icon picker */}
                  <Group wrap="nowrap" align="end">
                    <ColorInput
                      label="按鈕顏色"
                      placeholder="預設"
                      value={button.color ?? ''}
                      onChange={(v) => handleColorChange(button.id, v || undefined)}
                      swatches={[
                        '#fa5252', '#e64980', '#be4bdb', '#7950f2',
                        '#4c6ef5', '#228be6', '#15aabf', '#12b886',
                        '#40c057', '#82c91e', '#fab005', '#fd7e14',
                      ]}
                      style={{ flex: 1 }}
                    />
                    <IconPicker value={button.icon} onChange={(icon) => handleIconChange(button.id, icon)} />
                  </Group>

                  {/* Filter condition */}
                  <div>
                    <Text size="sm" fw={500} mb={4}>
                      顯示條件
                    </Text>
                    <Group gap="xs" wrap="nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        leftSection={
                          filterEditId === button.id ? (
                            <IconX size="1em" />
                          ) : (
                            <IconFilter size="1em" />
                          )
                        }
                        onClick={(e) => {
                          e.stopPropagation()
                          setFilterEditId(filterEditId === button.id ? null : button.id)
                        }}
                        styles={{ root: { flex: 1, overflow: 'hidden' } }}
                      >
                        <Text truncate size="xs">
                          {describeFilter(button.condition)}
                        </Text>
                      </Button>
                    </Group>

                    {filterEditId === button.id && (
                      <Paper withBorder p="sm" mt="xs" bg="var(--mantine-color-body)">
                        <FilterBuilder
                          value={button.condition}
                          onChange={(f) => handleConditionChange(button.id, f)}
                        />
                      </Paper>
                    )}
                  </div>

                  {/* Actions list */}
                  <div>
                    <Text size="sm" fw={500} mb={4}>
                      動作
                    </Text>
                    <Stack gap="xs">
                      {button.actions.map((actionDef, actionIndex) => (
                        <Paper key={actionIndex} withBorder p="xs" bg="var(--mantine-color-body)">
                          <Stack gap="xs">
                            {/* Action type + delete */}
                            <Group justify="space-between" wrap="nowrap">
                              <Select
                                label="動作類型"
                                data={actionTypeOptions}
                                value={actionDef.type}
                                onChange={(v) => {
                                  if (!v) return
                                  if (v === 'setField') {
                                    handleSingleActionChange(button.id, actionIndex, { type: 'setField', field: 'status', value: 'watching' })
                                  } else if (v === 'addTag') {
                                    handleSingleActionChange(button.id, actionIndex, { type: 'addTag', tagIds: [] })
                                  } else if (v === 'removeTag') {
                                    handleSingleActionChange(button.id, actionIndex, { type: 'removeTag', tagIds: [] })
                                  }
                                }}
                                style={{ flex: 1 }}
                              />
                              <Group gap={4}>
                                <ActionIcon
                                  variant="subtle"
                                  size="sm"
                                  color="gray"
                                  disabled={actionIndex === 0}
                                  onClick={() => handleActionsChange(button.id, moveItem(button.actions, actionIndex, actionIndex - 1))}
                                  aria-label="上移動作"
                                >
                                  <IconChevronUp size="1em" />
                                </ActionIcon>
                                <ActionIcon
                                  variant="subtle"
                                  size="sm"
                                  color="gray"
                                  disabled={actionIndex === button.actions.length - 1}
                                  onClick={() => handleActionsChange(button.id, moveItem(button.actions, actionIndex, actionIndex + 1))}
                                  aria-label="下移動作"
                                >
                                  <IconChevronDown size="1em" />
                                </ActionIcon>
                                <ActionIcon
                                  variant="subtle"
                                  size="sm"
                                  color="red"
                                  disabled={button.actions.length <= 1}
                                  onClick={() => handleActionsChange(button.id, button.actions.filter((_, i) => i !== actionIndex))}
                                  aria-label="刪除動作"
                                >
                                  <IconTrash size="1em" />
                                </ActionIcon>
                              </Group>
                            </Group>

                            {/* setField mode */}
                            {actionDef.type === 'setField' && (
                              <Group wrap="nowrap" align="end">
                                <Select
                                  label="欄位"
                                  data={fieldOptions}
                                  value={actionDef.field}
                                  onChange={(v) => {
                                    if (!v) return
                                    const newField = v as ActionableField
                                    const def = getFieldDef(newField)
                                    const defaultValue = def?.type === 'number' ? 0 : def?.type === 'select' ? def.options?.[0]?.value ?? '' : ''
                                    handleSingleActionChange(button.id, actionIndex, { type: 'setField', field: newField, value: defaultValue })
                                  }}
                                  style={{ flex: 1 }}
                                />
                                {renderValueInput(
                                  actionDef as { type: 'setField'; field: ActionableField; value: string | number | null },
                                  (value) => handleSingleActionChange(button.id, actionIndex, { ...actionDef, value }),
                                )}
                              </Group>
                            )}

                            {/* addTag / removeTag mode */}
                            {(actionDef.type === 'addTag' || actionDef.type === 'removeTag') && (
                              <TagMultiSelect
                                data={tagList ?? []}
                                value={(actionDef as { tagIds: string[] }).tagIds}
                                onChange={(tagIds) =>
                                  handleSingleActionChange(button.id, actionIndex, { ...actionDef, tagIds })
                                }
                                label={actionDef.type === 'addTag' ? '要加入的標籤' : '要移除的標籤'}
                                placeholder="選擇標籤"
                              />
                            )}

                            {/* Single action description */}
                            <Text size="xs" c="dimmed">
                              {describeAction(actionDef, tagMap)}
                            </Text>
                          </Stack>
                        </Paper>
                      ))}

                      <Button
                        variant="light"
                        size="xs"
                        leftSection={<IconPlus size="1em" />}
                        onClick={() => handleActionsChange(button.id, [...button.actions, createEmptyActionDef()])}
                      >
                        新增動作
                      </Button>
                    </Stack>
                  </div>

                  {/* Action chain description preview */}
                  <Text size="xs" c="dimmed">
                    動作摘要：{describeActions(button.actions, tagMap)}
                  </Text>

                  {/* Toggles */}
                  <Group>
                    <Switch
                      label="執行前確認"
                      checked={button.askConfirmation ?? false}
                      onChange={(e) => handleToggleChange(button.id, 'askConfirmation', e.currentTarget.checked)}
                    />
                    <Switch
                      label="僅顯示圖示"
                      checked={button.showAsIcon ?? false}
                      onChange={(e) => handleToggleChange(button.id, 'showAsIcon', e.currentTarget.checked)}
                    />
                  </Group>
                </Stack>
              )}
            </Stack>
          </Paper>
        )
      })}

      <Button
        variant="light"
        size="sm"
        leftSection={<IconPlus size="1em" />}
        onClick={handleAdd}
      >
        新增按鈕
      </Button>
    </Stack>
  )
}

/** Renders the appropriate value input based on the field type */
function renderValueInput(
  action: { type: 'setField'; field: ActionableField; value: string | number | null },
  onChange: (value: string | number | null) => void,
) {
  const def = getFieldDef(action.field)
  if (!def) return null

  if (def.type === 'select' && def.options) {
    return (
      <Select
        label="值"
        data={def.options}
        value={String(action.value ?? '')}
        onChange={(v) => onChange(v)}
        style={{ flex: 1 }}
      />
    )
  }

  if (def.type === 'number') {
    return (
      <NumberInput
        label="值"
        min={0}
        max={10}
        step={1}
        value={typeof action.value === 'number' ? action.value : undefined}
        onChange={(v) => onChange(typeof v === 'number' ? v : null)}
        style={{ flex: 1 }}
      />
    )
  }

  // text fields: comment, remark
  return (
    <Textarea
      label="值"
      autosize
      minRows={1}
      maxRows={3}
      value={typeof action.value === 'string' ? action.value : ''}
      onChange={(e) => onChange(e.currentTarget.value)}
      style={{ flex: 1 }}
    />
  )
}
