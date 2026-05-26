import { ActionIcon, Button, Group, Popover, Text } from '@mantine/core'
import { IconX } from '@tabler/icons-react'
import { ICON_OPTIONS, getIconComponent } from './iconCatalog'

interface IconPickerProps {
  value: string | undefined
  onChange: (icon: string | undefined) => void
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const IconComp = getIconComponent(value)

  return (
    <div>
      <Text size="sm" fw={500} mb={4}>
        圖示
      </Text>
      <Group gap="xs" wrap="nowrap">
        <Popover width={320} position="bottom-start">
          <Popover.Target>
            {value ? (
              <ActionIcon
                variant="filled"
                color="blue"
                size="lg"
              >
                {IconComp && <IconComp size="1em" />}
              </ActionIcon>
            ) : (
              <Button
                variant="outline"
                size="sm"
              >
                選擇圖示
              </Button>
            )}
          </Popover.Target>
          <Popover.Dropdown>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4 }}>
              {ICON_OPTIONS.map(opt => {
                const OptIcon = opt.component
                return (
                  <ActionIcon
                    key={opt.name}
                    variant={value === opt.name ? 'filled' : 'subtle'}
                    color={value === opt.name ? 'blue' : 'gray'}
                    size="lg"
                    onClick={() => onChange(opt.name)}
                    title={opt.name}
                    aria-label={opt.name}
                  >
                    <OptIcon size="1em" />
                  </ActionIcon>
                )
              })}
            </div>
          </Popover.Dropdown>
        </Popover>
        {value && (
          <ActionIcon
            variant="subtle"
            size="sm"
            color="gray"
            onClick={() => onChange(undefined)}
            aria-label="清除圖示"
          >
            <IconX size="1em" />
          </ActionIcon>
        )}
      </Group>
    </div>
  )
}
