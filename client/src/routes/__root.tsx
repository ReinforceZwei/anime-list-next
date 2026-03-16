import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { MantineProvider, localStorageColorSchemeManager } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@mantine/core/styles.css'
import { modals } from '@/components/modals'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { theme } from '@/theme'

const queryClient = new QueryClient()
const colorSchemeManager = localStorageColorSchemeManager({ key: 'color-scheme' })

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider colorSchemeManager={colorSchemeManager} theme={theme}>
        <ModalsProvider modals={modals}>
          <div style={{
            // backgroundImage: 'url(/21.jpg)',
            // backgroundSize: 'cover',
            // backgroundPosition: 'right',
            // backgroundRepeat: 'no-repeat',
            // height: '100vh',
            // width: '100vw',
          }}>
            <Outlet />
          </div>
          <TanStackRouterDevtools />
          <ReactQueryDevtools />
        </ModalsProvider>
      </MantineProvider>
    </QueryClientProvider>
  )
}
