package main

import (
	"fmt"
	"log"

	"github.com/joho/godotenv"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
	"github.com/pocketbase/pocketbase/tools/osutils"

	_ "github.com/ReinforceZwei/anime-list-next/server/migrations"
)

var (
	version = "dev"
	commit  = "unknown"
	date    = "unknown"
)

func main() {
	_ = godotenv.Load()
	app := pocketbase.New()

	app.RootCmd.Version = fmt.Sprintf("%s (commit: %s, built: %s)", version, commit, date)
	app.RootCmd.SetVersionTemplate("{{.Name}} version {{.Version}}\n")

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		// Only auto migrate when running from go run
		Automigrate: osutils.IsProbablyGoRun(),
	})

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		return se.Next()
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
