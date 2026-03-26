package config

import "os"

type AppConfig struct {
	DisableRegister bool
	TmdbApiKey      string
}

func Load() AppConfig {
	return AppConfig{
		DisableRegister: os.Getenv("DISABLE_REGISTER") == "true",
		TmdbApiKey:      os.Getenv("TMDB_API_KEY"),
	}
}
