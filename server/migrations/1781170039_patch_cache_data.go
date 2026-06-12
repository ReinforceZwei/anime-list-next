package migrations

import (
	"encoding/json"
	"log"
	"net/url"
	"strings"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		records, err := app.FindAllRecords("tmdbCache")
		if err != nil {
			return err
		}

		for _, rec := range records {
			raw := rec.GetString("responseData")
			if raw == "" {
				continue
			}

			var data map[string]any
			if err := json.Unmarshal([]byte(raw), &data); err != nil {
				log.Printf("[migration] failed to parse responseData for record %s: %v", rec.Id, err)
				continue
			}

			// Remove wrapper fields from old TvDetailResponse/MovieDetailResponse format.
			// New code stores raw TMDb structs directly.
			delete(data, "mediaType")
			delete(data, "posterOriginal")

			// Normalize all poster_path values from full URLs to bare TMDb paths.
			normalizePosterPaths(data)

			patched, err := json.Marshal(data)
			if err != nil {
				log.Printf("[migration] failed to marshal patched data for record %s: %v", rec.Id, err)
				continue
			}

			rec.Set("responseData", string(patched))
			if err := app.Save(rec); err != nil {
				log.Printf("[migration] failed to save record %s: %v", rec.Id, err)
				continue
			}
		}

		return nil
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("tmdbCache")
		if err != nil {
			return err
		}
		return app.TruncateCollection(collection)
	})
}

// normalizePosterPaths recursively walks a JSON object tree and converts any
// "poster_path" string value from a fully-resolved TMDb image URL back to a
// bare path (e.g. "https://image.tmdb.org/t/p/original/abc.jpg" → "/abc.jpg").
func normalizePosterPaths(data map[string]any) {
	for key, val := range data {
		if key == "poster_path" {
			if s, ok := val.(string); ok {
				data[key] = normalizePosterPath(s)
			}
			continue
		}
		if nested, ok := val.(map[string]any); ok {
			normalizePosterPaths(nested)
		}
		if arr, ok := val.([]any); ok {
			for _, item := range arr {
				if obj, ok := item.(map[string]any); ok {
					normalizePosterPaths(obj)
				}
			}
		}
	}
}

// normalizePosterPath converts a full TMDb image URL to its bare path.
// Bare paths (starting with "/") pass through unchanged.
// Malformed URLs are returned as-is.
func normalizePosterPath(path string) string {
	if path == "" || !strings.HasPrefix(path, "http") {
		return path
	}
	u, err := url.Parse(path)
	if err != nil {
		return path
	}
	// TMDb image URL path: /t/p/{size}/{file_path}
	parts := strings.SplitN(strings.TrimPrefix(u.Path, "/"), "/", 4)
	if len(parts) == 4 {
		return "/" + parts[3]
	}
	return u.Path
}
