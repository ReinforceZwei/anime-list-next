import { Button, ColorInput, NumberInput, Stack, Switch, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import type { ContextModalProps } from '@mantine/modals'
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
      name: (v) => v.trim().length === 0 ? 'Name is required' : null,
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
          label="Name"
          placeholder="e.g. Action"
          {...form.getInputProps('name')}
        />
        <ColorInput
          label="Color"
          placeholder="Pick a color"
          swatches={[
            '#fa5252', '#e64980', '#be4bdb', '#7950f2',
            '#4c6ef5', '#228be6', '#15aabf', '#12b886',
            '#40c057', '#82c91e', '#fab005', '#fd7e14',
          ]}
          {...form.getInputProps('color')}
        />
        <NumberInput
          label="Weight"
          description="Controls display order — lower weight appears first"
          placeholder="e.g. 10"
          min={0}
          {...form.getInputProps('weight')}
        />
        <Switch
          label="Hidden"
          description="Hide this tag from the main view"
          {...form.getInputProps('hidden', { type: 'checkbox' })}
        />
        <Button type="submit" loading={isPending}>
          {isEdit ? 'Save Changes' : 'Create Tag'}
        </Button>
      </Stack>
    </form>
  )
}
