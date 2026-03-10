# Anime list next (client)

## Development

### Create router page

1. Add a file under `src/routes/`, e.g. `src/routes/about.tsx`
2. Export a `Route` using `createFileRoute`:

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return <div>About</div>
}
```

3. The route is auto-registered — `routeTree.gen.ts` regenerates on the next `npm run dev`.