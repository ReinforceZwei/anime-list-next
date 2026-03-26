package routes

import (
	"net/http"
	"strconv"

	tmdb "github.com/cyruzin/golang-tmdb"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
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

type TmdbSeasonInfo struct {
	SeasonNumber int    `json:"seasonNumber"`
	Name         string `json:"name"`
	EpisodeCount int    `json:"episodeCount"`
	PosterPath   string `json:"posterPath"`
	AirDate      string `json:"airDate"`
}

type TmdbDetailResult struct {
	ID            int              `json:"id"`
	MediaType     string           `json:"mediaType"`
	Title         string           `json:"title"`
	OriginalTitle string           `json:"originalTitle"`
	Overview      string           `json:"overview"`
	PosterPath    string           `json:"posterPath"`
	Year          string           `json:"year"`
	Seasons       []TmdbSeasonInfo `json:"seasons,omitempty"`
}

type TmdbRoutes struct {
	client *tmdb.Client
}

func NewTmdbRoutes(apiKey string) (*TmdbRoutes, error) {
	client, err := tmdb.Init(apiKey)
	if err != nil {
		return nil, err
	}
	return &TmdbRoutes{client: client}, nil
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
			posterPath = tmdb.GetImageURL(result.PosterPath, tmdb.W500)
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

	if mediaType == "movie" {
		movie, err := r.client.GetMovieDetails(id, langOptions(e))
		if err != nil {
			return e.JSON(http.StatusBadGateway, map[string]string{"error": err.Error()})
		}

		posterPath := ""
		if movie.PosterPath != "" {
			posterPath = tmdb.GetImageURL(movie.PosterPath, tmdb.W500)
		}

		year := ""
		if len(movie.ReleaseDate) >= 4 {
			year = movie.ReleaseDate[:4]
		}

		return e.JSON(http.StatusOK, TmdbDetailResult{
			ID:            int(movie.ID),
			MediaType:     "movie",
			Title:         movie.Title,
			OriginalTitle: movie.OriginalTitle,
			Overview:      movie.Overview,
			PosterPath:    posterPath,
			Year:          year,
		})
	}

	// TV
	tv, err := r.client.GetTVDetails(id, langOptions(e))
	if err != nil {
		return e.JSON(http.StatusBadGateway, map[string]string{"error": err.Error()})
	}

	posterPath := ""
	if tv.PosterPath != "" {
		posterPath = tmdb.GetImageURL(tv.PosterPath, tmdb.W500)
	}

	year := ""
	if len(tv.FirstAirDate) >= 4 {
		year = tv.FirstAirDate[:4]
	}

	seasons := make([]TmdbSeasonInfo, 0, len(tv.Seasons))
	for _, s := range tv.Seasons {
		seasonPosterPath := ""
		if s.PosterPath != "" {
			seasonPosterPath = tmdb.GetImageURL(s.PosterPath, tmdb.W500)
		}
		seasons = append(seasons, TmdbSeasonInfo{
			SeasonNumber: s.SeasonNumber,
			Name:         s.Name,
			EpisodeCount: s.EpisodeCount,
			PosterPath:   seasonPosterPath,
			AirDate:      s.AirDate,
		})
	}

	return e.JSON(http.StatusOK, TmdbDetailResult{
		ID:            int(tv.ID),
		MediaType:     "tv",
		Title:         tv.Name,
		OriginalTitle: tv.OriginalName,
		Overview:      tv.Overview,
		PosterPath:    posterPath,
		Year:          year,
		Seasons:       seasons,
	})
}
