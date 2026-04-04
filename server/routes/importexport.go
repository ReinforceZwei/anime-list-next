package routes

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

// ExportTag holds the exported representation of a tag.
// The ID field serves as a reference key within the export file only.
type ExportTag struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Color  string `json:"color"`
	Weight int    `json:"weight"`
	Hidden bool   `json:"hidden"`
}

// ExportAnimeRecord holds the exported representation of an anime record.
// The Tags slice contains IDs that correspond to ExportTag.ID values in the
// same export file — they are not PocketBase record IDs.
type ExportAnimeRecord struct {
	TmdbID           int      `json:"tmdbId"`
	TmdbSeasonNumber int      `json:"tmdbSeasonNumber"`
	TmdbMediaType    string   `json:"tmdbMediaType"`
	CustomName       string   `json:"customName"`
	CachedTitle      string   `json:"cachedTitle"`
	CachedSeasonName string   `json:"cachedSeasonName"`
	Status           string   `json:"status"`
	DownloadStatus   string   `json:"downloadStatus"`
	StartedAt        string   `json:"startedAt"`
	CompletedAt      string   `json:"completedAt"`
	Rating           int      `json:"rating"`
	Comment          string   `json:"comment"`
	Remark           string   `json:"remark"`
	Tags             []string `json:"tags"`
	Created          string   `json:"created"`
	Updated          string   `json:"updated"`
}

// ExportData is the top-level JSON envelope for import/export.
type ExportData struct {
	Version      int                 `json:"version"`
	ExportedAt   string              `json:"exportedAt"`
	Tags         []ExportTag         `json:"tags"`
	AnimeRecords []ExportAnimeRecord `json:"animeRecords"`
}

// ImportResult is returned by the import endpoint.
type ImportResult struct {
	ImportedRecords int `json:"importedRecords"`
	ImportedTags    int `json:"importedTags"`
}

// ImportExportRoutes registers the /api/export and /api/import endpoints.
type ImportExportRoutes struct{}

func NewImportExportRoutes() *ImportExportRoutes {
	return &ImportExportRoutes{}
}

func (r *ImportExportRoutes) Register(se *core.ServeEvent) {
	g := se.Router.Group("/api")
	g.Bind(apis.RequireAuth())
	g.GET("/export", r.exportHandler)
	g.POST("/import", r.importHandler)
}

// exportHandler fetches all tags and anime records owned by the authenticated
// user and returns them as a single ExportData JSON object.
func (r *ImportExportRoutes) exportHandler(e *core.RequestEvent) error {
	authRecord := e.Auth
	if authRecord == nil {
		return apis.NewUnauthorizedError("Unauthorized", nil)
	}
	userId := authRecord.Id

	tagRecords, err := e.App.FindAllRecords("tags", dbx.HashExp{"userId": userId})
	if err != nil {
		return e.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to fetch tags"})
	}

	animeRecords, err := e.App.FindAllRecords("animeRecords", dbx.HashExp{"userId": userId})
	if err != nil {
		return e.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to fetch anime records"})
	}

	exportTags := make([]ExportTag, 0, len(tagRecords))
	for _, t := range tagRecords {
		exportTags = append(exportTags, ExportTag{
			ID:     t.Id,
			Name:   t.GetString("name"),
			Color:  t.GetString("color"),
			Weight: t.GetInt("weight"),
			Hidden: t.GetBool("hidden"),
		})
	}

	exportAnimes := make([]ExportAnimeRecord, 0, len(animeRecords))
	for _, a := range animeRecords {
		exportAnimes = append(exportAnimes, ExportAnimeRecord{
			TmdbID:           a.GetInt("tmdbId"),
			TmdbSeasonNumber: a.GetInt("tmdbSeasonNumber"),
			TmdbMediaType:    a.GetString("tmdbMediaType"),
			CustomName:       a.GetString("customName"),
			CachedTitle:      a.GetString("cachedTitle"),
			CachedSeasonName: a.GetString("cachedSeasonName"),
			Status:           a.GetString("status"),
			DownloadStatus:   a.GetString("downloadStatus"),
			StartedAt:        a.GetString("startedAt"),
			CompletedAt:      a.GetString("completedAt"),
			Rating:           a.GetInt("rating"),
			Comment:          a.GetString("comment"),
			Remark:           a.GetString("remark"),
			Tags:             a.GetStringSlice("tags"),
			Created:          a.GetString("created"),
			Updated:          a.GetString("updated"),
		})
	}

	return e.JSON(http.StatusOK, ExportData{
		Version:      1,
		ExportedAt:   time.Now().UTC().Format(time.RFC3339),
		Tags:         exportTags,
		AnimeRecords: exportAnimes,
	})
}

// importHandler reads an ExportData JSON body and upserts all tags and anime
// records into the authenticated user's account.
//
// Tag upsert: matched by name — existing tags are reused as-is; unknown tags
// are created. A mapping from exported tag IDs to real PocketBase IDs is built
// to remap anime record relations correctly.
//
// Anime record upsert:
//   - Records with a tmdbId are matched by (tmdbMediaType, tmdbId, tmdbSeasonNumber).
//   - Records without a tmdbId are matched by customName.
//   - Matched records are fully overwritten; unmatched records are created.
func (r *ImportExportRoutes) importHandler(e *core.RequestEvent) error {
	authRecord := e.Auth
	if authRecord == nil {
		return apis.NewUnauthorizedError("Unauthorized", nil)
	}
	userId := authRecord.Id

	var data ExportData
	if err := json.NewDecoder(e.Request.Body).Decode(&data); err != nil {
		return e.JSON(http.StatusBadRequest, map[string]string{"error": "invalid JSON body"})
	}
	if data.Version != 1 {
		return e.JSON(http.StatusBadRequest, map[string]string{"error": "unsupported export version"})
	}

	tagCol, err := e.App.FindCollectionByNameOrId("tags")
	if err != nil {
		return e.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to find tags collection"})
	}

	animeCol, err := e.App.FindCollectionByNameOrId("animeRecords")
	if err != nil {
		return e.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to find animeRecords collection"})
	}

	// tagIdMap maps exported tag IDs → real PocketBase tag IDs.
	tagIdMap := make(map[string]string, len(data.Tags))
	importedTags := 0
	importedRecords := 0

	if err := e.App.RunInTransaction(func(txApp core.App) error {
		for _, tag := range data.Tags {
			existing, err := txApp.FindFirstRecordByFilter(
				"tags",
				"userId = {:userId} && name = {:name}",
				dbx.Params{"userId": userId, "name": tag.Name},
			)
			if err != nil {
				// Not found — create new tag.
				newTag := core.NewRecord(tagCol)
				newTag.Set("userId", userId)
				newTag.Set("name", tag.Name)
				newTag.Set("color", tag.Color)
				newTag.Set("weight", tag.Weight)
				newTag.Set("hidden", tag.Hidden)
				if err := txApp.Save(newTag); err != nil {
					txApp.Logger().Error("failed to save tag during import", "tag", tag.Name, "error", err)
					return err
				}
				tagIdMap[tag.ID] = newTag.Id
				importedTags++
			} else {
				tagIdMap[tag.ID] = existing.Id
			}
		}

		for _, anime := range data.AnimeRecords {
			// Remap exported tag IDs to real IDs, dropping any that have no mapping.
			remappedTags := make([]string, 0, len(anime.Tags))
			for _, oldId := range anime.Tags {
				if newId, ok := tagIdMap[oldId]; ok {
					remappedTags = append(remappedTags, newId)
				}
			}

			// Locate an existing record to update, or prepare a new one.
			var record *core.Record
			if anime.TmdbID != 0 {
				record, _ = txApp.FindFirstRecordByFilter(
					"animeRecords",
					"userId={:u} && tmdbMediaType={:mt} && tmdbId={:id} && tmdbSeasonNumber={:sn}",
					dbx.Params{
						"u":  userId,
						"mt": anime.TmdbMediaType,
						"id": anime.TmdbID,
						"sn": anime.TmdbSeasonNumber,
					},
				)
			} else if anime.CustomName != "" {
				record, _ = txApp.FindFirstRecordByFilter(
					"animeRecords",
					"userId={:u} && customName={:name}",
					dbx.Params{"u": userId, "name": anime.CustomName},
				)
			}

			if record == nil {
				record = core.NewRecord(animeCol)
				record.Set("userId", userId)
			}

			record.Set("tmdbId", anime.TmdbID)
			record.Set("tmdbSeasonNumber", anime.TmdbSeasonNumber)
			record.Set("tmdbMediaType", anime.TmdbMediaType)
			record.Set("customName", anime.CustomName)
			record.Set("cachedTitle", anime.CachedTitle)
			record.Set("cachedSeasonName", anime.CachedSeasonName)
			record.Set("status", anime.Status)
			record.Set("downloadStatus", anime.DownloadStatus)
			setOptionalDate(record, "startedAt", anime.StartedAt)
			setOptionalDate(record, "completedAt", anime.CompletedAt)
			record.Set("rating", anime.Rating)
			record.Set("comment", anime.Comment)
			record.Set("remark", anime.Remark)
			record.Set("tags", remappedTags)
			setOptionalDate(record, "created", anime.Created)
			setOptionalDate(record, "updated", anime.Updated)

			if err := txApp.Save(record); err != nil {
				txApp.Logger().Error("failed to save anime record during import",
					"tmdbId", anime.TmdbID,
					"customName", anime.CustomName,
					"error", err,
				)
				return err
			}
			// PocketBase overwrites created/updated on Save; restore original values.
			if anime.Created != "" || anime.Updated != "" {
				_, err := txApp.DB().NewQuery(
					"UPDATE animeRecords SET created={:created}, updated={:updated} WHERE id={:id}",
				).Bind(dbx.Params{
					"created": anime.Created,
					"updated": anime.Updated,
					"id":      record.Id,
				}).Execute()
				if err != nil {
					return err
				}
			}
			importedRecords++
		}

		return nil
	}); err != nil {
		return e.JSON(http.StatusInternalServerError, map[string]string{"error": "import failed: " + err.Error()})
	}

	return e.JSON(http.StatusOK, ImportResult{
		ImportedRecords: importedRecords,
		ImportedTags:    importedTags,
	})
}

// setOptionalDate sets a date field to nil when the value is empty, which
// clears the field in PocketBase, or to the string value otherwise.
func setOptionalDate(record *core.Record, field, value string) {
	if value == "" {
		record.Set(field, nil)
	} else {
		record.Set(field, value)
	}
}
