# Anime List Next

A personal anime watchlist app — rebuilt from scratch using PocketBase + React.

Rewrite of the original [anime-list](https://github.com/ReinforceZwei/anime-list) (Python/Flask + MariaDB) with a focus on real-time sync, TMDb integration, and a single self-contained binary.

## Features

- **TMDb integration** — search and link anime/series by title; posters, season info, and metadata are fetched automatically
- **Real-time sync** — changes from any device appear instantly via PocketBase subscriptions, no page refresh needed
- **Tags & ratings** — organise records with custom tags; add comments and star ratings
- **Import / Export** — back up or migrate your full watchlist as a JSON file
- **Single Docker image** — frontend is embedded in the server binary; one container, no separate web server

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | Go, [PocketBase](https://pocketbase.io) |
| Frontend | Vite, React 19, Mantine UI, Tanstack Router |
| TMDb | [golang-tmdb](https://github.com/cyruzin/golang-tmdb) |

## Try it out

_A demo instance might be available in the future, but not now._

## Self-hosting

### Docker Compose (recommended)

Pull the pre-built image from GHCR. `amd64` and `arm64` are available.

```yaml
services:
  anime-list:
    image: ghcr.io/reinforcezwei/anime-list-next:latest
    environment:
      TMDB_API_KEY: "your_tmdb_v3_api_key"
      DISABLE_REGISTER: "false"   # set to "true" to lock registration after first user
    ports:
      - "8090:8090"
    volumes:
      - ./pb_data:/app/pb_data
    restart: unless-stopped
```

Then open `http://localhost:8090`.

Data is persisted in `./pb_data`. Back this directory up regularly.

> **TMDB_API_KEY** is required. Get a free v3 API key from [themoviedb.org](https://www.themoviedb.org/settings/api).

### Manual install

Requirements: [Go 1.25+](https://go.dev/dl/) and [Node.js 22+](https://nodejs.org/)

1. Clone the repository:
   ```sh
   git clone https://github.com/ReinforceZwei/anime-list-next.git
   cd anime-list-next
   ```
2. Create `server/.env`:
   ```
   TMDB_API_KEY=your_tmdb_v3_api_key
   DISABLE_REGISTER=false
   ```
3. Build and run the server:
   ```sh
   cd server
   go run . serve
   ```
4. In a separate terminal, build the frontend and copy it into the server's public folder:
   ```sh
   cd client
   npm install
   npm run build
   cp -r dist/ ../server/pb_public/
   ```
5. Open `http://localhost:8090`

### PocketBase superuser

There is no default superuser on a fresh install. On first startup, PocketBase prints a one-time URL in the console that lets you create the initial superuser through the Admin UI (`/_/`):

```
Server started at http://0.0.0.0:8090
├─ REST API: http://0.0.0.0:8090/api/
└─ Admin UI: http://0.0.0.0:8090/_/

To create your first admin account, navigate to:
http://0.0.0.0:8090/_/?superusers#...
```

Creating a superuser is optional for normal app use — it's only needed if you want to manage collections or settings through the Admin UI.

### Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `TMDB_API_KEY` | Yes | — | TMDb v3 API key (backend-only, never exposed to clients) |
| `DISABLE_REGISTER` | No | `false` | When `true`, blocks new registrations once the first user exists |
| `PB_PORT` | No | `8090` | Port the server listens on |

## Development

See [DEVELOPMENT.md](DEVELOPMENT.md) for the full development guide including versioning, release workflow, and build flags.

```sh
# Backend
cd server
cp .env.example .env   # fill in TMDB_API_KEY
go run . serve

# Frontend (separate terminal)
cd client
npm install
npm run dev
```
