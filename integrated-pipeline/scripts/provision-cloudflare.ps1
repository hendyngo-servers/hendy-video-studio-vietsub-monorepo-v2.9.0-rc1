$ErrorActionPreference = 'Stop'

Write-Host 'Creating KV namespace BOT_STATE...'
$botJson = npx wrangler@4.148.0 kv namespace create BOT_STATE --json | ConvertFrom-Json
$botId = $botJson.id

Write-Host 'Creating KV namespace CONFIG_SOT...'
$sotJson = npx wrangler@4.148.0 kv namespace create CONFIG_SOT --json | ConvertFrom-Json
$sotId = $sotJson.id

Write-Host 'Creating R2 bucket...'
npx wrangler@4.148.0 r2 bucket create video-pipeline-logs

$config = Get-Content cloudflare/worker/wrangler.jsonc -Raw
$config = $config -replace 'REPLACE_WITH_KV_NAMESPACE_ID', $botId
$config = $config -replace 'REPLACE_WITH_SOT_KV_NAMESPACE_ID', $sotId
Set-Content cloudflare/worker/wrangler.jsonc $config
Write-Host "Provisioned BOT_STATE=$botId CONFIG_SOT=$sotId"
