#!/usr/bin/env bash
# Usage: ./release.sh [patch|minor|major] [--push|-p]
# Bumps the npm version in client/, creates a git commit, and tags it.
# With --push (or -p), also pushes the commit and tag to origin.
set -euo pipefail

BUMP="patch"
PUSH=false

for arg in "$@"; do
  case "$arg" in
    patch|minor|major) BUMP="$arg" ;;
    --push|-p)         PUSH=true ;;
    *)
      echo "Usage: ./release.sh [patch|minor|major] [--push|-p]"
      echo ""
      echo "  patch  (default) — bug fix:           v1.2.3 → v1.2.4"
      echo "  minor            — new feature:        v1.2.3 → v1.3.0"
      echo "  major            — breaking change:    v1.2.3 → v2.0.0"
      echo "  --push, -p       — also run: git push && git push --tags"
      exit 1
      ;;
  esac
done

# Ensure we are at the repo root (where this script lives)
cd "$(dirname "$0")"

# Check for uncommitted changes before doing anything
# (git status --porcelain also catches untracked files)
if [[ -n "$(git status --porcelain)" ]]; then
  echo "Error: working tree has uncommitted changes. Commit or stash them first."
  exit 1
fi

# Bump version in client/package.json only (--no-git-tag-version skips git operations)
npm version "$BUMP" --no-git-tag-version --prefix ./client

# Read the new version
VERSION=$(node -e "console.log(require('./client/package.json').version)")
TAG="v${VERSION}"

echo "Releasing ${TAG}..."

git add client/package.json client/package-lock.json
git commit -m "chore: release ${TAG}"
git tag "${TAG}"

if $PUSH; then
  echo "Pushing ${TAG}..."
  git push
  git push --tags
else
  echo ""
  echo "Done. Run the following to publish:"
  echo ""
  echo "  git push && git push --tags"
fi
