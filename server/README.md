# Anime list next (server)

Pocketbase backend with custom API route.

## How to view collection schema

No need to read scattered migration files. Use `server/pocketbase-get-schemas.sh` (Linux/MacOS) or `server/pocketbase-get-schemas.ps1` (Windows) helper script to view collection schema.

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

Path: `/api/tmdb/search`
Search tmdb using multi-search

Get detail by id

Path: `/api/tmdb/details`
Get detail by tmdb id

#### Import / Export API

Both endpoints require authentication. All data is scoped to the authenticated user.

**Export**

Path: `GET /api/export`

Returns a JSON object containing all of the user's anime records and tags.

Response shape:
```json
{
  "version": 1,
  "exportedAt": "2026-03-24T12:00:00Z",
  "tags": [
    { "id": "abc123", "name": "Action", "color": "#ff0000", "weight": 0, "hidden": false, "deleted": "" }
  ],
  "animeRecords": [
    {
      "tmdbId": 12345, "tmdbSeasonNumber": 1, "tmdbMediaType": "tv",
      "customName": "", "cachedTitle": "...", "cachedSeasonName": "...",
      "status": "completed", "downloadStatus": "downloaded",
      "startedAt": "2024-01-01 00:00:00.000Z", "completedAt": "2024-03-01 00:00:00.000Z",
      "rating": 9, "comment": "", "remark": "",
      "tags": ["abc123"],
      "deleted": ""
    }
  ]
}
```

`tags[].id` and `animeRecords[].tags` are internal reference keys within the file, not PocketBase record IDs.

**Import**

Path: `POST /api/import`

Accepts the same JSON shape produced by the export endpoint.

- **Tags**: matched by `name` per user. Existing tags are reused (fields not overwritten). Unknown tags are created with the exported color/weight/hidden values.
- **Anime records with a `tmdbId`**: upserted by `(tmdbMediaType, tmdbId, tmdbSeasonNumber)`.
- **Anime records without a `tmdbId`**: upserted by `customName`.
- Soft-deleted records (`deleted` field) are preserved as exported.
- `cachedTitle` / `cachedSeasonName` are written verbatim (the TMDb hook does not run on direct saves).

Response:
```json
{ "importedRecords": 42, "importedTags": 3 }
```

## Created/Updated date override

Collection `animeRecords` has custom hook logic to allow client overriding created and updated date.

Use `createdOverride` and `updatedOverride` to override the date value. Date format is the same as Pocketbase date field format (ISO format). 

```json
{
  "userId": "2ruxzm9xdu59v3e",
  "customName": "test1231",
  "createdOverride": "2014-12-31T16:00:00.000Z",
  "updatedOverride": "2014-12-31T16:00:00.000Z"
}
```