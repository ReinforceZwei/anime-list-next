package middlewares

import (
	"fmt"

	"github.com/getsentry/sentry-go"
	"github.com/pocketbase/pocketbase/core"
)

type SentryMiddleware struct{}

func NewSentryMiddleware() *SentryMiddleware {
	return &SentryMiddleware{}
}

func (m *SentryMiddleware) Register(se *core.ServeEvent) {
	se.Router.BindFunc(m.handler)
}

func (m *SentryMiddleware) handler(e *core.RequestEvent) error {
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
		transaction.Status = sentry.SpanStatusInternalError
		hub.CaptureException(err)
	} else {
		transaction.Status = sentry.SpanStatusOK
	}
	return err
}
