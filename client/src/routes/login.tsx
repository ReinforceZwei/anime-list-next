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

const loginSearchSchema = (search: Record<string, unknown>) => ({
  redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
})

export const Route = createFileRoute('/login')({
  validateSearch: loginSearchSchema,
  beforeLoad: () => {
    if (pb.authStore.isValid) {
      throw redirect({ to: '/' })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const router = useRouter()
  const { redirect: redirectTo } = Route.useSearch()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const form = useForm({
    initialValues: { email: '', password: '' },
    validate: {
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : 'Invalid email'),
      password: (v) => (v.length > 0 ? null : 'Password is required'),
    },
  })

  const handleSubmit = async (values: { email: string; password: string }) => {
    setError(null)
    setLoading(true)
    try {
      await pb.collection('users').authWithPassword(values.email, values.password)
      await router.navigate({ to: redirectTo ?? '/' })
    } catch {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Center h="100vh">
      <Box w={400}>
        <Title ta="center" mb="xs">
          Welcome back
        </Title>
        <Text c="dimmed" size="sm" ta="center" mb="lg">
          Sign in to your account to continue
        </Text>

        <Paper withBorder shadow="md" p="xl" radius="md">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput
              label="Username or Email"
              placeholder="you@example.com"
              required
              {...form.getInputProps('email')}
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              mt="md"
              {...form.getInputProps('password')}
            />

            {error && (
              <Text c="red" size="sm" mt="sm">
                {error}
              </Text>
            )}

            <Button type="submit" fullWidth mt="xl" loading={loading}>
              Sign in
            </Button>
          </form>
        </Paper>

        <Text c="dimmed" size="xs" ta="center" mt="md">
          Don't have an account?{' '}
          <Anchor size="xs" component={Link} to="/register">
            Register
          </Anchor>
        </Text>
      </Box>
    </Center>
  )
}
