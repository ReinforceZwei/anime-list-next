package migrations

import (
	"encoding/json"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_1266763266")
		if err != nil {
			return err
		}

		// update collection data
		if err := json.Unmarshal([]byte(`{
			"indexes": [
				"CREATE INDEX ` + "`" + `idx_aKYOuyd6iF` + "`" + ` ON ` + "`" + `animeRecords` + "`" + ` (` + "`" + `userId` + "`" + `)",
				"CREATE INDEX ` + "`" + `idx_ZATBY4GUYD` + "`" + ` ON ` + "`" + `animeRecords` + "`" + ` (\n  ` + "`" + `tmdbMediaType` + "`" + `,\n  ` + "`" + `tmdbId` + "`" + `,\n  ` + "`" + `tmdbSeasonNumber` + "`" + `\n)"
			]
		}`), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_1266763266")
		if err != nil {
			return err
		}

		// update collection data
		if err := json.Unmarshal([]byte(`{
			"indexes": [
				"CREATE INDEX ` + "`" + `idx_aKYOuyd6iF` + "`" + ` ON ` + "`" + `animeRecords` + "`" + ` (` + "`" + `userId` + "`" + `)"
			]
		}`), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	})
}
