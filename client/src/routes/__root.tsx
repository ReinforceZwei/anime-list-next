import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { MantineProvider } from '@mantine/core'
import '@mantine/core/styles.css'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <MantineProvider>
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
    </MantineProvider>
  )
}
