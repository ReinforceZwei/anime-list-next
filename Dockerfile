# syntax=docker/dockerfile:1

ARG APP_VERSION=dev
ARG COMMIT=unknown
ARG BUILD_DATE=unknown

# ── Client build ─────────────────────────────────────────────────────────────
FROM --platform=$BUILDPLATFORM node:22-alpine AS client-builder

ARG APP_VERSION
ENV APP_VERSION=${APP_VERSION}

WORKDIR /app/client

COPY client/package.json client/package-lock.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# ── Server build ─────────────────────────────────────────────────────────────
FROM --platform=$BUILDPLATFORM golang:1.25-alpine AS server-builder

ARG APP_VERSION
ARG COMMIT
ARG BUILD_DATE
ARG TARGETOS
ARG TARGETARCH

WORKDIR /app/server

COPY server/go.mod server/go.sum ./
RUN go mod download

COPY server/ ./

RUN CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build \
    -ldflags "-s -w \
              -X main.version=${APP_VERSION} \
              -X main.commit=${COMMIT} \
              -X main.date=${BUILD_DATE}" \
    -o /app/anime-list-server \
    .

# ── Final image ───────────────────────────────────────────────────────────────
FROM alpine:3.21

RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

COPY --from=server-builder /app/anime-list-server ./server
COPY --from=client-builder /app/client/dist ./pb_public

VOLUME /app/pb_data

ENV PB_PORT=8090
EXPOSE 8090

ENTRYPOINT ["/bin/sh", "-c", "exec /app/server serve --http=0.0.0.0:${PB_PORT}"]
