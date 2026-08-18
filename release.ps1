# Usage: .\release.ps1 [-Bump patch|minor|major] [-Push]
# Bumps the npm version in client/, creates a git commit, and tags it.
# With -Push, also pushes the commit and tag to origin.
param(
    [ValidateSet("patch", "minor", "major")]
    [string]$Bump = "patch",
    [switch]$Push
)

$ErrorActionPreference = "Stop"

# Ensure we are at the repo root (where this script lives)
Set-Location $PSScriptRoot

# Check for uncommitted changes before doing anything
$status = git status --porcelain
if ($status) {
    Write-Error "Working tree has uncommitted changes. Commit or stash them first."
    exit 1
}

# Bump version in client/package.json only (--no-git-tag-version skips git operations)
npm version $Bump --no-git-tag-version --prefix .\client

# Read the new version
$Version = node -e "console.log(require('./client/package.json').version)"
$Tag = "v$Version"

Write-Host "Releasing $Tag..."

git add client/package.json client/package-lock.json
git commit -m "chore: release $Tag"
git tag $Tag

if ($Push) {
    Write-Host "Pushing $Tag..."
    git push
    git push --tags
} else {
    Write-Host ""
    Write-Host "Done. Run the following to publish:"
    Write-Host ""
    Write-Host "  git push; git push --tags"
}
