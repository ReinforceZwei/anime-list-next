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
