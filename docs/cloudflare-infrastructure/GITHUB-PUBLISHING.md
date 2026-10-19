# Publish this source tree to GitHub

This bundle is self-contained. To replace an older VPS/Docker implementation, copy the **contents** of the folder `server-management-panel-plus` to the root of the target Git repository (do not upload the ZIP as a nested subfolder).

## Windows PowerShell

1. Back up or branch the current repository first.
2. Download and extract the ZIP to a temporary folder.
3. Clone the target repository and copy the bundle contents into the repository root. Review the destination path carefully before using `/MIR`, because it removes files that are absent from the new source tree.

```powershell
$repoUrl = "https://github.com/OWNER/REPOSITORY.git"
$work = Join-Path $PWD "hendy-release-work"
$source = Join-Path $work "server-management-panel-plus"
$target = Join-Path $work "repository"
$zip = Join-Path $PWD "hendy-server-management-panel-plus-cloudflare-native-v2.0.0-rc3.zip"

New-Item -ItemType Directory -Force -Path $work | Out-Null
Expand-Archive -LiteralPath $zip -DestinationPath $work -Force
git clone $repoUrl $target

# Mirror the source bundle into the repository root while preserving .git.
robocopy $source $target /MIR /XD (Join-Path $target ".git") (Join-Path $target "node_modules") (Join-Path $target ".wrangler")
if ($LASTEXITCODE -ge 8) { throw "Robocopy failed with exit code $LASTEXITCODE" }

Set-Location $target
git status --short
# Review the deletion/addition list, confirm no secrets are staged, then commit.
git add -A
git diff --cached --stat
git diff --cached --name-status
git commit -m "release: Cloudflare-native Hendy panel v2.0.0 RC3"
git push origin main
```

Use the actual repository URL in `$repoUrl`. If the target default branch is not `main`, change the push target after checking `git branch --show-current`. Do not proceed if the `git status` output shows an unexpected path or if the destination is not the intended repository.

## After pushing

- Open **Actions** and wait for `CI` and `Deploy Cloudflare Production` to complete.
- If the pipeline fails, read the failing check before creating a release tag; do not bypass validation.
- Configure the GitHub `cloudflare-production` environment secrets listed in the root README before the first production deployment.
- Set up the Access application and custom domain on Cloudflare, then run the live acceptance checks in `docs/CLOUDFLARE-DEPLOYMENT.md`.

The local GitHub connector available in this authoring environment is read-only, so this bundle has not been pushed from here.
