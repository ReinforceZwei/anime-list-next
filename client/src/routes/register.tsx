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
      email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : '電子郵件格式不正確'),
      name: (v) => (v.trim().length > 0 ? null : '請輸入名稱'),
      password: (v) => (v.length >= 8 ? null : '密碼至少需要 8 個字元'),
      confirmPassword: (v, values) =>
        v === values.password ? null : '兩次輸入的密碼不一致',
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
        err instanceof Error ? err.message : '註冊失敗，請稍後再試。'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Center h="100vh">
      <Box w={400}>
        <Title ta="center" mb="xs">
          建立帳號
        </Title>
        <Text c="dimmed" size="sm" ta="center" mb="lg">
          填寫以下資料即可開始
        </Text>

        <Paper withBorder shadow="md" p="xl" radius="md">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput
              label="電子郵件"
              placeholder="you@example.com"
              required
              {...form.getInputProps('email')}
            />
            <TextInput
              label="名稱"
              placeholder="顯示名稱"
              required
              mt="md"
              {...form.getInputProps('name')}
            />
            <PasswordInput
              label="密碼"
              placeholder="至少 8 個字元"
              required
              mt="md"
              {...form.getInputProps('password')}
            />
            <PasswordInput
              label="確認密碼"
              placeholder="再次輸入密碼"
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
              建立帳號
            </Button>
          </form>
        </Paper>

        <Text c="dimmed" size="xs" ta="center" mt="md">
          已經有帳號了？{' '}
          <Anchor size="xs" component={Link} to="/login">
            登入
          </Anchor>
        </Text>
      </Box>
    </Center>
  )
}
