# anime-list-next

## Project Snapshot

Simple monorepo: Go/PocketBase backend (`server/`) + Vite/React frontend (`client/`). No workspace orchestrator — each package is built and run independently. The app is a personal anime watchlist with TMDb integration, real-time sync via PocketBase subscriptions, and import/export support. `old_client/` is legacy — do not touch it.

## Root Structure

```
server/   ← Go + PocketBase backend   → see server/AGENTS.md
client/   ← Vite + React 19 frontend  → see client/AGENTS.md
old_client/ ← LEGACY, ignore
```

## Setup Commands

```sh
# Server
cd server && go run . serve

# Client
cd client && npm install && npm run dev
```

## Universal Conventions

- Schema field names use `lowerCamelCase` (aligns with JavaScript/PocketBase JS SDK)
- Secrets go in `server/.env` (loaded by godotenv) and `client/.env.local` — never commit either
- No test suite exists yet; manually verify changes in the browser

## Security & Secrets

- `server/.env` holds `TMDB_API_KEY` and `DISABLE_REGISTER` — never commit
- `client/.env.local` holds `VITE_PB_URL` — never commit
- TMDB API key is backend-only; never expose it to the client

## JIT Index

### Package Structure

- Backend (Go/PocketBase): `server/` → [server/AGENTS.md](server/AGENTS.md)
- Frontend (React/Vite): `client/` → [client/AGENTS.md](client/AGENTS.md)

### Quick Find Commands

```sh
# Find a Go function
rg -n "func.*FunctionName" server/

# Find a React component
rg -n "export (default )?function|export const" client/src/components/

# Find a hook
rg -n "export function use" client/src/hooks/

# Find a PocketBase collection reference
rg -n "Collections\." client/src/

# View collection schema (no need to read migrations)
cd server && ./pocketbase-get-schemas.sh            # Linux/macOS
cd server && ./pocketbase-get-schemas.ps1           # Windows
```

## Definition of Done

- TypeScript compiles: `cd client && npm run build`
- Go compiles: `cd server && go build ./...`
- No new `.env` values committed
- Real-time sync verified if touching PocketBase hooks or subscriptions
