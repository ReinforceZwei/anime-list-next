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

### 1. Commit all changes

```sh
git add .
git commit -m "feat: describe your change"
```

### 2. Bump the version

Run this from the `client/` directory. It updates `package.json`, commits the change, and creates the git tag in one step.

```sh
cd client

npm version patch   # bug fix
npm version minor   # new feature
npm version major   # breaking change
```

This produces a commit like `"v1.3.0"` and a tag `v1.3.0`.

### 3. Push commits and the new tag

```sh
git push
git push --tags
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
