import {
  ActionIcon,
  Button,
  Collapse,
  Divider,
  Group,
  NumberInput,
  Rating,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  Tooltip,
  type NumberInputHandlers,
} from '@mantine/core'
import { DateTimePicker } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { modals } from '@/lib/modalStack'
import type { ContextModalProps } from '@/lib/modalStack'
import {
  IconChevronDown,
  IconChevronUp,
  IconMinus,
  IconPlus,
  IconTags,
} from '@tabler/icons-react'
import { useAnimeMutation } from '@/hooks/useAnimeMutation'
import { useTagList } from '@/hooks/useTagList'
import { TagMultiSelect } from '@/components/TagMultiSelect/TagMultiSelect'
import dayjs from 'dayjs'
import { useEffect, useRef } from 'react'

type AddAnimeInnerProps = {
  onSaved?: (id: string) => void
}

function parseLocalDateString(val: string | Date | null): Date | null {
  if (!val) return null
  if (val instanceof Date) return val
  return dayjs(val).toDate()
}

export function AddAnimeModal({ context, innerProps }: ContextModalProps<AddAnimeInnerProps>) {
  const { onSaved } = innerProps
  const { createMutation } = useAnimeMutation()
  const { data: tagList } = useTagList()
  const availableTags = tagList ?? []

  const inputRef = useRef<HTMLInputElement>(null)
  const ratingNumberInputHandlersRef = useRef<NumberInputHandlers>(null)
  const [advancedOpen, { toggle: toggleAdvanced }] = useDisclosure(false)

  const form = useForm({
    initialValues: {
      title: '',
      status: '' as string,
      downloadStatus: '' as string,
      rating: 0 as number,
      comment: '',
      remark: '',
      tags: [] as string[],
      startedAt: null as Date | null,
      completedAt: null as Date | null,
      createdOverride: null as Date | null,
      tmdbId: null as number | null,
      tmdbMediaType: '' as string,
      tmdbSeasonNumber: null as number | null,
    },
    validate: {
      title: (v) => (v.trim().length === 0 ? '請輸入標題' : null),
    },
  })

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }, [])

  function handleSubmit(values: typeof form.values) {
    createMutation.mutate(
      {
        customName: values.title,
        status: values.status as AnimeCreateStatus,
        downloadStatus: values.downloadStatus as AnimeCreateDownloadStatus,
        rating: values.rating || null,
        comment: values.comment || null,
        remark: values.remark || null,
        tags: values.tags,
        startedAt: values.startedAt ? values.startedAt.toISOString() : null,
        completedAt: values.completedAt ? values.completedAt.toISOString() : null,
        createdOverride: values.createdOverride ? values.createdOverride.toISOString() : undefined,
        tmdbId: values.tmdbId ?? 0,
        tmdbMediaType: values.tmdbMediaType as AnimeCreateMediaType,
        tmdbSeasonNumber: values.tmdbSeasonNumber ?? 0,
      },
      {
        onSuccess: (record) => {
          context.closeAll()
          onSaved?.(record.id)
        },
      },
    )
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
      <Stack>
        <TextInput
          label="標題"
          placeholder="動畫標題"
          data-autofocus
          ref={inputRef}
          {...form.getInputProps('title')}
        />

        <Button
          variant="subtle"
          size="compact-sm"
          rightSection={advancedOpen ? <IconChevronUp size="1em" /> : <IconChevronDown size="1em" />}
          onClick={toggleAdvanced}
          justify="space-between"
          fullWidth
        >
          進階設定
        </Button>

        <Collapse in={advancedOpen}>
          <Stack>
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

            <Stack gap={4}>
              <NumberInput
                label="評分（0-5）"
                placeholder="0 – 5"
                min={0}
                max={5}
                step={0.1}
                decimalScale={1}
                clampBehavior="strict"
                hideControls
                handlersRef={ratingNumberInputHandlersRef}
                leftSection={
                  <ActionIcon
                    variant="subtle"
                    size="sm"
                    disabled={!form.values.rating || form.values.rating <= 0}
                    onClick={() => ratingNumberInputHandlersRef.current?.decrement()}
                  >
                    <IconMinus size="1em" />
                  </ActionIcon>
                }
                rightSection={
                  <ActionIcon
                    variant="subtle"
                    size="sm"
                    disabled={form.values.rating >= 5}
                    onClick={() => ratingNumberInputHandlersRef.current?.increment()}
                  >
                    <IconPlus size="1em" />
                  </ActionIcon>
                }
                {...form.getInputProps('rating')}
              />
              <Rating
                value={form.values.rating}
                fractions={2}
                size="sm"
                onChange={(val) => form.setFieldValue('rating', val)}
              />
            </Stack>

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

            <DateTimePicker
              label="建立時間（覆蓋）"
              placeholder="選擇日期與時間"
              clearable
              value={form.values.createdOverride}
              onChange={(val) => form.setFieldValue('createdOverride', parseLocalDateString(val as string | null))}
            />

            <Divider label="TMDb 資料" labelPosition="left" />

            <Text size="xs" c="dimmed">
              不建議手動填寫 TMDb 欄位，除非您清楚知道自己在做什麼。
            </Text>

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
        </Collapse>

        <Button type="submit" loading={createMutation.isPending}>
          加入
        </Button>
      </Stack>
    </form>
  )
}

// Local cast helpers – keep narrowing out of the JSX
type AnimeCreateStatus = '' | 'planned' | 'watching' | 'completed' | 'dropped'
type AnimeCreateDownloadStatus = '' | 'pending' | 'downloading' | 'downloaded'
type AnimeCreateMediaType = '' | 'tv' | 'movie'
