package routes

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	tmdb "github.com/cyruzin/golang-tmdb"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

var (
	posterSize = tmdb.Original
)

type TmdbSearchItem struct {
	ID            int    `json:"id"`
	MediaType     string `json:"mediaType"`
	Title         string `json:"title"`
	OriginalTitle string `json:"originalTitle"`
	Overview      string `json:"overview"`
	PosterPath    string `json:"posterPath"`
	Year          string `json:"year"`
}

// TvDetailResponse wraps the raw TMDb TVDetails response with a mediaType field.
// Poster paths are resolved to full URLs before returning.
type TvDetailResponse struct {
	MediaType string `json:"mediaType"`
	*tmdb.TVDetails
}

// MovieDetailResponse wraps the raw TMDb MovieDetails response with a mediaType field.
// PosterPath is resolved to a full URL before returning.
type MovieDetailResponse struct {
	MediaType string `json:"mediaType"`
	*tmdb.MovieDetails
}

type TmdbRoutes struct {
	client *tmdb.Client
	app    core.App
}

func NewTmdbRoutes(app core.App, apiKey string) (*TmdbRoutes, error) {
	client, err := tmdb.Init(apiKey)
	if err != nil {
		return nil, err
	}
	return &TmdbRoutes{client: client, app: app}, nil
}

func computeExpiry(mediaType string, tvStatus string) time.Time {
	if mediaType == "movie" {
		return time.Now().AddDate(0, 0, 30)
	}
	switch tvStatus {
	case "Ended", "Canceled":
		return time.Now().AddDate(0, 0, 30)
	default:
		return time.Now().Add(24 * time.Hour)
	}
}

func (r *TmdbRoutes) getCached(cacheKey string) (json.RawMessage, bool) {
	now := time.Now().UTC().Format("2006-01-02 15:04:05.000Z")
	record, err := r.app.FindFirstRecordByFilter(
		"tmdbCache",
		"cacheKey = {:cacheKey} && expiresAt > {:now}",
		dbx.Params{"cacheKey": cacheKey, "now": now},
	)
	if err != nil {
		return nil, false
	}
	data := record.GetString("responseData")
	if data == "" {
		return nil, false
	}
	return json.RawMessage(data), true
}

func (r *TmdbRoutes) setCached(cacheKey string, mediaType string, tvStatus string, result any) {
	data, err := json.Marshal(result)
	if err != nil {
		log.Printf("[tmdb cache] failed to marshal response for key %q: %v", cacheKey, err)
		return
	}
	expiry := computeExpiry(mediaType, tvStatus).UTC().Format("2006-01-02 15:04:05.000Z")

	existing, err := r.app.FindFirstRecordByFilter(
		"tmdbCache",
		"cacheKey = {:cacheKey}",
		dbx.Params{"cacheKey": cacheKey},
	)
	if err != nil {
		// No existing record — create new
		col, err := r.app.FindCollectionByNameOrId("tmdbCache")
		if err != nil {
			log.Printf("[tmdb cache] failed to find tmdbCache collection: %v", err)
			return
		}
		rec := core.NewRecord(col)
		rec.Set("cacheKey", cacheKey)
		rec.Set("responseData", string(data))
		rec.Set("mediaType", mediaType)
		rec.Set("tvStatus", tvStatus)
		rec.Set("expiresAt", expiry)
		if err := r.app.Save(rec); err != nil {
			log.Printf("[tmdb cache] failed to save cache record for key %q: %v", cacheKey, err)
		}
		return
	}

	existing.Set("responseData", string(data))
	existing.Set("tvStatus", tvStatus)
	existing.Set("expiresAt", expiry)
	if err := r.app.Save(existing); err != nil {
		log.Printf("[tmdb cache] failed to update cache record for key %q: %v", cacheKey, err)
	}
}

func (r *TmdbRoutes) Register(se *core.ServeEvent) {
	g := se.Router.Group("/api/tmdb")
	g.Bind(apis.RequireAuth())
	g.GET("/search", r.search)
	g.GET("/detail", r.detail)
}

func langOptions(e *core.RequestEvent) map[string]string {
	lang := e.Request.URL.Query().Get("language")
	if lang == "" {
		lang = "zh-TW"
	}
	return map[string]string{"language": lang}
}

func (r *TmdbRoutes) search(e *core.RequestEvent) error {
	query := e.Request.URL.Query().Get("query")
	if query == "" {
		return e.JSON(http.StatusBadRequest, map[string]string{"error": "query param is required"})
	}

	results, err := r.client.GetSearchMulti(query, langOptions(e))
	if err != nil {
		return e.JSON(http.StatusBadGateway, map[string]string{"error": err.Error()})
	}

	items := make([]TmdbSearchItem, 0)
	for _, result := range results.Results {
		if result.MediaType != "tv" && result.MediaType != "movie" {
			continue
		}

		title := result.Title
		originalTitle := result.OriginalTitle
		year := ""
		if result.MediaType == "tv" {
			title = result.Name
			originalTitle = result.OriginalName
			if len(result.FirstAirDate) >= 4 {
				year = result.FirstAirDate[:4]
			}
		} else {
			if len(result.ReleaseDate) >= 4 {
				year = result.ReleaseDate[:4]
			}
		}

		posterPath := ""
		if result.PosterPath != "" {
			posterPath = tmdb.GetImageURL(result.PosterPath, posterSize)
		}

		items = append(items, TmdbSearchItem{
			ID:            int(result.ID),
			MediaType:     result.MediaType,
			Title:         title,
			OriginalTitle: originalTitle,
			Overview:      result.Overview,
			PosterPath:    posterPath,
			Year:          year,
		})
	}

	return e.JSON(http.StatusOK, items)
}

func (r *TmdbRoutes) detail(e *core.RequestEvent) error {
	mediaType := e.Request.URL.Query().Get("type")
	idStr := e.Request.URL.Query().Get("id")

	if mediaType == "" || idStr == "" {
		return e.JSON(http.StatusBadRequest, map[string]string{"error": "type and id params are required"})
	}
	if mediaType != "tv" && mediaType != "movie" {
		return e.JSON(http.StatusBadRequest, map[string]string{"error": "type must be tv or movie"})
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		return e.JSON(http.StatusBadRequest, map[string]string{"error": "id must be an integer"})
	}

	lang := e.Request.URL.Query().Get("language")
	if lang == "" {
		lang = "zh-TW"
	}
	cacheKey := fmt.Sprintf("%s:%s:%s", mediaType, idStr, lang)

	if cached, ok := r.getCached(cacheKey); ok {
		return e.JSON(http.StatusOK, cached)
	}

	if mediaType == "movie" {
		movie, err := r.client.GetMovieDetails(id, langOptions(e))
		if err != nil {
			return e.JSON(http.StatusBadGateway, map[string]string{"error": err.Error()})
		}

		if movie.PosterPath != "" {
			movie.PosterPath = tmdb.GetImageURL(movie.PosterPath, posterSize)
		}

		result := &MovieDetailResponse{MediaType: "movie", MovieDetails: movie}
		r.setCached(cacheKey, "movie", "", result)
		return e.JSON(http.StatusOK, result)
	}

	// TV
	tv, err := r.client.GetTVDetails(id, langOptions(e))
	if err != nil {
		return e.JSON(http.StatusBadGateway, map[string]string{"error": err.Error()})
	}

	if tv.PosterPath != "" {
		tv.PosterPath = tmdb.GetImageURL(tv.PosterPath, posterSize)
	}
	for i := range tv.Seasons {
		if tv.Seasons[i].PosterPath != "" {
			tv.Seasons[i].PosterPath = tmdb.GetImageURL(tv.Seasons[i].PosterPath, posterSize)
		}
	}

	result := &TvDetailResponse{MediaType: "tv", TVDetails: tv}
	r.setCached(cacheKey, "tv", tv.Status, result)
	return e.JSON(http.StatusOK, result)
}
