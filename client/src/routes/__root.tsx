import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { MantineProvider, localStorageColorSchemeManager } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { QueryClientProvider } from '@tanstack/react-query'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'
import { modals } from '@/components/modals'
import { ModalStackProvider } from '@/lib/modalStack'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { theme } from '@/theme'
import { DatesProvider } from '@mantine/dates'
import { WallpaperLayer } from '@/components/WallpaperLayer/WallpaperLayer'
import { GlassmorphismLayer } from '@/components/GlassmorphismLayer/GlassmorphismLayer'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-tw'
import { useEffect } from 'react'
import { watchSessionRestart } from '@/lib/auth'
import { queryClient } from '@/lib/queryClient'

const colorSchemeManager = localStorageColorSchemeManager({
  key: 'color-scheme',
})
dayjs.locale('zh-tw')

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  useEffect(
    // A login that follows a lapsed token must not serve the previous session's
    // cached records. Routine hourly renewals of a still-valid token do not reset.
    () => watchSessionRestart(() => queryClient.clear()),
    [],
  )

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider colorSchemeManager={colorSchemeManager} theme={theme}>
        <DatesProvider settings={{ locale: 'zh-TW', firstDayOfWeek: 0 }}>
          <ModalStackProvider modals={modals}>
            <Notifications position="top-left" />
            <WallpaperLayer />
            <GlassmorphismLayer />
            <div>
              <Outlet />
            </div>
            <TanStackRouterDevtools />
            <ReactQueryDevtools buttonPosition="bottom-left" />
          </ModalStackProvider>
        </DatesProvider>
      </MantineProvider>
    </QueryClientProvider>
  )
}
