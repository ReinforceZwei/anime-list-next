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
      title: '新增標籤',
      innerProps: {},
    })
  }

  function openEditForm(tag: TagRecord) {
    modals.openContextModal({
      modal: 'tagForm',
      title: '編輯標籤',
      innerProps: { tag },
    })
  }

  function confirmDelete(tag: TagRecord) {
    modals.openConfirmModal({
      title: '刪除標籤',
      children: (
        <Text size="sm">
          確定要刪除「{tag.name}」嗎？此操作無法復原。
        </Text>
      ),
      labels: { confirm: '刪除', cancel: '取消' },
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
          新增標籤
        </Button>
      </Group>

      {isLoading ? (
        <Center py="xl">
          <Loader size="sm" />
        </Center>
      ) : !tags || tags.length === 0 ? (
        <Center py="xl">
          <Text size="sm" c="dimmed">尚無標籤，請先新增一個。</Text>
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
                      權重 {tag.weight}
                    </Badge>
                  )}
                  {tag.hidden && (
                    <Badge size="xs" variant="light" color="gray">隱藏</Badge>
                  )}
                </Group>

                <Group gap={4} style={{ flexShrink: 0 }}>
                  <ActionIcon
                    variant="subtle"
                    size="sm"
                    aria-label="編輯標籤"
                    onClick={() => openEditForm(tag)}
                  >
                    <IconEdit size={14} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    size="sm"
                    color="red"
                    aria-label="刪除標籤"
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
