package hooks

import (
	"log"

	tmdb "github.com/cyruzin/golang-tmdb"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/types"
)

const defaultLang = "zh-TW"

type AnimeRecordsHooks struct {
	client *tmdb.Client
}

func NewAnimeRecordsHooks(apiKey string) (*AnimeRecordsHooks, error) {
	client, err := tmdb.Init(apiKey)
	if err != nil {
		return nil, err
	}
	return &AnimeRecordsHooks{client: client}, nil
}

// Register binds all animeRecords hooks to the app.
func (h *AnimeRecordsHooks) Register(app core.App) {
	app.OnRecordCreate("animeRecords").BindFunc(func(e *core.RecordEvent) error {
		if e.Record.GetString("cachedTitle") == "" {
			h.populateCachedTitle(e.Record)
		}
		if e.Record.GetString("status") == "" {
			e.Record.Set("status", "planned")
		}
		if e.Record.GetString("downloadStatus") == "" {
			e.Record.Set("downloadStatus", "pending")
		}
		applyStatusDateLogic(e.Record, nil, e.Record.GetString("status"))
		return e.Next()
	})
	app.OnRecordUpdate("animeRecords").BindFunc(func(e *core.RecordEvent) error {
		record := e.Record
		original := record.Original()

		newStatus := record.GetString("status")
		oldStatus := original.GetString("status")

		if newStatus != oldStatus {
			applyStatusDateLogic(record, original, newStatus)
		}

		if record.GetInt("tmdbId") != original.GetInt("tmdbId") ||
			record.GetInt("tmdbSeasonNumber") != original.GetInt("tmdbSeasonNumber") ||
			record.GetString("tmdbMediaType") != original.GetString("tmdbMediaType") {
			h.populateCachedTitle(record)
		}

		return e.Next()
	})
	app.OnRecordCreateRequest("animeRecords").BindFunc(func(e *core.RecordRequestEvent) error {
		requestInfo, err := e.RequestInfo()
		if err != nil {
			return err
		}
		// Allow client to set created/updated timestamps
		if created, ok := requestInfo.Body["createdOverride"].(string); ok && created != "" {
			if dt, err := types.ParseDateTime(created); err == nil && !dt.IsZero() {
				e.Record.SetRaw("created", created)
			}
		}
		if updated, ok := requestInfo.Body["updatedOverride"].(string); ok && updated != "" {
			if dt, err := types.ParseDateTime(updated); err == nil && !dt.IsZero() {
				e.Record.SetRaw("updated", updated)
			}
		}
		return e.Next()
	})
	app.OnRecordUpdateRequest("animeRecords").BindFunc(func(e *core.RecordRequestEvent) error {
		requestInfo, err := e.RequestInfo()
		if err != nil {
			return err
		}
		// Allow client to set created/updated timestamps
		if created, ok := requestInfo.Body["createdOverride"].(string); ok && created != "" {
			if dt, err := types.ParseDateTime(created); err == nil && !dt.IsZero() {
				e.Record.SetRaw("created", created)
			}
		}
		if updated, ok := requestInfo.Body["updatedOverride"].(string); ok && updated != "" {
			if dt, err := types.ParseDateTime(updated); err == nil && !dt.IsZero() {
				e.Record.SetRaw("updated", updated)
			}
		}
		return e.Next()
	})
}

// applyStatusDateLogic auto-fills or clears startedAt/completedAt based on the
// target status. original is nil when called from the create hook.
func applyStatusDateLogic(record *core.Record, original *core.Record, status string) {
	switch status {
	case "watching":
		if record.GetDateTime("startedAt").IsZero() {
			record.Set("startedAt", types.NowDateTime())
		}
		// Clear completedAt if the DB had one (or unconditionally on create)
		if original == nil || !original.GetDateTime("completedAt").IsZero() {
			record.Set("completedAt", nil)
		}

	case "completed":
		completedAt := record.GetDateTime("completedAt")
		if completedAt.IsZero() {
			completedAt = types.NowDateTime()
			record.Set("completedAt", completedAt)
		}
		// Fill startedAt from DB if it was never set
		if original == nil || original.GetDateTime("startedAt").IsZero() {
			if record.GetDateTime("startedAt").IsZero() {
				record.Set("startedAt", completedAt)
			}
		}

	case "dropped":
		if record.GetDateTime("completedAt").IsZero() {
			record.Set("completedAt", types.NowDateTime())
		}

	case "planned":
		// Reversal: clear stale dates (only meaningful on update)
		if original != nil {
			record.Set("startedAt", nil)
			record.Set("completedAt", nil)
		}
	}
}

// populateCachedTitle fetches the title from TMDB and sets it on the record.
// Errors are logged but do not abort the record creation.
func (h *AnimeRecordsHooks) populateCachedTitle(record *core.Record) {
	tmdbID := record.GetInt("tmdbId")
	if tmdbID == 0 {
		return
	}

	mediaType := record.GetString("tmdbMediaType")
	langOpts := map[string]string{"language": defaultLang}

	var title, seasonName string
	var err error

	switch mediaType {
	case "movie":
		title, err = h.fetchMovieTitle(tmdbID, langOpts)
	case "tv":
		seasonNumber := record.GetInt("tmdbSeasonNumber")
		title, seasonName, err = h.fetchTVTitle(tmdbID, seasonNumber, langOpts)
	default:
		return
	}

	if err != nil {
		log.Printf("[anime_records hook] failed to fetch cachedTitle (tmdbId=%d type=%s): %v", tmdbID, mediaType, err)
		return
	}

	record.Set("cachedTitle", title)
	record.Set("cachedSeasonName", seasonName)
}

func (h *AnimeRecordsHooks) fetchMovieTitle(id int, opts map[string]string) (string, error) {
	movie, err := h.client.GetMovieDetails(id, opts)
	if err != nil {
		return "", err
	}
	return movie.Title, nil
}

func (h *AnimeRecordsHooks) fetchTVTitle(id int, seasonNumber int, opts map[string]string) (string, string, error) {
	tv, err := h.client.GetTVDetails(id, opts)
	if err != nil {
		return "", "", err
	}

	// Season 0 is special, 1 is the first season — no season name suffix needed
	if seasonNumber == 1 {
		return tv.Name, "", nil
	}

	for _, s := range tv.Seasons {
		if s.SeasonNumber == seasonNumber {
			return tv.Name, s.Name, nil
		}
	}

	// Season number not found in the list, fall back to show name with no season name
	log.Printf("[anime_records hook] season %d not found for tvId=%d, falling back to show name", seasonNumber, id)
	return tv.Name, "", nil
}
