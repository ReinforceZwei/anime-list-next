package config

import "os"

type AppConfig struct {
	DisableRegister bool
}

func Load() AppConfig {
	return AppConfig{
		DisableRegister: os.Getenv("DISABLE_REGISTER") == "true",
	}
}
