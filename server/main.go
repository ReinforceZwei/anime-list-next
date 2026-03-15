package main

import (
	"fmt"
	"log"

	"github.com/joho/godotenv"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
	"github.com/pocketbase/pocketbase/tools/osutils"

	"github.com/ReinforceZwei/anime-list-next/server/config"
	"github.com/ReinforceZwei/anime-list-next/server/hooks"
	_ "github.com/ReinforceZwei/anime-list-next/server/migrations"
	"github.com/ReinforceZwei/anime-list-next/server/routes"
)

var (
	version = "dev"
	commit  = "unknown"
	date    = "unknown"
)

func main() {
	_ = godotenv.Load()
	cfg := config.Load()
	app := pocketbase.New()

	app.RootCmd.Version = fmt.Sprintf("%s (commit: %s, built: %s)", version, commit, date)
	app.RootCmd.SetVersionTemplate("{{.Name}} version {{.Version}}\n")

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		// Only auto migrate when running from go run
		Automigrate: osutils.IsProbablyGoRun(),
	})

	app.OnRecordCreate("users").BindFunc(func(e *core.RecordEvent) error {
		if cfg.DisableRegister {
			total, err := e.App.CountRecords("users", nil)
			if err != nil {
				return err
			}
			if total > 0 {
				return apis.NewForbiddenError("Registration is disabled.", nil)
			}
		}
		return e.Next()
	})

	animeHooks, err := hooks.NewAnimeRecordsHooks(cfg.TmdbApiKey)
	if err != nil {
		log.Fatal("Failed to initialize anime records hooks: ", err)
	}
	animeHooks.Register(app)

	tmdbRoutes, err := routes.NewTmdbRoutes(cfg.TmdbApiKey)
	if err != nil {
		log.Fatal("Failed to initialize TMDb client: ", err)
	}

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		tmdbRoutes.Register(se)
		return se.Next()
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
