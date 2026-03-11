package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_1266763266")
		if err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(4, []byte(`{
			"hidden": false,
			"id": "select3103066524",
			"maxSelect": 1,
			"name": "tmdbMediaType",
			"presentable": false,
			"required": false,
			"system": false,
			"type": "select",
			"values": [
				"tv",
				"movie"
			]
		}`)); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_1266763266")
		if err != nil {
			return err
		}

		// remove field
		collection.Fields.RemoveById("select3103066524")

		return app.Save(collection)
	})
}
