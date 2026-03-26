import { createFileRoute, redirect } from '@tanstack/react-router'
import { pb } from '../lib/pb'

export const Route = createFileRoute('/logout')({
  beforeLoad: () => {
    pb.authStore.clear()
    throw redirect({ to: '/login', search: { redirect: '/' } })
  },
})
