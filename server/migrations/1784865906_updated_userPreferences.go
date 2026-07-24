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

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(5, []byte(`{
			"help": "",
			"hidden": false,
			"id": "file3583140908",
			"maxSelect": 0,
			"maxSize": 5242880,
			"mimeTypes": [
				"image/png",
				"image/jpeg",
				"image/webp",
				"image/tiff",
				"image/bmp"
			],
			"name": "wallpaper",
			"presentable": false,
			"protected": false,
			"required": false,
			"system": false,
			"thumbs": null,
			"type": "file"
		}`)); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_3318608420")
		if err != nil {
			return err
		}

		// remove field
		collection.Fields.RemoveById("file3583140908")

		return app.Save(collection)
	})
}
