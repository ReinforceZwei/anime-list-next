import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { ensureFreshAuth } from '@/lib/auth'
import { useRealtimeSync } from '@/hooks/useRealtimeSync'
import { useAuthRefresh } from '@/hooks/useAuthRefresh'

export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ location }) => {
    // Returns false only when there is no usable session left; the throttle makes
    // this a localStorage read on the usual navigation.
    if (!(await ensureFreshAuth())) {
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
