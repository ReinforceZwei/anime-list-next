package hooks

import (
	"log"

	tmdb "github.com/cyruzin/golang-tmdb"
	"github.com/pocketbase/pocketbase/core"
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
		h.populateCachedTitle(e.Record)
		return e.Next()
	})
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
