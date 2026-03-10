# pocketbase-get-schemas.ps1
# Fetches PocketBase collection schemas via admin API
#
# Usage:
#   .\pocketbase-get-schemas.ps1                   # → all collections (pretty JSON)
#   .\pocketbase-get-schemas.ps1 articles          # → only "articles" collection (pretty JSON)
#   $env:PB_URL="https://pb.yourdomain.com"; .\pocketbase-get-schemas.ps1

param(
    [string]$Collection = ""
)

# ──────────────────────────────────────────────────────────────────────────────
#  CONFIG - CHANGE THESE VALUES
# ──────────────────────────────────────────────────────────────────────────────

$PbUrl        = if ($env:PB_URL) { $env:PB_URL } else { "http://127.0.0.1:8090" }
$AdminEmail   = "admin@pb.local"
$AdminPassword = "adminadmin"

# ──────────────────────────────────────────────────────────────────────────────

$authBody = @{ identity = $AdminEmail; password = $AdminPassword } | ConvertTo-Json

try {
    $authResponse = Invoke-RestMethod `
        -Method Post `
        -Uri "$PbUrl/api/collections/_superusers/auth-with-password" `
        -ContentType "application/json" `
        -Body $authBody
} catch {
    Write-Error "Authentication failed: $_"
    exit 1
}

$token = $authResponse.token
if (-not $token) {
    Write-Error "Authentication failed: no token in response."
    exit 1
}

$headers = @{ Authorization = $token }

# ──────────────────────────────────────────────────────────────────────────────

if ($Collection) {
    $result = Invoke-RestMethod `
        -Uri "$PbUrl/api/collections/$Collection" `
        -Headers $headers

    $result | ConvertTo-Json -Depth 20
} else {
    $result = Invoke-RestMethod `
        -Uri "$PbUrl/api/collections?perPage=200" `
        -Headers $headers

    $userCollections = $result.items | Where-Object { -not $_.system }

    $userCollections | ConvertTo-Json -Depth 20
}
