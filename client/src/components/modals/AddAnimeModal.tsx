import { Button, Stack, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import type { ContextModalProps } from '@mantine/modals'

// this modal is just a scaffolding, do not treat the content as actual implementation

export function AddAnimeModal({ context, id }: ContextModalProps) {
  const form = useForm({
    initialValues: { title: '' },
    validate: {
      title: (v) => (v.trim().length === 0 ? 'Title is required' : null),
    },
  })

  function handleSubmit(values: { title: string }) {
    // TODO: call createAnime mutation here
    console.log('add anime', values)
    context.closeModal(id)
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput label="Title" placeholder="Anime title" {...form.getInputProps('title')} />
        <Button type="submit">Add</Button>
      </Stack>
    </form>
  )
}
