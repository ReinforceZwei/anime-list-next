package config

import "os"

type AppConfig struct {
	DisableRegister   bool
	TmdbApiKey        string
	SentryDsn         string
	SentryEnvironment string
}

func Load() AppConfig {
	return AppConfig{
		DisableRegister:   os.Getenv("DISABLE_REGISTER") == "true",
		TmdbApiKey:        os.Getenv("TMDB_API_KEY"),
		SentryDsn:         os.Getenv("SENTRY_DSN"),
		SentryEnvironment: os.Getenv("SENTRY_ENVIRONMENT"),
	}
}
