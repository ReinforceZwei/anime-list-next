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
      email: (v) => (v.length > 0 ? null : '請輸入電子郵件或使用者名稱'),
      password: (v) => (v.length > 0 ? null : '請輸入密碼'),
    },
  })

  const handleSubmit = async (values: { email: string; password: string }) => {
    setError(null)
    setLoading(true)
    try {
      await pb.collection('users').authWithPassword(values.email, values.password)
      await router.navigate({ to: redirectTo ?? '/' })
    } catch {
      setError('電子郵件／使用者名稱或密碼錯誤。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Center h="100vh">
      <Box w={400}>
        <Title ta="center" mb="xs">
          歡迎回來
        </Title>
        <Text c="dimmed" size="sm" ta="center" mb="lg">
          登入帳號以繼續
        </Text>

        <Paper withBorder shadow="md" p="xl" radius="md">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput
              label="使用者名稱或電子郵件"
              placeholder="you@example.com"
              required
              {...form.getInputProps('email')}
            />
            <PasswordInput
              label="密碼"
              placeholder="密碼"
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
              登入
            </Button>
          </form>
        </Paper>

        <Text c="dimmed" size="xs" ta="center" mt="md">
          還沒有帳號？{' '}
          <Anchor size="xs" component={Link} to="/register">
            註冊
          </Anchor>
        </Text>
      </Box>
    </Center>
  )
}
