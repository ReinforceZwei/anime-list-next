package middlewares

import (
	"errors"
	"fmt"

	"github.com/getsentry/sentry-go"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/router"
)

type SentryMiddleware struct{}

func NewSentryMiddleware() *SentryMiddleware {
	return &SentryMiddleware{}
}

func (m *SentryMiddleware) Register(se *core.ServeEvent) {
	se.Router.BindFunc(m.handler)
}

func (m *SentryMiddleware) handler(e *core.RequestEvent) error {
	// Skip Sentry tracing for high-frequency realtime polling requests.
	if e.Request.URL.Path == "/api/realtime" {
		return e.Next()
	}

	ctx := e.Request.Context()
	hub := sentry.GetHubFromContext(ctx)
	if hub == nil {
		hub = sentry.CurrentHub().Clone()
		ctx = sentry.SetHubOnContext(ctx, hub)
	}

	options := []sentry.SpanOption{
		sentry.WithOpName("http.server"),
		sentry.ContinueFromRequest(e.Request),
		sentry.WithTransactionSource(sentry.SourceURL),
	}

	transaction := sentry.StartTransaction(
		ctx,
		fmt.Sprintf("%s %s", e.Request.Method, e.Request.URL.Path),
		options...,
	)
	defer transaction.Finish()

	e.Request = e.Request.WithContext(transaction.Context())

	err := e.Next()

	if err != nil {
		var apiErr *router.ApiError
		if errors.As(err, &apiErr) && apiErr.Status < 500 {
			// Expected client error (4xx, etc.) — do not report to Sentry,
			// but still reflect a meaningful span status.
			transaction.Status = httpStatusToSpanStatus(apiErr.Status)
		} else {
			// Real server fault (5xx) or unexpected non-ApiError — capture.
			transaction.Status = sentry.SpanStatusInternalError
			hub.CaptureException(err)
		}
	} else {
		transaction.Status = sentry.SpanStatusOK
	}
	return err
}

// httpStatusToSpanStatus maps common HTTP status codes to Sentry span statuses.
// Falls back to SpanStatusUnknown for unrecognized codes.
func httpStatusToSpanStatus(status int) sentry.SpanStatus {
	switch status {
	case 400:
		return sentry.SpanStatusInvalidArgument
	case 401:
		return sentry.SpanStatusUnauthenticated
	case 403:
		return sentry.SpanStatusPermissionDenied
	case 404:
		return sentry.SpanStatusNotFound
	case 429:
		return sentry.SpanStatusResourceExhausted
	default:
		return sentry.SpanStatusUnknown
	}
}
