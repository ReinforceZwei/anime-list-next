import { QueryClient } from '@tanstack/react-query'

/**
 * The app-wide query cache.
 *
 * Lives outside `__root.tsx` so non-React callers can act on it too — `/logout`
 * clears it without needing the provider's context.
 */
export const queryClient = new QueryClient()
