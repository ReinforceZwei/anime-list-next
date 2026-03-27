import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { MantineProvider, localStorageColorSchemeManager } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import { modals } from '@/components/modals'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { theme } from '@/theme'
import { DatesProvider } from '@mantine/dates'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-tw'

const queryClient = new QueryClient()
const colorSchemeManager = localStorageColorSchemeManager({ key: 'color-scheme' })
dayjs.locale('zh-tw')

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider colorSchemeManager={colorSchemeManager} theme={theme}>
        <DatesProvider settings={{ locale: 'zh-TW', firstDayOfWeek: 0 }}>
          <ModalsProvider modals={modals}>
            <Notifications />
            <div>
              <Outlet />
            </div>
            <TanStackRouterDevtools />
            <ReactQueryDevtools />
          </ModalsProvider>
        </DatesProvider>
      </MantineProvider>
    </QueryClientProvider>
  )
}
