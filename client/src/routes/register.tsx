import { createFileRoute, Link, redirect, useRouter } from '@tanstack/react-router'
import {
  Anchor,
  Box,
  Button,
  Center,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useState } from 'react'
import { pb } from '../lib/pb'

export const Route = createFileRoute('/register')({
  beforeLoad: () => {
    if (pb.authStore.isValid) {
      throw redirect({ to: '/' })
    }
  },
  component: RegisterPage,
})

function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const form = useForm({
    initialValues: { email: '', name: '', password: '', confirmPassword: '' },
    validate: {
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : 'Invalid email'),
      name: (v) => (v.trim().length > 0 ? null : 'Name is required'),
      password: (v) => (v.length >= 8 ? null : 'Password must be at least 8 characters'),
      confirmPassword: (v, values) =>
        v === values.password ? null : 'Passwords do not match',
    },
  })

  const handleSubmit = async (values: {
    email: string
    name: string
    password: string
    confirmPassword: string
  }) => {
    setError(null)
    setLoading(true)
    try {
      await pb.collection('users').create({
        email: values.email,
        name: values.name,
        password: values.password,
        passwordConfirm: values.confirmPassword,
      })
      await pb.collection('users').authWithPassword(values.email, values.password)
      await router.navigate({ to: '/' })
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Registration failed. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Center h="100vh">
      <Box w={400}>
        <Title ta="center" mb="xs">
          Create an account
        </Title>
        <Text c="dimmed" size="sm" ta="center" mb="lg">
          Fill in the details below to get started
        </Text>

        <Paper withBorder shadow="md" p="xl" radius="md">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput
              label="Email"
              placeholder="you@example.com"
              required
              {...form.getInputProps('email')}
            />
            <TextInput
              label="Name"
              placeholder="Your display name"
              required
              mt="md"
              {...form.getInputProps('name')}
            />
            <PasswordInput
              label="Password"
              placeholder="At least 8 characters"
              required
              mt="md"
              {...form.getInputProps('password')}
            />
            <PasswordInput
              label="Confirm password"
              placeholder="Repeat your password"
              required
              mt="md"
              {...form.getInputProps('confirmPassword')}
            />

            {error && (
              <Text c="red" size="sm" mt="sm">
                {error}
              </Text>
            )}

            <Button type="submit" fullWidth mt="xl" loading={loading}>
              Create account
            </Button>
          </form>
        </Paper>

        <Text c="dimmed" size="xs" ta="center" mt="md">
          Already have an account?{' '}
          <Anchor size="xs" component={Link} to="/login">
            Sign in
          </Anchor>
        </Text>
      </Box>
    </Center>
  )
}
