import { useState, useEffect } from 'react'
import {
  ActionIcon,
  Indicator,
  Paper,
  ScrollArea,
  Stack,
  Group,
  Button,
} from '@mantine/core'
import { IconFilter, IconX } from '@tabler/icons-react'
import type { FilterExpression, FilterableField } from '@/types/filter'
import { createEmptyFilter } from '@/types/filter'
import { FilterGroupRow } from './FilterGroupRow'
import classes from './FilterBuilder.module.css'

interface FilterBuilderProps {
  value: FilterExpression | null
  onChange: (filter: FilterExpression | null) => void
  availableFields?: FilterableField[]
}

export function FilterBuilder({
  value,
  onChange,
}: FilterBuilderProps) {
  const [opened, setOpened] = useState(false)
  // Local copy for editing; sync on open
  const [draft, setDraft] = useState<FilterExpression>(value ?? createEmptyFilter())

  // Sync draft when opening or when external value changes while open
  useEffect(() => {
    if (opened) {
      setDraft(value ?? createEmptyFilter())
    }
  }, [opened, value])

  // Close on Escape
  useEffect(() => {
    if (!opened) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpened(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [opened])

  function handleApply() {
    onChange(draft)
    setOpened(false)
  }

  function handleClear() {
    onChange(null)
    setOpened(false)
  }

  function handleClose() {
    setOpened(false)
  }

  const isActive = value !== null && value.conditions.length > 0

  return (
    <div className={classes.container}>
      <Indicator disabled={!isActive} size={8} offset={3} color="blue">
        <ActionIcon
          variant="white"
          size="lg"
          radius="lg"
          style={(theme) => ({ boxShadow: theme.shadows.md })}
          onClick={() => setOpened((o) => !o)}
          aria-label="進階篩選"
        >
          <IconFilter size="1.2em" />
        </ActionIcon>
      </Indicator>

      {opened && (
        <Paper shadow="xl" withBorder className={classes.panel}>
          <Stack gap="sm">
            <Group justify="space-between" wrap="nowrap">
              <Group gap="xs" wrap="nowrap">
                <IconFilter size="1em" />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  進階篩選
                </span>
              </Group>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                onClick={handleClose}
                aria-label="關閉"
              >
                <IconX size="1em" />
              </ActionIcon>
            </Group>

            <ScrollArea.Autosize mah={400} offsetScrollbars>
              <FilterGroupRow
                group={draft}
                onChange={setDraft}
                isRoot
              />
            </ScrollArea.Autosize>

            <Group justify="space-between" wrap="nowrap">
              <Button
                size="xs"
                variant="subtle"
                color="gray"
                onClick={handleClear}
              >
                清除
              </Button>
              <Button
                size="xs"
                variant="filled"
                onClick={handleApply}
              >
                套用
              </Button>
            </Group>
          </Stack>
        </Paper>
      )}
    </div>
  )
}
