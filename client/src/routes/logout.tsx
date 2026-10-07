import { createFileRoute, redirect } from '@tanstack/react-router'
import { forgetSession } from '@/lib/auth'

export const Route = createFileRoute('/logout')({
  beforeLoad: () => {
    forgetSession()
    throw redirect({ to: '/login', search: { redirect: '/' } })
  },
})
