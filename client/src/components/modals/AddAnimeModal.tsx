import { Button, Stack, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import type { ContextModalProps } from '@mantine/modals'
import { useAnimeMutation } from '@/hooks/useAnimeMutation'
import { useEffect, useRef } from 'react'

export function AddAnimeModal({ context, id }: ContextModalProps) {
  const { createMutation } = useAnimeMutation()
  const inputRef = useRef<HTMLInputElement>(null)
  const form = useForm({
    initialValues: { title: '' },
    validate: {
      title: (v) => (v.trim().length === 0 ? 'Title is required' : null),
    },
  })

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }, [])

  function handleSubmit(values: { title: string }) {
    createMutation.mutate(
      { customName: values.title },
      { onSuccess: () => context.closeModal(id) },
    )
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        <TextInput
          label="Title"
          placeholder="Anime title"
          data-autofocus
          ref={inputRef}
          {...form.getInputProps('title')}
        />
        <Button type="submit" loading={createMutation.isPending}>
          Add
        </Button>
      </Stack>
    </form>
  )
}
