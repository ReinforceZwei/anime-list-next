# Development Guide

## Versioning

This project uses [Semantic Versioning](https://semver.org/) (`vMAJOR.MINOR.PATCH`), driven by git tags.

| Change type | Version bump | Example |
|---|---|---|
| Bug fix | `patch` | `v1.2.3` → `v1.2.4` |
| New feature (backward-compatible) | `minor` | `v1.2.3` → `v1.3.0` |
| Breaking change | `major` | `v1.2.3` → `v2.0.0` |

The version is injected at build time into both packages:

- **Client** — `__APP_VERSION__` global (set by Vite via `git describe --tags --always`)
- **Server** — `version`, `commit`, `date` vars (set by Go ldflags; see [GitHub Actions](#github-actions-build-flags))

Between releases, `git describe` produces a snapshot string like `v1.2.3-4-gabcdef1` (base tag + commits since + short hash), which is what the app reports until the next tag.

---

## Release Workflow

> **Why scripts?** Running `npm version` inside `client/` (a subdirectory) is a [known npm bug](https://stackoverflow.com/q/75965870) — it updates `package.json` but silently skips the git commit and tag. The helper scripts below work around this by running npm with `--no-git-tag-version` and handling git themselves.

### 1. Commit all pending changes

```sh
git add .
git commit -m "feat: describe your change"
```

### 2. Run the release script

From the **repo root**, pick the right bump type:

**macOS / Linux:**
```sh
./release.sh patch   # bug fix:        v1.2.3 → v1.2.4
./release.sh minor   # new feature:    v1.2.3 → v1.3.0
./release.sh major   # breaking change: v1.2.3 → v2.0.0
```

> First run: `chmod +x release.sh`

**Windows (PowerShell):**
```powershell
.\release.ps1 patch
.\release.ps1 minor
.\release.ps1 major
```

The script will:
1. Verify the working tree is clean (exits early if not)
2. Bump the version in `client/package.json` (no git ops)
3. Create a commit: `chore: release vX.X.X`
4. Create the git tag: `vX.X.X`

### 3. Push

```sh
git push && git push --tags
```

Pushing the tag triggers the GitHub Actions build.

---

## GitHub Actions Build Flags

The CI pipeline should inject version info into both packages at build time.

### Client

The Vite build reads the version automatically via `git describe --tags --always` — no extra flags needed, as long as the full git history and tags are checked out:

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0   # required for git describe to find tags
```

### Server

Pass version info via `ldflags`:

```yaml
- name: Build server
  run: |
    go build \
      -ldflags "-X main.version=$(git describe --tags --always) \
                -X main.commit=$(git rev-parse --short HEAD) \
                -X main.date=$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
      -o server \
      .
  working-directory: server
```

The server exposes this via `./server --version`:

```
anime-list-next version v1.3.0 (commit: abcdef1, built: 2026-03-26T10:00:00Z)
```

---

## Using the Version in the Client

`__APP_VERSION__` is available globally anywhere in the React app:

```ts
console.log(__APP_VERSION__)  // "v1.3.0" on a tagged build
                               // "v1.3.0-4-gabcdef1" between releases
                               // "dev" if git is unavailable at build time
```

---

## Sentry CI Setup

The Docker build workflow (`docker.yml`) uploads source maps to Sentry and bakes the DSN into the frontend bundle. This requires GitHub Actions **secrets** and **variables** to be configured on the repository.

### Required secrets & variables

Go to **Settings → Secrets and variables → Actions** on your GitHub repo and add:

| Name | Type | Description |
|---|---|---|
| `SENTRY_DSN` | **Secret** | Sentry project DSN (e.g. `https://...@o0.ingest.sentry.io/0`) — baked into the JS bundle |
| `SENTRY_AUTH_TOKEN` | **Secret** | Sentry auth token with `project:releases` scope — used at build time to upload source maps |
| `SENTRY_ORG` | **Variable** | Your Sentry organization slug (e.g. `my-org`) |
| `SENTRY_PROJECT` | **Variable** | Your Sentry project slug (e.g. `anime-list`) |

> **Why variables for org/project?** They're not sensitive — they're just identifiers. Secrets would mask them in build logs, making debugging harder. Only the DSN and auth token are actual secrets.

### How they're used

The workflow passes the non-sensitive values as `build-args` and the auth token as a build **secret** (to avoid leaking it into image layers):

```yaml
build-args: |
  SENTRY_ORG=${{ vars.SENTRY_ORG }}
  SENTRY_PROJECT=${{ vars.SENTRY_PROJECT }}
  VITE_SENTRY_DSN=${{ secrets.SENTRY_DSN }}
secrets: |
  "SENTRY_AUTH_TOKEN=${{ secrets.SENTRY_AUTH_TOKEN }}"
```

Inside the Dockerfile, `SENTRY_ORG`, `SENTRY_PROJECT`, and `VITE_SENTRY_DSN` are received as `ARG` and exported as `ENV` during the client build stage. `SENTRY_AUTH_TOKEN` is mounted as a secret file and read at build time:

```dockerfile
RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN \
    export SENTRY_AUTH_TOKEN=$(cat /run/secrets/SENTRY_AUTH_TOKEN 2>/dev/null || echo "") && \
    npm run build
```

The `sentryVitePlugin` in `vite.config.ts` reads `SENTRY_ORG`, `SENTRY_PROJECT`, and `SENTRY_AUTH_TOKEN` to upload source maps. Vite statically replaces `import.meta.env.VITE_SENTRY_DSN` in the bundle.

> **Local builds:** Pass the secret via `--secret id=SENTRY_AUTH_TOKEN,env=SENTRY_AUTH_TOKEN`. If the env var isn't set, Docker passes an empty string and the build still succeeds — the sentry plugin just skips source map uploads.

### Creating a Sentry auth token

1. Go to [Sentry → Settings → Auth Tokens](https://sentry.io/settings/account/api/auth-tokens/)
2. Create a token with the scope **`project:releases`**
3. Copy the token (starts with `sntrys_...`) and add it as the `SENTRY_AUTH_TOKEN` secret

### What happens without them

If any Sentry variable is missing, the build still succeeds:

- Missing `SENTRY_AUTH_TOKEN` / `SENTRY_ORG` / `SENTRY_PROJECT` → source maps aren't uploaded (stack traces will be minified, but errors are still captured)
- Missing `VITE_SENTRY_DSN` → the Sentry SDK disables itself entirely — no data is collected
