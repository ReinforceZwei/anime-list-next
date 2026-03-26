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

Because `client/` is a subdirectory of the repo, `npm version` can fail to create the git commit and tag when other files in the repo are unstaged. To avoid this, the version bump and the git tag are done as separate explicit steps.

### 1. Commit all changes

From the repo root, commit everything that should be part of this release:

```sh
git add .
git commit -m "feat: describe your change"
```

### 2. Bump the version in package.json (without git)

Run this from the `client/` directory. The `--no-git-tag-version` flag updates `package.json` only — no commit or tag is created yet.

```sh
cd client

npm version patch --no-git-tag-version   # bug fix
npm version minor --no-git-tag-version   # new feature
npm version major --no-git-tag-version   # breaking change
```

### 3. Commit the version bump and create the tag

Back at the repo root:

```sh
cd ..
git add client/package.json client/package-lock.json
git commit -m "chore: release v1.3.0"
git tag v1.3.0
```

### 4. Push commits and the new tag

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
