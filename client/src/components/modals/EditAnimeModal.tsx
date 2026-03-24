import {
  ActionIcon,
  Button,
  Divider,
  Group,
  Rating,
  Select,
  Stack,
  Tabs,
  Text,
  Textarea,
  TextInput,
  Tooltip,
} from '@mantine/core'
import { DateTimePicker } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { modals } from '@mantine/modals'
import type { ContextModalProps } from '@mantine/modals'
import { IconTags } from '@tabler/icons-react'
import { useAnimeMutation } from '@/hooks/useAnimeMutation'
import { useTagList } from '@/hooks/useTagList'
import { TagMultiSelect } from '@/components/TagMultiSelect/TagMultiSelect'
import type { AnimeRecord } from '@/types/anime'
import dayjs from 'dayjs'

type EditAnimeInnerProps = {
  anime: AnimeRecord
}


function parseLocalDateString(val: string | Date | null): Date | null {
  if (!val) return null
  if (val instanceof Date) return val
  return dayjs(val).toDate()
}

export function EditAnimeModal({ context, id, innerProps }: ContextModalProps<EditAnimeInnerProps>) {
  const { anime } = innerProps
  const { updateMutation } = useAnimeMutation()
  const { data: tagList } = useTagList()

  const availableTags = (tagList ?? []).filter((t) => !t.deleted)
  const knownTagIds = new Set(availableTags.map((t) => t.id))

  const form = useForm({
    initialValues: {
      customName: anime.customName ?? '',
      status: anime.status ?? '',
      downloadStatus: anime.downloadStatus ?? '',
      rating: anime.rating ?? 0,
      comment: anime.comment ?? '',
      remark: anime.remark ?? '',
      tags: (anime.tags ?? []).filter((id) => knownTagIds.has(id)),
      startedAt: anime.startedAt ? new Date(anime.startedAt) : null,
      completedAt: anime.completedAt ? new Date(anime.completedAt) : null,
    },
  })

  function handleSubmit(values: typeof form.values) {
    updateMutation.mutate(
      {
        ...anime,
        id: anime.id,
        customName: values.customName || undefined,
        status: values.status as AnimeRecord['status'],
        downloadStatus: values.downloadStatus as AnimeRecord['downloadStatus'],
        rating: values.rating || undefined,
        comment: values.comment || undefined,
        remark: values.remark || undefined,
        tags: values.tags,
        startedAt: values.startedAt?.toISOString(),
        completedAt: values.completedAt?.toISOString(),
      },
      { onSuccess: () => context.closeModal(id) },
    )
  }

  function openManageTags() {
    modals.openContextModal({
      modal: 'manageTags',
      title: 'Manage Tags',
      innerProps: {},
    })
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      {anime.tmdbId && (anime.cachedTitle || anime.cachedSeasonName) && (
        <>
          <Stack gap={2} mb="xs">
            {anime.cachedTitle && (
              <Text fw={600} size="md" lineClamp={2}>
                {anime.cachedTitle}
              </Text>
            )}
            {anime.cachedSeasonName && (
              <Text size="sm" c="dimmed">
                {anime.cachedSeasonName}
              </Text>
            )}
          </Stack>
          <Divider mb="md" />
        </>
      )}

      <Tabs defaultValue="general">
        <Tabs.List>
          <Tabs.Tab value="general">General</Tabs.Tab>
          <Tabs.Tab value="other">Other</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="general" pt="md">
          <Stack>
            <TextInput
              label="Custom Name"
              placeholder="Enter a name"
              {...form.getInputProps('customName')}
            />

            <Select
              label="Status"
              data={[
                { value: '', label: 'None' },
                { value: 'planned', label: 'Planned' },
                { value: 'watching', label: 'Watching' },
                { value: 'completed', label: 'Completed' },
                { value: 'dropped', label: 'Dropped' },
              ]}
              {...form.getInputProps('status')}
            />

            <Select
              label="Download Status"
              data={[
                { value: '', label: 'None' },
                { value: 'pending', label: 'Pending' },
                { value: 'downloading', label: 'Downloading' },
                { value: 'downloaded', label: 'Downloaded' },
              ]}
              {...form.getInputProps('downloadStatus')}
            />

            <Stack gap={4}>
              <Text size="sm" fw={500}>Rating</Text>
              <Rating
                count={10}
                value={form.values.rating}
                onChange={(val) => form.setFieldValue('rating', val)}
              />
            </Stack>

            <Textarea
              label="Comment"
              placeholder="Add a comment..."
              autosize
              minRows={2}
              {...form.getInputProps('comment')}
            />

            <TextInput
              label="Remark"
              placeholder="Add a remark..."
              {...form.getInputProps('remark')}
            />

            <Group gap="xs" align="flex-end">
              <TagMultiSelect
                label="Tags"
                placeholder="Pick tags"
                data={availableTags}
                value={form.values.tags}
                onChange={(ids) => form.setFieldValue('tags', ids)}
                style={{ flex: 1 }}
              />
              <Tooltip label="Manage tags" withArrow>
                <ActionIcon
                  variant="default"
                  size="lg"
                  aria-label="Manage tags"
                  mb={1}
                  onClick={openManageTags}
                >
                  <IconTags size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="other" pt="md">
          <Stack>
            <DateTimePicker
              label="Started At"
              placeholder="Pick date and time"
              clearable
              value={form.values.startedAt}
              onChange={(val) => form.setFieldValue('startedAt', parseLocalDateString(val as string | null))}
            />
            <DateTimePicker
              label="Completed At"
              placeholder="Pick date and time"
              clearable
              value={form.values.completedAt}
              onChange={(val) => form.setFieldValue('completedAt', parseLocalDateString(val as string | null))}
            />
          </Stack>
        </Tabs.Panel>
      </Tabs>

      <Group justify="flex-end" mt="lg">
        <Button variant="default" onClick={() => context.closeModal(id)}>
          Cancel
        </Button>
        <Button type="submit" loading={updateMutation.isPending}>
          Save
        </Button>
      </Group>
    </form>
  )
}
