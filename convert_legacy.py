#!/usr/bin/env python3
"""
Convert a legacy anime-list export (flat array of objects) to the new
ExportData format (version 1) that can be imported by the new app.

Usage:
    python convert_legacy.py <input.json> [output.json]

If output.json is omitted the result is written to <input>_converted.json.

Legacy field mapping
--------------------
animeName   -> customName          (no TMDb info available)
addedTime   -> created             (unix → ISO-8601, only when non-zero)
watchedTime -> completedAt         (unix → ISO-8601, only when watched==1 and non-zero)
startedAt   -> calculated          (previous completed record's watchedTime + 1 day;
                                    empty for the earliest completed record and all
                                    non-completed records)
watched     -> status              (1 → "completed", 0 → "planned")
downloaded  -> downloadStatus      (1 → "downloaded", 0 → "")
rating      -> rating
comment     -> comment
remark      -> remark              (null → "")
tags        -> tag objects         (strings deduped, each gets a stable fake ID)
url         -> (dropped)
animeID     -> (dropped)
"""

import json
import re
import sys
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path


def unix_to_iso(ts: int) -> str:
    """Convert a unix timestamp to an RFC-3339 / ISO-8601 string in UTC."""
    return datetime.fromtimestamp(ts, tz=timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def derive_status(watched: int, downloaded: int, rating: int) -> str:
    if rating == -1:
        return "dropped"
    if watched:
        return "completed"
    # Legacy app didnt track watching status
    # if downloaded:
    #     return "watching"
    return "planned"


def derive_download_status(downloaded: int) -> str:
    return "downloaded" if downloaded else ""


def convert_rating(rating: int) -> int:
    """rating -1 (legacy dropped marker) becomes 0."""
    if rating <= 0:
        return 0
    return rating


_TMDB_URL_RE = re.compile(
    r"themoviedb\.org/(tv|movie)/(\d+)(?:/season/(\d+))?", re.IGNORECASE
)


def parse_tmdb_url(url: str) -> tuple[int, int, str]:
    """Return (tmdbId, tmdbSeasonNumber, tmdbMediaType) from a TMDb URL.

    Returns (0, 0, "") if the URL is not a recognised TMDb URL.
    For tv entries with no season segment, season defaults to 1.
    For movie entries, season is always 0.
    """
    if not url:
        return 0, 0, ""
    m = _TMDB_URL_RE.search(url)
    if not m:
        return 0, 0, ""
    media_type = m.group(1).lower()
    tmdb_id = int(m.group(2))
    if media_type == "tv":
        season = int(m.group(3)) if m.group(3) else 1
    else:
        season = 0
    return tmdb_id, season, media_type


def convert(legacy: list[dict]) -> dict:
    # Build a name→id map for tags so identical names share the same export ID.
    tag_name_to_id: dict[str, str] = {}

    for item in legacy:
        for tag_name in item.get("tags") or []:
            if tag_name and tag_name not in tag_name_to_id:
                tag_name_to_id[tag_name] = str(uuid.uuid4())

    export_tags = [
        {
            "id": tag_id,
            "name": name,
            "color": "",
            "weight": 0,
            "hidden": False,
            "deleted": "",
        }
        for name, tag_id in tag_name_to_id.items()
    ]

    # Pre-compute startedAt for each record.
    # For completed records, startedAt = previous completed record's watchedTime + 1 day
    # (sorted by watchedTime). The earliest completed record gets no startedAt.
    # Non-completed records get no startedAt.
    completed_items = [
        (i, int(item.get("watchedTime") or 0))
        for i, item in enumerate(legacy)
        if int(item.get("watched") or 0) and int(item.get("watchedTime") or 0)
    ]
    completed_items.sort(key=lambda x: x[1])  # sort by watchedTime ascending

    started_at_map: dict[int, str] = {}
    for seq, (idx, watched_time) in enumerate(completed_items):
        if seq == 0:
            started_at_map[idx] = ""
        else:
            prev_watched_time = completed_items[seq - 1][1]
            prev_dt = datetime.fromtimestamp(prev_watched_time, tz=timezone.utc)
            started_at_map[idx] = (prev_dt + timedelta(days=1)).strftime("%Y-%m-%dT%H:%M:%SZ")

    anime_records = []
    for i, item in enumerate(legacy):
        watched = int(item.get("watched") or 0)
        downloaded = int(item.get("downloaded") or 0)
        rating = int(item.get("rating") or 0)
        added_time = int(item.get("addedTime") or 0)
        watched_time = int(item.get("watchedTime") or 0)

        created = unix_to_iso(added_time) if added_time else ""
        completed_at = unix_to_iso(watched_time) if (watched and watched_time) else ""
        started_at = started_at_map.get(i, "")

        tag_ids = [
            tag_name_to_id[t]
            for t in (item.get("tags") or [])
            if t in tag_name_to_id
        ]

        tmdb_id, tmdb_season, tmdb_media_type = parse_tmdb_url(item.get("url") or "")

        anime_records.append(
            {
                "tmdbId": tmdb_id,
                "tmdbSeasonNumber": tmdb_season,
                "tmdbMediaType": tmdb_media_type,
                "customName": item.get("animeName") or "",
                "cachedTitle": "",
                "cachedSeasonName": "",
                "status": derive_status(watched, downloaded, rating),
                "downloadStatus": derive_download_status(downloaded),
                "startedAt": started_at,
                "completedAt": completed_at,
                "rating": convert_rating(rating),
                "comment": item.get("comment") or "",
                "remark": item.get("remark") or "",
                "tags": tag_ids,
                "deleted": "",
                "created": created,
                "updated": created,
            }
        )

    return {
        "version": 1,
        "exportedAt": datetime.now(tz=timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "tags": export_tags,
        "animeRecords": anime_records,
    }


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: python convert_legacy.py <input.json> [output.json]")
        sys.exit(1)

    input_path = Path(sys.argv[1])
    output_path = (
        Path(sys.argv[2])
        if len(sys.argv) >= 3
        else input_path.with_name(input_path.stem + "_converted.json")
    )

    with input_path.open(encoding="utf-8") as f:
        legacy_data = json.load(f)

    if not isinstance(legacy_data, list):
        print("Error: expected a JSON array at the top level.")
        sys.exit(1)

    result = convert(legacy_data)

    with output_path.open("w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(
        f"Converted {len(result['animeRecords'])} records and "
        f"{len(result['tags'])} unique tags → {output_path}"
    )


if __name__ == "__main__":
    main()
