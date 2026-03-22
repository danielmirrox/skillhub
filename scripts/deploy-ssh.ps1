param(
  [Parameter(Mandatory = $true)]
  [string]$HostName,

  [Parameter(Mandatory = $true)]
  [string]$UserName,

  [int]$Port = 22,
  [string]$TargetDir = "/opt/skillhub",
  [string]$Branch = "main",
  [string]$Repository = "https://github.com/danielmirrox/skillhub.git",
  [string]$LocalComposeEnvFile = "",
  [string]$LocalServerEnvFile = "",
  [string]$RemoteServerEnvFile = "server/.env",
  [switch]$SkipHealthcheck
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function To-Base64([string]$Value) {
  return [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($Value))
}

function Invoke-Remote([string]$Command) {
  & ssh -p $Port "$UserName@$HostName" $Command
  if ($LASTEXITCODE -ne 0) {
    throw "Remote command failed."
  }
}

$repositoryB64 = To-Base64 $Repository
$branchB64 = To-Base64 $Branch
$targetDirB64 = To-Base64 $TargetDir
$remoteEnvFileB64 = To-Base64 $RemoteServerEnvFile
$skipHealthB64 = To-Base64 ($(if ($SkipHealthcheck) { "1" } else { "0" }))

Write-Host "Preparing remote directory $TargetDir on $UserName@$HostName..."
Invoke-Remote "mkdir -p '$TargetDir/server'"

if ($LocalComposeEnvFile) {
  if (-not (Test-Path -LiteralPath $LocalComposeEnvFile)) {
    throw "Local compose env file not found: $LocalComposeEnvFile"
  }

  Write-Host "Uploading compose env file to $TargetDir/.env ..."
  & scp -P $Port $LocalComposeEnvFile "$UserName@$HostName`:$TargetDir/.env"
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to upload compose env file."
  }
}

if ($LocalServerEnvFile) {
  if (-not (Test-Path -LiteralPath $LocalServerEnvFile)) {
    throw "Local env file not found: $LocalServerEnvFile"
  }

  Write-Host "Uploading server env file to $TargetDir/$RemoteServerEnvFile ..."
  & scp -P $Port $LocalServerEnvFile "$UserName@$HostName`:$TargetDir/server/.env"
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to upload server env file."
  }
}

$remoteScript = @"
set -euo pipefail

decode() {
  printf '%s' "\$1" | base64 -d
}

REPOSITORY=\$(decode '$repositoryB64')
BRANCH=\$(decode '$branchB64')
TARGET_DIR=\$(decode '$targetDirB64')
REMOTE_ENV_FILE=\$(decode '$remoteEnvFileB64')
SKIP_HEALTHCHECK=\$(decode '$skipHealthB64')

if ! command -v git >/dev/null 2>&1; then
  echo "git is required on the server"
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is required on the server"
  exit 1
fi

mkdir -p "\$TARGET_DIR"

if [ ! -d "\$TARGET_DIR/.git" ]; then
  git clone --branch "\$BRANCH" "\$REPOSITORY" "\$TARGET_DIR"
fi

cd "\$TARGET_DIR"
git fetch origin
git checkout "\$BRANCH"
git pull --ff-only origin "\$BRANCH"

if [ ! -f "\$REMOTE_ENV_FILE" ]; then
  echo "Missing required env file: \$TARGET_DIR/\$REMOTE_ENV_FILE"
  exit 1
fi

docker compose up -d --build
docker compose ps

if [ "\$SKIP_HEALTHCHECK" != "1" ]; then
  if command -v curl >/dev/null 2>&1; then
    echo "Healthcheck:"
    curl --fail --silent http://127.0.0.1:8080/health
    echo
  else
    echo "curl not found on server, skipping /health check"
  fi
fi
"@

Write-Host "Deploying branch $Branch to ${UserName}@${HostName}:$TargetDir ..."
$remoteScript | & ssh -p $Port "$UserName@$HostName" "bash -s"

if ($LASTEXITCODE -ne 0) {
  throw "SSH deploy failed."
}

Write-Host "Deploy completed."
