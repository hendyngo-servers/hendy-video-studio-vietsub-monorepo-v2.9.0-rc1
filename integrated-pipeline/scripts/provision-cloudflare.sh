#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
bot_json=$(npx wrangler@4.148.0 kv namespace create BOT_STATE --json)
sot_json=$(npx wrangler@4.148.0 kv namespace create CONFIG_SOT --json)
bot_id=$(printf '%s' "$bot_json" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s).id))')
sot_id=$(printf '%s' "$sot_json" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s).id))')
npx wrangler@4.148.0 r2 bucket create video-pipeline-logs
sed -i "s/REPLACE_WITH_KV_NAMESPACE_ID/$bot_id/;s/REPLACE_WITH_SOT_KV_NAMESPACE_ID/$sot_id/" cloudflare/worker/wrangler.jsonc
echo "Provisioned BOT_STATE=$bot_id CONFIG_SOT=$sot_id"
