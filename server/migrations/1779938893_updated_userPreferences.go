package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_3318608420")
		if err != nil {
			return err
		}

		// remove field
		collection.Fields.RemoveById("text806763438")

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(4, []byte(`{
			"hidden": false,
			"id": "json4250452546",
			"maxSize": 0,
			"name": "uiConfig",
			"presentable": false,
			"required": false,
			"system": false,
			"type": "json"
		}`)); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_3318608420")
		if err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(2, []byte(`{
			"autogeneratePattern": "",
			"hidden": false,
			"id": "text806763438",
			"max": 0,
			"min": 0,
			"name": "pageTitle",
			"pattern": "",
			"presentable": false,
			"primaryKey": false,
			"required": false,
			"system": false,
			"type": "text"
		}`)); err != nil {
			return err
		}

		// remove field
		collection.Fields.RemoveById("json4250452546")

		return app.Save(collection)
	})
}
