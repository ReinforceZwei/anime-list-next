import { Button, ColorInput, NumberInput, Stack, Switch, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import type { ContextModalProps } from '@/lib/modalStack'
import { useTagMutation } from '@/hooks/useTagMutation'
import type { TagRecord } from '@/types/anime'

type TagFormInnerProps = {
  tag?: TagRecord
}

export function TagFormModal({ context, id, innerProps }: ContextModalProps<TagFormInnerProps>) {
  const { tag } = innerProps
  const isEdit = !!tag
  const { createMutation, updateMutation } = useTagMutation()

  const form = useForm({
    initialValues: {
      name: tag?.name ?? '',
      color: tag?.color ?? '',
      weight: tag?.weight ?? (undefined as number | undefined),
      hidden: tag?.hidden ?? false,
    },
    validate: {
      name: (v) => v.trim().length === 0 ? '請輸入名稱' : null,
    },
  })

  function handleSubmit(values: typeof form.values) {
    if (isEdit) {
      updateMutation.mutate(
        { id: tag.id, ...values },
        { onSuccess: () => context.closeModal(id) },
      )
    } else {
      createMutation.mutate(
        values,
        { onSuccess: () => context.closeModal(id) },
      )
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput
          label="名稱"
          placeholder="例如：動作"
          {...form.getInputProps('name')}
        />
        <ColorInput
          label="顏色"
          placeholder="選擇顏色"
          swatches={[
            '#fa5252', '#e64980', '#be4bdb', '#7950f2',
            '#4c6ef5', '#228be6', '#15aabf', '#12b886',
            '#40c057', '#82c91e', '#fab005', '#fd7e14',
          ]}
          {...form.getInputProps('color')}
        />
        <NumberInput
          label="權重"
          description="決定顯示順序，數字越小越前面"
          placeholder="例如：10"
          min={0}
          {...form.getInputProps('weight')}
        />
        <Switch
          label="隱藏"
          description="在主要清單中隱藏此標籤"
          {...form.getInputProps('hidden', { type: 'checkbox' })}
        />
        <Button type="submit" loading={isPending}>
          {isEdit ? '儲存變更' : '建立標籤'}
        </Button>
      </Stack>
    </form>
  )
}
