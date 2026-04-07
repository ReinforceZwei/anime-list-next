import {
  ActionIcon,
  Alert,
  Button,
  Divider,
  Group,
  NumberInput,
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
import { modals } from '@/lib/modalStack'
import type { ContextModalProps } from '@/lib/modalStack'
import { IconAlertTriangle, IconLink, IconTags, IconTrash } from '@tabler/icons-react'
import { useAnimeMutation } from '@/hooks/useAnimeMutation'
import { useTagList } from '@/hooks/useTagList'
import { TagMultiSelect } from '@/components/TagMultiSelect/TagMultiSelect'
import { RatingInput } from '@/components/RatingInput/RatingInput'
import type { AnimeRecord } from '@/types/anime'
import dayjs from 'dayjs'

type EditAnimeInnerProps = {
  anime: AnimeRecord
  onSaved?: (id: string) => void
  onDeleted?: () => void
}


function parseLocalDateString(val: string | Date | null): Date | null {
  if (!val) return null
  if (val instanceof Date) return val
  return dayjs(val).toDate()
}

export function EditAnimeModal({ context, id, innerProps }: ContextModalProps<EditAnimeInnerProps>) {
  const { anime, onSaved, onDeleted } = innerProps
  const { updateMutation, deleteMutation } = useAnimeMutation()
  const { data: tagList } = useTagList()

  const availableTags = tagList ?? []
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
      tmdbId: anime.tmdbId ?? null,
      tmdbMediaType: anime.tmdbMediaType ?? '',
      tmdbSeasonNumber: anime.tmdbSeasonNumber ?? null,
    },
  })
  function handleSubmit(values: typeof form.values) {
    const statusChanged = values.status !== anime.status
    updateMutation.mutate(
      {
        ...anime,
        id: anime.id,
        customName: values.customName || null,
        status: values.status as AnimeRecord['status'],
        downloadStatus: values.downloadStatus as AnimeRecord['downloadStatus'],
        rating: values.rating || null,
        comment: values.comment || null,
        remark: values.remark || null,
        tags: values.tags,
        startedAt: values.startedAt ? values.startedAt.toISOString() : null,
        completedAt: values.completedAt ? values.completedAt.toISOString() : null,
        tmdbId: values.tmdbId ?? 0,
        tmdbMediaType: values.tmdbMediaType,
        tmdbSeasonNumber: values.tmdbSeasonNumber ?? 0,
      },
      {
        onSuccess: (record) => {
          context.closeModal(id)
          if (statusChanged) onSaved?.(record.id)
        },
      },
    )
  }

  function handleDelete() {
    modals.openConfirmModal({
      title: '刪除動畫',
      children: (
        <Text size="sm">
          確定要刪除此動畫嗎？此操作無法復原。
        </Text>
      ),
      labels: { confirm: '刪除', cancel: '取消' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        // mutate() callbacks are observer-bound and silently dropped when called
        // from a nested modal context. mutateAsync() returns a plain Promise so
        // .then() always fires regardless of observer lifecycle.
        deleteMutation.mutateAsync({ id: anime.id })
          .then(() => { modals.closeAll(); onDeleted?.() })
          .catch(() => {})
      },
    })
  }

  function openManageTags() {
    modals.openContextModal({
      modal: 'manageTags',
      title: '管理標籤',
      innerProps: {},
    })
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      {Boolean(anime.tmdbId) && (anime.cachedTitle || anime.cachedSeasonName) && (
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
          <Tabs.Tab value="general">一般</Tabs.Tab>
          <Tabs.Tab value="other">其他</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="general" pt="md">
          <Stack>
            <TextInput
              label="自訂名稱"
              placeholder="輸入名稱"
              {...form.getInputProps('customName')}
            />

            <Select
              label="觀看狀態"
              data={[
                { value: '', label: '無' },
                { value: 'planned', label: '待看' },
                { value: 'watching', label: '觀看中' },
                { value: 'completed', label: '已看完' },
                { value: 'dropped', label: '棄番' },
              ]}
              {...form.getInputProps('status')}
            />

            <Select
              label="下載狀態"
              data={[
                { value: '', label: '無' },
                { value: 'pending', label: '等待下載' },
                { value: 'downloading', label: '下載中' },
                { value: 'downloaded', label: '已下載' },
              ]}
              {...form.getInputProps('downloadStatus')}
            />

            <RatingInput {...form.getInputProps('rating')} />

            <Textarea
              label="心得"
              placeholder="輸入心得…"
              autosize
              minRows={2}
              {...form.getInputProps('comment')}
            />

            <TextInput
              label="備註"
              placeholder="輸入備註…"
              {...form.getInputProps('remark')}
            />

            <Group gap="xs" align="flex-end">
              <TagMultiSelect
                label="標籤"
                placeholder="選擇標籤"
                data={availableTags}
                value={form.values.tags}
                onChange={(ids) => form.setFieldValue('tags', ids)}
                style={{ flex: 1 }}
              />
              <Tooltip label="管理標籤" withArrow>
                <ActionIcon
                  variant="default"
                  size="lg"
                  aria-label="管理標籤"
                  mb={1}
                  onClick={openManageTags}
                >
                  <IconTags size="1em" />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="other" pt="md">
          <Stack>
            <DateTimePicker
              label="開始時間"
              placeholder="選擇日期與時間"
              clearable
              value={form.values.startedAt}
              onChange={(val) => form.setFieldValue('startedAt', parseLocalDateString(val as string | null))}
            />
            <DateTimePicker
              label="完成時間"
              placeholder="選擇日期與時間"
              clearable
              value={form.values.completedAt}
              onChange={(val) => form.setFieldValue('completedAt', parseLocalDateString(val as string | null))}
            />

            <Divider label="TMDb 資料" labelPosition="left" />

            <Button
              variant="default"
              leftSection={<IconLink size="1em" />}
              onClick={() => {
                modals.openContextModal({
                  modal: 'tmdbSearch',
                  title: '重新連結至 TMDb',
                  size: '56rem',
                  innerProps: { mode: 'link', animeId: anime.id, initialQuery: anime.customName || anime.cachedTitle || '' },
                })
              }}
            >
              重新連結至 TMDb
            </Button>

            <Alert
              icon={<IconAlertTriangle size="1em" />}
              color="yellow"
              variant="light"
            >
              不建議手動修改 TMDb 欄位，除非您清楚知道自己在做什麼。
            </Alert>

            <NumberInput
              label="TMDb ID"
              placeholder="輸入 TMDb ID"
              min={1}
              allowDecimal={false}
              value={form.values.tmdbId ?? ''}
              onChange={(val) => form.setFieldValue('tmdbId', val === '' ? null : Number(val))}
            />

            <Select
              label="TMDb 媒體類型"
              data={[
                { value: '', label: '無' },
                { value: 'tv', label: '電視 (TV)' },
                { value: 'movie', label: '電影 (Movie)' },
              ]}
              {...form.getInputProps('tmdbMediaType')}
            />

            {form.values.tmdbMediaType === 'tv' && (
              <NumberInput
                label="TMDb 季數"
                placeholder="輸入季數"
                min={0}
                allowDecimal={false}
                value={form.values.tmdbSeasonNumber ?? ''}
                onChange={(val) => form.setFieldValue('tmdbSeasonNumber', val === '' ? null : Number(val))}
              />
            )}
          </Stack>
        </Tabs.Panel>
      </Tabs>

      <Group justify="flex-end" mt="lg">
        <Tooltip label="刪除動畫" withArrow>
          <ActionIcon
            color="red"
            variant="subtle"
            size="lg"
            aria-label="刪除動畫"
            loading={deleteMutation.isPending}
            onClick={handleDelete}
            mr="auto"
          >
            <IconTrash size="1em" />
          </ActionIcon>
        </Tooltip>
        <Button variant="default" onClick={() => context.closeModal(id)}>
          取消
        </Button>
        <Button type="submit" loading={updateMutation.isPending}>
          儲存
        </Button>
      </Group>
    </form>
  )
}
