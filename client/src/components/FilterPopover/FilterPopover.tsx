import { useState, useEffect } from 'react'
import {
  ActionIcon,
  Indicator,
  Paper,
  Stack,
  Group,
  Button,
} from '@mantine/core'
import { IconFilter, IconX } from '@tabler/icons-react'
import type { FilterExpression } from '@/types/filter'
import { createEmptyFilter } from '@/types/filter'
import { FilterBuilder } from '../FilterBuilder/FilterBuilder'
import classes from './FilterPopover.module.css'

interface FilterPopoverProps {
  /** The currently applied filter (null = none). */
  value: FilterExpression | null
  /** Called with the new filter on Apply, or null on Clear. */
  onChange: (filter: FilterExpression | null) => void
}

export function FilterPopover({ value, onChange }: FilterPopoverProps) {
  const [opened, setOpened] = useState(false)
  // Local copy for editing; sync on open
  const [draft, setDraft] = useState<FilterExpression>(() => value ?? createEmptyFilter())

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
    onChange(draft.conditions.length > 0 ? draft : null)
    setOpened(false)
  }

  function handleClear() {
    onChange(null)
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
                onClick={() => setOpened(false)}
                aria-label="關閉"
              >
                <IconX size="1em" />
              </ActionIcon>
            </Group>

            <FilterBuilder
              value={draft}
              onChange={setDraft}
            />

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
                disabled={draft.conditions.length === 0}
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
