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


## Planned Project Structure


```
src/
├── main.tsx
├── index.css
├── assets/
│
├── lib/
│   ├── pb.ts              ← existing PB singleton
│   └── queryClient.ts     ← TanStack Query client instance
│
├── api/                   ← raw PB SDK calls (no React, no hooks)
│   ├── anime.ts           ← fetchAnimeList, createAnime, updateAnime, deleteAnime
│   └── auth.ts            ← login, register helpers (if extracted from routes)
│
├── hooks/                 ← TanStack Query + PB realtime combined
│   ├── useAnimeList.ts    ← useQuery + pb.collection().subscribe() for live updates
│   ├── useAnime.ts        ← single item query
│   └── useAnimeMutations.ts  ← useMutation wrappers for create/update/delete
│
├── components/
│   ├── AnimeList/         ← feature-sized component split into pieces
│   │   ├── index.ts       ← re-exports AnimeList as default
│   │   ├── AnimeList.tsx  ← orchestrator, uses useAnimeList
│   │   ├── AnimeCard.tsx
│   │   └── AnimeListSkeleton.tsx
│   │
│   └── modals/            ← Mantine modals registry entries
│       ├── index.ts       ← exports `modals` map for ModalsProvider
│       ├── AddAnimeModal.tsx
│       └── EditAnimeModal.tsx
│
├── types/
│   └── anime.ts           ← PocketBase record types (AnimeRecord, etc.)
│
└── routes/                ← TanStack Router (unchanged)
    ├── __root.tsx
    ├── _auth.tsx
    ├── login.tsx
    ├── register.tsx
    ├── logout.tsx
    └── _auth/
        └── index.tsx
```

**The key reasoning behind each layer:**

**`api/`** — Plain async functions that call PocketBase. No React dependencies. Easy to test and swap. Example:

```ts
// api/anime.ts
export const fetchAnimeList = (userId: string) =>
  pb.collection('anime').getList(1, 50, { filter: `user="${userId}"` });
```

**`hooks/`** — This is where `useQuery` from TanStack Query wraps `api/` functions, and `pb.collection().subscribe()` is set up inside a `useEffect` to invalidate the query cache on real-time events:

```ts
// hooks/useAnimeList.ts
export function useAnimeList(userId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsub = pb.collection('anime').subscribe('*', () => {
      queryClient.invalidateQueries({ queryKey: ['anime', userId] });
    });
    return () => { unsub.then(fn => fn()); };
  }, [userId]);

  return useQuery({
    queryKey: ['anime', userId],
    queryFn: () => fetchAnimeList(userId),
  });
}
```

**`components/modals/`** — Since you have `@mantine/modals`, you can register named modals in `ModalsProvider` and open them from anywhere with `modals.openContextModal('addAnime', ...)`. The `index.ts` exports the registry map that goes into `__root.tsx`.

**`types/`** — Keeps PocketBase collection shapes in one place, preventing duplication between `api/`, `hooks/`, and components.

One alternative worth considering: if the `api/` layer feels too thin at first (just one or two functions), you can fold it directly into `hooks/` as inline `queryFn`s and extract it later when it grows.