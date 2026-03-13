import { Button, Stack, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import type { ContextModalProps } from '@mantine/modals'

// this modal is just a scaffolding, do not treat the content as actual implementation

type EditAnimeInnerProps = {
  animeId: string
  initialTitle: string
}

export function EditAnimeModal({ context, id, innerProps }: ContextModalProps<EditAnimeInnerProps>) {
  const form = useForm({
    initialValues: { title: innerProps.initialTitle },
    validate: {
      title: (v) => (v.trim().length === 0 ? 'Title is required' : null),
    },
  })

  function handleSubmit(values: { title: string }) {
    // TODO: call updateAnime mutation here
    console.log('edit anime', innerProps.animeId, values)
    context.closeModal(id)
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput label="Title" {...form.getInputProps('title')} />
        <Button type="submit">Save</Button>
      </Stack>
    </form>
  )
}
