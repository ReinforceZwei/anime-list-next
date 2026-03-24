import { Button, Center, Divider, Loader, Stack, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import type { ContextModalProps } from '@mantine/modals'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import { useUserPreferencesMutation } from '@/hooks/useUserPreferencesMutation'

export function PreferencesModal({ context, id }: ContextModalProps) {
  const { data: prefs, isLoading } = useUserPreferences()
  const { saveMutation } = useUserPreferencesMutation()

  const form = useForm({
    initialValues: {
      pageTitle: prefs?.pageTitle ?? '',
      watchingLabel: prefs?.watchingLabel ?? '',
      completedLabel: prefs?.completedLabel ?? '',
      plannedLabel: prefs?.plannedLabel ?? '',
      droppedLabel: prefs?.droppedLabel ?? '',
    },
  })

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader size="sm" />
      </Center>
    )
  }

  function handleSubmit(values: typeof form.values) {
    saveMutation.mutate(
      { id: prefs?.id, ...values },
      { onSuccess: () => context.closeModal(id) },
    )
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput
          label="Page Title"
          placeholder="My Anime List"
          description="The main heading shown at the top of your list"
          {...form.getInputProps('pageTitle')}
        />
        <Divider label="Section Names" labelPosition="left" />
        <TextInput
          label="Watching"
          placeholder="Watching"
          {...form.getInputProps('watchingLabel')}
        />
        <TextInput
          label="Completed"
          placeholder="Completed"
          {...form.getInputProps('completedLabel')}
        />
        <TextInput
          label="Planned"
          placeholder="Planned"
          {...form.getInputProps('plannedLabel')}
        />
        <TextInput
          label="Dropped"
          placeholder="Dropped"
          {...form.getInputProps('droppedLabel')}
        />
        <Button type="submit" loading={saveMutation.isPending}>
          Save
        </Button>
      </Stack>
    </form>
  )
}
