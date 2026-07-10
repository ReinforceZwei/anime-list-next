package main

import (
	"fmt"
	"log"
	"mime"
	"net/http"
	"os"
	"time"

	"github.com/getsentry/sentry-go"
	"github.com/joho/godotenv"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
	"github.com/pocketbase/pocketbase/tools/hook"
	"github.com/pocketbase/pocketbase/tools/osutils"

	"github.com/ReinforceZwei/anime-list-next/server/config"
	"github.com/ReinforceZwei/anime-list-next/server/hooks"
	"github.com/ReinforceZwei/anime-list-next/server/middlewares"
	_ "github.com/ReinforceZwei/anime-list-next/server/migrations"
	"github.com/ReinforceZwei/anime-list-next/server/routes"
)

func init() {
	// Register .webmanifest MIME type so the static file server returns
	// application/manifest+json instead of text/plain.
	mime.AddExtensionType(".webmanifest", "application/manifest+json")
}

var (
	version   = "dev"
	commit    = "unknown"
	date      = "unknown"
	sentryDsn = "" // set at build time via -ldflags "-X main.sentryDsn=..."
)

func main() {
	isGoRun := osutils.IsProbablyGoRun()
	_ = godotenv.Load()
	cfg := config.Load()

	// Sentry DSN is baked at build time via ldflags for production images.
	// Falls back to SENTRY_DSN env var for local development (go run .).
	dsn := sentryDsn
	if dsn == "" {
		dsn = cfg.SentryDsn
	}
	if dsn != "" {
		environment := cfg.SentryEnvironment
		if environment == "" {
			if isGoRun {
				environment = "development"
			} else {
				environment = "production"
			}
		}

		err := sentry.Init(sentry.ClientOptions{
			Dsn:              dsn,
			Environment:      environment,
			Release:          version,
			AttachStacktrace: true,
			SendDefaultPII:   false,
			EnableTracing:    true,
			TracesSampleRate: 0.1,
		})
		if err != nil {
			log.Fatalf("sentry.Init: %s", err)
		}
		defer sentry.Flush(2 * time.Second)
	}

	app := pocketbase.New()

	app.RootCmd.Version = fmt.Sprintf("%s (commit: %s, built: %s)", version, commit, date)
	app.RootCmd.SetVersionTemplate("{{.Name}} version {{.Version}}\n")

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		// Only auto migrate when running from go run
		Automigrate: isGoRun,
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

	animeHooks, err := hooks.NewAnimesHooks(cfg.TmdbApiKey)
	if err != nil {
		log.Fatal("Failed to initialize anime records hooks: ", err)
	}
	animeHooks.Register(app)

	lastUpdatesHooks := hooks.NewLastUpdatesHooks()
	lastUpdatesHooks.Register(app)

	sseHook := hooks.NewSseHook()
	sseHook.Register(app)

	tmdbRoutes, err := routes.NewTmdbRoutes(app, cfg.TmdbApiKey)
	if err != nil {
		log.Fatal("Failed to initialize TMDb client: ", err)
	}

	importExportRoutes := routes.NewImportExportRoutes()
	versionRoutes := routes.NewVersionRoutes(version, commit, date)

	sentryMiddleware := middlewares.NewSentryMiddleware()

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		tmdbRoutes.Register(se)
		importExportRoutes.Register(se)
		versionRoutes.Register(se)
		if dsn != "" {
			sentryMiddleware.Register(se)
		}
		return se.Next()
	})

	// Serve static files from pb_public (replicates the behaviour of the
	// official PocketBase binary, which ships this handler at priority 999).
	app.OnServe().Bind(&hook.Handler[*core.ServeEvent]{
		Func: func(e *core.ServeEvent) error {
			if !e.Router.HasRoute(http.MethodGet, "/{path...}") {
				e.Router.GET("/{path...}", apis.Static(os.DirFS("./pb_public"), true))
			}
			return e.Next()
		},
		Priority: 999,
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
