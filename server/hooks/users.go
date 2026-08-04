package hooks

import (
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
)

type UsersHooks struct {
	disableRegister bool
}

func NewUsersHooks(disableRegister bool) *UsersHooks {
	return &UsersHooks{disableRegister: disableRegister}
}

// Register binds user-related hooks to the app.
// When registration is disabled, it only allows the first user to be created
// and rejects any subsequent registration attempts.
func (h *UsersHooks) Register(app core.App) {
	app.OnRecordCreate("users").BindFunc(func(e *core.RecordEvent) error {
		if !h.disableRegister {
			return e.Next()
		}

		total, err := e.App.CountRecords("users", nil)
		if err != nil {
			return err
		}
		if total > 0 {
			return apis.NewForbiddenError("Registration is disabled.", nil)
		}
		return e.Next()
	})
}
