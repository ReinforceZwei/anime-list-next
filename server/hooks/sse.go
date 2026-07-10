package hooks

import (
	"time"

	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/subscriptions"
)

type SseHook struct{}

// SSE hook adds heartbeat messages to all connected clients every 60 seconds to keep the connection alive.
// Pocketbase by default disconnect idle client after 5 minutes, and disconnect active client after 30 minutes.
// Heartbeat prevent idle disconnection
func NewSseHook() *SseHook {
	return &SseHook{}
}

func (h *SseHook) Register(app core.App) {
	app.OnRealtimeConnectRequest().BindFunc(func(e *core.RealtimeConnectRequestEvent) error {
		go func() {
			ticker := time.NewTicker(60 * time.Second)
			defer ticker.Stop()
			for range ticker.C {
				if e.Client.IsDiscarded() {
					return
				}
				e.Client.Send(subscriptions.Message{
					Name: "HEARTBEAT",
					Data: []byte(`{}`),
				})
			}
		}()
		return e.Next()
	})
}
