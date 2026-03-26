import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { isTokenExpired } from 'pocketbase'
import { pb } from '@/lib/pb'
import { useRealtimeSync } from '@/hooks/useRealtimeSync'
import { useAuthRefresh } from '@/hooks/useAuthRefresh'

// 3 days
const REFRESH_THRESHOLD_SECONDS = 3 * 24 * 60 * 60

export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ location }) => {
    if (
      pb.authStore.isValid &&
      isTokenExpired(pb.authStore.token, REFRESH_THRESHOLD_SECONDS)
    ) {
      try {
        await pb.collection('users').authRefresh()
      } catch {
        pb.authStore.clear()
      }
    }

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
  useAuthRefresh()
  useRealtimeSync()
  return <Outlet />
}
