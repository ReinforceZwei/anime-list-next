import { createFileRoute, redirect } from '@tanstack/react-router'
import { forgetSession } from '@/lib/auth'
import { queryClient } from '@/lib/queryClient'

export const Route = createFileRoute('/logout')({
  beforeLoad: () => {
    forgetSession()
    // Drop the cached per-user records too, so the next login cannot render them.
    queryClient.clear()
    throw redirect({ to: '/login', search: { redirect: '/' } })
  },
})
