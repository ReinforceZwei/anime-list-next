# Anime list next (server)

Pocketbase backend with custom API route.

## How to view collection schema

No need to read scattered migration files. Use `server/pocketbase-get-schemas.sh` (bash) or `server/pocketbase-get-schemas.ps1` (powershell) helper script to view collection schema.

```sh
# No argument to list collections
pocketbase-get-schemas.sh

# View specific collection schema
pocketbase-get-schemas.sh animeRecords
```

## Design

### `/config`

anime list (server) custom config (not Pocketbase config)

- tmdb api key (required)
- disable account register (when true, only one account can be created)

### `/routes`

custom API routes

- tmdb api
- *anime record RESTful API for public access

* RESTful API is intended for qb-auto to comsume. I dont want qb-auto to use Pocketbase record API (its too generic). qb-auto requires: search record, update record

#### TMDb API

Search API

Path: `/api/tmdb/???`
Search tmdb using multi-search

Get detail by id

Path: `/api/tmdb/???`
Get detail by tmdb id