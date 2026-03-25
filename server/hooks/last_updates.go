package hooks

import (
	"log"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/types"
)

type LastUpdatesHooks struct{}

func NewLastUpdatesHooks() *LastUpdatesHooks {
	return &LastUpdatesHooks{}
}

// Register binds lastUpdates hooks to the app for the given collections.
// On any successful create, update, or delete it upserts the lastUpdates record
// for that (userId, collection) pair.
func (h *LastUpdatesHooks) Register(app core.App) {
	handler := func(e *core.RecordEvent) error {
		h.upsertLastUpdated(e.App, e.Record)
		return e.Next()
	}
	app.OnRecordAfterCreateSuccess("animeRecords", "tags", "userPreferences").BindFunc(handler)
	app.OnRecordAfterUpdateSuccess("animeRecords", "tags", "userPreferences").BindFunc(handler)
	app.OnRecordAfterDeleteSuccess("animeRecords", "tags", "userPreferences").BindFunc(handler)
}

func (h *LastUpdatesHooks) upsertLastUpdated(app core.App, record *core.Record) {
	userId := record.GetString("userId")
	if userId == "" {
		return
	}

	collectionName := record.Collection().Name
	now := types.NowDateTime()

	existing, err := app.FindFirstRecordByFilter(
		"lastUpdates",
		"userId = {:userId} && collection = {:collection}",
		dbx.Params{"userId": userId, "collection": collectionName},
	)
	if err != nil {
		// No existing record — create one
		col, err := app.FindCollectionByNameOrId("lastUpdates")
		if err != nil {
			log.Printf("[last_updates hook] failed to find lastUpdates collection: %v", err)
			return
		}
		newRecord := core.NewRecord(col)
		newRecord.Set("userId", userId)
		newRecord.Set("collection", collectionName)
		newRecord.Set("lastUpdated", now)
		if err := app.Save(newRecord); err != nil {
			log.Printf("[last_updates hook] failed to create lastUpdates record: %v", err)
		}
		return
	}

	existing.Set("lastUpdated", now)
	if err := app.Save(existing); err != nil {
		log.Printf("[last_updates hook] failed to update lastUpdates record: %v", err)
	}
}
