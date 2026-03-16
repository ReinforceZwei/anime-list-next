import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { pb } from '@/lib/pb'
import { useAnimeRealtimeSync, useTagRealtimeSync } from '@/hooks/useAnimeRealtimeSync'

export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ location }) => {
    if (!pb.authStore.isValid) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
  },
  component: AuthLayout,
})

function AuthLayout() {
  useAnimeRealtimeSync()
  useTagRealtimeSync()
  return <Outlet />
}
