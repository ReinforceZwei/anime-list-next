package routes

import (
	"net/http"

	"github.com/pocketbase/pocketbase/core"
)

type VersionInfo struct {
	Version string `json:"version"`
	Commit  string `json:"commit"`
	Date    string `json:"date"`
}

type VersionRoutes struct {
	info VersionInfo
}

func NewVersionRoutes(version, commit, date string) *VersionRoutes {
	return &VersionRoutes{
		info: VersionInfo{
			Version: version,
			Commit:  commit,
			Date:    date,
		},
	}
}

func (r *VersionRoutes) Register(se *core.ServeEvent) {
	se.Router.GET("/api/version", r.getVersion)
}

func (r *VersionRoutes) getVersion(e *core.RequestEvent) error {
	return e.JSON(http.StatusOK, r.info)
}
