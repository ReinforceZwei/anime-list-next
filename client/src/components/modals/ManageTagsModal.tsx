import {
  ActionIcon,
  Badge,
  Button,
  Center,
  ColorSwatch,
  Group,
  Loader,
  ScrollArea,
  Stack,
  Text,
} from '@mantine/core'
import { modals } from '@mantine/modals'
import type { ContextModalProps } from '@mantine/modals'
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react'
import { useTagList } from '@/hooks/useTagList'
import { useTagMutation } from '@/hooks/useTagMutation'
import type { TagRecord } from '@/types/anime'

export function ManageTagsModal(_props: ContextModalProps) {
  const { data: tags, isLoading } = useTagList()
  const { deleteMutation } = useTagMutation()

  function openCreateForm() {
    modals.openContextModal({
      modal: 'tagForm',
      title: 'New Tag',
      innerProps: {},
    })
  }

  function openEditForm(tag: TagRecord) {
    modals.openContextModal({
      modal: 'tagForm',
      title: 'Edit Tag',
      innerProps: { tag },
    })
  }

  function confirmDelete(tag: TagRecord) {
    modals.openConfirmModal({
      title: 'Delete tag',
      children: (
        <Text size="sm">
          Delete "{tag.name}"? This cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteMutation.mutate({ id: tag.id }),
    })
  }

  return (
    <Stack gap="sm">
      <Group justify="flex-end">
        <Button
          size="xs"
          leftSection={<IconPlus size={13} />}
          onClick={openCreateForm}
        >
          New Tag
        </Button>
      </Group>

      {isLoading ? (
        <Center py="xl">
          <Loader size="sm" />
        </Center>
      ) : !tags || tags.length === 0 ? (
        <Center py="xl">
          <Text size="sm" c="dimmed">No tags yet. Create one to get started.</Text>
        </Center>
      ) : (
        <ScrollArea.Autosize mah={400} offsetScrollbars>
          <Stack gap={4}>
            {tags.map((tag) => (
              <Group
                key={tag.id}
                justify="space-between"
                wrap="nowrap"
                px="sm"
                py="xs"
                style={{
                  borderRadius: 'var(--mantine-radius-sm)',
                  border: '1px solid var(--mantine-color-default-border)',
                }}
              >
                <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                  <ColorSwatch
                    color={tag.color || 'var(--mantine-color-gray-5)'}
                    size={16}
                    style={{ flexShrink: 0 }}
                  />
                  <Text size="sm" fw={500} lineClamp={1}>{tag.name}</Text>
                  {tag.weight !== undefined && (
                    <Badge size="xs" variant="outline" color="gray">
                      weight {tag.weight}
                    </Badge>
                  )}
                  {tag.hidden && (
                    <Badge size="xs" variant="light" color="gray">hidden</Badge>
                  )}
                </Group>

                <Group gap={4} style={{ flexShrink: 0 }}>
                  <ActionIcon
                    variant="subtle"
                    size="sm"
                    aria-label="Edit tag"
                    onClick={() => openEditForm(tag)}
                  >
                    <IconEdit size={14} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    size="sm"
                    color="red"
                    aria-label="Delete tag"
                    loading={deleteMutation.isPending && deleteMutation.variables?.id === tag.id}
                    onClick={() => confirmDelete(tag)}
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                </Group>
              </Group>
            ))}
          </Stack>
        </ScrollArea.Autosize>
      )}
    </Stack>
  )
}
